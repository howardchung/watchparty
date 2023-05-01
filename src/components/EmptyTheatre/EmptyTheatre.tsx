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
  } = props;
  let debounced: any = null;
  const [empData, setEmpData] = React.useState({
    inputMedia: undefined as string | undefined,
    results: undefined as JSX.Element[] | undefined,
    loading: false,
    lastResultTimestamp: Number(new Date()),
  });
  const setMediaAndClose = (e: any, data: DropdownProps) => {
    window.setTimeout(
      () => setState({ inputMedia: undefined, results: undefined }),
      200
    );
    setMedia(e, data);
    toggleHome();
    // this.setState({ isHome: false });
  };
  const doSearch = async (e: any) => {
    e.persist();
    setState({ inputMedia: e.target.value }, () => {
      if (debounced) {
        debounced = debounce(async () => {
          setState({ loading: true });
          const query: string = empData.inputMedia || '';
          let timestamp = Number(new Date());
          let results: JSX.Element[] | undefined = undefined;
          if (query === '' || (query && query.startsWith('http'))) {
            // let items = examples;
            let items = await getYouTubeTrendings();
            if (!empData.inputMedia && state.mediaPath) {
              items = await getMediaPathResults(state.mediaPath, '');
              toggleHome();
              // this.setState({ isHome: true });
            }
            if (query) {
              items = [
                {
                  name: query,
                  type: 'file',
                  url: query,
                  duration: 0,
                },
              ];
            }
            results =
              items?.length > 0
                ? items?.map((result: SearchResult, index: number) => (
                    <Grid.Column
                      key={result.url}
                      onClick={(e: any) =>
                        setMediaAndClose(e, { value: result.url })
                      }
                    >
                      <ChatVideoCard
                        video={result}
                        index={index}
                        onPlaylistAdd={playlistAdd}
                        isYoutube
                      />
                    </Grid.Column>
                  ))
                : undefined;

            // {/* ====================== OLD VIEW ====================== */}
            // results = items.map((result: SearchResult, index: number) => (
            //   <Menu.Item
            //     style={{ padding: '2px' }}
            //     key={result.url}
            //     onClick={(e: any) =>
            //       this.setMediaAndClose(e, { value: result.url })
            //     }
            //   >
            //     <ChatVideoCard
            //       video={result}
            //       index={index}
            //       onPlaylistAdd={this.props.playlistAdd}
            //     />
            //   </Menu.Item>
            // ));
          } else {
            const data = await getYouTubeResults(query);
            results =
              data?.length > 0
                ? data?.map((result: SearchResult, index: number) => (
                    <Grid.Column
                      key={result.url}
                      onClick={(e: any) =>
                        setMediaAndClose(e, { value: result.url })
                      }
                      stretched
                    >
                      <ChatVideoCard
                        video={result}
                        index={index}
                        onPlaylistAdd={playlistAdd}
                        isYoutube
                      />
                    </Grid.Column>
                  ))
                : undefined;

            // {/* ====================== Old View ====================== */ }
            // results = data.map((result, index) => (
            //   <Menu.Item
            //     key={result.url}
            //     onClick={(e: any) =>
            //       this.setMediaAndClose(e, { value: result.url })
            //     }
            //   >
            //     <ChatVideoCard
            //       video={result}
            //       index={index}
            //       onPlaylistAdd={this.props.playlistAdd}
            //       isYoutube
            //     />
            //   </Menu.Item>
            // ));
          }
          if (timestamp > empData.lastResultTimestamp) {
            setState({
              loading: false,
              results,
              lastResultTimestamp: timestamp,
            });
          }
        }, 500);
      }
      debounced();
    });
  };

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
            Playlist (${props.playlist.length})
          </label>

          <div
            tabIndex={0}
            className="dropdown-content w-full bg-gray-dark relative"
          >
            {props.playlist.map((item: PlaylistVideo, index: number) => {
              return (
                <div
                  key={index}
                  tabIndex={index}
                  className={`dropdown-content card card-compact w-full p-2 shadow bg-primary text-primary-content ${classes.PlaylistItem}`}
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

          {/* ====================== dropdown content end ====================== */}
        </div>

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
          <input
            type="search"
            placeholder="Enter or paste your video URL"
            className="input w-full px-14 py-4 rounded-xl text-gray bg-white/90 border-none focus:outline-0 focus:border-none focus:ring-0"
          />
          <span className="absolute right-0 top-0 cursor-pointer">
            <button className="btn bg-white hover:bg-white border-none rounded-xl">
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
                <img src={yt} alt="" className="h-18 " />
              </span>{' '}
            </button>
          </div>
          <div className="relative -mx-6">
            <button
              onClick={() => toggleIsUploadPress()}
              className="btn btn-md font-bold text-[14px] bg-transparent hover:bg-transparent rounded-xl border-none "
            >
              <span>
                <img src={upload} alt="" className="h-18 " />
              </span>{' '}
            </button>
          </div>
          <div className="relative -ml-4">
            <button
              onClick={() => {}}
              className="btn btn-lg font-bold text-[14px] bg-transparent hover:bg-transparent rounded-xl border-none "
            >
              <img src={telegram} alt="" className="h-18 w-full " />{' '}
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
