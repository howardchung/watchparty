import { ArrowPosition, FloatingPosition } from '../types';
interface FloatingArrowProps extends React.ComponentPropsWithoutRef<'div'> {
    position: FloatingPosition;
    arrowSize: number;
    arrowOffset: number;
    arrowRadius: number;
    arrowPosition: ArrowPosition;
    arrowX: number | undefined;
    arrowY: number | undefined;
    visible: boolean | undefined;
}
export declare const FloatingArrow: import("react").ForwardRefExoticComponent<FloatingArrowProps & import("react").RefAttributes<HTMLDivElement>>;
export {};
