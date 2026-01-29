import { BoxProps, ElementProps, Factory, MantineColor, MantineRadius, MantineSize, StylesApiProps } from '../../../core';
import { TransitionOverride } from '../../Transition';
import { SliderCssVariables, SliderStylesNames } from '../Slider.context';
export type RangeSliderValue = [number, number];
export interface RangeSliderProps extends BoxProps, StylesApiProps<RangeSliderFactory>, ElementProps<'div', 'onChange' | 'value' | 'defaultValue'> {
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
    value?: RangeSliderValue;
    /** Uncontrolled component default value */
    defaultValue?: RangeSliderValue;
    /** Called when value changes */
    onChange?: (value: RangeSliderValue) => void;
    /** Called when user stops dragging slider or changes value with arrows */
    onChangeEnd?: (value: RangeSliderValue) => void;
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
    /** Determines whether track values representation should be inverted @default `false` */
    inverted?: boolean;
    /** Minimal range interval @default `10` */
    minRange?: number;
    /** Maximum range interval @default `Infinity` */
    maxRange?: number;
    /** First thumb `aria-label` */
    thumbFromLabel?: string;
    /** Second thumb `aria-label` */
    thumbToLabel?: string;
    /** Props passed down to the hidden input */
    hiddenInputProps?: React.ComponentPropsWithoutRef<'input'>;
    /** Determines whether the selection should be only allowed from the given marks array @default `false` */
    restrictToMarks?: boolean;
    /** Props passed down to thumb element based on the thumb index */
    thumbProps?: (index: 0 | 1) => React.ComponentPropsWithoutRef<'div'>;
    /** Determines whether the other thumb should be pushed by the current thumb dragging when `minRange`/`maxRange` is reached @default `true` */
    pushOnOverlap?: boolean;
}
export type RangeSliderFactory = Factory<{
    props: RangeSliderProps;
    ref: HTMLDivElement;
    stylesNames: SliderStylesNames;
    vars: SliderCssVariables;
}>;
export declare const RangeSlider: import("../../..").MantineComponent<{
    props: RangeSliderProps;
    ref: HTMLDivElement;
    stylesNames: SliderStylesNames;
    vars: SliderCssVariables;
}>;
