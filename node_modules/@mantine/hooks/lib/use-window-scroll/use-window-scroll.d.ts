export interface UseWindowScrollPosition {
    x: number;
    y: number;
}
export type UseWindowScrollTo = (position: Partial<UseWindowScrollPosition>) => void;
export type UseWindowScrollReturnValue = [UseWindowScrollPosition, UseWindowScrollTo];
export declare function useWindowScroll(): UseWindowScrollReturnValue;
