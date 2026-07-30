import { ScrollAreaScrollbarVisibleProps } from './ScrollAreaScrollbarVisible';
interface ScrollAreaScrollbarScrollProps extends ScrollAreaScrollbarVisibleProps {
    forceMount?: true;
}
export declare const ScrollAreaScrollbarScroll: import("react").ForwardRefExoticComponent<ScrollAreaScrollbarScrollProps & import("react").RefAttributes<HTMLDivElement>>;
export {};
