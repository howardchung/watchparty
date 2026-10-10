import { BoxComponentProps, PolymorphicFactory, StylesApiProps } from '../../core';
export type UnstyledButtonStylesNames = 'root';
export interface UnstyledButtonProps extends Omit<BoxComponentProps, 'vars' | 'variant'>, StylesApiProps<UnstyledButtonFactory> {
    __staticSelector?: string;
}
export type UnstyledButtonFactory = PolymorphicFactory<{
    props: UnstyledButtonProps;
    stylesNames: UnstyledButtonStylesNames;
    defaultComponent: 'button';
    defaultRef: HTMLButtonElement;
}>;
export declare const UnstyledButton: (<C = "button">(props: import("../..").PolymorphicComponentProps<C, UnstyledButtonProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(UnstyledButtonProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof UnstyledButtonProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (UnstyledButtonProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: UnstyledButtonProps;
    stylesNames: UnstyledButtonStylesNames;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
}> & import("../../core/factory/factory").ComponentClasses<{
    props: UnstyledButtonProps;
    stylesNames: UnstyledButtonStylesNames;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: UnstyledButtonProps;
    stylesNames: UnstyledButtonStylesNames;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
}> & Record<string, never>;
