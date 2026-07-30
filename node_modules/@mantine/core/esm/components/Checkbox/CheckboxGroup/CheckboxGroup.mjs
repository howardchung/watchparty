'use client';
import { jsx } from 'react/jsx-runtime';
import { useUncontrolled } from '@mantine/hooks';
import '../../../core/utils/units-converters/rem.mjs';
import 'react';
import 'clsx';
import '../../../core/MantineProvider/Mantine.context.mjs';
import '../../../core/MantineProvider/default-theme.mjs';
import '../../../core/MantineProvider/MantineProvider.mjs';
import '../../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.mjs';
import { useProps } from '../../../core/MantineProvider/use-props/use-props.mjs';
import '../../../core/MantineProvider/MantineCssVariables/MantineCssVariables.mjs';
import '../../../core/Box/Box.mjs';
import { factory } from '../../../core/factory/factory.mjs';
import '../../../core/DirectionProvider/DirectionProvider.mjs';
import { InputsGroupFieldset } from '../../../utils/InputsGroupFieldset/InputsGroupFieldset.mjs';
import { Input } from '../../Input/Input.mjs';
import '../../Input/InputWrapper/InputWrapper.mjs';
import '../../Input/InputDescription/InputDescription.mjs';
import '../../Input/InputError/InputError.mjs';
import '../../Input/InputLabel/InputLabel.mjs';
import '../../Input/InputPlaceholder/InputPlaceholder.mjs';
import '../../Input/InputClearButton/InputClearButton.mjs';
import '../../Input/InputWrapper.context.mjs';
import { CheckboxGroupProvider } from '../CheckboxGroup.context.mjs';

const CheckboxGroup = factory((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    size,
    wrapperProps,
    children,
    readOnly,
    disabled,
    ...others
  } = useProps("CheckboxGroup", null, props);
  const [_value, setValue] = useUncontrolled({
    value,
    defaultValue,
    finalValue: [],
    onChange
  });
  const handleChange = (event) => {
    const itemValue = typeof event === "string" ? event : event.currentTarget.value;
    !readOnly && setValue(
      _value.includes(itemValue) ? _value.filter((item) => item !== itemValue) : [..._value, itemValue]
    );
  };
  return /* @__PURE__ */ jsx(CheckboxGroupProvider, { value: { value: _value, onChange: handleChange, size, disabled }, children: /* @__PURE__ */ jsx(
    Input.Wrapper,
    {
      size,
      ref,
      ...wrapperProps,
      ...others,
      labelElement: "div",
      __staticSelector: "CheckboxGroup",
      children: /* @__PURE__ */ jsx(InputsGroupFieldset, { role: "group", children })
    }
  ) });
});
CheckboxGroup.classes = Input.Wrapper.classes;
CheckboxGroup.displayName = "@mantine/core/CheckboxGroup";

export { CheckboxGroup };
//# sourceMappingURL=CheckboxGroup.mjs.map
