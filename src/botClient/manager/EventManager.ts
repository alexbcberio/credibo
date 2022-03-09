import { Base } from "../Base";
import { BotClient } from "..";
import { ClientEvents } from "discord.js";

type ClientEventTypes = keyof ClientEvents;
type Listener = (...args: Array<unknown>) => void;

class EventManager extends Base {
  // heavily copy pasted from discord.js
  public on<K extends ClientEventTypes>(
    event: K,
    listener: (this: BotClient, ...args: ClientEvents[K]) => void
  ): this;

  // heavily copy pasted from discord.js
  public on<S extends string | symbol>(
    event: Exclude<S, ClientEventTypes>,
    listener: Listener
  ): this {
    const eventName = event as ClientEventTypes;

    if (!this.listenerCount(event)) {
      const eventListener = (...args: Array<unknown>) =>
        this.handleEvent(eventName, args);
      this.registerListener(eventName, eventListener);
    }

    super.on(event, listener);

    return this;
  }

  // heavily copy pasted from discord.js
  public once<K extends ClientEventTypes>(
    event: K,
    listener: (...args: ClientEvents[K]) => void
  ): this;

  // heavily copy pasted from discord.js
  public once<S extends string | symbol>(
    event: Exclude<S, ClientEventTypes>,
    listener: Listener
  ): this {
    this.client.discord.once(event, listener);

    return this;
  }

  // heavily copy pasted from discord.js
  public off<K extends ClientEventTypes>(
    event: K,
    listener: (...args: ClientEvents[K]) => void
  ): this;

  // heavily copy pasted from discord.js
  public off<S extends string | symbol>(
    event: Exclude<S, ClientEventTypes>,
    listener: Listener
  ): this {
    const eventName = event as ClientEventTypes;
    const rawListeners = this.rawListeners(eventName);

    // eslint-disable-next-line no-magic-numbers
    if (rawListeners.length === 1 && rawListeners.pop() === listener) {
      this.unregisterListener(eventName);
    }

    super.off(event, listener);

    return this;
  }

  private registerListener(eventName: ClientEventTypes, listener: Listener) {
    this.client.discord.on(eventName, listener);

    this.log("Registered %s listener", eventName);
  }

  private unregisterListener(eventName: ClientEventTypes) {
    const listener = this.rawListeners(eventName).pop();

    if (!listener) {
      throw new Error(`Could not find ${eventName} listener to unregister.`);
    }

    this.client.discord.off(eventName, listener as Listener);

    this.log("Unregistered %s listener", eventName);
  }

  private handleEvent(event: ClientEventTypes, args: Array<unknown>) {
    const arg1 = args.shift();
    const arg2 = args.shift();
    const arg3 = args.shift();

    this.emit(event, arg1, arg2, arg3);
  }
}

export { EventManager };
