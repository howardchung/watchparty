/**
 * @internal
 *
 * Get the codec value (video and audio). It can be present on adaptationSet or representation.
 *
 * @param adaptationSet - AdaptationSet to try to get the codec from
 * @param representation - Representation to try to get the codec from
 * @returns Content codec
 */
export function getCodec(adaptationSet, representation) {
    var _a, _b;
    const codec = (_b = (_a = representation.$.codecs) !== null && _a !== void 0 ? _a : adaptationSet.$.codecs) !== null && _b !== void 0 ? _b : '';
    if (!codec) {
        console.error(`Representation ${representation.$.id} has no codecs`);
    }
    return codec;
}
//# sourceMappingURL=getCodec.js.map