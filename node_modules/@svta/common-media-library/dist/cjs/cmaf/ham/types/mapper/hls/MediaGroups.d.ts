/**
 * HLS Media Groups
 *
 * @group CMAF
 * @alpha
 */
export type MediaGroups = {
    AUDIO: {
        [key: string]: {
            [key: string]: {
                language: string;
            };
        };
    };
    SUBTITLES: {
        [key: string]: {
            [key: string]: {
                language: string;
            };
        };
    };
};
//# sourceMappingURL=MediaGroups.d.ts.map