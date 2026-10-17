import { BoxProps, ElementProps, Factory, MantineColor, MantineSize, StylesApiProps } from '../../../core';
export type ComboboxChevronStylesNames = 'chevron';
export type ComboboxChevronCSSVariables = {
    chevron: '--combobox-chevron-size' | '--combobox-chevron-color';
};
export interface ComboboxChevronProps extends BoxProps, StylesApiProps<ComboboxChevronFactory>, ElementProps<'svg', 'opacity' | 'display'> {
    size?: MantineSize | (string & {});
    error?: React.ReactNode;
    color?: MantineColor;
}
export type ComboboxChevronFactory = Factory<{
    props: ComboboxChevronProps;
    ref: SVGSVGElement;
    stylesNames: ComboboxChevronStylesNames;
    vars: ComboboxChevronCSSVariables;
}>;
export declare const ComboboxChevron: import("../../..").MantineComponent<{
    props: ComboboxChevronProps;
    ref: SVGSVGElement;
    stylesNames: ComboboxChevronStylesNames;
    vars: ComboboxChevronCSSVariables;
}>;
