'use client';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useId } from '@mantine/hooks';
import '../../../core/utils/units-converters/rem.mjs';
import 'react';
import 'clsx';
import '../../../core/MantineProvider/Mantine.context.mjs';
import '../../../core/MantineProvider/default-theme.mjs';
import '../../../core/MantineProvider/MantineProvider.mjs';
import '../../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.mjs';
import { useProps } from '../../../core/MantineProvider/use-props/use-props.mjs';
import '../../../core/MantineProvider/MantineCssVariables/MantineCssVariables.mjs';
import { Box } from '../../../core/Box/Box.mjs';
import { factory } from '../../../core/factory/factory.mjs';
import '../../../core/DirectionProvider/DirectionProvider.mjs';
import { useComboboxContext } from '../Combobox.context.mjs';
import classes from '../Combobox.module.css.mjs';

const ComboboxGroup = factory((props, ref) => {
  const { classNames, className, style, styles, vars, children, label, id, ...others } = useProps(
    "ComboboxGroup",
    null,
    props
  );
  const ctx = useComboboxContext();
  const _id = useId(id);
  return /* @__PURE__ */ jsxs(
    Box,
    {
      ref,
      role: "group",
      "aria-labelledby": label ? _id : void 0,
      ...ctx.getStyles("group", { className, classNames, style, styles }),
      ...others,
      children: [
        label && /* @__PURE__ */ jsx("div", { id: _id, ...ctx.getStyles("groupLabel", { classNames, styles }), children: label }),
        children
      ]
    }
  );
});
ComboboxGroup.classes = classes;
ComboboxGroup.displayName = "@mantine/core/ComboboxGroup";

export { ComboboxGroup };
//# sourceMappingURL=ComboboxGroup.mjs.map
