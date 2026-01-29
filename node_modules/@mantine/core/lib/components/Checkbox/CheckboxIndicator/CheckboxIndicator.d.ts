import { BoxProps, ElementProps, Factory, MantineColor, MantineRadius, MantineSize, StylesApiProps } from '../../../core';
export type CheckboxIndicatorStylesNames = 'indicator' | 'icon';
export type CheckboxIndicatorVariant = 'filled' | 'outline';
export type CheckboxIndicatorCssVariables = {
    indicator: '--checkbox-size' | '--checkbox-radius' | '--checkbox-color' | '--checkbox-icon-color';
};
export interface CheckboxIndicatorProps extends BoxProps, StylesApiProps<CheckboxIndicatorFactory>, ElementProps<'div'> {
    /** Key of `theme.colors` or any valid CSS color to set input background color in checked state @default `theme.primaryColor` */
    color?: MantineColor;
    /** Controls size of the component @default `'sm'` */
    size?: MantineSize | (string & {});
    /** Key of `theme.radius` or any valid CSS value to set `border-radius` @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Key of `theme.colors` or any valid CSS color to set icon color, by default value depends on `theme.autoContrast` */
    iconColor?: MantineColor;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
    /** Indeterminate state of the checkbox. If set, `checked` prop is ignored. */
    indeterminate?: boolean;
    /** Icon displayed when checkbox is in checked or indeterminate state */
    icon?: React.FC<{
        indeterminate: boolean | undefined;
        className: string;
    }>;
    /** Determines whether the component should have checked styles */
    checked?: boolean;
    /** Determines whether the component should have disabled styles */
    disabled?: boolean;
}
export type CheckboxIndicatorFactory = Factory<{
    props: CheckboxIndicatorProps;
    ref: HTMLDivElement;
    stylesNames: CheckboxIndicatorStylesNames;
    vars: CheckboxIndicatorCssVariables;
    variant: CheckboxIndicatorVariant;
}>;
export declare const CheckboxIndicator: import("../../..").MantineComponent<{
    props: CheckboxIndicatorProps;
    ref: HTMLDivElement;
    stylesNames: CheckboxIndicatorStylesNames;
    vars: CheckboxIndicatorCssVariables;
    variant: CheckboxIndicatorVariant;
}>;
