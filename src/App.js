import React from 'react';
import { Button, Grid, Segment, Divider, Select, Dimmer, Loader, Header, Label, Card, Input, Icon, List, Comment, Progress } from 'semantic-ui-react'
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import querystring from 'querystring';
import { generateName } from './generateName';

const port = process.env.REACT_APP_SERVER_PORT || 8080;
const serverPath = process.env.REACT_APP_SERVER_HOST || `http://${window.location.hostname}:${port}/`;
const mediaPath = process.env.REACT_APP_MEDIA_PATH || `http://${window.location.hostname}:${port}/media/`;

export default class App extends React.Component {
  state = {
    state: 'init',
    watchOptions: [],
    currentMedia: '',
    participants: [],
    chat: [],
    tsMap: {},
    nameMap: {},
    chatMsg: '',
    myName: '',
  };
  videoRefs = {};
  uuid = null;
  socket = null;
  isProgrammatic = false;
  messagesEndRef = React.createRef();

  componentDidMount() {
    // Load UUID from url
    let query = window.location.hash.substring(1);
    if (query) {
      this.uuid = query;
    }
    this.join();
    // TODO video chat
    // TODO host/join, multiple rooms support
    // TODO youtube, twitch, bring your own file
    // TODO playlists
  }
  
  join = async () => {
    this.setState({ state: 'watching' });
    
    const response = await window.fetch(mediaPath);
    const data = await response.json();
    this.setState({ watchOptions: data });
    
    const leftVideo = document.getElementById('leftVideo');

    var socket = window.io.connect(serverPath);
    this.socket = socket;
    
    socket.on('connect', () => {
      let userName = window.localStorage.getItem('watchparty-username');
      this.updateName(null, { value: userName || generateName()});
    });
    socket.on('REC:play', function (data) {
      leftVideo.play();
    });
    socket.on('REC:pause', () => {
      leftVideo.pause();
    });
    socket.on('REC:host', async (data) => {
      leftVideo.src = mediaPath + data.video;
      leftVideo.currentTime = data.videoTS;
      try {
        await leftVideo.play();
      } catch(e) {
        console.error(e);
        console.log('failed to autoplay, muted');
        leftVideo.muted = true;
        leftVideo.play();
      }
      this.setState({ currentMedia: data.video });
    });
    socket.on('REC:seek', (data) => {
      leftVideo.currentTime = data;
    });
    socket.on('REC:chat', (data) => {
      this.state.chat.push(data);
      this.setState({ chat: this.state.chat });
      this.scrollToBottom();
    });
    socket.on('REC:tsMap', (data) => {
      this.setState({ tsMap: data });
    });
    socket.on('REC:nameMap', (data) => {
      this.setState({ nameMap: data });
    });
    socket.on('roster', (data) => {
      this.setState({ participants: data }); 
    });
    socket.on('chatinit', (data) => {
      this.setState({ chat: data });
      this.scrollToBottom();
    });
    window.setInterval(() => {
      this.socket.emit('CMD:ts', leftVideo.currentTime);
    }, 1000);
  }

  togglePlay = () => {
    const leftVideo = document.getElementById('leftVideo');
    this.socket.emit(leftVideo.paused || leftVideo.ended ? 'CMD:play' : 'CMD:pause');
    leftVideo.paused || leftVideo.ended ? leftVideo.play() : leftVideo.pause();
  }
  
  seek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const max = rect.width;
    const leftVideo = document.getElementById('leftVideo');
    leftVideo.currentTime = x / max * leftVideo.duration;
    this.socket.emit('CMD:seek', leftVideo.currentTime);
  }
  
  fullScreen = () => {
    const leftVideo = document.getElementById('leftVideo');
    leftVideo.requestFullscreen();
  }
  
  toggleMute = () => {
    const leftVideo = document.getElementById('leftVideo');
    leftVideo.muted = !leftVideo.muted;
  }
  
  setMedia = (e, data) => {
    this.socket.emit('CMD:host', data.value);
  }
  
  updateChatMsg = (e, data) => {
    this.setState({ chatMsg: data.value });
  }
  
  sendChatMsg = () => {
    if (!this.state.chatMsg) {
      return;
    }
    this.setState({ chatMsg: '' });
    this.socket.emit('CMD:chat', this.state.chatMsg);
  }
  
  updateName = (e, data) => {
    this.setState({ myName: data.value });
    this.socket.emit('CMD:name', data.value);
    window.localStorage.setItem('watchparty-username', data.value);
  }
  
  scrollToBottom = () => {
    // TODO dont do if user manually scrolled up
    this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  render() {
    const leftVideo = document.getElementById('leftVideo');
    return (
        <Grid stackable celled='internally' style={{ height: '100vh' }}>
          <Grid.Row>
            <Grid.Column>
              <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ height: '85px', width: '85px', position: 'relative' }}>
                <Icon inverted name="film" size="big" circular color="blue" style={{ position: 'absolute' }} />
                <Icon inverted name="group" size="big" circular color="green" style={{ position: 'absolute', right: 0, bottom: 0 }} />
              </div>
              <Header inverted style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }} as='h1' color="blue">Watch</Header>
              <Header inverted style={{ textTransform: 'uppercase', letterSpacing: '2px'  }} as='h1' color="green">Party</Header>
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
          <Grid.Column width={11}>
            <Segment inverted>
            <Header inverted as='h4' style={{ textTransform: 'uppercase' }}>Now Watching: {this.state.currentMedia}</Header>
            <Select inverted onChange={this.setMedia} value={this.state.currentMedia} options={this.state.watchOptions.map(option => ({ key: option, text: option, value: option }))}>
            </Select>
            </Segment>
            <div>
            <video
              tabIndex="1"
              onClick={this.togglePlay}
              style={{ width: '100%', minHeight: '400px' }}
              id="leftVideo"
              playsInline
              type="video/mp4"
            >
            </video>
            { leftVideo &&
            <div className="controls">
              <Icon onClick={this.togglePlay} className="control action" name={ leftVideo.paused || leftVideo.ended ? 'play' : 'pause' } />
              <div className="control system">{formatTimestamp(leftVideo.currentTime)}</div>
              <Progress size="tiny" color="blue" onClick={this.seek} className="control action" inverted style={{ flexGrow: 1, marginTop: 0, marginBottom: 0 }} value={leftVideo.currentTime} total={leftVideo.duration} active />
              <div className="control system">{formatTimestamp(leftVideo.duration)}</div>
              <Icon onClick={this.fullScreen} className="control action" name='expand' />
              <Icon onClick={this.toggleMute} className="control action" name={leftVideo.muted ? 'volume off' : 'volume up' } />
            </div> }
            </div>
            <Segment inverted>
              <Grid stackable celled="internally">
              <Grid.Column width={8}>
              <Input inverted label={'My name is:'} value={this.state.myName} onChange={this.updateName} icon={<Icon onClick={() => this.updateName(null, { value: generateName() })} name='refresh' inverted circular link />} />
              </Grid.Column>
              <Grid.Column width={8}>
              <Header inverted as='h3'>Partiers</Header>
              <List inverted>
                {this.state.participants.map((participant) => {
                  return <List.Item>
                    <Label inverted as='a' color={getColor(participant.id)} image>
                      <img src={getImage(this.state.nameMap[participant.id] || participant.id)} alt="" />
                      {this.state.nameMap[participant.id] || participant.id}
                      <Label.Detail>{formatTimestamp(this.state.tsMap[participant.id] || 0)}</Label.Detail>
                    </Label>
                    {/* <video ref={el => {this.videoRefs[participant] = el}} style={{ width: '100%', height: '100%' }} autoPlay playsInline></video> */}
                    </List.Item>;
                })}
              </List>
              </Grid.Column>
              </Grid>
            </Segment>
          </Grid.Column>
        
        <Grid.Column width={5} style={{ display: 'flex' }}>
          <Segment inverted style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div className="chatContainer">
              <Comment.Group>
                {this.state.chat.map(msg => <ChatMessage {...msg} nameMap={this.state.nameMap} />)}
                <div ref={this.messagesEndRef} />
              </Comment.Group>
            </div>
            <Input
              style={{ width: '100%' }}
              inverted
              onKeyPress={(e) => e.key === 'Enter' && this.sendChatMsg()} 
              onChange={this.updateChatMsg}
              value={this.state.chatMsg}
              icon={<Icon onClick={this.sendChatMsg} name='send' inverted circular link />}
              placeholder='Enter a message...'
            />
          </Segment>
        </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

const ChatMessage = ({ id, timestamp, cmd, msg, nameMap }) => {
    return <Comment>
      <Comment.Avatar src={getImage(nameMap[id])} />
      <Comment.Content>
        <Comment.Author as='a' className="white">{nameMap[id] || id}</Comment.Author>
        <Comment.Metadata className="lightgray">
          <div>{new Date(timestamp).toLocaleTimeString()}</div>
        </Comment.Metadata>
        <Comment.Text className="lightgray system">{ cmd && formatMessage(cmd, msg)}</Comment.Text>
        <Comment.Text className="white">{ !cmd && msg}</Comment.Text>
      </Comment.Content>
    </Comment>;
};

function formatMessage(cmd, msg) {
  if (cmd === 'host') {
    return `changed the video to ${msg}`;
  }
  else if (cmd === 'seek') {
    return `jumped to ${formatTimestamp(msg)}`;
  }
  else if (cmd === 'play') {
    return `started the video`;
  }
  else if (cmd === 'pause') {
    return `paused the video`;
  }
  return cmd;
}

function formatTimestamp(input) {
  if (input === null || input === undefined || input === false || Number.isNaN(input)) {
    return '';
  }
  let minutes = Math.floor(input / 60);
  let seconds = Math.floor(input % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function hashString(input) {
  var hash = 0, i, chr;
    for (i = 0; i < input.length; i++) {
      chr   = input.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
  return hash;
}

let colorCache = {};
function getColor(id) {
  let colors = ['red','orange','yellow','olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown','grey'];
  if (colorCache[id]) {
    return colors[colorCache[id]];
  }
  colorCache[id] = Math.abs(hashString(id)) % colors.length;
  return colors[colorCache[id]];
}

function getImage(name) {
  const lower = (name || '').toLowerCase();
  const getFbPhoto = (fbId) => `http://graph.facebook.com/${fbId}/picture?type=square`;
  if (lower === 'howard') {
    return getFbPhoto('746929384');
  }
  else if (lower === 'vy') {
    return getFbPhoto('1005627144');
  }
  else if (lower === 'matt' || lower === 'hollar') {
    return getFbPhoto('1407126862');
  }
  else if (lower === 'al' || lower === 'allison' || lower === 'alacrity') {
    return getFbPhoto('100003885416987');
  }
  return '/logo192.png';
}