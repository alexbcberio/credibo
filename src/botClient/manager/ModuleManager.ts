import { Base } from "../Base";
import { Collection } from "discord.js";
import { Module } from "../types";
import { readdir } from "fs/promises";
import { resolve } from "path";

class ModuleManager extends Base {
  private static async directoriesOnPath(path: string): Promise<Array<string>> {
    const entries = await readdir(path, {
      withFileTypes: true,
    });

    const directories = entries.filter((f) => f.isDirectory());
    const directoriesPath = directories.map((d) => resolve(path, d.name));

    return directoriesPath;
  }

  // eslint-disable-next-line no-use-before-define
  public ["constructor"]: typeof ModuleManager;

  private modules = new Collection<string, Module>();

  public async registerModules(path: string) {
    this.log('Registering from "%s"', path);

    const modules = await this.constructor.directoriesOnPath(path);

    for (let i = 0; i < modules.length; i++) {
      const module = await import(modules[i]);

      await this.registerModule(module.default);
    }
  }

  public async unregisterModule(name: string) {
    this.log('Unregistering "%s"', name);

    const module = this.modules.get(name);

    if (!module) {
      throw new Error(`Module "${name}" is not registered`);
    }

    await module.destroy();
    this.modules.delete(name);
  }

  private hasModule(name: string) {
    return this.modules.has(name);
  }

  private async registerModule(module: Module) {
    const { name, modules } = module;

    if (this.hasModule(name)) {
      // TODO: this might require a different handling
      // Its now though as if the same module was trying to be registered multiple
      // times as its shared as a submodule by different modules.
      this.log('Skip registration of "%s", already registered', name);
      return;
    } else if (module.disabled) {
      this.log('Skip registration of "%s", its disabled', name);
      return;
    }

    this.modules.set(name, module);

    if (modules) {
      this.log('"%s" has submodules, registering its submodules');

      await this.registerSubmodules(modules);
    }

    await module.initialize(this.client);
    this.log('Registered "%s"', name);
  }

  private async registerSubmodules(modules: Array<Module>) {
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];

      await this.registerModule(module);
    }
  }
}

export { ModuleManager };
