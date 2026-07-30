import { BoxProps, ElementProps, Factory, MantineColor, MantineSpacing, StylesApiProps } from '../../core';
import { TableCaption, TableTbody, TableTd, TableTfoot, TableTh, TableThead, TableTr } from './Table.components';
import { TableDataRenderer } from './TableDataRenderer';
import { TableScrollContainer } from './TableScrollContainer';
export type TableVariant = 'default' | 'vertical';
export type TableStylesNames = 'table' | 'thead' | 'tbody' | 'tfoot' | 'tr' | 'th' | 'td' | 'caption';
export type TableCssVariables = {
    table: '--table-layout' | '--table-border-color' | '--table-caption-side' | '--table-horizontal-spacing' | '--table-vertical-spacing' | '--table-striped-color' | '--table-highlight-on-hover-color' | '--table-sticky-header-offset';
};
export interface TableData {
    head?: React.ReactNode[];
    body?: React.ReactNode[][];
    foot?: React.ReactNode[];
    caption?: string;
}
export interface TableProps extends BoxProps, StylesApiProps<TableFactory>, ElementProps<'table'> {
    /** Value of `table-layout` style @default `auto` */
    layout?: React.CSSProperties['tableLayout'];
    /** Side of the `Table.Caption` @default `bottom` */
    captionSide?: 'top' | 'bottom';
    /** Color of table borders, key of `theme.colors` or any valid CSS color */
    borderColor?: MantineColor;
    /** If set, the table has the outer border @default `false` */
    withTableBorder?: boolean;
    /** If set, the table has borders between columns @default `false` */
    withColumnBorders?: boolean;
    /** If set, the table has borders between rows @default `true` */
    withRowBorders?: boolean;
    /** Horizontal cells spacing, key of `theme.spacing` or any valid CSS value for padding, numbers are converted to rem @default `xs` */
    horizontalSpacing?: MantineSpacing;
    /** Vertical cells spacing, key of `theme.spacing` or any valid CSS value for padding, numbers are converted to rem @default `xs` */
    verticalSpacing?: MantineSpacing;
    /** If set, every odd/even row background changes to `strippedColor`, if set to `true`, then `odd` value will be used @default `false`  */
    striped?: boolean | 'odd' | 'even';
    /** Background color of striped rows, key of `theme.colors` or any valid CSS color */
    stripedColor?: MantineColor;
    /** If set, table rows background changes to `highlightOnHoverColor` when hovered @default `false` */
    highlightOnHover?: boolean;
    /** Background color of table rows when hovered, key of `theme.colors` or any valid CSS color */
    highlightOnHoverColor?: MantineColor;
    /** Data used to generate table, ignored if `children` prop is set */
    data?: TableData;
    /** If set, `Table.Thead` is sticky @default `false` */
    stickyHeader?: boolean;
    /** Offset from top at which `Table.Thead` should become sticky @default `0` */
    stickyHeaderOffset?: number | string;
    /** If set, `font-variant-numeric: tabular-nums` style is applied @default `false` */
    tabularNums?: boolean;
}
export type TableFactory = Factory<{
    props: TableProps;
    ref: HTMLTableElement;
    stylesNames: TableStylesNames;
    vars: TableCssVariables;
    variant: TableVariant;
    staticComponents: {
        Thead: typeof TableThead;
        Tbody: typeof TableTbody;
        Tfoot: typeof TableTfoot;
        Td: typeof TableTd;
        Th: typeof TableTh;
        Tr: typeof TableTr;
        Caption: typeof TableCaption;
        ScrollContainer: typeof TableScrollContainer;
        DataRenderer: typeof TableDataRenderer;
    };
}>;
export declare const Table: import("../..").MantineComponent<{
    props: TableProps;
    ref: HTMLTableElement;
    stylesNames: TableStylesNames;
    vars: TableCssVariables;
    variant: TableVariant;
    staticComponents: {
        Thead: typeof TableThead;
        Tbody: typeof TableTbody;
        Tfoot: typeof TableTfoot;
        Td: typeof TableTd;
        Th: typeof TableTh;
        Tr: typeof TableTr;
        Caption: typeof TableCaption;
        ScrollContainer: typeof TableScrollContainer;
        DataRenderer: typeof TableDataRenderer;
    };
}>;
