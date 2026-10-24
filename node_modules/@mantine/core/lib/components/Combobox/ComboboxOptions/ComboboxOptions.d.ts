import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type ComboboxOptionsStylesNames = 'options';
export interface ComboboxOptionsProps extends BoxProps, CompoundStylesApiProps<ComboboxOptionsFactory>, ElementProps<'div'> {
    /** Id of the element that labels the options list */
    labelledBy?: string;
}
export type ComboboxOptionsFactory = Factory<{
    props: ComboboxOptionsProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxOptionsStylesNames;
    compound: true;
}>;
export declare const ComboboxOptions: import("../../..").MantineComponent<{
    props: ComboboxOptionsProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxOptionsStylesNames;
    compound: true;
}>;
