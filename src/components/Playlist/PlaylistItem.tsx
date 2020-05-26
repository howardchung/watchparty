import React from 'react';

const PlaylistItem: React.FC<{
  video: PlaylistVideo;
}> = (props) => {
  const { video } = props;

  return (
    <div>
      <div>
        <div>{video.duration}</div>
        <img src={video.img} alt={video.name} />
      </div>
      <div>
        <a href={video.url} target="_blank" rel="noopener noreferrer">
          {video.name}
        </a>
      </div>
      <div>{video.channel}</div>
    </div>
  );
};

export default PlaylistItem;
