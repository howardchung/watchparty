'use client';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { forwardRef, useRef } from 'react';
import { assignRef, useMergedRef } from '@mantine/hooks';
import '../../core/utils/units-converters/rem.mjs';
import 'clsx';
import '../../core/MantineProvider/Mantine.context.mjs';
import '../../core/MantineProvider/default-theme.mjs';
import '../../core/MantineProvider/MantineProvider.mjs';
import '../../core/MantineProvider/MantineThemeProvider/MantineThemeProvider.mjs';
import { useProps } from '../../core/MantineProvider/use-props/use-props.mjs';
import '../../core/MantineProvider/MantineCssVariables/MantineCssVariables.mjs';
import '../../core/Box/Box.mjs';
import '../../core/DirectionProvider/DirectionProvider.mjs';

const defaultProps = {
  multiple: false
};
const FileButton = forwardRef(
  (props, ref) => {
    const {
      onChange,
      children,
      multiple,
      accept,
      name,
      form,
      resetRef,
      disabled,
      capture,
      inputProps,
      ...others
    } = useProps("FileButton", defaultProps, props);
    const inputRef = useRef(null);
    const onClick = () => {
      !disabled && inputRef.current?.click();
    };
    const handleChange = (event) => {
      if (event.currentTarget.files === null) {
        return onChange(multiple ? [] : null);
      }
      if (multiple) {
        onChange(Array.from(event.currentTarget.files));
      } else {
        onChange(event.currentTarget.files[0] || null);
      }
    };
    const reset = () => {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };
    assignRef(resetRef, reset);
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          style: { display: "none" },
          type: "file",
          accept,
          multiple,
          onChange: handleChange,
          ref: useMergedRef(ref, inputRef),
          name,
          form,
          capture,
          ...inputProps
        }
      ),
      children({ onClick, ...others })
    ] });
  }
);
FileButton.displayName = "@mantine/core/FileButton";

export { FileButton };
//# sourceMappingURL=FileButton.mjs.map
