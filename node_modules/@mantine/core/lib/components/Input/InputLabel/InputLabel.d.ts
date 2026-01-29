import { BoxProps, ElementProps, Factory, MantineFontSize, StylesApiProps } from '../../../core';
export type InputLabelStylesNames = 'label' | 'required';
export type InputLabelCssVariables = {
    label: '--input-asterisk-color' | '--input-label-size';
};
export interface InputLabelProps extends BoxProps, StylesApiProps<InputLabelFactory>, ElementProps<'label'> {
    __staticSelector?: string;
    /** If set, the required asterisk is displayed next to the label */
    required?: boolean;
    /** Controls label `font-size` @default `'sm'` */
    size?: MantineFontSize;
    /** Root element of the label @default `'label'` */
    labelElement?: 'label' | 'div';
}
export type InputLabelFactory = Factory<{
    props: InputLabelProps;
    ref: HTMLLabelElement;
    stylesNames: InputLabelStylesNames;
    vars: InputLabelCssVariables;
}>;
export declare const InputLabel: import("../../..").MantineComponent<{
    props: InputLabelProps;
    ref: HTMLLabelElement;
    stylesNames: InputLabelStylesNames;
    vars: InputLabelCssVariables;
}>;
