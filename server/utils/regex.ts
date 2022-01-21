/** This regex searches for YouTube Video IDs from a YouTube URL */
/** example: */
/** YOUTUBE_VIDEO_ID_REGEX.exec('https://youtube.com/?v=14634524364) */
/** will return the id 14634524364 in the first exec group [1] */
export const YOUTUBE_VIDEO_ID_REGEX =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

/** These regexes allow us to find hours, minutes and seconds from a ISO 8601 time string */
export const PT_HOURS_REGEX = /(\d{1,2})H/;
export const PT_MINUTES_REGEX = /(\d{1,2})M/;
export const PT_SECONDS_REGEX = /(\d{1,2})S/;
