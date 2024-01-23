import React from 'react';
import { debounce, getYouTubeResults, getStreamPathResults } from '../../utils';
import { DropdownProps, Dropdown } from 'semantic-ui-react';
import {
  YouTubeSearchResult,
  StreamPathSearchResult,
} from '../SearchResult/SearchResult';
import { MetadataContext } from '../../MetadataContext';

interface SearchComponentProps {
  setMedia: (_e: any, data: DropdownProps) => void;
  playlistAdd: (_e: any, data: DropdownProps) => void;
  type?: 'youtube' | 'media' | 'stream';
  launchMultiSelect?: (multi?: []) => void;
  disabled?: boolean;
}

export class SearchComponent extends React.Component<SearchComponentProps> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
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
    this.setState({ inputMedia: e?.target?.value ?? '' }, () => {
      if (!this.debounced) {
        this.debounced = debounce(async () => {
          this.setState({ loading: true });
          let query = this.state.inputMedia || '';
          let results: SearchResult[] = [];
          let timestamp = Number(new Date());
          if (this.props.type === 'youtube') {
            results = await getYouTubeResults(query);
          } else if (this.props.type === 'stream' && this.context.streamPath) {
            results = await getStreamPathResults(
              this.context.streamPath,
              query,
            );
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
      300,
    );
    this.props.setMedia(e, data);
  };

  render() {
    const setMedia = this.setMedia;
    let placeholder = '[BETA] Search streams';
    let icon = 'film';
    if (this.props.type === 'youtube') {
      placeholder = 'Search YouTube';
      icon = 'youtube';
    }
    if (this.state.loading) {
      icon = 'loading circle notch';
    }
    return (
      <React.Fragment>
        <Dropdown
          key={this.state.resetDropdown}
          fluid
          style={{ height: '36px' }}
          button
          icon={icon}
          className="icon"
          labeled
          disabled={this.props.disabled}
          search={true}
          text={placeholder}
          onSearchChange={this.doSearch}
          onFocus={this.doSearch}
          scrolling
          // onBlur={() => this.setState({ results: this.state.watchOptions })}
          //searchQuery={this.state.query}
          //loading={this.state.loading}
        >
          {Boolean(this.state.results.length) ? (
            <Dropdown.Menu>
              {this.state.results.map((result: SearchResult) => {
                if (this.props.type === 'youtube') {
                  return (
                    <YouTubeSearchResult
                      key={result.url}
                      {...result}
                      setMedia={setMedia}
                      playlistAdd={this.props.playlistAdd}
                    />
                  );
                }
                return (
                  <StreamPathSearchResult
                    key={result.url}
                    {...result}
                    setMedia={setMedia}
                    launchMultiSelect={this.props.launchMultiSelect}
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
