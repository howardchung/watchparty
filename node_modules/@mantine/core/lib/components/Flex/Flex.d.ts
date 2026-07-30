import { BoxProps, ElementProps, MantineSpacing, PolymorphicFactory, StyleProp, StylesApiProps } from '../../core';
export type FlexStylesNames = 'root';
export interface FlexProps extends BoxProps, StylesApiProps<FlexFactory>, ElementProps<'div'> {
    /** `gap` CSS property */
    gap?: StyleProp<MantineSpacing>;
    /** `row-gap` CSS property */
    rowGap?: StyleProp<MantineSpacing>;
    /** `column-gap` CSS property */
    columnGap?: StyleProp<MantineSpacing>;
    /** `align-items` CSS property */
    align?: StyleProp<React.CSSProperties['alignItems']>;
    /** `justify-content` CSS property */
    justify?: StyleProp<React.CSSProperties['justifyContent']>;
    /** `flex-wrap` CSS property */
    wrap?: StyleProp<React.CSSProperties['flexWrap']>;
    /** `flex-direction` CSS property */
    direction?: StyleProp<React.CSSProperties['flexDirection']>;
}
export type FlexFactory = PolymorphicFactory<{
    props: FlexProps;
    defaultRef: HTMLDivElement;
    defaultComponent: 'div';
    stylesNames: FlexStylesNames;
}>;
export declare const Flex: (<C = "div">(props: import("../..").PolymorphicComponentProps<C, FlexProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(FlexProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof FlexProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (FlexProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: FlexProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: FlexStylesNames;
}> & import("../../core/factory/factory").ComponentClasses<{
    props: FlexProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: FlexStylesNames;
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: FlexProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: FlexStylesNames;
}> & Record<string, never>;
