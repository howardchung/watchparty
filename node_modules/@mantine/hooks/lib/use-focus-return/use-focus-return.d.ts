export interface UseFocusReturnOptions {
    opened: boolean;
    shouldReturnFocus?: boolean;
}
export type UseFocusReturnReturnValue = () => void;
export declare function useFocusReturn({ opened, shouldReturnFocus, }: UseFocusReturnOptions): UseFocusReturnReturnValue;
