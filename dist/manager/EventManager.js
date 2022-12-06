"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
const discord_js_1 = require("discord.js");
const Base_1 = require("../Base");
class EventManager extends Base_1.Base {
    constructor() {
        super(...arguments);
        this.preHooks = new discord_js_1.Collection();
        this.postHooks = new discord_js_1.Collection();
    }
    // heavily copy pasted from discord.js
    on(event, listener) {
        this.registerListener(event);
        super.on(event, listener);
        return this;
    }
    // heavily copy pasted from discord.js
    once(event, listener) {
        this.client.discord.once(event, listener);
        return this;
    }
    // heavily copy pasted from discord.js
    off(event, listener) {
        const eventName = event;
        // eslint-disable-next-line no-magic-numbers
        if (this.isOnlyListener(eventName, listener)) {
            this.unregisterListener(eventName);
        }
        super.off(event, listener);
        return this;
    }
    // heavily copy pasted from discord.js
    pre(event, listener) {
        const eventName = event;
        let preHooks = this.preHooks.get(eventName);
        if (!preHooks) {
            preHooks = new Set();
            this.preHooks.set(eventName, preHooks);
        }
        preHooks.add(listener);
        return this;
    }
    // heavily copy pasted from discord.js
    post(event, listener) {
        const eventName = event;
        let postHooks = this.postHooks.get(eventName);
        if (!postHooks) {
            postHooks = new Set();
            this.postHooks.set(eventName, postHooks);
        }
        postHooks.add(listener);
        return this;
    }
    isOnlyListener(event, listener) {
        const rawListeners = this.rawListeners(event);
        // eslint-disable-next-line no-magic-numbers
        return rawListeners.length === 1 && rawListeners.pop() === listener;
    }
    registerListener(eventName) {
        if (!this.listenerCount(eventName)) {
            const listener = (...args) => this.handleEvent(eventName, args);
            this.client.discord.on(eventName, listener);
            this.log("Registered %s listener", eventName);
        }
    }
    unregisterListener(eventName) {
        const listener = this.rawListeners(eventName).pop();
        if (!listener) {
            throw new Error(`Could not find ${eventName} listener to unregister.`);
        }
        this.client.discord.off(eventName, listener);
        this.log("Unregistered %s listener", eventName);
    }
    handleEvent(event, args) {
        const arg1 = args.shift();
        const arg2 = args.shift();
        const arg3 = args.shift();
        const preHooks = this.preHooks.get(event);
        if (preHooks) {
            for (const preHook of preHooks.values()) {
                preHook(arg1, arg2, arg3);
            }
        }
        this.emit(event, arg1, arg2, arg3);
        const postHooks = this.postHooks.get(event);
        if (postHooks) {
            for (const postHook of postHooks.values()) {
                postHook(arg1, arg2, arg3);
            }
        }
    }
}
exports.EventManager = EventManager;
//# sourceMappingURL=EventManager.js.map