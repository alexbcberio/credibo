import { BotClient } from "..";

abstract class Plugin {
  public abstract readonly name: string;
  public abstract readonly version: `${number}.${number}.${number}`;

  protected readonly client: BotClient;

  constructor(client: BotClient) {
    this.client = client;
  }

  public abstract initialize(): Promise<void>;
}

export { Plugin };
