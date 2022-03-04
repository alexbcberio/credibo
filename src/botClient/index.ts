import { Client, ClientOptions } from "discord.js";
import { CommandManager } from "./manager";

import debug from "debug";

class BotClient {
  public readonly log: debug.Debugger;
  public readonly client: Client;
  public readonly commands: CommandManager;

  constructor(options: ClientOptions) {
    this.log = debug(this.constructor.name);
    this.client = new Client(options);

    this.commands = new CommandManager(this);
  }

  public async login(token: string) {
    const client = await this.client.login(token);
    await this.commands.setToken(token);

    return client;
  }
}

export { BotClient };
