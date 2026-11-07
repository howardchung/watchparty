import { BoxProps, ElementProps, Factory, MantineColor, StylesApiProps } from '../../core';
import { ComboboxItem, ComboboxLikeProps, ComboboxLikeRenderOptionInput, ComboboxLikeStylesNames } from '../Combobox';
import { __BaseInputProps, __InputStylesNames, InputClearButtonProps, InputVariant } from '../Input';
import { ScrollAreaProps } from '../ScrollArea';
export type SelectStylesNames = __InputStylesNames | ComboboxLikeStylesNames;
export interface SelectProps extends BoxProps, __BaseInputProps, ComboboxLikeProps, StylesApiProps<SelectFactory>, ElementProps<'input', 'onChange' | 'size' | 'value' | 'defaultValue'> {
    /** Controlled component value */
    value?: string | null;
    /** Uncontrolled component default value */
    defaultValue?: string | null;
    /** Called when value changes */
    onChange?: (value: string | null, option: ComboboxItem) => void;
    /** Called when the clear button is clicked */
    onClear?: () => void;
    /** Determines whether the select should be searchable @default `false` */
    searchable?: boolean;
    /** If set, the check icon is displayed near the selected option label @default `true` */
    withCheckIcon?: boolean;
    /** If set, unchecked labels are aligned with the checked one @default `false` */
    withAlignedLabels?: boolean;
    /** Position of the check icon relative to the option label @default `'left'` */
    checkIconPosition?: 'left' | 'right';
    /** Message displayed when no option matches the current search query when the `searchable` prop is set or there is no data */
    nothingFoundMessage?: React.ReactNode;
    /** Controlled search value */
    searchValue?: string;
    /** Default search value */
    defaultSearchValue?: string;
    /** Called when search changes */
    onSearchChange?: (value: string) => void;
    /** If set, it becomes possible to deselect value by clicking on the selected option @default `true` */
    allowDeselect?: boolean;
    /** If set, the clear button is displayed in the right section when the component has value @default `false` */
    clearable?: boolean;
    /** Props passed down to the clear button */
    clearButtonProps?: InputClearButtonProps;
    /** Props passed down to the hidden input */
    hiddenInputProps?: Omit<React.ComponentPropsWithoutRef<'input'>, 'value'>;
    /** A function to render content of the option, replaces the default content of the option */
    renderOption?: (item: ComboboxLikeRenderOptionInput<ComboboxItem>) => React.ReactNode;
    /** Props passed down to the underlying `ScrollArea` component in the dropdown */
    scrollAreaProps?: ScrollAreaProps;
    /** Controls color of the default chevron, by default depends on the color scheme */
    chevronColor?: MantineColor;
    /** If set, the highlighted option is selected when the input loses focus @default `false` */
    autoSelectOnBlur?: boolean;
}
export type SelectFactory = Factory<{
    props: SelectProps;
    ref: HTMLInputElement;
    stylesNames: SelectStylesNames;
    variant: InputVariant;
}>;
export declare const Select: import("../..").MantineComponent<{
    props: SelectProps;
    ref: HTMLInputElement;
    stylesNames: SelectStylesNames;
    variant: InputVariant;
}>;
