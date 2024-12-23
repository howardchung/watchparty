"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashString = void 0;
function hashString(input) {
    var hash = 0;
    for (var i = 0; i < input.length; i++) {
        var charCode = input.charCodeAt(i);
        hash += charCode;
    }
    return hash;
}
exports.hashString = hashString;
