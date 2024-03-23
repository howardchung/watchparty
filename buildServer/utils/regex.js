"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PT_SECONDS_REGEX = exports.PT_MINUTES_REGEX = exports.PT_HOURS_REGEX = exports.YOUTUBE_VIDEO_ID_REGEX = void 0;
/** This regex searches for YouTube Video IDs from a YouTube URL */
/** example: */
/** YOUTUBE_VIDEO_ID_REGEX.exec('https://youtube.com/?v=14634524364) */
/** will return the id 14634524364 in the first exec group [1] */
exports.YOUTUBE_VIDEO_ID_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
/** These regexes allow us to find hours, minutes and seconds from a ISO 8601 time string */
exports.PT_HOURS_REGEX = /(\d{1,2})H/;
exports.PT_MINUTES_REGEX = /(\d{1,2})M/;
exports.PT_SECONDS_REGEX = /(\d{1,2})S/;
