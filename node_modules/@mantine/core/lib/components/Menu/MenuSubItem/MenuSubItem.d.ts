import { BoxProps, CompoundStylesApiProps, MantineColor, PolymorphicFactory } from '../../../core';
export type MenuSubItemStylesNames = 'item' | 'itemLabel' | 'itemSection';
export interface MenuSubItemProps extends BoxProps, CompoundStylesApiProps<MenuSubItemFactory> {
    'data-disabled'?: boolean;
    /** Item label */
    children?: React.ReactNode;
    /** Key of `theme.colors` or any valid CSS color */
    color?: MantineColor;
    /** Section displayed at the start of the label */
    leftSection?: React.ReactNode;
    /** Section displayed at the end of the label */
    rightSection?: React.ReactNode;
    /** Sets disabled attribute, applies disabled styles */
    disabled?: boolean;
    /** If set, the menu is closed when the item is clicked. Overrides `closeOnItemClick` prop on the `Menu` component. */
    closeMenuOnClick?: boolean;
}
export type MenuSubItemFactory = PolymorphicFactory<{
    props: MenuSubItemProps;
    defaultRef: HTMLButtonElement;
    defaultComponent: 'button';
    stylesNames: MenuSubItemStylesNames;
    compound: true;
}>;
export declare const MenuSubItem: (<C = "button">(props: import("../../..").PolymorphicComponentProps<C, MenuSubItemProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(MenuSubItemProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof MenuSubItemProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (MenuSubItemProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../../core/factory/factory").ThemeExtend<{
    props: MenuSubItemProps;
    defaultRef: HTMLButtonElement;
    defaultComponent: "button";
    stylesNames: MenuSubItemStylesNames;
    compound: true;
}> & import("../../../core/factory/factory").ComponentClasses<{
    props: MenuSubItemProps;
    defaultRef: HTMLButtonElement;
    defaultComponent: "button";
    stylesNames: MenuSubItemStylesNames;
    compound: true;
}> & import("../../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: MenuSubItemProps;
    defaultRef: HTMLButtonElement;
    defaultComponent: "button";
    stylesNames: MenuSubItemStylesNames;
    compound: true;
}> & Record<string, never>;
