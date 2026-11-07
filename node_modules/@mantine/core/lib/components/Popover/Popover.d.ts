import { ElementProps, ExtendComponent, Factory, MantineRadius, MantineShadow, StylesApiProps } from '../../core';
import { ArrowPosition, FloatingAxesOffsets, FloatingPosition, FloatingStrategy } from '../../utils/Floating';
import { OverlayProps } from '../Overlay';
import { BasePortalProps } from '../Portal';
import { TransitionOverride } from '../Transition';
import { PopoverMiddlewares, PopoverWidth } from './Popover.types';
export type PopoverStylesNames = 'dropdown' | 'arrow' | 'overlay';
export type PopoverCssVariables = {
    dropdown: '--popover-radius' | '--popover-shadow';
};
export interface __PopoverProps {
    /** Dropdown position relative to the target element @default `'bottom'` */
    position?: FloatingPosition;
    /** Offset of the dropdown element @default `8` */
    offset?: number | FloatingAxesOffsets;
    /** Called when dropdown position changes */
    onPositionChange?: (position: FloatingPosition) => void;
    /** @deprecated: Do not use, will be removed in 9.0 */
    positionDependencies?: any[];
    /** Called when dropdown closes */
    onClose?: () => void;
    /** Called when the popover is dismissed by clicking outside or by pressing escape */
    onDismiss?: () => void;
    /** Called when dropdown opens */
    onOpen?: () => void;
    /** If set, the dropdown is not unmounted from the DOM when hidden. `display: none` styles are added instead. */
    keepMounted?: boolean;
    /** Props passed down to the `Transition` component. Use to configure duration and animation type. @default `{ duration: 150, transition: 'fade' }` */
    transitionProps?: TransitionOverride;
    /** Called when exit transition ends */
    onExitTransitionEnd?: () => void;
    /** Called when enter transition ends */
    onEnterTransitionEnd?: () => void;
    /** Dropdown width, or `'target'` to make dropdown width the same as target element @default `'max-content'` */
    width?: PopoverWidth;
    /** Floating ui middlewares to configure position handling @default `{ flip: true, shift: true, inline: false }` */
    middlewares?: PopoverMiddlewares;
    /** Determines whether component should have an arrow @default `false` */
    withArrow?: boolean;
    /** Determines whether the overlay should be displayed when the dropdown is opened @default `false` */
    withOverlay?: boolean;
    /** Props passed down to `Overlay` component */
    overlayProps?: OverlayProps & ElementProps<'div'>;
    /** Arrow size in px @default `7` */
    arrowSize?: number;
    /** Arrow offset in px @default `5` */
    arrowOffset?: number;
    /** Arrow `border-radius` in px @default `0` */
    arrowRadius?: number;
    /** Arrow position */
    arrowPosition?: ArrowPosition;
    /** Determines whether dropdown should be rendered within the `Portal` @default `true` */
    withinPortal?: boolean;
    /** Props to pass down to the `Portal` when `withinPortal` is true */
    portalProps?: BasePortalProps;
    /** Dropdown `z-index` @default `300` */
    zIndex?: string | number;
    /** Key of `theme.radius` or any valid CSS value to set border-radius @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Key of `theme.shadows` or any other valid CSS `box-shadow` value */
    shadow?: MantineShadow;
    /** If set, popover dropdown will not be rendered */
    disabled?: boolean;
    /** Determines whether focus should be automatically returned to control when dropdown closes @default `false` */
    returnFocus?: boolean;
    /** Changes floating ui [position strategy](https://floating-ui.com/docs/usefloating#strategy) @default `'absolute'` */
    floatingStrategy?: FloatingStrategy;
    /** If set, the dropdown is hidden when the element is hidden with styles or not visible on the screen @default `true` */
    hideDetached?: boolean;
    /** Prevents popover from flipping/shifting when it the dropdown is visible */
    preventPositionChangeWhenVisible?: boolean;
}
export interface PopoverProps extends __PopoverProps, StylesApiProps<PopoverFactory> {
    __staticSelector?: string;
    /** `Popover.Target` and `Popover.Dropdown` components */
    children?: React.ReactNode;
    /** Initial opened state for uncontrolled component */
    defaultOpened?: boolean;
    /** Controlled dropdown opened state */
    opened?: boolean;
    /** Called with current state when dropdown opens or closes */
    onChange?: (opened: boolean) => void;
    /** Determines whether dropdown should be closed on outside clicks @default `true` */
    closeOnClickOutside?: boolean;
    /** Events that trigger outside clicks */
    clickOutsideEvents?: string[];
    /** Determines whether focus should be trapped within dropdown @default `false` */
    trapFocus?: boolean;
    /** Determines whether dropdown should be closed when `Escape` key is pressed @default `true` */
    closeOnEscape?: boolean;
    /** Id base to create accessibility connections */
    id?: string;
    /** Determines whether dropdown and target elements should have accessible roles @default `true` */
    withRoles?: boolean;
}
export type PopoverFactory = Factory<{
    props: PopoverProps;
    stylesNames: PopoverStylesNames;
    vars: PopoverCssVariables;
}>;
export declare function Popover(_props: PopoverProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Popover {
    var Target: import("../..").MantineComponent<{
        props: import(".").PopoverTargetProps;
        ref: HTMLElement;
        compound: true;
    }>;
    var Dropdown: import("../..").MantineComponent<{
        props: import(".").PopoverDropdownProps;
        ref: HTMLDivElement;
        stylesNames: PopoverStylesNames;
        compound: true;
    }>;
    var displayName: string;
    var extend: (input: ExtendComponent<PopoverFactory>) => import("../../core/factory/factory").ExtendsRootComponent<{
        props: PopoverProps;
        stylesNames: PopoverStylesNames;
        vars: PopoverCssVariables;
    }>;
}
