import { getChannels } from './utils/getChannels.js';
import { getCodec } from './utils/getCodec.js';
import { getContentType } from './utils/getContentType.js';
import { getFrameRate } from './utils/getFrameRate.js';
import { getLanguage } from './utils/getLanguage.js';
import { getSampleRate } from './utils/getSampleRate.js';
import { getSar } from './utils/getSar.js';
import { getTrackDuration } from './utils/getTrackDuration.js';
/**
 * @internal
 *
 * Map dash components to ham tracks.
 *
 * @param adaptationSet - AdaptationSet of the dash manifest
 * @param representation - Representation of the dash manifest
 * @param segments - Segments from the representation of the dash manifest
 * @param initializationUrl - Initialization url from the track
 * @returns AudioTrack, VideoTrack or TextTrack depending on the type
 */
export function mapTracks(adaptationSet, representation, segments, initializationUrl) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    if (!adaptationSet) {
        throw new Error('Error: AdaptationSet is undefined');
    }
    const type = getContentType(adaptationSet, representation);
    if (type === 'video') {
        return {
            bandwidth: +((_a = representation.$.bandwidth) !== null && _a !== void 0 ? _a : 0),
            codec: getCodec(adaptationSet, representation),
            duration: getTrackDuration(segments),
            frameRate: getFrameRate(adaptationSet, representation),
            height: +((_b = representation.$.height) !== null && _b !== void 0 ? _b : 0),
            id: (_c = representation.$.id) !== null && _c !== void 0 ? _c : '',
            language: getLanguage(adaptationSet),
            par: (_d = adaptationSet.$.par) !== null && _d !== void 0 ? _d : '',
            sar: getSar(adaptationSet, representation),
            scanType: (_e = representation.$.scanType) !== null && _e !== void 0 ? _e : '',
            segments,
            type,
            width: +((_f = representation.$.width) !== null && _f !== void 0 ? _f : 0),
            urlInitialization: initializationUrl,
        };
    }
    else if (type === 'audio') {
        return {
            bandwidth: +((_g = representation.$.bandwidth) !== null && _g !== void 0 ? _g : 0),
            channels: getChannels(adaptationSet, representation),
            codec: getCodec(adaptationSet, representation),
            duration: getTrackDuration(segments),
            id: (_h = representation.$.id) !== null && _h !== void 0 ? _h : '',
            language: getLanguage(adaptationSet),
            sampleRate: getSampleRate(adaptationSet, representation),
            segments,
            type,
            urlInitialization: initializationUrl,
        };
    }
    else {
        // if (type === 'text')
        return {
            bandwidth: +((_j = representation.$.bandwidth) !== null && _j !== void 0 ? _j : 0),
            codec: getCodec(adaptationSet, representation),
            duration: getTrackDuration(segments),
            id: (_k = representation.$.id) !== null && _k !== void 0 ? _k : '',
            language: getLanguage(adaptationSet),
            segments,
            type,
            urlInitialization: initializationUrl,
        };
    }
}
//# sourceMappingURL=mapTracks.js.map