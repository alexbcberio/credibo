import { ApplicationCommand, ApplicationCommandType } from "../types";

import { Base } from "../Base";
import { Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { SlashCommandBuilder } from "@discordjs/builders";

const restVersion = "10";

// TODO: add support to manage "user" and "message" commands
class CommandManager extends Base {
  private static parseRawApplicationCommand(raw: unknown): ApplicationCommand {
    if (raw !== null && typeof raw !== "object") {
      throw new Error("ApplicationCommand must be a object.");
    }

    const expectedKeys = ["id", "type", "application_id", "name", "version"];
    const keys = Object.keys(raw as object);

    for (let i = 0; i < expectedKeys.length; i++) {
      const expectedKey = expectedKeys[i];

      if (!keys.includes(expectedKey)) {
        throw new Error(`ApplicationCommand is missing ${expectedKey}.`);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawApplicationCommand = raw as any;

    const command: ApplicationCommand = {
      id: rawApplicationCommand.id,
      type: rawApplicationCommand.type,
      applicationId: rawApplicationCommand.application_id,
      name: rawApplicationCommand.name,
      version: rawApplicationCommand.version,
    };

    if (keys.includes("guild_id")) {
      command.guildId = rawApplicationCommand.guild_id;
    }

    return command;
  }

  // eslint-disable-next-line no-use-before-define
  public ["constructor"]: typeof CommandManager;

  private _appId = "";
  private rest = new REST({ version: restVersion });
  private commands = new Collection<string, ApplicationCommand>();

  private get appId() {
    if (!this._appId) {
      const { discord } = this.client;

      if (!discord.application) {
        throw new Error("Client application is not yet initialized");
      }

      this._appId = discord.application.id;
    }

    return this._appId;
  }

  private async firstGuildId() {
    const guilds = await this.client.discord.guilds.fetch();

    return guilds.firstKey();
  }

  public async setToken(token: string) {
    this.rest.setToken(token);

    await this.fetchCommands();
  }

  public hasSlashCommand(
    command: string | SlashCommandBuilder,
    guildId?: string
  ): boolean {
    const name =
      command instanceof SlashCommandBuilder ? command.name : command;

    for (const command of this.commands.values()) {
      if (
        command.type === ApplicationCommandType.CHAT_INPUT &&
        command.name === name &&
        (typeof guildId === "undefined" || command.guildId === guildId)
      ) {
        return true;
      }
    }

    return false;
  }

  public async addSlashCommand(
    commands: Array<SlashCommandBuilder> | SlashCommandBuilder,
    guildId?: string
  ) {
    if (!Array.isArray(commands)) {
      commands = [commands];
    }

    for (let i = 0; i < commands.length; i++) {
      const { name } = commands[i];

      if (this.hasSlashCommand(name, guildId)) {
        throw new Error(
          `The command ${name} is already registered, did you mean updateCommand()?`
        );
      }
    }

    const registeredCommands = await this.registerCommands(commands, guildId);

    for (let i = 0; i < registeredCommands.length; i++) {
      const registeredCommand = registeredCommands[i];

      this.commands.set(registeredCommand.id, registeredCommand);
    }

    this.log(
      "Registered %d commands %o",
      registeredCommands.length,
      registeredCommands.map((c) => c.name)
    );
  }

  public async deleteSlashCommand(
    names: Array<string> | string,
    guildId?: string
  ) {
    if (!Array.isArray(names)) {
      names = [names];
    }

    const commandsId = new Array<string>();

    for (let i = 0; i < names.length; i++) {
      const name = names[i];

      const commandId = this.commands.findKey(
        (c) => c.name === name && c.guildId === guildId
      );

      if (!commandId) {
        throw new Error(`The command ${name} is not registered.`);
      }

      commandsId.push(commandId);
    }

    const commands = await this.deleteCommands(commandsId, guildId);

    for (let i = 0; i < commands.length; i++) {
      this.commands.delete(commands[i].id);
    }

    this.log(
      "Deleted %d commands: %o",
      commands.length,
      commands.map((c) => c.name)
    );
  }

  public async updateSlashCommand(
    commands: Array<SlashCommandBuilder>,
    guildId?: string
  ) {
    if (!Array.isArray(commands)) {
      commands = [commands];
    }

    for (let i = 0; i < commands.length; i++) {
      const { name } = commands[i];

      if (!this.hasSlashCommand(name, guildId)) {
        throw new Error(
          `The command ${name} is not registered, did you mean addCommand()?`
        );
      }
    }

    const updatedCommands = await this.updateCommands(commands, guildId);

    for (let i = 0; i < updatedCommands.length; i++) {
      const updatedCommand = updatedCommands[i];

      this.commands.set(updatedCommand.id, updatedCommand);
    }

    this.log(
      "Updated %d commands: %o",
      updatedCommands.length,
      updatedCommands.map((c) => c.name)
    );
  }

  private async fetchCommands(guildId?: string) {
    const route =
      typeof guildId === "undefined"
        ? Routes.applicationCommands(this.appId)
        : Routes.applicationGuildCommands(this.appId, guildId);

    if (!guildId) {
      this.log("Fetching application commands");
    } else {
      this.log("Fetching application guild commands (%d)", guildId);
    }

    const res = await this.rest.get(route);

    if (Array.isArray(res)) {
      for (let i = 0; i < res.length; i++) {
        const command = this.constructor.parseRawApplicationCommand(res[i]);

        this.commands.set(command.id, command);
      }
    }

    if (!guildId) {
      const guilds = await this.client.discord.guilds.fetch();
      const guildCommands = new Array<Promise<void>>();

      for (const guildId of guilds.keys()) {
        guildCommands.push(this.fetchCommands(guildId));
      }

      await Promise.all(guildCommands);
      this.log("Fetched %d commands", this.commands.size);
    }
  }

  private async registerCommands(
    command: Array<SlashCommandBuilder>,
    guildId?: string
  ): Promise<Array<ApplicationCommand>> {
    const commands = Array.isArray(command) ? command : [command];

    if (this.client.helper.isDevelopment) {
      guildId = await this.firstGuildId();

      this.log("Forcing guildId %d for creation", guildId);
    }

    const route =
      typeof guildId === "undefined"
        ? Routes.applicationCommands(this.appId)
        : Routes.applicationGuildCommands(this.appId, guildId);

    const createdCommands = new Array<ApplicationCommand>();

    for (let i = 0; i < commands.length; i++) {
      const createdCommand = await this.rest.post(route, {
        body: commands[i],
      });

      createdCommands.push(
        this.constructor.parseRawApplicationCommand(createdCommand)
      );
    }

    return createdCommands;
  }

  private async deleteCommands(
    commandId: Array<string>,
    guildId?: string
  ): Promise<Array<ApplicationCommand>> {
    const commandIds = Array.isArray(commandId) ? commandId : [commandId];

    const deletedCommands = new Array<ApplicationCommand>();

    for (let i = 0; i < commandIds.length; i++) {
      const commandId = commandIds[i];

      if (this.client.helper.isDevelopment) {
        guildId = await this.firstGuildId();

        this.log("Forcing guildId %d for deletion", guildId);
      }

      const route =
        typeof guildId === "undefined"
          ? Routes.applicationCommand(this.appId, commandId)
          : Routes.applicationGuildCommand(this.appId, guildId, commandId);

      await this.rest.delete(route);

      const command = this.commands.get(commandId);
      if (!command) {
        throw new Error("Command could not be found.");
      }

      deletedCommands.push(command);
    }

    return deletedCommands;
  }

  private async updateCommands(
    command: Array<SlashCommandBuilder>,
    guildId?: string
  ): Promise<Array<ApplicationCommand>> {
    const updatedCommands = await this.registerCommands(command, guildId);

    return updatedCommands;
  }
}

export { CommandManager };
