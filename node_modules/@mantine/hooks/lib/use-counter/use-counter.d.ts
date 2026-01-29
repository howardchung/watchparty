export interface UseCounterOptions {
    min?: number;
    max?: number;
}
export interface UseCounterHandlers {
    increment: () => void;
    decrement: () => void;
    set: (value: number) => void;
    reset: () => void;
}
export type UseCounterReturnValue = [number, UseCounterHandlers];
export declare function useCounter(initialValue?: number, options?: UseCounterOptions): [number, UseCounterHandlers];
