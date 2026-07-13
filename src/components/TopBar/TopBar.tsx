import React, { useCallback, useContext } from "react";
import {
  ActionIcon,
  Button,
  Menu,
  Text,
} from "@mantine/core";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { LoginModal } from "../Modal/LoginModal";
import { SubscribeButton } from "../SubscribeButton/SubscribeButton";
import { InviteButton } from "../InviteButton/InviteButton";
import { MetadataContext } from "../../MetadataContext";
import { serverPath } from "../../utils/utils";
import {
  IconCirclePlusFilled,
  IconDatabase,
  IconLogin,
  IconLogout,
  IconPlayerPlayFilled,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { t } from "../../i18n";
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
      className={styles.primaryButton}
      size={props.size as any}
      onClick={onClick}
      leftSection={<IconCirclePlusFilled size={18} />}
    >
      {t("newRoom")}
    </Button>
  );
};

export class SignInButton extends React.Component {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  public state = { isLoginOpen: false };

  onSignOut = () => {
    firebase.auth().signOut();
    window.localStorage.removeItem("watchparty-loginname");
    window.location.reload();
  };

  render() {
    if (this.context.user) {
      return (
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <button className={styles.accountButton} type="button">
              <IconUser size={18} />
              <span>{t("account")}</span>
            </button>
          </Menu.Target>
          <Menu.Dropdown dir="rtl">
            <Menu.Label>{this.context.user.email || t("account")}</Menu.Label>
            <Menu.Item
              leftSection={<IconLogout size={16} />}
              onClick={this.onSignOut}
            >
              {t("signOut")}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <>
        {this.state.isLoginOpen && (
          <LoginModal
            closeModal={() => this.setState({ isLoginOpen: false })}
          />
        )}
        <Button
          variant="subtle"
          className={styles.signInButton}
          leftSection={<IconLogin size={18} />}
          onClick={() => this.setState({ isLoginOpen: true })}
        >
          {t("signIn")}
        </Button>
      </>
    );
  }
}

export class ListRoomsButton extends React.Component {
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
        serverPath +
          `/listRooms?uid=${this.context.user.uid}&token=${token}`,
      );
      if (response.ok) {
        this.setState({ rooms: await response.json() });
      }
    }
  };

  deleteRoom = async (roomId: string) => {
    if (this.context.user) {
      const token = await this.context.user.getIdToken();
      await fetch(
        serverPath +
          `/deleteRoom?uid=${this.context.user.uid}&token=${token}&roomId=${roomId}`,
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
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <Button
            variant="subtle"
            className={styles.secondaryButton}
            onClick={this.refreshRooms}
            leftSection={<IconDatabase size={18} />}
          >
            {t("myRooms")}
          </Button>
        </Menu.Target>
        <Menu.Dropdown dir="rtl">
          {this.state.rooms.length === 0 && (
            <Menu.Item disabled>{t("noPermanentRooms")}</Menu.Item>
          )}
          {this.state.rooms.map((room: PersistentRoom) => (
            <Menu.Item
              key={room.roomId}
              component="a"
              href={
                room.vanity ? "/r/" + room.vanity : "/watch" + room.roomId
              }
            >
              <div className={styles.roomMenuItem}>
                <div>
                  <Text size="sm">
                    {room.vanity
                      ? `/r/${room.vanity}`
                      : `/watch${room.roomId}`}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {room.roomId}
                  </Text>
                </div>
                <ActionIcon
                  aria-label="حذف اتاق"
                  color="red"
                  variant="subtle"
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    this.deleteRoom(room.roomId);
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </div>
            </Menu.Item>
          ))}
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
  const isRoom = Boolean(props.roomTitle || props.roomDescription);

  return (
    <header className={styles.topBar} dir="rtl">
      <div className={styles.brandCluster}>
        <a href="/" className={styles.brand} aria-label={t("brand")}>
          <span className={styles.brandMark}>
            <IconPlayerPlayFilled size={16} />
          </span>
          <span>{t("brand")}</span>
        </a>
        {isRoom ? (
          <div className={styles.roomIdentity}>
            <strong style={{ color: props.roomTitleColor || undefined }}>
              {props.roomTitle || t("room")}
            </strong>
            {props.roomDescription && (
              <span>{props.roomDescription}</span>
            )}
          </div>
        ) : (
          <nav className={styles.homeNav} aria-label="ناوبری اصلی">
            <a href="/faq">{t("faq")}</a>
            <a href="/privacy">{t("privacy")}</a>
            <a href="/terms">{t("terms")}</a>
          </nav>
        )}
      </div>

      <div className={styles.topActions}>
        {isRoom && (
          <div className={styles.roomStatus}>
            <span className={styles.statusDot} />
            <span>{t("synced")}</span>
          </div>
        )}
        {!props.hideNewRoom && <NewRoomButton openNewTab />}
        {!props.hideMyRooms && context.user && <ListRoomsButton />}
        <SubscribeButton />
        {!props.hideSignin && <SignInButton />}
        {isRoom && <InviteButton />}
      </div>
    </header>
  );
};
