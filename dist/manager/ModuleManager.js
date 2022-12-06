"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleManager = void 0;
const Base_1 = require("../Base");
const discord_js_1 = require("discord.js");
const promises_1 = require("fs/promises");
const path_1 = require("path");
class ModuleManager extends Base_1.Base {
    constructor() {
        super(...arguments);
        this.modules = new discord_js_1.Collection();
    }
    static async directoriesOnPath(path) {
        const entries = await (0, promises_1.readdir)(path, {
            withFileTypes: true,
        });
        const directories = entries.filter((f) => f.isDirectory());
        const directoriesPath = directories.map((d) => (0, path_1.resolve)(path, d.name));
        return directoriesPath;
    }
    async registerModules(path) {
        var _a;
        this.log('Registering modules from "%s"', path);
        const modules = await this.constructor.directoriesOnPath(path);
        for (let i = 0; i < modules.length; i++) {
            const module = await (_a = modules[i], Promise.resolve().then(() => __importStar(require(_a))));
            await this.registerModule(module.default);
        }
    }
    async unregisterModule(name) {
        this.log('Unregistering "%s" module', name);
        const module = this.modules.get(name);
        if (!module) {
            throw new Error(`Module "${name}" is not registered.`);
        }
        await module.destroy();
        this.modules.delete(name);
    }
    hasModule(name) {
        return this.modules.has(name);
    }
    async registerModule(module) {
        // @ts-expect-error Module is abstract, users are supposed to extend it
        const instance = new module(this.client);
        const { name, modules } = instance;
        if (this.hasModule(name)) {
            // TODO: this might require a different handling
            // Its now though as if the same module was trying to be registered multiple
            // times as its shared as a submodule by different modules.
            this.log('Skip registration of "%s" module, already registered', name);
            return;
        }
        else if (module.disabled) {
            this.log('Skip registration of "%s" module, its disabled', name);
            return;
        }
        this.modules.set(name, instance);
        if (modules.length) {
            this.log('"%s" has submodules, registering its submodules');
            await this.registerSubmodules(modules);
        }
        await instance.initialize();
        this.log('Registered "%s" module', name);
    }
    async registerSubmodules(modules) {
        for (let i = 0; i < modules.length; i++) {
            const module = modules[i];
            await this.registerModule(module);
        }
    }
}
exports.ModuleManager = ModuleManager;
//# sourceMappingURL=ModuleManager.js.map