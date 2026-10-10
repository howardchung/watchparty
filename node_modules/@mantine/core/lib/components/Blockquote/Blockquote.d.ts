import { BoxProps, ElementProps, Factory, MantineColor, MantineRadius, StylesApiProps } from '../../core';
export type BlockquoteStylesNames = 'root' | 'icon' | 'cite';
export type BlockquoteCssVariables = {
    root: '--bq-bg-light' | '--bq-bg-dark' | '--bq-bd' | '--bq-icon-size' | '--bq-radius';
};
export interface BlockquoteProps extends BoxProps, StylesApiProps<BlockquoteFactory>, ElementProps<'blockquote', 'cite'> {
    /** Blockquote icon, displayed at the top left side */
    icon?: React.ReactNode;
    /** Controls icon `width` and `height`, numbers are converted to rem @default `40` */
    iconSize?: number | string;
    /** Key of `theme.colors` or any valid CSS color @default `theme.primaryColor` */
    color?: MantineColor;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius` @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Reference to a cited quote */
    cite?: React.ReactNode;
}
export type BlockquoteFactory = Factory<{
    props: BlockquoteProps;
    ref: HTMLQuoteElement;
    stylesNames: BlockquoteStylesNames;
    vars: BlockquoteCssVariables;
}>;
export declare const Blockquote: import("../..").MantineComponent<{
    props: BlockquoteProps;
    ref: HTMLQuoteElement;
    stylesNames: BlockquoteStylesNames;
    vars: BlockquoteCssVariables;
}>;
