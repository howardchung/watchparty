import React from 'react';

import styles from './ChatVideoCard.module.css';

const ChatVideoCard: React.FC<{
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
        {video.img && (
          <img
            className={styles.ThumbnailImage}
            src={video.img}
            alt={video.name}
          />
        )}
      </div>
      <div>
        <div>{video.name}</div>
      </div>
    </a>
  );
};

export default ChatVideoCard;
