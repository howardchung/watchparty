import React from 'react';
import { Modal, Button, Icon, Image, Input, Label } from 'semantic-ui-react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { serverPath } from '../../utils';

export class ProfileModal extends React.Component<{
  close: Function;
  user: firebase.User;
  userImage: string | null;
  isSubscriber?: boolean;
}> {
  public state = {
    resetDisabled: false,
    deleteConfirmOpen: false,
    discordOpen: false,
    discordUsername: '',
    discordDiscriminator: '',
    fetchedDiscordUsername: '',
    fetchedDiscordDiscriminator: '',
    discordError: '',
  };

  openDiscord = async () => {
    await this.getDiscord();
    this.setState({ discordOpen: true });
  };

  closeDiscord = async () => {
    this.setState({
      discordOpen: false,
      discordUsername: '',
      discordDiscriminator: '',
      discordError: '',
    });
  };

  setDiscordUsername(value: string) {
    this.setState({ discordUsername: value });
  }

  setDiscordDiscriminator(value: string) {
    this.setState({ discordDiscriminator: value });
  }

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

  assignRole = async (
    username: string,
    discriminator: string,
    undo: boolean = false
  ) => {
    const token = await this.props.user.getIdToken();
    const response = await window.fetch(serverPath + '/discordRole', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: this.props.user.uid,
        token,
        username,
        discriminator,
        undo,
      }),
    });
    if (response.status !== 200) {
      const body = await response.json();
      this.setState({ discordError: body.error });
    } else {
      this.setState({ discordError: '' });
    }
  };

  getDiscord = async () => {
    const token = await this.props.user.getIdToken();
    const response = await window.fetch(
      serverPath + `/discordRole?uid=${this.props.user?.uid}&token=${token}`
    );
    const data = await response.json();
    this.setState({
      fetchedDiscordUsername: data.username,
      fetchedDiscordDiscriminator: data.discriminator,
    });
  };

  render() {
    const { close, userImage } = this.props;
    const {
      discordUsername,
      discordDiscriminator,
      fetchedDiscordUsername,
      fetchedDiscordDiscriminator,
    } = this.state;
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
        <Modal
          open={this.state.discordOpen}
          onClose={() => {
            this.setState({ discordInputOpen: false });
          }}
          size="tiny"
        >
          <Label attached="top" color="orange">
            Subscriber only
          </Label>
          <Modal.Header>
            Enter your Discord account name to to be assigned your subscriber
            role on our Discord server
          </Modal.Header>
          <Modal.Content>
            <p>
              <a href="https://discord.gg/3rYj5HV">
                https://discord.gg/3rYj5HV
              </a>
            </p>
            <p style={{ color: 'blue', fontWeight: 'bold' }}>
              Make sure you have joined our Discord server before continuing.
            </p>
            <p>
              Your full Discord account consists of your username and a
              numerical tag seperated by a <i>#</i>.
            </p>
            {fetchedDiscordUsername && fetchedDiscordDiscriminator && (
              <p>
                You currently have assigned a role to:{' '}
                <b>
                  {fetchedDiscordUsername}#{fetchedDiscordDiscriminator}
                </b>
              </p>
            )}
            <div style={{ display: 'flex' }}>
              <Input
                attached
                style={{ borderRadius: 0 }}
                type="text"
                placeholder="Username"
                value={this.state.discordUsername}
                onChange={(e) => {
                  this.setDiscordUsername(e.target.value);
                }}
              />
              <Label style={{ margin: 0, borderRadius: 0 }} size="big">
                #
              </Label>
              <Input
                style={{ width: 65 }}
                type="text"
                placeholder="Tag"
                maxLength="4"
                value={this.state.discordDiscriminator}
                onChange={(e) => {
                  this.setDiscordDiscriminator(e.target.value);
                }}
              />
            </div>
            {this.state.discordError && (
              <div
                style={{
                  marginTop: 15,
                  fontSize: 15,
                  fontWeight: 'bold',
                  color: 'red',
                }}
              >
                {this.state.discordError}
              </div>
            )}
          </Modal.Content>
          <Modal.Actions>
            <Button
              positive
              onClick={async () => {
                await this.assignRole(discordUsername, discordDiscriminator);
                if (!this.state.discordError) {
                  this.closeDiscord();
                }
              }}
            >
              Confirm
            </Button>
            <Button
              color="black"
              disabled={!fetchedDiscordUsername || !fetchedDiscordDiscriminator}
              onClick={async () => {
                await this.assignRole(
                  fetchedDiscordUsername,
                  fetchedDiscordDiscriminator,
                  true
                );
                this.closeDiscord();
              }}
            >
              Remove assigned role
            </Button>
            <Button negative onClick={this.closeDiscord}>
              Cancel
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
            <Button
              icon
              labelPosition="left"
              fluid
              color="orange"
              onClick={() => this.openDiscord()}
              animated="fade"
              disabled={!this.props.isSubscriber}
            >
              <Icon name="star" />
              Get Discord Role
            </Button>
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
              disabled={this.props.user.emailVerified}
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
