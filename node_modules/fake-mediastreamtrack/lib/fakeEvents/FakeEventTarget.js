"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeEventTarget = void 0;
class FakeEventTarget {
    listeners = {};
    addEventListener(type, callback, options) {
        if (!callback) {
            return;
        }
        this.listeners[type] = this.listeners[type] ?? [];
        this.listeners[type].push({
            callback: 
            // eslint-disable-next-line @typescript-eslint/unbound-method
            typeof callback === 'function' ? callback : callback.handleEvent,
            once: typeof options === 'object' && options.once === true,
        });
    }
    removeEventListener(type, callback, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options) {
        if (!this.listeners[type]) {
            return;
        }
        if (!callback) {
            return;
        }
        this.listeners[type] = this.listeners[type].filter(listener => listener.callback !==
            // eslint-disable-next-line @typescript-eslint/unbound-method
            (typeof callback === 'function' ? callback : callback.handleEvent));
    }
    dispatchEvent(event) {
        if (!event || typeof event.type !== 'string') {
            throw new Error('invalid event object');
        }
        const entries = this.listeners[event.type];
        if (!entries) {
            return true;
        }
        for (const listener of [...entries]) {
            try {
                listener.callback.call(this, event);
            }
            catch (error) {
                // Avoid that the error breaks the iteration.
                setTimeout(() => {
                    throw error;
                }, 0);
            }
            if (listener.once) {
                this.removeEventListener(event.type, listener.callback);
            }
        }
        return !event.defaultPrevented;
    }
}
exports.FakeEventTarget = FakeEventTarget;
