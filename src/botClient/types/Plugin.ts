import { BotClient } from "..";

abstract class Plugin {
  public readonly name =
    this.constructor.name.charAt(0).toLowerCase() +
    this.constructor.name.substring(1);
  public abstract readonly version: `${number}.${number}.${number}`;

  protected readonly client: BotClient;

  constructor(client: BotClient) {
    this.client = client;
  }

  public abstract initialize(): Promise<void>;
}

export { Plugin };
