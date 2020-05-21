import './ChatPlaylistCard.css';

import React from 'react';

const ChatPlaylistCard: React.FC<{
  video: PlaylistVideo;
}> = (props) => {
  const { video } = props;

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      title={video.name}
      className="ChatPlaylistCard"
    >
      <div className="ChatPlaylistCard__ThumbnailBox">
        <img
          className="ChatPlaylistCard__ThumbnailImage"
          src={video.img}
          alt={video.name}
        />
      </div>
      <div>
        <div>{video.name}</div>
      </div>
    </a>
  );
};

export default ChatPlaylistCard;
