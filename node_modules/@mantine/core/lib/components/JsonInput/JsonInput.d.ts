import { Factory } from '../../core';
import { __InputStylesNames } from '../Input';
import { TextareaProps } from '../Textarea';
export interface JsonInputProps extends Omit<TextareaProps, 'onChange'> {
    /** Controlled component value */
    value?: string;
    /** Uncontrolled component default value */
    defaultValue?: string;
    /** Called when value changes */
    onChange?: (value: string) => void;
    /** Determines whether the value should be formatted on blur @default `false` */
    formatOnBlur?: boolean;
    /** Error message displayed when value is not valid JSON */
    validationError?: React.ReactNode;
    /** Function to serialize value into a string, used for value formatting @default `JSON.stringify` */
    serialize?: typeof JSON.stringify;
    /** Function to deserialize string value, used for value formatting and input JSON validation, must throw error if string cannot be processed @default `JSON.parse` */
    deserialize?: typeof JSON.parse;
}
export type JsonInputFactory = Factory<{
    props: JsonInputProps;
    ref: HTMLTextAreaElement;
    stylesNames: __InputStylesNames;
}>;
export declare const JsonInput: import("../..").MantineComponent<{
    props: JsonInputProps;
    ref: HTMLTextAreaElement;
    stylesNames: __InputStylesNames;
}>;
