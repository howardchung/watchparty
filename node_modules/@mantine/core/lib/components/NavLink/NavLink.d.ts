import { BoxProps, MantineColor, MantineSpacing, PolymorphicFactory, StylesApiProps } from '../../core';
export type NavLinkStylesNames = 'root' | 'section' | 'body' | 'label' | 'description' | 'chevron' | 'collapse' | 'children';
export type NavLinkVariant = 'filled' | 'light' | 'subtle';
export type NavLinkCssVariables = {
    root: '--nl-color' | '--nl-bg' | '--nl-hover';
    children: '--nl-offset';
};
export interface NavLinkProps extends BoxProps, StylesApiProps<NavLinkFactory> {
    /** Main link label */
    label?: React.ReactNode;
    /** Link description, displayed below the label */
    description?: React.ReactNode;
    /** Section displayed on the left side of the label */
    leftSection?: React.ReactNode;
    /** Section displayed on the right side of the label */
    rightSection?: React.ReactNode;
    /** Determines whether the link should have active styles @default `false` */
    active?: boolean;
    /** Key of `theme.colors` of any valid CSS color to control active styles @default `theme.primaryColor` */
    color?: MantineColor;
    /** If set, label and description do not wrap to the next line @default `false` */
    noWrap?: boolean;
    /** Child `NavLink` components */
    children?: React.ReactNode;
    /** Controlled nested items collapse state */
    opened?: boolean;
    /** Uncontrolled nested items collapse initial state */
    defaultOpened?: boolean;
    /** Called when open state changes */
    onChange?: (opened: boolean) => void;
    /** If set, right section will not be rotated when collapse is opened @default `false` */
    disableRightSectionRotation?: boolean;
    /** Key of `theme.spacing` or any valid CSS value to set collapsed links `padding-left` @default `'lg'` */
    childrenOffset?: MantineSpacing;
    /** If set, disabled styles will be added to the root element @default `false` */
    disabled?: boolean;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
    /** Called when the root element is clicked */
    onClick?: React.MouseEventHandler<HTMLElement>;
    /** Called on keydown of the root element */
    onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
}
export type NavLinkFactory = PolymorphicFactory<{
    props: NavLinkProps;
    defaultRef: HTMLAnchorElement;
    defaultComponent: 'a';
    stylesNames: NavLinkStylesNames;
    vars: NavLinkCssVariables;
    variant: NavLinkVariant;
}>;
export declare const NavLink: (<C = "a">(props: import("../..").PolymorphicComponentProps<C, NavLinkProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(NavLinkProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof NavLinkProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (NavLinkProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: NavLinkProps;
    defaultRef: HTMLAnchorElement;
    defaultComponent: "a";
    stylesNames: NavLinkStylesNames;
    vars: NavLinkCssVariables;
    variant: NavLinkVariant;
}> & import("../../core/factory/factory").ComponentClasses<{
    props: NavLinkProps;
    defaultRef: HTMLAnchorElement;
    defaultComponent: "a";
    stylesNames: NavLinkStylesNames;
    vars: NavLinkCssVariables;
    variant: NavLinkVariant;
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: NavLinkProps;
    defaultRef: HTMLAnchorElement;
    defaultComponent: "a";
    stylesNames: NavLinkStylesNames;
    vars: NavLinkCssVariables;
    variant: NavLinkVariant;
}> & Record<string, never>;
