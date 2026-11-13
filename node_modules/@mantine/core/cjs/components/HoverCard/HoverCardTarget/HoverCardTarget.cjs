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
var HoverCard_context = require('../HoverCard.context.cjs');
var HoverCardGroup_context = require('../HoverCardGroup/HoverCardGroup.context.cjs');

const defaultProps = {
  refProp: "ref"
};
const HoverCardTarget = React.forwardRef((props, ref) => {
  const { children, refProp, eventPropsWrapperName, ...others } = useProps.useProps(
    "HoverCardTarget",
    defaultProps,
    props
  );
  const child = getSingleElementChild.getSingleElementChild(children);
  if (!child) {
    throw new Error(
      "HoverCard.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
    );
  }
  const ctx = HoverCard_context.useHoverCardContext();
  const withinGroup = HoverCardGroup_context.useHoverCardGroupContext();
  if (withinGroup && ctx.getReferenceProps && ctx.reference) {
    const referenceProps = ctx.getReferenceProps();
    return /* @__PURE__ */ jsxRuntime.jsx(Popover.Popover.Target, { refProp, ref, ...others, children: React.cloneElement(
      child,
      eventPropsWrapperName ? { [eventPropsWrapperName]: { ...referenceProps, ref: ctx.reference } } : { ...referenceProps, ref: ctx.reference }
    ) });
  }
  const onMouseEnter = createEventHandler.createEventHandler(child.props.onMouseEnter, ctx.openDropdown);
  const onMouseLeave = createEventHandler.createEventHandler(child.props.onMouseLeave, ctx.closeDropdown);
  const eventListeners = { onMouseEnter, onMouseLeave };
  return /* @__PURE__ */ jsxRuntime.jsx(Popover.Popover.Target, { refProp, ref, ...others, children: React.cloneElement(
    child,
    eventPropsWrapperName ? { [eventPropsWrapperName]: eventListeners } : eventListeners
  ) });
});
HoverCardTarget.displayName = "@mantine/core/HoverCardTarget";

exports.HoverCardTarget = HoverCardTarget;
//# sourceMappingURL=HoverCardTarget.cjs.map
