let hlsParser;
/**
 * @internal
 */
export function setHlsParser(parser) {
    hlsParser = parser;
}
/**
 * @internal
 */
export function getHlsParser() {
    return hlsParser;
}
export function parseHlsManifest(text) {
    if (!text) {
        console.error("Can't parse empty HLS Manifest");
        return {};
    }
    return hlsParser(text);
}
//# sourceMappingURL=parseHlsManifest.js.map