import { Factory, MantineSpacing } from '../../core';
import { PaginationIcon } from './Pagination.icons';
import { PaginationControl } from './PaginationControl/PaginationControl';
import { PaginationDots } from './PaginationDots/PaginationDots';
import { PaginationFirst, PaginationLast, PaginationNext, PaginationPrevious } from './PaginationEdges/PaginationEdges';
import { PaginationItems } from './PaginationItems/PaginationItems';
import { PaginationRoot, PaginationRootCssVariables, PaginationRootProps, PaginationRootStylesNames } from './PaginationRoot/PaginationRoot';
export type PaginationStylesNames = PaginationRootStylesNames;
export type PaginationCssVariables = PaginationRootCssVariables;
export interface PaginationProps extends PaginationRootProps {
    /** If set, first/last controls are displayed @default `false` */
    withEdges?: boolean;
    /** If set, next/previous controls are displayed @default `true` */
    withControls?: boolean;
    /** Props passed down to next/previous/first/last controls */
    getControlProps?: (control: 'first' | 'previous' | 'last' | 'next') => Record<string, any>;
    /** Next control icon component */
    nextIcon?: PaginationIcon;
    /** Previous control icon component */
    previousIcon?: PaginationIcon;
    /** Last control icon component */
    lastIcon?: PaginationIcon;
    /** First control icon component */
    firstIcon?: PaginationIcon;
    /** Dots icon component */
    dotsIcon?: PaginationIcon;
    /** Key of `theme.spacing`, gap between controls @default `8` */
    gap?: MantineSpacing;
    /** If set, the pagination is hidden when only one page is available (`total={1}`) @default `false` */
    hideWithOnePage?: boolean;
    /** If set to `false`, pages controls are hidden @default `true` */
    withPages?: boolean;
}
export type PaginationFactory = Factory<{
    props: PaginationProps;
    ref: HTMLDivElement;
    stylesNames: PaginationStylesNames;
    vars: PaginationCssVariables;
    staticComponents: {
        Root: typeof PaginationRoot;
        Control: typeof PaginationControl;
        Dots: typeof PaginationDots;
        First: typeof PaginationFirst;
        Last: typeof PaginationLast;
        Next: typeof PaginationNext;
        Previous: typeof PaginationPrevious;
        Items: typeof PaginationItems;
    };
}>;
export declare const Pagination: import("../..").MantineComponent<{
    props: PaginationProps;
    ref: HTMLDivElement;
    stylesNames: PaginationStylesNames;
    vars: PaginationCssVariables;
    staticComponents: {
        Root: typeof PaginationRoot;
        Control: typeof PaginationControl;
        Dots: typeof PaginationDots;
        First: typeof PaginationFirst;
        Last: typeof PaginationLast;
        Next: typeof PaginationNext;
        Previous: typeof PaginationPrevious;
        Items: typeof PaginationItems;
    };
}>;
