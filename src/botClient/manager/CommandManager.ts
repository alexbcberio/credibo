import {
  ApplicationCommand,
  ApplicationCommandType,
  CommandPermission,
  GuildCommandPermission,
  MessageCommand,
  UserCommand,
} from "../types";

import { Base } from "../Base";
import { Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { SlashCommandBuilder } from "@discordjs/builders";

const restVersion = "10";

class CommandManager extends Base {
  // eslint-disable-next-line no-magic-numbers
  private static readonly maxCommandPermissions = 10;

  private static parseRawApplicationCommand(
    rawCommand: unknown
  ): ApplicationCommand {
    if (typeof rawCommand !== "object") {
      throw new Error("ApplicationCommand must be a object.");
    } else if (rawCommand === null) {
      throw new Error("ApplicationCommand cannot be null.");
    }

    const expectedKeys = ["id", "type", "application_id", "name", "version"];
    const keys = Object.keys(rawCommand);

    for (let i = 0; i < expectedKeys.length; i++) {
      const expectedKey = expectedKeys[i];

      if (!keys.includes(expectedKey)) {
        throw new Error(`ApplicationCommand is missing ${expectedKey}.`);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawApplicationCommand = rawCommand as any;

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

  private static parseRawApplicationGuildCommandPermission(
    rawGuildCommandPermission: unknown
  ): GuildCommandPermission {
    if (typeof rawGuildCommandPermission !== "object") {
      throw new Error("GuildCommandPermission must be a object.");
    } else if (rawGuildCommandPermission === null) {
      throw new Error("ApplicationCommand cannot be null.");
    }

    const expectedKeys = ["id", "application_id", "guild_id", "permissions"];
    const keys = Object.keys(rawGuildCommandPermission);

    for (let i = 0; i < expectedKeys.length; i++) {
      const expectedKey = expectedKeys[i];

      if (!keys.includes(expectedKey)) {
        throw new Error(`GuildCommandPermission is missing ${expectedKey}.`);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawApplicationCommand = rawGuildCommandPermission as any;

    const guildCommandPermission: GuildCommandPermission = {
      id: rawApplicationCommand.id,
      applicationId: rawApplicationCommand.application_id,
      guildId: rawApplicationCommand.guild_id,
      permissions: rawApplicationCommand.permissions,
    };

    return guildCommandPermission;
  }

  // eslint-disable-next-line no-use-before-define
  public ["constructor"]: typeof CommandManager;

  private _appId = "";
  private developmentGuild?: string;
  private rest = new REST({ version: restVersion });
  private commands = new Collection<string, ApplicationCommand>();
  private commandPermissions = new Collection<string, GuildCommandPermission>();

  private get appId() {
    if (!this._appId) {
      const { discord } = this.client;

      if (!discord.application) {
        throw new Error("Client application is not yet initialized.");
      }

      this._appId = discord.application.id;
    }

    return this._appId;
  }

  public async setToken(token: string) {
    this.rest.setToken(token);

    await this.fetchAllCommands();
  }

  public async getSlashCommand(
    command: string | SlashCommandBuilder,
    guildId?: string
  ) {
    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for getSlashCommand", guildId);
    }

    const name =
      command instanceof SlashCommandBuilder ? command.name : command;

    return this.commands.find(
      (c) =>
        c.type === ApplicationCommandType.CHAT_INPUT &&
        c.name === name &&
        c.guildId === guildId
    );
  }

  public async hasSlashCommand(
    command: string | SlashCommandBuilder,
    guildId?: string
  ): Promise<boolean> {
    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for hasSlashCommand", guildId);
    }

    const slashCommand = await this.getSlashCommand(command, guildId);

    return typeof slashCommand !== "undefined";
  }

  public async addSlashCommands(
    commands: Array<SlashCommandBuilder> | SlashCommandBuilder,
    guildId?: string
  ) {
    if (!Array.isArray(commands)) {
      commands = [commands];
    }

    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for addSlashCommands", guildId);
    }

    for (let i = 0; i < commands.length; i++) {
      const { name } = commands[i];

      if (await this.hasSlashCommand(name, guildId)) {
        throw new Error(
          `The slash command ${name} is already registered, did you mean updateSlashCommand()?`
        );
      }
    }

    const createdCommands = await this.registerCommands(commands, guildId);

    this.log(
      "Registered %d slash commands %o",
      createdCommands.length,
      createdCommands.map((c) => c.name)
    );

    return createdCommands;
  }

  public async deleteSlashCommands(
    names: Array<string> | string,
    guildId?: string
  ) {
    if (!Array.isArray(names)) {
      names = [names];
    }

    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for deleteSlashCommands", guildId);
    }

    const commandsId = new Array<string>();

    for (let i = 0; i < names.length; i++) {
      const name = names[i];

      const commandId = this.commands.findKey(
        (c) =>
          c.type === ApplicationCommandType.CHAT_INPUT &&
          c.name === name &&
          c.guildId === guildId
      );

      if (!commandId) {
        throw new Error(`The slash command ${name} is not registered.`);
      }

      commandsId.push(commandId);
    }

    await this.deleteCommands(commandsId);

    this.log("Deleted %d slash commands: %o", names.length, names);
  }

  public async updateSlashCommands(
    commands: Array<SlashCommandBuilder> | SlashCommandBuilder,
    guildId?: string
  ) {
    if (!Array.isArray(commands)) {
      commands = [commands];
    }

    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for updateSlashCommands", guildId);
    }

    for (let i = 0; i < commands.length; i++) {
      const { name } = commands[i];

      if (!(await this.hasSlashCommand(name, guildId))) {
        throw new Error(
          `The slash command ${name} is not registered, did you mean addSlashCommand()?`
        );
      }
    }

    const updatedCommands = await this.updateCommands(commands, guildId);

    this.log(
      "Updated %d slash commands: %o",
      updatedCommands.length,
      updatedCommands.map((c) => c.name)
    );

    return updatedCommands;
  }

  public async getUserCommand(name: string, guildId?: string) {
    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for getUserCommand", guildId);
    }

    const userCommand = this.commands.findKey(
      (c) =>
        c.type === ApplicationCommandType.USER &&
        c.name === name &&
        c.guildId === guildId
    );

    return userCommand;
  }

  public async hasUserCommand(name: string, guildId?: string) {
    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for hasUserCommand", guildId);
    }

    const userCommand = await this.getUserCommand(name, guildId);

    return typeof userCommand !== "undefined";
  }

  public async addUserCommand(name: string, guildId?: string) {
    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for addUserCommand", guildId);
    }

    if (await this.hasUserCommand(name, guildId)) {
      throw new Error(`The user command ${name} is already registered.`);
    }

    const userCommand: UserCommand = {
      type: ApplicationCommandType.USER,
      name,
    };

    const userCommands = await this.registerCommands([userCommand], guildId);

    this.log('Registered "%s" user command', userCommand.name);

    // eslint-disable-next-line no-magic-numbers
    return userCommands[0];
  }

  public async deleteUserCommand(name: string, guildId?: string) {
    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for deleteUserCommand", guildId);
    }

    const commandId = this.commands.findKey(
      (c) =>
        c.type === ApplicationCommandType.USER &&
        c.name === name &&
        c.guildId === guildId
    );

    if (!commandId) {
      throw new Error(`The user command ${name} is not registered.`);
    }

    await this.deleteCommands([commandId]);

    this.log('Deleted "%s" user command', name);
  }

  public async getMessageCommand(name: string, guildId?: string) {
    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for getMessageCommand", guildId);
    }

    const messageCommand = this.commands.findKey(
      (c) =>
        c.type === ApplicationCommandType.MESSAGE &&
        c.name === name &&
        c.guildId === guildId
    );

    return messageCommand;
  }

  public async hasMessageCommand(name: string, guildId?: string) {
    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for hasMessageCommand", guildId);
    }

    const messageCommand = await this.getMessageCommand(name, guildId);

    return typeof messageCommand !== "undefined";
  }

  public async addMessageCommand(name: string, guildId?: string) {
    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for addMessageCommand", guildId);
    }

    if (await this.hasMessageCommand(name, guildId)) {
      throw new Error(`The message command ${name} is already registered.`);
    }

    const messageCommand: MessageCommand = {
      type: ApplicationCommandType.MESSAGE,
      name,
    };

    const messageCommands = await this.registerCommands(
      [messageCommand],
      guildId
    );

    this.log('Registered "%s" message command', name);

    // eslint-disable-next-line no-magic-numbers
    return messageCommands[0];
  }

  public async deleteMessageCommand(name: string, guildId?: string) {
    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for deleteMessageCommand", guildId);
    }

    const commandId = this.commands.findKey(
      (c) =>
        c.type === ApplicationCommandType.MESSAGE &&
        c.name === name &&
        c.guildId === guildId
    );

    if (!commandId) {
      throw new Error(`The message command ${name} is not registered.`);
    }

    await this.deleteCommands([commandId]);

    this.log('Deleted "%s" message command', name);
  }

  public async deleteAllCommands(guildId?: string) {
    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for deleteAllCommands", guildId);
    }

    const route =
      typeof guildId === "undefined"
        ? Routes.applicationCommands(this.appId)
        : Routes.applicationGuildCommands(this.appId, guildId);

    await this.rest.put(route, {
      body: [],
    });

    let numDeletedCommands = 0;

    for (const command of this.commands.values()) {
      if (command.guildId === guildId) {
        this.commands.delete(command.id);
        numDeletedCommands++;
      }
    }

    this.log(
      `Deleted all (%d) ${
        typeof guildId === "undefined" ? "global " : "guild "
      }commands`,
      numDeletedCommands
    );
  }

  public getCommandPermissions(guildId: string, commandId: string) {
    return this.commandPermissions.find(
      (p) => p.guildId === guildId && p.id === commandId
    );
  }

  public async addCommandPermissions(
    guildId: string,
    commandId: string,
    permissions: Array<CommandPermission> | CommandPermission
  ) {
    if (!Array.isArray(permissions)) {
      permissions = [permissions];
    }

    const basePermission = this.commandPermissions.find(
      (p) => p.id === commandId && p.guildId === guildId
    );

    if (basePermission) {
      permissions = [...basePermission.permissions, ...permissions];
    }

    await this.updateCommandPermissions(guildId, commandId, permissions);
  }

  public async deleteCommandPermissions(guildId: string, commandId: string) {
    await this.editCommandPermissions(guildId, commandId, []);
  }

  public async updateCommandPermissions(
    guildId: string,
    commandId: string,
    permissions: Array<CommandPermission> | CommandPermission
  ) {
    if (!Array.isArray(permissions)) {
      permissions = [permissions];
    }

    await this.editCommandPermissions(guildId, commandId, permissions);
  }

  public async deleteAllGuildCommandPermissions(guildId: string) {
    const route = Routes.guildApplicationCommandsPermissions(
      this.appId,
      guildId
    );

    await this.rest.put(route, {
      body: [],
    });

    this.commandPermissions.forEach((c, k) => {
      if (c.guildId === guildId) {
        this.commandPermissions.delete(k);
      }
    });
  }

  private async fetchAllCommands() {
    await this.fetchApplicationCommands();

    const guilds = await this.client.discord.guilds.fetch();
    const guildCommands = new Array<Promise<void>>();

    for (const guildId of guilds.keys()) {
      guildCommands.push(this.fetchGuildCommands(guildId));
    }

    await Promise.all(guildCommands);
    this.log("Fetched %d commands", this.commands.size);
  }

  private async fetchApplicationCommands() {
    this.log("Fetching application commands");

    const route = Routes.applicationCommands(this.appId);
    const rawCommands = await this.rest.get(route);

    if (Array.isArray(rawCommands)) {
      for (let i = 0; i < rawCommands.length; i++) {
        const command = this.constructor.parseRawApplicationCommand(
          rawCommands[i]
        );

        this.commands.set(command.id, command);
      }
    }
  }

  private async fetchGuildCommands(guildId: string) {
    this.log("Fetching application guild commands (%d)", guildId);

    const route = Routes.applicationGuildCommands(this.appId, guildId);
    const rawCommands = await this.rest.get(route);
    await this.fetchGuildCommandPermissions(guildId);

    if (Array.isArray(rawCommands)) {
      for (let i = 0; i < rawCommands.length; i++) {
        const command = this.constructor.parseRawApplicationCommand(
          rawCommands[i]
        );

        this.commands.set(command.id, command);
      }
    }
  }

  private async fetchGuildCommandPermissions(guildId: string) {
    const route = Routes.guildApplicationCommandsPermissions(
      this.appId,
      guildId
    );

    const rawPermissions = await this.rest.get(route);

    if (Array.isArray(rawPermissions)) {
      for (let i = 0; i < rawPermissions.length; i++) {
        const rawPermission =
          this.constructor.parseRawApplicationGuildCommandPermission(
            rawPermissions[i]
          );

        this.commandPermissions.set(rawPermission.id, rawPermission);
      }
    }
  }

  private async developmentGuildId(): Promise<string> {
    if (!this.developmentGuild) {
      const guilds = await this.client.discord.guilds.fetch({ limit: 1 });
      const firstKey = guilds.firstKey();

      if (!firstKey) {
        throw new Error("Bot has not joined any guilds.");
      }

      this.developmentGuild = firstKey;
    }

    return this.developmentGuild;
  }

  private async registerCommands(
    command: Array<SlashCommandBuilder | UserCommand | MessageCommand>,
    guildId?: string
  ): Promise<Array<ApplicationCommand>> {
    const commands = Array.isArray(command) ? command : [command];

    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for registerCommands", guildId);
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

      const cmd = this.constructor.parseRawApplicationCommand(createdCommand);

      this.commands.set(cmd.id, cmd);
      createdCommands.push(cmd);
    }

    return createdCommands;
  }

  private async deleteCommands(commandId: Array<string>): Promise<void> {
    const commandIds = Array.isArray(commandId) ? commandId : [commandId];

    for (let i = 0; i < commandIds.length; i++) {
      const commandId = commandIds[i];
      const command = this.commands.get(commandId);

      if (!command) {
        throw new Error(`Command ${commandId} could not be found.`);
      }

      const { id, guildId } = command;

      const route =
        typeof guildId === "undefined"
          ? Routes.applicationCommand(this.appId, id)
          : Routes.applicationGuildCommand(this.appId, guildId, id);

      await this.rest.delete(route);

      this.commands.delete(command.id);
    }
  }

  private async updateCommands(
    command: Array<SlashCommandBuilder | UserCommand | MessageCommand>,
    guildId?: string
  ): Promise<Array<ApplicationCommand>> {
    if (!guildId && this.client.helper.isDevelopment) {
      // eslint-disable-next-line require-atomic-updates
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for updateCommands", guildId);
    }

    return this.registerCommands(command, guildId);
  }

  private async editCommandPermissions(
    guildId: string,
    commandId: string,
    permissions: Array<CommandPermission>
  ): Promise<GuildCommandPermission> {
    if (permissions.length > this.constructor.maxCommandPermissions) {
      throw new Error(
        `A command can only have up to ${this.constructor.maxCommandPermissions} guild permission overwrites.`
      );
    }

    if (!guildId && this.client.helper.isDevelopment) {
      guildId = await this.developmentGuildId();

      this.log("Forcing guildId %d for command permission", guildId);
    }

    const route = Routes.applicationCommandPermissions(
      this.appId,
      guildId,
      commandId
    );

    const updatedPermissions = await this.rest.put(route, {
      body: { permissions },
    });

    const createdPermission =
      this.constructor.parseRawApplicationGuildCommandPermission(
        updatedPermissions
      );

    if (permissions.length) {
      this.commandPermissions.set(createdPermission.id, createdPermission);
    } else {
      this.commandPermissions.delete(commandId);
    }

    return createdPermission;
  }
}

export { CommandManager };
