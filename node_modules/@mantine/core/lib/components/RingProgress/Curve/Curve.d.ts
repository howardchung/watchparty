import { GetStylesApi, MantineColor } from '../../../core';
import type { RingProgressFactory } from '../RingProgress';
interface CurveProps extends React.ComponentPropsWithRef<'circle'> {
    value?: number;
    size: number;
    offset: number;
    sum: number;
    thickness: number;
    lineRoundCaps: boolean | undefined;
    root?: boolean;
    color?: MantineColor;
    tooltip?: React.ReactNode;
    getStyles: GetStylesApi<RingProgressFactory>;
}
export declare function Curve({ size, value, offset, sum, thickness, root, color, lineRoundCaps, tooltip, getStyles, display, ...others }: CurveProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Curve {
    var displayName: string;
}
export {};
