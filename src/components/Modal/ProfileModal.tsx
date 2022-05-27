import React from 'react';
import { Modal, Button, Icon, Image, Popup } from 'semantic-ui-react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { serverPath } from '../../utils';

export class ProfileModal extends React.Component<{
  close: Function;
  user: firebase.User;
  userImage: string | null;
  isSubscriber?: boolean;
  discordUsername?: string;
  discordDiscriminator?: string;
}> {
  public state = {
    resetDisabled: false,
    verifyDisabled: false,
    deleteConfirmOpen: false,
  };

  authDiscord = () => {
    const url = process.env.REACT_APP_DISCORD_AUTH_URL;
    window.open(
      url,
      '_blank',
      'toolbar=0,location=0,menubar=0,width=450,height=900'
    );
  };

  deleteDiscord = async () => {
    const token = await this.props.user.getIdToken();
    await window.fetch(serverPath + '/discord/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: this.props.user.uid,
        token,
      }),
    });
    window.location.reload();
  };

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

  verifyEmail = async () => {
    try {
      if (this.props.user) {
        await this.props.user.sendEmailVerification();
        this.setState({ verifyDisabled: true });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  deleteAccountConfirm = () => {
    this.setState({ deleteConfirmOpen: true });
  };

  deleteAccount = async () => {
    const token = await this.props.user.getIdToken();
    await window.fetch(serverPath + '/deleteAccount', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid: this.props.user.uid, token }),
    });
    window.location.reload();
  };

  render() {
    const { close, userImage } = this.props;
    return (
      <Modal open={true} onClose={close as any} size="tiny">
        <Modal
          open={this.state.deleteConfirmOpen}
          onClose={() => {
            this.setState({ deleteConfirmOpen: false });
          }}
          size="tiny"
        >
          <Modal.Header>Delete Your Account</Modal.Header>
          <Modal.Content>
            <p>
              Are you sure you want to delete your account? This can't be
              undone.
            </p>
          </Modal.Content>
          <Modal.Actions>
            <Button
              positive
              onClick={async () => {
                await this.deleteAccount();
              }}
            >
              Yes
            </Button>
            <Button
              negative
              onClick={() => {
                this.setState({ deleteConfirmOpen: false });
              }}
            >
              No
            </Button>
          </Modal.Actions>
        </Modal>
        <Modal.Header>
          <Image avatar src={userImage} />
          {this.props.user.email}
          {this.props.user.emailVerified && (
            <Icon
              style={{ marginLeft: '8px' }}
              title="Thie email is verified"
              name="check circle"
            ></Icon>
          )}
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
            {this.props.discordUsername && this.props.discordDiscriminator ? (
              <Button
                icon
                labelPosition="left"
                fluid
                color="red"
                animated="fade"
                onClick={this.deleteDiscord}
              >
                <Icon name="discord" />
                <Button.Content visible>Unlink Discord Account</Button.Content>
                <Button.Content
                  hidden
                >{`${this.props.discordUsername}#${this.props.discordDiscriminator}`}</Button.Content>
              </Button>
            ) : (
              <React.Fragment>
                {process.env.REACT_APP_DISCORD_AUTH_URL && (
                  <Popup
                    content="Link your Discord account to get assigned a subscriber role on our Discord server."
                    trigger={
                      <Button
                        icon
                        labelPosition="left"
                        fluid
                        color="orange"
                        onClick={this.authDiscord}
                        disabled={!this.props.isSubscriber}
                      >
                        <Icon name="discord" />
                        Get Subscriber Role
                      </Button>
                    }
                  />
                )}
              </React.Fragment>
            )}
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
              disabled={
                this.props.user.emailVerified || this.state.verifyDisabled
              }
              icon
              labelPosition="left"
              fluid
              color="purple"
              onClick={this.verifyEmail}
            >
              <Icon name="check circle" />
              Verify Email
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
              fluid
              color="red"
              onClick={this.deleteAccountConfirm}
            >
              <Icon name="trash" />
              Delete Account
            </Button>
            <Button icon labelPosition="left" onClick={this.onSignOut} fluid>
              <Icon name="sign out" />
              Sign out
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    );
  }
}
