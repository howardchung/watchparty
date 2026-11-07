"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZERO = exports.DENOMINATOR = exports.NUMERATOR = exports.FRAME_RATE_SEPARATOR = exports.AT_SEPARATOR = exports.HYPHEN_MINUS_SEPARATOR = exports.NEW_LINE = exports.WHITE_SPACE_ENCODED = exports.WHITE_SPACE = exports.FRAME_RATE_NUMERATOR_30 = exports.TEXT_SAMPLE_RATE = exports.VIDEO_SAMPLE_RATE = exports.TIMESCALE_1000 = exports.TIMESCALE_48000 = exports.TIMESCALE_90000 = void 0;
// Dash Timescale defaults
exports.TIMESCALE_90000 = 90000;
exports.TIMESCALE_48000 = 48000;
exports.TIMESCALE_1000 = 1000;
// Using 90000 as default for video since it is divisible by 24, 25 and 30
exports.VIDEO_SAMPLE_RATE = 90000;
// Using 1000 as default for text
exports.TEXT_SAMPLE_RATE = 1000;
// Frame rate numerator default
exports.FRAME_RATE_NUMERATOR_30 = 30;
// Manifest parser constants
exports.WHITE_SPACE = ' ';
exports.WHITE_SPACE_ENCODED = '%20'; //In some players , white space is not supported
exports.NEW_LINE = '\n';
exports.HYPHEN_MINUS_SEPARATOR = '-'; //In Dash it is used to separate the start and end of a byte range
exports.AT_SEPARATOR = '@'; //In Hls it is used to separate the start and end of a byte range
exports.FRAME_RATE_SEPARATOR = '/';
exports.NUMERATOR = 0;
exports.DENOMINATOR = 1;
exports.ZERO = 0;
//# sourceMappingURL=constants.js.map