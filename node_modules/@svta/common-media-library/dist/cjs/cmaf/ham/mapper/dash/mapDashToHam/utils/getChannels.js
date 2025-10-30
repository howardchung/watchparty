"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannels = getChannels;
/**
 * @internal
 *
 * Get the channels value (audio). It can be present on adaptationSet or representation.
 *
 * @param adaptationSet - AdaptationSet to try to get the channels from
 * @param representation - Representation to try to get the channels from
 * @returns Channels value
 */
function getChannels(adaptationSet, representation) {
    var _a, _b, _c, _d, _e, _f;
    const channels = +((_f = (_c = (_b = (_a = adaptationSet.AudioChannelConfiguration) === null || _a === void 0 ? void 0 : _a.at(0)) === null || _b === void 0 ? void 0 : _b.$.value) !== null && _c !== void 0 ? _c : (_e = (_d = representation.AudioChannelConfiguration) === null || _d === void 0 ? void 0 : _d.at(0)) === null || _e === void 0 ? void 0 : _e.$.value) !== null && _f !== void 0 ? _f : 0);
    if (!channels) {
        console.error(`Representation ${representation.$.id} has no channels`);
    }
    return channels;
}
//# sourceMappingURL=getChannels.js.map