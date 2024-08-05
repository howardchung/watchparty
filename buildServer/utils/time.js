"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartOfMinute = exports.getStartOfHour = exports.getStartOfDay = void 0;
function getStartOfDay() {
    const now = Number(new Date());
    return now - (now % 86400000);
}
exports.getStartOfDay = getStartOfDay;
function getStartOfHour() {
    const now = Number(new Date());
    return now - (now % 3600000);
}
exports.getStartOfHour = getStartOfHour;
function getStartOfMinute() {
    const now = Number(new Date());
    return now - (now % 60000);
}
exports.getStartOfMinute = getStartOfMinute;
