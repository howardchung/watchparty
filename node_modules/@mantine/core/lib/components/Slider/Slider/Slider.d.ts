import { BoxProps, ElementProps, Factory, MantineColor, MantineRadius, MantineSize, StylesApiProps } from '../../../core';
import { TransitionOverride } from '../../Transition';
import { SliderCssVariables, SliderStylesNames } from '../Slider.context';
export interface SliderProps extends BoxProps, StylesApiProps<SliderFactory>, ElementProps<'div', 'onChange'> {
    /** Key of `theme.colors` or any valid CSS color, controls color of track and thumb @default `theme.primaryColor` */
    color?: MantineColor;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius`, numbers are converted to rem @default `'xl'` */
    radius?: MantineRadius;
    /** Controls size of the track @default `'md'` */
    size?: MantineSize | (string & {}) | number;
    /** Minimal possible value @default `0` */
    min?: number;
    /** Maximum possible value @default `100` */
    max?: number;
    /** Domain of the slider, defines the full range of possible values @default `[min, max]` */
    domain?: [number, number];
    /** Number by which value will be incremented/decremented with thumb drag and arrows @default `1` */
    step?: number;
    /** Number of significant digits after the decimal point */
    precision?: number;
    /** Controlled component value */
    value?: number;
    /** Uncontrolled component default value */
    defaultValue?: number;
    /** Called when value changes */
    onChange?: (value: number) => void;
    /** Called when user stops dragging slider or changes value with arrows */
    onChangeEnd?: (value: number) => void;
    /** Hidden input name, use with uncontrolled component */
    name?: string;
    /** Marks displayed on the track */
    marks?: {
        value: number;
        label?: React.ReactNode;
    }[];
    /** Function to generate label or any react node to render instead, set to null to disable label */
    label?: React.ReactNode | ((value: number) => React.ReactNode);
    /** Props passed down to the `Transition` component @default `{ transition: 'fade', duration: 0 }` */
    labelTransitionProps?: TransitionOverride;
    /** Determines whether the label should be visible when the slider is not being dragged or hovered @default `false` */
    labelAlwaysOn?: boolean;
    /** Thumb `aria-label` */
    thumbLabel?: string;
    /** Determines whether the label should be displayed when the slider is hovered @default `true` */
    showLabelOnHover?: boolean;
    /** Content rendered inside thumb */
    thumbChildren?: React.ReactNode;
    /** Disables slider */
    disabled?: boolean;
    /** Thumb `width` and `height`, by default value is computed based on `size` prop */
    thumbSize?: number | string;
    /** A transformation function to change the scale of the slider */
    scale?: (value: number) => number;
    /** Determines whether track value representation should be inverted @default `false` */
    inverted?: boolean;
    /** Props passed down to the hidden input */
    hiddenInputProps?: React.ComponentPropsWithoutRef<'input'>;
    /** Determines whether the selection should be only allowed from the given marks array @default `false` */
    restrictToMarks?: boolean;
    /** Props passed down to thumb element */
    thumbProps?: React.ComponentPropsWithoutRef<'div'>;
}
export type SliderFactory = Factory<{
    props: SliderProps;
    ref: HTMLDivElement;
    stylesNames: SliderStylesNames;
    vars: SliderCssVariables;
}>;
export declare const Slider: import("../../..").MantineComponent<{
    props: SliderProps;
    ref: HTMLDivElement;
    stylesNames: SliderStylesNames;
    vars: SliderCssVariables;
}>;
