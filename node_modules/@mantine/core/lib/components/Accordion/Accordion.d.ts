import { BoxProps, ElementProps, ExtendComponent, Factory, MantineRadius, MantineThemeComponent, StylesApiProps } from '../../core';
import { AccordionChevronPosition, AccordionHeadingOrder, AccordionValue } from './Accordion.types';
import { AccordionChevron } from './AccordionChevron';
export type AccordionStylesNames = 'root' | 'content' | 'item' | 'panel' | 'icon' | 'chevron' | 'label' | 'itemTitle' | 'control';
export type AccordionVariant = 'default' | 'contained' | 'filled' | 'separated';
export type AccordionCssVariables = {
    root: '--accordion-transition-duration' | '--accordion-chevron-size' | '--accordion-radius';
};
export interface AccordionProps<Multiple extends boolean = false> extends BoxProps, StylesApiProps<AccordionFactory>, ElementProps<'div', 'value' | 'defaultValue' | 'onChange'> {
    /** If set, multiple items can be opened at the same time */
    multiple?: Multiple;
    /** Controlled component value */
    value?: AccordionValue<Multiple>;
    /** Uncontrolled component default value */
    defaultValue?: AccordionValue<Multiple>;
    /** Called when value changes, payload type depends on `multiple` prop */
    onChange?: (value: AccordionValue<Multiple>) => void;
    /** If set, arrow keys loop though items (first to last and last to first) @default `true` */
    loop?: boolean;
    /** Transition duration in ms @default `200` */
    transitionDuration?: number;
    /** If set, chevron rotation is disabled */
    disableChevronRotation?: boolean;
    /** Position of the chevron relative to the item label @default `right` */
    chevronPosition?: AccordionChevronPosition;
    /** Size of the chevron icon container @default `auto` */
    chevronSize?: number | string;
    /** Size of the default chevron icon. Ignored when `chevron` prop is set. @default `16` */
    chevronIconSize?: number | string;
    /** Heading order, has no effect on visuals */
    order?: AccordionHeadingOrder;
    /** Custom chevron icon */
    chevron?: React.ReactNode;
    /** Key of `theme.radius` or any valid CSS value to set border-radius. Numbers are converted to rem. @default `theme.defaultRadius` */
    radius?: MantineRadius;
}
export type AccordionFactory = Factory<{
    props: AccordionProps;
    ref: HTMLDivElement;
    stylesNames: AccordionStylesNames;
    vars: AccordionCssVariables;
    variant: AccordionVariant;
}>;
export declare function Accordion<Multiple extends boolean = false>(_props: AccordionProps<Multiple>): import("react/jsx-runtime").JSX.Element;
export declare namespace Accordion {
    var extend: (c: ExtendComponent<AccordionFactory>) => MantineThemeComponent;
    var withProps: (props: Partial<AccordionProps<false>>) => AccordionProps<false>;
    var classes: any;
    var displayName: string;
    var Item: import("../..").MantineComponent<{
        props: import(".").AccordionItemProps;
        ref: HTMLDivElement;
        stylesNames: import("./AccordionItem/AccordionItem").AccordionItemStylesNames;
        compound: true;
    }>;
    var Panel: import("../..").MantineComponent<{
        props: import(".").AccordionPanelProps;
        ref: HTMLDivElement;
        stylesNames: import("./AccordionPanel/AccordionPanel").AccordionPanelStylesNames;
        compound: true;
    }>;
    var Control: import("../..").MantineComponent<{
        props: import(".").AccordionControlProps;
        ref: HTMLButtonElement;
        stylesNames: import("./AccordionControl/AccordionControl").AccordionControlStylesNames;
        compound: true;
    }>;
    var Chevron: typeof AccordionChevron;
}
