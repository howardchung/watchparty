import { BoxProps, CompoundStylesApiProps, ElementProps, Factory, StyleProp } from '../../../core';
export type GridColStylesNames = 'col';
export type ColSpan = number | 'auto' | 'content';
export interface GridColProps extends BoxProps, CompoundStylesApiProps<GridColFactory>, ElementProps<'div'> {
    /** Column span @default `12` */
    span?: StyleProp<ColSpan>;
    /** Column order, can be used to reorder columns at different viewport sizes */
    order?: StyleProp<number>;
    /** Column offset on the left side – number of columns that are left empty before this column */
    offset?: StyleProp<number>;
}
export type GridColFactory = Factory<{
    props: GridColProps;
    ref: HTMLDivElement;
    stylesNames: GridColStylesNames;
    compound: true;
}>;
export declare const GridCol: import("../../..").MantineComponent<{
    props: GridColProps;
    ref: HTMLDivElement;
    stylesNames: GridColStylesNames;
    compound: true;
}>;
