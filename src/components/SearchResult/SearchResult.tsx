import React from "react";
import { Button, Text } from "../UI/UI";
import { decodeEntities, formatSize } from "../../utils/utils";
import { IconBrandYoutubeFilled } from "../Icons/Icons";

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
      onClick={() => {
        setMedia(result.url);
      }}
      style={{ width: "100%" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <img
          style={{ height: "48px", borderRadius: "var(--radius-xs)" }}
          src={result.img}
          alt={result.name}
        />
        <IconBrandYoutubeFilled color="var(--accent-danger)" size={18} />
        <div style={{ flexGrow: 1, fontSize: 13 }}>
          {decodeEntities(result.name)}
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Button
            size="xs"
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
      onClick={() => {
        setMedia(result.url);
      }}
      key={result.url}
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
    <div
      key={result.url}
      onClick={() => props.onSelectItem(result)}
      style={{ width: "100%" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflowWrap: "anywhere",
        }}
      >
        <Text>{result.name}</Text>
        <Text size="xs" c="grey">
          {typeof result.size === "number"
            ? formatSize(result.size)
            : result.size}
          , {result.seeders} seeds
        </Text>
      </div>
    </div>
  );
};
