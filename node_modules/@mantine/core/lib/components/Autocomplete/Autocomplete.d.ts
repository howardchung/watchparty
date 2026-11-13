import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
import { ComboboxLikeProps, ComboboxLikeRenderOptionInput, ComboboxLikeStylesNames, ComboboxStringData, ComboboxStringItem } from '../Combobox';
import { __BaseInputProps, __InputStylesNames, InputClearButtonProps, InputVariant } from '../Input';
import { ScrollAreaProps } from '../ScrollArea';
export type RenderAutocompleteOption = (input: ComboboxLikeRenderOptionInput<ComboboxStringItem>) => React.ReactNode;
export type AutocompleteStylesNames = __InputStylesNames | ComboboxLikeStylesNames;
export interface AutocompleteProps extends BoxProps, Omit<__BaseInputProps, 'pointer'>, Omit<ComboboxLikeProps, 'data'>, StylesApiProps<AutocompleteFactory>, ElementProps<'input', 'onChange' | 'size'> {
    /** Data used to display options. Values must be unique. */
    data?: ComboboxStringData;
    /** Controlled component value */
    value?: string;
    /** Default value for uncontrolled component */
    defaultValue?: string;
    /** Called when value changes */
    onChange?: (value: string) => void;
    /** Function to render custom option content */
    renderOption?: RenderAutocompleteOption;
    /** Props passed to the underlying `ScrollArea` component in the dropdown */
    scrollAreaProps?: ScrollAreaProps;
    /** Called when the clear button is clicked */
    onClear?: () => void;
    /** Props passed to the clear button */
    clearButtonProps?: InputClearButtonProps;
    /** If set, the clear button is displayed when the component has a value @default `false` */
    clearable?: boolean;
    /** If set, the highlighted option is selected when the input loses focus @default `false` */
    autoSelectOnBlur?: boolean;
}
export type AutocompleteFactory = Factory<{
    props: AutocompleteProps;
    ref: HTMLInputElement;
    stylesNames: AutocompleteStylesNames;
    variant: InputVariant;
}>;
export declare const Autocomplete: import("../..").MantineComponent<{
    props: AutocompleteProps;
    ref: HTMLInputElement;
    stylesNames: AutocompleteStylesNames;
    variant: InputVariant;
}>;
