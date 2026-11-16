'use client';
import { useState, useEffect } from 'react';

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
  const [matches, setMatches] = useState(
    getInitialValueInEffect ? initialValue : getInitialValue(query)
  );
  useEffect(() => {
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

export { useMediaQuery };
//# sourceMappingURL=use-media-query.mjs.map
