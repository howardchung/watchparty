'use client';
import { jsx } from 'react/jsx-runtime';
import { forwardRef, createElement } from 'react';
import '../../../core/utils/units-converters/rem.mjs';
import '@mantine/hooks';
import 'clsx';
import { luminance } from '../../../core/MantineProvider/color-functions/luminance/luminance.mjs';
import '../../../core/MantineProvider/Mantine.context.mjs';
import '../../../core/MantineProvider/default-theme.mjs';
import '../../../core/MantineProvider/MantineProvider.mjs';
import '../../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.mjs';
import '../../../core/MantineProvider/MantineCssVariables/MantineCssVariables.mjs';
import { Box } from '../../../core/Box/Box.mjs';
import '../../../core/DirectionProvider/DirectionProvider.mjs';
import '../../Checkbox/Checkbox.mjs';
import '../../Checkbox/CheckboxGroup/CheckboxGroup.mjs';
import { CheckIcon } from '../../Checkbox/CheckIcon.mjs';
import '../../Checkbox/CheckboxIndicator/CheckboxIndicator.mjs';
import '../../Checkbox/CheckboxCard/CheckboxCard.mjs';
import '../../Checkbox/CheckboxCard/CheckboxCard.context.mjs';
import '../../Checkbox/CheckboxGroup.context.mjs';
import { ColorSwatch } from '../../ColorSwatch/ColorSwatch.mjs';
import { useColorPickerContext } from '../ColorPicker.context.mjs';

const Swatches = forwardRef(
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
    const ctx = useColorPickerContext();
    const colors = data.map((color, index) => /* @__PURE__ */ createElement(
      ColorSwatch,
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
      value === color && /* @__PURE__ */ jsx(CheckIcon, { size: "35%", color: luminance(color) < 0.5 ? "white" : "black" })
    ));
    return /* @__PURE__ */ jsx(Box, { ...ctx.getStyles("swatches"), ref, ...others, children: colors });
  }
);
Swatches.displayName = "@mantine/core/Swatches";

export { Swatches };
//# sourceMappingURL=Swatches.mjs.map
