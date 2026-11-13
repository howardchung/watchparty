"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPresentationId = getPresentationId;
/**
 * @internal
 *
 * Generates a presentation id. It uses the period id as default or creates one
 * if none is present.
 *
 * @param period - Period to try to get the id from
 * @param duration - Duration of the content
 * @returns Presentation id
 */
function getPresentationId(period, duration) {
    var _a;
    return (_a = period.$.id) !== null && _a !== void 0 ? _a : `presentation-id-${duration}`;
}
//# sourceMappingURL=getPresentationId.js.map