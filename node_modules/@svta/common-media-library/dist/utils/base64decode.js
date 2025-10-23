/**
 * Decodes a base64 encoded string into binary data
 *
 * @param str - The base64 encoded string to decode
 * @returns The decoded binary data
 *
 * @group Utils
 *
 * @beta
 */
export function base64decode(str) {
    return new Uint8Array([...atob(str)].map((a) => a.charCodeAt(0)));
}
//# sourceMappingURL=base64decode.js.map