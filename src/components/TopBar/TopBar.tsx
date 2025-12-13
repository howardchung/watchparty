import React, { useCallback, useContext } from "react";
import { serverPath, getUserImage, softWhite } from "../../utils/utils";
import { ActionIcon, Avatar, Button, Menu, Text } from "@mantine/core";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { LoginModal } from "../Modal/LoginModal";
import { SubscribeButton } from "../SubscribeButton/SubscribeButton";
import { ProfileModal } from "../Modal/ProfileModal";
import Announce from "../Announce/Announce";
import { InviteButton } from "../InviteButton/InviteButton";
import appStyles from "../App/App.module.css";
import { MetadataContext } from "../../MetadataContext";
import config from "../../config";
import {
  IconBrandDiscord,
  IconBrandFacebookFilled,
  IconBrandGithub,
  IconBrandGoogleFilled,
  IconCirclePlusFilled,
  IconDatabase,
  IconLogin,
  IconMailFilled,
  IconTrash,
} from "@tabler/icons-react";
import styles from "./TopBar.module.css";

export async function createRoom(
  user: firebase.User | undefined,
  openNewTab: boolean | undefined,
  video: string = "",
) {
  const uid = user?.uid;
  const token = await user?.getIdToken();
  const response = await fetch(serverPath + "/createRoom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
    window.open("/watch" + name);
  } else {
    window.location.assign("/watch" + name);
  }
}

export const NewRoomButton = (props: {
  size?: string;
  openNewTab?: boolean;
}) => {
  const context = useContext(MetadataContext);
  const onClick = useCallback(async () => {
    await createRoom(context.user, props.openNewTab);
  }, [context.user, props.openNewTab]);
  return (
    <Button
      size={props.size}
      onClick={onClick}
      leftSection={<IconCirclePlusFilled />}
    >
      New Room
    </Button>
  );
};

type SignInButtonProps = {};

export class SignInButton extends React.Component<SignInButtonProps> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  public state = { isLoginOpen: false, isProfileOpen: false, userImage: null };

  async componentDidUpdate(prevProps: SignInButtonProps) {
    if (this.context.user && !this.state.userImage) {
      this.setState({ userImage: await getUserImage(this.context.user) });
    }
  }

  render() {
    if (this.context.user) {
      return (
        <div
          style={{
            margin: "4px",
            minWidth: "40px",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Avatar
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
        <Button
          leftSection={<IconLogin />}
          onClick={() => this.setState({ isLoginOpen: true })}
        >
          Sign in
        </Button>
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
      const response = await fetch(
        serverPath + `/listRooms?uid=${this.context.user?.uid}&token=${token}`,
      );
      this.setState({ rooms: await response.json() });
    }
  };

  deleteRoom = async (roomId: string) => {
    if (this.context.user) {
      const token = await this.context.user.getIdToken();
      await fetch(
        serverPath +
          `/deleteRoom?uid=${this.context.user?.uid}&token=${token}&roomId=${roomId}`,
        { method: "DELETE" },
      );
      this.setState({
        rooms: this.state.rooms.filter((room) => room.roomId !== roomId),
      });
      this.refreshRooms();
    }
  };

  render() {
    return (
      <Menu>
        <Menu.Target>
          <Button
            color="grey"
            onClick={this.refreshRooms}
            leftSection={<IconDatabase />}
          >
            My rooms
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {this.state.rooms.length === 0 && (
            <Menu.Item disabled>You have no permanent rooms.</Menu.Item>
          )}
          {this.state.rooms.map((room: any) => {
            return (
              <Menu.Item
                key={room.roomId}
                component="a"
                href={
                  room.vanity ? "/r/" + room.vanity : "/watch" + room.roomId
                }
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>
                    <Text>
                      {room.vanity
                        ? `/r/${room.vanity}`
                        : `/watch${room.roomId}`}
                    </Text>
                    <Text size="xs" c="grey">
                      {room.roomId}
                    </Text>
                  </div>
                  <div style={{ marginLeft: "auto", paddingLeft: "20px" }}>
                    <ActionIcon
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        e.preventDefault();
                        this.deleteRoom(room.roomId);
                      }}
                      color="red"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </div>
                </div>
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      </Menu>
    );
  }
}

export const TopBar = (props: {
  hideNewRoom?: boolean;
  hideSignin?: boolean;
  hideMyRooms?: boolean;
  roomTitle?: string;
  roomDescription?: string;
  roomTitleColor?: string;
}) => {
  const context = useContext(MetadataContext);
  const subscribeButton = <SubscribeButton />;
  return (
    <React.Fragment>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          padding: "4px 8px",
          rowGap: "8px",
        }}
      >
        <a href="/" style={{ display: "flex" }}>
          <img style={{ width: "56px", height: "56px" }} src="/logo192.png" />
          {/* <div
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
            </div> */}
        </a>
        {props.roomTitle || props.roomDescription ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginRight: 10,
              marginLeft: 10,
            }}
          >
            <div
              style={{
                fontSize: "30px",
                lineHeight: "30px",
                color: props.roomTitleColor || softWhite,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              {props.roomTitle?.toUpperCase()}
            </div>
            <Text size="sm" style={{}}>
              {props.roomDescription}
            </Text>
          </div>
        ) : (
          <React.Fragment>
            <a href="/" style={{ display: "flex", textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: "#2185d0",
                    fontSize: "30px",
                    lineHeight: "30px",
                  }}
                >
                  Watch
                </div>
                <div
                  style={{
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: "#21ba45",
                    fontSize: "30px",
                    lineHeight: "30px",
                    marginLeft: "auto",
                  }}
                >
                  Party
                </div>
              </div>
            </a>
          </React.Fragment>
        )}
        <Announce />
        <div
          className={appStyles.mobileStack}
          style={{
            display: "flex",
            marginLeft: "auto",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <ActionIcon
              component="a"
              color="gray"
              size="lg"
              href="https://discord.gg/3rYj5HV"
              target="_blank"
              rel="noopener noreferrer"
              title="Discord"
            >
              <IconBrandDiscord />
            </ActionIcon>
            <ActionIcon
              component="a"
              color="gray"
              size="lg"
              href="https://github.com/howardchung/watchparty"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <IconBrandGithub />
            </ActionIcon>
          </div>
          {!props.hideNewRoom && <NewRoomButton openNewTab />}
          {!props.hideMyRooms && context.user && <ListRoomsButton />}
          {subscribeButton}
          {!props.hideSignin && <SignInButton />}
        </div>
      </div>
    </React.Fragment>
  );
};
