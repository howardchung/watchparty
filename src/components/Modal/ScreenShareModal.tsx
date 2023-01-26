import React from 'react';
import { Modal, Button } from 'semantic-ui-react';

export class ScreenShareModal extends React.Component<{
  closeModal: Function;
  startScreenShare: Function;
}> {
  render() {
    const { closeModal } = this.props;
    return (
      <Modal open={true} onClose={closeModal as any}>
        <Modal.Header>Share Your Screen</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <div>You're about to share your screen.</div>
            <ul>
              <li>This feature is only supported on Chrome and Edge.</li>
              <li>
                To share audio, the "Share audio" checkbox needs to be checked
                in the screen selection dialog.
              </li>
              <li>
                Audio sharing is only supported if sharing your entire screen or
                a browser tab, not an application.
              </li>
            </ul>
            <Button
              onClick={() => {
                this.props.startScreenShare();
                this.props.closeModal();
              }}
            >
              Start Screenshare
            </Button>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }
}
