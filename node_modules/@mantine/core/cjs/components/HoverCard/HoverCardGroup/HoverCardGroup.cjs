'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('@floating-ui/react');
require('../../../core/utils/units-converters/rem.cjs');
require('react');
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
var HoverCardGroup_context = require('./HoverCardGroup.context.cjs');

const defaultProps = {
  openDelay: 0,
  closeDelay: 0
};
function HoverCardGroup(props) {
  const { openDelay, closeDelay, children } = useProps.useProps("HoverCardGroup", defaultProps, props);
  return /* @__PURE__ */ jsxRuntime.jsx(HoverCardGroup_context.HoverCardGroupProvider, { value: true, children: /* @__PURE__ */ jsxRuntime.jsx(react.FloatingDelayGroup, { delay: { open: openDelay, close: closeDelay }, children }) });
}
HoverCardGroup.displayName = "@mantine/core/HoverCardGroup";
HoverCardGroup.extend = (c) => c;

exports.HoverCardGroup = HoverCardGroup;
//# sourceMappingURL=HoverCardGroup.cjs.map
