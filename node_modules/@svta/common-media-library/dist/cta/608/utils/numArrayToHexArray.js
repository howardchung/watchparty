export const numArrayToHexArray = function (numArray) {
    const hexArray = [];
    for (let j = 0; j < numArray.length; j++) {
        hexArray.push(numArray[j].toString(16));
    }
    return hexArray;
};
//# sourceMappingURL=numArrayToHexArray.js.map