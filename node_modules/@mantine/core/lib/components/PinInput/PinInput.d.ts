import { BoxProps, ElementProps, Factory, MantineRadius, MantineSize, MantineSpacing, StylesApiProps } from '../../core';
import { InputProps } from '../Input';
export type PinInputStylesNames = 'root' | 'pinInput' | 'input';
export type PinInputCssVariables = {
    root: '--pin-input-size';
};
export interface PinInputProps extends BoxProps, StylesApiProps<PinInputFactory>, ElementProps<'div', 'onChange'> {
    /** Hidden input `name` attribute */
    name?: string;
    /** Hidden input `form` attribute */
    form?: string;
    /** Key of `theme.spacing` or any valid CSS value to set `gap` between inputs, numbers are converted to rem @default `'md'` */
    gap?: MantineSpacing;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius`, numbers are converted to rem @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Controls inputs `width` and `height` @default `'sm'` */
    size?: MantineSize;
    /** If set, the first input is focused when component is mounted @default `false` */
    autoFocus?: boolean;
    /** Controlled component value */
    value?: string;
    /** Uncontrolled component default value */
    defaultValue?: string;
    /** Called when value changes */
    onChange?: (value: string) => void;
    /** Called when all inputs have value */
    onComplete?: (value: string) => void;
    /** Inputs placeholder @default `'○'` */
    placeholder?: string;
    /** Determines whether focus should be moved automatically to the next input once filled @default `true` */
    manageFocus?: boolean;
    /** Determines whether `autocomplete="one-time-code"` attribute should be set on all inputs @default `true` */
    oneTimeCode?: boolean;
    /** Base id used to generate unique ids for inputs */
    id?: string;
    /** Adds disabled attribute to all inputs */
    disabled?: boolean;
    /** Sets `aria-invalid` attribute and applies error styles to all inputs */
    error?: boolean;
    /** Determines which values can be entered @default `'alphanumeric'` */
    type?: 'alphanumeric' | 'number' | RegExp;
    /** Changes input type to `"password"` @default `false` */
    mask?: boolean;
    /** Number of inputs @default `4` */
    length?: number;
    /** If set, the user cannot edit the value */
    readOnly?: boolean;
    /** Inputs `type` attribute, inferred from the `type` prop if not specified */
    inputType?: React.HTMLInputTypeAttribute;
    /** `inputmode` attribute, inferred from the `type` prop if not specified */
    inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined;
    /** `aria-label` attribute */
    ariaLabel?: string;
    /** Props passed down to the hidden input */
    hiddenInputProps?: React.ComponentPropsWithoutRef<'input'>;
    /** Assigns ref of the root element */
    rootRef?: React.ForwardedRef<HTMLDivElement>;
    /** Props added to the input element depending on its index */
    getInputProps?: (index: number) => InputProps & ElementProps<'input', 'size'>;
}
export type PinInputFactory = Factory<{
    props: PinInputProps;
    ref: HTMLInputElement;
    stylesNames: PinInputStylesNames;
    vars: PinInputCssVariables;
}>;
export declare const PinInput: import("../..").MantineComponent<{
    props: PinInputProps;
    ref: HTMLInputElement;
    stylesNames: PinInputStylesNames;
    vars: PinInputCssVariables;
}>;
