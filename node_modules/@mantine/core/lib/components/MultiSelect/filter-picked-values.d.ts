import { ComboboxParsedItem } from '../Combobox';
interface FilterPickedTagsInput {
    data: ComboboxParsedItem[];
    value: string[];
}
export declare function filterPickedValues({ data, value }: FilterPickedTagsInput): ComboboxParsedItem[];
export {};
