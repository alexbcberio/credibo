import * as helper from "./helper";

import { Client, ClientOptions } from "discord.js";
import {
  CommandManager,
  EventManager,
  ModuleManager,
  PluginManager,
} from "./manager";
import debug, { Debugger } from "debug";

class Credibo {
  public static createInstance(options: ClientOptions): Credibo {
    return new this(options);
  }

  public readonly log: Debugger;
  public readonly discord: Client;
  public readonly helper = helper;

  public readonly commands: CommandManager;
  public readonly events: EventManager;
  public readonly modules: ModuleManager;
  public readonly plugins: PluginManager;

  private constructor(options: ClientOptions) {
    this.log = debug(this.constructor.name);
    this.discord = new Client(options);

    this.commands = new CommandManager(this);
    this.events = new EventManager(this);
    this.modules = new ModuleManager(this);
    this.plugins = new PluginManager(this);

    process.on("SIGINT", () => this.destroy());
  }

  public async login(token: string) {
    const client = await this.discord.login(token);
    await this.commands.setToken(token);

    return client;
  }

  private destroy() {
    this.discord.destroy();
    this.log("Client destroyed");
  }
}

export { Credibo };
