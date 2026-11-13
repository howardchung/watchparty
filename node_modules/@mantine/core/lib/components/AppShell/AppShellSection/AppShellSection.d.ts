import { BoxProps, CompoundStylesApiProps, PolymorphicFactory } from '../../../core';
export type AppShellSectionStylesNames = 'section';
export interface AppShellSectionProps extends BoxProps, CompoundStylesApiProps<AppShellSectionFactory> {
    /** If set, the section expands to take all available space */
    grow?: boolean;
}
export type AppShellSectionFactory = PolymorphicFactory<{
    props: AppShellSectionProps;
    defaultRef: HTMLDivElement;
    defaultComponent: 'div';
    stylesNames: AppShellSectionStylesNames;
    compound: true;
}>;
export declare const AppShellSection: (<C = "div">(props: import("../../..").PolymorphicComponentProps<C, AppShellSectionProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(AppShellSectionProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof AppShellSectionProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (AppShellSectionProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../../core/factory/factory").ThemeExtend<{
    props: AppShellSectionProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: AppShellSectionStylesNames;
    compound: true;
}> & import("../../../core/factory/factory").ComponentClasses<{
    props: AppShellSectionProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: AppShellSectionStylesNames;
    compound: true;
}> & import("../../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: AppShellSectionProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: AppShellSectionStylesNames;
    compound: true;
}> & Record<string, never>;
