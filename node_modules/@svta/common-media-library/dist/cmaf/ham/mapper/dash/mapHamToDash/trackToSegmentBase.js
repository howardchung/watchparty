export function trackToSegmentBase(track) {
    var _a;
    const segments = [];
    if (track.segments.length > 0 &&
        track.byteRange &&
        track.segments[0].byteRange &&
        track.segments[0].byteRange.includes('@')) {
        let firstSegment = undefined;
        const initByteRange = track.byteRange.includes('-')
            ? track.byteRange.split('-')[1]
            : track.byteRange.includes('@')
                ? track.byteRange.split('@')[0]
                : '';
        const initRange = +initByteRange - 1;
        const byteFirstSegment = track.segments[0].byteRange.includes('-')
            ? track.segments[0].byteRange.split('-')[1]
            : track.segments[0].byteRange.includes('@')
                ? track.segments[0].byteRange.split('@')[1]
                : '';
        const numberFirstByteRange = +byteFirstSegment - 1;
        firstSegment = {
            $: {
                indexRange: `${initByteRange}-${numberFirstByteRange}`,
            },
            Initialization: [{ $: { range: `0-${initRange}` } }],
        };
        if (firstSegment && track.type === 'audio') {
            // All segments should have timescale, but for now, just the audio ones store this value
            const audioTrack = track;
            firstSegment.$.timescale = (_a = audioTrack.sampleRate.toString()) !== null && _a !== void 0 ? _a : '';
        }
        if (firstSegment) {
            segments.push(firstSegment);
        }
    }
    else {
        track.segments.forEach((segment) => {
            var _a;
            let newSegment;
            if (segment.byteRange) {
                const initRange = +segment.byteRange.split('-')[0] - 1;
                newSegment = {
                    $: {
                        indexRange: segment.byteRange,
                    },
                    Initialization: [{ $: { range: `0-${initRange}` } }],
                };
            }
            if (newSegment && track.type === 'audio') {
                // All segments should have timescale, but for now, just the audio ones store this value
                const audioTrack = track;
                newSegment.$.timescale = (_a = audioTrack.sampleRate.toString()) !== null && _a !== void 0 ? _a : '';
            }
            if (newSegment) {
                segments.push(newSegment);
            }
        });
    }
    return segments;
}
//# sourceMappingURL=trackToSegmentBase.js.map