import { FakeEventListenerOrEventListenerObject, FakeAddEventListenerOptions, FakeEventListenerOptions } from './FakeEventListener';
import { FakeEvent } from './FakeEvent';
export declare class FakeEventTarget implements EventTarget {
    private readonly listeners;
    addEventListener(type: string, callback: FakeEventListenerOrEventListenerObject | null, options?: FakeAddEventListenerOptions | boolean): void;
    removeEventListener(type: string, callback: FakeEventListenerOrEventListenerObject | null, options?: boolean | FakeEventListenerOptions): void;
    dispatchEvent(event: FakeEvent): boolean;
}
//# sourceMappingURL=FakeEventTarget.d.ts.map