import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
import { ComboboxLikeProps, ComboboxLikeRenderOptionInput, ComboboxLikeStylesNames, ComboboxStringData, ComboboxStringItem } from '../Combobox';
import { __BaseInputProps, __InputStylesNames, InputClearButtonProps } from '../Input';
import { ScrollAreaProps } from '../ScrollArea';
export type TagsInputStylesNames = __InputStylesNames | ComboboxLikeStylesNames | 'pill' | 'pillsList' | 'inputField';
export interface TagsInputProps extends BoxProps, __BaseInputProps, Omit<ComboboxLikeProps, 'data'>, StylesApiProps<TagsInputFactory>, ElementProps<'input', 'size' | 'value' | 'defaultValue' | 'onChange'> {
    /** Data displayed in the dropdown. Values must be unique. */
    data?: ComboboxStringData;
    /** Controlled component value */
    value?: string[];
    /** Uncontrolled component default value */
    defaultValue?: string[];
    /** Called when value changes */
    onChange?: (value: string[]) => void;
    /** Called when tag is removed */
    onRemove?: (value: string) => void;
    /** Called when the clear button is clicked */
    onClear?: () => void;
    /** Controlled search value */
    searchValue?: string;
    /** Default search value */
    defaultSearchValue?: string;
    /** Called when search changes */
    onSearchChange?: (value: string) => void;
    /** Maximum number of tags @default `Infinity` */
    maxTags?: number;
    /** If set, duplicate tags are allowed @default `false` */
    allowDuplicates?: boolean;
    /** Called when user tries to submit a duplicated tag */
    onDuplicate?: (value: string) => void;
    /** Characters that should trigger tags split, `[',']` by default */
    splitChars?: string[];
    /** If set, the clear button is displayed in the right section when the component has value @default `false` */
    clearable?: boolean;
    /** Props passed down to the clear button */
    clearButtonProps?: InputClearButtonProps;
    /** Props passed down to the hidden input */
    hiddenInputProps?: Omit<React.ComponentPropsWithoutRef<'input'>, 'value'>;
    /** Divider used to separate values in the hidden input `value` attribute @default `','` */
    hiddenInputValuesDivider?: string;
    /** A function to render content of the option, replaces the default content of the option */
    renderOption?: (input: ComboboxLikeRenderOptionInput<ComboboxStringItem>) => React.ReactNode;
    /** Props passed down to the underlying `ScrollArea` component in the dropdown */
    scrollAreaProps?: ScrollAreaProps;
    /** If set, the value typed in by the user but not submitted is accepted when the input is blurred @default `true` */
    acceptValueOnBlur?: boolean;
    /** Custom function to determine if a tag is duplicate. Accepts tag value and array of current values. By default, checks if the tag exists case-insensitively. */
    isDuplicate?: (value: string, currentValues: string[]) => boolean;
}
export type TagsInputFactory = Factory<{
    props: TagsInputProps;
    ref: HTMLInputElement;
    stylesNames: TagsInputStylesNames;
}>;
export declare const TagsInput: import("../..").MantineComponent<{
    props: TagsInputProps;
    ref: HTMLInputElement;
    stylesNames: TagsInputStylesNames;
}>;
