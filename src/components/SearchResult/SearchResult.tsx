import React from 'react';
import { Menu, Icon, Label, Button, DropdownProps } from 'semantic-ui-react';
import { decodeEntities, formatSize } from '../../utils';
import { MetadataContext } from '../../MetadataContext';

export const YouTubeSearchResult = (
  props: SearchResult & {
    setMedia: (_e: any, data: DropdownProps) => void;
    playlistAdd: (_e: any, data: DropdownProps) => void;
  },
) => {
  const result = props;
  const setMedia = props.setMedia;
  return (
    <Menu.Item
      onClick={(e) => {
        setMedia(e, { value: result.url });
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img style={{ height: '50px' }} src={result.img} alt={result.name} />
        <Icon color="red" size="large" name="youtube" />
        <div>{decodeEntities(result.name)}</div>
        <div style={{ marginLeft: 'auto' }}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              props.playlistAdd(e, { value: result.url });
            }}
          >
            Add To Playlist
          </Button>
        </div>
      </div>
    </Menu.Item>
  );
};

export const MediaPathSearchResult = (
  props: SearchResult & { setMedia: (_e: any, data: DropdownProps) => void },
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
    setMedia: (_e: any, data: DropdownProps) => void;
    launchMultiSelect?: (multi?: []) => void;
  }
> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  render() {
    const result = this.props;
    const setMedia = this.props.setMedia;
    return (
      <React.Fragment>
        <Menu.Item
          onClick={async (e) => {
            if (this.props.launchMultiSelect) {
              this.props.launchMultiSelect([]);
            }
            let response = await window.fetch(
              this.context.streamPath +
                '/data?torrent=' +
                encodeURIComponent(result.magnet!),
            );
            let metadata = await response.json();
            // console.log(metadata);
            if (
              metadata.files.filter(
                (file: any) => file.length > 10 * 1024 * 1024,
              ).length > 1
            ) {
              // Multiple large files, present user selection
              const multiStreamSelection = metadata.files.map(
                (file: any, i: number) => ({
                  ...file,
                  url:
                    this.context.streamPath +
                    '/stream?torrent=' +
                    encodeURIComponent(result.magnet!) +
                    '&fileIndex=' +
                    i,
                }),
              );
              // multiStreamSelection.sort((a: any, b: any) =>
              //   a.name.localeCompare(b.name)
              // );
              if (this.props.launchMultiSelect) {
                this.props.launchMultiSelect(multiStreamSelection);
              }
            } else {
              if (this.props.launchMultiSelect) {
                this.props.launchMultiSelect(undefined);
              }
              setMedia(e, {
                value:
                  this.context.streamPath +
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
            (typeof result.size === 'number'
              ? formatSize(result.size)
              : result.size) +
            ' - ' +
            result.seeders +
            ' peers'}
        </Menu.Item>
      </React.Fragment>
    );
  }
}
