"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenField = isTokenField;
/**
 * Checks if the given key is a token field.
 *
 * @param key - The key to check.
 *
 * @returns `true` if the key is a token field.
 *
 * @internal
 */
function isTokenField(key) {
    return key === 'ot' || key === 'sf' || key === 'st';
}
//# sourceMappingURL=isTokenField.js.map