"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDate = serializeDate;
const serializeInteger_js_1 = require("./serializeInteger.js");
// 4.1.10.  Serializing a Date
//
// Given a Date as input_integer, return an ASCII string suitable for
// use in an HTTP field value.
// 1.  Let output be "@".
// 2.  Append to output the result of running Serializing an Integer
//     with input_date (Section 4.1.4).
// 3.  Return output.
function serializeDate(value) {
    return `@${(0, serializeInteger_js_1.serializeInteger)(value.getTime() / 1000)}`;
}
//# sourceMappingURL=serializeDate.js.map