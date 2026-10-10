import { BoxProps, MantineRadius, MantineShadow, MantineSpacing, PolymorphicFactory, StylesApiProps } from '../../core';
import { CardSection } from './CardSection/CardSection';
export type CardStylesNames = 'root' | 'section';
export type CardCssVariables = {
    root: '--card-padding';
};
export interface CardProps extends BoxProps, StylesApiProps<CardFactory> {
    /** Key of `theme.shadows` or any valid CSS value to set `box-shadow` */
    shadow?: MantineShadow;
    /** Key of `theme.radius` or any valid CSS value to set border-radius, numbers are converted to rem @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Adds border to the card */
    withBorder?: boolean;
    /** Key of `theme.spacing` or any valid CSS value to set padding @default `'md'` */
    padding?: MantineSpacing;
    /** Card content */
    children?: React.ReactNode;
}
export type CardFactory = PolymorphicFactory<{
    props: CardProps;
    defaultRef: HTMLDivElement;
    defaultComponent: 'div';
    stylesNames: CardStylesNames;
    vars: CardCssVariables;
    staticComponents: {
        Section: typeof CardSection;
    };
}>;
export declare const Card: (<C = "div">(props: import("../..").PolymorphicComponentProps<C, CardProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(CardProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof CardProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (CardProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: CardProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: CardStylesNames;
    vars: CardCssVariables;
    staticComponents: {
        Section: typeof CardSection;
    };
}> & import("../../core/factory/factory").ComponentClasses<{
    props: CardProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: CardStylesNames;
    vars: CardCssVariables;
    staticComponents: {
        Section: typeof CardSection;
    };
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: CardProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: CardStylesNames;
    vars: CardCssVariables;
    staticComponents: {
        Section: typeof CardSection;
    };
}> & {
    Section: typeof CardSection;
};
