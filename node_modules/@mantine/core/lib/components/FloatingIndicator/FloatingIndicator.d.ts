import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
export type FloatingIndicatorStylesNames = 'root';
export type FloatingIndicatorCssVariables = {
    root: '--transition-duration';
};
export interface FloatingIndicatorProps extends BoxProps, StylesApiProps<FloatingIndicatorFactory>, ElementProps<'div'> {
    /** Target element over which indicator is displayed */
    target: HTMLElement | null | undefined;
    /** Parent element with relative position based on which indicator position is calculated */
    parent: HTMLElement | null | undefined;
    /** Transition duration in ms @default `150` */
    transitionDuration?: number | string;
    /** If set, the indicator is displayed after transition ends.
     * Should be set if the component is used inside a container that has `transform: scale(n)` styles.
     * */
    displayAfterTransitionEnd?: boolean;
}
export type FloatingIndicatorFactory = Factory<{
    props: FloatingIndicatorProps;
    ref: HTMLDivElement;
    stylesNames: FloatingIndicatorStylesNames;
    vars: FloatingIndicatorCssVariables;
}>;
export declare const FloatingIndicator: import("../..").MantineComponent<{
    props: FloatingIndicatorProps;
    ref: HTMLDivElement;
    stylesNames: FloatingIndicatorStylesNames;
    vars: FloatingIndicatorCssVariables;
}>;
