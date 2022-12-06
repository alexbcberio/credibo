import { Credibo } from "..";
import { Debugger } from "debug";
declare abstract class Plugin {
    readonly name: string;
    abstract readonly version: `${number}.${number}.${number}`;
    protected readonly client: Credibo;
    protected readonly log: Debugger;
    constructor(client: Credibo);
    abstract initialize(): Promise<void>;
}
export { Plugin };
