export interface UseMediaQueryOptions {
    getInitialValueInEffect: boolean;
}
export declare function useMediaQuery(query: string, initialValue?: boolean, { getInitialValueInEffect }?: UseMediaQueryOptions): boolean;
