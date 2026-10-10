'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');
require('../../../core/utils/units-converters/rem.cjs');
var isElement = require('../../../core/utils/is-element/is-element.cjs');
require('react');
require('@mantine/hooks');
require('clsx');
require('../../../core/MantineProvider/Mantine.context.cjs');
require('../../../core/MantineProvider/default-theme.cjs');
require('../../../core/MantineProvider/MantineProvider.cjs');
require('../../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.cjs');
require('../../../core/MantineProvider/MantineCssVariables/MantineCssVariables.cjs');
require('../../../core/Box/Box.cjs');
require('../../../core/DirectionProvider/DirectionProvider.cjs');
var Popover = require('../../Popover/Popover.cjs');
require('../../Popover/PopoverDropdown/PopoverDropdown.cjs');
require('../../Popover/PopoverTarget/PopoverTarget.cjs');
var Menu_context = require('../Menu.context.cjs');

function MenuSubTarget({ children, refProp }) {
  if (!isElement.isElement(children)) {
    throw new Error(
      "Menu.Sub.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
    );
  }
  Menu_context.useMenuContext();
  return /* @__PURE__ */ jsxRuntime.jsx(Popover.Popover.Target, { refProp, popupType: "menu", children });
}
MenuSubTarget.displayName = "@mantine/core/MenuSubTarget";

exports.MenuSubTarget = MenuSubTarget;
//# sourceMappingURL=MenuSubTarget.cjs.map
