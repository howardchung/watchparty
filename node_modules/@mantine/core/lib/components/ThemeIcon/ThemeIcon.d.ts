import { BoxProps, ElementProps, Factory, MantineColor, MantineGradient, MantineRadius, MantineSize, StylesApiProps } from '../../core';
export type ThemeIconStylesNames = 'root';
export type ThemeIconVariant = 'filled' | 'light' | 'outline' | 'transparent' | 'white' | 'default' | 'gradient';
export type ThemeIconCssVariables = {
    root: '--ti-radius' | '--ti-size' | '--ti-bg' | '--ti-color' | '--ti-bd';
};
export interface ThemeIconProps extends BoxProps, StylesApiProps<ThemeIconFactory>, ElementProps<'div'> {
    /** Controls width and height of the button. Numbers are converted to rem. @default `'md'` */
    size?: MantineSize | (string & {}) | number;
    /** Key of `theme.colors` or any valid CSS color. @default `theme.primaryColor` */
    color?: MantineColor;
    /** Key of `theme.radius` or any valid CSS value to set border-radius. Numbers are converted to rem. @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Gradient data used when `variant="gradient"` @default `theme.defaultGradient` */
    gradient?: MantineGradient;
    /** Icon displayed inside the component */
    children?: React.ReactNode;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
}
export type ThemeIconFactory = Factory<{
    props: ThemeIconProps;
    ref: HTMLDivElement;
    stylesNames: ThemeIconStylesNames;
    vars: ThemeIconCssVariables;
    variant: ThemeIconVariant;
}>;
export declare const ThemeIcon: import("../..").MantineComponent<{
    props: ThemeIconProps;
    ref: HTMLDivElement;
    stylesNames: ThemeIconStylesNames;
    vars: ThemeIconCssVariables;
    variant: ThemeIconVariant;
}>;
