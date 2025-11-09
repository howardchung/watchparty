import { BoxProps, MantineRadius, PolymorphicFactory, StylesApiProps } from '../../core';
export type ImageStylesNames = 'root';
export type ImageCssVariables = {
    root: '--image-radius' | '--image-object-fit';
};
export interface ImageProps extends BoxProps, StylesApiProps<ImageFactory> {
    /** Key of `theme.radius` or any valid CSS value to set `border-radius` @default `0` */
    radius?: MantineRadius;
    /** Controls `object-fit` style @default `'cover'` */
    fit?: React.CSSProperties['objectFit'];
    /** Image url used as a fallback if the image cannot be loaded */
    fallbackSrc?: string;
    /** Image url */
    src?: any;
    /** Called when image fails to load */
    onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}
export type ImageFactory = PolymorphicFactory<{
    props: ImageProps;
    defaultRef: HTMLImageElement;
    defaultComponent: 'img';
    stylesNames: ImageStylesNames;
    vars: ImageCssVariables;
}>;
export declare const Image: (<C = "img">(props: import("../..").PolymorphicComponentProps<C, ImageProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(ImageProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof ImageProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (ImageProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: ImageProps;
    defaultRef: HTMLImageElement;
    defaultComponent: "img";
    stylesNames: ImageStylesNames;
    vars: ImageCssVariables;
}> & import("../../core/factory/factory").ComponentClasses<{
    props: ImageProps;
    defaultRef: HTMLImageElement;
    defaultComponent: "img";
    stylesNames: ImageStylesNames;
    vars: ImageCssVariables;
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: ImageProps;
    defaultRef: HTMLImageElement;
    defaultComponent: "img";
    stylesNames: ImageStylesNames;
    vars: ImageCssVariables;
}> & Record<string, never>;
