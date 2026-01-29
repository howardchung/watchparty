interface UseHoverCard {
    openDelay?: number;
    closeDelay?: number;
    opened?: boolean;
    defaultOpened?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
}
export declare function useHoverCard(settings: UseHoverCard): {
    opened: boolean | undefined;
    reference: ((node: import("@floating-ui/react-dom").ReferenceType | null) => void) & ((node: import("@floating-ui/react").ReferenceType | null) => void);
    floating: ((node: HTMLElement | null) => void) & ((node: HTMLElement | null) => void);
    getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
    getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
    openDropdown: () => void;
    closeDropdown: () => void;
};
export {};
