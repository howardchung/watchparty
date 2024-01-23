import React from 'react';
import { serverPath, colorMappings, getUserImage } from '../../utils';
import {
  Icon,
  Popup,
  Button,
  Dropdown,
  Image,
  SemanticSIZES,
} from 'semantic-ui-react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { LoginModal } from '../Modal/LoginModal';
import axios from 'axios';
import { SubscribeButton } from '../SubscribeButton/SubscribeButton';
import { ProfileModal } from '../Modal/ProfileModal';
import Announce from '../Announce/Announce';
import { InviteButton } from '../InviteButton/InviteButton';
import appStyles from '../App/App.module.css';
import { MetadataContext } from '../../MetadataContext';

export async function createRoom(
  user: firebase.User | undefined,
  openNewTab: boolean | undefined,
  video: string = '',
) {
  const uid = user?.uid;
  const token = await user?.getIdToken();
  const response = await window.fetch(serverPath + '/createRoom', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uid,
      token,
      video,
    }),
  });
  const data = await response.json();
  const { name } = data;
  if (openNewTab) {
    window.open('/watch' + name);
  } else {
    window.location.assign('/watch' + name);
  }
}

export class NewRoomButton extends React.Component<{
  size?: SemanticSIZES;
  openNewTab?: boolean;
}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  createRoom = async () => {
    await createRoom(this.context.user, this.props.openNewTab);
  };
  render() {
    return (
      <Popup
        content="Create a new room with a random URL that you can share with friends"
        trigger={
          <Button
            color="blue"
            size={this.props.size}
            icon
            labelPosition="left"
            onClick={this.createRoom}
            className={this.props.size ? '' : 'toolButton'}
            fluid
          >
            <Icon name="certificate" />
            New Room
          </Button>
        }
      />
    );
  }
}

type SignInButtonProps = {
  fluid?: boolean;
};

export class SignInButton extends React.Component<SignInButtonProps> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  public state = { isLoginOpen: false, isProfileOpen: false, userImage: null };

  async componentDidUpdate(prevProps: SignInButtonProps) {
    if (this.context.user && !this.state.userImage) {
      this.setState({ userImage: await getUserImage(this.context.user) });
    }
  }

  facebookSignIn = async () => {
    const provider = new firebase.auth.FacebookAuthProvider();
    await firebase.auth().signInWithPopup(provider);
  };

  googleSignIn = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider);
  };

  signOut = () => {
    firebase.auth().signOut();
    window.location.reload();
    this.setState({ userImage: null });
  };

  render() {
    if (this.context.user) {
      return (
        <div
          style={{
            margin: '4px',
            width: '100px',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <Image
            avatar
            src={this.state.userImage}
            onClick={() => this.setState({ isProfileOpen: true })}
          />
          {this.state.isProfileOpen && this.context.user && (
            <ProfileModal
              userImage={this.state.userImage}
              close={() => this.setState({ isProfileOpen: false })}
            />
          )}
        </div>
      );
    }
    return (
      <React.Fragment>
        {this.state.isLoginOpen && (
          <LoginModal
            closeModal={() => this.setState({ isLoginOpen: false })}
          />
        )}
        <Popup
          basic
          content="Sign in for additional features"
          trigger={
            <Dropdown
              style={{ height: '36px' }}
              icon="sign in"
              labeled
              className="icon"
              button
              text="Sign in"
              fluid={this.props.fluid}
            >
              <Dropdown.Menu>
                <Dropdown.Item onClick={this.facebookSignIn}>
                  <Icon name="facebook" />
                  Facebook
                </Dropdown.Item>
                <Dropdown.Item onClick={this.googleSignIn}>
                  <Icon name="google" />
                  Google
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => this.setState({ isLoginOpen: true })}
                >
                  <Icon name="mail" />
                  Email
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          }
        />
      </React.Fragment>
    );
  }
}

export class ListRoomsButton extends React.Component<{}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  public state = { rooms: [] as PersistentRoom[] };

  componentDidMount() {
    this.refreshRooms();
  }

  refreshRooms = async () => {
    if (this.context.user) {
      const token = await this.context.user.getIdToken();
      const response = await axios.get(
        serverPath + `/listRooms?uid=${this.context.user?.uid}&token=${token}`,
      );
      this.setState({ rooms: response.data });
    }
  };

  deleteRoom = async (roomId: string) => {
    if (this.context.user) {
      const token = await this.context.user.getIdToken();
      await axios.delete(
        serverPath +
          `/deleteRoom?uid=${this.context.user?.uid}&token=${token}&roomId=${roomId}`,
      );
      this.setState({
        rooms: this.state.rooms.filter((room) => room.roomId !== roomId),
      });
      this.refreshRooms();
    }
  };

  render() {
    return (
      <Dropdown
        style={{ height: '36px' }}
        icon="group"
        labeled
        className="icon"
        button
        text="My Rooms"
        onClick={this.refreshRooms}
        scrolling
        pointing="top right"
      >
        <Dropdown.Menu>
          {this.state.rooms.length === 0 && (
            <Dropdown.Item disabled>You have no permanent rooms.</Dropdown.Item>
          )}
          {this.state.rooms.map((room: any) => {
            return (
              <Dropdown.Item
                key={room.roomId}
                link="true"
                href={
                  room.vanity ? '/r/' + room.vanity : '/watch' + room.roomId
                }
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {room.vanity ? `/r/${room.vanity}` : room.roomId}
                  <div style={{ marginLeft: 'auto', paddingLeft: '20px' }}>
                    <Button
                      icon
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        e.preventDefault();
                        this.deleteRoom(room.roomId);
                      }}
                      color="red"
                      size="mini"
                    >
                      <Icon name="trash" />
                    </Button>
                  </div>
                </div>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export class TopBar extends React.Component<{
  hideNewRoom?: boolean;
  hideSignin?: boolean;
  hideMyRooms?: boolean;
  roomTitle?: string;
  roomDescription?: string;
  roomTitleColor?: string;
  showInviteButton?: boolean;
}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  render() {
    const subscribeButton = <SubscribeButton />;
    return (
      <React.Fragment>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            padding: '1em',
            paddingBottom: '0px',
            rowGap: '8px',
          }}
        >
          <a href="/" style={{ display: 'flex' }}>
            <div
              style={{
                height: '48px',
                width: '48px',
                marginRight: '10px',
                borderRadius: '50%',
                position: 'relative',
                backgroundColor: '#' + colorMappings.blue,
              }}
            >
              <Icon
                inverted
                name="film"
                size="large"
                style={{
                  position: 'absolute',
                  top: 8,
                  width: '100%',
                  margin: '0 auto',
                }}
              />
              <Icon
                inverted
                name="group"
                size="large"
                color="green"
                style={{
                  position: 'absolute',
                  bottom: 8,
                  width: '100%',
                  margin: '0 auto',
                }}
              />
            </div>
          </a>
          {this.props.roomTitle || this.props.roomDescription ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                marginRight: 10,
                marginLeft: 10,
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  color: this.props.roomTitleColor || 'white',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                }}
              >
                {this.props.roomTitle?.toUpperCase()}
              </div>
              <div style={{ marginTop: 4, color: 'rgb(255 255 255 / 63%)' }}>
                {this.props.roomDescription}
              </div>
            </div>
          ) : (
            <React.Fragment>
              <a href="/" style={{ display: 'flex' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: '#2185d0',
                      fontSize: '30px',
                      lineHeight: '30px',
                    }}
                  >
                    Watch
                  </div>
                  <div
                    style={{
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: '#21ba45',
                      fontSize: '30px',
                      lineHeight: '30px',
                      marginLeft: 'auto',
                    }}
                  >
                    Party
                  </div>
                </div>
              </a>
            </React.Fragment>
          )}
          <div
            style={{
              display: 'flex',
              marginLeft: '10px',
              alignItems: 'center',
            }}
          >
            <a
              href="https://discord.gg/3rYj5HV"
              target="_blank"
              rel="noopener noreferrer"
              className="footerIcon"
              title="Discord"
            >
              <Icon name="discord" size="big" link />
            </a>
            <a
              href="https://github.com/howardchung/watchparty"
              target="_blank"
              rel="noopener noreferrer"
              className="footerIcon"
              title="GitHub"
            >
              <Icon name="github" size="big" link />
            </a>
          </div>
          <Announce />
          <div
            className={appStyles.mobileStack}
            style={{
              display: 'flex',
              marginLeft: 'auto',
              gap: '4px',
            }}
          >
            {this.props.showInviteButton && <InviteButton />}
            {!this.props.hideNewRoom && <NewRoomButton openNewTab />}
            {!this.props.hideMyRooms && this.context.user && (
              <ListRoomsButton />
            )}
            {subscribeButton}
            {!this.props.hideSignin && <SignInButton />}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
