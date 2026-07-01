import { GetStylesApi } from '../../core';
import type { AccordionFactory } from './Accordion';
import { AccordionChevronPosition, AccordionHeadingOrder } from './Accordion.types';
interface AccordionContext {
    loop: boolean | undefined;
    transitionDuration: number | undefined;
    disableChevronRotation: boolean | undefined;
    chevronPosition: AccordionChevronPosition | undefined;
    order: AccordionHeadingOrder | undefined;
    chevron: React.ReactNode;
    onChange: (value: string) => void;
    isItemActive: (value: string) => boolean;
    getControlId: (value: string) => string;
    getRegionId: (value: string) => string;
    getStyles: GetStylesApi<AccordionFactory>;
    variant: string | undefined;
    unstyled: boolean | undefined;
}
export declare const AccordionProvider: ({ children, value }: {
    value: AccordionContext;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useAccordionContext: () => AccordionContext;
export {};
