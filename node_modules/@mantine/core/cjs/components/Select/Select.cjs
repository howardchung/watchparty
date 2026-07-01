'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var hooks = require('@mantine/hooks');
require('../../core/utils/units-converters/rem.cjs');
require('clsx');
var useResolvedStylesApi = require('../../core/styles-api/use-resolved-styles-api/use-resolved-styles-api.cjs');
require('../../core/MantineProvider/Mantine.context.cjs');
require('../../core/MantineProvider/default-theme.cjs');
require('../../core/MantineProvider/MantineProvider.cjs');
require('../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.cjs');
var useProps = require('../../core/MantineProvider/use-props/use-props.cjs');
require('../../core/MantineProvider/MantineCssVariables/MantineCssVariables.cjs');
require('../../core/Box/Box.cjs');
var factory = require('../../core/factory/factory.cjs');
require('../../core/DirectionProvider/DirectionProvider.cjs');
var getParsedComboboxData = require('../Combobox/get-parsed-combobox-data/get-parsed-combobox-data.cjs');
var getOptionsLockup = require('../Combobox/get-options-lockup/get-options-lockup.cjs');
require('../Combobox/ComboboxChevron/ComboboxChevron.cjs');
var Combobox = require('../Combobox/Combobox.cjs');
require('../Combobox/ComboboxDropdown/ComboboxDropdown.cjs');
require('../Combobox/ComboboxOptions/ComboboxOptions.cjs');
require('../Combobox/ComboboxOption/ComboboxOption.cjs');
require('../Combobox/ComboboxTarget/ComboboxTarget.cjs');
require('../Combobox/ComboboxSearch/ComboboxSearch.cjs');
require('../Combobox/ComboboxEmpty/ComboboxEmpty.cjs');
require('../Combobox/ComboboxFooter/ComboboxFooter.cjs');
require('../Combobox/ComboboxHeader/ComboboxHeader.cjs');
require('../Combobox/ComboboxEventsTarget/ComboboxEventsTarget.cjs');
require('../Combobox/ComboboxDropdownTarget/ComboboxDropdownTarget.cjs');
require('../Combobox/ComboboxGroup/ComboboxGroup.cjs');
require('../Combobox/ComboboxClearButton/ComboboxClearButton.cjs');
require('../Combobox/ComboboxHiddenInput/ComboboxHiddenInput.cjs');
var OptionsDropdown = require('../Combobox/OptionsDropdown/OptionsDropdown.cjs');
var useCombobox = require('../Combobox/use-combobox/use-combobox.cjs');
require('../Combobox/Combobox.context.cjs');
var InputBase = require('../InputBase/InputBase.cjs');

const defaultProps = {
  withCheckIcon: true,
  allowDeselect: true,
  checkIconPosition: "left"
};
const Select = factory.factory((_props, ref) => {
  const props = useProps.useProps("Select", defaultProps, _props);
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
  const parsedData = React.useMemo(() => getParsedComboboxData.getParsedComboboxData(data), [data]);
  const retainedSelectedOptions = React.useRef({});
  const optionsLockup = React.useMemo(() => getOptionsLockup.getOptionsLockup(parsedData), [parsedData]);
  const _id = hooks.useId(id);
  const [_value, setValue, controlled] = hooks.useUncontrolled({
    value,
    defaultValue,
    finalValue: null,
    onChange
  });
  const selectedOption = typeof _value === "string" ? _value in optionsLockup ? optionsLockup[_value] : retainedSelectedOptions.current[_value] : void 0;
  const previousSelectedOption = hooks.usePrevious(selectedOption);
  const [search, setSearch, searchControlled] = hooks.useUncontrolled({
    value: searchValue,
    defaultValue: defaultSearchValue,
    finalValue: selectedOption ? selectedOption.label : "",
    onChange: onSearchChange
  });
  const combobox = useCombobox.useCombobox({
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
  const { resolvedClassNames, resolvedStyles } = useResolvedStylesApi.useResolvedStylesApi({
    props,
    styles,
    classNames
  });
  React.useEffect(() => {
    if (selectFirstOptionOnChange) {
      combobox.selectFirstOption();
    }
  }, [selectFirstOptionOnChange, search]);
  React.useEffect(() => {
    if (value === null) {
      handleSearchChange("");
    }
    if (typeof value === "string" && selectedOption && (previousSelectedOption?.value !== selectedOption.value || previousSelectedOption?.label !== selectedOption.label)) {
      handleSearchChange(selectedOption.label);
    }
  }, [value, selectedOption]);
  React.useEffect(() => {
    if (!controlled && !searchControlled) {
      handleSearchChange(
        typeof _value === "string" ? _value in optionsLockup ? optionsLockup[_value]?.label : retainedSelectedOptions.current[_value]?.label || "" : ""
      );
    }
  }, [optionsLockup, _value]);
  React.useEffect(() => {
    if (_value) {
      if (_value in optionsLockup) {
        retainedSelectedOptions.current[_value] = optionsLockup[_value];
      }
    }
  }, [optionsLockup, _value]);
  const clearButton = /* @__PURE__ */ jsxRuntime.jsx(
    Combobox.Combobox.ClearButton,
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
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      Combobox.Combobox,
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
          /* @__PURE__ */ jsxRuntime.jsx(Combobox.Combobox.Target, { targetType: searchable ? "input" : "button", autoComplete, children: /* @__PURE__ */ jsxRuntime.jsx(
            InputBase.InputBase,
            {
              id: _id,
              ref,
              __defaultRightSection: /* @__PURE__ */ jsxRuntime.jsx(
                Combobox.Combobox.Chevron,
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
          /* @__PURE__ */ jsxRuntime.jsx(
            OptionsDropdown.OptionsDropdown,
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
    /* @__PURE__ */ jsxRuntime.jsx(
      Combobox.Combobox.HiddenInput,
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
Select.classes = { ...InputBase.InputBase.classes, ...Combobox.Combobox.classes };
Select.displayName = "@mantine/core/Select";

exports.Select = Select;
//# sourceMappingURL=Select.cjs.map
