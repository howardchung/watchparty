interface UseScrollIntoViewAnimation {
    /** Target element alignment relatively to parent based on current axis */
    alignment?: 'start' | 'end' | 'center';
}
export interface UseScrollIntoViewOptions {
    /** Callback fired after scroll */
    onScrollFinish?: () => void;
    /** Duration of scroll in milliseconds */
    duration?: number;
    /** Axis of scroll */
    axis?: 'x' | 'y';
    /** Custom mathematical easing function */
    easing?: (t: number) => number;
    /** Additional distance between nearest edge and element */
    offset?: number;
    /** Indicator if animation may be interrupted by user scrolling */
    cancelable?: boolean;
    /** Prevents content jumping in scrolling lists with multiple targets */
    isList?: boolean;
}
export interface UseScrollIntoViewReturnValue<Target extends HTMLElement = any, Parent extends HTMLElement | null = null> {
    scrollableRef: React.RefObject<Parent | null>;
    targetRef: React.RefObject<Target | null>;
    scrollIntoView: (params?: UseScrollIntoViewAnimation) => void;
    cancel: () => void;
}
export declare function useScrollIntoView<Target extends HTMLElement = any, Parent extends HTMLElement | null = null>({ duration, axis, onScrollFinish, easing, offset, cancelable, isList, }?: UseScrollIntoViewOptions): UseScrollIntoViewReturnValue<Target, Parent>;
export {};
