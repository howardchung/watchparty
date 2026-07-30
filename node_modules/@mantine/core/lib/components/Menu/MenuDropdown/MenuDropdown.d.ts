import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type MenuDropdownStylesNames = 'dropdown';
export interface MenuDropdownProps extends BoxProps, CompoundStylesApiProps<MenuDropdownFactory>, ElementProps<'div'> {
}
export type MenuDropdownFactory = Factory<{
    props: MenuDropdownProps;
    ref: HTMLDivElement;
    stylesNames: MenuDropdownStylesNames;
    compound: true;
}>;
export declare const MenuDropdown: import("../../..").MantineComponent<{
    props: MenuDropdownProps;
    ref: HTMLDivElement;
    stylesNames: MenuDropdownStylesNames;
    compound: true;
}>;
