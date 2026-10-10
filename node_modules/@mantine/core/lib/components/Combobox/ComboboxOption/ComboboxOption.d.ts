import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type ComboboxOptionStylesNames = 'option';
export interface ComboboxOptionProps extends BoxProps, CompoundStylesApiProps<ComboboxOptionFactory>, ElementProps<'div'> {
    /** Option value */
    value: string;
    /** Current active state */
    active?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Current selected state */
    selected?: boolean;
}
export type ComboboxOptionFactory = Factory<{
    props: ComboboxOptionProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxOptionStylesNames;
    compound: true;
}>;
export declare const ComboboxOption: import("../../..").MantineComponent<{
    props: ComboboxOptionProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxOptionStylesNames;
    compound: true;
}>;
