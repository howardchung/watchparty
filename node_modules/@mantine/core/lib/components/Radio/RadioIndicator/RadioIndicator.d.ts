import { BoxProps, ElementProps, Factory, MantineColor, MantineRadius, MantineSize, StylesApiProps } from '../../../core';
import { RadioIconProps } from '../RadioIcon';
export type RadioIndicatorStylesNames = 'indicator' | 'icon';
export type RadioIndicatorVariant = 'filled' | 'outline';
export type RadioIndicatorCssVariables = {
    indicator: '--radio-size' | '--radio-radius' | '--radio-color' | '--radio-icon-color' | '--radio-icon-size';
};
export interface RadioIndicatorProps extends BoxProps, StylesApiProps<RadioIndicatorFactory>, ElementProps<'div'> {
    /** Key of `theme.colors` or any valid CSS color to set input background color in checked state @default `theme.primaryColor` */
    color?: MantineColor;
    /** Controls size of the component @default `'sm'` */
    size?: MantineSize | (string & {});
    /** Key of `theme.radius` or any valid CSS value to set `border-radius,` @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Key of `theme.colors` or any valid CSS color to set icon color, by default value depends on `theme.autoContrast` */
    iconColor?: MantineColor;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
    /** A component that replaces default check icon */
    icon?: React.FC<RadioIconProps>;
    /** Checked state */
    checked?: boolean;
    /** Disabled state */
    disabled?: boolean;
}
export type RadioIndicatorFactory = Factory<{
    props: RadioIndicatorProps;
    ref: HTMLDivElement;
    stylesNames: RadioIndicatorStylesNames;
    vars: RadioIndicatorCssVariables;
    variant: RadioIndicatorVariant;
}>;
export declare const RadioIndicator: import("../../..").MantineComponent<{
    props: RadioIndicatorProps;
    ref: HTMLDivElement;
    stylesNames: RadioIndicatorStylesNames;
    vars: RadioIndicatorCssVariables;
    variant: RadioIndicatorVariant;
}>;
