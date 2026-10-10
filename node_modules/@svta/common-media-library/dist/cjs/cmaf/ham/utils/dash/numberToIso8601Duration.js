"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberToIso8601Duration = numberToIso8601Duration;
function numberToIso8601Duration(duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    if (hours > 0) {
        return `PT${hours}H${minutes}M${seconds}S`;
    }
    else if (minutes > 0) {
        return `PT${minutes}M${seconds}S`;
    }
    return `PT${seconds}S`;
}
//# sourceMappingURL=numberToIso8601Duration.js.map