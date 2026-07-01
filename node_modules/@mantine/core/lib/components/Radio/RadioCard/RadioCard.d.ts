import { BoxProps, ElementProps, Factory, MantineRadius, StylesApiProps } from '../../../core';
export type RadioCardStylesNames = 'card';
export type RadioCardCssVariables = {
    card: '--card-radius';
};
export interface RadioCardProps extends BoxProps, StylesApiProps<RadioCardFactory>, ElementProps<'button', 'onChange'> {
    /** Checked state */
    checked?: boolean;
    /** Adds border to the root element */
    withBorder?: boolean;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius`, numbers are converted to rem @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Value of the checkbox, used with `Radio.Group` */
    value?: string;
    /** Value used to associate all related radio cards, required for accessibility if used outside of `Radio.Group` */
    name?: string;
}
export type RadioCardFactory = Factory<{
    props: RadioCardProps;
    ref: HTMLButtonElement;
    stylesNames: RadioCardStylesNames;
    vars: RadioCardCssVariables;
}>;
export declare const RadioCard: import("../../..").MantineComponent<{
    props: RadioCardProps;
    ref: HTMLButtonElement;
    stylesNames: RadioCardStylesNames;
    vars: RadioCardCssVariables;
}>;
