'use client';
import { useRef, useCallback, useEffect } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import '../../../core/utils/units-converters/rem.mjs';
import 'react/jsx-runtime';
import { getRootElement, findElementBySelector, findElementsBySelector } from '../../../core/utils/find-element-in-shadow-dom/find-element-in-shadow-dom.mjs';
import { getNextIndex, getPreviousIndex, getFirstIndex } from './get-index/get-index.mjs';

function useCombobox({
  defaultOpened,
  opened,
  onOpenedChange,
  onDropdownClose,
  onDropdownOpen,
  loop = true,
  scrollBehavior = "instant"
} = {}) {
  const [dropdownOpened, setDropdownOpened] = useUncontrolled({
    value: opened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange: onOpenedChange
  });
  const listId = useRef(null);
  const selectedOptionIndex = useRef(-1);
  const searchRef = useRef(null);
  const targetRef = useRef(null);
  const focusSearchTimeout = useRef(-1);
  const focusTargetTimeout = useRef(-1);
  const selectedIndexUpdateTimeout = useRef(-1);
  const openDropdown = useCallback(
    (eventSource = "unknown") => {
      if (!dropdownOpened) {
        setDropdownOpened(true);
        onDropdownOpen?.(eventSource);
      }
    },
    [setDropdownOpened, onDropdownOpen, dropdownOpened]
  );
  const closeDropdown = useCallback(
    (eventSource = "unknown") => {
      if (dropdownOpened) {
        setDropdownOpened(false);
        onDropdownClose?.(eventSource);
      }
    },
    [setDropdownOpened, onDropdownClose, dropdownOpened]
  );
  const toggleDropdown = useCallback(
    (eventSource = "unknown") => {
      if (dropdownOpened) {
        closeDropdown(eventSource);
      } else {
        openDropdown(eventSource);
      }
    },
    [closeDropdown, openDropdown, dropdownOpened]
  );
  const clearSelectedItem = useCallback(() => {
    const root = getRootElement(targetRef.current);
    const selected = findElementBySelector(`#${listId.current} [data-combobox-selected]`, root);
    selected?.removeAttribute("data-combobox-selected");
    selected?.removeAttribute("aria-selected");
  }, []);
  const selectOption = useCallback(
    (index) => {
      const root = getRootElement(targetRef.current);
      const list = findElementBySelector(`#${listId.current}`, root);
      const items = list ? findElementsBySelector("[data-combobox-option]", list) : null;
      if (!items) {
        return null;
      }
      const nextIndex = index >= items.length ? 0 : index < 0 ? items.length - 1 : index;
      selectedOptionIndex.current = nextIndex;
      if (items?.[nextIndex] && !items[nextIndex].hasAttribute("data-combobox-disabled")) {
        clearSelectedItem();
        items[nextIndex].setAttribute("data-combobox-selected", "true");
        items[nextIndex].setAttribute("aria-selected", "true");
        items[nextIndex].scrollIntoView({ block: "nearest", behavior: scrollBehavior });
        return items[nextIndex].id;
      }
      return null;
    },
    [scrollBehavior, clearSelectedItem]
  );
  const selectActiveOption = useCallback(() => {
    const root = getRootElement(targetRef.current);
    const activeOption = findElementBySelector(
      `#${listId.current} [data-combobox-active]`,
      root
    );
    if (activeOption) {
      const items = findElementsBySelector(
        `#${listId.current} [data-combobox-option]`,
        root
      );
      const index = items.findIndex((option) => option === activeOption);
      return selectOption(index);
    }
    return selectOption(0);
  }, [selectOption]);
  const selectNextOption = useCallback(() => {
    const root = getRootElement(targetRef.current);
    const items = findElementsBySelector(
      `#${listId.current} [data-combobox-option]`,
      root
    );
    return selectOption(getNextIndex(selectedOptionIndex.current, items, loop));
  }, [selectOption, loop]);
  const selectPreviousOption = useCallback(() => {
    const root = getRootElement(targetRef.current);
    const items = findElementsBySelector(
      `#${listId.current} [data-combobox-option]`,
      root
    );
    return selectOption(getPreviousIndex(selectedOptionIndex.current, items, loop));
  }, [selectOption, loop]);
  const selectFirstOption = useCallback(() => {
    const root = getRootElement(targetRef.current);
    const items = findElementsBySelector(
      `#${listId.current} [data-combobox-option]`,
      root
    );
    return selectOption(getFirstIndex(items));
  }, [selectOption]);
  const updateSelectedOptionIndex = useCallback(
    (target = "selected", options) => {
      selectedIndexUpdateTimeout.current = window.setTimeout(() => {
        const root = getRootElement(targetRef.current);
        const items = findElementsBySelector(
          `#${listId.current} [data-combobox-option]`,
          root
        );
        const index = items.findIndex((option) => option.hasAttribute(`data-combobox-${target}`));
        selectedOptionIndex.current = index;
        if (options?.scrollIntoView) {
          items[index]?.scrollIntoView({ block: "nearest", behavior: scrollBehavior });
        }
      }, 0);
    },
    []
  );
  const resetSelectedOption = useCallback(() => {
    selectedOptionIndex.current = -1;
    clearSelectedItem();
  }, [clearSelectedItem]);
  const clickSelectedOption = useCallback(() => {
    const root = getRootElement(targetRef.current);
    const items = findElementsBySelector(
      `#${listId.current} [data-combobox-option]`,
      root
    );
    const item = items?.[selectedOptionIndex.current];
    item?.click();
  }, []);
  const setListId = useCallback((id) => {
    listId.current = id;
  }, []);
  const focusSearchInput = useCallback(() => {
    focusSearchTimeout.current = window.setTimeout(() => searchRef.current?.focus(), 0);
  }, []);
  const focusTarget = useCallback(() => {
    focusTargetTimeout.current = window.setTimeout(() => targetRef.current?.focus(), 0);
  }, []);
  const getSelectedOptionIndex = useCallback(() => selectedOptionIndex.current, []);
  useEffect(
    () => () => {
      window.clearTimeout(focusSearchTimeout.current);
      window.clearTimeout(focusTargetTimeout.current);
      window.clearTimeout(selectedIndexUpdateTimeout.current);
    },
    []
  );
  return {
    dropdownOpened,
    openDropdown,
    closeDropdown,
    toggleDropdown,
    selectedOptionIndex: selectedOptionIndex.current,
    getSelectedOptionIndex,
    selectOption,
    selectFirstOption,
    selectActiveOption,
    selectNextOption,
    selectPreviousOption,
    resetSelectedOption,
    updateSelectedOptionIndex,
    listId: listId.current,
    setListId,
    clickSelectedOption,
    searchRef,
    focusSearchInput,
    targetRef,
    focusTarget
  };
}

export { useCombobox };
//# sourceMappingURL=use-combobox.mjs.map
