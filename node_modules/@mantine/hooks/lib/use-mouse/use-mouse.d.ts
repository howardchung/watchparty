export declare function useMouse<T extends HTMLElement = any>(options?: {
    resetOnExit?: boolean;
}): {
    x: number;
    y: number;
    ref: import("react").RefObject<T | null>;
};
