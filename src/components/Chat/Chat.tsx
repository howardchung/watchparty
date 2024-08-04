import React, { RefObject, useContext } from 'react';
import { Button, Comment, Form, Icon, Input, Popup } from 'semantic-ui-react';
// import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { init } from 'emoji-mart';
// import onClickOutside from 'react-onclickoutside';
//@ts-ignore
import Linkify from 'react-linkify';
import { SecureLink } from 'react-secure-link';
import styles from './Chat.module.css';

import {
  formatTimestamp,
  getColorForStringHex,
  getDefaultPicture,
  isEmojiString,
} from '../../utils';
import { Separator } from '../App/App';
import { UserMenu } from '../UserMenu/UserMenu';
import { Socket } from 'socket.io-client';
import firebase from 'firebase/compat/app';
import classes from './Chat.module.css';
import {
  CSSTransition,
  SwitchTransition,
  TransitionGroup,
} from 'react-transition-group';
import { MetadataContext } from '../../MetadataContext';

interface ChatProps {
  chat: ChatMessage[];
  nameMap: StringDict;
  pictureMap: StringDict;
  socket: Socket;
  scrollTimestamp: number;
  className?: string;
  getMediaDisplayName: (input: string) => string;
  hide?: boolean;
  isChatDisabled?: boolean;
  owner: string | undefined;
  ref: RefObject<Chat>;
  isLiveStream: boolean;
}

export class Chat extends React.Component<ChatProps> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  public state = {
    chatMsg: '',
    isNearBottom: true,
    isPickerOpen: false,
    reactionMenu: {
      isOpen: false,
      selectedMsgId: '',
      selectedMsgTimestamp: '',
      yPosition: 0,
      xPosition: 0,
    },
  };
  messagesRef = React.createRef<HTMLDivElement>();

  async componentDidMount() {
    this.scrollToBottom();
    this.messagesRef.current?.addEventListener('scroll', this.onScroll);
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
    if (msg?.reactions?.[value].includes(this.props.socket.id)) {
      this.props.socket.emit('CMD:removeReaction', data);
    } else {
      this.props.socket.emit('CMD:addReaction', data);
    }
  };

  updateChatMsg = (_e: any, data: { value: string }) => {
    // console.log(e.target.selectionStart);
    this.setState({ chatMsg: data.value });
  };

  sendChatMsg = () => {
    if (!this.state.chatMsg) {
      return;
    }
    if (this.chatTooLong()) {
      return;
    }
    this.setState({ chatMsg: '' });
    this.props.socket.emit('CMD:chat', this.state.chatMsg);
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
        100
    );
  };

  scrollToBottom = () => {
    if (this.messagesRef.current) {
      this.messagesRef.current.scrollTop =
        this.messagesRef.current.scrollHeight;
    }
  };

  formatMessage = (cmd: string, msg: string): React.ReactNode | string => {
    if (cmd === 'host') {
      return (
        <React.Fragment>
          {`changed the video to `}
          <span style={{ textTransform: 'initial' }}>
            {this.props.getMediaDisplayName(msg)}
          </span>
        </React.Fragment>
      );
    } else if (cmd === 'playlistAdd') {
      return (
        <React.Fragment>
          {`added to the playlist: `}
          <span style={{ textTransform: 'initial' }}>
            {this.props.getMediaDisplayName(msg)}
          </span>
        </React.Fragment>
      );
    } else if (cmd === 'seek') {
      return `jumped to ${
        this.props.isLiveStream
          ? formatTimestamp(msg, true)
          : formatTimestamp(msg)
      }`;
    } else if (cmd === 'play') {
      return `started the video at ${formatTimestamp(msg)}`;
    } else if (cmd === 'pause') {
      return `paused the video at ${formatTimestamp(msg)}`;
    } else if (cmd === 'playbackRate') {
      return `set the playback rate to ${msg === '0' ? 'auto' : `${msg}x`}`;
    } else if (cmd === 'lock') {
      return `locked the room`;
    } else if (cmd === 'unlock') {
      return 'unlocked the room';
    } else if (cmd === 'vBrowserTimeout') {
      return (
        <React.Fragment>
          The VBrowser shut down automatically.
          <br />
          Subscribe for longer sessions.
        </React.Fragment>
      );
    } else if (cmd === 'vBrowserAlmostTimeout') {
      return (
        <React.Fragment>
          The VBrowser will shut down soon.
          <br />
          Subscribe for longer sessions.
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
        className={this.props.className}
        style={{
          display: this.props.hide ? 'none' : 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: 0,
          marginTop: 0,
          marginBottom: 0,
          padding: '8px',
        }}
      >
        <div
          className={styles.chatContainer}
          ref={this.messagesRef}
          style={{ position: 'relative', paddingTop: 13 }}
        >
          <Comment.Group>
            {this.props.chat.map((msg) => (
              <ChatMessage
                key={msg.timestamp + msg.id}
                className={
                  msg.id === this.state.reactionMenu.selectedMsgId &&
                  msg.timestamp === this.state.reactionMenu.selectedMsgTimestamp
                    ? classes.selected
                    : ''
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
              />
            ))}
            {/* <div ref={this.messagesEndRef} /> */}
          </Comment.Group>
          {!this.state.isNearBottom && (
            <Button
              size="tiny"
              onClick={this.scrollToBottom}
              style={{
                position: 'sticky',
                bottom: 0,
                display: 'block',
                margin: '0 auto',
              }}
            >
              Jump to bottom
            </Button>
          )}
        </div>
        <Separator />
        {this.state.isPickerOpen && (
          <div style={{ position: 'absolute', bottom: '60px' }}>
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
            enter: classes['reactionMenu-enter'],
            enterActive: classes['reactionMenu-enter-active'],
            exit: classes['reactionMenu-exit'],
            exitActive: classes['reactionMenu-exit-active'],
          }}
          unmountOnExit
        >
          <div
            style={{
              position: 'fixed',
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
        <Form autoComplete="off">
          <Input
            inverted
            fluid
            onKeyPress={(e: any) => e.key === 'Enter' && this.sendChatMsg()}
            onChange={this.updateChatMsg}
            value={this.state.chatMsg}
            error={this.chatTooLong()}
            icon
            disabled={this.props.isChatDisabled}
            placeholder={
              this.props.isChatDisabled
                ? 'The chat was disabled by the room owner.'
                : 'Enter a message...'
            }
          >
            <input />
            <Icon
              // style={{ right: '40px' }}
              onClick={() => {
                // Add a delay to prevent the click from triggering onClickOutside
                const curr = this.state.isPickerOpen;
                setTimeout(() => this.setState({ isPickerOpen: !curr }), 100);
              }}
              name={undefined}
              inverted
              circular
              link
              disabled={this.props.isChatDisabled}
              style={{ opacity: 1 }}
            >
              <span role="img" aria-label="Emoji">
                😀
              </span>
            </Icon>
            {/* <Icon onClick={this.sendChatMsg} name="send" inverted circular link /> */}
          </Input>
        </Form>
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
  className,
}: {
  message: ChatMessage;
  nameMap: StringDict;
  pictureMap: StringDict;
  formatMessage: (cmd: string, msg: string) => React.ReactNode;
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
  className: string;
}) => {
  const { user } = useContext(MetadataContext);
  const { id, timestamp, cmd, msg, system, isSub, reactions, videoTS } =
    message;
  const spellFull = 5; // the number of people whose names should be written out in full in the reaction popup
  return (
    <Comment className={`${classes.comment} ${className}`}>
      {id ? (
        <Popup
          content="WatchParty Plus subscriber"
          disabled={!isSub}
          trigger={
            <Comment.Avatar
              className={isSub ? classes.subscriber : ''}
              src={
                pictureMap[id] ||
                getDefaultPicture(nameMap[id], getColorForStringHex(id))
              }
            />
          }
        />
      ) : null}
      <Comment.Content>
        <UserMenu
          displayName={nameMap[id] || id}
          timestamp={timestamp}
          socket={socket}
          userToManage={id}
          isChatMessage
          disabled={!Boolean(owner && owner === user?.uid)}
          trigger={
            <Comment.Author as="a" className={styles.light}>
              {Boolean(system) && 'System'}
              {nameMap[id] || id}
            </Comment.Author>
          }
        />
        <Comment.Metadata className={styles.dark}>
          <div title={new Date(timestamp).toLocaleDateString()}>
            {new Date(timestamp).toLocaleTimeString()}
            {Boolean(videoTS) && ' @ '}
            {formatTimestamp(videoTS)}
          </div>
        </Comment.Metadata>
        <Comment.Text className={styles.light + ' ' + styles.system}>
          {cmd && formatMessage(cmd, msg)}
        </Comment.Text>
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
          <Comment.Text
            className={`${styles.light} ${
              isEmojiString(msg) ? styles.emoji : ''
            }`}
          >
            {!cmd && msg}
          </Comment.Text>
        </Linkify>
        <div className={classes.commentMenu}>
          <Icon
            onClick={(e: MouseEvent) => {
              const viewportOffset = (e.target as any).getBoundingClientRect();
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
            name={undefined}
            inverted
            link
            disabled={isChatDisabled}
            style={{
              opacity: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10,
              margin: 0,
            }}
          >
            <span
              role="img"
              aria-label="React"
              style={{ margin: 0, fontSize: 18 }}
            >
              😀
            </span>
          </Icon>
        </div>
        <TransitionGroup>
          {Object.keys(reactions ?? []).map((key) =>
            reactions?.[key].length ? (
              <CSSTransition
                key={key}
                timeout={200}
                classNames={{
                  enter: classes['reaction-enter'],
                  enterActive: classes['reaction-enter-active'],
                  exit: classes['reaction-exit'],
                  exitActive: classes['reaction-exit-active'],
                }}
                unmountOnExit
              >
                <Popup
                  content={`${reactions[key]
                    .slice(0, spellFull)
                    .map((id) => nameMap[id] || 'Unknown')
                    .concat(
                      reactions[key].length > spellFull
                        ? [`${reactions[key].length - spellFull} more`]
                        : [],
                    )
                    .reduce(
                      (text, value, i, array) =>
                        text + (i < array.length - 1 ? ', ' : ' and ') + value,
                    )} reacted.`}
                  offset={[0, 6]}
                  trigger={
                    <div
                      className={`${classes.reactionContainer} ${
                        reactions[key].includes(socket.id)
                          ? classes.highlighted
                          : ''
                      }`}
                      onClick={() =>
                        handleReactionClick(key, message.id, message.timestamp)
                      }
                    >
                      <span
                        style={{
                          fontSize: 17,
                          position: 'relative',
                          bottom: 1,
                        }}
                      >
                        {key}
                      </span>
                      <SwitchTransition>
                        <CSSTransition
                          key={key + '-' + reactions[key].length}
                          classNames={{
                            enter: classes['reactionCounter-enter'],
                            enterActive:
                              classes['reactionCounter-enter-active'],
                            exit: classes['reactionCounter-exit'],
                            exitActive: classes['reactionCounter-exit-active'],
                          }}
                          addEndListener={(node, done) =>
                            node.addEventListener('transitionend', done, false)
                          }
                          unmountOnExit
                        >
                          <span
                            className={classes.reactionCounter}
                            style={{
                              color: 'rgba(255, 255, 255, 0.85)',
                              marginLeft: 3,
                            }}
                          >
                            {reactions[key].length}
                          </span>
                        </CSSTransition>
                      </SwitchTransition>
                    </div>
                  }
                />
              </CSSTransition>
            ) : null,
          )}
        </TransitionGroup>
      </Comment.Content>
    </Comment>
  );
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
//         className={classes.reactionMenuContainer}
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
