import { ComboboxParsedItem } from '../Combobox.types';
export interface FilterOptionsInput {
    options: ComboboxParsedItem[];
    search: string;
    limit: number;
}
export declare function defaultOptionsFilter({ options, search, limit, }: FilterOptionsInput): ComboboxParsedItem[];
