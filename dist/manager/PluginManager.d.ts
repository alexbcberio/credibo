import { Base } from "../Base";
import { Plugin } from "../types";
declare class PluginManager extends Base {
    private plugins;
    hasPlugin(name: string): boolean;
    addPlugin(plugin: Plugin): Promise<void>;
}
export { PluginManager };
