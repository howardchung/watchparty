"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64encode = base64encode;
/**
 * Encodes binary data to base64
 *
 * @param binary - The binary data to encode
 * @returns The base64 encoded string
 *
 * @group Utils
 *
 * @beta
 */
function base64encode(binary) {
    return btoa(String.fromCharCode(...binary));
}
//# sourceMappingURL=base64encode.js.map