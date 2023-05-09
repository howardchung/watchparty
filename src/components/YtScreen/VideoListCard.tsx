import React from 'react';
import image from '../../assets/icons/image-avengers.png';
import playIcon from '../../assets/icons/playIcon.svg';

const VideoListCard = ({ item, playlistAdd, onSetMedia, toggleHome }: any) => {
  return (
    <div className="bg-[#232323] py-2 px-3 rounded-lg min-w-[200px] overflow-hidden min-h-fit">
      <div className="flex space-y-3 flex-col">
        <div className="relative flex w-full overflow-x-hidden">
          <div className="w-full animate-marquee whitespace-nowrap">
            <h4 className=" m-0 text-md font-bold text-white">{item.name}</h4>
          </div>
        </div>
        <div className="relative">
          <img src={item.img} alt="" width="100%" className="h-28" />
          <div
            onClick={() => {
              onSetMedia(null, { value: item.url });
              toggleHome();
            }}
            className="absolute top-[50%] cursor-pointer left-[50%] translate-x-[-50%] translate-y-[-50%]"
          >
            <img src={playIcon} alt="" width="100%" />
          </div>
        </div>
        <button
          onClick={() => {
            // e.stopPropagation();
            // e.nativeEvent.stopImmediatePropagation();
            playlistAdd(null, { value: item.url });
          }}
          className="text-[16px] rounded-lg font-bold px-3 py-2 bg-white w-full"
        >
          Add to playlist
        </button>
      </div>
    </div>
  );
};

export default VideoListCard;
