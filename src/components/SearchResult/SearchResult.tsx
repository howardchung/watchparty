import React from "react";
import { Button, Text } from "@mantine/core";
import { decodeEntities, formatSize } from "../../utils/utils";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";

export const YouTubeSearchResult = (
  props: SearchResult & {
    setMedia: (value: string) => void;
    playlistAdd: (value: string) => void;
  },
) => {
  const result = props;
  const setMedia = props.setMedia;
  return (
    <div
      onClick={(e) => {
        setMedia(result.url);
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <img style={{ height: "50px" }} src={result.img} alt={result.name} />
        <IconBrandYoutubeFilled color="red" />
        <div>{decodeEntities(result.name)}</div>
        <div style={{ marginLeft: "auto" }}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              props.playlistAdd(result.url);
            }}
          >
            Add To Playlist
          </Button>
        </div>
      </div>
    </div>
  );
};

export const MediaPathSearchResult = (
  props: SearchResult & { setMedia: (value: string) => void },
) => {
  const result = props;
  const setMedia = props.setMedia;
  return (
    <div
      onClick={(e) => {
        setMedia(result.url);
      }}
      key={result.url}
      // leftSection={<IconFile />}
    >
      {result.name}
    </div>
  );
};

export const StreamPathSearchResult = (
  props: SearchResult & {
    onSelectItem: (result: SearchResult) => void;
  },
) => {
  const result = props;
  return (
    <div key={result.url} onClick={() => props.onSelectItem(result)}>
      {/* <Badge
            circle
            size="xs"
            color={Number(result.seeders) ? 'green' : 'red'}
          /> */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflowWrap: "anywhere",
        }}
      >
        <Text>{result.name}</Text>
        <Text size="xs">
          {typeof result.size === "number"
            ? formatSize(result.size)
            : result.size}
          , {result.seeders} seeds
        </Text>
      </div>
    </div>
  );
};
