import { FakeEvent } from './FakeEvent';
export type FakeEventListenerOrEventListenerObject = FakeEventListener | FakeEventListenerObject;
export interface FakeEventListener {
    (evt: FakeEvent): void;
}
export interface FakeEventListenerObject {
    handleEvent(object: FakeEvent): void;
}
export interface FakeAddEventListenerOptions {
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
    signal?: AbortSignal;
}
export interface FakeEventListenerOptions {
    capture?: boolean;
}
//# sourceMappingURL=FakeEventListener.d.ts.map