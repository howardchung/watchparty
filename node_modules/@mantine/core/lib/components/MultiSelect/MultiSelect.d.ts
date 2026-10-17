import { BoxProps, ElementProps, Factory, MantineColor, StylesApiProps } from '../../core';
import { ComboboxItem, ComboboxLikeProps, ComboboxLikeRenderOptionInput, ComboboxLikeStylesNames } from '../Combobox';
import { __BaseInputProps, __InputStylesNames, InputClearButtonProps } from '../Input';
import { ScrollAreaProps } from '../ScrollArea';
export type MultiSelectStylesNames = __InputStylesNames | ComboboxLikeStylesNames | 'pill' | 'pillsList' | 'inputField';
export interface MultiSelectProps extends BoxProps, __BaseInputProps, ComboboxLikeProps, StylesApiProps<MultiSelectFactory>, ElementProps<'input', 'size' | 'value' | 'defaultValue' | 'onChange'> {
    /** Controlled component value */
    value?: string[];
    /** Uncontrolled component default value */
    defaultValue?: string[];
    /** Called when value changes */
    onChange?: (value: string[]) => void;
    /** Called with `value` of the removed item */
    onRemove?: (value: string) => void;
    /** Called when the clear button is clicked */
    onClear?: () => void;
    /** Controlled search value */
    searchValue?: string;
    /** Default search value */
    defaultSearchValue?: string;
    /** Called when search changes */
    onSearchChange?: (value: string) => void;
    /** Maximum number of values, no limit if not set */
    maxValues?: number;
    /** Allows searching @default `false` */
    searchable?: boolean;
    /** Message displayed when no option matches the current search query while the `searchable` prop is set or there is no data */
    nothingFoundMessage?: React.ReactNode;
    /** If set, the check icon is displayed near the selected option label @default `true` */
    withCheckIcon?: boolean;
    /** If set, unchecked labels are aligned with checked ones @default `false` */
    withAlignedLabels?: boolean;
    /** Position of the check icon relative to the option label @default `'left'` */
    checkIconPosition?: 'left' | 'right';
    /** If set, picked options are removed from the options list @default `false` */
    hidePickedOptions?: boolean;
    /** If set, the clear button is displayed in the right section when the component has value @default `false` */
    clearable?: boolean;
    /** Props passed down to the clear button */
    clearButtonProps?: InputClearButtonProps;
    /** Props passed down to the hidden input */
    hiddenInputProps?: Omit<React.ComponentPropsWithoutRef<'input'>, 'value'>;
    /** Divider used to separate values in the hidden input `value` attribute @default `','` */
    hiddenInputValuesDivider?: string;
    /** A function to render content of the option, replaces the default content of the option */
    renderOption?: (item: ComboboxLikeRenderOptionInput<ComboboxItem>) => React.ReactNode;
    /** Props passed down to the underlying `ScrollArea` component in the dropdown */
    scrollAreaProps?: ScrollAreaProps;
    /** Controls color of the default chevron */
    chevronColor?: MantineColor;
    /** Clear search value when item is selected */
    clearSearchOnChange?: boolean;
}
export type MultiSelectFactory = Factory<{
    props: MultiSelectProps;
    ref: HTMLInputElement;
    stylesNames: MultiSelectStylesNames;
}>;
export declare const MultiSelect: import("../..").MantineComponent<{
    props: MultiSelectProps;
    ref: HTMLInputElement;
    stylesNames: MultiSelectStylesNames;
}>;
