import React from 'react';
import { DropdownProps, Icon, Input, Label, Menu } from 'semantic-ui-react';

import {
  debounce,
  getMediaPathResults,
  getStreamPathResults,
  getYouTubeResults,
} from '../../utils';
import { examples } from '../../utils/examples';
import YouTubeSearchResult from '../YouTubeSearchResult';

interface ComboBoxProps {
  setMedia: Function;
  currentMedia: string;
  getMediaDisplayName: Function;
  launchMultiSelect: Function;
  mediaPath: string | undefined;
  streamPath: string | undefined;
}

export const MediaPathSearchResult = (
  props: SearchResult & { setMedia: Function }
) => {
  const result = props;
  const setMedia = props.setMedia;
  return (
    <Menu.Item
      onClick={(e) => {
        setMedia(e, { value: result.url });
      }}
    >
      <div style={{ display: 'flex' }}>
        <Icon name="file" />
        {result.name}
      </div>
    </Menu.Item>
  );
};

export class StreamPathSearchResult extends React.Component<
  SearchResult & {
    setMedia: Function;
    launchMultiSelect: Function;
    streamPath: string;
  }
> {
  render() {
    const result = this.props;
    const setMedia = this.props.setMedia;
    return (
      <React.Fragment>
        <Menu.Item
          onClick={async (e) => {
            this.props.launchMultiSelect([]);
            let response = await window.fetch(
              this.props.streamPath +
                '/data?torrent=' +
                encodeURIComponent(result.magnet!)
            );
            let metadata = await response.json();
            // console.log(metadata);
            if (
              metadata.files.filter(
                (file: any) => file.length > 10 * 1024 * 1024
              ).length > 1
            ) {
              // Multiple large files, present user selection
              const multiStreamSelection = metadata.files.map(
                (file: any, i: number) => ({
                  ...file,
                  url:
                    this.props.streamPath +
                    '/stream?torrent=' +
                    encodeURIComponent(result.magnet!) +
                    '&fileIndex=' +
                    i,
                })
              );
              multiStreamSelection.sort((a: any, b: any) =>
                a.name.localeCompare(b.name)
              );
              this.props.launchMultiSelect(multiStreamSelection);
            } else {
              this.props.launchMultiSelect(undefined);
              setMedia(e, {
                value:
                  this.props.streamPath +
                  '/stream?torrent=' +
                  encodeURIComponent(result.magnet!),
              });
            }
          }}
        >
          <Label
            circular
            empty
            color={Number(result.seeders) ? 'green' : 'red'}
          />
          <Icon name="film" />
          {result.name +
            ' - ' +
            result.size +
            ' - ' +
            result.seeders +
            ' peers'}
        </Menu.Item>
      </React.Fragment>
    );
  }
}

class ComboBox extends React.Component<ComboBoxProps> {
  state = {
    inputMedia: undefined as string | undefined,
    results: undefined,
    loading: false,
    lastResultTimestamp: Number(new Date()),
  };
  debounced: any = null;

  setMedia = (e: any, data: DropdownProps) => {
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
          /* 
          If input is empty or starts with http
            If we have a mediaPath use that for results
            Else show the default list of demo videos
          If input is anything else:
            If we have a stream server use that for results
            Else search YouTube
        */
          let results: JSX.Element[] | undefined = undefined;
          if (query === '' || (query && query.startsWith('http'))) {
            if (this.props.mediaPath) {
              const data = await getMediaPathResults(
                this.props.mediaPath,
                query
              );
              results = data.map((result: SearchResult) => (
                <MediaPathSearchResult {...result} setMedia={this.setMedia} />
              ));
            } else {
              results = examples.map((option: any) => (
                <Menu.Item
                  onClick={(e: any) => this.setMedia(e, { value: option.url })}
                >
                  {option.url}
                </Menu.Item>
              ));
            }
          } else {
            if (query && query.length >= 2) {
              if (this.props.streamPath) {
                const data = await getStreamPathResults(
                  this.props.streamPath,
                  query
                );
                results = data.map((result: SearchResult) => (
                  <StreamPathSearchResult
                    {...result}
                    setMedia={this.setMedia}
                    launchMultiSelect={this.props.launchMultiSelect}
                    streamPath={this.props.streamPath || ''}
                  />
                ));
              } else {
                const data = await getYouTubeResults(query);
                results = data.map((result) => (
                  <YouTubeSearchResult {...result} setMedia={this.setMedia} />
                ));
              }
            }
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
        <div style={{ display: 'flex' }}>
          <Input
            style={{ flexGrow: 1 }}
            inverted
            fluid
            focus
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
            onBlur={() =>
              setTimeout(
                () =>
                  this.setState({ inputMedia: undefined, results: undefined }),
                100
              )
            }
            onKeyPress={(e: any) => {
              if (e.key === 'Enter') {
                this.setMedia(e, {
                  value: this.state.inputMedia,
                });
              }
            }}
            icon={
              <Icon
                onClick={(e: any) =>
                  this.setMedia(e, {
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
            placeholder="Enter URL (YouTube, video file, etc.), or enter search term"
            value={
              this.state.inputMedia !== undefined
                ? this.state.inputMedia
                : getMediaDisplayName(currentMedia)
            }
          />
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

export default ComboBox;
