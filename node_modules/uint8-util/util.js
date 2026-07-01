/* Common package for dealing with hex/string/uint8 conversions (and sha1 hashing)
*
* @author   Jimmy Wärting <jimmy@warting.se> (https://jimmy.warting.se/opensource)
* @license  MIT
*/
export const alphabet = '0123456789abcdef'
const encodeLookup = []
const decodeLookup = []

for (let i = 0; i < 256; i++) {
  encodeLookup[i] = alphabet[i >> 4 & 0xf] + alphabet[i & 0xf]
  if (i < 16) {
    if (i < 10) {
      decodeLookup[0x30 + i] = i
    } else {
      decodeLookup[0x61 - 10 + i] = i
    }
  }
}

export const arr2hex = data => {
  const length = data.length
  let string = ''
  let i = 0
  while (i < length) {
    string += encodeLookup[data[i++]]
  }
  return string
}

export const hex2arr = str => {
  const sizeof = str.length >> 1
  const length = sizeof << 1
  const array = new Uint8Array(sizeof)
  let n = 0
  let i = 0
  while (i < length) {
    array[n++] = decodeLookup[str.charCodeAt(i++)] << 4 | decodeLookup[str.charCodeAt(i++)]
  }
  return array
}

export const concat = (chunks, size = 0) => {
  const length = chunks.length || 0
  if (!size) {
    let i = length
    while (i--) size += chunks[i].length
  }
  const b = new Uint8Array(size)
  let offset = size
  let i = length
  while (i--) {
    offset -= chunks[i].length
    b.set(chunks[i], offset)
  }

  return b
}

export const equal = (a, b) => {
  if (a.length !== b.length) return false
  for (let i = a.length; i > -1; i -= 1) {
    if ((a[i] !== b[i])) return false
  }
  return true
}
