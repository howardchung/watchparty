import React from 'react';
import {
  DropdownProps,
  Menu,
  Input,
  Icon,
  Dropdown,
  Grid,
  Button,
} from 'semantic-ui-react';
import {
  debounce,
  getMediaPathResults,
  getYouTubeResults,
  getYouTubeTrendings,
} from '../../utils';

import playIcon from '../../assets/icons/play.svg';
import playlistIcon from '../../assets/icons/playlist.svg';
// import { examples } from '../../utils/examples';
import ChatVideoCard from '../Playlist/ChatVideoCard';
import styles from './SearchBox.module.css';
import MetaButton from '../../atoms/MetaButton';
import clipboardIcon from '../../assets/icons/clipboard-paste.svg';
import searchIcon from '../../assets/icons/search.svg';
import BackIcon from '../../assets/icons/back.svg';
// import { log, timeLog } from 'console';
interface SearchBoxProps {
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
  toggleIsUploadPress: Function;
  isHome: boolean;
  toggleHome: Function;
  clipboard: string | undefined;
  loadYouTube: Function;
  isCollapsed: boolean;
  toggleCollapse: Function;
  isShowTheatreTopbar: boolean;
  toggleShowTopbar: Function;
  gotoHomeScreen: Function;
  setVideoItems: Function;
}
interface ComboState {
  inputMedia: string | undefined;
  results: JSX.Element[] | undefined;
  loading: boolean;
  lastResultTimestamp: number;
  currentClipboard: string;
}

export class SearchBox extends React.Component<SearchBoxProps> {
  private inputRef = React.createRef<HTMLInputElement>();

  state: ComboState = {
    inputMedia: undefined,
    results: undefined,
    loading: false,
    lastResultTimestamp: Number(new Date()),
    currentClipboard: '',
  };
  debounced: any = null;

  // componentDidMount() {
  //     // if (this.inputRef.current) {
  //     //     if (this.props.clipboard || !this.props.currentMedia) {
  //     //         this.inputRef?.current.focus();
  //     //         // this.setState({ currentClipboard: this.props.clipboard })
  //     //     }
  //     //     // if (this.props.clipboard || this.props.currentMedia)
  //     //     //     this.props.loadYouTube();
  //     // }
  // }
  doSearch = async (e: any) => {
    e.persist();
    this.setState({ inputMedia: e.target.value }, () => {
      if (!this.debounced) {
        this.debounced = debounce(async () => {
          this.setState({ loading: true });
          const query: string = this.state.inputMedia || '';
          let timestamp = Number(new Date());
          let results: JSX.Element[] | undefined = undefined;
          if (query === '' || (query && query.startsWith('http'))) {
            // let items = examples;
            let items = await getYouTubeTrendings();
            if (!this.state.inputMedia && this.props.mediaPath) {
              items = await getMediaPathResults(this.props.mediaPath, '');
              // this.props.toggleHome();
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
                        this.setMediaAndClose(e, { value: result.url })
                      }
                    >
                      <ChatVideoCard
                        video={result}
                        index={index}
                        onPlaylistAdd={this.props.playlistAdd}
                        isYoutube={!!result?.img}
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

            // this.props.setVideoItems(items);
          } else {
            const data = await getYouTubeResults(query);

            // this.props.setVideoItems(data);
            results =
              data?.length > 0
                ? data?.map((result: SearchResult, index: number) => (
                    <Grid.Column
                      key={result.url}
                      onClick={(e: any) => {
                        this.setMediaAndClose(e, { value: result.url });
                      }}
                      stretched
                    >
                      <ChatVideoCard
                        video={result}
                        index={index}
                        onPlaylistAdd={this.props.playlistAdd}
                        isYoutube
                      />
                    </Grid.Column>
                  ))
                : undefined;
          }
          console.log({ results });
          if (timestamp > this.state.lastResultTimestamp) {
            this.setState({
              loading: false,
              results,
              lastResultTimestamp: timestamp,
            });
          }
        }, 500);
      }

      this.debounced();
    });
  };
  // componentDidUpdate(prevProps: ComboBoxProps, prevState: ComboState) {
  //   console.log({ prevCLip: prevProps.clipboard, currentCLip: this.props.clipboard, boxClip: this.state.currentClipboard, boxPrevCLip: prevState.currentClipboard });
  //   if (this.props.clipboard !== prevProps.clipboard) {
  //     this.setState({ currentClipboard: this.props.clipboard })
  //   }
  // }
  copyFromClipboard = () => {
    navigator.clipboard
      .readText()
      .then((text) => {
        console.log('Clipboard text: ', { text });
        if (this.inputRef.current) {
          this.inputRef?.current.focus();
          this.inputRef.current.value = text;
          // this.setState({ currentClipboard: text })
        }
      })
      .catch((err) => {
        if (this.inputRef.current) {
          this.inputRef?.current.focus();
          // this.setState({ currentClipboard: this.props.clipboard })
        }
      });
  };
  setMediaAndClose = (e: any, data: DropdownProps) => {
    window.setTimeout(
      () => this.setState({ inputMedia: undefined, results: undefined }),
      200
    );
    this.props.setMedia(e, data);
    // this.props.toggleHome();
    // this.setState({ isHome: false });
  };
  // backToHome = () => {
  //   this.setState({ isHome: true });
  // }

  render() {
    const {
      currentMedia,
      getMediaDisplayName,
      toggleIsUploadPress,
      isShowTheatreTopbar,
      clipboard,
      toggleHome,
      toggleShowTopbar,
    } = this.props;
    const { results } = this.state;
    return (
      <div style={{ position: 'relative' }} className="bg-[#1E1E1E]">
        {/* ====================== SEARCH CONTAINER ====================== */}

        <div
          style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
            margin: '0 10px',
          }}
        >
          <MetaButton
            backShadow
            onClick={() => this.props.gotoHomeScreen()}
            className="p-0 border-none"
            img={BackIcon}
            imgClass="rounded-full h-16"
          ></MetaButton>

          <div className={styles.inputContainer}>
            <span className="absolute left-3 top-3">
              <img src={searchIcon} alt="s" className="h-6" />
            </span>
            <div>
              <input
                ref={this.inputRef}
                // disabled={this.props.disabled}
                onChange={this.doSearch}
                onFocus={(e: any) => {
                  e.persist();
                  this.setState(
                    {
                      inputMedia:
                        clipboard ?? getMediaDisplayName(currentMedia),
                      isHome: false,
                    },
                    () => {
                      if (
                        !this.state.inputMedia ||
                        this.state.inputMedia ||
                        this.state.inputMedia.startsWith('http')
                      ) {
                        console.log('Searching for', this.state.inputMedia);
                        this.doSearch(e);
                      }
                    }
                  );
                  setTimeout(() => e.target.select(), 100);
                }}
                type="search"
                onBlur={() => {
                  setTimeout(
                    () =>
                      this.setState({
                        inputMedia: undefined,
                        results: undefined,
                      }),
                    200
                  );
                }}
                // onKeyPress={(e: any) => {
                //     if (e.key === 'Enter') {
                //         this.setMediaAndClose(e, {
                //             value: this.state.inputMedia,
                //         });
                //         toggleHome(null, false);
                //     }
                // }}
                defaultValue={
                  this.state.inputMedia !== undefined
                    ? this.state.inputMedia
                    : clipboard
                    ? clipboard
                    : getMediaDisplayName(currentMedia)
                }
                placeholder="Enter or paste your video URL"
                className="input w-full px-14 py-6 text-lg rounded-xl text-gray bg-white/90 border-none focus:outline-0 focus:border-none focus:ring-0"
              />
            </div>
            <span className="absolute right-0 top-0 cursor-pointer ">
              <button
                className=" bg-white/80  m-1 p-2  active:bg-white/50 border-none rounded-xl"
                onClick={() => this.copyFromClipboard()}
              >
                <img src={clipboardIcon} alt="s" className="h-6" />
              </button>
            </span>
          </div>

          {currentMedia && (
            <div className="relative">
              <button
                onClick={() => toggleHome()}
                className="btn btn-md font-bold flex whitespace-nowrap text-[14px]  w-[180px] bg-white hover:bg-white text-gray-dark rounded-xl border-none capitalize"
              >
                <span>
                  <img src={playIcon} alt="" className="h-6 mr-1 opacity-70" />
                </span>{' '}
                <span>Now Playing</span>
              </button>
            </div>
          )}
          {/* ====================== PLAYLIST content ====================== */}
          <div className="dropdown dropdown-end w-[220px]">
            <label
              tabIndex={1}
              className="btn btn-md font-semibold text-xl mx-1 hover:bg-white bg-white text-gray-dark rounded-xl outline-0 border-0 active:outline-0 focus:outline-0 capitalize w-full"
            >
              <span>
                <img src={playlistIcon} alt="" className="h-8 mr-2" />
              </span>
              Playlist ({this.props.playlist.length})
            </label>

            <div
              tabIndex={1}
              className={`dropdown-content w-[50vw] bg-[#3A3A3A] p-2 rounded-md max-h-[98vh]  min-h-[10vh] overflow-y-auto ${
                this.props.playlist.length > 0 && styles.playlist_content
              }`}
            >
              <section className=" w-full ">
                {this.props.playlist.map(
                  (item: PlaylistVideo, index: number) => {
                    return (
                      <div
                        key={index}
                        // tabIndex={index}
                        className={` card-compact w-full p-2 shadow bg-primary text-primary-content  ${styles.PlaylistItem}`}
                      >
                        <div style={{ width: '100%', position: 'relative' }}>
                          <ChatVideoCard
                            video={item}
                            index={index}
                            controls
                            onPlay={(index) => {
                              this.props.setMedia(null, {
                                value: this.props.playlist[index]?.url,
                              });
                              this.props.playlistDelete(index);
                            }}
                            onPlayNext={(index) => {
                              this.props.playlistMove(index, 0);
                            }}
                            onRemove={(index) => {
                              this.props.playlistDelete(index);
                            }}
                            isYoutube={Boolean(item.img)}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </section>

              {this.props.playlist.length === 0 && (
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
        </div>

        {/* ====================== SEARCH CONTAINER END====================== */}

        {/* ====================== Search list result ====================== */}
        {Boolean(results) && this.state.inputMedia !== undefined && (
          <div className={styles.wrapper}>
            <Grid className={styles['list-container']}>
              <Grid.Row columns={2} padded>
                {results}
              </Grid.Row>
            </Grid>
          </div>
        )}
        {/* ====================== Search list end ====================== */}
      </div>
    );
  }
}
