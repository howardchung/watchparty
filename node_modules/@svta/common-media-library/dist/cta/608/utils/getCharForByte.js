import { specialCea608CharsCodes } from './specialCea608CharsCodes.js';
export const getCharForByte = function (byte) {
    return String.fromCharCode(specialCea608CharsCodes[byte] || byte);
};
//# sourceMappingURL=getCharForByte.js.map