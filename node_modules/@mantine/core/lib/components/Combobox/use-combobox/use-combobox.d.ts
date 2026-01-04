export type ComboboxDropdownEventSource = 'keyboard' | 'mouse' | 'unknown';
export interface ComboboxStore {
    /** Current dropdown opened state */
    dropdownOpened: boolean;
    /** Opens dropdown */
    openDropdown: (eventSource?: ComboboxDropdownEventSource) => void;
    /** Closes dropdown */
    closeDropdown: (eventSource?: ComboboxDropdownEventSource) => void;
    /** Toggles dropdown opened state */
    toggleDropdown: (eventSource?: ComboboxDropdownEventSource) => void;
    /** Selected option index ref */
    selectedOptionIndex: number;
    /** Returns currently selected option index or `-1` if none of the options is selected */
    getSelectedOptionIndex: () => number;
    /** Selects `Combobox.Option` by index */
    selectOption: (index: number) => void;
    /** Selects first `Combobox.Option` with `active` prop.
     *  If there are no such options, the function does nothing.
     */
    selectActiveOption: () => string | null;
    /** Selects first `Combobox.Option` that is not disabled.
     *  If there are no such options, the function does nothing.
     * */
    selectFirstOption: () => string | null;
    /** Selects next `Combobox.Option` that is not disabled.
     *  If the current option is the last one, the function selects first option, if `loop` is true.
     */
    selectNextOption: () => string | null;
    /** Selects previous `Combobox.Option` that is not disabled.
     *  If the current option is the first one, the function selects last option, if `loop` is true.
     * */
    selectPreviousOption: () => string | null;
    /** Resets selected option index to -1, removes `data-combobox-selected` from selected option */
    resetSelectedOption: () => void;
    /** Triggers `onClick` event of selected option.
     *  If there is no selected option, the function does nothing.
     */
    clickSelectedOption: () => void;
    /** Updates selected option index to currently selected or active option.
     *  The function is required to be used with searchable components to update selected option index
     *  when options list changes based on search query.
     */
    updateSelectedOptionIndex: (target?: 'active' | 'selected', options?: {
        scrollIntoView?: boolean;
    }) => void;
    /** List id, used for `aria-*` attributes */
    listId: string | null;
    /** Sets list id */
    setListId: (id: string) => void;
    /** Ref of `Combobox.Search` input */
    searchRef: React.RefObject<HTMLInputElement | null>;
    /** Moves focus to `Combobox.Search` input */
    focusSearchInput: () => void;
    /** Ref of the target element */
    targetRef: React.RefObject<HTMLElement | null>;
    /** Moves focus to the target element */
    focusTarget: () => void;
}
export interface UseComboboxOptions {
    /** Default value for `dropdownOpened`, `false` by default */
    defaultOpened?: boolean;
    /** Controlled `dropdownOpened` state */
    opened?: boolean;
    /** Called when `dropdownOpened` state changes */
    onOpenedChange?: (opened: boolean) => void;
    /** Called when dropdown closes with event source: keyboard, mouse or unknown */
    onDropdownClose?: (eventSource: ComboboxDropdownEventSource) => void;
    /** Called when dropdown opens with event source: keyboard, mouse or unknown */
    onDropdownOpen?: (eventSource: ComboboxDropdownEventSource) => void;
    /** Determines whether arrow key presses should loop though items (first to last and last to first), `true` by default */
    loop?: boolean;
    /** `behavior` passed down to `element.scrollIntoView`, `'instant'` by default */
    scrollBehavior?: ScrollBehavior;
}
export declare function useCombobox({ defaultOpened, opened, onOpenedChange, onDropdownClose, onDropdownOpen, loop, scrollBehavior, }?: UseComboboxOptions): ComboboxStore;
