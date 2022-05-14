import React, { RefObject } from 'react';
import { Button, Comment, Icon, Input, Popup } from 'semantic-ui-react';
import 'emoji-mart/css/emoji-mart.css';
import { EmojiData, Picker } from 'emoji-mart';
import onClickOutside from 'react-onclickoutside';
//@ts-ignore
import Linkify from 'react-linkify';
import { SecureLink } from 'react-secure-link';

import {
  formatTimestamp,
  getColorForStringHex,
  getDefaultPicture,
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

const reactionEmojis = Array.from('👍🧡😂😯😢😡');

interface ChatProps {
  chat: ChatMessage[];
  nameMap: StringDict;
  pictureMap: StringDict;
  socket: Socket;
  scrollTimestamp: number;
  className?: string;
  getMediaDisplayName: Function;
  hide?: boolean;
  isChatDisabled?: boolean;
  user: firebase.User | undefined;
  owner: string | undefined;
  ref: RefObject<Chat>;
}

export class Chat extends React.Component<ChatProps> {
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

  componentDidMount() {
    this.scrollToBottom();
    this.messagesRef.current?.addEventListener('scroll', this.onScroll);
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
    xPosition?: number
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

  handleReactionClick = (value: string, id: string, timestamp: string) => {
    const msg = this.props.chat.find(
      (m) => m.id === id && m.timestamp === timestamp
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
      return `jumped to ${formatTimestamp(msg)}`;
    } else if (cmd === 'play') {
      return `started the video at ${formatTimestamp(msg)}`;
    } else if (cmd === 'pause') {
      return `paused the video at ${formatTimestamp(msg)}`;
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

  addEmoji = (emoji: EmojiData) => {
    this.setState({ chatMsg: this.state.chatMsg + (emoji as any).native });
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
          className="chatContainer"
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
                user={this.props.user}
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
          <PickerMenu
            addEmoji={this.addEmoji}
            closeMenu={() => this.setState({ isPickerOpen: false })}
          />
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
          <ReactionMenu
            handleReactionClick={this.handleReactionClick}
            closeMenu={() => this.setReactionMenu(false)}
            yPosition={this.state.reactionMenu.yPosition}
            xPosition={this.state.reactionMenu.xPosition}
          />
        </CSSTransition>
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
            onClick={() => this.setState({ isPickerOpen: true })}
            name={'' as any}
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
      </div>
    );
  }
}

const ChatMessage = ({
  message,
  nameMap,
  pictureMap,
  formatMessage,
  user,
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
  user: firebase.User | undefined;
  socket: Socket;
  owner: string | undefined;
  isChatDisabled: boolean | undefined;
  setReactionMenu: Function;
  handleReactionClick: Function;
  className: string;
}) => {
  const { id, timestamp, cmd, msg, system, isSub, reactions } = message;
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
          user={user}
          timestamp={timestamp}
          socket={socket}
          userToManage={id}
          isChatMessage
          disabled={!Boolean(owner && owner === user?.uid)}
          trigger={
            <Comment.Author as="a" className="light">
              {Boolean(system) && 'System'}
              {nameMap[id] || id}
            </Comment.Author>
          }
        />
        <Comment.Metadata className="dark">
          <div>{new Date(timestamp).toLocaleTimeString()}</div>
        </Comment.Metadata>
        <Comment.Text className="light system">
          {cmd && formatMessage(cmd, msg)}
        </Comment.Text>
        <Linkify
          componentDecorator={(
            decoratedHref: string,
            decoratedText: string,
            key: string
          ) => (
            <SecureLink href={decoratedHref} key={key}>
              {decoratedText}
            </SecureLink>
          )}
        >
          <Comment.Text className="light">{!cmd && msg}</Comment.Text>
        </Linkify>
        <div className={classes.commentMenu}>
          <Icon
            onClick={(e: MouseEvent) => {
              const viewportOffset = (e.target as any).getBoundingClientRect();
              setReactionMenu(
                true,
                id,
                timestamp,
                viewportOffset.top,
                viewportOffset.right
              );
            }}
            name={'' as any}
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
                        : []
                    )
                    .reduce(
                      (text, value, i, array) =>
                        text + (i < array.length - 1 ? ', ' : ' and ') + value
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
            ) : null
          )}
        </TransitionGroup>
      </Comment.Content>
    </Comment>
  );
};

class PickerMenuInner extends React.Component<{
  addEmoji: (emoji: EmojiData) => void;
  closeMenu: Function;
}> {
  handleClickOutside = () => {
    this.props.closeMenu();
  };
  render() {
    return (
      <div style={{ position: 'absolute', bottom: '60px' }}>
        <Picker
          set="google"
          sheetSize={64}
          theme="dark"
          showPreview={false}
          showSkinTones={false}
          onSelect={this.props.addEmoji}
        />
      </div>
    );
  }
}

const PickerMenu = onClickOutside(PickerMenuInner);

class ReactionMenuInner extends React.Component<{
  handleReactionClick: Function;
  closeMenu: Function;
  yPosition: number;
  xPosition: number;
}> {
  state = {
    containerWidth: 0,
  };
  handleClickOutside = () => {
    this.props.closeMenu();
  };
  containerRef = React.createRef<HTMLDivElement>();
  componentDidMount() {
    this.setState({ containerWidth: this.containerRef.current?.offsetWidth });
  }
  render() {
    return (
      <div
        ref={this.containerRef}
        className={classes.reactionMenuContainer}
        style={{
          top: this.props.yPosition - 9,
          left: this.props.xPosition - this.state.containerWidth - 35,
        }}
      >
        {reactionEmojis.map((reaction) => (
          <div
            onClick={() => {
              this.props.handleReactionClick(reaction);
              this.props.closeMenu();
            }}
            style={{ cursor: 'pointer' }}
          >
            {reaction}
          </div>
        ))}
      </div>
    );
  }
}
const ReactionMenu = onClickOutside(ReactionMenuInner);
