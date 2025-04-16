"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartOfDay = getStartOfDay;
exports.getStartOfHour = getStartOfHour;
exports.getStartOfMinute = getStartOfMinute;
function getStartOfDay() {
    const now = Date.now();
    return now - (now % 86400000);
}
function getStartOfHour() {
    const now = Date.now();
    return now - (now % 3600000);
}
function getStartOfMinute() {
    const now = Date.now();
    return now - (now % 60000);
}
