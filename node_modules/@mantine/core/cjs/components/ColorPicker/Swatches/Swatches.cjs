'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
require('../../../core/utils/units-converters/rem.cjs');
require('@mantine/hooks');
require('clsx');
var luminance = require('../../../core/MantineProvider/color-functions/luminance/luminance.cjs');
require('../../../core/MantineProvider/Mantine.context.cjs');
require('../../../core/MantineProvider/default-theme.cjs');
require('../../../core/MantineProvider/MantineProvider.cjs');
require('../../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.cjs');
require('../../../core/MantineProvider/MantineCssVariables/MantineCssVariables.cjs');
var Box = require('../../../core/Box/Box.cjs');
require('../../../core/DirectionProvider/DirectionProvider.cjs');
require('../../Checkbox/Checkbox.cjs');
require('../../Checkbox/CheckboxGroup/CheckboxGroup.cjs');
var CheckIcon = require('../../Checkbox/CheckIcon.cjs');
require('../../Checkbox/CheckboxIndicator/CheckboxIndicator.cjs');
require('../../Checkbox/CheckboxCard/CheckboxCard.cjs');
require('../../Checkbox/CheckboxCard/CheckboxCard.context.cjs');
require('../../Checkbox/CheckboxGroup.context.cjs');
var ColorSwatch = require('../../ColorSwatch/ColorSwatch.cjs');
var ColorPicker_context = require('../ColorPicker.context.cjs');

const Swatches = React.forwardRef(
  ({
    className,
    datatype,
    setValue,
    onChangeEnd,
    size,
    focusable,
    data,
    swatchesPerRow,
    value,
    ...others
  }, ref) => {
    const ctx = ColorPicker_context.useColorPickerContext();
    const colors = data.map((color, index) => /* @__PURE__ */ React.createElement(
      ColorSwatch.ColorSwatch,
      {
        ...ctx.getStyles("swatch"),
        unstyled: ctx.unstyled,
        component: "button",
        type: "button",
        color,
        key: index,
        radius: "sm",
        onClick: () => {
          setValue(color);
          onChangeEnd?.(color);
        },
        "aria-label": color,
        tabIndex: focusable ? 0 : -1,
        "data-swatch": true
      },
      value === color && /* @__PURE__ */ jsxRuntime.jsx(CheckIcon.CheckIcon, { size: "35%", color: luminance.luminance(color) < 0.5 ? "white" : "black" })
    ));
    return /* @__PURE__ */ jsxRuntime.jsx(Box.Box, { ...ctx.getStyles("swatches"), ref, ...others, children: colors });
  }
);
Swatches.displayName = "@mantine/core/Swatches";

exports.Swatches = Swatches;
//# sourceMappingURL=Swatches.cjs.map
