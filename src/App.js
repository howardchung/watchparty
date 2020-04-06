import React from 'react';
import { Button, Grid, Segment, Divider, Dimmer, Loader, Header, Label, Input, Icon, List, Comment, Progress, Dropdown, Message, Modal, Form, TextArea } from 'semantic-ui-react'
import './App.css';
// import { v4 as uuidv4 } from 'uuid';
import querystring from 'querystring';
import { generateName } from './generateName';
import VTTConverter from 'srt-webvtt';
import magnet from 'magnet-uri';

const serverPath = process.env.REACT_APP_SERVER_HOST || `${window.location.protocol}//${window.location.hostname}${process.env.NODE_ENV === 'production' ? '' : ':8080'}`;
const defaultMediaList = process.env.REACT_APP_MEDIA_LIST || 'https://dev.howardchung.net/';
const searchPath = process.env.REACT_APP_SEARCH_PATH || 'https://scw.howardchung.net/';

const getMediaPathForList = (list) => {
  const mappings = {
    // TODO do a dynamic transform on gitlab to githack urls
    'https://gitlab.com/api/v4/projects/howardchung%2Fmedia/repository/tree': 'https://glcdn.githack.com/howardchung/media/-/raw/master/',
  };
  if (mappings[list]) {
    // Return any predefined
    return mappings[list];
  }
  // Nginx servers use the same mediapath as list
  return list;
}

const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  // { urls: 'turn:13.66.162.252:3478', username: 'username', credential: 'password' },
  {
      urls: 'turn:numb.viagenie.ca',
      credential: 'watchparty',
    username: 'howardzchung@gmail.com',
  },
];

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
  ourStream = null;
  videoPCs = {};

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

  setupWebRTC = async () => {
    // Set up our own video
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    this.ourStream = stream;
    // alert server we've joined video chat
    this.socket.emit('CMD:joinVideo');
  }
  
  updateWebRTC = () => {
    // TODO teardown connections to people who leave
    if (!this.ourStream) {
      // We haven't started video chat, exit
      return;
    }
    this.state.participants.forEach(user => {
      const id = user.id;
      if (!user.isVideoChat || this.videoPCs[id]) {
        return;
      }
      if (id === this.socket.id) {
        this.videoPCs[id] = true;
        this.videoRefs[id].srcObject = this.ourStream;
      }
      else {
        const pc = new RTCPeerConnection({ iceServers });
        this.videoPCs[id] = pc;
        // Add our own video as outgoing stream
        pc.addStream(this.ourStream);
        pc.onicecandidate = (event) => {
          // We generated an ICE candidate, send it to peer
          if (event.candidate) {
            this.sendMessage(id, {'ice': event.candidate});
          }
        };
        pc.onaddstream = (event) => {
          // Mount the stream from peer
          const stream = event.stream;
          this.videoRefs[id].srcObject = stream;
        };
        // For each pair, have the lexicographically smaller ID be the offerer
        const isOfferer = this.socket.id < id;
        if (isOfferer) {
          pc.onnegotiationneeded = async () => {
            // Start connection for peer's video
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendMessage(id, {'sdp': pc.localDescription });
          }
        }
      }
    });
  }

  sendMessage = async (to, data) => {
    console.log('send', to, data);
    this.socket.emit('signal', { to, msg: data });
  };
  
  init = () => {
    this.setState({ state: 'started' }, () => {
      // Load UUID from url
      let roomId = '/default';
      let query = window.location.hash.substring(1);
      if (query) {
        roomId = '/' + query;
      }

      // Send heartbeat to the server
      window.setInterval(() => {
        window.fetch(serverPath + '/ping');
      }, 10 * 60 * 1000);
  
      // This code loads the IFrame Player API code asynchronously.
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
              if (getMediaType(this.state.currentMedia) === 'youtube' && e.data === window.YT.PlayerState.CUED) {
                this.setState({ loading: false });
              }
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
      // if (this.videoInitTime) {
      //   const videoReadyTime = Number(new Date());
      //   const offset = videoReadyTime - this.videoInitTime;
      //   console.log('offset: ', offset);
      //   leftVideo.currentTime += (offset / 1000);
      // }
      this.setState({ loading: false });
    };

    // Load settings from localstorage, build medialist
    let settings = window.localStorage.getItem('watchparty-setting');
    if (!settings) {
        updateSettings(defaultMediaList);
        settings = window.localStorage.getItem('watchparty-setting');
    }
    let watchOptions = [];
    const lines = settings.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // TODO promise.all this to make requests in parallel
      const response = await window.fetch(line);
      const data = await response.json();
      watchOptions = [...watchOptions, ...data.filter(file => file.type === 'file').map(file => getMediaPathForList(line) + file.name)];
    }
    this.setState({ watchOptions });

    // this.setState({ state: 'watching' });
    const socket = window.io.connect(serverPath + roomId);
    this.socket = socket;
    socket.on('connect', async () => {
      // Load username from localstorage
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
      this.setState({ currentMedia: data.video, currentMediaPaused: data.paused, watchOptions, loading: Boolean(data.video) }, () => {
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
    // let videoRecs = {};
    // let videoMs = {};
    // let buffers = {};
    // socket.on('REC:video', async (data) => {
    //   // id and data fields
    //   if (!buffers[data.id]) {
    //     buffers[data.id] = [];
    //   }
    //   const buffer = buffers[data.id];
    //   buffer.push(data.data);
    //   console.log(buffer, data);
    //   const ms = videoMs[data.id];
    //   if (ms && ms.sourceBuffers[0] && !ms.sourceBuffers[0].updating && buffer.length)
    //   {
    //     videoMs[data.id].sourceBuffers[0].appendBuffer(buffer.shift());
    //   }
    //   if (!videoRecs[data.id]) {
    //     const videoRec = document.createElement('video');
    //     videoRec.autoplay = true;
    //     videoRec.width = 320;
    //     videoRec.height = 240;
    //     videoRecs[data.id] = videoRec;
    //     const ms = new MediaSource();
    //     // console.log(MediaSource.isTypeSupported('video/webm; codecs=vp9'));
    //     ms.onsourceopen = () => {
    //       console.log('onsourceopen');
    //       ms.addSourceBuffer('video/webm; codecs=vp9');
    //       videoMs[data.id] = ms;
    //     };
    //     ms.onsourceclose = () => {
    //       console.log('onsourceclose');
    //     }
    //     videoRec.src = window.URL.createObjectURL(ms);
    //     document.body.appendChild(videoRec);
    //   }
    // });
    socket.on('REC:tsMap', (data) => {
      this.setState({ tsMap: data });
    });
    socket.on('REC:nameMap', (data) => {
      this.setState({ nameMap: data });
    });
    socket.on('roster', (data) => {
      this.setState({ participants: data }, () => {
        // console.log(data);
        // Establish connections to the other video chatters
        this.updateWebRTC();
      });
    });
    socket.on('chatinit', (data) => {
      this.setState({ chat: data });
      this.scrollToBottom();
    });
    socket.on('signal', async (data) => {
      // Handle messages received from signaling server
      const msg = data.msg;
      const from = data.from;
      const pc = this.videoPCs[from];
      console.log('recv', from, data);
      if (msg.ice !== undefined) {
        pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      }
      else if (msg.sdp && msg.sdp.type === "offer") {
        // console.log('offer');
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.sendMessage(from, {'sdp': pc.localDescription});
      }
      else if (msg.sdp && msg.sdp.type === "answer") {
        console.log('answer', pc.signalingState);
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }
    });
    window.setInterval(() => {
      this.socket.emit('CMD:ts', this.getCurrentTime());
    }, 1000);
  }
  
  isYouTube = () => {
    return getMediaType(this.state.currentMedia) === 'youtube';
  }
  
  isVideo = () => {
    return getMediaType(this.state.currentMedia) === 'video';
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

  isSubtitled = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById('leftVideo');
      return leftVideo.textTracks[0] && leftVideo.textTracks[0].mode === 'showing';
    }
    if (this.isYouTube()) {
      // TODO
      return false;
    }   
  }
  
  doSrc = async (src, time) => {
    console.log('doSrc', src, time);
    if (this.isVideo()) {
      const leftVideo = document.getElementById('leftVideo');
      leftVideo.src = src;
      this.videoInitTime = Number(new Date());
      leftVideo.currentTime = time;
      // Clear subtitles
      leftVideo.innerHTML = '';
      let subtitleSrc = null;
      if (src.includes('stream?torrent=magnet')) {
        const search = new URL(this.state.currentMedia).search;
        const magnetUrl = querystring.parse(search.substring(1)).torrent;
        subtitleSrc = searchPath + 'subtitles2?torrent=' + encodeURIComponent(magnetUrl);
      }
      else {
        const subtitlePath = src.slice(0, src.lastIndexOf('/') + 1);
        const subtitleListResp = await window.fetch(subtitlePath + 'subtitles/');
        const subtitleList = await subtitleListResp.json();
        const match = subtitleList.find(subtitle => src.slice(0, -4).toLowerCase().startsWith(subtitle.name.slice(0, -4).toLowerCase()));
        subtitleSrc = subtitlePath + 'subtitles/' + match.name;
      }
      if (subtitleSrc) {
        const response = await window.fetch(subtitleSrc);
        const buffer = await response.arrayBuffer();
        const vttConverter = new VTTConverter(new Blob([buffer]));
        const url = await vttConverter.getURL();
        const track = document.createElement("track");
        track.kind = "captions";
        track.label = "English";
        track.srclang = "en";
        track.src = url;
        leftVideo.appendChild(track);
      }
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
  
  createRoom = async () => {
    const response = await window.fetch(serverPath + '/createRoom', { method: 'POST' });
    const data = await response.json();
    const { name } = data;
    window.location.hash = '#' + name;
    window.location.reload();
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
  
  toggleSubtitle = () => {
    const leftVideo = document.getElementById('leftVideo');
    if (leftVideo.textTracks[0]) {
      leftVideo.textTracks[0].mode = leftVideo.textTracks[0].mode === 'showing' ? 'hidden' : 'showing';
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
    if (this.messagesRef.current) {
      this.messagesRef.current.scrollTop = this.messagesRef.current.scrollHeight;
    }
  }

  render() {
    return (
        <React.Fragment>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <a href="/" style={{ display: 'flex', marginLeft: '1em', marginTop: '10px' }}>
              <div style={{ height: '85px', width: '85px', position: 'relative' }}>
                <Icon inverted name="film" size="big" circular color="blue" style={{ position: 'absolute' }} />
                <Icon inverted name="group" size="big" circular color="green" style={{ position: 'absolute', right: 0, bottom: 0 }} />
              </div>
              <Header inverted style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }} as='h1' color="blue">Watch</Header>
              <Header inverted style={{ textTransform: 'uppercase', letterSpacing: '2px'  }} as='h1' color="green">Party</Header>
          </a>
          { <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', marginRight: '1em' }}>
            <Button inverted primary size="large" icon labelPosition="left" onClick={this.createRoom}><Icon name='certificate' />Create New Room</Button>
            <SettingsModal />
          </div> }
        </div>
        <Divider inverted horizontal>
          <Header inverted as='h4'>
            <Icon name='film' />
            Watch videos with your friends!
          </Header>
        </Divider>
        <Grid stackable celled='internally' style={{ height: '100vh' }}>
          <Grid.Row>
          { this.state.state === 'init' && <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start', justifyContent: 'center' }}><Button style={{ width: '200px' }} inverted primary size="huge" onClick={this.init} icon labelPosition="left"><Icon name="sign-in" />Join Party</Button></div> }
          { this.state.state !== 'init' && <Grid.Column width={11}>
            <React.Fragment>
            <div style={{ display: 'flex', alignItems: 'center' }}>
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
              options={this.state.watchOptions.map(option => ({ key: option, text: getMediaDisplayName(option), value: option }))}
            />
            </div>
            <Divider inverted horizontal></Divider>
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <SearchComponent setMedia={this.setMedia} />
            </div>
            <Segment inverted style={{ position: 'relative' }}>
              <Grid columns={2}>
                <Grid.Column>
                <Header inverted as='h4' style={{ textTransform: 'uppercase', marginRight: '20px', wordBreak: 'break-all' }}>Now Watching: {getMediaDisplayName(this.state.currentMedia)}</Header>
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
                      </List.Item>;
                  })}
                </List>
                </Grid.Column>
              </Grid>
              <Divider inverted vertical>With</Divider>
            </Segment>
            { (this.state.loading || !this.state.currentMedia) && <Segment inverted style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              { (this.state.loading) && 
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
              toggleSubtitle={this.toggleSubtitle}
              paused={this.isPaused()}
              muted={this.isMuted()}
              subtitled={this.isSubtitled()}
              currentTime={this.getCurrentTime()}
              duration={this.getDuration()}
            />
            }
          </React.Fragment>
        </Grid.Column>}
        {this.state.state !== 'init' && <Grid.Column width={5} style={{ display: 'flex', flexDirection: 'column' }}>
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
          <Divider inverted horizontal></Divider>
          {!this.ourStream && <Button color="purple" size="large" icon labelPosition="left" onClick={this.setupWebRTC}><Icon name="video" />Join Video</Button>}
          <div id="videoContainer">
            {this.state.participants.map(p => {
              return <div style={{ position: 'relative' }}>
                <video
                  ref={el => {this.videoRefs[p.id] = el}}
                  style={{ width: '100%', borderRadius: '4px', display: p.isVideoChat ? 'block' : 'none' }}
                  autoPlay
                  muted={p.id === this.socket.id}
                  data-id={p.id}
                />
                <Label tag size='small' color={getColor(p.id)} style={{ position: 'absolute', bottom: 0, right: 0 }}>{this.state.nameMap[p.id] || p.id}</Label>
                </div>;
              })}
          </div>
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
        </Grid.Column>}
        </Grid.Row>
      </Grid>
      </React.Fragment>
    );
  }
}

class SearchComponent extends React.Component {
  state = { results: null, resetDropdown: Number(new Date()) };

  doSearch = (e) => {
    e.persist();
    if (!this.debounced) {
      this.debounced = debounce(async () => {
        const response = await window.fetch(searchPath + 'search?q=' + encodeURIComponent(e.target.value));
        const data = await response.json();
        this.setState({ results: data });
      }, 300);
    }
    this.debounced();
  }

  render() {
    const { setMedia } = this.props;
    return <Dropdown
      key={this.state.resetDropdown}
      fluid
      icon='search'
      text="Search for streams"
      labeled
      search={() => {}}
      onSearchChange={this.doSearch}
      button
      className='icon'
    >
      <Dropdown.Menu>
        {(this.state.results || []).map(result => {
          return <Dropdown.Item
            label={{ color: Number(result.seeders) ? 'green' : 'red', empty: true, circular: true }}
            text={result.name + ' - ' + result.size + ' - ' + result.seeders + ' peers'}
            onClick={(e) => {
              setMedia(e, { value: searchPath + 'stream?torrent=' + encodeURIComponent(result.magnet)});
              this.setState({ resetDropdown: Number(new Date()) });
            }}
          />
        })}
      </Dropdown.Menu>
    </Dropdown>;
  }
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout;

  // This is the function that is actually executed when
  // the DOM event is triggered.
  return function executedFunction() {
    // Store the context of this and any
    // parameters passed to executedFunction
    var context = this;
    var args = arguments;
	    
    // The function to be called after 
    // the debounce time has elapsed
    var later = function() {
      // null timeout to indicate the debounce ended
      timeout = null;
	    
      // Call function now if you did not on the leading end
      if (!immediate) func.apply(context, args);
    };

    // Determine if you should call the function
    // on the leading or trail end
    var callNow = immediate && !timeout;
	
    // This will reset the waiting every function execution.
    // This is the step that prevents the function from
    // being executed because it will never reach the 
    // inside of the previous setTimeout  
    clearTimeout(timeout);
	
    // Restart the debounce waiting period.
    // setTimeout returns a truthy value (it differs in web vs node)
    timeout = setTimeout(later, wait);
	
    // Call immediately if you're dong a leading
    // end execution
    if (callNow) func.apply(context, args);
  };
};

const SettingsModal = () => (
  <Modal trigger={<Button secondary size="large" icon labelPosition="left"><Icon name="setting" />Settings</Button>} basic size='small'>
    <Header icon='setting' content='Settings' />
    <Modal.Content>
      <Header inverted>
        Configure media sources:
      </Header>
      <p>Enter one URL per line.</p>
      <p>The plan is to make this support Nginx file servers, GitLab repos, Plex media servers, etc.</p>
      <Form>
        <TextArea id="settings_textarea">{window.localStorage.getItem('watchparty-setting')}</TextArea>
      </Form>
    </Modal.Content>
    <Modal.Actions>
      <Button color='green' inverted onClick={() => {
            const newSetting = document.getElementById('settings_textarea').value;
            updateSettings(newSetting);
            window.location.reload();
        }}>
        <Icon name='checkmark' />Save
      </Button>
    </Modal.Actions>
  </Modal>
)

const updateSettings = (newSetting) => {
  window.localStorage.setItem('watchparty-setting', newSetting);
}

const getMediaType = (input) => {
  if (!input) {
    return '';
  }
  if (input.startsWith('https://www.youtube.com/')) {
    return 'youtube';
  }
  return 'video';
}

const getMediaDisplayName = (input) => {
  if (!input) {
    return '';
  }
  // Show the whole URL for youtube
  if (getMediaType(input) === 'youtube') {
    return input;
  }
  if (input.includes('stream?torrent=magnet')) {
    const search = new URL(input).search;
    const magnetUrl = querystring.parse(search.substring(1)).torrent;
    const magnetParsed = magnet.decode(magnetUrl);
    return magnetParsed.name;
  }
  // Get the filename out of the URL
  return input.split('/').slice(-1)[0];
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
    const { togglePlay, onSeek, fullScreen, toggleMute, toggleSubtitle, paused, muted, subtitled, currentTime, duration } = this.props;
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
      <Icon size="large" bordered onClick={toggleSubtitle} className="control action" name={subtitled ? 'closed captioning' : 'closed captioning outline'} />
      <Icon size="large" bordered onClick={fullScreen} className="control action" name='expand' />
      <Icon size="large" bordered onClick={toggleMute} className="control action" name={muted ? 'volume off' : 'volume up' } />
    </div>;
  }
}

function formatMessage(cmd, msg) {
  if (cmd === 'host') {
    return `changed the video to ${getMediaDisplayName(msg)}`;
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

