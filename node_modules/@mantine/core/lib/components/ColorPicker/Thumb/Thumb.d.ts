export interface ThumbProps extends React.ComponentPropsWithoutRef<'div'> {
    variant?: string;
    position: {
        x: number;
        y: number;
    };
}
export declare const Thumb: import("react").ForwardRefExoticComponent<ThumbProps & import("react").RefAttributes<HTMLDivElement>>;
