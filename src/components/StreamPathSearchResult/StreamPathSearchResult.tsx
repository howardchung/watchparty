import React from 'react';
import { Icon, Label, Menu } from 'semantic-ui-react';

class StreamPathSearchResult extends React.Component<
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

export default StreamPathSearchResult;
