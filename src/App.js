import React from 'react';
import { Button, Grid, Segment, Divider, Select, Dimmer, Loader, Header, Label, Card, Input, Icon, List, Comment, Progress, Dropdown, Message } from 'semantic-ui-react'
import './App.css';
// import { v4 as uuidv4 } from 'uuid';
import querystring from 'querystring';
import { generateName } from './generateName';

const serverPath = process.env.REACT_APP_SERVER_HOST || `${window.location.protocol}//${window.location.hostname}${process.env.NODE_ENV === 'production' ? '' : ':8080'}`;
const mediaList = process.env.REACT_APP_MEDIA_LIST || 'https://dev.howardchung.net/' || `https://gitlab.com/api/v4/projects/howardchung%2Fmedia/repository/tree`;
const mediaPath = process.env.REACT_APP_MEDIA_PATH || 'https://dev.howardchung.net/' || `https://glcdn.githack.com/howardchung/media/-/raw/master/`;
      
export default class App extends React.Component {
  state = {
    state: 'init',
    watchOptions: [],
    currentMedia: '',
    currentMediaPaused: false,
    participants: [],
    chat: [],
    tsMap: {},
    nameMap: {},
    chatMsg: '',
    myName: '',
    loading: true,
  };
  videoRefs = {};
  socket = null;
  messagesRef = React.createRef();
  messagesEndRef = React.createRef();
  watchPartyYTPlayer = null;
  ytDebounce = true;
  videoInitTime = 0;

  async componentDidMount() {
    const canAutoplay = await testAutoplay();
    console.log(canAutoplay);
    if (canAutoplay) {
      this.init();
    }
    // TODO video chat
    // TODO youtube, twitch, bring your own file
    // TODO playlists
    // TODO rewrite using ws
    // TODO last writer wins on sending desynced timestamps (use max?)
  }
  
  init = () => {
    this.setState({ state: 'started' }, () => {
      // Load UUID from url
      let roomId = '/default';
      let query = window.location.hash.substring(1);
      if (query) {
        roomId = '/' + query;
      }
  
      // 2. This code loads the IFrame Player API code asynchronously.
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
      window.onYouTubeIframeAPIReady = () => {
        this.watchPartyYTPlayer = new window.YT.Player('leftYt', {
          events: {
            onReady: () => {
              this.join(roomId);
              // this.watchPartyYTPlayer.playVideo();
            },
            onStateChange: (e) => {
              // console.log(this.ytDebounce, e.data, this.watchPartyYTPlayer.getVideoUrl());
              if (this.ytDebounce && ((e.data === window.YT.PlayerState.PLAYING && this.state.currentMediaPaused)
                  || (e.data === window.YT.PlayerState.PAUSED && !this.state.currentMediaPaused))) {
                this.ytDebounce = false;
                if (e.data === window.YT.PlayerState.PLAYING) {
                  this.socket.emit('CMD:play');
                  this.doPlay();
                } else {
                  this.socket.emit('CMD:pause');
                  this.doPause();
                }
                window.setTimeout(() => this.ytDebounce = true, 500);
              }
            }
          }
        });
      };
    });
  }
  
  join = async (roomId) => {
    const leftVideo = document.getElementById('leftVideo');
    leftVideo.onloadeddata = () => {
      const videoReadyTime = Number(new Date());
      const offset = videoReadyTime - this.videoInitTime;
      console.log('offset: ', offset);
      leftVideo.currentTime += (offset / 1000);
    };

    // this.setState({ state: 'watching' });
    const response = await window.fetch(mediaList);
    const data = await response.json();
    this.setState({ watchOptions: data.map(file => file.name) });
    
    const socket = window.io.connect(serverPath + roomId);
    this.socket = socket;
    socket.on('connect', () => {
      let userName = window.localStorage.getItem('watchparty-username');
      this.updateName(null, { value: userName || generateName()});
    });
    socket.on('REC:play', () => {
      this.doPlay();
    });
    socket.on('REC:pause', () => {
      this.doPause();
    });
    socket.on('REC:seek', (data) => {
      this.doSeek(data);
    });
    socket.on('REC:host', (data) => {
      const watchOptions = this.state.watchOptions;
      if (data.video && !this.state.watchOptions.includes(data.video)) {
        watchOptions.push(data.video);
      }
      this.setState({ currentMedia: data.video, currentMediaPaused: data.paused, watchOptions, loading: false }, () => {
        // Stop all players
        const leftVideo = document.getElementById('leftVideo');
        leftVideo.pause();
        this.watchPartyYTPlayer.stopVideo();

        // Start this video
        this.doSrc(data.video, data.videoTS);
        if (this.isVideo() && !data.paused) {
          this.doPlay();
        }
      });
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
      this.socket.emit('CMD:ts', this.getCurrentTime());
    });
  }
  
  getMediaType = () => {
    if (!this.state.currentMedia) {
      return '';
    }
    if (this.state.currentMedia.startsWith('https://www.youtube.com/')) {
      return 'youtube';
    }
    return 'video';
  }
  
  isYouTube = () => {
    return this.getMediaType() === 'youtube';
  }
  
  isVideo = () => {
    return this.getMediaType() === 'video';
  }
  
  getCurrentTime = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById('leftVideo');
      return leftVideo.currentTime;
    }
    if (this.isYouTube()) {
      return this.watchPartyYTPlayer.getCurrentTime();
    }
  }
  
  getDuration = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById('leftVideo');
      return leftVideo.duration;
    }
    if (this.isYouTube()) {
      return this.watchPartyYTPlayer.getDuration();
    }
  }
  
  isPaused = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById('leftVideo');
      return leftVideo.paused || leftVideo.ended;
    }
    if (this.isYouTube()) {
      return this.watchPartyYTPlayer.getPlayerState() === window.YT.PlayerState.PAUSED || this.watchPartyYTPlayer.getPlayerState() === window.YT.PlayerState.ENDED;
    }
  }
  
  isMuted = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById('leftVideo');
      return leftVideo.muted;
    }
    if (this.isYouTube()) {
      return this.watchPartyYTPlayer.isMuted();
    }
  }
  
  doSrc = async (src, time) => {
    console.log('doSrc', src, time);
    if (this.isVideo()) {
      const leftVideo = document.getElementById('leftVideo');
      leftVideo.src = mediaPath + src;
      leftVideo.currentTime = time;
      this.videoInitTime = Number(new Date());
    }
    if (this.isYouTube()) {
      let url = new window.URL(src);
      let videoId = querystring.parse(url.search.substring(1))['v'];
      // TODO weird media engagement index stuff, video might not start automatically
      // this.watchPartyYTPlayer.mute();
      this.watchPartyYTPlayer.loadVideoById(videoId, time);
    }
  }
  
  doPlay = async () => {
    this.setState({ currentMediaPaused: false }, async () => {
      if (this.isVideo()) {
        const leftVideo = document.getElementById('leftVideo');
        try {
          await leftVideo.play();
        }
        catch(e) {
          console.error(e);
          if (e instanceof window.DOMException && e.message.includes('play')) {
            console.log('failed to autoplay, muted');
            leftVideo.muted = true;
            leftVideo.play();
          }
        }
      }
      if (this.isYouTube()) {
        console.log('play');
        this.watchPartyYTPlayer.playVideo();
      }
    });
  }
  
  doPause = () => {
    this.setState({ currentMediaPaused: true }, async () => {
      if (this.isVideo()) {
        const leftVideo = document.getElementById('leftVideo');
        leftVideo.pause();
      }
      if (this.isYouTube()) {
        console.log('pause');
        this.watchPartyYTPlayer.pauseVideo();
      }
    });
  }
  
  doSeek = (time) => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById('leftVideo');
      leftVideo.currentTime = time;
    }
    if (this.isYouTube()) {
      this.watchPartyYTPlayer.seekTo(time, true);
    }
  }
  
  createRoom = () => {
    // get back the generated name, reload page with that URL
    this.socket.on('REC:createRoom', (data) => {
      const { name } = data;
      window.location.hash = '#' + name;
      window.location.reload();
    });
    this.socket.emit('CMD:createRoom');
  }

  togglePlay = () => {
    let shouldPlay = true;
    if (this.isVideo()) {
      const leftVideo = document.getElementById('leftVideo');
      shouldPlay = leftVideo.paused || leftVideo.ended;
    }
    else if (this.isYouTube()) {
      shouldPlay = this.watchPartyYTPlayer.getPlayerState() === window.YT.PlayerState.PAUSED || this.getCurrentTime() === this.getDuration();
    }
    if (shouldPlay) {
      this.socket.emit('CMD:play');
      this.doPlay();
    } else {
      this.socket.emit('CMD:pause');
      this.doPause();
    }
  }
  
  onSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const max = rect.width;
    const target = x / max * this.getDuration();
    if (this.isVideo()) {
      const leftVideo = document.getElementById('leftVideo');
      leftVideo.currentTime = target;
    }
    if (this.isYouTube()) {
      this.watchPartyYTPlayer.seekTo(target);
    }
    this.socket.emit('CMD:seek', target);
  }
  
  fullScreen = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById('leftVideo');
      leftVideo.requestFullscreen();
    }
    if (this.isYouTube()) {
      const leftYt = document.getElementById(('leftYt'));
      leftYt.requestFullscreen();
    }
  }
  
  toggleMute = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById('leftVideo');
      leftVideo.muted = !leftVideo.muted;
    }
    if (this.isYouTube()) {
      this.watchPartyYTPlayer.isMuted() ? this.watchPartyYTPlayer.unMute() : this.watchPartyYTPlayer.mute();
    }
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
    // this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    this.messagesRef.current.scrollTop = this.messagesRef.current.scrollHeight;
  }

  render() {
    return (
        <React.Fragment>
        <div style={{ display: 'flex' }}>
          <a href="/" style={{ display: 'flex', marginLeft: '1em', marginTop: '10px' }}>
              <div style={{ height: '85px', width: '85px', position: 'relative' }}>
                <Icon inverted name="film" size="big" circular color="blue" style={{ position: 'absolute' }} />
                <Icon inverted name="group" size="big" circular color="green" style={{ position: 'absolute', right: 0, bottom: 0 }} />
              </div>
              <Header inverted style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }} as='h1' color="blue">Watch</Header>
              <Header inverted style={{ textTransform: 'uppercase', letterSpacing: '2px'  }} as='h1' color="green">Party</Header>
          </a>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', marginRight: '1em' }}>
            <Button inverted primary size="large" icon labelPosition="left" onClick={this.createRoom}><Icon name='certificate' />Create New Room</Button>
          </div>
        </div>
        <Divider inverted horizontal>
          <Header inverted as='h4'>
            <Icon name='film' />
            Watch videos with your friends!
          </Header>
        </Divider>
        <Grid stackable celled='internally' style={{ height: '100vh' }}>
          <Grid.Row>
          <Grid.Column width={11}>
            { this.state.state === 'init' && <div style={{ display: 'flex', justifyContent: 'center' }}><Button inverted primary size="huge" onClick={this.init} icon labelPosition="left"><Icon name="sign-in" />Join Party</Button></div> }
            { this.state.state !== 'init' && <React.Fragment>
            <Dropdown
              // icon='film'
              // className='icon'
              // labeled
              button
              fluid
              search
              allowAdditions
              selection
              selectOnBlur={false}
              placeholder="Enter YouTube URL or pick an option"
              onAddItem={(e, {value}) => this.setState({ watchOptions: [...this.state.watchOptions, value] })}
              onChange={this.setMedia}
              value={this.state.currentMedia}
              options={this.state.watchOptions.map(option => ({ key: option, text: option, value: option }))}
            />
            <Segment inverted style={{ position: 'relative' }}>
              <Grid columns={2}>
                <Grid.Column>
                <Header inverted as='h4' style={{ textTransform: 'uppercase', marginRight: '20px', wordBreak: 'break-all' }}>Now Watching: {this.state.currentMedia}</Header>
                </Grid.Column>
                <Grid.Column>
                <List inverted horizontal style={{ marginLeft: '20px' }}>
                  {this.state.participants.map((participant) => {
                    return <List.Item>
                      <Label as='a' color={getColor(participant.id)} image>
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
              <Divider inverted vertical>With</Divider>
            </Segment>
            { (this.state.loading || !this.state.currentMedia) && <Segment inverted style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              { this.state.loading && 
              <Dimmer active>
                <Loader />
              </Dimmer>
              }
              { !this.state.loading && !this.state.currentMedia && <Message
                inverted
                color="yellow"
                icon='hand point up'
                header="You're not watching anything!"
                content='Pick something to watch from the menu above.'
              />
              }
            </Segment> }
            <div className="auto-resizable-iframe" style={{ display: this.isYouTube() ? 'block' : 'none' }}>
              <div>
                <iframe
                  title="YouTube"
                  id="leftYt"
                  allowFullScreen
                  frameBorder="0"
                  src="https://www.youtube.com/embed/?enablejsapi=1&controls=0&rel=0"
                />
              </div>
            </div>
            <div style={{ display: this.isVideo() ? 'block' : 'none' }}>
              <video
                tabIndex="1"
                onClick={this.togglePlay}
                style={{ width: '100%', minHeight: '400px' }}
                id="leftVideo"
                playsInline
                type="video/mp4"
              >
              </video>
            </div>
            { this.state.currentMedia && <Controls
              togglePlay={this.togglePlay}
              onSeek={this.onSeek}
              fullScreen={this.fullScreen}
              toggleMute={this.toggleMute}
              paused={this.isPaused()}
              muted={this.isMuted()}
              currentTime={this.getCurrentTime()}
              duration={this.getDuration()}
            />
            }
          </React.Fragment> }
        </Grid.Column>
        <Grid.Column width={5} style={{ display: 'flex', flexDirection: 'column' }}>
          <Input
            inverted
            fluid
            label={'My name is:'}
            value={this.state.myName}
            onChange={this.updateName}
            icon={<Icon onClick={() => this.updateName(null, { value: generateName() })}
              name='refresh'
              inverted
              circular
              link />
            }
          />
          <Segment inverted style={{ display: 'flex', flexDirection: 'column', width: '100%', flexGrow: '1' }}>
            <div className="chatContainer" ref={this.messagesRef}>
              <Comment.Group>
                {this.state.chat.map(msg => <ChatMessage {...msg} nameMap={this.state.nameMap} />)}
                { /* <div ref={this.messagesEndRef} /> */ }
              </Comment.Group>
            </div>
            <Input
              inverted
              fluid
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
      </React.Fragment>
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

class Controls extends React.Component {
  state = { showTimestamp: false, currTimestamp: 0, posTimestamp: 0 }
  
  onMouseOver = () => {
    // console.log('mouseover');
    this.setState({ showTimestamp: true });
  }
  
  onMouseOut = () => {
    // console.log('mouseout');
    this.setState({ showTimestamp: false });
  }
  
  onMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const max = rect.width;
    const pct = x / max;
    // console.log(x, max);
    const target = pct * this.props.duration;
    // console.log(pct);
    this.setState({ currTimestamp: target, posTimestamp: pct });
  }
  
  render() {
    const { togglePlay, onSeek, fullScreen, toggleMute, paused, muted, currentTime, duration } = this.props;
    return <div className="controls">
      <Icon size="large" bordered onClick={togglePlay} className="control action" name={ paused ? 'play' : 'pause' } />
      <div className="control">{formatTimestamp(currentTime)}</div>
      <Progress
        size="tiny"
        color="blue"
        onClick={onSeek}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
        onMouseMove={this.onMouseMove}
        className="control action"
        inverted
        style={{ flexGrow: 1, marginTop: 0, marginBottom: 0, position: 'relative' }}
        value={currentTime}
        total={duration}
        active
      >
        {this.state.showTimestamp && <div style={{ position: 'absolute', bottom: '0px', left: `calc(${this.state.posTimestamp * 100 + '% - 27px'})`, pointerEvents: 'none' }}>
          <Label basic color="blue" pointing="below" >
            <div style={{ width: '34px' }}>{formatTimestamp(this.state.currTimestamp)}</div>
          </Label>
        </div>}
      </Progress>
      <div className="control">{formatTimestamp(duration)}</div>
      <Icon size="large" bordered onClick={fullScreen} className="control action" name='expand' />
      <Icon size="large" bordered onClick={toggleMute} className="control action" name={muted ? 'volume off' : 'volume up' } />
    </div>;
  }
}

function formatMessage(cmd, msg) {
  if (cmd === 'host') {
    return `changed the video to ${msg}`;
  }
  else if (cmd === 'seek') {
    return `jumped to ${formatTimestamp(msg)}`;
  }
  else if (cmd === 'play') {
    return `started the video at ${formatTimestamp(msg)}`;
  }
  else if (cmd === 'pause') {
    return `paused the video at ${formatTimestamp(msg)}`;
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
  const getFbPhoto = (fbId) => `https://graph.facebook.com/${fbId}/picture?type=square`;
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
  else if (lower === 'yvonne' || lower === 'eve') {
    return getFbPhoto('1417572343');
  }
  return '/logo192.png';
}

async function testAutoplay() {
  const video = document.createElement('video');
  video.src = 'https://www.w3schools.com/tags/movie.ogg';
  // document.body.appendChild(video);
  try {
    await video.play();
  } catch(e) {
    console.log(e);
    return false;
  }
  // TODO remove the element
  video.pause();
  return true;
}