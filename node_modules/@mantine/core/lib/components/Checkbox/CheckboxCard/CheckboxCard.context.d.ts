export interface CheckboxCardContextValue {
    checked: boolean;
}
export declare const CheckboxCardProvider: ({ children, value }: {
    value: CheckboxCardContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useCheckboxCardContext: () => CheckboxCardContextValue | null;
