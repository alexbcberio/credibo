import { CommandPermission } from ".";

interface GuildCommandPermission {
  id: string;
  applicationId: string;
  guildId: string;
  permissions: Array<CommandPermission>;
}

export { GuildCommandPermission };
