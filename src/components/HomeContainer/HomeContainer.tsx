import React, { useState } from 'react';
import trendingRed from '../../assets/icons/trending-r.png';
import trendingWhite from '../../assets/icons/trending-w.png';
import liveRed from '../../assets/icons/live-r.svg';
import liveWhite from '../../assets/icons/live-w.svg';
import movieR from '../../assets/icons/movie-r.svg';
import movieW from '../../assets/icons/movie-w.svg';
import gamingR from '../../assets/icons/gaming-r.svg';
import VideoListCard from './VideoListCard';
import classes from './HomeContainer.module.css';
import { ComboBox } from '../ComboBox/ComboBox';

const HomeContainer = () => {
  const [selectBtn, setSelectBtn] = useState(1);

  return (
    <div className="bg-[#1E1E1E] w-full relative h-screen">
      <div className="pl-[3%] h-full pt-8">
        <div className="h-full flex flex-col justify-end lg:justify-center pb-[1rem]">
          <div className="flex space-x-6">
            <div
              className="relative flex items-end" /* className={`${selectBtn ===1 && "scale-0"}`} */
            >
              <button
                onClick={() => setSelectBtn(1)}
                className={` ${
                  selectBtn === 1 ? `bg-[#DC0606] py-5` : `py-3 bg-[#fff]`
                } rounded-lg px-6 flex space-x-2 duration-500 justify-center items-center`}
              >
                <img
                  width={15}
                  src={selectBtn === 1 ? trendingWhite : trendingRed}
                  alt=""
                />
                <span
                  className={`${
                    selectBtn === 1 ? 'text-white' : 'text-[#DC0606]'
                  } text-[18px] font-bold`}
                >
                  Trending
                </span>
              </button>
              {selectBtn === 1 && (
                <div className="absolute top-[100%] w-full left-0 h-[4px] duration-500 rounded-lg mt-2 bg-[#3a3a3a]"></div>
              )}
            </div>
            <div
              className="relative flex items-end " /* className={`${selectBtn ===1 && "scale-0"}`} */
            >
              <button
                onClick={() => setSelectBtn(2)}
                className={` ${
                  selectBtn === 2 ? `bg-[#DC0606] py-5` : `py-3 bg-[#fff]`
                } rounded-lg px-6 flex space-x-2 justify-center duration-500  items-center`}
              >
                <img
                  width={20}
                  src={selectBtn === 2 ? liveWhite : liveRed}
                  alt=""
                />
                <span
                  className={`${
                    selectBtn === 2 ? 'text-white' : 'text-[#DC0606]'
                  } text-[18px] font-bold`}
                >
                  Live
                </span>
              </button>
              {selectBtn === 2 && (
                <div className="absolute top-[100%] w-full left-0 h-[4px] duration-500 rounded-lg mt-2 bg-[#3a3a3a]"></div>
              )}
            </div>
            <div
              className="relative flex items-end " /* className={`${selectBtn ===1 && "scale-0"}`} */
            >
              <button
                onClick={() => setSelectBtn(3)}
                className={` ${
                  selectBtn === 3 ? `bg-[#DC0606] py-5` : `py-3 bg-[#fff]`
                } rounded-lg px-6 flex space-x-2 justify-center duration-500  items-center`}
              >
                <img
                  width={18}
                  src={selectBtn === 3 ? movieW : movieR}
                  alt=""
                />
                <span
                  className={`${
                    selectBtn === 3 ? 'text-white' : 'text-[#DC0606]'
                  } text-[18px] font-bold`}
                >
                  Movie
                </span>
              </button>
              {selectBtn === 3 && (
                <div className="absolute top-[100%] w-full left-0 h-[4px] duration-500 rounded-lg mt-2 bg-[#3a3a3a]"></div>
              )}
            </div>
            <div
              className="relative flex items-end " /* className={`${selectBtn ===1 && "scale-0"}`} */
            >
              <button
                onClick={() => setSelectBtn(4)}
                className={` ${
                  selectBtn === 4 ? `bg-[#DC0606] py-5` : `py-3 bg-[#fff]`
                } rounded-lg px-6 flex space-x-2 justify-center duration-500  items-center`}
              >
                <img width={22} src={gamingR} alt="" />
                <span
                  className={`${
                    selectBtn === 4 ? 'text-white' : 'text-[#DC0606]'
                  } text-[18px] font-bold`}
                >
                  Game
                </span>
              </button>
              {selectBtn === 4 && (
                <div className="absolute top-[100%] w-full left-0 h-[4px] duration-500 rounded-lg mt-2 bg-[#3a3a3a]"></div>
              )}
            </div>
          </div>

          <div
            className={`bg-[#3A3A3A] rounded-lg ${classes.scrollbarContainer} space-x-3 flex overflow-x-scroll whitespace-nowrap mt-8 p-4`}
          >
            <VideoListCard />
            <VideoListCard />
            <VideoListCard />
            <VideoListCard />
            <VideoListCard />
            <VideoListCard />
            <VideoListCard />
            <VideoListCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeContainer;
