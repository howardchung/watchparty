'use client';
'use strict';

var React = require('react');

function attachMediaListener(query, callback) {
  try {
    query.addEventListener("change", callback);
    return () => query.removeEventListener("change", callback);
  } catch (e) {
    query.addListener(callback);
    return () => query.removeListener(callback);
  }
}
function getInitialValue(query, initialValue) {
  if (typeof window !== "undefined" && "matchMedia" in window) {
    return window.matchMedia(query).matches;
  }
  return false;
}
function useMediaQuery(query, initialValue, { getInitialValueInEffect } = {
  getInitialValueInEffect: true
}) {
  const [matches, setMatches] = React.useState(
    getInitialValueInEffect ? initialValue : getInitialValue(query)
  );
  React.useEffect(() => {
    try {
      const mediaQuery = window.matchMedia(query);
      setMatches(mediaQuery.matches);
      return attachMediaListener(mediaQuery, (event) => setMatches(event.matches));
    } catch (e) {
      return void 0;
    }
  }, [query]);
  return matches || false;
}

exports.useMediaQuery = useMediaQuery;
//# sourceMappingURL=use-media-query.cjs.map
