import { ScrollAreaScrollbarAxisPrivateProps, ScrollAreaScrollbarAxisProps } from '../ScrollArea.types';
export interface ScrollAreaScrollbarVisibleProps extends Omit<ScrollAreaScrollbarAxisProps, keyof ScrollAreaScrollbarAxisPrivateProps> {
    orientation?: 'horizontal' | 'vertical';
}
export declare const ScrollAreaScrollbarVisible: import("react").ForwardRefExoticComponent<ScrollAreaScrollbarVisibleProps & import("react").RefAttributes<HTMLDivElement>>;
