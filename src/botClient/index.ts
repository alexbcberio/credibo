import { Client, ClientOptions } from "discord.js";

import debug from "debug";

class BotClient {
  public readonly log: debug.Debugger;
  public readonly client: Client;

  constructor(options: ClientOptions) {
    this.log = debug(this.constructor.name);
    this.client = new Client(options);
  }

  public login(token?: string) {
    return this.client.login(token);
  }
}

export { BotClient };
