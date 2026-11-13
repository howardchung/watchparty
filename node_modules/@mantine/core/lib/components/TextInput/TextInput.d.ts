import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
import { __BaseInputProps, __InputStylesNames, InputVariant } from '../Input';
export interface TextInputProps extends BoxProps, __BaseInputProps, StylesApiProps<TextInputFactory>, ElementProps<'input', 'size'> {
}
export type TextInputFactory = Factory<{
    props: TextInputProps;
    variant: InputVariant;
    ref: HTMLInputElement;
    stylesNames: __InputStylesNames;
}>;
export declare const TextInput: import("../..").MantineComponent<{
    props: TextInputProps;
    variant: InputVariant;
    ref: HTMLInputElement;
    stylesNames: __InputStylesNames;
}>;
