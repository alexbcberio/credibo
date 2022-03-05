import { ClientEvents, Collection } from "discord.js";

import { Base } from "../Base";
import { BotClient } from "..";

type ClientEventTypes = keyof ClientEvents;
type Listener = (this: BotClient, ...args: Array<unknown>) => Promise<void>;

class EventManager extends Base {
  private readonly events = new Collection<ClientEventTypes, Set<Listener>>();
  private readonly listeners = new Collection<ClientEventTypes, Listener>();

  // heavily copy pasted from discord.js
  public on<K extends ClientEventTypes>(
    event: K,
    listener: (this: BotClient, ...args: ClientEvents[K]) => Promise<void>
  ): this;

  // heavily copy pasted from discord.js
  public on<S extends string | symbol>(
    event: Exclude<S, ClientEventTypes>,
    listener: Listener
  ): this {
    const eventName = event as ClientEventTypes;

    let eventSet = this.events.get(eventName);

    if (!eventSet) {
      eventSet = new Set<Listener>();
      this.events.set(eventName, eventSet);
    }

    if (!eventSet.size) {
      const eventListener = (...args: Array<unknown>) =>
        this.handleEvent(eventName, args);

      this.registerListener(eventName, eventListener);
    }

    eventSet.add(listener);

    return this;
  }

  // heavily copy pasted from discord.js
  public once<K extends ClientEventTypes>(
    event: K,
    listener: (...args: ClientEvents[K]) => Promise<void>
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
    listener: (...args: ClientEvents[K]) => Promise<void>
  ): void;

  // heavily copy pasted from discord.js
  public off<S extends string | symbol>(
    event: Exclude<S, ClientEventTypes>,
    listener: Listener
  ): void {
    const eventName = event as ClientEventTypes;
    const eventSet = this.events.get(eventName);

    if (!eventSet) {
      throw new Error(`There are no ${eventName} registered events.`);
    }

    eventSet.delete(listener);

    if (!eventSet.size) {
      this.unregisterListener(eventName);
    }
  }

  private registerListener(eventName: ClientEventTypes, listener: Listener) {
    this.listeners.set(eventName, listener);
    this.client.discord.on(eventName, listener);

    this.log("Registered %s listener", eventName);
  }

  private unregisterListener(eventName: ClientEventTypes) {
    const listener = this.listeners.get(eventName);

    if (!listener) {
      throw new Error(`Could not find ${eventName} listener to unregister.`);
    }

    this.client.discord.off(eventName, listener);
    this.listeners.delete(eventName);

    this.log("Unregistered %s listener", eventName);
  }

  private async processEventHandlerPromises(promises: Array<Promise<unknown>>) {
    const result = await Promise.allSettled(promises);

    const rejectedPromises = result.filter((p) => p.status === "rejected");

    if (rejectedPromises.length) {
      this.log(
        "Rejected %d promises %O",
        rejectedPromises.length,
        rejectedPromises
      );
    }
  }

  private async handleEvent(event: ClientEventTypes, args: Array<unknown>) {
    const listeners = this.events.get(event);

    if (!listeners || !listeners.size) {
      return;
    }

    const promises = new Array<Promise<void>>();

    for (const listener of listeners) {
      // events have at most 3 arguments
      const handler = listener.call(
        this.client,
        args.shift(),
        args.shift(),
        args.shift()
      );

      promises.push(handler);
    }

    await this.processEventHandlerPromises(promises);
  }
}

export { EventManager };
