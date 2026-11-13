'use client';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useRef, createElement } from 'react';
import { useUncontrolled, useRadialMove, useMergedRef, normalizeRadialValue } from '@mantine/hooks';
import { rem } from '../../core/utils/units-converters/rem.mjs';
import { findClosestNumber } from '../../core/utils/find-closest-number/find-closest-number.mjs';
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
import classes from './AngleSlider.module.css.mjs';

const defaultProps = {
  step: 1,
  withLabel: true
};
const varsResolver = createVarsResolver((_, { size, thumbSize }) => ({
  root: {
    "--slider-size": rem(size),
    "--thumb-size": rem(thumbSize)
  }
}));
const AngleSlider = factory((_props, ref) => {
  const props = useProps("AngleSlider", defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    step,
    value,
    defaultValue,
    onChange,
    onMouseDown,
    withLabel,
    marks,
    thumbSize,
    restrictToMarks,
    formatLabel,
    onChangeEnd,
    disabled,
    onTouchStart,
    name,
    hiddenInputProps,
    "aria-label": ariaLabel,
    tabIndex,
    onScrubStart,
    onScrubEnd,
    mod,
    attributes,
    ...others
  } = props;
  const rootRef = useRef(null);
  const [_value, setValue] = useUncontrolled({
    value,
    defaultValue,
    finalValue: 0,
    onChange
  });
  const update = (val) => {
    if (rootRef.current && !disabled) {
      const newValue = restrictToMarks && Array.isArray(marks) ? findClosestNumber(
        val,
        marks.map((mark) => mark.value)
      ) : val;
      setValue(newValue);
    }
  };
  const { ref: radialMoveRef } = useRadialMove(update, {
    step,
    onChangeEnd,
    onScrubStart,
    onScrubEnd
  });
  const getStyles = useStyles({
    name: "AngleSlider",
    classes,
    props,
    className,
    style,
    classNames,
    styles,
    unstyled,
    attributes,
    vars,
    varsResolver
  });
  const handleKeyDown = (event) => {
    if (disabled) {
      return;
    }
    let newValue = _value;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      newValue = normalizeRadialValue(_value - step, step);
    }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      newValue = normalizeRadialValue(_value + step, step);
    }
    if (event.key === "Home") {
      newValue = 0;
    }
    if (event.key === "End") {
      newValue = 359;
    }
    if (restrictToMarks && Array.isArray(marks)) {
      const markValues = marks.map((mark) => mark.value);
      const currentIndex = markValues.indexOf(_value);
      if (currentIndex !== -1) {
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          newValue = markValues[Math.max(0, currentIndex - 1)];
        } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          newValue = markValues[Math.min(markValues.length - 1, currentIndex + 1)];
        } else {
          newValue = findClosestNumber(newValue, markValues);
        }
      } else {
        newValue = findClosestNumber(newValue, markValues);
      }
    }
    setValue(newValue);
    onChangeEnd?.(newValue);
  };
  const marksItems = marks?.map((mark, index) => /* @__PURE__ */ createElement(
    "div",
    {
      ...getStyles("mark", { style: { "--angle": `${mark.value}deg` } }),
      "data-label": mark.label || void 0,
      key: index
    }
  ));
  return /* @__PURE__ */ jsxs(
    Box,
    {
      ref: useMergedRef(ref, rootRef, radialMoveRef),
      ...getStyles("root", { focusable: true }),
      mod: [{ disabled }, mod],
      ...others,
      children: [
        marksItems && marksItems.length > 0 && /* @__PURE__ */ jsx("div", { ...getStyles("marks"), children: marksItems }),
        withLabel && /* @__PURE__ */ jsx("div", { ...getStyles("label"), children: typeof formatLabel === "function" ? formatLabel(_value) : _value }),
        /* @__PURE__ */ jsx(
          "div",
          {
            tabIndex: tabIndex ?? (disabled ? -1 : 0),
            role: "slider",
            "aria-valuemax": 360,
            "aria-valuemin": 0,
            "aria-valuenow": _value,
            onKeyDown: handleKeyDown,
            "aria-label": ariaLabel,
            ...getStyles("thumb", { style: { transform: `rotate(${_value}deg)` } })
          }
        ),
        /* @__PURE__ */ jsx("input", { type: "hidden", name, value: _value, ...hiddenInputProps })
      ]
    }
  );
});
AngleSlider.displayName = "@mantine/core/AngleSlider";
AngleSlider.classes = classes;

export { AngleSlider };
//# sourceMappingURL=AngleSlider.mjs.map
