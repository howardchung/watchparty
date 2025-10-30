"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numArrayToHexArray = void 0;
const numArrayToHexArray = function (numArray) {
    const hexArray = [];
    for (let j = 0; j < numArray.length; j++) {
        hexArray.push(numArray[j].toString(16));
    }
    return hexArray;
};
exports.numArrayToHexArray = numArrayToHexArray;
//# sourceMappingURL=numArrayToHexArray.js.map