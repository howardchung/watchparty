import { MantineColor, MantineTheme, PolymorphicFactory } from '../../core';
import { TextProps, TextStylesNames, TextVariant } from '../Text';
export interface HighlightProps extends Omit<TextProps, 'color'> {
    /** Substring or a list of substrings to highlight in `children` */
    highlight: string | string[];
    /** Key of `theme.colors` or any valid CSS color, passed to `Mark` component `color` prop @default `yellow` */
    color?: MantineColor | string;
    /** Styles applied to `mark` elements */
    highlightStyles?: React.CSSProperties | ((theme: MantineTheme) => React.CSSProperties);
    /** String parts of which must be highlighted */
    children: string;
}
export type HighlightFactory = PolymorphicFactory<{
    props: HighlightProps;
    defaultRef: HTMLDivElement;
    defaultComponent: 'div';
    stylesNames: TextStylesNames;
    variant: TextVariant;
}>;
export declare const Highlight: (<C = "div">(props: import("../..").PolymorphicComponentProps<C, HighlightProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(HighlightProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof HighlightProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (HighlightProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: HighlightProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: TextStylesNames;
    variant: TextVariant;
}> & import("../../core/factory/factory").ComponentClasses<{
    props: HighlightProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: TextStylesNames;
    variant: TextVariant;
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: HighlightProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: TextStylesNames;
    variant: TextVariant;
}> & Record<string, never>;
