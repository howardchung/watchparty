"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmcdHeaderMap = void 0;
const CmcdHeaderField_js_1 = require("./CmcdHeaderField.js");
/**
 * The map of CMCD header fields to official CMCD keys.
 *
 * @internal
 *
 * @group CMCD
 */
exports.CmcdHeaderMap = {
    [CmcdHeaderField_js_1.CmcdHeaderField.OBJECT]: ['br', 'd', 'ot', 'tb'],
    [CmcdHeaderField_js_1.CmcdHeaderField.REQUEST]: ['bl', 'dl', 'mtp', 'nor', 'nrr', 'su'],
    [CmcdHeaderField_js_1.CmcdHeaderField.SESSION]: ['cid', 'pr', 'sf', 'sid', 'st', 'v'],
    [CmcdHeaderField_js_1.CmcdHeaderField.STATUS]: ['bs', 'rtp'],
};
//# sourceMappingURL=CmcdHeaderMap.js.map