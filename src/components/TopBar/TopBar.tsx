import React, { useCallback, useContext } from "react";
import { serverPath, getUserImage, softWhite } from "../../utils/utils";
import { ActionIcon, Avatar, Button, Menu, Text } from "../UI/UI";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { LoginModal } from "../Modal/LoginModal";
import { SubscribeButton } from "../SubscribeButton/SubscribeButton";
import { ProfileModal } from "../Modal/ProfileModal";
import Announce from "../Announce/Announce";
import { MetadataContext } from "../../MetadataContext";
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconCirclePlusFilled,
  IconDatabase,
  IconLogin,
  IconTrash,
} from "../Icons/Icons";
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
      leftSection={<IconCirclePlusFilled size={18} />}
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

  async componentDidUpdate() {
    if (this.context.user && !this.state.userImage) {
      this.setState({ userImage: await getUserImage(this.context.user) });
    }
  }

  render() {
    if (this.context.user) {
      return (
        <div className={styles.avatarTrigger}>
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
          color="grey"
          leftSection={<IconLogin size={17} />}
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
            leftSection={<IconDatabase size={16} />}
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
                <div className={styles.roomMenuItem}>
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
                  <ActionIcon
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      e.preventDefault();
                      this.deleteRoom(room.roomId);
                    }}
                    color="red"
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
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
    <header className={styles.topBar}>
      <a href="/" className={styles.brandLink}>
        <img className={styles.logoImg} src="/logo192.png" alt="WatchParty" />
        {!(props.roomTitle || props.roomDescription) && (
          <div className={styles.brandText}>
            <span className={styles.brandWatch}>Watch</span>
            <span className={styles.brandParty}>Party</span>
          </div>
        )}
      </a>
      {(props.roomTitle || props.roomDescription) && (
        <div className={styles.roomHeader}>
          <div
            className={styles.roomTitle}
            style={{ color: props.roomTitleColor || softWhite }}
          >
            {props.roomTitle?.toUpperCase()}
          </div>
          {props.roomDescription && (
            <div className={styles.roomDescription}>{props.roomDescription}</div>
          )}
        </div>
      )}
      <Announce />
      <div className={styles.rightActions}>
        <div className={styles.socialGroup}>
          <ActionIcon
            component="a"
            color="gray"
            size="lg"
            href="https://discord.gg/3rYj5HV"
            target="_blank"
            rel="noopener noreferrer"
            title="Discord"
          >
            <IconBrandDiscord size={18} />
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
            <IconBrandGithub size={18} />
          </ActionIcon>
        </div>
        {!props.hideNewRoom && <NewRoomButton openNewTab />}
        {!props.hideMyRooms && context.user && <ListRoomsButton />}
        {subscribeButton}
        {!props.hideSignin && <SignInButton />}
      </div>
    </header>
  );
};
