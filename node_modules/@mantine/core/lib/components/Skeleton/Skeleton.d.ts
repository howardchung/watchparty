import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
export type SkeletonStylesNames = 'root';
export type SkeletonCssVariables = {
    root: '--skeleton-width' | '--skeleton-height' | '--skeleton-radius';
};
export interface SkeletonProps extends BoxProps, StylesApiProps<SkeletonFactory>, ElementProps<'div'> {
    /** Determines whether Skeleton overlay should be displayed @default `true` */
    visible?: boolean;
    /** Skeleton `height`, numbers are converted to rem @default `auto` */
    height?: React.CSSProperties['height'];
    /** Skeleton `width`, numbers are converted to rem, ignored when `circle` prop is set. @default `100%` */
    width?: React.CSSProperties['width'];
    /** If set, Skeleton `width` and `border-radius` are equal to its `height` @default `false` */
    circle?: boolean;
    /** Key of `theme.radius` or any valid CSS value to set border-radius. Numbers are converted to rem. @default `theme.defaultRadius` */
    radius?: React.CSSProperties['borderRadius'];
    /** Enables animation @default `true` */
    animate?: boolean;
}
export type SkeletonFactory = Factory<{
    props: SkeletonProps;
    ref: HTMLDivElement;
    stylesNames: SkeletonStylesNames;
    vars: SkeletonCssVariables;
}>;
export declare const Skeleton: import("../..").MantineComponent<{
    props: SkeletonProps;
    ref: HTMLDivElement;
    stylesNames: SkeletonStylesNames;
    vars: SkeletonCssVariables;
}>;
