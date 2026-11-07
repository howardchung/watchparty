'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useDelayGroup, useFloating, useInteractions, useHover, useRole, useDismiss } from '@floating-ui/react';
import { useId } from '@mantine/hooks';
import { useHoverCardGroupContext } from './HoverCardGroup/HoverCardGroup.context.mjs';

function useHoverCard(settings) {
  const [uncontrolledOpened, setUncontrolledOpened] = useState(settings.defaultOpened);
  const controlled = typeof settings.opened === "boolean";
  const opened = controlled ? settings.opened : uncontrolledOpened;
  const withinGroup = useHoverCardGroupContext();
  const uid = useId();
  const openTimeout = useRef(-1);
  const closeTimeout = useRef(-1);
  const clearTimeouts = useCallback(() => {
    window.clearTimeout(openTimeout.current);
    window.clearTimeout(closeTimeout.current);
  }, []);
  const onChange = useCallback(
    (_opened) => {
      setUncontrolledOpened(_opened);
      if (_opened) {
        setCurrentId(uid);
        settings.onOpen?.();
      } else {
        settings.onClose?.();
      }
    },
    [uid, settings.onOpen, settings.onClose]
  );
  const { context, refs } = useFloating({
    open: opened,
    onOpenChange: onChange
  });
  const { delay: groupDelay, setCurrentId } = useDelayGroup(context, { id: uid });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, {
      enabled: true,
      delay: withinGroup ? groupDelay : { open: settings.openDelay, close: settings.closeDelay }
    }),
    useRole(context, { role: "dialog" }),
    useDismiss(context, { enabled: withinGroup })
  ]);
  const openDropdown = useCallback(() => {
    if (withinGroup) {
      return;
    }
    clearTimeouts();
    if (settings.openDelay === 0 || settings.openDelay === void 0) {
      onChange(true);
    } else {
      openTimeout.current = window.setTimeout(() => onChange(true), settings.openDelay);
    }
  }, [withinGroup, clearTimeouts, settings.openDelay, onChange]);
  const closeDropdown = useCallback(() => {
    if (withinGroup) {
      return;
    }
    clearTimeouts();
    if (settings.closeDelay === 0 || settings.closeDelay === void 0) {
      onChange(false);
    } else {
      closeTimeout.current = window.setTimeout(() => onChange(false), settings.closeDelay);
    }
  }, [withinGroup, clearTimeouts, settings.closeDelay, onChange]);
  useEffect(() => () => clearTimeouts(), [clearTimeouts]);
  return {
    opened,
    reference: refs.setReference,
    floating: refs.setFloating,
    getReferenceProps,
    getFloatingProps,
    openDropdown,
    closeDropdown
  };
}

export { useHoverCard };
//# sourceMappingURL=use-hover-card.mjs.map
