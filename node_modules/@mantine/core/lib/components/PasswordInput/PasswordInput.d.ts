import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
import { __BaseInputProps, __InputStylesNames, InputVariant } from '../Input';
export type PasswordInputStylesNames = 'root' | 'visibilityToggle' | 'innerInput' | __InputStylesNames;
export type PasswordInputCssVariables = {
    root: '--psi-icon-size' | '--psi-button-size';
};
export interface PasswordInputProps extends BoxProps, Omit<__BaseInputProps, 'pointer'>, StylesApiProps<PasswordInputFactory>, ElementProps<'input', 'size'> {
    /** A component to replace the visibility toggle icon */
    visibilityToggleIcon?: React.FC<{
        reveal: boolean;
    }>;
    /** Props passed down to the visibility toggle button */
    visibilityToggleButtonProps?: Record<string, any>;
    /** If set, the input value is visible visible */
    visible?: boolean;
    /** If set, the input value is visible by default */
    defaultVisible?: boolean;
    /** Called when visibility changes */
    onVisibilityChange?: (visible: boolean) => void;
}
export type PasswordInputFactory = Factory<{
    props: PasswordInputProps;
    ref: HTMLInputElement;
    stylesNames: PasswordInputStylesNames;
    vars: PasswordInputCssVariables;
    variant: InputVariant;
}>;
export declare const PasswordInput: import("../..").MantineComponent<{
    props: PasswordInputProps;
    ref: HTMLInputElement;
    stylesNames: PasswordInputStylesNames;
    vars: PasswordInputCssVariables;
    variant: InputVariant;
}>;
