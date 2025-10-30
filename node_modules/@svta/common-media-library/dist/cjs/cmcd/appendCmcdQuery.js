"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendCmcdQuery = appendCmcdQuery;
const toCmcdQuery_js_1 = require("./toCmcdQuery.js");
const REGEX = /CMCD=[^&#]+/;
/**
 * Append CMCD query args to a URL.
 *
 * @param url - The URL to append to.
 * @param cmcd - The CMCD object to append.
 * @param options - Options for encoding the CMCD object.
 *
 * @returns The URL with the CMCD query args appended.
 *
 * @group CMCD
 *
 * @beta
 */
function appendCmcdQuery(url, cmcd, options) {
    // TODO: Replace with URLSearchParams once we drop Safari < 10.1 & Chrome < 49 support.
    // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
    const query = (0, toCmcdQuery_js_1.toCmcdQuery)(cmcd, options);
    if (!query) {
        return url;
    }
    if (REGEX.test(url)) {
        return url.replace(REGEX, query);
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${query}`;
}
//# sourceMappingURL=appendCmcdQuery.js.map