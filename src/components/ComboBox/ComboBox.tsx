import React from 'react';
import { DropdownProps, Menu, Input, Icon, Dropdown } from 'semantic-ui-react';
import { debounce, getMediaPathResults, getYouTubeResults } from '../../utils';
import { examples } from '../../utils/examples';
import ChatVideoCard from '../Playlist/ChatVideoCard';

interface ComboBoxProps {
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
}

export class ComboBox extends React.Component<ComboBoxProps> {
  state = {
    inputMedia: undefined as string | undefined,
    results: undefined as JSX.Element[] | undefined,
    loading: false,
    lastResultTimestamp: Number(new Date()),
  };
  debounced: any = null;

  setMediaAndClose = (e: any, data: DropdownProps) => {
    window.setTimeout(
      () => this.setState({ inputMedia: undefined, results: undefined }),
      200
    );
    this.props.setMedia(e, data);
  };

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
            let items = examples;
            if (!this.state.inputMedia && this.props.mediaPath) {
              items = await getMediaPathResults(this.props.mediaPath, '');
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
            results = items.map((result: SearchResult, index: number) => (
              <Menu.Item
                style={{ padding: '2px' }}
                key={result.url}
                onClick={(e: any) =>
                  this.setMediaAndClose(e, { value: result.url })
                }
              >
                <ChatVideoCard
                  video={result}
                  index={index}
                  onPlaylistAdd={this.props.playlistAdd}
                />
              </Menu.Item>
            ));
          } else {
            const data = await getYouTubeResults(query);
            results = data.map((result, index) => (
              <Menu.Item
                key={result.url}
                onClick={(e: any) =>
                  this.setMediaAndClose(e, { value: result.url })
                }
              >
                <ChatVideoCard
                  video={result}
                  index={index}
                  onPlaylistAdd={this.props.playlistAdd}
                  isYoutube
                />
              </Menu.Item>
            ));
          }
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

  render() {
    const { currentMedia, getMediaDisplayName } = this.props;
    const { results } = this.state;
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Input
            style={{ flexGrow: 1 }}
            inverted
            fluid
            focus
            disabled={this.props.disabled}
            onChange={this.doSearch}
            onFocus={(e: any) => {
              e.persist();
              this.setState(
                {
                  inputMedia: getMediaDisplayName(currentMedia),
                },
                () => {
                  if (
                    !this.state.inputMedia ||
                    (this.state.inputMedia &&
                      this.state.inputMedia.startsWith('http'))
                  ) {
                    this.doSearch(e);
                  }
                }
              );
              setTimeout(() => e.target.select(), 100);
            }}
            onBlur={() => {
              setTimeout(
                () =>
                  this.setState({ inputMedia: undefined, results: undefined }),
                200
              );
            }}
            onKeyPress={(e: any) => {
              if (e.key === 'Enter') {
                this.setMediaAndClose(e, {
                  value: this.state.inputMedia,
                });
              }
            }}
            icon={
              <Icon
                onClick={(e: any) =>
                  this.setMediaAndClose(e, {
                    value: this.state.inputMedia,
                  })
                }
                name="arrow right"
                link
                circular
                //bordered
              />
            }
            loading={this.state.loading}
            label={'Now Watching:'}
            placeholder="Enter video file URL, YouTube link, or YouTube search term"
            value={
              this.state.inputMedia !== undefined
                ? this.state.inputMedia
                : getMediaDisplayName(currentMedia)
            }
          />
          <Dropdown
            icon="list"
            labeled
            className="icon"
            button
            text={`Playlist (${this.props.playlist.length})`}
            scrolling
          >
            <Dropdown.Menu direction="left">
              {this.props.playlist.length === 0 && (
                <Dropdown.Item disabled>
                  There are no items in the playlist.
                </Dropdown.Item>
              )}
              {this.props.playlist.map((item: PlaylistVideo, index: number) => {
                return (
                  <Dropdown.Item>
                    <div style={{ maxWidth: '500px' }}>
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
                        disabled={this.props.disabled}
                        isYoutube={Boolean(item.img)}
                      />
                    </div>
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        {Boolean(results) && this.state.inputMedia !== undefined && (
          <Menu
            fluid
            vertical
            style={{
              position: 'absolute',
              top: '22px',
              maxHeight: '250px',
              overflow: 'scroll',
              zIndex: 1001,
            }}
          >
            {results}
          </Menu>
        )}
      </div>
    );
  }
}
