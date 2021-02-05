import React from 'react';
import { Button, Comment, Icon, Input } from 'semantic-ui-react';
import 'emoji-mart/css/emoji-mart.css';
import { EmojiData, Picker } from 'emoji-mart';
import onClickOutside from 'react-onclickoutside';

import {
  formatTimestamp,
  getColorForStringHex,
  getDefaultPicture,
} from '../../utils';
import { Separator } from '../App/App';

interface ChatProps {
  chat: ChatMessage[];
  nameMap: StringDict;
  pictureMap: StringDict;
  socket: SocketIOClient.Socket;
  scrollTimestamp: number;
  className?: string;
  getMediaDisplayName: Function;
  hide?: boolean;
  isChatDisabled?: boolean;
}

export class Chat extends React.Component<ChatProps> {
  public state = { chatMsg: '', isNearBottom: true, isPickerOpen: false };
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
      this.messagesRef.current.scrollTop = this.messagesRef.current.scrollHeight;
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
          Subscribe for sessions up to 12 hours.
        </React.Fragment>
      );
    } else if (cmd === 'vBrowserAlmostTimeout') {
      return (
        <React.Fragment>
          The VBrowser will shut down soon.
          <br />
          Subscribe for sessions up to 12 hours.
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
          style={{ position: 'relative' }}
        >
          <Comment.Group>
            {this.props.chat.map((msg) => (
              <ChatMessage
                key={msg.timestamp + msg.id}
                message={msg}
                pictureMap={this.props.pictureMap}
                nameMap={this.props.nameMap}
                formatMessage={this.formatMessage}
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
}: {
  message: ChatMessage;
  nameMap: StringDict;
  pictureMap: StringDict;
  formatMessage: (cmd: string, msg: string) => React.ReactNode;
}) => {
  const { id, timestamp, cmd, msg, system } = message;
  return (
    <Comment>
      {id ? (
        <Comment.Avatar
          src={
            pictureMap[id] ||
            getDefaultPicture(nameMap[id], getColorForStringHex(id))
          }
        />
      ) : null}
      <Comment.Content>
        <Comment.Author as="a" className="light">
          {Boolean(system) && 'System'}
          {nameMap[id] || id}
        </Comment.Author>
        <Comment.Metadata className="dark">
          <div>{new Date(timestamp).toLocaleTimeString()}</div>
        </Comment.Metadata>
        <Comment.Text className="light system">
          {cmd && formatMessage(cmd, msg)}
        </Comment.Text>
        <Comment.Text className="light">{!cmd && msg}</Comment.Text>
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
