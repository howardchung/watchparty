'use client';
'use strict';

var React = require('react');

function useDisclosure(initialState = false, options = {}) {
  const [opened, setOpened] = React.useState(initialState);
  const open = React.useCallback(() => {
    setOpened((isOpened) => {
      if (!isOpened) {
        options.onOpen?.();
        return true;
      }
      return isOpened;
    });
  }, [options.onOpen]);
  const close = React.useCallback(() => {
    setOpened((isOpened) => {
      if (isOpened) {
        options.onClose?.();
        return false;
      }
      return isOpened;
    });
  }, [options.onClose]);
  const toggle = React.useCallback(() => {
    opened ? close() : open();
  }, [close, open, opened]);
  return [opened, { open, close, toggle }];
}

exports.useDisclosure = useDisclosure;
//# sourceMappingURL=use-disclosure.cjs.map
