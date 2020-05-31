import './App.css';
import React from 'react';
import { Button, Grid, Header, Icon, Input, Modal } from 'semantic-ui-react';
//@ts-ignore
import io from 'socket.io-client';
import { serverPath, testAutoplay } from '../../utils';
import { generateName } from '../../utils/generateName';
import { Chat } from '../Chat';
import { JeopardyTopBar } from '../TopBar';
import { getCurrentSettings } from '../Settings';
import { Jeopardy } from '../../Jeopardy';
import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG;
if (firebaseConfig) {
  firebase.initializeApp(JSON.parse(firebaseConfig));
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: any;
    YT: any;
    FB: any;
    fbAsyncInit: Function;
  }
}

interface AppState {
  state: 'init' | 'starting' | 'connected';
  participants: User[];
  rosterUpdateTS: Number;
  chat: ChatMessage[];
  tsMap: NumberDict;
  nameMap: StringDict;
  pictureMap: StringDict;
  myName: string;
  myPicture: string;
  scrollTimestamp: number;
  fullScreen: boolean;
  isAutoPlayable: boolean;
  error: string;
  settings: Settings;
  vBrowserResolution: string;
  nonPlayableMedia: boolean;
  currentTab: string;
}

export default class App extends React.Component<null, AppState> {
  state: AppState = {
    state: 'starting',
    participants: [],
    rosterUpdateTS: Number(new Date()),
    chat: [],
    tsMap: {},
    nameMap: {},
    pictureMap: {},
    myName: '',
    myPicture: '',
    scrollTimestamp: 0,
    fullScreen: false,
    isAutoPlayable: true,
    error: '',
    settings: {},
    vBrowserResolution: '1280x720@30',
    nonPlayableMedia: false,
    currentTab: 'chat',
  };
  socket: any = null;

  async componentDidMount() {
    const canAutoplay = await testAutoplay();
    this.setState({ isAutoPlayable: canAutoplay });

    document.onfullscreenchange = () => {
      this.setState({ fullScreen: Boolean(document.fullscreenElement) });
    };

    // Send heartbeat to the server
    window.setInterval(() => {
      window.fetch(serverPath + '/ping');
    }, 10 * 60 * 1000);

    this.loadSettings();
    this.init();
  }

  loadSettings = async () => {
    // Load settings from localstorage and remote
    const customSettingsData = await fetch(serverPath + '/settings');
    const customSettings = await customSettingsData.json();
    let settings = { ...getCurrentSettings(), ...customSettings };
    this.setState({ settings });
  };

  init = () => {
    // Load room ID from url
    let roomId = '/default';
    let query = window.location.hash.substring(1);
    if (query) {
      roomId = '/' + query;
    }
    this.join(roomId);
  };

  join = async (roomId: string) => {
    const socket = io.connect(serverPath + roomId);
    this.socket = socket;
    socket.on('connect', async () => {
      this.setState({ state: 'connected' });
      // Load username from localstorage
      let userName = window.localStorage.getItem('watchparty-username');
      this.updateName(null, { value: userName || generateName() });
    });
    socket.on('error', (err: any) => {
      console.error(err);
      this.setState({ error: "There's no room with this name." });
    });
    socket.on('REC:chat', (data: ChatMessage) => {
      if (document.visibilityState && document.visibilityState !== 'visible') {
        new Audio('/clearly.mp3').play();
      }
      this.state.chat.push(data);
      this.setState({
        chat: this.state.chat,
        scrollTimestamp: Number(new Date()),
      });
    });
    socket.on('REC:nameMap', (data: StringDict) => {
      this.setState({ nameMap: data });
    });
    socket.on('REC:pictureMap', (data: StringDict) => {
      this.setState({ pictureMap: data });
    });
    socket.on('roster', (data: User[]) => {
      this.setState({ participants: data, rosterUpdateTS: Number(new Date()) });
    });
    socket.on('chatinit', (data: any) => {
      this.setState({ chat: data, scrollTimestamp: Number(new Date()) });
    });
  };

  updateName = (e: any, data: { value: string }) => {
    this.setState({ myName: data.value });
    this.socket.emit('CMD:name', data.value);
    window.localStorage.setItem('watchparty-username', data.value);
  };

  updatePicture = (url: string) => {
    this.setState({ myPicture: url });
    this.socket.emit('CMD:picture', url);
  };

  render() {
    return (
      <React.Fragment>
        {this.state.error && (
          <Modal inverted basic open>
            <Header as="h1" style={{ textAlign: 'center' }}>
              {this.state.error}
            </Header>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                primary
                size="huge"
                onClick={() => {
                  window.location.href = '/';
                }}
                icon
                labelPosition="left"
              >
                <Icon name="home" />
                Go to home page
              </Button>
            </div>
          </Modal>
        )}
        {!this.state.error && !this.state.isAutoPlayable && (
          <Modal inverted basic open>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                primary
                size="huge"
                onClick={() => {
                  this.setState({ isAutoPlayable: true });
                }}
                icon
                labelPosition="left"
              >
                <Icon name="sign-in" />
                Join Party
              </Button>
            </div>
          </Modal>
        )}
        <JeopardyTopBar />
        {
          <Grid stackable celled="internally">
            <Grid.Row>
              <Grid.Column width={12} className="fullHeightColumn">
                {this.state.state === 'connected' && (
                  <Jeopardy
                    socket={this.socket}
                    participants={this.state.participants}
                    nameMap={this.state.nameMap}
                    pictureMap={this.state.pictureMap}
                  />
                )}
              </Grid.Column>
              <Grid.Column
                width={4}
                style={{ display: 'flex', flexDirection: 'column' }}
                className="fullHeightColumn"
              >
                <Input
                  inverted
                  fluid
                  label={'My name is:'}
                  value={this.state.myName}
                  onChange={this.updateName}
                  icon={
                    <Icon
                      onClick={() =>
                        this.updateName(null, { value: generateName() })
                      }
                      name="refresh"
                      inverted
                      circular
                      link
                    />
                  }
                />
                {/* <Divider inverted horizontal></Divider> */}
                <Chat
                  chat={this.state.chat}
                  nameMap={this.state.nameMap}
                  pictureMap={this.state.pictureMap}
                  socket={this.socket}
                  scrollTimestamp={this.state.scrollTimestamp}
                  getMediaDisplayName={() => ''}
                  hide={this.state.currentTab !== 'chat'}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        }
      </React.Fragment>
    );
  }
}
