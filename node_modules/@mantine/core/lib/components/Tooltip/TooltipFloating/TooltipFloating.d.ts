import { Factory } from '../../../core';
import { TooltipBaseProps, TooltipCssVariables, TooltipStylesNames } from '../Tooltip.types';
export interface TooltipFloatingProps extends TooltipBaseProps {
    /** Offset from mouse in px @default `10` */
    offset?: number;
    /** Uncontrolled tooltip initial opened state */
    defaultOpened?: boolean;
}
export type TooltipFloatingFactory = Factory<{
    props: TooltipFloatingProps;
    ref: HTMLDivElement;
    stylesNames: TooltipStylesNames;
    vars: TooltipCssVariables;
}>;
export declare const TooltipFloating: import("../../..").MantineComponent<{
    props: TooltipFloatingProps;
    ref: HTMLDivElement;
    stylesNames: TooltipStylesNames;
    vars: TooltipCssVariables;
}>;
