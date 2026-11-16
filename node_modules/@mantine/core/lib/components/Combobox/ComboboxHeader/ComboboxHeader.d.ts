import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type ComboboxHeaderStylesNames = 'header';
export interface ComboboxHeaderProps extends BoxProps, CompoundStylesApiProps<ComboboxHeaderFactory>, ElementProps<'div'> {
}
export type ComboboxHeaderFactory = Factory<{
    props: ComboboxHeaderProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxHeaderStylesNames;
    compound: true;
}>;
export declare const ComboboxHeader: import("../../..").MantineComponent<{
    props: ComboboxHeaderProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxHeaderStylesNames;
    compound: true;
}>;
