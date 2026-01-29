'use client';
'use strict';

var React = require('react');
var react = require('@floating-ui/react');
var hooks = require('@mantine/hooks');
var HoverCardGroup_context = require('./HoverCardGroup/HoverCardGroup.context.cjs');

function useHoverCard(settings) {
  const [uncontrolledOpened, setUncontrolledOpened] = React.useState(settings.defaultOpened);
  const controlled = typeof settings.opened === "boolean";
  const opened = controlled ? settings.opened : uncontrolledOpened;
  const withinGroup = HoverCardGroup_context.useHoverCardGroupContext();
  const uid = hooks.useId();
  const openTimeout = React.useRef(-1);
  const closeTimeout = React.useRef(-1);
  const clearTimeouts = React.useCallback(() => {
    window.clearTimeout(openTimeout.current);
    window.clearTimeout(closeTimeout.current);
  }, []);
  const onChange = React.useCallback(
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
  const { context, refs } = react.useFloating({
    open: opened,
    onOpenChange: onChange
  });
  const { delay: groupDelay, setCurrentId } = react.useDelayGroup(context, { id: uid });
  const { getReferenceProps, getFloatingProps } = react.useInteractions([
    react.useHover(context, {
      enabled: true,
      delay: withinGroup ? groupDelay : { open: settings.openDelay, close: settings.closeDelay }
    }),
    react.useRole(context, { role: "dialog" }),
    react.useDismiss(context, { enabled: withinGroup })
  ]);
  const openDropdown = React.useCallback(() => {
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
  const closeDropdown = React.useCallback(() => {
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
  React.useEffect(() => () => clearTimeouts(), [clearTimeouts]);
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

exports.useHoverCard = useHoverCard;
//# sourceMappingURL=use-hover-card.cjs.map
