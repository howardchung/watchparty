import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../../core';
export type InputPlaceholderStylesNames = 'placeholder';
export interface InputPlaceholderProps extends BoxProps, StylesApiProps<InputPlaceholderFactory>, ElementProps<'span'> {
    __staticSelector?: string;
    /** If set, the placeholder has error styles @default `false` */
    error?: React.ReactNode;
}
export type InputPlaceholderFactory = Factory<{
    props: InputPlaceholderProps;
    ref: HTMLSpanElement;
    stylesNames: InputPlaceholderStylesNames;
}>;
export declare const InputPlaceholder: import("../../..").MantineComponent<{
    props: InputPlaceholderProps;
    ref: HTMLSpanElement;
    stylesNames: InputPlaceholderStylesNames;
}>;
