import React from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';

import {
  debounce,
  getMediaPathResults,
  getStreamPathResults,
  getYouTubeResults,
} from '../../utils';
import MediaPathSearchResult from '../MediaPathSearchResult';
import StreamPathSearchResult from '../StreamPathSearchResult';
import YouTubeSearchResult from '../YouTubeSearchResult';

interface SearchComponentProps {
  setMedia: Function;
  type?: 'youtube' | 'media' | 'stream';
  launchMultiSelect?: Function;
  mediaPath: string | undefined;
  streamPath: string | undefined;
}

class YouTubeSearchBar extends React.Component<SearchComponentProps> {
  state = {
    results: [] as SearchResult[],
    resetDropdown: Number(new Date()),
    loading: false,
    lastResultTimestamp: Number(new Date()),
    inputMedia: undefined,
  };
  debounced: any = null;

  doSearch = async (e: any) => {
    e.persist();
    this.setState({ inputMedia: e.target.value }, () => {
      if (!this.debounced) {
        this.debounced = debounce(async () => {
          this.setState({ loading: true });
          let query = this.state.inputMedia || '';
          let results: SearchResult[] = [];
          let timestamp = Number(new Date());
          if (this.props.type === 'youtube') {
            results = await getYouTubeResults(query);
          } else if (this.props.type === 'media' && this.props.mediaPath) {
            results = await getMediaPathResults(this.props.mediaPath, query);
          } else if (this.props.type === 'stream' && this.props.streamPath) {
            results = await getStreamPathResults(this.props.streamPath, query);
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

  setMedia = (e: any, data: DropdownProps) => {
    window.setTimeout(
      () => this.setState({ resetDropdown: Number(new Date()) }),
      300
    );
    this.props.setMedia(e, data);
  };

  render() {
    const setMedia = this.setMedia;
    let placeholder = 'Search streams';
    let icon = 'film';
    if (this.props.type === 'youtube') {
      placeholder = 'Search YouTube';
      icon = 'youtube';
    } else if (this.props.type === 'media') {
      placeholder = this.props.mediaPath || '';
      icon = 'file';
    }
    if (this.state.loading) {
      icon = 'loading circle notch';
    }
    return (
      <React.Fragment>
        <Dropdown
          key={this.state.resetDropdown}
          fluid
          button
          icon={icon}
          className="icon"
          labeled
          search={(() => {}) as any}
          text={placeholder}
          onSearchChange={this.doSearch}
          onFocus={async (e) => {
            if (this.props.type === 'media' && this.props.mediaPath) {
              this.doSearch(e);
            }
          }}
          // onBlur={() => this.setState({ results: this.state.watchOptions })}
          //searchQuery={this.state.query}
          //loading={this.state.loading}
        >
          {Boolean(this.state.results.length) ? (
            <Dropdown.Menu>
              {this.state.results.map((result: SearchResult) => {
                if (this.props.type === 'youtube') {
                  return (
                    <YouTubeSearchResult {...result} setMedia={setMedia} />
                  );
                } else if (this.props.type === 'media') {
                  return (
                    <MediaPathSearchResult {...result} setMedia={setMedia} />
                  );
                }
                return (
                  <StreamPathSearchResult
                    {...result}
                    setMedia={setMedia}
                    launchMultiSelect={this.props.launchMultiSelect as Function}
                    streamPath={this.props.streamPath || ''}
                  />
                );
              })}
            </Dropdown.Menu>
          ) : null}
        </Dropdown>
      </React.Fragment>
    );
  }
}

export default YouTubeSearchBar;
