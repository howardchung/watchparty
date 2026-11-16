'use client';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useMemo, useRef, useEffect } from 'react';
import { useId, useUncontrolled, usePrevious } from '@mantine/hooks';
import '../../core/utils/units-converters/rem.mjs';
import 'clsx';
import { useResolvedStylesApi } from '../../core/styles-api/use-resolved-styles-api/use-resolved-styles-api.mjs';
import '../../core/MantineProvider/Mantine.context.mjs';
import '../../core/MantineProvider/default-theme.mjs';
import '../../core/MantineProvider/MantineProvider.mjs';
import '../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.mjs';
import { useProps } from '../../core/MantineProvider/use-props/use-props.mjs';
import '../../core/MantineProvider/MantineCssVariables/MantineCssVariables.mjs';
import '../../core/Box/Box.mjs';
import { factory } from '../../core/factory/factory.mjs';
import '../../core/DirectionProvider/DirectionProvider.mjs';
import { getParsedComboboxData } from '../Combobox/get-parsed-combobox-data/get-parsed-combobox-data.mjs';
import { getOptionsLockup } from '../Combobox/get-options-lockup/get-options-lockup.mjs';
import '../Combobox/ComboboxChevron/ComboboxChevron.mjs';
import { Combobox } from '../Combobox/Combobox.mjs';
import '../Combobox/ComboboxDropdown/ComboboxDropdown.mjs';
import '../Combobox/ComboboxOptions/ComboboxOptions.mjs';
import '../Combobox/ComboboxOption/ComboboxOption.mjs';
import '../Combobox/ComboboxTarget/ComboboxTarget.mjs';
import '../Combobox/ComboboxSearch/ComboboxSearch.mjs';
import '../Combobox/ComboboxEmpty/ComboboxEmpty.mjs';
import '../Combobox/ComboboxFooter/ComboboxFooter.mjs';
import '../Combobox/ComboboxHeader/ComboboxHeader.mjs';
import '../Combobox/ComboboxEventsTarget/ComboboxEventsTarget.mjs';
import '../Combobox/ComboboxDropdownTarget/ComboboxDropdownTarget.mjs';
import '../Combobox/ComboboxGroup/ComboboxGroup.mjs';
import '../Combobox/ComboboxClearButton/ComboboxClearButton.mjs';
import '../Combobox/ComboboxHiddenInput/ComboboxHiddenInput.mjs';
import { OptionsDropdown } from '../Combobox/OptionsDropdown/OptionsDropdown.mjs';
import { useCombobox } from '../Combobox/use-combobox/use-combobox.mjs';
import '../Combobox/Combobox.context.mjs';
import { InputBase } from '../InputBase/InputBase.mjs';

const defaultProps = {
  withCheckIcon: true,
  allowDeselect: true,
  checkIconPosition: "left"
};
const Select = factory((_props, ref) => {
  const props = useProps("Select", defaultProps, _props);
  const {
    classNames,
    styles,
    unstyled,
    vars,
    dropdownOpened,
    defaultDropdownOpened,
    onDropdownClose,
    onDropdownOpen,
    onFocus,
    onBlur,
    onClick,
    onChange,
    data,
    value,
    defaultValue,
    selectFirstOptionOnChange,
    onOptionSubmit,
    comboboxProps,
    readOnly,
    disabled,
    filter,
    limit,
    withScrollArea,
    maxDropdownHeight,
    size,
    searchable,
    rightSection,
    checkIconPosition,
    withCheckIcon,
    withAlignedLabels,
    nothingFoundMessage,
    name,
    form,
    searchValue,
    defaultSearchValue,
    onSearchChange,
    allowDeselect,
    error,
    rightSectionPointerEvents,
    id,
    clearable,
    clearButtonProps,
    hiddenInputProps,
    renderOption,
    onClear,
    autoComplete,
    scrollAreaProps,
    __defaultRightSection,
    __clearSection,
    __clearable,
    chevronColor,
    autoSelectOnBlur,
    attributes,
    ...others
  } = props;
  const parsedData = useMemo(() => getParsedComboboxData(data), [data]);
  const retainedSelectedOptions = useRef({});
  const optionsLockup = useMemo(() => getOptionsLockup(parsedData), [parsedData]);
  const _id = useId(id);
  const [_value, setValue, controlled] = useUncontrolled({
    value,
    defaultValue,
    finalValue: null,
    onChange
  });
  const selectedOption = typeof _value === "string" ? _value in optionsLockup ? optionsLockup[_value] : retainedSelectedOptions.current[_value] : void 0;
  const previousSelectedOption = usePrevious(selectedOption);
  const [search, setSearch, searchControlled] = useUncontrolled({
    value: searchValue,
    defaultValue: defaultSearchValue,
    finalValue: selectedOption ? selectedOption.label : "",
    onChange: onSearchChange
  });
  const combobox = useCombobox({
    opened: dropdownOpened,
    defaultOpened: defaultDropdownOpened,
    onDropdownOpen: () => {
      onDropdownOpen?.();
      combobox.updateSelectedOptionIndex("active", { scrollIntoView: true });
    },
    onDropdownClose: () => {
      onDropdownClose?.();
      setTimeout(combobox.resetSelectedOption, 0);
    }
  });
  const handleSearchChange = (value2) => {
    setSearch(value2);
    combobox.resetSelectedOption();
  };
  const { resolvedClassNames, resolvedStyles } = useResolvedStylesApi({
    props,
    styles,
    classNames
  });
  useEffect(() => {
    if (selectFirstOptionOnChange) {
      combobox.selectFirstOption();
    }
  }, [selectFirstOptionOnChange, search]);
  useEffect(() => {
    if (value === null) {
      handleSearchChange("");
    }
    if (typeof value === "string" && selectedOption && (previousSelectedOption?.value !== selectedOption.value || previousSelectedOption?.label !== selectedOption.label)) {
      handleSearchChange(selectedOption.label);
    }
  }, [value, selectedOption]);
  useEffect(() => {
    if (!controlled && !searchControlled) {
      handleSearchChange(
        typeof _value === "string" ? _value in optionsLockup ? optionsLockup[_value]?.label : retainedSelectedOptions.current[_value]?.label || "" : ""
      );
    }
  }, [optionsLockup, _value]);
  useEffect(() => {
    if (_value) {
      if (_value in optionsLockup) {
        retainedSelectedOptions.current[_value] = optionsLockup[_value];
      }
    }
  }, [optionsLockup, _value]);
  const clearButton = /* @__PURE__ */ jsx(
    Combobox.ClearButton,
    {
      ...clearButtonProps,
      onClear: () => {
        setValue(null, null);
        handleSearchChange("");
        onClear?.();
      }
    }
  );
  const _clearable = clearable && !!_value && !disabled && !readOnly;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      Combobox,
      {
        store: combobox,
        __staticSelector: "Select",
        classNames: resolvedClassNames,
        styles: resolvedStyles,
        unstyled,
        readOnly,
        size,
        attributes,
        keepMounted: autoSelectOnBlur,
        onOptionSubmit: (val) => {
          onOptionSubmit?.(val);
          const optionLockup = allowDeselect ? optionsLockup[val].value === _value ? null : optionsLockup[val] : optionsLockup[val];
          const nextValue = optionLockup ? optionLockup.value : null;
          nextValue !== _value && setValue(nextValue, optionLockup);
          !controlled && handleSearchChange(typeof nextValue === "string" ? optionLockup?.label || "" : "");
          combobox.closeDropdown();
        },
        ...comboboxProps,
        children: [
          /* @__PURE__ */ jsx(Combobox.Target, { targetType: searchable ? "input" : "button", autoComplete, children: /* @__PURE__ */ jsx(
            InputBase,
            {
              id: _id,
              ref,
              __defaultRightSection: /* @__PURE__ */ jsx(
                Combobox.Chevron,
                {
                  size,
                  error,
                  unstyled,
                  color: chevronColor
                }
              ),
              __clearSection: clearButton,
              __clearable: _clearable,
              rightSection,
              rightSectionPointerEvents: rightSectionPointerEvents || "none",
              ...others,
              size,
              __staticSelector: "Select",
              disabled,
              readOnly: readOnly || !searchable,
              value: search,
              onChange: (event) => {
                handleSearchChange(event.currentTarget.value);
                combobox.openDropdown();
                selectFirstOptionOnChange && combobox.selectFirstOption();
              },
              onFocus: (event) => {
                !!searchable && combobox.openDropdown();
                onFocus?.(event);
              },
              onBlur: (event) => {
                if (autoSelectOnBlur) {
                  combobox.clickSelectedOption();
                }
                !!searchable && combobox.closeDropdown();
                const optionLockup = typeof _value === "string" && (_value in optionsLockup ? optionsLockup[_value] : retainedSelectedOptions.current[_value]);
                handleSearchChange(optionLockup ? optionLockup.label || "" : "");
                onBlur?.(event);
              },
              onClick: (event) => {
                searchable ? combobox.openDropdown() : combobox.toggleDropdown();
                onClick?.(event);
              },
              classNames: resolvedClassNames,
              styles: resolvedStyles,
              unstyled,
              pointer: !searchable,
              error,
              attributes
            }
          ) }),
          /* @__PURE__ */ jsx(
            OptionsDropdown,
            {
              data: parsedData,
              hidden: readOnly || disabled,
              filter,
              search,
              limit,
              hiddenWhenEmpty: !nothingFoundMessage,
              withScrollArea,
              maxDropdownHeight,
              filterOptions: !!searchable && selectedOption?.label !== search,
              value: _value,
              checkIconPosition,
              withCheckIcon,
              withAlignedLabels,
              nothingFoundMessage,
              unstyled,
              labelId: others.label ? `${_id}-label` : void 0,
              "aria-label": others.label ? void 0 : others["aria-label"],
              renderOption,
              scrollAreaProps
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      Combobox.HiddenInput,
      {
        value: _value,
        name,
        form,
        disabled,
        ...hiddenInputProps
      }
    )
  ] });
});
Select.classes = { ...InputBase.classes, ...Combobox.classes };
Select.displayName = "@mantine/core/Select";

export { Select };
//# sourceMappingURL=Select.mjs.map
