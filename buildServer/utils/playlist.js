"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPlaylistVideoByUrl = void 0;
const findPlaylistVideoByUrl = (playlist, url) => {
    if (!url)
        return;
    return playlist.find((video) => video.url === url);
};
exports.findPlaylistVideoByUrl = findPlaylistVideoByUrl;
