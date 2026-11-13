/**
 * HLS Playlist
 *
 * @group CMAF
 * @alpha
 */
export type PlayList = {
    uri: string;
    attributes: {
        FRAME_RATE: number;
        CODECS: string;
        BANDWIDTH: number;
        RESOLUTION: {
            width: number;
            height: number;
        };
    };
};
//# sourceMappingURL=Playlist.d.ts.map