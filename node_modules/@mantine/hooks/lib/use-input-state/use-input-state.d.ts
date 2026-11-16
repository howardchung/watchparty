export declare function getInputOnChange<T>(setValue: (value: null | undefined | T | ((current: T) => T)) => void): (val: null | undefined | T | React.ChangeEvent<any> | ((current: T) => T)) => void;
export type UseInputStateReturnValue<T> = [
    T,
    (value: null | undefined | T | React.ChangeEvent<any>) => void
];
export declare function useInputState<T>(initialState: T): UseInputStateReturnValue<T>;
