import { Base } from "../Base";
import { Collection } from "discord.js";
import { Plugin } from "../types";

class PluginManager extends Base {
  private plugins = new Collection<string, Plugin>();

  public hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  public async addPlugin(plugin: Plugin) {
    const { name } = plugin;

    if (this.hasPlugin(name)) {
      throw new Error(`Plugin ${name} is already registered.`);
    } else if (Object.keys(this).includes(name)) {
      throw new Error(
        `Plugin ${name} could not be added, the name is reserved for internal use.`
      );
    }

    await plugin.initialize();

    this.plugins.set(name, plugin);

    Object.defineProperty(this, name, {
      get() {
        return plugin;
      },
      set() {
        throw new Error(`A plugin cannot be overwritten.`);
      },
    });

    this.log("Added %s plugin", name);
  }
}

export { PluginManager };
