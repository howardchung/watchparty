import { BoxProps, MantineColor, MantineFontSize, MantineGradient, MantineLineHeight, PolymorphicFactory, StylesApiProps } from '../../core';
type TextTruncate = 'end' | 'start' | boolean;
export type TextStylesNames = 'root';
export type TextVariant = 'text' | 'gradient';
export type TextCssVariables = {
    root: '--text-gradient' | '--text-line-clamp' | '--text-fz' | '--text-lh';
};
export interface TextProps extends BoxProps, StylesApiProps<TextFactory> {
    __staticSelector?: string;
    /** Controls `font-size` and `line-height` @default `'md'` */
    size?: MantineFontSize | MantineLineHeight;
    /** Number of lines after which Text will be truncated */
    lineClamp?: number;
    /** Side on which Text must be truncated, if `true`, text is truncated from the start */
    truncate?: TextTruncate;
    /** Sets `line-height` to 1 for centering @default `false` */
    inline?: boolean;
    /** Determines whether font properties should be inherited from the parent @default `false` */
    inherit?: boolean;
    /** Gradient configuration, ignored when `variant` is not `gradient` @default `theme.defaultGradient` */
    gradient?: MantineGradient;
    /** Shorthand for `component="span"` */
    span?: boolean;
    /** @deprecated Use `c` prop instead */
    color?: MantineColor;
}
export type TextFactory = PolymorphicFactory<{
    props: TextProps;
    defaultComponent: 'p';
    defaultRef: HTMLParagraphElement;
    stylesNames: TextStylesNames;
    vars: TextCssVariables;
    variant: TextVariant;
}>;
export declare const Text: (<C = "p">(props: import("../..").PolymorphicComponentProps<C, TextProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(TextProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof TextProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (TextProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: TextProps;
    defaultComponent: "p";
    defaultRef: HTMLParagraphElement;
    stylesNames: TextStylesNames;
    vars: TextCssVariables;
    variant: TextVariant;
}> & import("../../core/factory/factory").ComponentClasses<{
    props: TextProps;
    defaultComponent: "p";
    defaultRef: HTMLParagraphElement;
    stylesNames: TextStylesNames;
    vars: TextCssVariables;
    variant: TextVariant;
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: TextProps;
    defaultComponent: "p";
    defaultRef: HTMLParagraphElement;
    stylesNames: TextStylesNames;
    vars: TextCssVariables;
    variant: TextVariant;
}> & Record<string, never>;
export {};
