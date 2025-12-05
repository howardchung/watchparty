import { ElementProps, MantineSize } from '../../../core';
import { HsvaColor } from '../ColorPicker.types';
export interface SaturationProps extends ElementProps<'div', 'onChange'> {
    value: HsvaColor;
    onChange: (color: Partial<HsvaColor>) => void;
    onChangeEnd: (color: Partial<HsvaColor>) => void;
    onScrubStart?: () => void;
    onScrubEnd?: () => void;
    saturationLabel?: string;
    size: MantineSize | (string & {});
    color: string;
    focusable?: boolean;
}
export declare function Saturation({ className, onChange, onChangeEnd, value, saturationLabel, focusable, size, color, onScrubStart, onScrubEnd, ...others }: SaturationProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Saturation {
    var displayName: string;
}
