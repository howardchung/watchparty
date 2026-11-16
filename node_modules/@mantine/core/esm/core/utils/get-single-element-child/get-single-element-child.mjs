'use client';
import { Children } from 'react';
import { isElement } from '../is-element/is-element.mjs';

function getSingleElementChild(children) {
  const _children = Children.toArray(children);
  if (_children.length !== 1 || !isElement(_children[0])) {
    return null;
  }
  return _children[0];
}

export { getSingleElementChild };
//# sourceMappingURL=get-single-element-child.mjs.map
