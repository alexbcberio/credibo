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
  public static create(options: ClientOptions): BotClient {
    const instance = new this(options);

    const instanceProxy = new Proxy(instance, {
      get(target: BotClient, handler: string | symbol) {
        // TODO: find a better way to avoid @ts-expect-error
        // @ts-expect-error cannot index target
        const targetHandler = target[handler];

        if (targetHandler) {
          return targetHandler;
        } else if (
          typeof handler === "string" &&
          target.plugins.hasPlugin(handler)
        ) {
          return target.plugins.getPlugin(handler);
        }

        // eslint-disable-next-line no-undefined
        return undefined;
      },
    });

    return instanceProxy;
  }

  public readonly log: debug.Debugger;
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
  }

  public async login(token: string) {
    const client = await this.discord.login(token);
    await this.commands.setToken(token);

    return client;
  }
}

export { BotClient };
