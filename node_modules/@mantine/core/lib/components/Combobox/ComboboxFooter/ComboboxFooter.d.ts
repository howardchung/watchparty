import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type ComboboxFooterStylesNames = 'footer';
export interface ComboboxFooterProps extends BoxProps, CompoundStylesApiProps<ComboboxFooterFactory>, ElementProps<'div'> {
}
export type ComboboxFooterFactory = Factory<{
    props: ComboboxFooterProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxFooterStylesNames;
    compound: true;
}>;
export declare const ComboboxFooter: import("../../..").MantineComponent<{
    props: ComboboxFooterProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxFooterStylesNames;
    compound: true;
}>;
