import { BoxProps, ElementProps, Factory, MantineRadius, MantineSize, StylesApiProps } from '../../../core';
export type ProgressRootStylesNames = 'root' | 'section' | 'label';
export type ProgressRootCssVariables = {
    root: '--progress-size' | '--progress-radius' | '--progress-transition-duration';
};
export interface __ProgressRootProps extends BoxProps, ElementProps<'div'> {
    /** Controls track height @default `'md'` */
    size?: MantineSize | (string & {}) | number;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius` @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
    /** Controls sections width transition duration, value is specified in ms @default `100` */
    transitionDuration?: number;
    /** Controls orientation @default `'horizontal'` */
    orientation?: 'horizontal' | 'vertical';
}
export interface ProgressRootProps extends __ProgressRootProps, StylesApiProps<ProgressRootFactory> {
}
export type ProgressRootFactory = Factory<{
    props: ProgressRootProps;
    ref: HTMLDivElement;
    stylesNames: ProgressRootStylesNames;
    vars: ProgressRootCssVariables;
}>;
export declare const ProgressRoot: import("../../..").MantineComponent<{
    props: ProgressRootProps;
    ref: HTMLDivElement;
    stylesNames: ProgressRootStylesNames;
    vars: ProgressRootCssVariables;
}>;
