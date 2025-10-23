import { isTokenField } from '../../cta/utils/isTokenField.js';
import { isValid } from '../../cta/utils/isValid.js';
import { SfToken } from '../../structuredfield/SfToken.js';
import { CmcdFormatters } from '../CmcdFormatters.js';
/**
 * Internal CMCD processing function.
 *
 * @param obj - The CMCD object to process.
 * @param map - The mapping function to use.
 * @param options - Options for encoding.
 *
 * @internal
 *
 * @group CMCD
 */
export function processCmcd(obj, options) {
    const results = {};
    if (obj == null || typeof obj !== 'object') {
        return results;
    }
    const keys = Object.keys(obj).sort();
    const formatters = Object.assign({}, CmcdFormatters, options === null || options === void 0 ? void 0 : options.formatters);
    const filter = options === null || options === void 0 ? void 0 : options.filter;
    keys.forEach(key => {
        if (filter === null || filter === void 0 ? void 0 : filter(key)) {
            return;
        }
        let value = obj[key];
        const formatter = formatters[key];
        if (formatter) {
            value = formatter(value, options);
        }
        // Version should only be reported if not equal to 1.
        if (key === 'v' && value === 1) {
            return;
        }
        // Playback rate should only be sent if not equal to 1.
        if (key == 'pr' && value === 1) {
            return;
        }
        // ignore invalid values
        if (!isValid(value)) {
            return;
        }
        if (isTokenField(key) && typeof value === 'string') {
            value = new SfToken(value);
        }
        results[key] = value;
    });
    return results;
}
//# sourceMappingURL=processCmcd.js.map