import { BoxProps, MantineRadius, PolymorphicFactory, StylesApiProps } from '../../core';
export type ColorSwatchStylesNames = 'root' | 'alphaOverlay' | 'shadowOverlay' | 'colorOverlay' | 'childrenOverlay';
export type ColorSwatchCssVariables = {
    root: '--cs-radius' | '--cs-size';
};
export interface ColorSwatchProps extends BoxProps, StylesApiProps<ColorSwatchFactory> {
    /** Valid CSS color to display */
    color: string;
    /** Controls `width` and `height` of the swatch, any valid CSS value, numbers are converted to rem. @default `28` */
    size?: React.CSSProperties['width'];
    /** Key of `theme.radius` or any valid CSS value to set `border-radius`, numbers are converted to rem. @default `1000` */
    radius?: MantineRadius;
    /** Determines whether the swatch should have inner `box-shadow` @default `true` */
    withShadow?: boolean;
    /** Content displayed inside the swatch */
    children?: React.ReactNode;
}
export type ColorSwatchFactory = PolymorphicFactory<{
    props: ColorSwatchProps;
    defaultRef: HTMLDivElement;
    defaultComponent: 'div';
    stylesNames: ColorSwatchStylesNames;
    vars: ColorSwatchCssVariables;
}>;
export declare const ColorSwatch: (<C = "div">(props: import("../..").PolymorphicComponentProps<C, ColorSwatchProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(ColorSwatchProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof ColorSwatchProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (ColorSwatchProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: ColorSwatchProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: ColorSwatchStylesNames;
    vars: ColorSwatchCssVariables;
}> & import("../../core/factory/factory").ComponentClasses<{
    props: ColorSwatchProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: ColorSwatchStylesNames;
    vars: ColorSwatchCssVariables;
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: ColorSwatchProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: ColorSwatchStylesNames;
    vars: ColorSwatchCssVariables;
}> & Record<string, never>;
