"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iso8601DurationToNumber = iso8601DurationToNumber;
function iso8601DurationToNumber(isoDuration) {
    const hours = /(?:([.,\d]+)H)/.exec(isoDuration);
    const minutes = /(?:([.,\d]+)M)/.exec(isoDuration);
    const seconds = /(?:([.,\d]+)S)/.exec(isoDuration);
    let duration = 0;
    if (hours) {
        duration += +hours[1] * 60 * 60;
    }
    if (minutes) {
        duration += +minutes[1] * 60;
    }
    if (seconds) {
        duration += +seconds[1];
    }
    return duration;
}
//# sourceMappingURL=iso8601DurationToNumber.js.map