import { Plugin } from "./Plugin";

abstract class Module extends Plugin {
  public readonly disabled = false;
  public readonly description?: string;
  public readonly modules = new Array<Module>();

  public abstract destroy(): Promise<void>;
}

export { Module };
