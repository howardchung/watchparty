import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
export type AspectRatioStylesNames = 'root';
export type AspectRatioCssVariables = {
    root: '--ar-ratio';
};
export interface AspectRatioProps extends BoxProps, StylesApiProps<AspectRatioFactory>, ElementProps<'div'> {
    /** Aspect ratio, for example, `16 / 9`, `4 / 3`, `1920 / 1080` @default `1` */
    ratio?: number;
}
export type AspectRatioFactory = Factory<{
    props: AspectRatioProps;
    ref: HTMLDivElement;
    stylesNames: AspectRatioStylesNames;
    vars: AspectRatioCssVariables;
}>;
export declare const AspectRatio: import("../..").MantineComponent<{
    props: AspectRatioProps;
    ref: HTMLDivElement;
    stylesNames: AspectRatioStylesNames;
    vars: AspectRatioCssVariables;
}>;
