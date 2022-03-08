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
    }

    await plugin.initialize();

    this.plugins.set(name, plugin);
    this.log("Added %s plugin", name);
  }


  public getPlugin(name: string) {
    const plugin = this.plugins.get(name);

    if (!plugin) {
      throw new Error(`Plugin ${name} is not registered.`);
    }

    return plugin;
  }
}

export { PluginManager };
