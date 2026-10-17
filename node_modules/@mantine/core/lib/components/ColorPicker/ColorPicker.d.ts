import { BoxProps, ElementProps, Factory, MantineSize, StylesApiProps } from '../../core';
import { ColorFormat } from './ColorPicker.types';
export type ColorPickerStylesNames = 'wrapper' | 'preview' | 'body' | 'sliders' | 'slider' | 'sliderOverlay' | 'thumb' | 'saturation' | 'thumb' | 'saturationOverlay' | 'thumb' | 'swatches' | 'swatch';
export type ColorPickerCssVariables = {
    wrapper: '--cp-preview-size' | '--cp-width' | '--cp-body-spacing' | '--cp-swatch-size' | '--cp-thumb-size' | '--cp-saturation-height';
};
export interface __ColorPickerProps {
    /** Controlled component value */
    value?: string;
    /** Uncontrolled component default value */
    defaultValue?: string;
    /** Called when value changes */
    onChange?: (value: string) => void;
    /** Called when the user stops dragging one of the sliders or changes the value with keyboard */
    onChangeEnd?: (value: string) => void;
    /** Color format @default `'hex'` */
    format?: ColorFormat;
    /** Determines whether the color picker should be displayed @default `true` */
    withPicker?: boolean;
    /** A list of colors used to display swatches list below the color picker */
    swatches?: string[];
    /** Number of swatches per row @default `7` */
    swatchesPerRow?: number;
    /** Controls size of hue, alpha and saturation sliders @default `'md'` */
    size?: MantineSize | (string & {});
}
export interface ColorPickerProps extends BoxProps, __ColorPickerProps, StylesApiProps<ColorPickerFactory>, ElementProps<'div', 'onChange' | 'value' | 'defaultValue'> {
    __staticSelector?: string;
    /** If set, the component takes 100% width of its container @default `false` */
    fullWidth?: boolean;
    /** If set, interactive elements (sliders thumbs and swatches) are focusable with keyboard @default `true` */
    focusable?: boolean;
    /** Saturation slider `aria-label` */
    saturationLabel?: string;
    /** Hue slider `aria-label` */
    hueLabel?: string;
    /** Alpha slider `aria-label` */
    alphaLabel?: string;
    /** Called when one of the color swatches is clicked */
    onColorSwatchClick?: (color: string) => void;
}
export type ColorPickerFactory = Factory<{
    props: ColorPickerProps;
    ref: HTMLDivElement;
    stylesNames: ColorPickerStylesNames;
    vars: ColorPickerCssVariables;
}>;
export declare const ColorPicker: import("../..").MantineComponent<{
    props: ColorPickerProps;
    ref: HTMLDivElement;
    stylesNames: ColorPickerStylesNames;
    vars: ColorPickerCssVariables;
}>;
