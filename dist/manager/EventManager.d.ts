import { ClientEvents } from "discord.js";
import { Base } from "../Base";
import { Credibo } from "..";
type ClientEventTypes = keyof ClientEvents;
declare class EventManager extends Base {
    private readonly preHooks;
    private readonly postHooks;
    on<K extends ClientEventTypes>(event: K, listener: (this: Credibo, ...args: ClientEvents[K]) => void): this;
    once<K extends ClientEventTypes>(event: K, listener: (...args: ClientEvents[K]) => void): this;
    off<K extends ClientEventTypes>(event: K, listener: (...args: ClientEvents[K]) => void): this;
    pre<K extends ClientEventTypes>(event: K, listener: (this: Credibo, ...args: ClientEvents[K]) => void): this;
    post<K extends ClientEventTypes>(event: K, listener: (this: Credibo, ...args: ClientEvents[K]) => void): this;
    private isOnlyListener;
    private registerListener;
    private unregisterListener;
    private handleEvent;
}
export { EventManager };
