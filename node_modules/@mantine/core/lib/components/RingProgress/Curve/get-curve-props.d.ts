interface GetCurveProps {
    size: number;
    thickness: number;
    sum: number;
    value: number | undefined;
    root: boolean | undefined;
    offset: number;
}
export declare function getCurveProps({ size, thickness, sum, value, root, offset }: GetCurveProps): {
    strokeWidth: number;
    cx: number;
    cy: number;
    r: number;
    transform: string | undefined;
    strokeDasharray: string;
    strokeDashoffset: number;
};
export {};
