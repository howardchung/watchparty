import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type ComboboxGroupStylesNames = 'group' | 'groupLabel';
export interface ComboboxGroupProps extends BoxProps, CompoundStylesApiProps<ComboboxGroupFactory>, ElementProps<'div'> {
    /** Group label */
    label?: React.ReactNode;
}
export type ComboboxGroupFactory = Factory<{
    props: ComboboxGroupProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxGroupStylesNames;
    compound: true;
}>;
export declare const ComboboxGroup: import("../../..").MantineComponent<{
    props: ComboboxGroupProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxGroupStylesNames;
    compound: true;
}>;
