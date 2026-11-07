import { SfItem } from '../structuredfield/SfItem.js';
import { encodeSfList } from '../structuredfield/encodeSfList.js';
export function encodeCmsdDynamic(value, cmsd) {
    if (!value) {
        return '';
    }
    if (typeof value === 'string') {
        if (!cmsd) {
            return '';
        }
        value = [new SfItem(value, cmsd)];
    }
    return encodeSfList(value, { whitespace: false });
}
//# sourceMappingURL=encodeCmsdDynamic.js.map