import { trackToSegmentBase } from './trackToSegmentBase.js';
import { trackToSegmentList } from './trackToSegmentList.js';
import { getFrameRate } from './utils/getFrameRate.js';
export function tracksToRepresentation(tracks) {
    return tracks.map((track) => {
        var _a, _b;
        const representation = {
            $: {
                id: track.id,
                bandwidth: track.bandwidth.toString(),
            },
            SegmentBase: trackToSegmentBase(track),
            SegmentList: trackToSegmentList(track),
        };
        representation.$.mimeType = `${track.type}/mp4`; //Harcoded value
        if (track.type === 'video') {
            const videoTrack = track;
            representation.$ = {
                ...representation.$,
                frameRate: getFrameRate(track),
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