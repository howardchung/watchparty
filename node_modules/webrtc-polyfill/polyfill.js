import WebRTC from './index.js'

for (const [key, value] of Object.entries(WebRTC)) {
  if (key !== 'default') {
    globalThis[key] ??= value
  }
}
