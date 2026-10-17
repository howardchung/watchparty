import { BoxProps, ElementProps, Factory, GetStylesApi } from '../../../core';
import type { ScrollAreaFactory } from '../ScrollArea';
export type ScrollAreaRootStylesNames = 'root' | 'viewport' | 'viewportInner' | 'scrollbar' | 'thumb' | 'corner';
export type ScrollAreaRootCssVariables = {
    root: '--sa-corner-width' | '--sa-corner-height';
};
export interface ScrollAreaRootStylesCtx {
    cornerWidth: number;
    cornerHeight: number;
}
export interface ScrollAreaRootProps extends BoxProps, ElementProps<'div'> {
    getStyles: GetStylesApi<ScrollAreaFactory>;
    type?: 'auto' | 'always' | 'scroll' | 'hover' | 'never';
    scrollbars?: 'x' | 'y' | 'xy' | false;
    scrollHideDelay?: number;
}
export type ScrollAreaRootFactory = Factory<{
    props: ScrollAreaRootProps;
    ref: HTMLDivElement;
    stylesNames: ScrollAreaRootStylesNames;
}>;
export declare const ScrollAreaRoot: import("react").ForwardRefExoticComponent<ScrollAreaRootProps & import("react").RefAttributes<HTMLDivElement>>;
