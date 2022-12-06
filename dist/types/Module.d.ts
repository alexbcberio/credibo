import { Plugin } from "./Plugin";
declare abstract class Module extends Plugin {
    readonly disabled = false;
    readonly description?: string;
    readonly modules: Module[];
    abstract destroy(): Promise<void>;
}
export { Module };
