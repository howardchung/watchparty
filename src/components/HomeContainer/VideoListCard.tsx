import React from 'react';
import image from '../../assets/icons/image-avengers.png';
import playIcon from '../../assets/icons/playIcon.svg';

const VideoListCard = () => {
  return (
    <div className="bg-[#232323] py-2 px-3 rounded-lg min-w-[180px] min-h-fit">
      <div className="flex space-y-3 flex-col">
        <h4 className=" m-0 text-sm font-bold text-white">Avengers</h4>
        <div className="relative">
          <img src={image} alt="" />
          <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <img src={playIcon} alt="" />
          </div>
        </div>
        <button className="text-[16px] rounded-lg font-bold px-3 py-2 bg-white w-full">
          Add to playlist
        </button>
      </div>
    </div>
  );
};

export default VideoListCard;
