import * as helper from "./helper";

import { Client, ClientOptions } from "discord.js";
import {
  CommandManager,
  EventManager,
  ModuleManager,
  PluginManager,
} from "./manager";

import debug from "debug";

class BotClient {
  public readonly log: debug.Debugger;
  public readonly discord: Client;
  public readonly commands: CommandManager;
  public readonly events: EventManager;
  public readonly modules: ModuleManager;
  public readonly helper = helper;
  public readonly plugins: PluginManager;

  constructor(options: ClientOptions) {
    this.log = debug(this.constructor.name);
    this.discord = new Client(options);

    this.commands = new CommandManager(this);
    this.events = new EventManager(this);
    this.modules = new ModuleManager(this);
    this.plugins = new PluginManager(this);
  }

  public async login(token: string) {
    const client = await this.discord.login(token);
    await this.commands.setToken(token);

    return client;
  }
}

export { BotClient };
