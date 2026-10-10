"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDashSerializer = setDashSerializer;
exports.getDashSerializer = getDashSerializer;
exports.serializeDashManifest = serializeDashManifest;
let xmlSerializer;
/**
 * @internal
 */
function setDashSerializer(serializer) {
    xmlSerializer = serializer;
}
/**
 * @internal
 */
function getDashSerializer() {
    return xmlSerializer;
}
function serializeDashManifest(json) {
    return xmlSerializer(json);
}
//# sourceMappingURL=serializeDashManifest.js.map