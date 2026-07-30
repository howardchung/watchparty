import { ComboboxStore } from './use-combobox';
interface UseComboboxOptions {
    /** Default value for `dropdownOpened`, `false` by default */
    defaultOpened?: boolean;
    /** Controlled `dropdownOpened` state */
    opened?: boolean;
    /** Called when `dropdownOpened` state changes */
    onOpenedChange?: (opened: boolean) => void;
    /** Called when dropdown closes */
    onDropdownClose?: () => void;
    /** Called when dropdown opens */
    onDropdownOpen?: () => void;
    /** Determines whether arrow key presses should loop though items (first to last and last to first), `true` by default */
    loop?: boolean;
    /** Function to determine whether the option is disabled */
    isOptionDisabled?: (optionIndex: number) => boolean;
    totalOptionsCount: number;
    getOptionId: (index: number) => string | null;
    selectedOptionIndex: number;
    setSelectedOptionIndex: (index: number) => void;
    activeOptionIndex?: number;
    onSelectedOptionSubmit: (index: number) => void;
}
export declare function useVirtualizedCombobox({ defaultOpened, opened, onOpenedChange, onDropdownClose, onDropdownOpen, loop, totalOptionsCount, isOptionDisabled, getOptionId, selectedOptionIndex, setSelectedOptionIndex, activeOptionIndex, onSelectedOptionSubmit, }?: UseComboboxOptions): ComboboxStore;
export {};
