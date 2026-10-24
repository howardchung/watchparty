export interface ComboboxHiddenInputProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'value'> {
    /** Input value */
    value: string | string[] | null;
    /** Divider character to join array values into string @default `','` */
    valuesDivider?: string;
}
export declare function ComboboxHiddenInput({ value, valuesDivider, ...others }: ComboboxHiddenInputProps): import("react/jsx-runtime").JSX.Element;
export declare namespace ComboboxHiddenInput {
    var displayName: string;
}
