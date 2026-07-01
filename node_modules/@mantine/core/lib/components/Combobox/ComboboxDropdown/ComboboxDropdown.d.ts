import { Factory } from '../../../core';
import { PopoverDropdownProps } from '../../Popover';
export type ComboboxDropdownStylesNames = 'dropdown';
export interface ComboboxDropdownProps extends PopoverDropdownProps {
    /** Determines whether the dropdown should be hidden, for example, when there are no options to display */
    hidden?: boolean;
}
export type ComboboxDropdownFactory = Factory<{
    props: ComboboxDropdownProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxDropdownStylesNames;
    compound: true;
}>;
export declare const ComboboxDropdown: import("../../..").MantineComponent<{
    props: ComboboxDropdownProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxDropdownStylesNames;
    compound: true;
}>;
