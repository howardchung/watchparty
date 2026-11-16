'use client';
import { useRef } from 'react';
import { useForceUpdate } from '../use-force-update/use-force-update.mjs';

function readonlySetLikeToSet(input) {
  if (input instanceof Set) {
    return input;
  }
  const result = /* @__PURE__ */ new Set();
  for (const item of input) {
    result.add(item);
  }
  return result;
}
function useSet(values) {
  const setRef = useRef(new Set(values));
  const forceUpdate = useForceUpdate();
  setRef.current.add = (...args) => {
    const res = Set.prototype.add.apply(setRef.current, args);
    forceUpdate();
    return res;
  };
  setRef.current.clear = (...args) => {
    Set.prototype.clear.apply(setRef.current, args);
    forceUpdate();
  };
  setRef.current.delete = (...args) => {
    const res = Set.prototype.delete.apply(setRef.current, args);
    forceUpdate();
    return res;
  };
  setRef.current.union = (other) => {
    const result = new Set(setRef.current);
    readonlySetLikeToSet(other).forEach((item) => result.add(item));
    return result;
  };
  setRef.current.intersection = (other) => {
    const result = /* @__PURE__ */ new Set();
    const otherSet = readonlySetLikeToSet(other);
    setRef.current.forEach((item) => {
      if (otherSet.has(item)) {
        result.add(item);
      }
    });
    return result;
  };
  setRef.current.difference = (other) => {
    const result = /* @__PURE__ */ new Set();
    const otherSet = readonlySetLikeToSet(other);
    setRef.current.forEach((item) => {
      if (!otherSet.has(item)) {
        result.add(item);
      }
    });
    return result;
  };
  setRef.current.symmetricDifference = (other) => {
    const result = /* @__PURE__ */ new Set();
    const otherSet = readonlySetLikeToSet(other);
    setRef.current.forEach((item) => {
      if (!otherSet.has(item)) {
        result.add(item);
      }
    });
    otherSet.forEach((item) => {
      if (!setRef.current.has(item)) {
        result.add(item);
      }
    });
    return result;
  };
  return setRef.current;
}

export { readonlySetLikeToSet, useSet };
//# sourceMappingURL=use-set.mjs.map
