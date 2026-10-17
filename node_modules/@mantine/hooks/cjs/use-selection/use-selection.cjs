'use client';
'use strict';

var React = require('react');
var useDidUpdate = require('../use-did-update/use-did-update.cjs');

function useSelection(input) {
  const [selectionSet, setSelectionSet] = React.useState(new Set(input.defaultSelection || []));
  useDidUpdate.useDidUpdate(() => {
    if (input.resetSelectionOnDataChange) {
      setSelectionSet(/* @__PURE__ */ new Set());
    }
  }, [input.data, input.resetSelectionOnDataChange]);
  const select = React.useCallback((selected) => {
    setSelectionSet((state) => {
      if (!state.has(selected)) {
        const newSet = new Set(state);
        newSet.add(selected);
        return newSet;
      }
      return state;
    });
  }, []);
  const deselect = React.useCallback((deselected) => {
    setSelectionSet((state) => {
      if (state.has(deselected)) {
        const newSet = new Set(state);
        newSet.delete(deselected);
        return newSet;
      }
      return state;
    });
  }, []);
  const toggle = React.useCallback((toggled) => {
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
  const resetSelection = React.useCallback(() => {
    setSelectionSet(/* @__PURE__ */ new Set());
  }, []);
  const setSelection = React.useCallback((selection) => {
    setSelectionSet(new Set(selection));
  }, []);
  const isAllSelected = React.useCallback(() => {
    if (input.data.length === 0) {
      return false;
    }
    return input.data.every((item) => selectionSet.has(item));
  }, [selectionSet, input.data]);
  const isSomeSelected = React.useCallback(() => {
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

exports.useSelection = useSelection;
//# sourceMappingURL=use-selection.cjs.map
