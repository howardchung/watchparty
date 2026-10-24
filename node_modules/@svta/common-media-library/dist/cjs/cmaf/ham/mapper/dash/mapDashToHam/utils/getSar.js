"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSar = getSar;
/**
 * @internal
 *
 * Get the sar value. It can be present on adaptationSet or representation.
 *
 * @param adaptationSet - AdaptationSet to try to get the sar from
 * @param representation - AdaptationSet to try to get the sar from
 * @returns sar value. In case it is not present, returns empty string.
 */
function getSar(adaptationSet, representation) {
    var _a, _b;
    const sar = (_b = (_a = representation.$.sar) !== null && _a !== void 0 ? _a : adaptationSet.$.sar) !== null && _b !== void 0 ? _b : '';
    if (!sar) {
        console.error(`Representation ${representation.$.id} has no sar`);
    }
    return sar;
}
//# sourceMappingURL=getSar.js.map