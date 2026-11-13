import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
export type AngleSliderStylesNames = 'root' | 'thumb' | 'label' | 'marks' | 'mark';
export type AngleSliderCssVariables = {
    root: '--slider-size' | '--thumb-size';
};
export interface AngleSliderProps extends BoxProps, StylesApiProps<AngleSliderFactory>, ElementProps<'div', 'onChange'> {
    /** Step between values @default `1` */
    step?: number;
    /** Controlled component value */
    value?: number;
    /** Uncontrolled component default value */
    defaultValue?: number;
    /** Called on value change */
    onChange?: (value: number) => void;
    /** Called after the selection is finished */
    onChangeEnd?: (value: number) => void;
    /** Called in `onMouseDown` and `onTouchStart` */
    onScrubStart?: () => void;
    /** Called in `onMouseUp` and `onTouchEnd` */
    onScrubEnd?: () => void;
    /** If set, the label is displayed inside the slider @default `true` */
    withLabel?: boolean;
    /** Array of marks displayed on the slider */
    marks?: {
        value: number;
        label?: string;
    }[];
    /** Slider size in px @default `60px` */
    size?: number;
    /** Size of the thumb in px. Calculated based on the `size` value by default. */
    thumbSize?: number;
    /** A function to format label based on the current value */
    formatLabel?: (value: number) => React.ReactNode;
    /** Sets `data-disabled` attribute, disables interactions */
    disabled?: boolean;
    /** If set, the selection is allowed only from the given marks array @default `false` */
    restrictToMarks?: boolean;
    /** Props passed down to the hidden input */
    hiddenInputProps?: React.ComponentPropsWithoutRef<'input'>;
    /** Hidden input name, use with uncontrolled component */
    name?: string;
}
export type AngleSliderFactory = Factory<{
    props: AngleSliderProps;
    ref: HTMLDivElement;
    stylesNames: AngleSliderStylesNames;
    vars: AngleSliderCssVariables;
}>;
export declare const AngleSlider: import("../..").MantineComponent<{
    props: AngleSliderProps;
    ref: HTMLDivElement;
    stylesNames: AngleSliderStylesNames;
    vars: AngleSliderCssVariables;
}>;
