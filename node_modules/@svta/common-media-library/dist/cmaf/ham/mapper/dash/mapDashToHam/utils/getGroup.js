import { getContentType } from './getContentType.js';
export function getGroup(adaptationSet) {
    var _a;
    return (_a = adaptationSet.$.group) !== null && _a !== void 0 ? _a : getContentType(adaptationSet);
}
//# sourceMappingURL=getGroup.js.map