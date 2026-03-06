"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SfItem = void 0;
/**
 * Structured Field Item
 *
 * @group Structured Field
 *
 * @beta
 */
class SfItem {
    constructor(value, params) {
        if (Array.isArray(value)) {
            value = value.map((v) => (v instanceof SfItem) ? v : new SfItem(v));
        }
        this.value = value;
        this.params = params;
    }
}
exports.SfItem = SfItem;
//# sourceMappingURL=SfItem.js.map