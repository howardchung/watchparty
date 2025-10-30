import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type AccordionItemStylesNames = 'item';
export interface AccordionItemProps extends BoxProps, CompoundStylesApiProps<AccordionItemFactory>, ElementProps<'div'> {
    /** Value that is used to manage the accordion state */
    value: string;
}
export type AccordionItemFactory = Factory<{
    props: AccordionItemProps;
    ref: HTMLDivElement;
    stylesNames: AccordionItemStylesNames;
    compound: true;
}>;
export declare const AccordionItem: import("../../..").MantineComponent<{
    props: AccordionItemProps;
    ref: HTMLDivElement;
    stylesNames: AccordionItemStylesNames;
    compound: true;
}>;
