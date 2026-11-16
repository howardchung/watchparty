// Dash Timescale defaults
export const TIMESCALE_90000 = 90000;
export const TIMESCALE_48000 = 48000;
export const TIMESCALE_1000 = 1000;
// Using 90000 as default for video since it is divisible by 24, 25 and 30
export const VIDEO_SAMPLE_RATE = 90000;
// Using 1000 as default for text
export const TEXT_SAMPLE_RATE = 1000;
// Frame rate numerator default
export const FRAME_RATE_NUMERATOR_30 = 30;
// Manifest parser constants
export const WHITE_SPACE = ' ';
export const WHITE_SPACE_ENCODED = '%20'; //In some players , white space is not supported
export const NEW_LINE = '\n';
export const HYPHEN_MINUS_SEPARATOR = '-'; //In Dash it is used to separate the start and end of a byte range
export const AT_SEPARATOR = '@'; //In Hls it is used to separate the start and end of a byte range
export const FRAME_RATE_SEPARATOR = '/';
export const NUMERATOR = 0;
export const DENOMINATOR = 1;
export const ZERO = 0;
//# sourceMappingURL=constants.js.map