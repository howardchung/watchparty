/*! node-domexception. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

globalThis.DOMException ??= (() => {
  try { atob(0) } catch (err) { return err.constructor }
})()
