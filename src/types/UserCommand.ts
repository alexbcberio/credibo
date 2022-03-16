import { ApplicationCommandType } from "./ApplicationCommandType";

interface UserCommand {
  name: string;
  type: ApplicationCommandType.USER;
}

export { UserCommand };
