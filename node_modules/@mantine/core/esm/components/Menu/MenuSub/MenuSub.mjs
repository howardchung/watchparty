'use client';
import { jsx } from 'react/jsx-runtime';
import { useId, useDisclosure } from '@mantine/hooks';
import '../../../core/utils/units-converters/rem.mjs';
import 'react';
import 'clsx';
import '../../../core/MantineProvider/Mantine.context.mjs';
import '../../../core/MantineProvider/default-theme.mjs';
import '../../../core/MantineProvider/MantineProvider.mjs';
import '../../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.mjs';
import { useProps } from '../../../core/MantineProvider/use-props/use-props.mjs';
import '../../../core/MantineProvider/MantineCssVariables/MantineCssVariables.mjs';
import '../../../core/Box/Box.mjs';
import '../../../core/DirectionProvider/DirectionProvider.mjs';
import '../../../utils/Floating/FloatingArrow/FloatingArrow.mjs';
import { useDelayedHover } from '../../../utils/Floating/use-delayed-hover.mjs';
import { Popover } from '../../Popover/Popover.mjs';
import '../../Popover/PopoverDropdown/PopoverDropdown.mjs';
import '../../Popover/PopoverTarget/PopoverTarget.mjs';
import { MenuSubDropdown } from '../MenuSubDropdown/MenuSubDropdown.mjs';
import { MenuSubItem } from '../MenuSubItem/MenuSubItem.mjs';
import { MenuSubTarget } from '../MenuSubTarget/MenuSubTarget.mjs';
import { useSubMenuContext, SubMenuProvider } from './MenuSub.context.mjs';

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
  const { children, closeDelay, openDelay, ...others } = useProps("MenuSub", defaultProps, _props);
  const id = useId();
  const [opened, { open, close }] = useDisclosure(false);
  const ctx = useSubMenuContext();
  const { openDropdown, closeDropdown } = useDelayedHover({
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
  return /* @__PURE__ */ jsx(
    SubMenuProvider,
    {
      value: {
        opened,
        close: closeDropdown,
        open: openDropdown,
        focusFirstItem,
        focusParentItem,
        parentContext: ctx
      },
      children: /* @__PURE__ */ jsx(Popover, { opened, withinPortal: false, withArrow: false, id, ...others, children })
    }
  );
}
MenuSub.extend = (input) => input;
MenuSub.displayName = "@mantine/core/MenuSub";
MenuSub.Target = MenuSubTarget;
MenuSub.Dropdown = MenuSubDropdown;
MenuSub.Item = MenuSubItem;

export { MenuSub };
//# sourceMappingURL=MenuSub.mjs.map
