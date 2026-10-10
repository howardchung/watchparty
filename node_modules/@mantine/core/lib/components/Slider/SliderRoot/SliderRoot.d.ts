import { BoxProps, ElementProps, MantineColor, MantineRadius, MantineSize } from '../../../core';
export interface SliderRootProps extends BoxProps, ElementProps<'div'> {
    size: MantineSize | (string & {}) | number;
    children: React.ReactNode;
    color?: MantineColor;
    disabled: boolean | undefined;
    variant?: string;
    thumbSize?: string | number;
    radius?: MantineRadius;
}
export declare const SliderRoot: import("react").ForwardRefExoticComponent<SliderRootProps & import("react").RefAttributes<HTMLDivElement>>;
