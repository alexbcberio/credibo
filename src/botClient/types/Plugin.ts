import { BotClient } from "..";

interface Plugin {
  name: string;
  version: `${number}.${number}.${number}`;
  initialize(client: BotClient): Promise<void>;
  destroy(): Promise<void>;
}

export { Plugin };
