import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type MenuSubDropdownStylesNames = 'dropdown';
export interface MenuSubDropdownProps extends BoxProps, CompoundStylesApiProps<MenuSubDropdownFactory>, ElementProps<'div'> {
}
export type MenuSubDropdownFactory = Factory<{
    props: MenuSubDropdownProps;
    ref: HTMLDivElement;
    stylesNames: MenuSubDropdownStylesNames;
    compound: true;
}>;
export declare const MenuSubDropdown: import("../../..").MantineComponent<{
    props: MenuSubDropdownProps;
    ref: HTMLDivElement;
    stylesNames: MenuSubDropdownStylesNames;
    compound: true;
}>;
