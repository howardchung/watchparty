import { BoxProps, ElementProps, Factory, MantineSpacing, StylesApiProps } from '../../core';
export type StackStylesNames = 'root';
export type StackCssVariables = {
    root: '--stack-gap' | '--stack-align' | '--stack-justify';
};
export interface StackProps extends BoxProps, StylesApiProps<StackFactory>, ElementProps<'div'> {
    /** Key of `theme.spacing` or any valid CSS value to set `gap` property, numbers are converted to rem @default `'md'` */
    gap?: MantineSpacing;
    /** Controls `align-items` CSS property @default `'stretch'` */
    align?: React.CSSProperties['alignItems'];
    /** Controls `justify-content` CSS property @default `'flex-start'` */
    justify?: React.CSSProperties['justifyContent'];
}
export type StackFactory = Factory<{
    props: StackProps;
    ref: HTMLDivElement;
    stylesNames: StackStylesNames;
    vars: StackCssVariables;
}>;
export declare const Stack: import("../..").MantineComponent<{
    props: StackProps;
    ref: HTMLDivElement;
    stylesNames: StackStylesNames;
    vars: StackCssVariables;
}>;
