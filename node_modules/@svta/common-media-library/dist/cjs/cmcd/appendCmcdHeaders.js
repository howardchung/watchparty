"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendCmcdHeaders = appendCmcdHeaders;
const toCmcdHeaders_js_1 = require("./toCmcdHeaders.js");
/**
 * Append CMCD query args to a header object.
 *
 * @param headers - The headers to append to.
 * @param cmcd - The CMCD object to append.
 * @param options - Encode options.
 *
 * @returns The headers with the CMCD header shards appended.
 *
 * @group CMCD
 *
 * @beta
 */
function appendCmcdHeaders(headers, cmcd, options) {
    return Object.assign(headers, (0, toCmcdHeaders_js_1.toCmcdHeaders)(cmcd, options));
}
//# sourceMappingURL=appendCmcdHeaders.js.map