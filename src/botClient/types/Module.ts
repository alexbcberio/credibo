import { BotClient } from "..";

interface Module {
  disabled?: boolean;
  name: string;
  version: `${number}.${number}.${number}`;
  description?: string;
  modules?: Array<Module>;
  initialize(client: BotClient): Promise<void>;
  destroy(): Promise<void>;
}

export { Module };
