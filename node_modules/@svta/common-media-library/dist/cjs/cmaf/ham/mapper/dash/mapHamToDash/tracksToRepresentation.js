"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracksToRepresentation = tracksToRepresentation;
const trackToSegmentBase_js_1 = require("./trackToSegmentBase.js");
const trackToSegmentList_js_1 = require("./trackToSegmentList.js");
const getFrameRate_js_1 = require("./utils/getFrameRate.js");
function tracksToRepresentation(tracks) {
    return tracks.map((track) => {
        var _a, _b;
        const representation = {
            $: {
                id: track.id,
                bandwidth: track.bandwidth.toString(),
            },
            SegmentBase: (0, trackToSegmentBase_js_1.trackToSegmentBase)(track),
            SegmentList: (0, trackToSegmentList_js_1.trackToSegmentList)(track),
        };
        representation.$.mimeType = `${track.type}/mp4`; //Harcoded value
        if (track.type === 'video') {
            const videoTrack = track;
            representation.$ = {
                ...representation.$,
                frameRate: (0, getFrameRate_js_1.getFrameRate)(track),
                width: videoTrack.width.toString(),
                height: videoTrack.height.toString(),
                codecs: videoTrack.codec,
            };
            if (videoTrack.scanType) {
                representation.$.scanType = videoTrack.scanType;
            }
        }
        if (track.type === 'audio') {
            const audioTrack = track;
            representation.$ = {
                ...representation.$,
                audioSamplingRate: audioTrack.sampleRate.toString(),
                codecs: audioTrack.codec,
            };
            representation.AudioChannelConfiguration = [
                {
                    $: {
                        schemeIdUri: 'urn:mpeg:dash:23003:3:audio_channel_configuration:2011', // hardcoded value
                        value: (_a = audioTrack.channels.toString()) !== null && _a !== void 0 ? _a : '',
                    },
                },
            ];
        }
        if ((_b = track.segments[0]) === null || _b === void 0 ? void 0 : _b.byteRange) {
            // Only BaseSegments have byteRange on segments, and BaseURL on the representation
            representation.BaseURL = [track.segments[0].url];
        }
        return representation;
    });
}
//# sourceMappingURL=tracksToRepresentation.js.map