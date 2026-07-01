'use client';
import { jsx, Fragment } from 'react/jsx-runtime';
import '../../components/Input/Input.mjs';
import '../../components/Input/InputWrapper/InputWrapper.mjs';
import '../../components/Input/InputDescription/InputDescription.mjs';
import '../../components/Input/InputError/InputError.mjs';
import '../../components/Input/InputLabel/InputLabel.mjs';
import '../../components/Input/InputPlaceholder/InputPlaceholder.mjs';
import '../../components/Input/InputClearButton/InputClearButton.mjs';
import '../../core/utils/units-converters/rem.mjs';
import 'react';
import '@mantine/hooks';
import 'clsx';
import '../../core/MantineProvider/Mantine.context.mjs';
import '../../core/MantineProvider/default-theme.mjs';
import '../../core/MantineProvider/MantineProvider.mjs';
import '../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.mjs';
import '../../core/MantineProvider/MantineCssVariables/MantineCssVariables.mjs';
import '../../core/Box/Box.mjs';
import '../../core/DirectionProvider/DirectionProvider.mjs';
import { useInputWrapperContext } from '../../components/Input/InputWrapper.context.mjs';

function InputsGroupFieldset({ children, role }) {
  const ctx = useInputWrapperContext();
  if (!ctx) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  return /* @__PURE__ */ jsx("div", { role, "aria-labelledby": ctx.labelId, "aria-describedby": ctx.describedBy, children });
}

export { InputsGroupFieldset };
//# sourceMappingURL=InputsGroupFieldset.mjs.map
