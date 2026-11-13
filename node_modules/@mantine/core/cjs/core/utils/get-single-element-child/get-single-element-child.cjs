'use client';
'use strict';

var React = require('react');
var isElement = require('../is-element/is-element.cjs');

function getSingleElementChild(children) {
  const _children = React.Children.toArray(children);
  if (_children.length !== 1 || !isElement.isElement(_children[0])) {
    return null;
  }
  return _children[0];
}

exports.getSingleElementChild = getSingleElementChild;
//# sourceMappingURL=get-single-element-child.cjs.map
