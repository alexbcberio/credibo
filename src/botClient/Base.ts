import { BotClient } from ".";
import { Debugger } from "debug";

abstract class Base {
  public readonly client: BotClient;
  protected readonly log: Debugger;

  constructor(client: BotClient) {
    this.client = client;
    this.log = client.log.extend(this.constructor.name);
  }
}

export { Base };
