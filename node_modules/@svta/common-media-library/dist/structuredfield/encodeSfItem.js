import { SfItem } from './SfItem.js';
import { serializeItem } from './serialize/serializeItem.js';
export function encodeSfItem(value, params) {
    if (!(value instanceof SfItem)) {
        value = new SfItem(value, params);
    }
    return serializeItem(value);
}
//# sourceMappingURL=encodeSfItem.js.map