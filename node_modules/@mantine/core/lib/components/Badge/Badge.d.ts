import { BoxProps, MantineColor, MantineGradient, MantineRadius, MantineSize, PolymorphicFactory, StylesApiProps } from '../../core';
export type BadgeStylesNames = 'root' | 'section' | 'label';
export type BadgeVariant = 'filled' | 'light' | 'outline' | 'dot' | 'transparent' | 'white' | 'default' | 'gradient';
export type BadgeCssVariables = {
    root: '--badge-height' | '--badge-padding-x' | '--badge-fz' | '--badge-radius' | '--badge-bg' | '--badge-color' | '--badge-bd' | '--badge-dot-color';
};
export interface BadgeProps extends BoxProps, StylesApiProps<BadgeFactory> {
    /** Controls `font-size`, `height` and horizontal `padding` @default `'md'` */
    size?: MantineSize | (string & {});
    /** If set, badge `min-width` becomes equal to its `height` and horizontal padding is removed */
    circle?: boolean;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius` @default `'xl'` */
    radius?: MantineRadius;
    /** Key of `theme.colors` or any valid CSS color @default `theme.primaryColor` */
    color?: MantineColor;
    /** Gradient configuration used when `variant=\"gradient\"` @default `theme.defaultGradient` */
    gradient?: MantineGradient;
    /** Content displayed on the left side of the badge label */
    leftSection?: React.ReactNode;
    /** Content displayed on the right side of the badge label */
    rightSection?: React.ReactNode;
    /** Determines whether Badge should take 100% of its parent width @default `false` */
    fullWidth?: boolean;
    /** Main badge content */
    children?: React.ReactNode;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
}
export type BadgeFactory = PolymorphicFactory<{
    props: BadgeProps;
    defaultRef: HTMLDivElement;
    defaultComponent: 'div';
    stylesNames: BadgeStylesNames;
    vars: BadgeCssVariables;
    variant: BadgeVariant;
}>;
export declare const Badge: (<C = "div">(props: import("../..").PolymorphicComponentProps<C, BadgeProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(BadgeProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof BadgeProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (BadgeProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: BadgeProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: BadgeStylesNames;
    vars: BadgeCssVariables;
    variant: BadgeVariant;
}> & import("../../core/factory/factory").ComponentClasses<{
    props: BadgeProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: BadgeStylesNames;
    vars: BadgeCssVariables;
    variant: BadgeVariant;
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: BadgeProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: BadgeStylesNames;
    vars: BadgeCssVariables;
    variant: BadgeVariant;
}> & Record<string, never>;
