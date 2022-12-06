"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
const Plugin_1 = require("./Plugin");
class Module extends Plugin_1.Plugin {
    constructor() {
        super(...arguments);
        this.disabled = false;
        this.modules = new Array();
    }
}
exports.Module = Module;
//# sourceMappingURL=Module.js.map