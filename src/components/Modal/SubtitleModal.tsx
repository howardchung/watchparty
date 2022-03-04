import React from 'react';
import { Modal, Button, Popup, Icon, Grid, Radio } from 'semantic-ui-react';
import { Socket } from 'socket.io-client';
import { openFileSelector, serverPath } from '../../utils';

export class SubtitleModal extends React.Component<{
  closeModal: Function;
  currentSubtitle: string;
  haveLock: Function;
  src: string;
  socket: Socket;
  getMediaDisplayName: Function;
  beta: boolean;
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
        <Modal.Header>
          Subtitles are {Boolean(this.props.currentSubtitle) ? 'on' : 'off'}
          <Button
            style={{ float: 'right' }}
            color="red"
            title="Remove Subtitles"
            disabled={
              !Boolean(this.props.currentSubtitle) || !this.props.haveLock()
            }
            icon
            onClick={() => {
              this.props.socket.emit('CMD:subtitle', null);
            }}
          >
            <Icon name="trash" />
          </Button>
        </Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            {process.env.NODE_ENV === 'development' && (
              <div style={{ maxWidth: '600px' }}>
                {this.props.currentSubtitle}
              </div>
            )}
            <Grid columns={2}>
              <Grid.Column>
                <Popup
                  content="Upload a .srt subtitle file for this video"
                  trigger={
                    <Button
                      color="violet"
                      icon
                      labelPosition="left"
                      fluid
                      onClick={() => this.uploadSubtitle()}
                      disabled={!this.props.haveLock()}
                    >
                      <Icon name="closed captioning" />
                      Upload Subtitles
                    </Button>
                  }
                />
              </Grid.Column>
              {this.props.src.startsWith('http') && (
                <Grid.Column>
                  <div style={{ display: 'flex' }}>
                    <Button
                      loading={this.state.loading}
                      color="green"
                      disabled={!this.props.haveLock()}
                      icon
                      labelPosition="left"
                      fluid
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
                      Search OpenSubtitles
                    </Button>
                    {this.props.beta && (
                      <Button
                        loading={this.state.loading}
                        color="green"
                        disabled={!this.props.haveLock()}
                        icon
                        labelPosition="left"
                        fluid
                        onClick={async () => {
                          this.setState({ loading: true });
                          const resp = await window.fetch(
                            serverPath +
                              '/searchSubtitles?title=' +
                              this.props.getMediaDisplayName(this.props.src)
                          );
                          const json = await resp.json();
                          this.setState({ searchResults: json });
                          this.setState({ loading: false });
                        }}
                      >
                        <Icon name="search" />
                        Search by Title
                      </Button>
                    )}
                  </div>
                </Grid.Column>
              )}
            </Grid>
            <div>
              {this.state.searchResults.map((result: any) => (
                <div>
                  <Radio
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
            {/* TODO add a spinner */}
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }
}
