import * as helper from "./helper";
import { Client, ClientOptions } from "discord.js";
import { CommandManager, EventManager, ModuleManager, PluginManager } from "./manager";
import { Debugger } from "debug";
declare class Credibo {
    static createInstance(options: ClientOptions): Credibo;
    readonly log: Debugger;
    readonly discord: Client;
    readonly helper: typeof helper;
    readonly commands: CommandManager;
    readonly events: EventManager;
    readonly modules: ModuleManager;
    readonly plugins: PluginManager;
    private constructor();
    login(token: string): Promise<string>;
    private destroy;
}
export { Credibo };
