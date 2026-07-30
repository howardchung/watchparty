interface UseDelayedHoverInput {
    open: () => void;
    close: () => void;
    openDelay: number | undefined;
    closeDelay: number | undefined;
}
export declare function useDelayedHover({ open, close, openDelay, closeDelay }: UseDelayedHoverInput): {
    openDropdown: () => void;
    closeDropdown: () => void;
};
export {};
