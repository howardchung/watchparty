import { urlToRelativePath } from '../utils/urlToRelativePath.js';
const toRounded = (value) => Math.round(value);
const toUrlSafe = (value, options) => {
    if (options === null || options === void 0 ? void 0 : options.baseUrl) {
        value = urlToRelativePath(value, options.baseUrl);
    }
    return encodeURIComponent(value);
};
const toHundred = (value) => toRounded(value / 100) * 100;
/**
 * The default formatters for CMCD values.
 *
 * @group CMCD
 *
 * @beta
 */
export const CmcdFormatters = {
    /**
     * Bitrate (kbps) rounded integer
     */
    br: toRounded,
    /**
     * Duration (milliseconds) rounded integer
     */
    d: toRounded,
    /**
     * Buffer Length (milliseconds) rounded nearest 100ms
     */
    bl: toHundred,
    /**
     * Deadline (milliseconds) rounded nearest 100ms
     */
    dl: toHundred,
    /**
     * Measured Throughput (kbps) rounded nearest 100kbps
     */
    mtp: toHundred,
    /**
     * Next Object Request URL encoded
     */
    nor: toUrlSafe,
    /**
     * Requested maximum throughput (kbps) rounded nearest 100kbps
     */
    rtp: toHundred,
    /**
     * Top Bitrate (kbps) rounded integer
     */
    tb: toRounded,
};
//# sourceMappingURL=CmcdFormatters.js.map