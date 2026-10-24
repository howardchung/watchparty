import { BoxProps, ElementProps, Factory, MantineGradient, MantineRadius, MantineSize, StylesApiProps } from '../../../core';
import type { ButtonVariant } from '../Button';
export type ButtonGroupSectionStylesNames = 'groupSection';
export type ButtonGroupSectionCssVariables = {
    groupSection: '--section-radius' | '--section-bg' | '--section-color' | '--section-bd' | '--section-height' | '--section-padding-x' | '--section-fz';
};
export interface ButtonGroupSectionProps extends BoxProps, StylesApiProps<ButtonGroupSectionFactory>, ElementProps<'div'> {
    /** Key of `theme.radius` or any valid CSS value to set `border-radius` @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Gradient configuration used when `variant="gradient"` @default `theme.defaultGradient` */
    gradient?: MantineGradient;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
    /** Controls section `height`, `font-size` and horizontal `padding` @default `'sm'` */
    size?: MantineSize | `compact-${MantineSize}` | (string & {});
}
export type ButtonGroupSectionFactory = Factory<{
    props: ButtonGroupSectionProps;
    ref: HTMLDivElement;
    stylesNames: ButtonGroupSectionStylesNames;
    vars: ButtonGroupSectionCssVariables;
    variant: ButtonVariant;
}>;
export declare const ButtonGroupSection: import("../../..").MantineComponent<{
    props: ButtonGroupSectionProps;
    ref: HTMLDivElement;
    stylesNames: ButtonGroupSectionStylesNames;
    vars: ButtonGroupSectionCssVariables;
    variant: ButtonVariant;
}>;
