"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDashParser = setDashParser;
exports.getDashParser = getDashParser;
exports.parseDashManifest = parseDashManifest;
let dashParser;
/**
 * @internal
 */
function setDashParser(parser) {
    dashParser = parser;
}
/**
 * @internal
 */
function getDashParser() {
    return dashParser;
}
/**
 * @internal
 * Parse XML to Json
 *
 * @param raw - Raw string containing the xml from the Dash Manifest
 * @returns json with the Dash Manifest structure
 */
function parseDashManifest(raw) {
    return dashParser(raw);
}
//# sourceMappingURL=parseDashManifest.js.map