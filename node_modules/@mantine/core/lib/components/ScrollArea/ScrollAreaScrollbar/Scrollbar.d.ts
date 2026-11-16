import { Sizes } from '../ScrollArea.types';
import { ScrollbarContextValue } from './Scrollbar.context';
export interface ScrollbarPrivateProps {
    sizes: Sizes;
    hasThumb: boolean;
    onThumbChange: ScrollbarContextValue['onThumbChange'];
    onThumbPointerUp: ScrollbarContextValue['onThumbPointerUp'];
    onThumbPointerDown: ScrollbarContextValue['onThumbPointerDown'];
    onThumbPositionChange: ScrollbarContextValue['onThumbPositionChange'];
    onWheelScroll: (event: WheelEvent, maxScrollPos: number) => void;
    onDragScroll: (pointerPos: {
        x: number;
        y: number;
    }) => void;
    onResize: () => void;
}
interface ScrollbarProps extends ScrollbarPrivateProps, Omit<React.ComponentPropsWithoutRef<'div'>, 'onResize'> {
}
export declare const Scrollbar: import("react").ForwardRefExoticComponent<ScrollbarProps & import("react").RefAttributes<HTMLDivElement>>;
export {};
