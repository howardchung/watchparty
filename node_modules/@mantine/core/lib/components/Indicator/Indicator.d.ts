import { BoxProps, ElementProps, Factory, MantineColor, MantineRadius, StylesApiProps } from '../../core';
import { IndicatorPosition } from './Indicator.types';
export type IndicatorPositionVariables = '--indicator-top' | '--indicator-bottom' | '--indicator-left' | '--indicator-right' | '--indicator-translate-x' | '--indicator-translate-y';
export type IndicatorStylesNames = 'root' | 'indicator';
export type IndicatorCssVariables = {
    root: '--indicator-color' | '--indicator-text-color' | '--indicator-size' | '--indicator-radius' | '--indicator-z-index' | IndicatorPositionVariables;
};
export interface IndicatorProps extends BoxProps, StylesApiProps<IndicatorFactory>, ElementProps<'div'> {
    /** Indicator position relative to the target element @default `'top-end'` */
    position?: IndicatorPosition;
    /** Indicator offset relative to the target element, usually used for elements with border-radius */
    offset?: number;
    /** Determines whether the indicator container should be an inline element @default `false` */
    inline?: boolean;
    /** Indicator width and height @default `10` */
    size?: number | string;
    /** Label displayed inside the indicator, for example, notification count */
    label?: React.ReactNode;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius` @default `100` */
    radius?: MantineRadius;
    /** Key of `theme.colors` or any valid CSS color value @default `theme.primaryColor` */
    color?: MantineColor;
    /** Adds border to the root element */
    withBorder?: boolean;
    /** If set, the indicator is hidden */
    disabled?: boolean;
    /** If set, the indicator has processing animation @default `false` */
    processing?: boolean;
    /** Indicator z-index @default `200` */
    zIndex?: string | number;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
}
export type IndicatorFactory = Factory<{
    props: IndicatorProps;
    ref: HTMLDivElement;
    stylesNames: IndicatorStylesNames;
    vars: IndicatorCssVariables;
}>;
export declare const Indicator: import("../..").MantineComponent<{
    props: IndicatorProps;
    ref: HTMLDivElement;
    stylesNames: IndicatorStylesNames;
    vars: IndicatorCssVariables;
}>;
