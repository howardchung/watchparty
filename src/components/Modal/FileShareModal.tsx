import React from 'react';
import { Modal, Button } from 'semantic-ui-react';

export class FileShareModal extends React.Component<{
  closeModal: Function;
  startFileShare: Function;
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
                There is a Chrome issue where the sharer needs to{' '}
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
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }
}
