"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromCmcdQuery = fromCmcdQuery;
const CMCD_PARAM_js_1 = require("./CMCD_PARAM.js");
const decodeCmcd_js_1 = require("./decodeCmcd.js");
/**
 * Decode CMCD data from a query string.
 *
 * @param query - The query string to decode.
 *
 * @returns The decoded CMCD data.
 *
 * @group CMCD
 *
 * @beta
 */
function fromCmcdQuery(query) {
    if (typeof query === 'string') {
        query = new URLSearchParams(query);
    }
    const value = query.get(CMCD_PARAM_js_1.CMCD_PARAM);
    return (0, decodeCmcd_js_1.decodeCmcd)(value);
}
//# sourceMappingURL=fromCmcdQuery.js.map