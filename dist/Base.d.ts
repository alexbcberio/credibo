import { Credibo } from ".";
import { Debugger } from "debug";
import { EventEmitter } from "stream";
declare abstract class Base extends EventEmitter {
    readonly client: Credibo;
    protected readonly log: Debugger;
    constructor(client: Credibo);
}
export { Base };
