let xmlSerializer;
/**
 * @internal
 */
export function setDashSerializer(serializer) {
    xmlSerializer = serializer;
}
/**
 * @internal
 */
export function getDashSerializer() {
    return xmlSerializer;
}
export function serializeDashManifest(json) {
    return xmlSerializer(json);
}
//# sourceMappingURL=serializeDashManifest.js.map