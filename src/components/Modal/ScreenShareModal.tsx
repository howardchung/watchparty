import React from 'react';
import { Modal, Button, Table, Message } from 'semantic-ui-react';
import {
  GoogleReCaptchaProvider,
  withGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { SignInButton } from '../TopBar/TopBar';

export class ScreenShareModal extends React.Component<{
  closeModal: Function;
  startScreenShare: Function;
}> {
  render() {
    const { closeModal, startScreenShare } = this.props;
    return (
      <Modal open={true} onClose={closeModal as any}>
        <Modal.Header>Share Your Screen</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <div>You're about to share your screen.</div>
            <ul>
              <li>This feature is only supported on Chrome and Edge.</li>
              <li>
                To share audio, you need to check the "Share audio" checkbox in
                the screen selection dialog.
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
