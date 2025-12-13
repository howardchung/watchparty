export interface UseStateHistoryHandlers<T> {
    set: (value: T) => void;
    back: (steps?: number) => void;
    forward: (steps?: number) => void;
    reset: () => void;
}
export interface UseStateHistoryValue<T> {
    history: T[];
    current: number;
}
export type UseStateHistoryReturnValue<T> = [
    T,
    UseStateHistoryHandlers<T>,
    UseStateHistoryValue<T>
];
export declare function useStateHistory<T>(initialValue: T): UseStateHistoryReturnValue<T>;
