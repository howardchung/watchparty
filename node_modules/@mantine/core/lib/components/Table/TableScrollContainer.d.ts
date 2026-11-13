import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
import { ScrollAreaProps } from '../ScrollArea';
export type TableScrollContainerStylesNames = 'scrollContainer' | 'scrollContainerInner';
export type TableScrollContainerCssVariables = {
    scrollContainer: '--table-min-width' | '--table-max-height' | '--table-overflow';
};
export interface TableScrollContainerProps extends BoxProps, StylesApiProps<TableScrollContainerFactory>, ElementProps<'div'> {
    /** `min-width` of the `Table` at which it should become scrollable */
    minWidth: React.CSSProperties['minWidth'];
    /** `max-height` of the `Table` at which it should become scrollable */
    maxHeight?: React.CSSProperties['maxHeight'];
    /** Type of the scroll container, `native` to use native scrollbars, `scrollarea` to use `ScrollArea` component @default `'scrollarea'` */
    type?: 'native' | 'scrollarea';
    /** Props passed down to `ScrollArea` component, not applicable with `type="native"` */
    scrollAreaProps?: ScrollAreaProps;
}
export type TableScrollContainerFactory = Factory<{
    props: TableScrollContainerProps;
    ref: HTMLDivElement;
    stylesNames: TableScrollContainerStylesNames;
    vars: TableScrollContainerCssVariables;
}>;
export declare const TableScrollContainer: import("../..").MantineComponent<{
    props: TableScrollContainerProps;
    ref: HTMLDivElement;
    stylesNames: TableScrollContainerStylesNames;
    vars: TableScrollContainerCssVariables;
}>;
