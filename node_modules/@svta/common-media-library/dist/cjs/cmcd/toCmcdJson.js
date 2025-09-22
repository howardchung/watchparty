"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCmcdJson = toCmcdJson;
const symbolToStr_js_1 = require("../cta/utils/symbolToStr.js");
const SfToken_js_1 = require("../structuredfield/SfToken.js");
const processCmcd_js_1 = require("./utils/processCmcd.js");
/**
 * Convert a CMCD data object to JSON.
 *
 * @param cmcd - The CMCD object to convert.
 * @param options - Options for encoding the CMCD object.
 *
 * @returns The CMCD JSON.
 *
 * @group CMCD
 *
 * @beta
 */
function toCmcdJson(cmcd, options) {
    const data = (0, processCmcd_js_1.processCmcd)(cmcd, options);
    return JSON.stringify(data, (_, value) => typeof value === 'symbol' || value instanceof SfToken_js_1.SfToken ? (0, symbolToStr_js_1.symbolToStr)(value) : value);
}
//# sourceMappingURL=toCmcdJson.js.map