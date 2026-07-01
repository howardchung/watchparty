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
import { useStyles } from '../../core/styles-api/use-styles/use-styles.mjs';
import { Box } from '../../core/Box/Box.mjs';
import { factory } from '../../core/factory/factory.mjs';
import '../../core/DirectionProvider/DirectionProvider.mjs';
import classes from './Typography.module.css.mjs';

const Typography = factory((_props, ref) => {
  const props = useProps("Typography", null, _props);
  const { classNames, className, style, styles, unstyled, attributes, ...others } = props;
  const getStyles = useStyles({
    name: "Typography",
    classes,
    props,
    className,
    style,
    classNames,
    styles,
    unstyled,
    attributes
  });
  return /* @__PURE__ */ jsx(Box, { ref, ...getStyles("root"), ...others });
});
Typography.classes = classes;
Typography.displayName = "@mantine/core/Typography";

export { Typography };
//# sourceMappingURL=Typography.mjs.map
