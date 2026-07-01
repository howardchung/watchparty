import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
import type { PopoverStylesNames } from '../Popover';
export interface PopoverDropdownProps extends BoxProps, CompoundStylesApiProps<PopoverDropdownFactory>, ElementProps<'div'> {
}
export type PopoverDropdownFactory = Factory<{
    props: PopoverDropdownProps;
    ref: HTMLDivElement;
    stylesNames: PopoverStylesNames;
    compound: true;
}>;
export declare const PopoverDropdown: import("../../..").MantineComponent<{
    props: PopoverDropdownProps;
    ref: HTMLDivElement;
    stylesNames: PopoverStylesNames;
    compound: true;
}>;
