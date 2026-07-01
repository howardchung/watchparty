'use client';
import { rem } from '../../../../utils/units-converters/rem.mjs';
import 'react';
import 'react/jsx-runtime';
import '@mantine/hooks';

function radiusResolver(value, theme) {
  if (typeof value === "string" && value in theme.radius) {
    return `var(--mantine-radius-${value})`;
  }
  if (typeof value === "number") {
    return rem(value);
  }
  if (typeof value === "string") {
    return rem(value);
  }
  return value;
}

export { radiusResolver };
//# sourceMappingURL=radius-resolver.mjs.map
