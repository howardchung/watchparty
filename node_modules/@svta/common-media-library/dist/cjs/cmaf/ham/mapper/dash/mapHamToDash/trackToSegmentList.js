"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackToSegmentList = trackToSegmentList;
const getTimescale_js_1 = require("./utils/getTimescale.js");
function trackToSegmentList(track) {
    var _a;
    const segmentList = [];
    const segmentURLs = [];
    track.segments.forEach((segment) => {
        segmentURLs.push({
            $: {
                media: segment.url,
            },
        });
    });
    if (!((_a = track.segments.at(0)) === null || _a === void 0 ? void 0 : _a.byteRange)) {
        const timescale = (0, getTimescale_js_1.getTimescale)(track);
        segmentList.push({
            $: {
                duration: ((track.duration * timescale) /
                    segmentURLs.length).toString(),
                timescale: timescale.toString(),
            },
            Initialization: [{ $: { sourceURL: track.urlInitialization } }],
            SegmentURL: segmentURLs,
        });
    }
    return segmentList;
}
//# sourceMappingURL=trackToSegmentList.js.map