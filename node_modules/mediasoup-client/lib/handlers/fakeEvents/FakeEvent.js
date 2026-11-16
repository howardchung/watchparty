"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeEvent = void 0;
// NOTE: Do not use our FakeEventTarget type inside this class, otherwise TS
// will complain because "Property 'listeners' is missing in type 'EventTarget'
// but required in type 'FakeEventTarget'".
class FakeEvent {
    /**
     * Constants.
     */
    NONE = 0;
    CAPTURING_PHASE = 1;
    AT_TARGET = 2;
    BUBBLING_PHASE = 3;
    /**
     * Members.
     */
    type;
    bubbles;
    cancelable;
    defaultPrevented = false;
    composed = false;
    currentTarget = null;
    // Not implemented.
    eventPhase = this.NONE;
    isTrusted = true;
    target = null;
    timeStamp = 0;
    // Deprecated.
    cancelBubble = false;
    returnValue = true;
    srcElement = null;
    constructor(type, options = {}) {
        this.type = type;
        this.bubbles = options.bubbles ?? false;
        this.cancelable = options.cancelable ?? false;
    }
    preventDefault() {
        if (this.cancelable) {
            this.defaultPrevented = true;
        }
    }
    /**
     * Not implemented.
     */
    stopPropagation() { }
    /**
     * Not implemented.
     */
    stopImmediatePropagation() { }
    /**
     * Not implemented.
     */
    composedPath() {
        return [];
    }
    /**
     * Not implemented.
     * @deprecated
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initEvent(type, bubbles, cancelable) {
        // Not implemented.
    }
}
exports.FakeEvent = FakeEvent;
