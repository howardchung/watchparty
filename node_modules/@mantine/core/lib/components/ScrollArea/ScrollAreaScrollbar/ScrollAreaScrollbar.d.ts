import { ScrollAreaScrollbarVisibleProps } from './ScrollAreaScrollbarVisible';
interface ScrollAreaScrollbarProps extends ScrollAreaScrollbarVisibleProps {
    forceMount?: true;
}
export declare const ScrollAreaScrollbar: import("react").ForwardRefExoticComponent<ScrollAreaScrollbarProps & import("react").RefAttributes<HTMLDivElement>>;
export {};
