import { BoxProps, ElementProps, Factory, MantineRadius, StylesApiProps } from '../../../core';
export type CheckboxCardStylesNames = 'card';
export type CheckboxCardCssVariables = {
    card: '--card-radius';
};
export interface CheckboxCardProps extends BoxProps, StylesApiProps<CheckboxCardFactory>, ElementProps<'button', 'onChange'> {
    /** Controlled component value */
    checked?: boolean;
    /** Uncontrolled component default value */
    defaultChecked?: boolean;
    /** Called when value changes */
    onChange?: (checked: boolean) => void;
    /** Adds border to the root element */
    withBorder?: boolean;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius`, numbers are converted to rem @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Value of the checkbox, used with `Checkbox.Group` */
    value?: string;
}
export type CheckboxCardFactory = Factory<{
    props: CheckboxCardProps;
    ref: HTMLButtonElement;
    stylesNames: CheckboxCardStylesNames;
    vars: CheckboxCardCssVariables;
}>;
export declare const CheckboxCard: import("../../..").MantineComponent<{
    props: CheckboxCardProps;
    ref: HTMLButtonElement;
    stylesNames: CheckboxCardStylesNames;
    vars: CheckboxCardCssVariables;
}>;
