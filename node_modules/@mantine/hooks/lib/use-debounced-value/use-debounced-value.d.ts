export interface UseDebouncedValueOptions {
    leading?: boolean;
}
export type UseDebouncedValueReturnValue<T> = [T, () => void];
export declare function useDebouncedValue<T = any>(value: T, wait: number, options?: UseDebouncedValueOptions): UseDebouncedValueReturnValue<T>;
