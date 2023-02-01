import React from 'react';
import { Modal, Button } from 'semantic-ui-react';

export class FileShareModal extends React.Component<{
  closeModal: Function;
  startFileShare: Function;
  startFileShareV2: Function;
}> {
  render() {
    const { closeModal } = this.props;
    return (
      <Modal open={true} onClose={closeModal as any}>
        <Modal.Header>Share A File</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <div>You're about to share a file from your device.</div>
            <ul>
              <li>This feature is only supported on Chrome and Edge.</li>
              <li>
                To test whether the file can be shared, you can try opening it
                locally with your browser to see if it will play properly.
              </li>
              <li>
                Certain codecs, such as HEVC, AC3, and H265 may not play in
                Chrome (they may work in Edge due to licensing)
              </li>
              <li>
                There is a known Chrome issue where the sharer may need to{' '}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://www.howtogeek.com/412738/how-to-turn-hardware-acceleration-on-and-off-in-chrome/"
                >
                  disable hardware acceleration
                </a>{' '}
                in order for others to receive video.
              </li>
            </ul>
            <Button
              onClick={() => {
                this.props.startFileShare();
                this.props.closeModal();
              }}
            >
              Start Fileshare
            </Button>
            <Button
              onClick={() => {
                this.props.startFileShareV2();
                this.props.closeModal();
              }}
            >
              Start Fileshare V2
            </Button>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }
}
