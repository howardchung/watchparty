import Youtube from "youtube-api";

export const authenticateYoutube = () => {
  if (process.env.YOUTUBE_API_KEY) {
    Youtube.authenticate({
      type: "key",
      key: process.env.YOUTUBE_API_KEY,
    });
  }
};
