'use client';
import { jsx } from 'react/jsx-runtime';
import '../../../core/utils/units-converters/rem.mjs';
import { isElement } from '../../../core/utils/is-element/is-element.mjs';
import 'react';
import '@mantine/hooks';
import 'clsx';
import '../../../core/MantineProvider/Mantine.context.mjs';
import '../../../core/MantineProvider/default-theme.mjs';
import '../../../core/MantineProvider/MantineProvider.mjs';
import '../../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.mjs';
import '../../../core/MantineProvider/MantineCssVariables/MantineCssVariables.mjs';
import '../../../core/Box/Box.mjs';
import '../../../core/DirectionProvider/DirectionProvider.mjs';
import { Popover } from '../../Popover/Popover.mjs';
import '../../Popover/PopoverDropdown/PopoverDropdown.mjs';
import '../../Popover/PopoverTarget/PopoverTarget.mjs';
import { useMenuContext } from '../Menu.context.mjs';

function MenuSubTarget({ children, refProp }) {
  if (!isElement(children)) {
    throw new Error(
      "Menu.Sub.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
    );
  }
  useMenuContext();
  return /* @__PURE__ */ jsx(Popover.Target, { refProp, popupType: "menu", children });
}
MenuSubTarget.displayName = "@mantine/core/MenuSubTarget";

export { MenuSubTarget };
//# sourceMappingURL=MenuSubTarget.mjs.map
