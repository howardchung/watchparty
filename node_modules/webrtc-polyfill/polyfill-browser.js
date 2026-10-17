import WebRTC from './browser.js'

const scope = typeof window !== 'undefined' ? window : self

// this is kinda stupid, but I guess it unprefixes the WebRTC API?
for (const [key, value] of Object.entries(WebRTC)) {
  if (key !== 'default') {
    scope[key] ??= value
  }
}
