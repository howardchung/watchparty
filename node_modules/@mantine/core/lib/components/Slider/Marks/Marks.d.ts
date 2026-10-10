export interface MarksProps {
    marks: {
        value: number;
        label?: React.ReactNode;
    }[] | undefined;
    min: number;
    max: number;
    value: number;
    offset: number | undefined;
    disabled: boolean | undefined;
    inverted: boolean | undefined;
}
export declare function Marks({ marks, min, max, disabled, value, offset, inverted }: MarksProps): import("react/jsx-runtime").JSX.Element | null;
export declare namespace Marks {
    var displayName: string;
}
