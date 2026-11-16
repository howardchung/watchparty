interface IsMarkFilled {
    mark: {
        value: number;
        label?: any;
    };
    offset?: number;
    value: number;
    inverted?: boolean;
}
export declare function isMarkFilled({ mark, offset, value, inverted }: IsMarkFilled): boolean;
export {};
