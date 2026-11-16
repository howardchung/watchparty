/**
 * @internal
 *
 * Get the type of the content. It can be obtained directly from AdaptationSet or Representation
 * or can be inferred with the existing properties.
 *
 * @param adaptationSet - AdaptationSet to get the type from
 * @param representation - Representation to get the type from
 * @returns type of the content
 */
export function getContentType(adaptationSet, representation) {
    var _a, _b, _c, _d;
    if (adaptationSet.$.contentType) {
        return adaptationSet.$.contentType;
    }
    if ((_a = adaptationSet.ContentComponent) === null || _a === void 0 ? void 0 : _a.at(0)) {
        return adaptationSet.ContentComponent.at(0).$.contentType;
    }
    if (adaptationSet.$.mimeType || (representation === null || representation === void 0 ? void 0 : representation.$.mimeType)) {
        const type = ((_b = adaptationSet.$.mimeType) === null || _b === void 0 ? void 0 : _b.split('/')[0]) ||
            ((_c = representation === null || representation === void 0 ? void 0 : representation.$.mimeType) === null || _c === void 0 ? void 0 : _c.split('/')[0]);
        if (type === 'audio' || type === 'video' || type === 'text') {
            return type;
        }
        if (type === 'application') {
            return 'text';
        }
    }
    if (adaptationSet.$.maxHeight) {
        return 'video';
    }
    const adaptationRef = (_d = adaptationSet.$.id) !== null && _d !== void 0 ? _d : `group: ${adaptationSet.$.group}, lang: ${adaptationSet.$.lang}`;
    console.error(`Could not find contentType from adaptationSet ${adaptationRef}`);
    console.info('Using "text" as default contentType');
    return 'text';
}
//# sourceMappingURL=getContentType.js.map