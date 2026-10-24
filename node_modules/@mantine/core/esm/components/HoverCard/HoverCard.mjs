'use client';
import { jsx } from 'react/jsx-runtime';
import '../../core/utils/units-converters/rem.mjs';
import 'react';
import '@mantine/hooks';
import 'clsx';
import '../../core/MantineProvider/Mantine.context.mjs';
import '../../core/MantineProvider/default-theme.mjs';
import '../../core/MantineProvider/MantineProvider.mjs';
import '../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.mjs';
import { useProps } from '../../core/MantineProvider/use-props/use-props.mjs';
import '../../core/MantineProvider/MantineCssVariables/MantineCssVariables.mjs';
import '../../core/Box/Box.mjs';
import '../../core/DirectionProvider/DirectionProvider.mjs';
import { Popover } from '../Popover/Popover.mjs';
import '../Popover/PopoverDropdown/PopoverDropdown.mjs';
import '../Popover/PopoverTarget/PopoverTarget.mjs';
import { HoverCardContextProvider } from './HoverCard.context.mjs';
import { HoverCardDropdown } from './HoverCardDropdown/HoverCardDropdown.mjs';
import { HoverCardGroup } from './HoverCardGroup/HoverCardGroup.mjs';
import { HoverCardTarget } from './HoverCardTarget/HoverCardTarget.mjs';
import { useHoverCard } from './use-hover-card.mjs';

const defaultProps = {
  openDelay: 0,
  closeDelay: 150,
  initiallyOpened: false
};
function HoverCard(props) {
  const { children, onOpen, onClose, openDelay, closeDelay, initiallyOpened, ...others } = useProps(
    "HoverCard",
    defaultProps,
    props
  );
  const hoverCard = useHoverCard({
    openDelay,
    closeDelay,
    defaultOpened: initiallyOpened,
    onOpen,
    onClose
  });
  return /* @__PURE__ */ jsx(
    HoverCardContextProvider,
    {
      value: {
        openDropdown: hoverCard.openDropdown,
        closeDropdown: hoverCard.closeDropdown,
        getReferenceProps: hoverCard.getReferenceProps,
        getFloatingProps: hoverCard.getFloatingProps,
        reference: hoverCard.reference,
        floating: hoverCard.floating
      },
      children: /* @__PURE__ */ jsx(Popover, { ...others, opened: hoverCard.opened, __staticSelector: "HoverCard", children })
    }
  );
}
HoverCard.displayName = "@mantine/core/HoverCard";
HoverCard.Target = HoverCardTarget;
HoverCard.Dropdown = HoverCardDropdown;
HoverCard.Group = HoverCardGroup;
HoverCard.extend = (input) => input;

export { HoverCard };
//# sourceMappingURL=HoverCard.mjs.map
