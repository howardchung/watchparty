"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeMediaStreamTrack = void 0;
const uuid_1 = require("@lukeed/uuid");
const FakeEventTarget_1 = require("./fakeEvents/FakeEventTarget");
const FakeEvent_1 = require("./fakeEvents/FakeEvent");
const utils_1 = require("./utils");
class FakeMediaStreamTrack extends FakeEventTarget_1.FakeEventTarget {
    #id;
    #kind;
    #label;
    #readyState;
    #enabled;
    #muted;
    #contentHint;
    #capabilities;
    #constraints;
    #settings;
    #data;
    // Events.
    #onmute = null;
    #onunmute = null;
    #onended = null;
    // Custom events.
    #onenabledchange = null;
    #onstopped = null;
    constructor({ kind, id, label, contentHint, enabled, muted, readyState, capabilities, constraints, settings, data, }) {
        super();
        this.#id = id ?? (0, uuid_1.v4)();
        this.#kind = kind;
        this.#label = label ?? '';
        this.#contentHint = contentHint ?? '';
        this.#enabled = enabled ?? true;
        this.#muted = muted ?? false;
        this.#readyState = readyState ?? 'live';
        this.#capabilities = capabilities ?? {};
        this.#constraints = constraints ?? {};
        this.#settings = settings ?? {};
        this.#data = data ?? {};
    }
    get id() {
        return this.#id;
    }
    get kind() {
        return this.#kind;
    }
    get label() {
        return this.#label;
    }
    get contentHint() {
        return this.#contentHint;
    }
    set contentHint(contentHint) {
        this.#contentHint = contentHint;
    }
    get enabled() {
        return this.#enabled;
    }
    /**
     * Changes `enabled` member value and fires a custom "enabledchange" event.
     */
    set enabled(enabled) {
        const changed = this.#enabled !== enabled;
        this.#enabled = enabled;
        if (changed) {
            this.dispatchEvent(new FakeEvent_1.FakeEvent('enabledchange'));
        }
    }
    get muted() {
        return this.#muted;
    }
    get readyState() {
        return this.#readyState;
    }
    /**
     * Application custom data getter.
     */
    get data() {
        return this.#data;
    }
    /**
     * Application custom data setter.
     */
    set data(data) {
        this.#data = data;
    }
    get onmute() {
        return this.#onmute;
    }
    set onmute(handler) {
        if (this.#onmute) {
            this.removeEventListener('mute', this.#onmute);
        }
        this.#onmute = handler;
        if (handler) {
            this.addEventListener('mute', handler);
        }
    }
    get onunmute() {
        return this.#onunmute;
    }
    set onunmute(handler) {
        if (this.#onunmute) {
            this.removeEventListener('unmute', this.#onunmute);
        }
        this.#onunmute = handler;
        if (handler) {
            this.addEventListener('unmute', handler);
        }
    }
    get onended() {
        return this.#onended;
    }
    set onended(handler) {
        if (this.#onended) {
            this.removeEventListener('ended', this.#onended);
        }
        this.#onended = handler;
        if (handler) {
            this.addEventListener('ended', handler);
        }
    }
    get onenabledchange() {
        return this.#onenabledchange;
    }
    set onenabledchange(handler) {
        if (this.#onenabledchange) {
            this.removeEventListener('enabledchange', this.#onenabledchange);
        }
        this.#onenabledchange = handler;
        if (handler) {
            this.addEventListener('enabledchange', handler);
        }
    }
    get onstopped() {
        return this.#onstopped;
    }
    set onstopped(handler) {
        if (this.#onstopped) {
            this.removeEventListener('stopped', this.#onstopped);
        }
        this.#onstopped = handler;
        if (handler) {
            this.addEventListener('stopped', handler);
        }
    }
    addEventListener(type, listener, options) {
        super.addEventListener(type, listener, options);
    }
    removeEventListener(type, listener, options) {
        super.removeEventListener(type, listener, options);
    }
    /**
     * Changes `readyState` member to "ended" and fires a custom "stopped" event
     * (if not already stopped).
     */
    stop() {
        if (this.#readyState === 'ended') {
            return;
        }
        this.#readyState = 'ended';
        this.dispatchEvent(new FakeEvent_1.FakeEvent('stopped'));
    }
    /**
     * Clones current track into another FakeMediaStreamTrack. `id` and `data`
     * can be optionally given.
     */
    clone({ id, data, } = {}) {
        return new FakeMediaStreamTrack({
            id: id ?? (0, uuid_1.v4)(),
            kind: this.#kind,
            label: this.#label,
            contentHint: this.#contentHint,
            enabled: this.#enabled,
            muted: this.#muted,
            readyState: this.#readyState,
            capabilities: (0, utils_1.clone)(this.#capabilities),
            constraints: (0, utils_1.clone)(this.#constraints),
            settings: (0, utils_1.clone)(this.#settings),
            data: data ?? (0, utils_1.clone)(this.#data),
        });
    }
    getCapabilities() {
        return this.#capabilities;
    }
    getConstraints() {
        return this.#constraints;
    }
    async applyConstraints(constraints = {}) {
        this.#constraints = constraints;
        // To make it be "more" async so ESLint doesn't complain.
        return Promise.resolve();
    }
    getSettings() {
        return this.#settings;
    }
    /**
     * Simulates a remotely triggered stop. It fires a custom "stopped" event and
     * the standard "ended" event (if the track was not already stopped).
     */
    remoteStop() {
        if (this.#readyState === 'ended') {
            return;
        }
        this.#readyState = 'ended';
        this.dispatchEvent(new FakeEvent_1.FakeEvent('stopped'));
        this.dispatchEvent(new FakeEvent_1.FakeEvent('ended'));
    }
    /**
     * Simulates a remotely triggered mute. It fires a "mute" event (if the track
     * was not already muted).
     */
    remoteMute() {
        if (this.#muted) {
            return;
        }
        this.#muted = true;
        this.dispatchEvent(new FakeEvent_1.FakeEvent('mute'));
    }
    /**
     * Simulates a remotely triggered unmute. It fires an "unmute" event (if the
     * track was muted).
     */
    remoteUnmute() {
        if (!this.#muted) {
            return;
        }
        this.#muted = false;
        this.dispatchEvent(new FakeEvent_1.FakeEvent('unmute'));
    }
}
exports.FakeMediaStreamTrack = FakeMediaStreamTrack;
