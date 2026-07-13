import React, { RefObject, useContext } from "react";
import {
  ActionIcon,
  Button,
  HoverCard,
  TextInput,
} from "@mantine/core";
// import data from '@emoji-mart/data';
import Picker from "@emoji-mart/react";
import { init } from "emoji-mart";
// import onClickOutside from 'react-onclickoutside';
//@ts-expect-error
import Linkify from "react-linkify";
import { SecureLink } from "react-secure-link";
import styles from "./Chat.module.css";

import {
  formatTimestamp,
  getOrCreateClientId,
  isEmojiString,
} from "../../utils/utils";
import { UserMenu } from "../UserMenu/UserMenu";
import { Socket } from "socket.io-client";
import {
  CSSTransition,
  SwitchTransition,
  TransitionGroup,
} from "react-transition-group";
import { MetadataContext } from "../../MetadataContext";
import { t } from "../../i18n";
import {
  IconCornerDownLeft,
  IconMoodSmile,
  IconSend,
} from "@tabler/icons-react";

const clientId = getOrCreateClientId();
const truncateReply = (input?: string, max = 30) =>
  input && input.length > max ? `${input.slice(0, max)}...` : input || "";

interface ChatProps {
  chat: ChatMessage[];
  nameMap: StringDict;
  pictureMap: StringDict;
  socket: Socket;
  scrollTimestamp: number;
  className?: string;
  fullscreen?: boolean;
  getMediaDisplayName: (input?: string) => string;
  hide?: boolean;
  isChatDisabled?: boolean;
  owner: string | undefined;
  ref: RefObject<Chat>;
}

export class Chat extends React.Component<ChatProps> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  public state = {
    chatMsg: "",
    replyTo: undefined as
      | { id: string; timestamp: string; msg?: string }
      | undefined,
    isNearBottom: true,
    isPickerOpen: false,
    reactionMenu: {
      isOpen: false,
      selectedMsgId: "",
      selectedMsgTimestamp: "",
      yPosition: 0,
      xPosition: 0,
    },
  };
  messagesRef = React.createRef<HTMLDivElement>();
  chatInputRef = React.createRef<HTMLInputElement>();

  async componentDidMount() {
    this.scrollToBottom();
    this.messagesRef.current?.addEventListener("scroll", this.onScroll);
    init({});
  }

  componentDidUpdate(prevProps: ChatProps) {
    if (this.props.scrollTimestamp !== prevProps.scrollTimestamp) {
      if (prevProps.scrollTimestamp === 0 || this.state.isNearBottom) {
        this.scrollToBottom();
      }
    }
    if (this.props.hide !== prevProps.hide) {
      this.scrollToBottom();
    }
  }

  setReactionMenu = (
    isOpen: boolean,
    selectedMsgId?: string,
    selectedMsgTimestamp?: string,
    yPosition?: number,
    xPosition?: number,
  ) => {
    this.setState({
      reactionMenu: {
        isOpen,
        selectedMsgId,
        selectedMsgTimestamp,
        yPosition,
        xPosition,
      },
    });
  };

  handleReactionClick = (value: string, id?: string, timestamp?: string) => {
    const msg = this.props.chat.find(
      (m) => m.id === id && m.timestamp === timestamp,
    );
    const data = {
      value,
      msgId: id || this.state.reactionMenu.selectedMsgId,
      msgTimestamp: timestamp || this.state.reactionMenu.selectedMsgTimestamp,
    };
    if (msg?.reactions?.[value].includes(clientId)) {
      this.props.socket.emit("CMD:removeReaction", data);
    } else {
      this.props.socket.emit("CMD:addReaction", data);
    }
  };

  updateChatMsg = (e: any) => {
    // console.log(e.target.selectionStart);
    this.setState({ chatMsg: e.target.value });
  };

  sendChatMsg = () => {
    if (!this.state.chatMsg) {
      return;
    }
    if (this.chatTooLong()) {
      return;
    }
    if (this.state.replyTo?.id && this.state.replyTo.timestamp) {
      const chatPayload: ChatPayload = {
        msg: this.state.chatMsg,
        replyToId: this.state.replyTo.id,
        replyToTimestamp: this.state.replyTo.timestamp,
      };
      this.props.socket.emit("CMD:chatV2", chatPayload);
      this.setState({ chatMsg: "", replyTo: undefined });
      return;
    }
    this.setState({ chatMsg: "", replyTo: undefined });
    this.props.socket.emit("CMD:chat", this.state.chatMsg);
  };

  setReplyTo = (id: string, timestamp: string, msg?: string) => {
    this.setState({ replyTo: { id, timestamp, msg } });
    this.chatInputRef.current?.focus();
  };

  clearReplyTo = () => {
    this.setState({ replyTo: undefined });
  };

  chatTooLong = () => {
    return Boolean(this.state.chatMsg?.length > 10000);
  };

  onScroll = () => {
    this.setState({ isNearBottom: this.isChatNearBottom() });
  };

  isChatNearBottom = () => {
    return (
      this.messagesRef.current &&
      this.messagesRef.current.scrollHeight -
        this.messagesRef.current.scrollTop -
        this.messagesRef.current.offsetHeight <
        50
    );
  };

  scrollToBottom = () => {
    if (this.messagesRef.current) {
      this.messagesRef.current.scrollTop =
        this.messagesRef.current.scrollHeight;
    }
  };

  formatMessage = (cmd: string, msg?: string): React.ReactNode | string => {
    if (cmd === "host") {
      return (
        <React.Fragment>
          {`ویدیو را تغییر داد`}
          <span style={{ textTransform: "initial" }}>
            {this.props.getMediaDisplayName(msg)}
          </span>
        </React.Fragment>
      );
    } else if (cmd === "playlistAdd") {
      return (
        <React.Fragment>
          {`به فهرست پخش اضافه کرد: `}
          <span style={{ textTransform: "initial" }}>
            {this.props.getMediaDisplayName(msg)}
          </span>
        </React.Fragment>
      );
    } else if (cmd === "seek") {
      return `به ${formatTimestamp(msg)} رفت`;
    } else if (cmd === "play") {
      return `پخش را از ${formatTimestamp(msg)} شروع کرد`;
    } else if (cmd === "pause") {
      return `پخش را در ${formatTimestamp(msg)} متوقف کرد`;
    } else if (cmd === "playbackRate") {
      return `سرعت پخش را روی ${msg === "0" ? "خودکار" : `${msg}x`} گذاشت`;
    } else if (cmd === "lock") {
      return `اتاق را قفل کرد`;
    } else if (cmd === "unlock") {
      return "قفل اتاق را باز کرد";
    } else if (cmd === "vBrowserTimeout") {
      return (
        <React.Fragment>
          مرورگر مجازی به‌صورت خودکار متوقف شد.
          <br />
          برای زمان بیشتر اشتراک تهیه کنید.
        </React.Fragment>
      );
    } else if (cmd === "vBrowserAlmostTimeout") {
      return (
        <React.Fragment>
          مرورگر مجازی به‌زودی متوقف می‌شود.
          <br />
          برای زمان بیشتر اشتراک تهیه کنید.
        </React.Fragment>
      );
    }
    return cmd;
  };

  addEmoji = (emoji: any) => {
    this.setState({ chatMsg: this.state.chatMsg + emoji.native });
  };

  render() {
    return (
      <div
        className={`${styles.chatPanel} ${
          this.props.fullscreen ? styles.fullscreenPanel : ""
        } ${this.props.className || ""}`}
        style={{
          display: this.props.hide ? "none" : "flex",
        }}
      >
        <div
          className={styles.chatContainer}
          ref={this.messagesRef}
        >
          <div className={styles.messageList}>
            {this.props.chat.map((msg) => (
              <ChatMessage
                key={msg.timestamp + msg.id}
                className={
                  msg.id === this.state.reactionMenu.selectedMsgId &&
                  msg.timestamp === this.state.reactionMenu.selectedMsgTimestamp
                    ? styles.selected
                    : ""
                }
                message={msg}
                pictureMap={this.props.pictureMap}
                nameMap={this.props.nameMap}
                formatMessage={this.formatMessage}
                owner={this.props.owner}
                socket={this.props.socket}
                isChatDisabled={this.props.isChatDisabled}
                setReactionMenu={this.setReactionMenu}
                handleReactionClick={this.handleReactionClick}
                onReply={this.setReplyTo}
              />
            ))}
            {/* <div ref={this.messagesEndRef} /> */}
          </div>
          {!this.state.isNearBottom && (
            <Button
              size="xs"
              className={styles.jumpButton}
              onClick={this.scrollToBottom}
            >
              {t("jumpToBottom")}
            </Button>
          )}
        </div>
        {this.state.isPickerOpen && (
          <div className={styles.emojiPicker}>
            <Picker
              theme="dark"
              previewPosition="none"
              maxFrequentRows={1}
              onEmojiSelect={this.addEmoji}
              onClickOutside={() => this.setState({ isPickerOpen: false })}
            />
          </div>
        )}
        <CSSTransition
          in={this.state.reactionMenu.isOpen}
          timeout={300}
          classNames={{
            enter: styles["reactionMenu-enter"],
            enterActive: styles["reactionMenu-enter-active"],
            exit: styles["reactionMenu-exit"],
            exitActive: styles["reactionMenu-exit-active"],
          }}
          unmountOnExit
        >
          <div
            style={{
              position: "fixed",
              top: Math.min(
                this.state.reactionMenu.yPosition - 150,
                window.innerHeight - 450,
              ),
              left: this.state.reactionMenu.xPosition - 240,
            }}
          >
            <Picker
              theme="dark"
              previewPosition="none"
              maxFrequentRows={1}
              perLine={6}
              onClickOutside={() => this.setReactionMenu(false)}
              onEmojiSelect={(emoji: any) => {
                this.handleReactionClick(emoji.native);
                this.setReactionMenu(false);
              }}
            />
          </div>
          {/* <ReactionMenu
            handleReactionClick={this.handleReactionClick}
            closeMenu={() => this.setReactionMenu(false)}
            yPosition={this.state.reactionMenu.yPosition}
            xPosition={this.state.reactionMenu.xPosition}
          /> */}
        </CSSTransition>
        {this.state.replyTo && (
          <div className={styles.replyComposer}>
            <div className={`${styles.small} ${styles.light}`}>
              {t("replyingTo")}{" "}
              {this.props.nameMap[this.state.replyTo.id] || "کاربر"}
              {this.state.replyTo.msg ? (
                <div className={styles.replyPreview}>
                  {this.state.replyTo.msg}
                </div>
              ) : null}
            </div>
            <Button
              size="xs"
              variant="subtle"
              leftSection={<IconCornerDownLeft size={15} />}
              onClick={this.clearReplyTo}
            >
              {t("cancel")}
            </Button>
          </div>
        )}
        <div className={styles.composer}>
          <TextInput
            ref={this.chatInputRef}
            className={styles.composerInput}
            onKeyDown={(e: any) => e.key === "Enter" && this.sendChatMsg()}
            onChange={this.updateChatMsg}
            value={this.state.chatMsg}
            error={this.chatTooLong()}
            disabled={this.props.isChatDisabled}
            placeholder={
              this.props.isChatDisabled
                ? t("chatDisabled")
                : t("messagePlaceholder")
            }
            rightSection={
              <ActionIcon
                aria-label={t("emoji")}
                variant="subtle"
                onClick={() => {
                  const curr = this.state.isPickerOpen;
                  setTimeout(() => this.setState({ isPickerOpen: !curr }), 100);
                }}
                disabled={this.props.isChatDisabled}
              >
                <IconMoodSmile size={18} />
              </ActionIcon>
            }
          />
          <ActionIcon
            className={styles.sendButton}
            aria-label={t("send")}
            onClick={this.sendChatMsg}
            disabled={this.props.isChatDisabled || !this.state.chatMsg}
          >
            <IconSend size={19} />
          </ActionIcon>
        </div>
      </div>
    );
  }
}

const ChatMessage = ({
  message,
  nameMap,
  pictureMap,
  formatMessage,
  socket,
  owner,
  isChatDisabled,
  setReactionMenu,
  handleReactionClick,
  onReply,
  className,
}: {
  message: ChatMessage;
  nameMap: StringDict;
  pictureMap: StringDict;
  formatMessage: (cmd: string, msg?: string) => React.ReactNode;
  socket: Socket;
  owner: string | undefined;
  isChatDisabled: boolean | undefined;
  setReactionMenu: (
    isOpen: boolean,
    selectedMsgId?: string,
    selectedMsgTimestamp?: string,
    yPosition?: number,
    xPosition?: number,
  ) => void;
  handleReactionClick: (value: string, id?: string, timestamp?: string) => void;
  onReply: (id: string, timestamp: string, msg?: string) => void;
  className: string;
}) => {
  const { user } = useContext(MetadataContext);
  const { id, timestamp, cmd, msg, system, isSub, reactions, videoTS } =
    message;
  const spellFull = 5; // the number of people whose names should be written out in full in the reaction popup
  const imageMsg = renderImageString(msg);
  return (
    <div
      className={`${styles.comment} ${className} ${
        message.replyToUserId === clientId ? styles.replyMessage : ""
      }`}
    >
      <div className={styles.commentBody}>
        <div
          className={styles.commentHeader}
        >
          <UserMenu
            displayName={nameMap[id] || id}
            timestamp={timestamp}
            socket={socket}
            userToManage={id}
            isChatMessage
            disabled={!Boolean(owner && owner === user?.uid)}
            trigger={
              <div
                style={{ cursor: "pointer", fontWeight: 800 }}
                title={isSub ? "WatchParty Plus subscriber" : ""}
                className={`${isSub ? styles.subscriber : styles.light} ${styles.hoverEffect}`}
              >
                {Boolean(system) && "System"}
                {nameMap[id] || id}
              </div>
            }
          />
          <div className={styles.small + " " + styles.dark}>
            <div title={new Date(timestamp).toLocaleDateString()}>
              {new Date(timestamp).toLocaleTimeString()}
              {Boolean(videoTS) && " @ "}
              {formatTimestamp(videoTS)}
            </div>
          </div>
        </div>
        <div className={styles.light + " " + styles.system}>
          {cmd && formatMessage(cmd, msg)}
        </div>
        {message.replyToUserId && (
          <HoverCard withinPortal={false} openDelay={120}>
            <HoverCard.Target>
              <div className={styles.replyInfo}>
                {`Replying to @${nameMap[message.replyToUserId] || "user"}: `}
                {truncateReply(message.replyToMsg, 30)}
              </div>
            </HoverCard.Target>
            <HoverCard.Dropdown className={styles.replyTooltip}>
              {message.replyToMsg || ""}
            </HoverCard.Dropdown>
          </HoverCard>
        )}
        <Linkify
          componentDecorator={(
            decoratedHref: string,
            decoratedText: string,
            key: string,
          ) => (
            <SecureLink href={decoratedHref} key={key}>
              {decoratedText}
            </SecureLink>
          )}
        >
          <div
            className={`${styles.messageText} ${
              isEmojiString(msg) ? styles.emoji : ""
            }`}
          >
            {!cmd && msg}
          </div>
        </Linkify>
        {imageMsg}
        <div className={styles.commentMenu}>
          {id && id !== clientId && (
            <ActionIcon
              onClick={() => onReply(id, timestamp, msg)}
              disabled={isChatDisabled}
              variant="subtle"
              aria-label={t("reply")}
            >
              <IconCornerDownLeft size={16} />
            </ActionIcon>
          )}
          <ActionIcon
            onClick={(e) => {
              //@ts-expect-error
              const viewportOffset = e.target.getBoundingClientRect();
              setTimeout(() => {
                setReactionMenu(
                  true,
                  id,
                  timestamp,
                  viewportOffset.top,
                  viewportOffset.right,
                );
              }, 100);
            }}
            disabled={isChatDisabled}
            variant="subtle"
            aria-label={t("emoji")}
          >
            <IconMoodSmile size={17} />
          </ActionIcon>
        </div>
        <TransitionGroup>
          {Object.keys(reactions ?? []).map((key) =>
            reactions?.[key].length ? (
              <CSSTransition
                key={key}
                timeout={200}
                classNames={{
                  enter: styles["reaction-enter"],
                  enterActive: styles["reaction-enter-active"],
                  exit: styles["reaction-exit"],
                  exitActive: styles["reaction-exit-active"],
                }}
                unmountOnExit
              >
                <HoverCard>
                  <HoverCard.Target>
                    <div
                      className={`${styles.reactionContainer} ${
                        reactions[key].includes(clientId)
                          ? styles.highlighted
                          : ""
                      }`}
                      onClick={() =>
                        handleReactionClick(key, message.id, message.timestamp)
                      }
                    >
                      <span
                        style={{
                          fontSize: 17,
                          position: "relative",
                          bottom: 1,
                        }}
                      >
                        {key}
                      </span>
                      <SwitchTransition>
                        <CSSTransition
                          key={key + "-" + reactions[key].length}
                          classNames={{
                            enter: styles["reactionCounter-enter"],
                            enterActive: styles["reactionCounter-enter-active"],
                            exit: styles["reactionCounter-exit"],
                            exitActive: styles["reactionCounter-exit-active"],
                          }}
                          addEndListener={(node, done) =>
                            node.addEventListener("transitionend", done, false)
                          }
                          unmountOnExit
                        >
                          <span
                            className={styles.reactionCounter}
                            style={{
                              color: "rgba(255, 255, 255, 0.85)",
                              marginLeft: 3,
                            }}
                          >
                            {reactions[key].length}
                          </span>
                        </CSSTransition>
                      </SwitchTransition>
                    </div>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    {`${reactions[key]
                      .slice(0, spellFull)
                      .map((id) => nameMap[id] || "Unknown")
                      .concat(
                        reactions[key].length > spellFull
                          ? [`${reactions[key].length - spellFull} more`]
                          : [],
                      )
                      .reduce(
                        (text, value, i, array) =>
                          text +
                          (i < array.length - 1 ? ", " : " and ") +
                          value,
                      )} reacted.`}
                  </HoverCard.Dropdown>
                </HoverCard>
              </CSSTransition>
            ) : null,
          )}
        </TransitionGroup>
      </div>
    </div>
  );
};

export const renderImageString = (
  input: string | undefined,
): React.ReactNode | null => {
  // If a valid image string, return an image
  let regex =
    /^https?:\/\/.*\/.*\.(png|gif|webp|jpeg|jpg|heic|heif|jfif)\??.*$/gim;
  if (String(input)?.match(regex)) {
    return <img style={{ maxWidth: "100%" }} src={input} />;
  }
  return null;
};

// class ReactionMenuInner extends React.Component<{
//   handleReactionClick: (value: string, id?: string, timestamp?: string) => void;
//   closeMenu: () => void;
//   yPosition: number;
//   xPosition: number;
// }> {
//   state = {
//     containerWidth: 0,
//   };
//   handleClickOutside = () => {
//     this.props.closeMenu();
//   };
//   containerRef = React.createRef<HTMLDivElement>();
//   componentDidMount() {
//     this.setState({ containerWidth: this.containerRef.current?.offsetWidth });
//   }
//   render() {
//     return (
//       <div
//         ref={this.containerRef}
//         className={styles.reactionMenuContainer}
//         style={{
//           top: this.props.yPosition - 9,
//           left: this.props.xPosition - this.state.containerWidth - 35,
//         }}
//       >
//         {reactionEmojis.map((reaction) => (
//           <div
//             onClick={() => {
//               this.props.handleReactionClick(reaction);
//               this.props.closeMenu();
//             }}
//             style={{ cursor: 'pointer' }}
//           >
//             {reaction}
//           </div>
//         ))}
//       </div>
//     );
//   }
// }
// const ReactionMenu = onClickOutside(ReactionMenuInner);
