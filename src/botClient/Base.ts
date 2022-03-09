import { BotClient } from ".";
import { Debugger } from "debug";
import { EventEmitter } from "stream";

abstract class Base extends EventEmitter {
  public readonly client: BotClient;
  protected readonly log: Debugger;

  constructor(client: BotClient) {
    super();

    this.client = client;
    this.log = client.log.extend(this.constructor.name);
  }
}

export { Base };
