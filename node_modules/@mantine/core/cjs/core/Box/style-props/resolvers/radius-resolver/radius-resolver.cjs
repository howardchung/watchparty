'use client';
'use strict';

var rem = require('../../../../utils/units-converters/rem.cjs');
require('react');
require('react/jsx-runtime');
require('@mantine/hooks');

function radiusResolver(value, theme) {
  if (typeof value === "string" && value in theme.radius) {
    return `var(--mantine-radius-${value})`;
  }
  if (typeof value === "number") {
    return rem.rem(value);
  }
  if (typeof value === "string") {
    return rem.rem(value);
  }
  return value;
}

exports.radiusResolver = radiusResolver;
//# sourceMappingURL=radius-resolver.cjs.map
