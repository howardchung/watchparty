export declare const isFixed: (current: number, fixedAt: number) => boolean;
export declare const isPinned: (current: number, previous: number) => boolean;
export declare const isReleased: (current: number, previous: number, fixedAt: number) => boolean;
export declare const isPinnedOrReleased: (current: number, fixedAt: number, isCurrentlyPinnedRef: React.RefObject<boolean>, isScrollingUp: boolean, onPin?: () => void, onRelease?: () => void) => void;
export declare const useScrollDirection: () => boolean;
export interface UseHeadroomOptions {
    /** Number in px at which element should be fixed */
    fixedAt?: number;
    /** Called when element is pinned */
    onPin?: () => void;
    /** Called when element is at fixed position */
    onFix?: () => void;
    /** Called when element is unpinned */
    onRelease?: () => void;
}
export declare function useHeadroom({ fixedAt, onPin, onFix, onRelease }?: UseHeadroomOptions): boolean;
