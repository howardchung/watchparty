export interface RadioCardContextValue {
    checked: boolean;
}
export declare const RadioCardProvider: ({ children, value }: {
    value: RadioCardContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useRadioCardContext: () => RadioCardContextValue | null;
