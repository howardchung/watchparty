import React from 'react';
import {
  Modal,
  Button,
  Icon,
  Radio,
  Checkbox,
  Header,
  Input,
  Label,
} from 'semantic-ui-react';
import { Socket } from 'socket.io-client';
import { openFileSelector, serverPath } from '../../utils';
import config from '../../config';
import { MetadataContext } from '../../MetadataContext';

export class SubtitleModal extends React.Component<{
  closeModal: () => void;
  roomSubtitle: string | undefined;
  haveLock: () => boolean;
  roomMedia: string;
  socket: Socket;
  getMediaDisplayName: (input: string) => string;
  setSubtitleMode: (mode?: TextTrackMode) => void;
  getSubtitleMode: () => TextTrackMode;
}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  state = {
    loading: false,
    searchResults: [],
    titleQuery: this.props
      .getMediaDisplayName(this.props.roomMedia)
      .split('/')
      .slice(-1)[0],
  };

  async componentDidMount() {
    if (this.props.roomMedia.includes('/stream?torrent=magnet')) {
      const re = /&fileIndex=(\d+)$/;
      const match = re.exec(this.props.roomMedia);
      if (match) {
        const fileIndex = match[1];
        if (fileIndex) {
          // Fetch title from the data endpoint
          const response = await fetch(
            this.props.roomMedia.replace('/stream', '/data'),
          );
          const data = await response.json();
          this.setState({ titleQuery: data?.files[fileIndex]?.name });
        }
      }
    }
  }

  uploadSubtitle = async () => {
    const files = await openFileSelector('.srt');
    if (!files) {
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.addEventListener('load', async (event) => {
      const subData = event.target?.result;
      // Upload to server
      const resp = await window.fetch(serverPath + '/subtitle', {
        method: 'POST',
        body: subData,
        headers: { 'Content-Type': 'text/plain' },
      });
      // Once URL obtained, make those the room subtitles
      const json = await resp.json();
      this.props.socket.emit(
        'CMD:subtitle',
        serverPath + '/subtitle/' + json.hash,
      );
    });
    reader.readAsText(file);
  };
  render() {
    const { closeModal } = this.props;
    return (
      <Modal open={true} onClose={closeModal}>
        <Modal.Header>Subtitles</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Header>Local subtitle settings</Header>
            <Checkbox
              toggle
              checked={this.props.getSubtitleMode() === 'showing'}
              label="Toggle subtitles for myself"
              onClick={(e, data) => {
                this.props.setSubtitleMode();
              }}
            />
            <Header>Room subtitle settings</Header>
            <div
              style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}
            >
              <Input
                value={this.props.roomSubtitle}
                labelPosition="left"
                action
                disabled={!this.props.haveLock()}
                onChange={(e, data) =>
                  this.props.socket.emit('CMD:subtitle', data.value)
                }
              >
                <Label>Current</Label>
                <input />
                <Button
                  color="red"
                  icon
                  labelPosition="left"
                  disabled={!this.props.haveLock()}
                  onClick={() => {
                    this.props.socket.emit('CMD:subtitle', '');
                  }}
                >
                  <Icon name="trash" />
                  Clear
                </Button>
                <Button
                  color="violet"
                  icon
                  labelPosition="left"
                  onClick={() => this.uploadSubtitle()}
                  disabled={!this.props.haveLock()}
                >
                  <Icon name="upload" />
                  Upload (.srt)
                </Button>
              </Input>
              <Header>OpenSubtitles</Header>
              <Input
                value={this.state.titleQuery}
                onChange={(e, { value }) =>
                  this.setState({ titleQuery: value })
                }
                action
                labelPosition="left"
                disabled={!this.props.haveLock()}
              >
                <input />
                <Button
                  loading={this.state.loading}
                  color="green"
                  disabled={!this.props.haveLock()}
                  icon
                  labelPosition="left"
                  onClick={async () => {
                    this.setState({ loading: true });
                    const resp = await window.fetch(
                      serverPath +
                        '/searchSubtitles?title=' +
                        this.state.titleQuery,
                    );
                    const json = await resp.json();
                    this.setState({ searchResults: json });
                    this.setState({ loading: false });
                  }}
                >
                  <Icon name="search" />
                  By title
                </Button>
                <Button
                  loading={this.state.loading}
                  color="blue"
                  disabled={!this.props.haveLock()}
                  icon
                  labelPosition="left"
                  onClick={async () => {
                    this.setState({ loading: true });
                    const resp = await window.fetch(
                      serverPath +
                        '/searchSubtitles?url=' +
                        this.props.roomMedia,
                    );
                    const json = await resp.json();
                    this.setState({ searchResults: json });
                    this.setState({ loading: false });
                  }}
                >
                  <Icon name="search" />
                  By hash
                </Button>
              </Input>
              <div>
                {this.state.searchResults.map(
                  (result: {
                    id: string;
                    type: string;
                    attributes: Record<string, any>;
                  }) => (
                    <div key={result.id}>
                      <Radio
                        disabled={!this.props.haveLock()}
                        label={result.attributes.release}
                        name="radioGroup"
                        value={result.attributes.files[0]?.file_id}
                        checked={this.props.roomSubtitle?.includes(
                          encodeURIComponent(
                            result.attributes.files[0]?.file_name,
                          ),
                        )}
                        onChange={async (e, { value }) => {
                          const resp = await fetch(
                            serverPath + '/downloadSubtitles?file_id=' + value,
                          );
                          const data = await resp.json();
                          this.props.socket.emit('CMD:subtitle', data.link);
                        }}
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }
}
