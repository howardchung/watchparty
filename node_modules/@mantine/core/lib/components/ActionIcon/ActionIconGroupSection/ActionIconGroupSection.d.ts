import { BoxProps, ElementProps, Factory, MantineGradient, MantineRadius, MantineSize, StylesApiProps } from '../../../core';
import type { ActionIconVariant } from '../ActionIcon';
export type ActionIconGroupSectionStylesNames = 'groupSection';
export type ActionIconGroupSectionCssVariables = {
    groupSection: '--section-radius' | '--section-bg' | '--section-color' | '--section-bd' | '--section-height' | '--section-padding-x' | '--section-fz';
};
export interface ActionIconGroupSectionProps extends BoxProps, StylesApiProps<ActionIconGroupSectionFactory>, ElementProps<'div'> {
    /** Key of `theme.radius` or any valid CSS value to set `border-radius` @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Gradient values used with `variant="gradient"`. @default `theme.defaultGradient` */
    gradient?: MantineGradient;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
    /** Controls section `height`, `font-size` and horizontal `padding` @default `'sm'` */
    size?: MantineSize | (string & {}) | number;
}
export type ActionIconGroupSectionFactory = Factory<{
    props: ActionIconGroupSectionProps;
    ref: HTMLDivElement;
    stylesNames: ActionIconGroupSectionStylesNames;
    vars: ActionIconGroupSectionCssVariables;
    variant: ActionIconVariant;
}>;
export declare const ActionIconGroupSection: import("../../..").MantineComponent<{
    props: ActionIconGroupSectionProps;
    ref: HTMLDivElement;
    stylesNames: ActionIconGroupSectionStylesNames;
    vars: ActionIconGroupSectionCssVariables;
    variant: ActionIconVariant;
}>;
