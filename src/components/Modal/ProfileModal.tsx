import React from 'react';
import { Modal, Button, Icon, Image } from 'semantic-ui-react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export class ProfileModal extends React.Component<{
  close: Function;
  user: firebase.User;
  userImage: string | null;
}> {
  public state = { resetDisabled: false };

  onSignOut = () => {
    firebase.auth().signOut();
    window.location.reload();
  };

  resetPassword = async () => {
    try {
      if (this.props.user.email) {
        await firebase.auth().sendPasswordResetEmail(this.props.user.email);
        this.setState({ resetDisabled: true });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  render() {
    const { close, userImage } = this.props;
    return (
      <Modal open={true} onClose={close as any}>
        <Modal.Header>
          <Image avatar src={userImage} />
          {this.props.user.email}
        </Modal.Header>
        <Modal.Content>
          <div
            style={{
              width: '300px',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <Button
              icon
              labelPosition="left"
              fluid
              href="https://gravatar.com"
              target="_blank"
              color="blue"
            >
              <Icon name="image" />
              Edit Gravatar
            </Button>
            <Button
              disabled={this.state.resetDisabled}
              icon
              labelPosition="left"
              fluid
              color="green"
              onClick={this.resetPassword}
            >
              <Icon name="key" />
              Reset Password
            </Button>
            <Button
              icon
              labelPosition="left"
              onClick={this.onSignOut}
              color="red"
              fluid
            >
              <Icon name="sign out" />
              Sign out
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    );
  }
}
