import React, { useContext } from 'react';
import { Button, Text } from '@mantine/core';
import { decodeEntities, formatSize } from '../../utils/utils';
import { MetadataContext } from '../../MetadataContext';
import { IconBrandYoutubeFilled } from '@tabler/icons-react';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img style={{ height: '50px' }} src={result.img} alt={result.name} />
        <IconBrandYoutubeFilled color="red" />
        <div>{decodeEntities(result.name)}</div>
        <div style={{ marginLeft: 'auto' }}>
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
  props: SearchResult & { setMedia: (_e: any, data: any) => void },
) => {
  const result = props;
  const setMedia = props.setMedia;
  return (
    <div
      onClick={(e) => {
        setMedia(e, { value: result.url });
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
    setMedia: (_e: any, data: any) => void;
    launchMultiSelect?: (multi?: []) => void;
  },
) => {
  const context = useContext(MetadataContext);
  const result = props;
  const setMedia = props.setMedia;
  return (
    <div
      key={result.url}
      onClick={async (e) => {
        if (props.launchMultiSelect) {
          props.launchMultiSelect([]);
        }
        let response = await window.fetch(
          context.streamPath +
            '/data?torrent=' +
            encodeURIComponent(result.magnet!),
        );
        let metadata = await response.json();
        // console.log(metadata);
        if (
          metadata.files.filter((file: any) => file.length > 10 * 1024 * 1024)
            .length > 1
        ) {
          // Multiple large files, present user selection
          const multiStreamSelection = metadata.files.map(
            (file: any, i: number) => ({
              ...file,
              url:
                context.streamPath +
                '/stream?torrent=' +
                encodeURIComponent(result.magnet!) +
                '&fileIndex=' +
                i,
            }),
          );
          // multiStreamSelection.sort((a: any, b: any) =>
          //   a.name.localeCompare(b.name)
          // );
          if (props.launchMultiSelect) {
            props.launchMultiSelect(multiStreamSelection);
          }
        } else {
          if (props.launchMultiSelect) {
            props.launchMultiSelect(undefined);
          }
          setMedia(e, {
            value:
              context.streamPath +
              '/stream?torrent=' +
              encodeURIComponent(result.magnet!),
          });
        }
      }}
    >
      {/* <Badge
            circle
            size="xs"
            color={Number(result.seeders) ? 'green' : 'red'}
          /> */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflowWrap: 'anywhere',
        }}
      >
        <Text>{result.name}</Text>
        <Text size="xs">
          {typeof result.size === 'number'
            ? formatSize(result.size)
            : result.size}
          , {result.seeders} seeds
        </Text>
      </div>
    </div>
  );
};
