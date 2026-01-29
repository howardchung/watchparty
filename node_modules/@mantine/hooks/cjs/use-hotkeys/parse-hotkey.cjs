'use client';
'use strict';

const keyNameMap = {
  " ": "space",
  ArrowLeft: "arrowleft",
  ArrowRight: "arrowright",
  ArrowUp: "arrowup",
  ArrowDown: "arrowdown",
  Escape: "escape",
  Esc: "escape",
  esc: "escape",
  Enter: "enter",
  Tab: "tab",
  Backspace: "backspace",
  Delete: "delete",
  Insert: "insert",
  Home: "home",
  End: "end",
  PageUp: "pageup",
  PageDown: "pagedown",
  "+": "plus",
  "-": "minus",
  "*": "asterisk",
  "/": "slash"
};
function normalizeKey(key) {
  const lowerKey = key.replace("Key", "").toLowerCase();
  return keyNameMap[key] || lowerKey;
}
function parseHotkey(hotkey) {
  const keys = hotkey.toLowerCase().split("+").map((part) => part.trim());
  const modifiers = {
    alt: keys.includes("alt"),
    ctrl: keys.includes("ctrl"),
    meta: keys.includes("meta"),
    mod: keys.includes("mod"),
    shift: keys.includes("shift"),
    plus: keys.includes("[plus]")
  };
  const reservedKeys = ["alt", "ctrl", "meta", "shift", "mod"];
  const freeKey = keys.find((key) => !reservedKeys.includes(key));
  return {
    ...modifiers,
    key: freeKey === "[plus]" ? "+" : freeKey
  };
}
function isExactHotkey(hotkey, event, usePhysicalKeys) {
  const { alt, ctrl, meta, mod, shift, key } = hotkey;
  const { altKey, ctrlKey, metaKey, shiftKey, key: pressedKey, code: pressedCode } = event;
  if (alt !== altKey) {
    return false;
  }
  if (mod) {
    if (!ctrlKey && !metaKey) {
      return false;
    }
  } else {
    if (ctrl !== ctrlKey) {
      return false;
    }
    if (meta !== metaKey) {
      return false;
    }
  }
  if (shift !== shiftKey) {
    return false;
  }
  if (key && (usePhysicalKeys ? normalizeKey(pressedCode) === normalizeKey(key) : normalizeKey(pressedKey ?? pressedCode) === normalizeKey(key))) {
    return true;
  }
  return false;
}
function getHotkeyMatcher(hotkey, usePhysicalKeys) {
  return (event) => isExactHotkey(parseHotkey(hotkey), event, usePhysicalKeys);
}
function getHotkeyHandler(hotkeys) {
  return (event) => {
    const _event = "nativeEvent" in event ? event.nativeEvent : event;
    hotkeys.forEach(
      ([hotkey, handler, options = { preventDefault: true, usePhysicalKeys: false }]) => {
        if (getHotkeyMatcher(hotkey, options.usePhysicalKeys)(_event)) {
          if (options.preventDefault) {
            event.preventDefault();
          }
          handler(_event);
        }
      }
    );
  };
}

exports.getHotkeyHandler = getHotkeyHandler;
exports.getHotkeyMatcher = getHotkeyMatcher;
exports.parseHotkey = parseHotkey;
//# sourceMappingURL=parse-hotkey.cjs.map
