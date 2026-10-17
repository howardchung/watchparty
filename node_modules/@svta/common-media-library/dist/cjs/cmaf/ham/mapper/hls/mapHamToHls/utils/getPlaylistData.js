"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaylistData = getPlaylistData;
const getByterange_js_1 = require("./getByterange.js");
const getUrlInitialization_js_1 = require("./getUrlInitialization.js");
/**
 * @internal
 *
 * Get the playlist data in hls format from ham track.
 *
 * @param track - Track to get the playlist data from
 * @returns string containing the playlist data in the hls format
 *
 * @group CMAF
 * @alpha
 */
function getPlaylistData(track) {
    return `#EXT-X-MAP:URI="${(0, getUrlInitialization_js_1.getUrlInitialization)(track)}",${(0, getByterange_js_1.getByterange)(track)}\n`;
}
//# sourceMappingURL=getPlaylistData.js.map