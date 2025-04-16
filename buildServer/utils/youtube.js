"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoDuration = exports.fetchYoutubeVideo = exports.getYoutubeVideoID = exports.youtubePlaylist = exports.searchYoutube = exports.mapYoutubePlaylistResult = exports.mapYoutubeListResult = exports.mapYoutubeSearchResult = void 0;
const config_1 = __importDefault(require("../config"));
const regex_1 = require("./regex");
const youtube_1 = require("@googleapis/youtube");
let Youtube = config_1.default.YOUTUBE_API_KEY
    ? (0, youtube_1.youtube)({
        version: 'v3',
        auth: config_1.default.YOUTUBE_API_KEY,
    })
    : null;
const mapYoutubeSearchResult = (video) => {
    return {
        channel: video.snippet?.channelTitle ?? '',
        url: 'https://www.youtube.com/watch?v=' + video?.id?.videoId,
        name: video.snippet?.title ?? '',
        img: video.snippet?.thumbnails?.default?.url ?? '',
        duration: 0,
        type: 'youtube',
    };
};
exports.mapYoutubeSearchResult = mapYoutubeSearchResult;
const mapYoutubeListResult = (video) => {
    const videoId = video.id;
    return {
        url: 'https://www.youtube.com/watch?v=' + videoId,
        name: video.snippet?.title ?? '',
        img: video.snippet?.thumbnails?.default?.url ?? '',
        channel: video.snippet?.channelTitle ?? '',
        duration: (0, exports.getVideoDuration)(video.contentDetails?.duration ?? ''),
        type: 'youtube',
    };
};
exports.mapYoutubeListResult = mapYoutubeListResult;
const mapYoutubePlaylistResult = (item) => {
    return {
        url: 'https://www.youtube.com/watch?v=' + item.snippet?.resourceId?.videoId,
        name: item.snippet?.title ?? '',
        img: item.snippet?.thumbnails?.default?.url ?? '',
        channel: item.snippet?.channelTitle ?? '',
        duration: 0,
        // duration: getVideoDuration(video.contentDetails?.duration ?? ''),
        type: 'youtube',
    };
};
exports.mapYoutubePlaylistResult = mapYoutubePlaylistResult;
const searchYoutube = async (query) => {
    const response = await Youtube?.search.list({
        part: ['snippet'],
        type: ['video'],
        maxResults: 25,
        q: query,
    });
    return response?.data?.items?.map(exports.mapYoutubeSearchResult) ?? [];
};
exports.searchYoutube = searchYoutube;
const youtubePlaylist = async (playlistId) => {
    const response = await Youtube?.playlistItems.list({
        part: ['snippet'],
        playlistId,
        maxResults: 100,
    });
    return response?.data?.items?.map(exports.mapYoutubePlaylistResult) ?? [];
};
exports.youtubePlaylist = youtubePlaylist;
const getYoutubeVideoID = (url) => {
    const idParts = regex_1.YOUTUBE_VIDEO_ID_REGEX.exec(url);
    if (!idParts) {
        return;
    }
    const id = idParts[1];
    if (!id) {
        return;
    }
    return id;
};
exports.getYoutubeVideoID = getYoutubeVideoID;
const fetchYoutubeVideo = async (id) => {
    const response = await Youtube?.videos.list({
        part: ['snippet', 'contentDetails'],
        id: [id],
    });
    const top = response?.data?.items?.[0];
    return top ? (0, exports.mapYoutubeListResult)(top) : null;
};
exports.fetchYoutubeVideo = fetchYoutubeVideo;
const getVideoDuration = (string) => {
    if (!string) {
        return 0;
    }
    const hoursParts = regex_1.PT_HOURS_REGEX.exec(string);
    const minutesParts = regex_1.PT_MINUTES_REGEX.exec(string);
    const secondsParts = regex_1.PT_SECONDS_REGEX.exec(string);
    const hours = hoursParts ? parseInt(hoursParts[1]) : 0;
    const minutes = minutesParts ? parseInt(minutesParts[1]) : 0;
    const seconds = secondsParts ? parseInt(secondsParts[1]) : 0;
    const totalSeconds = seconds + minutes * 60 + hours * 60 * 60;
    return totalSeconds;
};
exports.getVideoDuration = getVideoDuration;
