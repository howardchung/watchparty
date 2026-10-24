import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
import { ComboboxData } from '../Combobox';
import { __BaseInputProps, __InputStylesNames } from '../Input';
export interface NativeSelectProps extends BoxProps, Omit<__BaseInputProps, 'pointer'>, StylesApiProps<NativeSelectFactory>, ElementProps<'select', 'size'> {
    /** Data used to render options, can be replaced with `children` */
    data?: ComboboxData;
}
export type NativeSelectFactory = Factory<{
    props: NativeSelectProps;
    ref: HTMLSelectElement;
    stylesNames: __InputStylesNames;
}>;
export declare const NativeSelect: import("../..").MantineComponent<{
    props: NativeSelectProps;
    ref: HTMLSelectElement;
    stylesNames: __InputStylesNames;
}>;
