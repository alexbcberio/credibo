import { ClientEvents, Collection } from "discord.js";

import { Base } from "../Base";
import { Credibo } from "..";

type ClientEventTypes = keyof ClientEvents;
type Listener = (...args: Array<unknown>) => void;

class EventManager extends Base {
  private readonly preHooks = new Collection<ClientEventTypes, Set<Listener>>();
  private readonly postHooks = new Collection<
    ClientEventTypes,
    Set<Listener>
  >();

  // heavily copy pasted from discord.js
  public on<K extends ClientEventTypes>(
    event: K,
    listener: (this: Credibo, ...args: ClientEvents[K]) => void
  ): this;

  // heavily copy pasted from discord.js
  public on<S extends string | symbol>(
    event: Exclude<S, ClientEventTypes>,
    listener: Listener
  ): this {
    this.registerListener(event as ClientEventTypes);

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

    // eslint-disable-next-line no-magic-numbers
    if (this.isOnlyListener(eventName, listener)) {
      this.unregisterListener(eventName);
    }

    super.off(event, listener);

    return this;
  }

  // heavily copy pasted from discord.js
  public pre<K extends ClientEventTypes>(
    event: K,
    listener: (this: Credibo, ...args: ClientEvents[K]) => void
  ): this;

  // heavily copy pasted from discord.js
  public pre<S extends string | symbol>(
    event: Exclude<S, ClientEventTypes>,
    listener: Listener
  ): this {
    const eventName = event as ClientEventTypes;
    let preHooks = this.preHooks.get(eventName);

    if (!preHooks) {
      preHooks = new Set<Listener>();

      this.preHooks.set(eventName, preHooks);
    }

    preHooks.add(listener);

    return this;
  }

  // heavily copy pasted from discord.js
  public post<K extends ClientEventTypes>(
    event: K,
    listener: (this: Credibo, ...args: ClientEvents[K]) => void
  ): this;

  // heavily copy pasted from discord.js
  public post<S extends string | symbol>(
    event: Exclude<S, ClientEventTypes>,
    listener: Listener
  ): this {
    const eventName = event as ClientEventTypes;
    let postHooks = this.postHooks.get(eventName);

    if (!postHooks) {
      postHooks = new Set<Listener>();

      this.postHooks.set(eventName, postHooks);
    }

    postHooks.add(listener);

    return this;
  }

  private isOnlyListener(event: ClientEventTypes, listener: Listener): boolean {
    const rawListeners = this.rawListeners(event);

    // eslint-disable-next-line no-magic-numbers
    return rawListeners.length === 1 && rawListeners.pop() === listener;
  }

  private registerListener(eventName: ClientEventTypes) {
    if (!this.listenerCount(eventName)) {
      const listener = (...args: Array<unknown>) =>
        this.handleEvent(eventName, args);

      this.client.discord.on(eventName, listener);

      this.log("Registered %s listener", eventName);
    }
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

export { EventManager };
