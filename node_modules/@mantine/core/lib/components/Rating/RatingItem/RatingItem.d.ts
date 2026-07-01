import { BoxProps, ElementProps } from '../../../core';
export interface RatingItemProps extends BoxProps, ElementProps<'input', 'value' | 'size'> {
    getSymbolLabel: ((value: number) => string) | undefined;
    emptyIcon?: React.ReactNode | ((value: number) => React.ReactNode);
    fullIcon?: React.ReactNode | ((value: number) => React.ReactNode);
    full: boolean;
    active: boolean;
    fractionValue: number;
    value: number;
    id: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement> | number) => void;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement> | number) => void;
}
export declare function RatingItem({ getSymbolLabel, emptyIcon, fullIcon, full, active, value, readOnly, fractionValue, color, id, onBlur, onChange, onInputChange, style, ...others }: RatingItemProps): import("react/jsx-runtime").JSX.Element;
export declare namespace RatingItem {
    var displayName: string;
}
