const _Blob = globalThis.Blob || (await import('node:buffer')).Blob

export default _Blob
