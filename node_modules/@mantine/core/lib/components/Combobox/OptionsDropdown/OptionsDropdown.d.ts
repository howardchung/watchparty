import { ScrollAreaProps } from '../../ScrollArea/ScrollArea';
import { ComboboxItem, ComboboxLikeRenderOptionInput, ComboboxParsedItem } from '../Combobox.types';
import { FilterOptionsInput } from './default-options-filter';
export type OptionsFilter = (input: FilterOptionsInput) => ComboboxParsedItem[];
export interface OptionsGroup {
    group: string;
    items: ComboboxItem[];
}
export type OptionsData = (ComboboxItem | OptionsGroup)[];
export interface OptionsDropdownProps {
    data: OptionsData;
    filter: OptionsFilter | undefined;
    search: string | undefined;
    limit: number | undefined;
    withScrollArea: boolean | undefined;
    maxDropdownHeight: number | string | undefined;
    hidden?: boolean;
    hiddenWhenEmpty?: boolean;
    filterOptions?: boolean;
    withCheckIcon?: boolean;
    value?: string | string[] | null;
    checkIconPosition?: 'left' | 'right';
    nothingFoundMessage?: React.ReactNode;
    unstyled: boolean | undefined;
    labelId: string | undefined;
    'aria-label': string | undefined;
    renderOption?: (input: ComboboxLikeRenderOptionInput<any>) => React.ReactNode;
    scrollAreaProps: ScrollAreaProps | undefined;
}
export declare function OptionsDropdown({ data, hidden, hiddenWhenEmpty, filter, search, limit, maxDropdownHeight, withScrollArea, filterOptions, withCheckIcon, value, checkIconPosition, nothingFoundMessage, unstyled, labelId, renderOption, scrollAreaProps, 'aria-label': ariaLabel, }: OptionsDropdownProps): import("react/jsx-runtime").JSX.Element;
