import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
import { __ColorPickerProps, ColorPickerStylesNames } from '../ColorPicker';
import { __BaseInputProps, __InputStylesNames, InputVariant } from '../Input';
import { PopoverProps } from '../Popover';
export type ColorInputStylesNames = 'dropdown' | 'eyeDropperButton' | 'eyeDropperIcon' | 'colorPreview' | ColorPickerStylesNames | __InputStylesNames;
export type ColorInputCssVariables = {
    eyeDropperIcon: '--ci-eye-dropper-icon-size';
    eyeDropperButton: '--ci-button-size';
    colorPreview: '--ci-preview-size';
};
export interface ColorInputProps extends BoxProps, __BaseInputProps, __ColorPickerProps, StylesApiProps<ColorInputFactory>, ElementProps<'input', 'size' | 'onChange' | 'value' | 'defaultValue'> {
    /** If input is not allowed, the user can only pick value with color picker and swatches */
    disallowInput?: boolean;
    /** If set, the input value resets to the last known valid value when the input loses focus @default `true` */
    fixOnBlur?: boolean;
    /** Props passed down to the `Popover` component */
    popoverProps?: PopoverProps;
    /** If set, the preview color swatch is displayed in the left section of the input @default `true` */
    withPreview?: boolean;
    /** If set, the eye dropper button is displayed in the right section @default `true` */
    withEyeDropper?: boolean;
    /** An icon to replace the default eye dropper icon */
    eyeDropperIcon?: React.ReactNode;
    /** If set, the dropdown is closed when one of the color swatches is clicked @default `false` */
    closeOnColorSwatchClick?: boolean;
    /** Props passed down to the eye dropper button */
    eyeDropperButtonProps?: Record<string, any>;
}
export type ColorInputFactory = Factory<{
    props: ColorInputProps;
    ref: HTMLInputElement;
    stylesNames: ColorInputStylesNames;
    vars: ColorInputCssVariables;
    variant: InputVariant;
}>;
export declare const ColorInput: import("../..").MantineComponent<{
    props: ColorInputProps;
    ref: HTMLInputElement;
    stylesNames: ColorInputStylesNames;
    vars: ColorInputCssVariables;
    variant: InputVariant;
}>;
