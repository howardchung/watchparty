export declare function createSafeContext<ContextValue>(errorMessage: string): readonly [({ children, value }: {
    value: ContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, () => ContextValue & ({} | undefined)];
