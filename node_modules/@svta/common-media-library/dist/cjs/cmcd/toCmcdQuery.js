"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCmcdQuery = toCmcdQuery;
const CMCD_PARAM_js_1 = require("./CMCD_PARAM.js");
const encodeCmcd_js_1 = require("./encodeCmcd.js");
/**
 * Convert a CMCD data object to a query arg.
 *
 * @param cmcd - The CMCD object to convert.
 * @param options - Options for encoding the CMCD object.
 *
 * @returns The CMCD query arg.
 *
 * @group CMCD
 *
 * @beta
 */
function toCmcdQuery(cmcd, options = {}) {
    if (!cmcd) {
        return '';
    }
    const params = (0, encodeCmcd_js_1.encodeCmcd)(cmcd, options);
    return `${CMCD_PARAM_js_1.CMCD_PARAM}=${encodeURIComponent(params)}`;
}
//# sourceMappingURL=toCmcdQuery.js.map