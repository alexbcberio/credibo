"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProduction = exports.isDevelopment = void 0;
// @ts-expect-error NODE_ENV value is forced on scripts
const env = (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : "production";
const isDevelopment = env === "development";
exports.isDevelopment = isDevelopment;
const isProduction = env === "production";
exports.isProduction = isProduction;
//# sourceMappingURL=index.js.map