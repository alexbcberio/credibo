"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
class Plugin {
    constructor(client) {
        this.name = 
        // eslint-disable-next-line no-magic-numbers
        this.constructor.name.charAt(0).toLowerCase() +
            // eslint-disable-next-line no-magic-numbers
            this.constructor.name.substring(1);
        this.client = client;
        this.log = client.log.extend(this.name);
    }
}
exports.Plugin = Plugin;
//# sourceMappingURL=Plugin.js.map