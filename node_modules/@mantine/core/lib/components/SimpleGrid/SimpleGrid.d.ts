import { BoxProps, ElementProps, Factory, MantineSpacing, StyleProp, StylesApiProps } from '../../core';
export type SimpleGridStylesNames = 'root' | 'container';
export interface SimpleGridProps extends BoxProps, StylesApiProps<SimpleGridFactory>, ElementProps<'div'> {
    /** Number of columns @default `1` */
    cols?: StyleProp<number>;
    /** Spacing between columns @default `'md'` */
    spacing?: StyleProp<MantineSpacing>;
    /** Spacing between rows @default `'md'` */
    verticalSpacing?: StyleProp<MantineSpacing>;
    /** Determines typeof of queries that are used for responsive styles @default `'media'` */
    type?: 'media' | 'container';
}
export type SimpleGridFactory = Factory<{
    props: SimpleGridProps;
    ref: HTMLDivElement;
    stylesNames: SimpleGridStylesNames;
}>;
export declare const SimpleGrid: import("../..").MantineComponent<{
    props: SimpleGridProps;
    ref: HTMLDivElement;
    stylesNames: SimpleGridStylesNames;
}>;
