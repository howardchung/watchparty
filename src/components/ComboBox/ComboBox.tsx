import React from 'react';
import {
  debounce,
  getMediaPathResults,
  getYouTubeResults,
  isHttp,
  isMagnet,
  isYouTube,
} from '../../utils/utils';
import { examples } from '../../utils/examples';
import ChatVideoCard from '../ChatVideoCard/ChatVideoCard';
import { IconLink, IconX } from '@tabler/icons-react';
import {
  ActionIcon,
  Autocomplete,
  Loader,
  type AutocompleteProps,
} from '@mantine/core';

type ComboBoxProps = {
  roomSetMedia: (value: string) => void;
  playlistAdd: (value: string) => void;
  roomMedia: string;
  getMediaDisplayName: (input: string) => string;
  launchMultiSelect: (multi: []) => void;
  mediaPath: string | undefined;
  disabled?: boolean;
};

type ComboBoxState = {
  inputMedia?: string;
  items: SearchResult[];
  loading: boolean;
};

export class ComboBox extends React.Component<ComboBoxProps, ComboBoxState> {
  state: ComboBoxState = {
    inputMedia: undefined as string | undefined,
    items: [] as SearchResult[],
    loading: false,
  };

  setMediaAndClose = (value: string) => {
    this.props.roomSetMedia(value);
    this.setState({ inputMedia: undefined, items: [] });
  };

  doSearch = async (value?: string) => {
    this.setState({ loading: true });
    const query: string = value || '';
    let items = examples;
    if (
      query === '' ||
      // Anything that doesn't pass this check we pass to YouTube as a search query
      (query && (isHttp(query) || isMagnet(query)))
    ) {
      if (!value && this.props.mediaPath) {
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
        // Create entry from user input
        items = [
          {
            name: query,
            type,
            url: query,
            duration: 0,
          },
        ];
      }
    } else {
      const data = await getYouTubeResults(query);
      items = data;
    }
    this.setState({
      loading: false,
      items,
    });
  };

  render() {
    const { roomMedia: currentMedia, getMediaDisplayName } = this.props;
    const renderOption: AutocompleteProps['renderOption'] = ({ option }) => {
      const video = this.state.items.find((item) => item.url === option.value);
      return (
        <div
          key={option.value}
          onClick={(e: any) => this.setMediaAndClose(option.value)}
          style={{ width: '100%' }}
        >
          {video && (
            <ChatVideoCard
              video={video}
              index={0}
              onPlaylistAdd={this.props.playlistAdd}
            />
          )}
        </div>
      );
    };
    return (
      <Autocomplete
        maxDropdownHeight={400}
        style={{ width: '100%' }}
        disabled={this.props.disabled}
        onChange={(value) => {
          this.setState({ inputMedia: value });
          debounce(() => this.doSearch(value))();
        }}
        onFocus={(e: any) => {
          this.setState(
            {
              // Display the real string value (currentMedia) when focused
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
                this.doSearch(this.state.inputMedia);
              }
              e.target.select();
            },
          );
        }}
        onBlur={() => {
          this.setState({
            inputMedia: undefined,
            items: [],
          });
        }}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') {
            this.setMediaAndClose(this.state.inputMedia ?? '');
          }
        }}
        rightSection={
          <ActionIcon
            color="red"
            onClick={(e: any) => this.setMediaAndClose('')}
            title="Clear"
          >
            <IconX />
          </ActionIcon>
        }
        leftSection={this.state.loading ? <Loader size="sm" /> : <IconLink />}
        placeholder="Enter video file URL, magnet link, YouTube link, or YouTube search term"
        value={
          this.state.inputMedia !== undefined
            ? this.state.inputMedia
            : getMediaDisplayName(currentMedia)
        }
        renderOption={renderOption}
        data={this.state.items.map((item) => item.url)}
        filter={({ options }) => options}
      />
    );
  }
}
