'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
require('../../../core/utils/units-converters/rem.cjs');
var createEventHandler = require('../../../core/utils/create-event-handler/create-event-handler.cjs');
require('@mantine/hooks');
var getSingleElementChild = require('../../../core/utils/get-single-element-child/get-single-element-child.cjs');
require('clsx');
require('../../../core/MantineProvider/Mantine.context.cjs');
require('../../../core/MantineProvider/default-theme.cjs');
require('../../../core/MantineProvider/MantineProvider.cjs');
require('../../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.cjs');
var useProps = require('../../../core/MantineProvider/use-props/use-props.cjs');
require('../../../core/MantineProvider/MantineCssVariables/MantineCssVariables.cjs');
require('../../../core/Box/Box.cjs');
require('../../../core/DirectionProvider/DirectionProvider.cjs');
var Popover = require('../../Popover/Popover.cjs');
require('../../Popover/PopoverDropdown/PopoverDropdown.cjs');
require('../../Popover/PopoverTarget/PopoverTarget.cjs');
var Menu_context = require('../Menu.context.cjs');

const defaultProps = {
  refProp: "ref"
};
const MenuTarget = React.forwardRef((props, ref) => {
  const { children, refProp, ...others } = useProps.useProps("MenuTarget", defaultProps, props);
  const child = getSingleElementChild.getSingleElementChild(children);
  if (!child) {
    throw new Error(
      "Menu.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
    );
  }
  const ctx = Menu_context.useMenuContext();
  const _childProps = child.props;
  const onClick = createEventHandler.createEventHandler(_childProps.onClick, () => {
    if (ctx.trigger === "click") {
      ctx.toggleDropdown();
    } else if (ctx.trigger === "click-hover") {
      ctx.setOpenedViaClick(true);
      if (!ctx.opened) {
        ctx.openDropdown();
      }
    }
  });
  const onMouseEnter = createEventHandler.createEventHandler(
    _childProps.onMouseEnter,
    () => (ctx.trigger === "hover" || ctx.trigger === "click-hover") && ctx.openDropdown()
  );
  const onMouseLeave = createEventHandler.createEventHandler(_childProps.onMouseLeave, () => {
    if (ctx.trigger === "hover") {
      ctx.closeDropdown();
    } else if (ctx.trigger === "click-hover" && !ctx.openedViaClick) {
      ctx.closeDropdown();
    }
  });
  return /* @__PURE__ */ jsxRuntime.jsx(Popover.Popover.Target, { refProp, popupType: "menu", ref, ...others, children: React.cloneElement(child, {
    onClick,
    onMouseEnter,
    onMouseLeave,
    "data-expanded": ctx.opened ? true : void 0
  }) });
});
MenuTarget.displayName = "@mantine/core/MenuTarget";

exports.MenuTarget = MenuTarget;
//# sourceMappingURL=MenuTarget.cjs.map
