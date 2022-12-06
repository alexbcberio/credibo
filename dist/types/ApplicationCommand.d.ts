import { ApplicationCommandType } from "./ApplicationCommandType";
interface ApplicationCommand {
    id: string;
    type: ApplicationCommandType;
    applicationId: string;
    guildId?: string;
    name: string;
    version: string;
}
export { ApplicationCommand, ApplicationCommandType };
