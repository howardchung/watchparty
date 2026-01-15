'use client';
import { cloneElement } from 'react';
import { useMergedRef } from '@mantine/hooks';
import '../../../core/utils/units-converters/rem.mjs';
import 'react/jsx-runtime';
import { getRefProp } from '../../../core/utils/get-ref-prop/get-ref-prop.mjs';
import { getSingleElementChild } from '../../../core/utils/get-single-element-child/get-single-element-child.mjs';
import 'clsx';
import '../../../core/MantineProvider/Mantine.context.mjs';
import '../../../core/MantineProvider/default-theme.mjs';
import '../../../core/MantineProvider/MantineProvider.mjs';
import '../../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.mjs';
import { useProps } from '../../../core/MantineProvider/use-props/use-props.mjs';
import '../../../core/MantineProvider/MantineCssVariables/MantineCssVariables.mjs';
import '../../../core/Box/Box.mjs';
import { factory } from '../../../core/factory/factory.mjs';
import '../../../core/DirectionProvider/DirectionProvider.mjs';
import { useComboboxContext } from '../Combobox.context.mjs';
import { useComboboxTargetProps } from '../use-combobox-target-props/use-combobox-target-props.mjs';

const defaultProps = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: true,
  withAriaAttributes: true,
  withExpandedAttribute: false,
  autoComplete: "off"
};
const ComboboxEventsTarget = factory((props, ref) => {
  const {
    children,
    refProp,
    withKeyboardNavigation,
    withAriaAttributes,
    withExpandedAttribute,
    targetType,
    autoComplete,
    ...others
  } = useProps("ComboboxEventsTarget", defaultProps, props);
  const child = getSingleElementChild(children);
  if (!child) {
    throw new Error(
      "Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
    );
  }
  const ctx = useComboboxContext();
  const targetProps = useComboboxTargetProps({
    targetType,
    withAriaAttributes,
    withKeyboardNavigation,
    withExpandedAttribute,
    onKeyDown: child.props.onKeyDown,
    autoComplete
  });
  return cloneElement(child, {
    ...targetProps,
    ...others,
    [refProp]: useMergedRef(ref, ctx.store.targetRef, getRefProp(child))
  });
});
ComboboxEventsTarget.displayName = "@mantine/core/ComboboxEventsTarget";

export { ComboboxEventsTarget };
//# sourceMappingURL=ComboboxEventsTarget.mjs.map
