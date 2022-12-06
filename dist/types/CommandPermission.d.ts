import { PermissionType } from ".";
interface CommandPermission {
    id: string;
    type: PermissionType;
    permission: boolean;
}
export { CommandPermission };
