'use client';
import { jsx } from 'react/jsx-runtime';
import { FloatingDelayGroup } from '@floating-ui/react';
import '../../../core/utils/units-converters/rem.mjs';
import 'react';
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
import { HoverCardGroupProvider } from './HoverCardGroup.context.mjs';

const defaultProps = {
  openDelay: 0,
  closeDelay: 0
};
function HoverCardGroup(props) {
  const { openDelay, closeDelay, children } = useProps("HoverCardGroup", defaultProps, props);
  return /* @__PURE__ */ jsx(HoverCardGroupProvider, { value: true, children: /* @__PURE__ */ jsx(FloatingDelayGroup, { delay: { open: openDelay, close: closeDelay }, children }) });
}
HoverCardGroup.displayName = "@mantine/core/HoverCardGroup";
HoverCardGroup.extend = (c) => c;

export { HoverCardGroup };
//# sourceMappingURL=HoverCardGroup.mjs.map
