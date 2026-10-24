/**
 * Structured Field Item
 *
 * @group Structured Field
 *
 * @beta
 */
export class SfItem {
    constructor(value, params) {
        if (Array.isArray(value)) {
            value = value.map((v) => (v instanceof SfItem) ? v : new SfItem(v));
        }
        this.value = value;
        this.params = params;
    }
}
//# sourceMappingURL=SfItem.js.map