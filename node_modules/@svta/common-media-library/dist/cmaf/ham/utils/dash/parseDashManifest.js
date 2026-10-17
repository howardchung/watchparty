let dashParser;
/**
 * @internal
 */
export function setDashParser(parser) {
    dashParser = parser;
}
/**
 * @internal
 */
export function getDashParser() {
    return dashParser;
}
/**
 * @internal
 * Parse XML to Json
 *
 * @param raw - Raw string containing the xml from the Dash Manifest
 * @returns json with the Dash Manifest structure
 */
export function parseDashManifest(raw) {
    return dashParser(raw);
}
//# sourceMappingURL=parseDashManifest.js.map