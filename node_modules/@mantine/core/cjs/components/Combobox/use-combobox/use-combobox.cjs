'use client';
'use strict';

var React = require('react');
var hooks = require('@mantine/hooks');
require('../../../core/utils/units-converters/rem.cjs');
require('react/jsx-runtime');
var findElementInShadowDom = require('../../../core/utils/find-element-in-shadow-dom/find-element-in-shadow-dom.cjs');
var getIndex = require('./get-index/get-index.cjs');

function useCombobox({
  defaultOpened,
  opened,
  onOpenedChange,
  onDropdownClose,
  onDropdownOpen,
  loop = true,
  scrollBehavior = "instant"
} = {}) {
  const [dropdownOpened, setDropdownOpened] = hooks.useUncontrolled({
    value: opened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange: onOpenedChange
  });
  const listId = React.useRef(null);
  const selectedOptionIndex = React.useRef(-1);
  const searchRef = React.useRef(null);
  const targetRef = React.useRef(null);
  const focusSearchTimeout = React.useRef(-1);
  const focusTargetTimeout = React.useRef(-1);
  const selectedIndexUpdateTimeout = React.useRef(-1);
  const openDropdown = React.useCallback(
    (eventSource = "unknown") => {
      if (!dropdownOpened) {
        setDropdownOpened(true);
        onDropdownOpen?.(eventSource);
      }
    },
    [setDropdownOpened, onDropdownOpen, dropdownOpened]
  );
  const closeDropdown = React.useCallback(
    (eventSource = "unknown") => {
      if (dropdownOpened) {
        setDropdownOpened(false);
        onDropdownClose?.(eventSource);
      }
    },
    [setDropdownOpened, onDropdownClose, dropdownOpened]
  );
  const toggleDropdown = React.useCallback(
    (eventSource = "unknown") => {
      if (dropdownOpened) {
        closeDropdown(eventSource);
      } else {
        openDropdown(eventSource);
      }
    },
    [closeDropdown, openDropdown, dropdownOpened]
  );
  const clearSelectedItem = React.useCallback(() => {
    const root = findElementInShadowDom.getRootElement(targetRef.current);
    const selected = findElementInShadowDom.findElementBySelector(`#${listId.current} [data-combobox-selected]`, root);
    selected?.removeAttribute("data-combobox-selected");
    selected?.removeAttribute("aria-selected");
  }, []);
  const selectOption = React.useCallback(
    (index) => {
      const root = findElementInShadowDom.getRootElement(targetRef.current);
      const list = findElementInShadowDom.findElementBySelector(`#${listId.current}`, root);
      const items = list ? findElementInShadowDom.findElementsBySelector("[data-combobox-option]", list) : null;
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
  const selectActiveOption = React.useCallback(() => {
    const root = findElementInShadowDom.getRootElement(targetRef.current);
    const activeOption = findElementInShadowDom.findElementBySelector(
      `#${listId.current} [data-combobox-active]`,
      root
    );
    if (activeOption) {
      const items = findElementInShadowDom.findElementsBySelector(
        `#${listId.current} [data-combobox-option]`,
        root
      );
      const index = items.findIndex((option) => option === activeOption);
      return selectOption(index);
    }
    return selectOption(0);
  }, [selectOption]);
  const selectNextOption = React.useCallback(() => {
    const root = findElementInShadowDom.getRootElement(targetRef.current);
    const items = findElementInShadowDom.findElementsBySelector(
      `#${listId.current} [data-combobox-option]`,
      root
    );
    return selectOption(getIndex.getNextIndex(selectedOptionIndex.current, items, loop));
  }, [selectOption, loop]);
  const selectPreviousOption = React.useCallback(() => {
    const root = findElementInShadowDom.getRootElement(targetRef.current);
    const items = findElementInShadowDom.findElementsBySelector(
      `#${listId.current} [data-combobox-option]`,
      root
    );
    return selectOption(getIndex.getPreviousIndex(selectedOptionIndex.current, items, loop));
  }, [selectOption, loop]);
  const selectFirstOption = React.useCallback(() => {
    const root = findElementInShadowDom.getRootElement(targetRef.current);
    const items = findElementInShadowDom.findElementsBySelector(
      `#${listId.current} [data-combobox-option]`,
      root
    );
    return selectOption(getIndex.getFirstIndex(items));
  }, [selectOption]);
  const updateSelectedOptionIndex = React.useCallback(
    (target = "selected", options) => {
      selectedIndexUpdateTimeout.current = window.setTimeout(() => {
        const root = findElementInShadowDom.getRootElement(targetRef.current);
        const items = findElementInShadowDom.findElementsBySelector(
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
  const resetSelectedOption = React.useCallback(() => {
    selectedOptionIndex.current = -1;
    clearSelectedItem();
  }, [clearSelectedItem]);
  const clickSelectedOption = React.useCallback(() => {
    const root = findElementInShadowDom.getRootElement(targetRef.current);
    const items = findElementInShadowDom.findElementsBySelector(
      `#${listId.current} [data-combobox-option]`,
      root
    );
    const item = items?.[selectedOptionIndex.current];
    item?.click();
  }, []);
  const setListId = React.useCallback((id) => {
    listId.current = id;
  }, []);
  const focusSearchInput = React.useCallback(() => {
    focusSearchTimeout.current = window.setTimeout(() => searchRef.current?.focus(), 0);
  }, []);
  const focusTarget = React.useCallback(() => {
    focusTargetTimeout.current = window.setTimeout(() => targetRef.current?.focus(), 0);
  }, []);
  const getSelectedOptionIndex = React.useCallback(() => selectedOptionIndex.current, []);
  React.useEffect(
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

exports.useCombobox = useCombobox;
//# sourceMappingURL=use-combobox.cjs.map
