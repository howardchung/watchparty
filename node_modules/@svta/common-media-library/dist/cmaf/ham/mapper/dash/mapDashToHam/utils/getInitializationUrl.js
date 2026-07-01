/**
 * @internal
 *
 * Get the initialization url. It can be present on AdaptationSet or Representation.
 *
 * Url initialization is present on segments.
 *
 * @param adaptationSet - AdaptationSet to try to get the initialization url from
 * @param representation - Representation to try to get the initialization url from
 */
export function getInitializationUrl(adaptationSet, representation) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    let initializationUrl;
    if (representation.SegmentBase) {
        initializationUrl = (_a = representation.BaseURL[0]) !== null && _a !== void 0 ? _a : '';
    }
    else if (adaptationSet.SegmentList || representation.SegmentList) {
        initializationUrl =
            ((_c = (_b = representation.SegmentList) === null || _b === void 0 ? void 0 : _b.at(0)) === null || _c === void 0 ? void 0 : _c.Initialization[0].$.sourceURL) ||
                ((_e = (_d = adaptationSet.SegmentList) === null || _d === void 0 ? void 0 : _d.at(0)) === null || _e === void 0 ? void 0 : _e.Initialization[0].$.sourceURL);
    }
    if (adaptationSet.SegmentTemplate || representation.SegmentTemplate) {
        initializationUrl =
            ((_g = (_f = adaptationSet.SegmentTemplate) === null || _f === void 0 ? void 0 : _f.at(0)) === null || _g === void 0 ? void 0 : _g.$.initialization) ||
                ((_j = (_h = representation.SegmentTemplate) === null || _h === void 0 ? void 0 : _h.at(0)) === null || _j === void 0 ? void 0 : _j.$.initialization);
        if (initializationUrl === null || initializationUrl === void 0 ? void 0 : initializationUrl.includes('$RepresentationID$')) {
            initializationUrl = initializationUrl.replace('$RepresentationID$', (_k = representation.$.id) !== null && _k !== void 0 ? _k : '');
        }
    }
    return initializationUrl;
}
//# sourceMappingURL=getInitializationUrl.js.map