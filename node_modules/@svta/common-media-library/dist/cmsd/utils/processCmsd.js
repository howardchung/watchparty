import { isTokenField } from '../../cta/utils/isTokenField.js';
import { isValid } from '../../cta/utils/isValid.js';
import { SfToken } from '../../structuredfield/SfToken.js';
export function processCmsd(obj, options) {
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
        if (!isValid(value)) {
            return;
        }
        if (isTokenField(key) && typeof value === 'string') {
            value = useSymbol ? Symbol.for(value) : new SfToken(value);
        }
        results[key] = value;
    });
    return results;
}
//# sourceMappingURL=processCmsd.js.map