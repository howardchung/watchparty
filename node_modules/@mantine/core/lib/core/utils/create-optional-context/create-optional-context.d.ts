export declare function createOptionalContext<ContextValue>(initialValue?: ContextValue | null): readonly [({ children, value }: {
    value: ContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, () => ContextValue | null];
