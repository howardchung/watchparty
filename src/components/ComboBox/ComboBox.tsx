import React from 'react';
import {
  DropdownProps,
  Menu,
  Input,
  Icon,
  Dropdown,
  Form,
} from 'semantic-ui-react';
import {
  debounce,
  getMediaPathResults,
  getYouTubeResults,
  isHttp,
  isMagnet,
  isYouTube,
} from '../../utils';
import { examples } from '../../utils/examples';
import ChatVideoCard from '../Playlist/ChatVideoCard';

interface ComboBoxProps {
  roomSetMedia: (e: any, data: DropdownProps) => void;
  playlistAdd: (e: any, data: DropdownProps) => void;
  playlistMove: (index: number, toIndex: number) => void;
  playlistDelete: (index: number) => void;
  roomMedia: string;
  getMediaDisplayName: (input: string) => string;
  launchMultiSelect: (multi: []) => void;
  mediaPath: string | undefined;
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
      200,
    );
    this.props.roomSetMedia(e, data);
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
          if (
            query === '' ||
            // Anything that doesn't pass this check we pass to YouTube as a search query
            (query && (isHttp(query) || isMagnet(query)))
          ) {
            let items = examples;
            if (!this.state.inputMedia && this.props.mediaPath) {
              items = await getMediaPathResults(this.props.mediaPath, '');
            }
            if (query) {
              let type: SearchResult['type'] = 'file';
              if (isYouTube(query)) {
                type = 'youtube';
              }
              if (isMagnet(query)) {
                type = 'magnet';
              }
              items = [
                {
                  name: query,
                  type,
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
            results = data.map((result, index) => {
              return (
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
                  />
                </Menu.Item>
              );
            });
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
    const { roomMedia: currentMedia, getMediaDisplayName } = this.props;
    const { results } = this.state;
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Form style={{ flexGrow: 1 }} autoComplete="off">
            <Input
              inverted
              fluid
              focus
              disabled={this.props.disabled}
              onChange={this.doSearch}
              onFocus={(e: any) => {
                e.persist();
                this.setState(
                  {
                    inputMedia:
                      isHttp(currentMedia) || isMagnet(currentMedia)
                        ? currentMedia
                        : getMediaDisplayName(currentMedia),
                  },
                  () => {
                    if (
                      !this.state.inputMedia ||
                      (this.state.inputMedia &&
                        (isHttp(this.state.inputMedia) ||
                          isMagnet(this.state.inputMedia)))
                    ) {
                      this.doSearch(e);
                    }
                  },
                );
                setTimeout(() => e.target.select(), 100);
              }}
              onBlur={() => {
                setTimeout(
                  () =>
                    this.setState({
                      inputMedia: undefined,
                      results: undefined,
                    }),
                  200,
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
              placeholder="Enter video file URL, magnet link, YouTube link, or YouTube search term"
              value={
                this.state.inputMedia !== undefined
                  ? this.state.inputMedia
                  : getMediaDisplayName(currentMedia)
              }
            />
          </Form>
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
                if (Boolean(item.img)) {
                  item.type = 'youtube';
                }
                return (
                  <Dropdown.Item>
                    <div style={{ maxWidth: '500px' }}>
                      <ChatVideoCard
                        video={item}
                        index={index}
                        controls
                        onPlay={(index) => {
                          this.props.roomSetMedia(null, {
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
