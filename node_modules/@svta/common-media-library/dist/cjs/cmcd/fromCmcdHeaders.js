"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromCmcdHeaders = fromCmcdHeaders;
const CmcdHeaderMap_js_1 = require("./CmcdHeaderMap.js");
const decodeCmcd_js_1 = require("./decodeCmcd.js");
const keys = Object.keys(CmcdHeaderMap_js_1.CmcdHeaderMap);
/**
 * Decode CMCD data from request headers.
 *
 * @param headers - The request headers to decode.
 *
 * @returns The decoded CMCD data.
 *
 * @group CMCD
 *
 * @beta
 */
function fromCmcdHeaders(headers) {
    if (!(headers instanceof Headers)) {
        headers = new Headers(headers);
    }
    return keys.reduce((acc, key) => {
        const value = headers.get(key);
        return Object.assign(acc, (0, decodeCmcd_js_1.decodeCmcd)(value));
    }, {});
}
//# sourceMappingURL=fromCmcdHeaders.js.map