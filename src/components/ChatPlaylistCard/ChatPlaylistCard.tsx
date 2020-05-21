import React from 'react';

import styles from './ChatPlaylistCard.module.css';

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
      className={styles.Card}
    >
      <div className={styles.ThumbnailBox}>
        <img
          className={styles.ThumbnailImage}
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
