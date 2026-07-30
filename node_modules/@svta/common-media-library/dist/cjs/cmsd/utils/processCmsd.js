"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCmsd = processCmsd;
const isTokenField_js_1 = require("../../cta/utils/isTokenField.js");
const isValid_js_1 = require("../../cta/utils/isValid.js");
const SfToken_js_1 = require("../../structuredfield/SfToken.js");
function processCmsd(obj, options) {
    const results = {};
    if (obj == null || typeof obj !== 'object') {
        return results;
    }
    const keys = Object.keys(obj);
    const useSymbol = (options === null || options === void 0 ? void 0 : options.useSymbol) !== false;
    keys.forEach(key => {
        let value = obj[key];
        // Version should only be reported if not equal to 1.
        if (key === 'v' && value === 1) {
            return;
        }
        // ignore invalid values
        if (!(0, isValid_js_1.isValid)(value)) {
            return;
        }
        if ((0, isTokenField_js_1.isTokenField)(key) && typeof value === 'string') {
            value = useSymbol ? Symbol.for(value) : new SfToken_js_1.SfToken(value);
        }
        results[key] = value;
    });
    return results;
}
//# sourceMappingURL=processCmsd.js.map