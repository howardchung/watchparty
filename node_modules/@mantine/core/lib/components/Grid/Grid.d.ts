import { BoxProps, ElementProps, Factory, MantineSpacing, StyleProp, StylesApiProps } from '../../core';
import { GridBreakpoints } from './Grid.context';
import { GridCol } from './GridCol/GridCol';
export type GridStylesNames = 'root' | 'col' | 'inner' | 'container';
export type GridCssVariables = {
    root: '--grid-justify' | '--grid-align' | '--grid-overflow';
};
export interface GridProps extends BoxProps, StylesApiProps<GridFactory>, ElementProps<'div'> {
    /** Gutter between columns, key of `theme.spacing` or any valid CSS value @default `'md'` */
    gutter?: StyleProp<MantineSpacing>;
    /** If set, columns in the last row expand to fill all available space @default `false` */
    grow?: boolean;
    /** Sets `justify-content` @default `flex-start` */
    justify?: React.CSSProperties['justifyContent'];
    /** Sets `align-items` @default `stretch` */
    align?: React.CSSProperties['alignItems'];
    /** Number of columns in each row @default `12` */
    columns?: number;
    /** Sets `overflow` CSS property on the root element @default `'visible'` */
    overflow?: React.CSSProperties['overflow'];
    /** Type of queries used for responsive styles @default `'media'` */
    type?: 'media' | 'container';
    /** Breakpoints values, only used with `type="container"` */
    breakpoints?: GridBreakpoints;
}
export type GridFactory = Factory<{
    props: GridProps;
    ref: HTMLDivElement;
    stylesNames: GridStylesNames;
    vars: GridCssVariables;
    staticComponents: {
        Col: typeof GridCol;
    };
}>;
export declare const Grid: import("../..").MantineComponent<{
    props: GridProps;
    ref: HTMLDivElement;
    stylesNames: GridStylesNames;
    vars: GridCssVariables;
    staticComponents: {
        Col: typeof GridCol;
    };
}>;
