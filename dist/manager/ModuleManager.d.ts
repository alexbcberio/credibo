import { Base } from "../Base";
declare class ModuleManager extends Base {
    private static directoriesOnPath;
    ["constructor"]: typeof ModuleManager;
    private modules;
    registerModules(path: string): Promise<void>;
    unregisterModule(name: string): Promise<void>;
    private hasModule;
    private registerModule;
    private registerSubmodules;
}
export { ModuleManager };
