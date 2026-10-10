interface GetChangeValue {
    value: number;
    containerWidth?: number;
    min: number;
    max: number;
    step: number;
    precision?: number;
}
export declare function getChangeValue({ value, containerWidth, min, max, step, precision, }: GetChangeValue): number;
export {};
