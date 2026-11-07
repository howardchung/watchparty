'use client';
import { jsx } from 'react/jsx-runtime';
import '../../../core/utils/units-converters/rem.mjs';
import 'react';
import { createEventHandler } from '../../../core/utils/create-event-handler/create-event-handler.mjs';
import '@mantine/hooks';
import 'clsx';
import '../../../core/MantineProvider/Mantine.context.mjs';
import '../../../core/MantineProvider/default-theme.mjs';
import '../../../core/MantineProvider/MantineProvider.mjs';
import '../../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.mjs';
import { useProps } from '../../../core/MantineProvider/use-props/use-props.mjs';
import '../../../core/MantineProvider/MantineCssVariables/MantineCssVariables.mjs';
import '../../../core/Box/Box.mjs';
import '../../../core/DirectionProvider/DirectionProvider.mjs';
import { Popover } from '../../Popover/Popover.mjs';
import '../../Popover/PopoverDropdown/PopoverDropdown.mjs';
import '../../Popover/PopoverTarget/PopoverTarget.mjs';
import { useHoverCardContext } from '../HoverCard.context.mjs';
import { useHoverCardGroupContext } from '../HoverCardGroup/HoverCardGroup.context.mjs';

function HoverCardDropdown(props) {
  const { children, onMouseEnter, onMouseLeave, ...others } = useProps(
    "HoverCardDropdown",
    null,
    props
  );
  const ctx = useHoverCardContext();
  const withinGroup = useHoverCardGroupContext();
  if (withinGroup && ctx.getFloatingProps && ctx.floating) {
    const floatingProps = ctx.getFloatingProps();
    return /* @__PURE__ */ jsx(
      Popover.Dropdown,
      {
        ref: ctx.floating,
        ...floatingProps,
        onMouseEnter: createEventHandler(onMouseEnter, floatingProps.onMouseEnter),
        onMouseLeave: createEventHandler(onMouseLeave, floatingProps.onMouseLeave),
        ...others,
        children
      }
    );
  }
  const handleMouseEnter = createEventHandler(onMouseEnter, ctx.openDropdown);
  const handleMouseLeave = createEventHandler(onMouseLeave, ctx.closeDropdown);
  return /* @__PURE__ */ jsx(Popover.Dropdown, { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, ...others, children });
}
HoverCardDropdown.displayName = "@mantine/core/HoverCardDropdown";

export { HoverCardDropdown };
//# sourceMappingURL=HoverCardDropdown.mjs.map
