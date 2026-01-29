'use client';
import { useState, useCallback } from 'react';
import { useDidUpdate } from '../use-did-update/use-did-update.mjs';

function useSelection(input) {
  const [selectionSet, setSelectionSet] = useState(new Set(input.defaultSelection || []));
  useDidUpdate(() => {
    if (input.resetSelectionOnDataChange) {
      setSelectionSet(/* @__PURE__ */ new Set());
    }
  }, [input.data, input.resetSelectionOnDataChange]);
  const select = useCallback((selected) => {
    setSelectionSet((state) => {
      if (!state.has(selected)) {
        const newSet = new Set(state);
        newSet.add(selected);
        return newSet;
      }
      return state;
    });
  }, []);
  const deselect = useCallback((deselected) => {
    setSelectionSet((state) => {
      if (state.has(deselected)) {
        const newSet = new Set(state);
        newSet.delete(deselected);
        return newSet;
      }
      return state;
    });
  }, []);
  const toggle = useCallback((toggled) => {
    setSelectionSet((state) => {
      const newSet = new Set(state);
      if (state.has(toggled)) {
        newSet.delete(toggled);
      } else {
        newSet.add(toggled);
      }
      return newSet;
    });
  }, []);
  const resetSelection = useCallback(() => {
    setSelectionSet(/* @__PURE__ */ new Set());
  }, []);
  const setSelection = useCallback((selection) => {
    setSelectionSet(new Set(selection));
  }, []);
  const isAllSelected = useCallback(() => {
    if (input.data.length === 0) {
      return false;
    }
    return input.data.every((item) => selectionSet.has(item));
  }, [selectionSet, input.data]);
  const isSomeSelected = useCallback(() => {
    return input.data.some((item) => selectionSet.has(item));
  }, [selectionSet, input.data]);
  return [
    Array.from(selectionSet),
    {
      select,
      deselect,
      toggle,
      isAllSelected,
      isSomeSelected,
      setSelection,
      resetSelection
    }
  ];
}

export { useSelection };
//# sourceMappingURL=use-selection.mjs.map
