'use client';
import { jsx } from 'react/jsx-runtime';
import { rem } from '../../core/utils/units-converters/rem.mjs';
import 'react';
import '@mantine/hooks';
import { createVarsResolver } from '../../core/styles-api/create-vars-resolver/create-vars-resolver.mjs';
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
import { ScrollArea } from '../ScrollArea/ScrollArea.mjs';
import classes from './Table.module.css.mjs';

const defaultProps = {
  type: "scrollarea"
};
const varsResolver = createVarsResolver(
  (_, { minWidth, maxHeight, type }) => ({
    scrollContainer: {
      "--table-min-width": rem(minWidth),
      "--table-max-height": rem(maxHeight),
      "--table-overflow": type === "native" ? "auto" : void 0
    }
  })
);
const TableScrollContainer = factory((_props, ref) => {
  const props = useProps("TableScrollContainer", defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    children,
    minWidth,
    maxHeight,
    type,
    scrollAreaProps,
    attributes,
    ...others
  } = props;
  const getStyles = useStyles({
    name: "TableScrollContainer",
    classes,
    props,
    className,
    style,
    classNames,
    styles,
    unstyled,
    attributes,
    vars,
    varsResolver,
    rootSelector: "scrollContainer"
  });
  return /* @__PURE__ */ jsx(
    Box,
    {
      component: type === "scrollarea" ? ScrollArea : "div",
      ...type === "scrollarea" ? maxHeight ? { offsetScrollbars: "xy", ...scrollAreaProps } : { offsetScrollbars: "x", ...scrollAreaProps } : {},
      ref,
      ...getStyles("scrollContainer"),
      ...others,
      children: /* @__PURE__ */ jsx("div", { ...getStyles("scrollContainerInner"), children })
    }
  );
});
TableScrollContainer.classes = classes;
TableScrollContainer.displayName = "@mantine/core/TableScrollContainer";

export { TableScrollContainer };
//# sourceMappingURL=TableScrollContainer.mjs.map
