import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type AccordionPanelStylesNames = 'panel' | 'content';
export interface AccordionPanelProps extends BoxProps, CompoundStylesApiProps<AccordionPanelFactory>, ElementProps<'div'> {
    /** Called when the panel animation completes */
    onTransitionEnd?: () => void;
}
export type AccordionPanelFactory = Factory<{
    props: AccordionPanelProps;
    ref: HTMLDivElement;
    stylesNames: AccordionPanelStylesNames;
    compound: true;
}>;
export declare const AccordionPanel: import("../../..").MantineComponent<{
    props: AccordionPanelProps;
    ref: HTMLDivElement;
    stylesNames: AccordionPanelStylesNames;
    compound: true;
}>;
