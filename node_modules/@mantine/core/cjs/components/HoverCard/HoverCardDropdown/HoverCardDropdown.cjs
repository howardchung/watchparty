'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');
require('../../../core/utils/units-converters/rem.cjs');
require('react');
var createEventHandler = require('../../../core/utils/create-event-handler/create-event-handler.cjs');
require('@mantine/hooks');
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
var HoverCard_context = require('../HoverCard.context.cjs');
var HoverCardGroup_context = require('../HoverCardGroup/HoverCardGroup.context.cjs');

function HoverCardDropdown(props) {
  const { children, onMouseEnter, onMouseLeave, ...others } = useProps.useProps(
    "HoverCardDropdown",
    null,
    props
  );
  const ctx = HoverCard_context.useHoverCardContext();
  const withinGroup = HoverCardGroup_context.useHoverCardGroupContext();
  if (withinGroup && ctx.getFloatingProps && ctx.floating) {
    const floatingProps = ctx.getFloatingProps();
    return /* @__PURE__ */ jsxRuntime.jsx(
      Popover.Popover.Dropdown,
      {
        ref: ctx.floating,
        ...floatingProps,
        onMouseEnter: createEventHandler.createEventHandler(onMouseEnter, floatingProps.onMouseEnter),
        onMouseLeave: createEventHandler.createEventHandler(onMouseLeave, floatingProps.onMouseLeave),
        ...others,
        children
      }
    );
  }
  const handleMouseEnter = createEventHandler.createEventHandler(onMouseEnter, ctx.openDropdown);
  const handleMouseLeave = createEventHandler.createEventHandler(onMouseLeave, ctx.closeDropdown);
  return /* @__PURE__ */ jsxRuntime.jsx(Popover.Popover.Dropdown, { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, ...others, children });
}
HoverCardDropdown.displayName = "@mantine/core/HoverCardDropdown";

exports.HoverCardDropdown = HoverCardDropdown;
//# sourceMappingURL=HoverCardDropdown.cjs.map
