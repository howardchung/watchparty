export interface TrackProps {
    filled: number;
    offset?: number;
    marksOffset?: number;
    marks: {
        value: number;
        label?: React.ReactNode;
    }[] | undefined;
    min: number;
    max: number;
    value: number;
    children: React.ReactNode;
    disabled: boolean | undefined;
    inverted: boolean | undefined;
    containerProps?: React.ComponentProps<'div'>;
}
export declare function Track({ filled, children, offset, disabled, marksOffset, inverted, containerProps, ...others }: TrackProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Track {
    var displayName: string;
}
