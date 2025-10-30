"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCmcd = processCmcd;
const isTokenField_js_1 = require("../../cta/utils/isTokenField.js");
const isValid_js_1 = require("../../cta/utils/isValid.js");
const SfToken_js_1 = require("../../structuredfield/SfToken.js");
const CmcdFormatters_js_1 = require("../CmcdFormatters.js");
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
function processCmcd(obj, options) {
    const results = {};
    if (obj == null || typeof obj !== 'object') {
        return results;
    }
    const keys = Object.keys(obj).sort();
    const formatters = Object.assign({}, CmcdFormatters_js_1.CmcdFormatters, options === null || options === void 0 ? void 0 : options.formatters);
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
        if (!(0, isValid_js_1.isValid)(value)) {
            return;
        }
        if ((0, isTokenField_js_1.isTokenField)(key) && typeof value === 'string') {
            value = new SfToken_js_1.SfToken(value);
        }
        results[key] = value;
    });
    return results;
}
//# sourceMappingURL=processCmcd.js.map