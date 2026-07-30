"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHamToHls = mapHamToHls;
const generateManifestPlaylistPiece_js_1 = require("./generateManifestPlaylistPiece.js");
function mapHamToHls(presentations) {
    const version = 7; //TODO Add a way to change the version. For now version 7 is hardcoded as it is the first version of HLS with CMAF support
    let mainManifest = `#EXTM3U\n#EXT-X-VERSION:${version}\n\n`;
    const playlists = [];
    presentations.map((presentation) => {
        presentation.selectionSets.map((selectionSet) => {
            selectionSet.switchingSets.map((switchingSet) => {
                switchingSet.tracks.map((track) => {
                    var _a;
                    const { mainRef, playlist } = (0, generateManifestPlaylistPiece_js_1.generateManifestPlaylistPiece)(track);
                    mainManifest += mainRef;
                    const manifestFileName = (_a = track.fileName) !== null && _a !== void 0 ? _a : `${track.id}.m3u8`;
                    playlists.push({
                        manifest: playlist,
                        type: 'hls',
                        fileName: manifestFileName,
                    });
                });
            });
        });
    });
    return {
        manifest: mainManifest,
        ancillaryManifests: playlists,
        type: 'hls',
    };
}
//# sourceMappingURL=mapHamToHls.js.map