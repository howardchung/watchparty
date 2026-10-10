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
var useStyles = require('../../core/styles-api/use-styles/use-styles.cjs');
var Box = require('../../core/Box/Box.cjs');
var factory = require('../../core/factory/factory.cjs');
require('../../core/DirectionProvider/DirectionProvider.cjs');
var Typography_module = require('./Typography.module.css.cjs');

const Typography = factory.factory((_props, ref) => {
  const props = useProps.useProps("Typography", null, _props);
  const { classNames, className, style, styles, unstyled, attributes, ...others } = props;
  const getStyles = useStyles.useStyles({
    name: "Typography",
    classes: Typography_module,
    props,
    className,
    style,
    classNames,
    styles,
    unstyled,
    attributes
  });
  return /* @__PURE__ */ jsxRuntime.jsx(Box.Box, { ref, ...getStyles("root"), ...others });
});
Typography.classes = Typography_module;
Typography.displayName = "@mantine/core/Typography";

exports.Typography = Typography;
//# sourceMappingURL=Typography.cjs.map
