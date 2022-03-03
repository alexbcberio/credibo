import debug = require("debug");

import { BotClient } from ".";

abstract class Base {
  public readonly client: BotClient;
  protected readonly log: debug.Debugger;

  constructor(client: BotClient) {
    this.client = client;
    this.log = client.log.extend(this.constructor.name);
  }
}

export { Base };
