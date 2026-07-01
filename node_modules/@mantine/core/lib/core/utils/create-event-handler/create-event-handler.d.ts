type EventHandler<Event> = ((event?: Event) => void) | undefined;
export declare function createEventHandler<Event>(parentEventHandler: EventHandler<Event>, eventHandler: EventHandler<Event>): (event?: Event) => void;
export {};
