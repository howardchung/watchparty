import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
export type TypographyStylesNames = 'root';
export interface TypographyProps extends BoxProps, StylesApiProps<TypographyFactory>, ElementProps<'div'> {
}
export type TypographyFactory = Factory<{
    props: TypographyProps;
    ref: HTMLDivElement;
    stylesNames: TypographyStylesNames;
}>;
export declare const Typography: import("../..").MantineComponent<{
    props: TypographyProps;
    ref: HTMLDivElement;
    stylesNames: TypographyStylesNames;
}>;
