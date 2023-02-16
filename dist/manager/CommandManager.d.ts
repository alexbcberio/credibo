import { ApplicationCommand, CommandPermission, GuildCommandPermission } from "../types";
import { Base } from "../Base";
import { SlashCommandBuilder } from "@discordjs/builders";
declare class CommandManager extends Base {
    private static readonly maxCommandPermissions;
    private static parseRawApplicationCommand;
    private static parseRawApplicationGuildCommandPermission;
    ["constructor"]: typeof CommandManager;
    private _appId;
    private developmentGuild?;
    private rest;
    private commands;
    private commandPermissions;
    private get appId();
    setToken(token: string): Promise<void>;
    getSlashCommand(command: string | SlashCommandBuilder, guildId?: string): Promise<ApplicationCommand | undefined>;
    hasSlashCommand(command: string | SlashCommandBuilder, guildId?: string): Promise<boolean>;
    addSlashCommands(commands: Array<SlashCommandBuilder> | SlashCommandBuilder, guildId?: string): Promise<ApplicationCommand[]>;
    deleteSlashCommands(names: Array<string> | string, guildId?: string): Promise<void>;
    updateSlashCommands(commands: Array<SlashCommandBuilder> | SlashCommandBuilder, guildId?: string): Promise<ApplicationCommand[]>;
    getUserCommand(name: string, guildId?: string): Promise<string | undefined>;
    hasUserCommand(name: string, guildId?: string): Promise<boolean>;
    addUserCommand(name: string, guildId?: string): Promise<ApplicationCommand>;
    deleteUserCommand(name: string, guildId?: string): Promise<void>;
    getMessageCommand(name: string, guildId?: string): Promise<string | undefined>;
    hasMessageCommand(name: string, guildId?: string): Promise<boolean>;
    addMessageCommand(name: string, guildId?: string): Promise<ApplicationCommand>;
    deleteMessageCommand(name: string, guildId?: string): Promise<void>;
    deleteAllCommands(guildId?: string): Promise<void>;
    getCommandPermissions(guildId: string, commandId: string): GuildCommandPermission | undefined;
    addCommandPermissions(guildId: string, commandId: string, permissions: Array<CommandPermission> | CommandPermission): Promise<void>;
    deleteCommandPermissions(guildId: string, commandId: string): Promise<void>;
    updateCommandPermissions(guildId: string, commandId: string, permissions: Array<CommandPermission> | CommandPermission): Promise<void>;
    deleteAllGuildCommandPermissions(guildId: string): Promise<void>;
    private fetchAllCommands;
    private fetchApplicationCommands;
    private fetchGuildCommands;
    private fetchGuildCommandPermissions;
    private developmentGuildId;
    private registerCommands;
    private deleteCommands;
    private updateCommands;
    private editCommandPermissions;
}
export { CommandManager };