import { BotClient } from "..";
import { Debugger } from "debug";

abstract class Plugin {
  public readonly name =
    // eslint-disable-next-line no-magic-numbers
    this.constructor.name.charAt(0).toLowerCase() +
    // eslint-disable-next-line no-magic-numbers
    this.constructor.name.substring(1);
  public abstract readonly version: `${number}.${number}.${number}`;

  protected readonly client: BotClient;
  protected readonly log: Debugger;

  constructor(client: BotClient) {
    this.client = client;
    this.log = client.log.extend(this.name);
  }

  public abstract initialize(): Promise<void>;
}

export { Plugin };
