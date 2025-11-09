"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCmcdHeaders = toCmcdHeaders;
const CmcdHeaderField_js_1 = require("./CmcdHeaderField.js");
const CmcdHeaderMap_js_1 = require("./CmcdHeaderMap.js");
const encodeCmcd_js_1 = require("./encodeCmcd.js");
/**
 * Convert a CMCD data object to request headers
 *
 * @param cmcd - The CMCD data object to convert.
 * @param options - Options for encoding the CMCD object.
 *
 * @returns The CMCD header shards.
 *
 * @group CMCD
 *
 * @beta
 */
function toCmcdHeaders(cmcd, options = {}) {
    const result = {};
    if (!cmcd) {
        return result;
    }
    const entries = Object.entries(cmcd);
    const headerMap = Object.entries(CmcdHeaderMap_js_1.CmcdHeaderMap)
        .concat(Object.entries((options === null || options === void 0 ? void 0 : options.customHeaderMap) || {}));
    const shards = entries.reduce((acc, entry) => {
        var _a, _b;
        const [key, value] = entry;
        const field = ((_a = headerMap.find(entry => entry[1].includes(key))) === null || _a === void 0 ? void 0 : _a[0]) || CmcdHeaderField_js_1.CmcdHeaderField.REQUEST;
        (_b = acc[field]) !== null && _b !== void 0 ? _b : (acc[field] = {});
        acc[field][key] = value;
        return acc;
    }, {});
    return Object.entries(shards)
        .reduce((acc, [field, value]) => {
        acc[field] = (0, encodeCmcd_js_1.encodeCmcd)(value, options);
        return acc;
    }, result);
}
//# sourceMappingURL=toCmcdHeaders.js.map