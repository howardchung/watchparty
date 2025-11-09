"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCharForByte = void 0;
const specialCea608CharsCodes_js_1 = require("./specialCea608CharsCodes.js");
const getCharForByte = function (byte) {
    return String.fromCharCode(specialCea608CharsCodes_js_1.specialCea608CharsCodes[byte] || byte);
};
exports.getCharForByte = getCharForByte;
//# sourceMappingURL=getCharForByte.js.map