import { GetStylesApi } from '../../core';
export type SliderStylesNames = 'root' | 'label' | 'thumb' | 'trackContainer' | 'track' | 'bar' | 'markWrapper' | 'mark' | 'markLabel';
export type SliderCssVariables = {
    root: '--slider-size' | '--slider-color' | '--slider-thumb-size' | '--slider-radius';
};
interface SliderContextValue {
    getStyles: GetStylesApi<{
        stylesNames: SliderStylesNames;
        props: any;
        ref: any;
        vars: any;
        variant: any;
    }>;
}
export declare const SliderProvider: ({ children, value }: {
    value: SliderContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useSliderContext: () => SliderContextValue;
export {};
