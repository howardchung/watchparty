"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroup = getGroup;
const getContentType_js_1 = require("./getContentType.js");
function getGroup(adaptationSet) {
    var _a;
    return (_a = adaptationSet.$.group) !== null && _a !== void 0 ? _a : (0, getContentType_js_1.getContentType)(adaptationSet);
}
//# sourceMappingURL=getGroup.js.map