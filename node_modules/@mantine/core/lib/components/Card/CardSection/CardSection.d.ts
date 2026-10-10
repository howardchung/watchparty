import { BoxProps, CompoundStylesApiProps, PolymorphicFactory } from '../../../core';
export type CardSectionStylesNames = 'section';
export interface CardSectionProps extends BoxProps, CompoundStylesApiProps<CardSectionFactory> {
    /** Adds border to the root element */
    withBorder?: boolean;
    /** If set, the section inherits padding from the parent `Card` */
    inheritPadding?: boolean;
}
export type CardSectionFactory = PolymorphicFactory<{
    props: CardSectionProps;
    defaultRef: HTMLDivElement;
    defaultComponent: 'div';
    stylesNames: CardSectionStylesNames;
    compound: true;
}>;
export declare const CardSection: (<C = "div">(props: import("../../..").PolymorphicComponentProps<C, CardSectionProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(CardSectionProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof CardSectionProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (CardSectionProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../../core/factory/factory").ThemeExtend<{
    props: CardSectionProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: CardSectionStylesNames;
    compound: true;
}> & import("../../../core/factory/factory").ComponentClasses<{
    props: CardSectionProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: CardSectionStylesNames;
    compound: true;
}> & import("../../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: CardSectionProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: CardSectionStylesNames;
    compound: true;
}> & Record<string, never>;
