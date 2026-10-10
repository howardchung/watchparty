"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setHlsParser = setHlsParser;
exports.getHlsParser = getHlsParser;
exports.parseHlsManifest = parseHlsManifest;
let hlsParser;
/**
 * @internal
 */
function setHlsParser(parser) {
    hlsParser = parser;
}
/**
 * @internal
 */
function getHlsParser() {
    return hlsParser;
}
function parseHlsManifest(text) {
    if (!text) {
        console.error("Can't parse empty HLS Manifest");
        return {};
    }
    return hlsParser(text);
}
//# sourceMappingURL=parseHlsManifest.js.map