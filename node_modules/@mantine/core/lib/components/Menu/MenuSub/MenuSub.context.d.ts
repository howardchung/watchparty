interface SubMenuContext {
    opened: boolean;
    close: () => void;
    open: () => void;
    focusFirstItem: () => void;
    focusParentItem: () => void;
    parentContext: SubMenuContext | null;
}
export declare const SubMenuProvider: ({ children, value }: {
    value: SubMenuContext;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useSubMenuContext: () => SubMenuContext | null;
export {};
