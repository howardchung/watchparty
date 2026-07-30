import { BoxProps, ElementProps, Factory, MantineColor, MantineSize, StylesApiProps } from '../../core';
export type BurgerStylesNames = 'root' | 'burger';
export type BurgerCssVariables = {
    root: '--burger-color' | '--burger-size' | '--burger-line-size' | '--burger-transition-duration' | '--burger-transition-timing-function';
};
export interface BurgerProps extends BoxProps, StylesApiProps<BurgerFactory>, ElementProps<'button'> {
    /** Controls burger `width` and `height`, numbers are converted to rem @default `'md'` */
    size?: MantineSize | (string & {}) | number;
    /** Controls height of lines, by default calculated based on `size` prop */
    lineSize?: string | number;
    /** Key of `theme.colors` of any valid CSS value, by default `theme.white` in dark color scheme and `theme.black` in light */
    color?: MantineColor;
    /** State of the burger, when `true` burger is transformed into X @default `false` */
    opened?: boolean;
    /** `transition-duration` property value in ms @default `300` */
    transitionDuration?: number;
    /** `transition-timing-function` property value @default `'ease'` */
    transitionTimingFunction?: string;
}
export type BurgerFactory = Factory<{
    props: BurgerProps;
    ref: HTMLButtonElement;
    stylesNames: BurgerStylesNames;
    vars: BurgerCssVariables;
}>;
export declare const Burger: import("../..").MantineComponent<{
    props: BurgerProps;
    ref: HTMLButtonElement;
    stylesNames: BurgerStylesNames;
    vars: BurgerCssVariables;
}>;
