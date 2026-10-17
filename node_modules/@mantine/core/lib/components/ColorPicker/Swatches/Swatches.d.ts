import { ElementProps } from '../../../core';
export interface SwatchesProps extends ElementProps<'div'> {
    size?: string | number;
    data: string[];
    swatchesPerRow?: number;
    focusable?: boolean;
    value?: string;
    onChangeEnd?: (color: string) => void;
    setValue: (value: string) => void;
}
export declare const Swatches: import("react").ForwardRefExoticComponent<SwatchesProps & import("react").RefAttributes<HTMLDivElement>>;
