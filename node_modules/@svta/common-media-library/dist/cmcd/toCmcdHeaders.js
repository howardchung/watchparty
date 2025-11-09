import { CmcdHeaderField } from './CmcdHeaderField.js';
import { CmcdHeaderMap } from './CmcdHeaderMap.js';
import { encodeCmcd } from './encodeCmcd.js';
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
export function toCmcdHeaders(cmcd, options = {}) {
    const result = {};
    if (!cmcd) {
        return result;
    }
    const entries = Object.entries(cmcd);
    const headerMap = Object.entries(CmcdHeaderMap)
        .concat(Object.entries((options === null || options === void 0 ? void 0 : options.customHeaderMap) || {}));
    const shards = entries.reduce((acc, entry) => {
        var _a, _b;
        const [key, value] = entry;
        const field = ((_a = headerMap.find(entry => entry[1].includes(key))) === null || _a === void 0 ? void 0 : _a[0]) || CmcdHeaderField.REQUEST;
        (_b = acc[field]) !== null && _b !== void 0 ? _b : (acc[field] = {});
        acc[field][key] = value;
        return acc;
    }, {});
    return Object.entries(shards)
        .reduce((acc, [field, value]) => {
        acc[field] = encodeCmcd(value, options);
        return acc;
    }, result);
}
//# sourceMappingURL=toCmcdHeaders.js.map