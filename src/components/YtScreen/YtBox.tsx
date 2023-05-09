import React, { useState } from 'react';
import trendingRed from '../../assets/icons/trending-r.png';
import trendingWhite from '../../assets/icons/trending-w.png';
import liveRed from '../../assets/icons/live-r.svg';
import liveWhite from '../../assets/icons/live-w.svg';
import movieR from '../../assets/icons/movie-r.svg';
import movieW from '../../assets/icons/movie-w.svg';
import gamingR from '../../assets/icons/gaming-r.svg';
import VideoListCard from './VideoListCard';
import classes from './YtBox.module.css';
import { TabsType } from '../Modal/YtScreen';
// import { ComboBox } from '../ComboBox/ComboBox';
interface IYtBoxProps {
  videoItems: [];
  setTab: Function;
  tab: TabsType;
  playlistAdd: Function;
  setMedia: Function;
  toggleHome: Function;
}
const YtBox = (props: IYtBoxProps) => {
  const { tab, setTab, playlistAdd, setMedia, toggleHome } = props;

  return (
    <div className="bg-[#1E1E1E] m-0 p-0 w-full h-screen relative pl-[3%]">
      <main className="mt-0">
        <div className="flex flex-col  justify-end lg:justify-center pb-[1rem]">
          <div className="flex space-x-6">
            <div
              className="relative flex items-end min-h-[15vh]" /* className={`${selectBtn ===1 && "scale-0"}`} */
            >
              <button
                onClick={() => setTab('trending')}
                className={` ${
                  tab === 'trending'
                    ? `bg-[#DC0606] py-5 ${classes.boxShadowCustom}`
                    : `py-3 bg-[#fff]`
                } rounded-lg px-6 flex space-x-2 duration-500 justify-center items-center`}
              >
                <img
                  width={15}
                  src={tab === 'trending' ? trendingWhite : trendingRed}
                  alt=""
                />
                <span
                  className={`${
                    tab === 'trending' ? 'text-white' : 'text-[#DC0606]'
                  } text-[18px] font-bold`}
                >
                  Trending
                </span>
              </button>
              {tab === 'trending' && (
                <div className="absolute top-[100%] w-full left-0 h-[5px] duration-500 rounded-lg mt-3 bg-[#3a3a3a]"></div>
              )}
            </div>
            <div
              className="relative flex items-end " /* className={`${selectBtn ===1 && "scale-0"}`} */
            >
              <button
                onClick={() => setTab('live')}
                className={` ${
                  tab === 'live'
                    ? `bg-[#DC0606] py-5 ${classes.boxShadowCustom}`
                    : `py-3 bg-[#fff]`
                } rounded-lg px-6 flex space-x-2 justify-center duration-500  items-center`}
              >
                <img
                  width={20}
                  src={tab === 'live' ? liveWhite : liveRed}
                  alt=""
                />
                <span
                  className={`${
                    tab === 'live' ? 'text-white' : 'text-[#DC0606]'
                  } text-[18px] font-bold`}
                >
                  Live
                </span>
              </button>
              {tab === 'live' && (
                <div className="absolute top-[100%] w-full left-0 h-[5px] duration-500 rounded-lg mt-3 bg-[#3a3a3a]"></div>
              )}
            </div>
            <div
              className="relative flex items-end " /* className={`${selectBtn ===1 && "scale-0"}`} */
            >
              <button
                onClick={() => setTab('movie')}
                className={` ${
                  tab === 'movie'
                    ? `bg-[#DC0606] py-5 ${classes.boxShadowCustom}`
                    : `py-3 bg-[#fff]`
                } rounded-lg px-6 flex space-x-2 justify-center duration-500  items-center`}
              >
                <img
                  width={18}
                  src={tab === 'movie' ? movieW : movieR}
                  alt=""
                />
                <span
                  className={`${
                    tab === 'movie' ? 'text-white' : 'text-[#DC0606]'
                  } text-[18px] font-bold`}
                >
                  Movie
                </span>
              </button>
              {tab === 'movie' && (
                <div className="absolute top-[100%] w-full left-0 h-[5px] duration-500 rounded-lg mt-3 bg-[#3a3a3a]"></div>
              )}
            </div>
            <div
              className="relative flex items-end " /* className={`${selectBtn ===1 && "scale-0"}`} */
            >
              <button
                onClick={() => setTab('game')}
                className={` ${
                  tab === 'game'
                    ? `bg-[#DC0606] py-5 ${classes.boxShadowCustom}`
                    : `py-3 bg-[#fff]`
                } rounded-lg px-6 flex space-x-2 justify-center duration-500  items-center`}
              >
                <img width={22} src={gamingR} alt="" />
                <span
                  className={`${
                    tab === 'game' ? 'text-white' : 'text-[#DC0606]'
                  } text-[18px] font-bold`}
                >
                  Game
                </span>
              </button>
              {tab === 'game' && (
                <div className="absolute top-[100%] w-full left-0 h-[5px] duration-500 rounded-lg mt-3 bg-[#3a3a3a]"></div>
              )}
            </div>
          </div>

          <div
            className={`bg-[#3A3A3A] rounded-lg ${classes.scrollbarContainer} space-x-3 flex overflow-x-scroll whitespace-nowrap mt-8 p-4`}
          >
            {props.videoItems?.length > 0 ? (
              props.videoItems?.map((item, key) => {
                return (
                  <VideoListCard
                    toggleHome={toggleHome}
                    onSetMedia={setMedia}
                    playlistAdd={playlistAdd}
                    key={key}
                    item={item}
                  />
                );
              })
            ) : (
              <div className="flex h-[20vh] w-full items-center justify-center">
                <p className="text-white/70 text-[20px] text-center font-extrabold ">
                  Can't Get Youtube Videos, Please Try Again
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default YtBox;
