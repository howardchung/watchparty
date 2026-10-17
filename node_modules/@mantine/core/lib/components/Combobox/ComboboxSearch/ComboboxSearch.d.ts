import { ElementProps, Factory } from '../../../core';
import { InputProps, InputStylesNames } from '../../Input/Input';
export type ComboboxSearchStylesNames = InputStylesNames;
export interface ComboboxSearchProps extends InputProps, ElementProps<'input', 'size'> {
    /** if set, the search input has `aria-` attribute @default `true` */
    withAriaAttributes?: boolean;
    /** if set, the search input handles keyboard navigation @default `true` */
    withKeyboardNavigation?: boolean;
}
export type ComboboxSearchFactory = Factory<{
    props: ComboboxSearchProps;
    ref: HTMLInputElement;
    stylesNames: ComboboxSearchStylesNames;
}>;
export declare const ComboboxSearch: import("../../..").MantineComponent<{
    props: ComboboxSearchProps;
    ref: HTMLInputElement;
    stylesNames: ComboboxSearchStylesNames;
}>;
