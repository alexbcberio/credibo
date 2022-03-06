import { ApplicationCommandType } from "./ApplicationCommandType";

interface MessageCommand {
  name: string;
  type: ApplicationCommandType.MESSAGE;
}

export { MessageCommand };
