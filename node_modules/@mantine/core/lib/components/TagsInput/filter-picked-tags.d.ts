import { ComboboxParsedItem } from '../Combobox';
interface FilterPickedTagsInput {
    data: ComboboxParsedItem[];
    value: string[];
}
export declare function filterPickedTags({ data, value }: FilterPickedTagsInput): ComboboxParsedItem[];
export {};
