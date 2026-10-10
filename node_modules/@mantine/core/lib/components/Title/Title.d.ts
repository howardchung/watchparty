import { BoxProps, ElementProps, Factory, MantineFontSize, StylesApiProps } from '../../core';
export type TitleOrder = 1 | 2 | 3 | 4 | 5 | 6;
export type TitleSize = `h${TitleOrder}` | React.CSSProperties['fontSize'] | MantineFontSize;
export type TitleStylesNames = 'root';
export type TitleCssVariables = {
    root: '--title-fw' | '--title-lh' | '--title-fz' | '--title-line-clamp' | '--title-text-wrap';
};
export interface TitleProps extends BoxProps, StylesApiProps<TitleFactory>, ElementProps<'h1', 'color'> {
    /** Heading order (1-6), controls `font-size` style if `size` prop is not set @default `1` */
    order?: TitleOrder;
    /** Changes title size, if not set, then size is controlled by `order` prop */
    size?: TitleSize;
    /** Number of lines after which heading will be truncated */
    lineClamp?: number;
    /** Heading `text-wrap` CSS property @default `'wrap'` */
    textWrap?: 'wrap' | 'nowrap' | 'balance' | 'pretty' | 'stable';
}
export type TitleFactory = Factory<{
    props: TitleProps;
    ref: HTMLHeadingElement;
    stylesNames: TitleStylesNames;
    vars: TitleCssVariables;
}>;
export declare const Title: import("../..").MantineComponent<{
    props: TitleProps;
    ref: HTMLHeadingElement;
    stylesNames: TitleStylesNames;
    vars: TitleCssVariables;
}>;
