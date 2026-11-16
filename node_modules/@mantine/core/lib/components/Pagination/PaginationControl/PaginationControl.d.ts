import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type PaginationControlStylesNames = 'control';
export interface PaginationControlProps extends BoxProps, CompoundStylesApiProps<PaginationControlFactory>, ElementProps<'button'> {
    /** Applies active styles, adds `data-active` attribute */
    active?: boolean;
    /** Applies padding @default `true` */
    withPadding?: boolean;
}
export type PaginationControlFactory = Factory<{
    props: PaginationControlProps;
    ref: HTMLButtonElement;
    stylesNames: PaginationControlStylesNames;
    compound: true;
}>;
export declare const PaginationControl: import("../../..").MantineComponent<{
    props: PaginationControlProps;
    ref: HTMLButtonElement;
    stylesNames: PaginationControlStylesNames;
    compound: true;
}>;
