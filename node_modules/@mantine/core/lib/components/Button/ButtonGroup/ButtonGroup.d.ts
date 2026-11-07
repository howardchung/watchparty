import { BoxProps, Factory, StylesApiProps } from '../../../core';
export type ButtonGroupStylesNames = 'group';
export type ButtonGroupCssVariables = {
    group: '--button-border-width';
};
export interface ButtonGroupProps extends BoxProps, StylesApiProps<ButtonGroupFactory> {
    /** `Button` components */
    children?: React.ReactNode;
    /** Orientation of the group @default `horizontal` */
    orientation?: 'horizontal' | 'vertical';
    /** `border-width` of the child `Button` components. Numbers are converted to rem. @default `1` */
    borderWidth?: number | string;
}
export type ButtonGroupFactory = Factory<{
    props: ButtonGroupProps;
    ref: HTMLDivElement;
    stylesNames: ButtonGroupStylesNames;
    vars: ButtonGroupCssVariables;
}>;
export declare const ButtonGroup: import("../../..").MantineComponent<{
    props: ButtonGroupProps;
    ref: HTMLDivElement;
    stylesNames: ButtonGroupStylesNames;
    vars: ButtonGroupCssVariables;
}>;
