import { ColorSliderProps } from '../ColorSlider/ColorSlider';
export interface HueSliderProps extends Omit<ColorSliderProps, 'maxValue' | 'overlays' | 'round'> {
}
export declare const HueSlider: import("react").ForwardRefExoticComponent<HueSliderProps & import("react").RefAttributes<HTMLDivElement>>;
