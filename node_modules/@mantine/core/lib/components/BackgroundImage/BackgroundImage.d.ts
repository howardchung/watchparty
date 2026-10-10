import { BoxProps, MantineRadius, PolymorphicFactory, StylesApiProps } from '../../core';
export type BackgroundImageStylesNames = 'root';
export type BackgroundImageCssVariables = {
    root: '--bi-radius';
};
export interface BackgroundImageProps extends BoxProps, StylesApiProps<BackgroundImageFactory> {
    /** Key of `theme.radius` or any valid CSS value to set border-radius, numbers are converted to rem @default `0` */
    radius?: MantineRadius;
    /** Image url */
    src: string;
}
export type BackgroundImageFactory = PolymorphicFactory<{
    props: BackgroundImageProps;
    defaultRef: HTMLDivElement;
    defaultComponent: 'div';
    stylesNames: BackgroundImageStylesNames;
    vars: BackgroundImageCssVariables;
}>;
export declare const BackgroundImage: (<C = "div">(props: import("../..").PolymorphicComponentProps<C, BackgroundImageProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(BackgroundImageProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof BackgroundImageProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (BackgroundImageProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: BackgroundImageProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: BackgroundImageStylesNames;
    vars: BackgroundImageCssVariables;
}> & import("../../core/factory/factory").ComponentClasses<{
    props: BackgroundImageProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: BackgroundImageStylesNames;
    vars: BackgroundImageCssVariables;
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: BackgroundImageProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: BackgroundImageStylesNames;
    vars: BackgroundImageCssVariables;
}> & Record<string, never>;
