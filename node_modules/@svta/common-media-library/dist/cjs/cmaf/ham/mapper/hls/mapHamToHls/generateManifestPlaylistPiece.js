"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateManifestPlaylistPiece = generateManifestPlaylistPiece;
const getPlaylistData_js_1 = require("./utils/getPlaylistData.js");
const getSegments_js_1 = require("./utils/getSegments.js");
function generateManifestPlaylistPiece(track) {
    var _a;
    const mediaSequence = 0; //TODO : save mediaSequence in the model.
    const trackFileName = (_a = track.fileName) !== null && _a !== void 0 ? _a : `${track.id}.m3u8`;
    let mainRef = '';
    let playlist = `#EXTM3U\n#EXT-X-TARGETDURATION:${track.duration / track.segments.length}\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXT-X-MEDIA-SEQUENCE:${mediaSequence}\n`;
    if (track.type.toLowerCase() === 'video') {
        const videoTrack = track;
        mainRef += `#EXT-X-STREAM-INF:BANDWIDTH=${videoTrack.bandwidth},CODECS="${videoTrack.codec}",RESOLUTION=${videoTrack.width}x${videoTrack.height}\n${trackFileName}\n`;
        playlist += (0, getPlaylistData_js_1.getPlaylistData)(videoTrack);
    }
    else if (track.type.toLowerCase() === 'audio') {
        const audioTrack = track;
        mainRef += `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="${audioTrack.id}",LANGUAGE="${audioTrack.language}",NAME="${audioTrack.id}",URI="${trackFileName}"\n`;
        playlist += (0, getPlaylistData_js_1.getPlaylistData)(audioTrack);
    }
    else if (track.type.toLowerCase() === 'text') {
        const textTrack = track;
        mainRef += `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="${textTrack.id}",NAME="${textTrack.id}",LANGUAGE="${textTrack.language}",URI="${trackFileName}"\n`;
    }
    playlist += `${(0, getSegments_js_1.getSegments)(track.segments)}#EXT-X-ENDLIST`;
    return { mainRef, playlist };
}
//# sourceMappingURL=generateManifestPlaylistPiece.js.map