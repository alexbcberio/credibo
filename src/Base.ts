import { Credibo } from ".";
import { Debugger } from "debug";
import { EventEmitter } from "stream";

abstract class Base extends EventEmitter {
  public readonly client: Credibo;
  protected readonly log: Debugger;

  constructor(client: Credibo) {
    super();

    this.client = client;
    this.log = client.log.extend(this.constructor.name);
  }
}

export { Base };
