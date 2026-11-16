export interface UseHashOptions {
    getInitialValueInEffect?: boolean;
}
export type UseHashReturnValue = [string, (value: string) => void];
export declare function useHash({ getInitialValueInEffect, }?: UseHashOptions): UseHashReturnValue;
