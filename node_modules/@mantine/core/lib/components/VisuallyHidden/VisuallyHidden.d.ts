import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
export type VisuallyHiddenStylesNames = 'root';
export interface VisuallyHiddenProps extends BoxProps, StylesApiProps<VisuallyHiddenFactory>, ElementProps<'div'> {
}
export type VisuallyHiddenFactory = Factory<{
    props: VisuallyHiddenProps;
    ref: HTMLDivElement;
    stylesNames: VisuallyHiddenStylesNames;
}>;
export declare const VisuallyHidden: import("../..").MantineComponent<{
    props: VisuallyHiddenProps;
    ref: HTMLDivElement;
    stylesNames: VisuallyHiddenStylesNames;
}>;
