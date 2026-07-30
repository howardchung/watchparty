import { BoxProps, ElementProps, Factory, MantineFontSize, StylesApiProps } from '../../../core';
export type InputErrorStylesNames = 'error';
export type InputErrorCssVariables = {
    error: '--input-error-size';
};
export interface InputErrorProps extends BoxProps, StylesApiProps<InputErrorFactory>, ElementProps<'div'> {
    __staticSelector?: string;
    __inheritStyles?: boolean;
    /** Controls error `font-size` @default `'sm'` */
    size?: MantineFontSize;
}
export type InputErrorFactory = Factory<{
    props: InputErrorProps;
    ref: HTMLParagraphElement;
    stylesNames: InputErrorStylesNames;
    vars: InputErrorCssVariables;
}>;
export declare const InputError: import("../../..").MantineComponent<{
    props: InputErrorProps;
    ref: HTMLParagraphElement;
    stylesNames: InputErrorStylesNames;
    vars: InputErrorCssVariables;
}>;
