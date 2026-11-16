'use client';
'use strict';

function findElementBySelector(selector, root = document) {
  const element = root.querySelector(selector);
  if (element) {
    return element;
  }
  const allElements = root.querySelectorAll("*");
  for (let i = 0; i < allElements.length; i += 1) {
    const el = allElements[i];
    if (el.shadowRoot) {
      const shadowElement = findElementBySelector(selector, el.shadowRoot);
      if (shadowElement) {
        return shadowElement;
      }
    }
  }
  return null;
}
function findElementsBySelector(selector, root = document) {
  const results = [];
  const elements = root.querySelectorAll(selector);
  results.push(...Array.from(elements));
  const allElements = root.querySelectorAll("*");
  for (let i = 0; i < allElements.length; i += 1) {
    const el = allElements[i];
    if (el.shadowRoot) {
      const shadowElements = findElementsBySelector(selector, el.shadowRoot);
      results.push(...shadowElements);
    }
  }
  return results;
}
function getRootElement(targetElement) {
  if (!targetElement) {
    return document;
  }
  const root = targetElement.getRootNode();
  return root instanceof ShadowRoot || root instanceof Document ? root : document;
}

exports.findElementBySelector = findElementBySelector;
exports.findElementsBySelector = findElementsBySelector;
exports.getRootElement = getRootElement;
//# sourceMappingURL=find-element-in-shadow-dom.cjs.map
