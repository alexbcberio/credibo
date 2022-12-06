"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
const Base_1 = require("../Base");
const discord_js_1 = require("discord.js");
class PluginManager extends Base_1.Base {
    constructor() {
        super(...arguments);
        this.plugins = new discord_js_1.Collection();
    }
    hasPlugin(name) {
        return this.plugins.has(name);
    }
    async addPlugin(plugin) {
        const { name } = plugin;
        if (this.hasPlugin(name)) {
            throw new Error(`Plugin ${name} is already registered.`);
        }
        else if (Object.keys(this).includes(name)) {
            throw new Error(`Plugin ${name} could not be added, the name is reserved for internal use.`);
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
exports.PluginManager = PluginManager;
//# sourceMappingURL=PluginManager.js.map