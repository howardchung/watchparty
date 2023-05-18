import * as React from 'react';
import {
  Button,
  Icon,
  Image,
  Dropdown,
  DropdownProps,
  Input,
  Grid,
} from 'semantic-ui-react';
import classes from './EmptyTheatre.module.css';
import ChatVideoCard from '../Playlist/ChatVideoCard';
import playlistIcon from '../../assets/icons/playlist.svg';
import playIcon from '../../assets/icons/play.svg';
import yt from '../../assets/icons/yt.svg';
import tgIcon from '../../assets/icons/telegram.svg';
import telegram from '../../assets/icons/telegram.png';
import upload from '../../assets/icons/upload.png';
import uploadIcon from '../../assets/upload/upload.svg';
import solarQuit from '../../assets/upload/sorlarQuit.svg';
import clipboardIcon from '../../assets/icons/clipboard-paste.svg';
import searchIcon from '../../assets/icons/search.svg';
import {
  debounce,
  getMediaPathResults,
  getYouTubeResults,
  getYouTubeTrendings,
} from '../../utils';
import { AppState } from '../App/App';
export interface IEmptyTheatreProps {
  toggleIsUploadPress: Function;
  setMedia: (e: any, data: DropdownProps) => void;
  playlistAdd: (e: any, data: DropdownProps) => void;
  playlistMove: (index: number, toIndex: number) => void;
  playlistDelete: (index: number) => void;
  currentMedia: string;
  getMediaDisplayName: Function;
  launchMultiSelect: Function;
  mediaPath: string | undefined;
  streamPath: string | undefined;
  disabled?: boolean;
  playlist: PlaylistVideo[];
  toggleHome: Function;
  setState: Function;
  setLoadingFalse: Function;
  state: AppState;
  gotoYTScreen: Function;
}

export function EmptyTheatre(props: IEmptyTheatreProps) {
  const {
    toggleIsUploadPress,
    toggleHome,
    setState,
    state,
    setMedia,
    playlistAdd,
    getMediaDisplayName,
    currentMedia,
    setLoadingFalse,
    gotoYTScreen,
  } = props;
  React.useEffect(() => {
    // ((state as AppState).clipboard && (state as AppState).currentMedia) && setLoadingFalse();
    setLoadingFalse();
  }, []);

  return (
    <main className={classes.content}>
      <div className={classes.btn_area}>
        {/* ====================== NOW PLAYING ====================== */}
        {currentMedia && (
          <div className="relative">
            <button
              onClick={() => toggleHome()}
              className="btn btn-md font-bold text-[14px] bg-white hover:bg-white text-black/80 rounded-xl border-none capitalize"
            >
              <span>
                <img src={playIcon} alt="" className="h-8 mr-1 opacity-70" />
              </span>{' '}
              Now Playing
            </button>
          </div>
        )}

        {/* ====================== PLAYLIST content ====================== */}
        <div className="dropdown dropdown-end w-[250px]">
          <label
            tabIndex={1}
            className="btn btn-md font-semibold text-xl mx-1 hover:bg-white bg-white text-black/80 rounded-xl outline-0 border-0 active:outline-0 focus:outline-0 capitalize w-full"
          >
            <span>
              <img src={playlistIcon} alt="" className="h-8 mr-2" />
            </span>
            Playlist ({props.playlist.length})
          </label>

          <div
            tabIndex={1}
            className={`dropdown-content w-[50vw] bg-[#3A3A3A] p-2 rounded-md max-h-[98vh] min-h-[10vh] overflow-y-auto ${
              props.playlist.length > 0 && classes.playlist_content
            }`}
          >
            <section className=" w-full ">
              {props.playlist.map((item: PlaylistVideo, index: number) => {
                return (
                  <div
                    key={index}
                    // tabIndex={index}
                    className={` card-compact w-full p-2 shadow bg-primary text-primary-content ${classes.PlaylistItem}`}
                  >
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ChatVideoCard
                        toggleHome={props.toggleHome}
                        video={item}
                        index={index}
                        controls
                        fromHome
                        onPlay={(index) => {
                          props.setMedia(null, {
                            value: props.playlist[index]?.url,
                          });
                          props.playlistDelete(index);
                        }}
                        onPlayNext={(index) => {
                          props.playlistMove(index, 0);
                        }}
                        onRemove={(index) => {
                          props.playlistDelete(index);
                        }}
                        disabled={props.disabled}
                        isYoutube={Boolean(item.img)}
                      />
                    </div>
                  </div>
                );
              })}
            </section>

            {props.playlist.length === 0 && (
              <div
                // style={{ color: 'white', fontSize: '1.2vw' }}
                className="w-full  shadow bg-transparent text-primary-content"
              >
                <div className="">
                  <h3 className=" text-center">Playlist Empty!</h3>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* ====================== END PLAYLIST content ====================== */}

        {/* ======================  OLD VERESION DROPDOWN ====================== */}
        {/* <Dropdown
          labeled
          className={`${classes.PlaylistDropdown} icon`}
          button
          text={`Playlist (${props.playlist.length})`}
          icon={"list layout"}
          scrolling
        >
          <Dropdown.Menu direction="left" className={classes.PlaylistMenu}>
            {props.playlist.length === 0 && (
              <Dropdown.Item
                disabled
                style={{ color: 'white', fontSize: '1.2vw' }}
              >
                There are no items in the playlist.
              </Dropdown.Item>
            )}
            {props.playlist.map((item: PlaylistVideo, index: number) => {
              return (
                <Dropdown.Item className={classes.PlaylistItem}>
                  <div style={{ width: '100%' }}>
                    <ChatVideoCard
                      video={item}
                      index={index}
                      controls
                      onPlay={(index) => {
                        props.setMedia(null, {
                          value: props.playlist[index]?.url,
                        });
                        props.playlistDelete(index);
                      }}
                      onPlayNext={(index) => {
                        props.playlistMove(index, 0);
                      }}
                      onRemove={(index) => {
                        props.playlistDelete(index);
                      }}
                      disabled={props.disabled}
                      isYoutube={Boolean(item.img)}
                    />
                  </div>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown> */}
      </div>
      <section className="flex flex-col w-[75%] h-screen items-center gap-1 justify-start mt-10 lg:mt-0 lg:justify-center">
        <div className={classes.header}>
          <img src="logo192.png" className="relative" width={120} alt="" />
        </div>
        <div className={classes.inputContainer}>
          <span className="absolute left-3 top-3">
            <img src={searchIcon} alt="s" className="h-6" />
            {/* <button className='btn bg-white/70 disabled hover:bg-white/70 border-none rounded-xl '></button> */}
          </span>
          <div>
            <input
              type="search"
              onKeyPress={(e: any) => {
                if (e.key === 'Enter') {
                  toggleHome(e.target.value);
                }
              }}
              placeholder="Enter or paste your video URL"
              className={`${classes.inputStyle} input w-full px-14 py-4 placeholder:text-[#49454F] rounded-xl text-gray border-none focus:outline-0 focus:border-none focus:ring-0`}
            />
          </div>
          <span className="absolute right-0 top-0 cursor-pointer ">
            <button
              className=" bg-white   m-1 p-2  active:bg-white/50 border-none rounded-xl"
              onClick={async () => {
                // const permission = await navigator.permissions.query({ name:  });
                navigator.clipboard
                  .readText()
                  .then((text) => {
                    console.log('Clipboard text: ', { text });
                    toggleHome(text);
                  })
                  .catch((err) => {
                    console.error('Failed to read clipboard text: ', err);
                  });
              }}
            >
              <img src={clipboardIcon} alt="s" className="h-6" />
            </button>
          </span>
        </div>
        {/* <div className="flex justify-center gap-0">
          <div className="relative">
            <button
              onClick={() => {}}
              className="btn btn-md p-0 font-bold text-[14px] bg-transparent hover:bg-transparent rounded-xl border-none "
            >
              <img src={yt} alt="" className="h-[65px] " />
            </button>
          </div>
          <div className="relative ">
            <button
              onClick={() => toggleIsUploadPress()}
              className="btn btn-md p-0 font-bold text-[14px] bg-transparent hover:bg-transparent rounded-xl border-none "
            >
              <img src={upload} alt="" className="h-[70px]" />
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => {}}
              className="btn btn-md p-0 font-bold text-[14px] bg-transparent hover:bg-transparent rounded-xl border-none "
            >
              <img src={telegram} alt="" className="h-[70px] w-full " />{' '}
            </button>
          </div>
        </div> */}
        <div className="grid relative w-full grid-cols-3 gap-3">
          <button
            onClick={() => {
              gotoYTScreen();
            }}
            className={`${classes.btnBoxShadow} bg-[#d20001] rounded-xl`}
          >
            <img className="mx-auto" src={yt} alt="" />
          </button>
          <button
            onClick={() => toggleIsUploadPress()}
            className={`${classes.uploadBtnBg} ${classes.btnBoxShadow} flex justify-center items-center rounded-xl`}
          >
            <span className="text-white font-semibold text-[18px]">Upload</span>
            <img className="pl-3" src={uploadIcon} alt="uploadIcon" />
          </button>
          <button
            onClick={() => {}}
            className={`bg-[#27a2dd] ${classes.btnBoxShadow} flex justify-center items-center rounded-xl`}
          >
            <span className="text-white font-semibold text-[18px]">
              Telegram
            </span>
            <img src={tgIcon} className="ml-1" alt="uploadIcon" />
          </button>
        </div>
      </section>
      <div className="mb-4 absolute bottom-1">
        <p className="font-bold">
          Psst! Did you know you can upload content from your computer and watch
          in metawood? Click on the upload button above.
        </p>
        <p className="font-bold">
          Alternatively, you can use the search link to look for YouTube URLs.
        </p>
      </div>
      {/* <div className="absolute left-3 bottom-3">
        <img className="cursor-pointer" src={solarQuit} alt="solarQuit" />
      </div> */}
    </main>
  );
}
