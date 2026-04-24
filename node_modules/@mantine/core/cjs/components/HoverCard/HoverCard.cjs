'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');
require('../../core/utils/units-converters/rem.cjs');
require('react');
require('@mantine/hooks');
require('clsx');
require('../../core/MantineProvider/Mantine.context.cjs');
require('../../core/MantineProvider/default-theme.cjs');
require('../../core/MantineProvider/MantineProvider.cjs');
require('../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.cjs');
var useProps = require('../../core/MantineProvider/use-props/use-props.cjs');
require('../../core/MantineProvider/MantineCssVariables/MantineCssVariables.cjs');
require('../../core/Box/Box.cjs');
require('../../core/DirectionProvider/DirectionProvider.cjs');
var Popover = require('../Popover/Popover.cjs');
require('../Popover/PopoverDropdown/PopoverDropdown.cjs');
require('../Popover/PopoverTarget/PopoverTarget.cjs');
var HoverCard_context = require('./HoverCard.context.cjs');
var HoverCardDropdown = require('./HoverCardDropdown/HoverCardDropdown.cjs');
var HoverCardGroup = require('./HoverCardGroup/HoverCardGroup.cjs');
var HoverCardTarget = require('./HoverCardTarget/HoverCardTarget.cjs');
var useHoverCard = require('./use-hover-card.cjs');

const defaultProps = {
  openDelay: 0,
  closeDelay: 150,
  initiallyOpened: false
};
function HoverCard(props) {
  const { children, onOpen, onClose, openDelay, closeDelay, initiallyOpened, ...others } = useProps.useProps(
    "HoverCard",
    defaultProps,
    props
  );
  const hoverCard = useHoverCard.useHoverCard({
    openDelay,
    closeDelay,
    defaultOpened: initiallyOpened,
    onOpen,
    onClose
  });
  return /* @__PURE__ */ jsxRuntime.jsx(
    HoverCard_context.HoverCardContextProvider,
    {
      value: {
        openDropdown: hoverCard.openDropdown,
        closeDropdown: hoverCard.closeDropdown,
        getReferenceProps: hoverCard.getReferenceProps,
        getFloatingProps: hoverCard.getFloatingProps,
        reference: hoverCard.reference,
        floating: hoverCard.floating
      },
      children: /* @__PURE__ */ jsxRuntime.jsx(Popover.Popover, { ...others, opened: hoverCard.opened, __staticSelector: "HoverCard", children })
    }
  );
}
HoverCard.displayName = "@mantine/core/HoverCard";
HoverCard.Target = HoverCardTarget.HoverCardTarget;
HoverCard.Dropdown = HoverCardDropdown.HoverCardDropdown;
HoverCard.Group = HoverCardGroup.HoverCardGroup;
HoverCard.extend = (input) => input;

exports.HoverCard = HoverCard;
//# sourceMappingURL=HoverCard.cjs.map
