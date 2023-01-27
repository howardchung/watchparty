import React from 'react';
import {
  Modal,
  Button,
  Icon,
  Radio,
  Checkbox,
  Header,
  Input,
} from 'semantic-ui-react';
import { Socket } from 'socket.io-client';
import { openFileSelector, serverPath } from '../../utils';

export class SubtitleModal extends React.Component<{
  closeModal: Function;
  currentSubtitle: string | undefined;
  haveLock: Function;
  src: string;
  socket: Socket;
  getMediaDisplayName: Function;
  beta: boolean;
  setSubtitleMode: Function;
  getSubtitleMode: Function;
}> {
  state = {
    loading: false,
    searchResults: [],
  };
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
        serverPath + '/subtitle/' + json.hash
      );
    });
    reader.readAsText(file);
  };
  render() {
    const { closeModal } = this.props;
    return (
      <Modal open={true} onClose={closeModal as any}>
        <Modal.Header>Subtitles</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <Checkbox
              toggle
              checked={this.props.getSubtitleMode() === 'hidden'}
              label="Hide subtitles for myself"
              onClick={(e, data) => {
                this.props.setSubtitleMode();
              }}
            />
            <hr />
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
            >
              <Header>Room subtitle settings</Header>
              {process.env.NODE_ENV === 'development' && (
                <Input value={this.props.currentSubtitle} />
              )}
              <div>
                <Radio
                  disabled={!this.props.haveLock()}
                  name="radioGroup"
                  label="No subtitles"
                  value=""
                  checked={!this.props.currentSubtitle}
                  onChange={(e, { value }) => {
                    this.props.socket.emit('CMD:subtitle', null);
                  }}
                />
              </div>
              {this.props.beta && (
                <div>
                  <Radio
                    disabled={!this.props.haveLock()}
                    name="radioGroup"
                    label=".srt extension appended to current video URL"
                    value=""
                    checked={Boolean(
                      this.props.currentSubtitle &&
                        this.props.currentSubtitle?.startsWith(this.props.src)
                    )}
                    onChange={(e, data) => {
                      const subValue = this.props.src + '.srt';
                      this.props.socket.emit('CMD:subtitle', subValue);
                    }}
                  />
                </div>
              )}
              <div>
                <Radio
                  disabled={!this.props.haveLock()}
                  name="radioGroup"
                  label=""
                  value=""
                  checked={
                    Boolean(this.props.currentSubtitle) &&
                    this.props.currentSubtitle?.startsWith(
                      serverPath + '/subtitle'
                    )
                  }
                />
                <Button
                  color="violet"
                  icon
                  labelPosition="left"
                  onClick={() => this.uploadSubtitle()}
                  disabled={!this.props.haveLock()}
                  size="mini"
                >
                  <Icon name="upload" />
                  Upload (.srt)
                </Button>
              </div>
              {!this.state.searchResults.length && (
                <div>
                  <Radio
                    disabled={!this.props.haveLock()}
                    name="radioGroup"
                    value=""
                    checked={
                      Boolean(this.props.currentSubtitle) &&
                      this.props.currentSubtitle?.startsWith(
                        serverPath + '/downloadSubtitle'
                      )
                    }
                  />
                  <Button
                    style={{ marginLeft: '8px' }}
                    loading={this.state.loading}
                    color="green"
                    disabled={!this.props.haveLock()}
                    icon
                    labelPosition="left"
                    size="mini"
                    onClick={async () => {
                      this.setState({ loading: true });
                      const resp = await window.fetch(
                        serverPath +
                          '/searchSubtitles?title=' +
                          this.props
                            .getMediaDisplayName(this.props.src)
                            .split('/')
                            .slice(-1)[0]
                      );
                      const json = await resp.json();
                      this.setState({ searchResults: json });
                      this.setState({ loading: false });
                    }}
                  >
                    <Icon name="search" />
                    Search by Title
                  </Button>
                  {this.props.beta && (
                    <Button
                      style={{ marginLeft: '8px' }}
                      loading={this.state.loading}
                      color="green"
                      disabled={!this.props.haveLock()}
                      icon
                      labelPosition="left"
                      size="mini"
                      onClick={async () => {
                        this.setState({ loading: true });
                        const resp = await window.fetch(
                          serverPath + '/searchSubtitles?url=' + this.props.src
                        );
                        const json = await resp.json();
                        this.setState({ searchResults: json });
                        this.setState({ loading: false });
                      }}
                    >
                      <Icon name="search" />
                      Search by Hash
                    </Button>
                  )}
                </div>
              )}
              {this.state.searchResults.map((result: any) => (
                <div>
                  <Radio
                    disabled={!this.props.haveLock()}
                    label={result.SubFileName}
                    name="radioGroup"
                    value={result.SubDownloadLink}
                    checked={this.props.currentSubtitle?.includes(
                      result.SubDownloadLink
                    )}
                    onChange={(e, { value }) => {
                      this.props.socket.emit(
                        'CMD:subtitle',
                        serverPath + '/downloadSubtitles?url=' + value
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }
}
