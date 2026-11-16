import { ScrollAreaScrollbarVisibleProps } from './ScrollAreaScrollbarVisible';
export interface ScrollAreaScrollbarAutoProps extends ScrollAreaScrollbarVisibleProps {
    forceMount?: true;
}
export declare const ScrollAreaScrollbarAuto: import("react").ForwardRefExoticComponent<ScrollAreaScrollbarAutoProps & import("react").RefAttributes<HTMLDivElement>>;
