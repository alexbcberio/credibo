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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Credibo = void 0;
const helper = __importStar(require("./helper"));
const discord_js_1 = require("discord.js");
const manager_1 = require("./manager");
const debug_1 = __importDefault(require("debug"));
class Credibo {
    static createInstance(options) {
        return new this(options);
    }
    constructor(options) {
        this.helper = helper;
        this.log = (0, debug_1.default)(this.constructor.name);
        this.discord = new discord_js_1.Client(options);
        this.commands = new manager_1.CommandManager(this);
        this.events = new manager_1.EventManager(this);
        this.modules = new manager_1.ModuleManager(this);
        this.plugins = new manager_1.PluginManager(this);
        process.on("SIGINT", () => this.destroy());
    }
    async login(token) {
        const client = await this.discord.login(token);
        await this.commands.setToken(token);
        return client;
    }
    destroy() {
        this.discord.destroy();
        this.log("Client destroyed");
    }
}
exports.Credibo = Credibo;
//# sourceMappingURL=index.js.map