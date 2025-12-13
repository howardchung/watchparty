'use client';
'use strict';

var React = require('react');
var hooks = require('@mantine/hooks');
require('../../../core/utils/units-converters/rem.cjs');
require('react/jsx-runtime');
var getRefProp = require('../../../core/utils/get-ref-prop/get-ref-prop.cjs');
var getSingleElementChild = require('../../../core/utils/get-single-element-child/get-single-element-child.cjs');
require('clsx');
require('../../../core/MantineProvider/Mantine.context.cjs');
require('../../../core/MantineProvider/default-theme.cjs');
require('../../../core/MantineProvider/MantineProvider.cjs');
require('../../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.cjs');
var useProps = require('../../../core/MantineProvider/use-props/use-props.cjs');
require('../../../core/MantineProvider/MantineCssVariables/MantineCssVariables.cjs');
require('../../../core/Box/Box.cjs');
var factory = require('../../../core/factory/factory.cjs');
require('../../../core/DirectionProvider/DirectionProvider.cjs');
var Combobox_context = require('../Combobox.context.cjs');
var useComboboxTargetProps = require('../use-combobox-target-props/use-combobox-target-props.cjs');

const defaultProps = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: true,
  withAriaAttributes: true,
  withExpandedAttribute: false,
  autoComplete: "off"
};
const ComboboxEventsTarget = factory.factory((props, ref) => {
  const {
    children,
    refProp,
    withKeyboardNavigation,
    withAriaAttributes,
    withExpandedAttribute,
    targetType,
    autoComplete,
    ...others
  } = useProps.useProps("ComboboxEventsTarget", defaultProps, props);
  const child = getSingleElementChild.getSingleElementChild(children);
  if (!child) {
    throw new Error(
      "Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
    );
  }
  const ctx = Combobox_context.useComboboxContext();
  const targetProps = useComboboxTargetProps.useComboboxTargetProps({
    targetType,
    withAriaAttributes,
    withKeyboardNavigation,
    withExpandedAttribute,
    onKeyDown: child.props.onKeyDown,
    autoComplete
  });
  return React.cloneElement(child, {
    ...targetProps,
    ...others,
    [refProp]: hooks.useMergedRef(ref, ctx.store.targetRef, getRefProp.getRefProp(child))
  });
});
ComboboxEventsTarget.displayName = "@mantine/core/ComboboxEventsTarget";

exports.ComboboxEventsTarget = ComboboxEventsTarget;
//# sourceMappingURL=ComboboxEventsTarget.cjs.map
