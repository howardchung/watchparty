import { ColorSliderProps } from '../ColorSlider/ColorSlider';
export interface AlphaSliderProps extends Omit<ColorSliderProps, 'maxValue' | 'overlays' | 'round'> {
    color: string;
}
export declare const AlphaSlider: import("react").ForwardRefExoticComponent<AlphaSliderProps & import("react").RefAttributes<HTMLDivElement>>;
