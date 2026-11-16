import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
import { PaginationIconProps } from '../Pagination.icons';
export type PaginationDotsStylesNames = 'dots';
export interface PaginationDotsProps extends BoxProps, CompoundStylesApiProps<PaginationDotsFactory>, ElementProps<'div'> {
    /** Custom dots icon component, must accept svg element props and size prop */
    icon?: React.FC<PaginationIconProps>;
}
export type PaginationDotsFactory = Factory<{
    props: PaginationDotsProps;
    ref: HTMLDivElement;
    stylesNames: PaginationDotsStylesNames;
    compound: true;
}>;
export declare const PaginationDots: import("../../..").MantineComponent<{
    props: PaginationDotsProps;
    ref: HTMLDivElement;
    stylesNames: PaginationDotsStylesNames;
    compound: true;
}>;
