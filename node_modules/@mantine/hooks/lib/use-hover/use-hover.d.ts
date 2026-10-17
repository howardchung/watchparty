export interface UseHoverReturnValue<T extends HTMLElement = any> {
    hovered: boolean;
    ref: React.RefCallback<T | null>;
}
export declare function useHover<T extends HTMLElement = any>(): UseHoverReturnValue<T>;
