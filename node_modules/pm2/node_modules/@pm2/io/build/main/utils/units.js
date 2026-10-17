"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MILLISECONDS = 1;
const SECONDS = 1000 * MILLISECONDS;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;
exports.default = {
    NANOSECONDS: 1 / (1000 * 1000),
    MICROSECONDS: 1 / 1000,
    MILLISECONDS: MILLISECONDS,
    SECONDS: SECONDS,
    MINUTES: MINUTES,
    HOURS: HOURS,
    DAYS: 24 * HOURS
};
