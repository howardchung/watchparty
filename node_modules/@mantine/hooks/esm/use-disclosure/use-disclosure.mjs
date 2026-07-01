'use client';
import { useState, useCallback } from 'react';

function useDisclosure(initialState = false, options = {}) {
  const [opened, setOpened] = useState(initialState);
  const open = useCallback(() => {
    setOpened((isOpened) => {
      if (!isOpened) {
        options.onOpen?.();
        return true;
      }
      return isOpened;
    });
  }, [options.onOpen]);
  const close = useCallback(() => {
    setOpened((isOpened) => {
      if (isOpened) {
        options.onClose?.();
        return false;
      }
      return isOpened;
    });
  }, [options.onClose]);
  const toggle = useCallback(() => {
    opened ? close() : open();
  }, [close, open, opened]);
  return [opened, { open, close, toggle }];
}

export { useDisclosure };
//# sourceMappingURL=use-disclosure.mjs.map
