interface HoverCardContext {
    openDropdown: () => void;
    closeDropdown: () => void;
    getReferenceProps?: () => any;
    getFloatingProps?: () => any;
    reference?: (node: HTMLElement | null) => void;
    floating?: (node: HTMLElement | null) => void;
}
export declare const HoverCardContextProvider: ({ children, value }: {
    value: HoverCardContext;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useHoverCardContext: () => HoverCardContext;
export {};
