import { Factory } from '../../core';
import { ArrowPosition, FloatingAxesOffsets, FloatingPosition, FloatingStrategy } from '../../utils/Floating';
import { TransitionOverride } from '../Transition';
import { TooltipBaseProps, TooltipCssVariables, TooltipStylesNames } from './Tooltip.types';
import { TooltipFloating } from './TooltipFloating/TooltipFloating';
import { TooltipGroup } from './TooltipGroup/TooltipGroup';
export interface TooltipProps extends TooltipBaseProps {
    /** Called when tooltip position changes */
    onPositionChange?: (position: FloatingPosition) => void;
    /** Open delay in ms */
    openDelay?: number;
    /** Close delay in ms @default `0` */
    closeDelay?: number;
    /** Controlled opened state */
    opened?: boolean;
    /** Uncontrolled tooltip initial opened state */
    defaultOpened?: boolean;
    /** Space between target element and tooltip in px @default `5` */
    offset?: number | FloatingAxesOffsets;
    /** If set, the tooltip has an arrow @default `false` */
    withArrow?: boolean;
    /** Arrow size in px @default `4` */
    arrowSize?: number;
    /** Arrow offset in px @default `5` */
    arrowOffset?: number;
    /** Arrow `border-radius` in px @default `0` */
    arrowRadius?: number;
    /** Arrow position relative to the tooltip @default `side` */
    arrowPosition?: ArrowPosition;
    /** Props passed down to the `Transition` component that used to animate tooltip presence, use to configure duration and animation type @default `{ duration: 100, transition: 'fade' }` */
    transitionProps?: TransitionOverride;
    /** Determines which events will be used to show tooltip @default `{ hover: true, focus: false, touch: false }` */
    events?: {
        hover: boolean;
        focus: boolean;
        touch: boolean;
    };
    /** @deprecated: Do not use, will be removed in 9.0 */
    positionDependencies?: any[];
    /** Must be set if the tooltip target is an inline element */
    inline?: boolean;
    /** If set, the tooltip is not unmounted from the DOM when hidden, `display: none` styles are applied instead */
    keepMounted?: boolean;
    /** Changes floating ui [position strategy](https://floating-ui.com/docs/usefloating#strategy) @default `'absolute'` */
    floatingStrategy?: FloatingStrategy;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
    /** Selector, ref of an element or element itself that should be used for positioning */
    target?: React.RefObject<HTMLElement | null> | HTMLElement | null | string;
}
export type TooltipFactory = Factory<{
    props: TooltipProps;
    ref: HTMLDivElement;
    stylesNames: TooltipStylesNames;
    vars: TooltipCssVariables;
    staticComponents: {
        Floating: typeof TooltipFloating;
        Group: typeof TooltipGroup;
    };
}>;
export declare const Tooltip: import("../..").MantineComponent<{
    props: TooltipProps;
    ref: HTMLDivElement;
    stylesNames: TooltipStylesNames;
    vars: TooltipCssVariables;
    staticComponents: {
        Floating: typeof TooltipFloating;
        Group: typeof TooltipGroup;
    };
}>;
