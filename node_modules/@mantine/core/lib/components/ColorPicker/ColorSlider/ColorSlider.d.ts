import { BoxProps, ElementProps, Factory, MantineSize, StylesApiProps } from '../../../core';
export type ColorSliderStylesNames = 'slider' | 'sliderOverlay' | 'thumb';
export interface __ColorSliderProps extends ElementProps<'div', 'onChange'> {
    value: number;
    onChange?: (value: number) => void;
    onChangeEnd?: (value: number) => void;
    onScrubStart?: () => void;
    onScrubEnd?: () => void;
    size?: MantineSize | (string & {});
    focusable?: boolean;
}
export interface ColorSliderProps extends BoxProps, StylesApiProps<ColorSliderFactory>, __ColorSliderProps, ElementProps<'div', 'onChange'> {
    __staticSelector?: string;
    maxValue: number;
    overlays: React.CSSProperties[];
    round: boolean;
    thumbColor?: string;
}
export type ColorSliderFactory = Factory<{
    props: ColorSliderProps;
    ref: HTMLDivElement;
    stylesNames: ColorSliderStylesNames;
}>;
export declare const ColorSlider: import("../../..").MantineComponent<{
    props: ColorSliderProps;
    ref: HTMLDivElement;
    stylesNames: ColorSliderStylesNames;
}>;
