import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
import { __BaseInputProps, __InputStylesNames } from '../Input';
import { PillsInputField } from './PillsInputField/PillsInputField';
export interface PillsInputProps extends BoxProps, __BaseInputProps, StylesApiProps<PillsInputFactory>, ElementProps<'div', 'size'> {
    __stylesApiProps?: Record<string, any>;
    __staticSelector?: string;
}
export type PillsInputFactory = Factory<{
    props: PillsInputProps;
    ref: HTMLInputElement;
    stylesNames: __InputStylesNames;
    staticComponents: {
        Field: typeof PillsInputField;
    };
}>;
export declare const PillsInput: import("../..").MantineComponent<{
    props: PillsInputProps;
    ref: HTMLInputElement;
    stylesNames: __InputStylesNames;
    staticComponents: {
        Field: typeof PillsInputField;
    };
}>;
