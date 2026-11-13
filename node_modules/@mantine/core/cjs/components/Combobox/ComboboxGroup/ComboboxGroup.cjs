'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var hooks = require('@mantine/hooks');
require('../../../core/utils/units-converters/rem.cjs');
require('react');
require('clsx');
require('../../../core/MantineProvider/Mantine.context.cjs');
require('../../../core/MantineProvider/default-theme.cjs');
require('../../../core/MantineProvider/MantineProvider.cjs');
require('../../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.cjs');
var useProps = require('../../../core/MantineProvider/use-props/use-props.cjs');
require('../../../core/MantineProvider/MantineCssVariables/MantineCssVariables.cjs');
var Box = require('../../../core/Box/Box.cjs');
var factory = require('../../../core/factory/factory.cjs');
require('../../../core/DirectionProvider/DirectionProvider.cjs');
var Combobox_context = require('../Combobox.context.cjs');
var Combobox_module = require('../Combobox.module.css.cjs');

const ComboboxGroup = factory.factory((props, ref) => {
  const { classNames, className, style, styles, vars, children, label, id, ...others } = useProps.useProps(
    "ComboboxGroup",
    null,
    props
  );
  const ctx = Combobox_context.useComboboxContext();
  const _id = hooks.useId(id);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    Box.Box,
    {
      ref,
      role: "group",
      "aria-labelledby": label ? _id : void 0,
      ...ctx.getStyles("group", { className, classNames, style, styles }),
      ...others,
      children: [
        label && /* @__PURE__ */ jsxRuntime.jsx("div", { id: _id, ...ctx.getStyles("groupLabel", { classNames, styles }), children: label }),
        children
      ]
    }
  );
});
ComboboxGroup.classes = Combobox_module;
ComboboxGroup.displayName = "@mantine/core/ComboboxGroup";

exports.ComboboxGroup = ComboboxGroup;
//# sourceMappingURL=ComboboxGroup.cjs.map
