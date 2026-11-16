export interface UseFullscreenReturnValue<T extends HTMLElement = any> {
    ref: React.RefCallback<T | null>;
    toggle: () => Promise<void>;
    fullscreen: boolean;
}
export declare function useFullscreen<T extends HTMLElement = any>(): UseFullscreenReturnValue<T>;
