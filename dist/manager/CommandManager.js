"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandManager = void 0;
const types_1 = require("../types");
const discord_js_1 = require("discord.js");
const Base_1 = require("../Base");
const v10_1 = require("discord-api-types/v10");
const restVersion = "10";
class CommandManager extends Base_1.Base {
    constructor() {
        super(...arguments);
        this._appId = "";
        this.rest = new discord_js_1.REST({ version: restVersion });
        this.commands = new discord_js_1.Collection();
        this.commandPermissions = new discord_js_1.Collection();
    }
    static parseRawApplicationCommand(rawCommand) {
        if (typeof rawCommand !== "object") {
            throw new Error("ApplicationCommand must be a object.");
        }
        else if (rawCommand === null) {
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
        const rawApplicationCommand = rawCommand;
        const command = {
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
    static parseRawApplicationGuildCommandPermission(rawGuildCommandPermission) {
        if (typeof rawGuildCommandPermission !== "object") {
            throw new Error("GuildCommandPermission must be a object.");
        }
        else if (rawGuildCommandPermission === null) {
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
        const rawApplicationCommand = rawGuildCommandPermission;
        const guildCommandPermission = {
            id: rawApplicationCommand.id,
            applicationId: rawApplicationCommand.application_id,
            guildId: rawApplicationCommand.guild_id,
            permissions: rawApplicationCommand.permissions,
        };
        return guildCommandPermission;
    }
    get appId() {
        if (!this._appId) {
            const { discord } = this.client;
            if (!discord.application) {
                throw new Error("Client application is not yet initialized.");
            }
            this._appId = discord.application.id;
        }
        return this._appId;
    }
    async setToken(token) {
        this.rest.setToken(token);
        await this.fetchAllCommands();
    }
    async getSlashCommand(command, guildId) {
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for getSlashCommand", guildId);
        }
        const name = typeof command === "string" ? command : command.name;
        return this.commands.find((c) => c.type === types_1.ApplicationCommandType.CHAT_INPUT &&
            c.name === name &&
            c.guildId === guildId);
    }
    async hasSlashCommand(command, guildId) {
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for hasSlashCommand", guildId);
        }
        const slashCommand = await this.getSlashCommand(command, guildId);
        return typeof slashCommand !== "undefined";
    }
    async addSlashCommands(commands, guildId) {
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
                throw new Error(`The slash command ${name} is already registered, did you mean updateSlashCommand()?`);
            }
        }
        const createdCommands = await this.registerCommands(commands, guildId);
        this.log("Registered %d slash commands %o", createdCommands.length, createdCommands.map((c) => c.name));
        return createdCommands;
    }
    async deleteSlashCommands(names, guildId) {
        if (!Array.isArray(names)) {
            names = [names];
        }
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for deleteSlashCommands", guildId);
        }
        const commandsId = new Array();
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const commandId = this.commands.findKey((c) => c.type === types_1.ApplicationCommandType.CHAT_INPUT &&
                c.name === name &&
                c.guildId === guildId);
            if (!commandId) {
                throw new Error(`The slash command ${name} is not registered.`);
            }
            commandsId.push(commandId);
        }
        await this.deleteCommands(commandsId);
        this.log("Deleted %d slash commands: %o", names.length, names);
    }
    async updateSlashCommands(commands, guildId) {
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
                throw new Error(`The slash command ${name} is not registered, did you mean addSlashCommand()?`);
            }
        }
        const updatedCommands = await this.updateCommands(commands, guildId);
        this.log("Updated %d slash commands: %o", updatedCommands.length, updatedCommands.map((c) => c.name));
        return updatedCommands;
    }
    async getUserCommand(name, guildId) {
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for getUserCommand", guildId);
        }
        const userCommand = this.commands.findKey((c) => c.type === types_1.ApplicationCommandType.USER &&
            c.name === name &&
            c.guildId === guildId);
        return userCommand;
    }
    async hasUserCommand(name, guildId) {
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for hasUserCommand", guildId);
        }
        const userCommand = await this.getUserCommand(name, guildId);
        return typeof userCommand !== "undefined";
    }
    async addUserCommand(name, guildId) {
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for addUserCommand", guildId);
        }
        if (await this.hasUserCommand(name, guildId)) {
            throw new Error(`The user command ${name} is already registered.`);
        }
        const userCommand = {
            type: types_1.ApplicationCommandType.USER,
            name,
        };
        const userCommands = await this.registerCommands([userCommand], guildId);
        this.log('Registered "%s" user command', userCommand.name);
        // eslint-disable-next-line no-magic-numbers
        return userCommands[0];
    }
    async deleteUserCommand(name, guildId) {
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for deleteUserCommand", guildId);
        }
        const commandId = this.commands.findKey((c) => c.type === types_1.ApplicationCommandType.USER &&
            c.name === name &&
            c.guildId === guildId);
        if (!commandId) {
            throw new Error(`The user command ${name} is not registered.`);
        }
        await this.deleteCommands([commandId]);
        this.log('Deleted "%s" user command', name);
    }
    async getMessageCommand(name, guildId) {
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for getMessageCommand", guildId);
        }
        const messageCommand = this.commands.findKey((c) => c.type === types_1.ApplicationCommandType.MESSAGE &&
            c.name === name &&
            c.guildId === guildId);
        return messageCommand;
    }
    async hasMessageCommand(name, guildId) {
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for hasMessageCommand", guildId);
        }
        const messageCommand = await this.getMessageCommand(name, guildId);
        return typeof messageCommand !== "undefined";
    }
    async addMessageCommand(name, guildId) {
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for addMessageCommand", guildId);
        }
        if (await this.hasMessageCommand(name, guildId)) {
            throw new Error(`The message command ${name} is already registered.`);
        }
        const messageCommand = {
            type: types_1.ApplicationCommandType.MESSAGE,
            name,
        };
        const messageCommands = await this.registerCommands([messageCommand], guildId);
        this.log('Registered "%s" message command', name);
        // eslint-disable-next-line no-magic-numbers
        return messageCommands[0];
    }
    async deleteMessageCommand(name, guildId) {
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for deleteMessageCommand", guildId);
        }
        const commandId = this.commands.findKey((c) => c.type === types_1.ApplicationCommandType.MESSAGE &&
            c.name === name &&
            c.guildId === guildId);
        if (!commandId) {
            throw new Error(`The message command ${name} is not registered.`);
        }
        await this.deleteCommands([commandId]);
        this.log('Deleted "%s" message command', name);
    }
    async deleteAllCommands(guildId) {
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for deleteAllCommands", guildId);
        }
        const route = typeof guildId === "undefined"
            ? v10_1.Routes.applicationCommands(this.appId)
            : v10_1.Routes.applicationGuildCommands(this.appId, guildId);
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
        this.log(`Deleted all (%d) ${typeof guildId === "undefined" ? "global " : "guild "}commands`, numDeletedCommands);
    }
    getCommandPermissions(guildId, commandId) {
        return this.commandPermissions.find((p) => p.guildId === guildId && p.id === commandId);
    }
    async addCommandPermissions(guildId, commandId, permissions) {
        if (!Array.isArray(permissions)) {
            permissions = [permissions];
        }
        const basePermission = this.commandPermissions.find((p) => p.id === commandId && p.guildId === guildId);
        if (basePermission) {
            permissions = [...basePermission.permissions, ...permissions];
        }
        await this.updateCommandPermissions(guildId, commandId, permissions);
    }
    async deleteCommandPermissions(guildId, commandId) {
        await this.editCommandPermissions(guildId, commandId, []);
    }
    async updateCommandPermissions(guildId, commandId, permissions) {
        if (!Array.isArray(permissions)) {
            permissions = [permissions];
        }
        await this.editCommandPermissions(guildId, commandId, permissions);
    }
    async deleteAllGuildCommandPermissions(guildId) {
        const route = v10_1.Routes.guildApplicationCommandsPermissions(this.appId, guildId);
        await this.rest.put(route, {
            body: [],
        });
        this.commandPermissions.forEach((c, k) => {
            if (c.guildId === guildId) {
                this.commandPermissions.delete(k);
            }
        });
    }
    async fetchAllCommands() {
        await this.fetchApplicationCommands();
        const guilds = await this.client.discord.guilds.fetch();
        const guildCommands = new Array();
        for (const guildId of guilds.keys()) {
            guildCommands.push(this.fetchGuildCommands(guildId));
        }
        await Promise.all(guildCommands);
        this.log("Fetched %d commands", this.commands.size);
    }
    async fetchApplicationCommands() {
        this.log("Fetching application commands");
        const route = v10_1.Routes.applicationCommands(this.appId);
        const rawCommands = await this.rest.get(route);
        if (Array.isArray(rawCommands)) {
            for (let i = 0; i < rawCommands.length; i++) {
                const command = this.constructor.parseRawApplicationCommand(rawCommands[i]);
                this.commands.set(command.id, command);
            }
        }
    }
    async fetchGuildCommands(guildId) {
        this.log("Fetching application guild commands (%d)", guildId);
        const route = v10_1.Routes.applicationGuildCommands(this.appId, guildId);
        const rawCommands = await this.rest.get(route);
        await this.fetchGuildCommandPermissions(guildId);
        if (Array.isArray(rawCommands)) {
            for (let i = 0; i < rawCommands.length; i++) {
                const command = this.constructor.parseRawApplicationCommand(rawCommands[i]);
                this.commands.set(command.id, command);
            }
        }
    }
    async fetchGuildCommandPermissions(guildId) {
        const route = v10_1.Routes.guildApplicationCommandsPermissions(this.appId, guildId);
        const rawPermissions = await this.rest.get(route);
        if (Array.isArray(rawPermissions)) {
            for (let i = 0; i < rawPermissions.length; i++) {
                const rawPermission = this.constructor.parseRawApplicationGuildCommandPermission(rawPermissions[i]);
                this.commandPermissions.set(rawPermission.id, rawPermission);
            }
        }
    }
    async developmentGuildId() {
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
    async registerCommands(command, guildId) {
        const commands = Array.isArray(command) ? command : [command];
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for registerCommands", guildId);
        }
        const route = typeof guildId === "undefined"
            ? v10_1.Routes.applicationCommands(this.appId)
            : v10_1.Routes.applicationGuildCommands(this.appId, guildId);
        const createdCommands = new Array();
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
    async deleteCommands(commandId) {
        const commandIds = Array.isArray(commandId) ? commandId : [commandId];
        for (let i = 0; i < commandIds.length; i++) {
            const commandId = commandIds[i];
            const command = this.commands.get(commandId);
            if (!command) {
                throw new Error(`Command ${commandId} could not be found.`);
            }
            const { id, guildId } = command;
            const route = typeof guildId === "undefined"
                ? v10_1.Routes.applicationCommand(this.appId, id)
                : v10_1.Routes.applicationGuildCommand(this.appId, guildId, id);
            await this.rest.delete(route);
            this.commands.delete(command.id);
        }
    }
    async updateCommands(command, guildId) {
        if (!guildId && this.client.helper.isDevelopment) {
            // eslint-disable-next-line require-atomic-updates
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for updateCommands", guildId);
        }
        return this.registerCommands(command, guildId);
    }
    async editCommandPermissions(guildId, commandId, permissions) {
        if (permissions.length > this.constructor.maxCommandPermissions) {
            throw new Error(`A command can only have up to ${this.constructor.maxCommandPermissions} guild permission overwrites.`);
        }
        if (!guildId && this.client.helper.isDevelopment) {
            guildId = await this.developmentGuildId();
            this.log("Forcing guildId %d for command permission", guildId);
        }
        const route = v10_1.Routes.applicationCommandPermissions(this.appId, guildId, commandId);
        const updatedPermissions = await this.rest.put(route, {
            body: { permissions },
        });
        const createdPermission = this.constructor.parseRawApplicationGuildCommandPermission(updatedPermissions);
        if (permissions.length) {
            this.commandPermissions.set(createdPermission.id, createdPermission);
        }
        else {
            this.commandPermissions.delete(commandId);
        }
        return createdPermission;
    }
}
exports.CommandManager = CommandManager;
// eslint-disable-next-line no-magic-numbers
CommandManager.maxCommandPermissions = 10;
//# sourceMappingURL=CommandManager.js.map