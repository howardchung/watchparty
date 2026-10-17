'use client';
'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var hooks = require('@mantine/hooks');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

function getAutoHeightDuration(height) {
  if (!height || typeof height === "string") {
    return 0;
  }
  const constant = height / 36;
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
}
function getElementHeight(el) {
  return el?.current ? el.current.scrollHeight : "auto";
}
const raf = typeof window !== "undefined" && window.requestAnimationFrame;
const collapsedHeight = 0;
const getCollapsedStyles = (keepMounted) => ({
  height: 0,
  overflow: "hidden",
  ...keepMounted ? {} : { display: "none" }
});
function useCollapse({
  transitionDuration,
  transitionTimingFunction = "ease",
  onTransitionEnd = () => {
  },
  opened,
  keepMounted = false
}) {
  const el = React.useRef(null);
  const collapsedStyles = getCollapsedStyles(keepMounted);
  const [styles, setStylesRaw] = React.useState(opened ? {} : collapsedStyles);
  const setStyles = (newStyles) => {
    ReactDOM.flushSync(() => setStylesRaw(newStyles));
  };
  const mergeStyles = (newStyles) => {
    setStyles((oldStyles) => ({ ...oldStyles, ...newStyles }));
  };
  function getTransitionStyles(height) {
    const _duration = transitionDuration || getAutoHeightDuration(height);
    return {
      transition: `height ${_duration}ms ${transitionTimingFunction}, opacity ${_duration}ms ${transitionTimingFunction}`
    };
  }
  hooks.useDidUpdate(() => {
    if (typeof raf === "function") {
      if (opened) {
        raf(() => {
          mergeStyles({ willChange: "height", display: "block", overflow: "hidden" });
          raf(() => {
            const height = getElementHeight(el);
            mergeStyles({ ...getTransitionStyles(height), height });
          });
        });
      } else {
        raf(() => {
          const height = getElementHeight(el);
          mergeStyles({ ...getTransitionStyles(height), willChange: "height", height });
          raf(() => mergeStyles({ height: collapsedHeight, overflow: "hidden" }));
        });
      }
    }
  }, [opened]);
  const handleTransitionEnd = (e) => {
    if (e.target !== el.current || e.propertyName !== "height") {
      return;
    }
    if (opened) {
      const height = getElementHeight(el);
      if (height === styles.height) {
        setStyles({});
      } else {
        mergeStyles({ height });
      }
      onTransitionEnd();
    } else if (styles.height === collapsedHeight) {
      setStyles(collapsedStyles);
      onTransitionEnd();
    }
  };
  function getCollapseProps({ style = {}, refKey = "ref", ...rest } = {}) {
    const theirRef = rest[refKey];
    const props = {
      "aria-hidden": !opened,
      ...rest,
      [refKey]: hooks.mergeRefs(el, theirRef),
      onTransitionEnd: handleTransitionEnd,
      style: { boxSizing: "border-box", ...style, ...styles }
    };
    if (React__default.default.version.startsWith("18")) {
      if (!opened) {
        props.inert = "";
      }
    } else {
      props.inert = !opened;
    }
    return props;
  }
  return getCollapseProps;
}

exports.getElementHeight = getElementHeight;
exports.useCollapse = useCollapse;
//# sourceMappingURL=use-collapse.cjs.map
