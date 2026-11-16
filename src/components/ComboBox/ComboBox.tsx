import React from "react";
import {
  debounce,
  getMediaPathResults,
  getYouTubeResults,
  isHttp,
  isMagnet,
  isYouTube,
} from "../../utils/utils";
import { examples } from "../../utils/examples";
import ChatVideoCard from "../ChatVideoCard/ChatVideoCard";
import { IconLink, IconX } from "../Icons/Icons";
import {
  ActionIcon,
  Autocomplete,
  Loader,
  type AutocompleteProps,
} from "../UI/UI";

type ComboBoxProps = {
  roomSetMedia: (value: string) => void;
  playlistAdd: (value: string) => void;
  roomMedia: string;
  getMediaDisplayName: (input: string) => string;
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

  doSearch = async () => {
    const value = this.state.inputMedia;
    this.setState({ loading: true });
    const query: string = value || "";
    let items = examples;
    if (
      query === "" ||
      (query && (isHttp(query) || isMagnet(query)))
    ) {
      if (!value && this.props.mediaPath) {
        items = await getMediaPathResults(this.props.mediaPath, "");
      }
      if (query) {
        let type: SearchResult["type"] = "file";
        if (isYouTube(query)) {
          type = "youtube";
        }
        if (isMagnet(query)) {
          type = "magnet";
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
    } else {
      const data = await getYouTubeResults(query);
      items = data;
    }
    this.setState({
      loading: false,
      items,
    });
  };

  debouncedSearch = debounce(this.doSearch);

  onChange = (value: string) => {
    this.setState({ inputMedia: value }, this.debouncedSearch);
  };

  render() {
    const { roomMedia: currentMedia, getMediaDisplayName } = this.props;
    const renderOption: AutocompleteProps["renderOption"] = ({ option }) => {
      const video = this.state.items.find((item) => item.url === option.value);
      return (
        <div
          key={option.value}
          onClick={() => this.setMediaAndClose(option.value)}
          style={{ width: "100%" }}
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
        style={{ width: "100%" }}
        disabled={this.props.disabled}
        onChange={this.onChange}
        onFocus={(e: any) => {
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
                this.doSearch();
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
          if (e.key === "Enter") {
            this.setMediaAndClose(this.state.inputMedia ?? "");
            e.target.blur();
          }
        }}
        rightSection={
          <ActionIcon
            size="sm"
            color="red"
            onClick={() => this.setMediaAndClose("")}
            title="Clear"
          >
            <IconX size={15} />
          </ActionIcon>
        }
        leftSection={
          this.state.loading ? <Loader size="sm" /> : <IconLink size={17} />
        }
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
