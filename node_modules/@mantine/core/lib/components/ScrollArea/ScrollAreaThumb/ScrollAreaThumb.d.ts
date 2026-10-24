interface ThumbProps extends React.ComponentPropsWithoutRef<'div'> {
}
export declare const Thumb: import("react").ForwardRefExoticComponent<ThumbProps & import("react").RefAttributes<HTMLDivElement>>;
interface ScrollAreaThumbProps extends ThumbProps {
    forceMount?: true;
}
export declare const ScrollAreaThumb: import("react").ForwardRefExoticComponent<ScrollAreaThumbProps & import("react").RefAttributes<HTMLDivElement>>;
export {};
