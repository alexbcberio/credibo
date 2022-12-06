"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base = void 0;
const stream_1 = require("stream");
class Base extends stream_1.EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.log = client.log.extend(this.constructor.name);
    }
}
exports.Base = Base;
//# sourceMappingURL=Base.js.map