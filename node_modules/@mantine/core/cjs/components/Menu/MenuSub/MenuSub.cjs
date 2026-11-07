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
require('../../../core/Box/Box.cjs');
require('../../../core/DirectionProvider/DirectionProvider.cjs');
require('../../../utils/Floating/FloatingArrow/FloatingArrow.cjs');
var useDelayedHover = require('../../../utils/Floating/use-delayed-hover.cjs');
var Popover = require('../../Popover/Popover.cjs');
require('../../Popover/PopoverDropdown/PopoverDropdown.cjs');
require('../../Popover/PopoverTarget/PopoverTarget.cjs');
var MenuSubDropdown = require('../MenuSubDropdown/MenuSubDropdown.cjs');
var MenuSubItem = require('../MenuSubItem/MenuSubItem.cjs');
var MenuSubTarget = require('../MenuSubTarget/MenuSubTarget.cjs');
var MenuSub_context = require('./MenuSub.context.cjs');

const defaultProps = {
  offset: 0,
  position: "right-start",
  transitionProps: { duration: 0 },
  openDelay: 0,
  middlewares: {
    shift: {
      // Enable crossAxis shift to keep submenu dropdown within viewport bounds when positioned horizontally
      crossAxis: true
    }
  }
};
function MenuSub(_props) {
  const { children, closeDelay, openDelay, ...others } = useProps.useProps("MenuSub", defaultProps, _props);
  const id = hooks.useId();
  const [opened, { open, close }] = hooks.useDisclosure(false);
  const ctx = MenuSub_context.useSubMenuContext();
  const { openDropdown, closeDropdown } = useDelayedHover.useDelayedHover({
    open,
    close,
    closeDelay,
    openDelay
  });
  const focusFirstItem = () => window.setTimeout(() => {
    document.getElementById(`${id}-dropdown`)?.querySelectorAll("[data-menu-item]:not([data-disabled])")[0]?.focus();
  }, 16);
  const focusParentItem = () => window.setTimeout(() => {
    document.getElementById(`${id}-target`)?.focus();
  }, 16);
  return /* @__PURE__ */ jsxRuntime.jsx(
    MenuSub_context.SubMenuProvider,
    {
      value: {
        opened,
        close: closeDropdown,
        open: openDropdown,
        focusFirstItem,
        focusParentItem,
        parentContext: ctx
      },
      children: /* @__PURE__ */ jsxRuntime.jsx(Popover.Popover, { opened, withinPortal: false, withArrow: false, id, ...others, children })
    }
  );
}
MenuSub.extend = (input) => input;
MenuSub.displayName = "@mantine/core/MenuSub";
MenuSub.Target = MenuSubTarget.MenuSubTarget;
MenuSub.Dropdown = MenuSubDropdown.MenuSubDropdown;
MenuSub.Item = MenuSubItem.MenuSubItem;

exports.MenuSub = MenuSub;
//# sourceMappingURL=MenuSub.cjs.map
