export declare class FakeEvent implements Event {
    /**
     * Constants.
     */
    readonly NONE = 0;
    readonly CAPTURING_PHASE = 1;
    readonly AT_TARGET = 2;
    readonly BUBBLING_PHASE = 3;
    /**
     * Members.
     */
    readonly type: string;
    readonly bubbles: boolean;
    readonly cancelable: boolean;
    defaultPrevented: boolean;
    readonly composed: boolean;
    readonly currentTarget: EventTarget | null;
    readonly eventPhase: number;
    readonly isTrusted: boolean;
    readonly target: EventTarget | null;
    readonly timeStamp: number;
    readonly cancelBubble: boolean;
    readonly returnValue: boolean;
    readonly srcElement: EventTarget | null;
    constructor(type: string, options?: {
        bubbles?: boolean;
        cancelable?: boolean;
    });
    preventDefault(): void;
    /**
     * Not implemented.
     */
    stopPropagation(): void;
    /**
     * Not implemented.
     */
    stopImmediatePropagation(): void;
    /**
     * Not implemented.
     */
    composedPath(): EventTarget[];
    /**
     * Not implemented.
     * @deprecated
     */
    initEvent(type: string, bubbles: boolean, cancelable: true): void;
}
//# sourceMappingURL=FakeEvent.d.ts.map