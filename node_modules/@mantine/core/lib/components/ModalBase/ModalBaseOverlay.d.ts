import { ElementProps } from '../../core';
import { OverlayProps } from '../Overlay';
import { TransitionOverride } from '../Transition';
export interface ModalBaseOverlayProps extends Omit<OverlayProps, 'styles' | 'classNames' | 'variant' | 'vars'>, ElementProps<'div', 'color'> {
    /** Props passed down to the `Transition` component */
    transitionProps?: TransitionOverride;
    /** Determines whether the overlay should be visible. By default, has the same value as `opened` state. */
    visible?: boolean;
}
export declare const ModalBaseOverlay: import("react").ForwardRefExoticComponent<ModalBaseOverlayProps & import("react").RefAttributes<HTMLDivElement>>;
