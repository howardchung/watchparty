import { BoxProps, ElementProps, MantineRadius, MantineShadow } from '../../core';
import { TransitionOverride } from '../Transition';
export interface ModalBaseContentProps extends BoxProps, ElementProps<'div'> {
    /** Props passed down to the `Transition` component */
    transitionProps?: TransitionOverride;
    /** Key of `theme.shadows` or any valid CSS value to set `box-shadow` */
    shadow?: MantineShadow;
    /** Key of `theme.radius` or any valid CSS value to set border-radius, numbers are converted to rem @default `theme.defaultRadius` */
    radius?: MantineRadius;
}
interface _ModalBaseContentProps extends ModalBaseContentProps {
    innerProps: React.ComponentPropsWithoutRef<'div'>;
}
export declare const ModalBaseContent: import("react").ForwardRefExoticComponent<_ModalBaseContentProps & import("react").RefAttributes<HTMLDivElement>>;
export {};
