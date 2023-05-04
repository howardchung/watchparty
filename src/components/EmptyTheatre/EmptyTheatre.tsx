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
import yt from '../../assets/icons/yt.png';
import telegram from '../../assets/icons/telegram.png';
import upload from '../../assets/icons/upload.png';
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
  } = props;
  React.useEffect(() => {
    // ((state as AppState).clipboard && (state as AppState).currentMedia) && setLoadingFalse();
    setLoadingFalse();
  }, []);

  return (
    <main className={classes.content}>
      <div className={classes.btn_area}>
        {/* ====================== NOW PLAYING ====================== */}
        <div className="relative">
          <button
            onClick={() => toggleHome()}
            className="btn btn-md font-bold text-[14px] bg-white hover:bg-white text-gray-dark rounded-xl border-none capitalize"
          >
            <span>
              <img src={playIcon} alt="" className="h-8 mr-2 opacity-70" />
            </span>{' '}
            Now Playing
          </button>
        </div>

        {/* ====================== PLAYLIST DROPDOWN ====================== */}
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-md font-bold text-[14px] mx-1 hover:bg-white bg-white text-gray-dark rounded-xl outline-0 border-0 active:outline-0 focus:outline-0 capitalize"
          >
            <span>
              <img src={playlistIcon} alt="" className="h-8 mr-2" />
            </span>
            Playlist ({props.playlist.length})
          </label>

          <div
            tabIndex={0}
            className="dropdown-content w-[60vw] bg-gray-dark relative h-[80vh] overflow-y-auto"
          >
            <section className="absolute w-[550px] right-0 top-2">
              {props.playlist.map((item: PlaylistVideo, index: number) => {
                return (
                  <div
                    key={index}
                    tabIndex={index}
                    className={` w-full p-2 shadow bg-primary text-primary-content ${classes.PlaylistItem}`}
                  >
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
                  </div>
                );
              })}
            </section>

            {props.playlist.length === 0 && (
              <div
                // style={{ color: 'white', fontSize: '1.2vw' }}
                className="absolute w-[300px] right-0 top-2 p-2 shadow bg-primary text-primary-content"
              >
                <div className="card-body text-left disabled">
                  <h3 className=" text-center">Playlist Empty!</h3>
                  <p className="">There are no items in the playlist.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* ====================== dropdown content end ====================== */}

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
      <section className="flex flex-col h-full items-center gap-1 justify-start mt-10">
        <div className={classes.header}>
          <Image src="logo192.png" size="tiny" centered />
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
              className="input w-full px-14 py-4 rounded-xl text-gray bg-white/90 border-none focus:outline-0 focus:border-none focus:ring-0"
            />
          </div>
          <span className="absolute right-0 top-0 cursor-pointer ">
            <button
              className=" bg-white/80   m-1 p-2  active:bg-white/50 border-none rounded-xl"
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
        <div className="flex justify-center gap-0">
          <div className="relative">
            <button
              onClick={() => {}}
              className="btn btn-md font-bold text-[14px] bg-transparent hover:bg-transparent rounded-xl border-none "
            >
              <span>
                <img src={yt} alt="" className="h-[65px] " />
              </span>{' '}
            </button>
          </div>
          <div className="relative -mx-6">
            <button
              onClick={() => toggleIsUploadPress()}
              className="btn btn-md font-bold text-[14px] bg-transparent hover:bg-transparent rounded-xl border-none "
            >
              <span>
                <img src={upload} alt="" className="h-[70px]" />
              </span>{' '}
            </button>
          </div>
          <div className="relative -ml-4">
            <button
              onClick={() => {}}
              className="btn btn-lg font-bold text-[14px] bg-transparent hover:bg-transparent rounded-xl border-none "
            >
              <img src={telegram} alt="" className="h-[70px] w-full " />{' '}
            </button>
          </div>
        </div>
      </section>
      <div className="mb-4 absolute bottom-8">
        <p>
          Psst! Did you know you can upload content from your computer and watch
          in metawood? Click on the upload button above.
        </p>
        <p>
          Alternatively, you can use the search link to look for YouTube URLs.
        </p>
      </div>
    </main>
  );
}
