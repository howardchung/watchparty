import React from 'react';
import { serverPath, getColorHex } from '../../utils';
import { Icon, Popup, Button, Dropdown } from 'semantic-ui-react';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import '../../Jeopardy.css';

export class NewRoomButton extends React.Component<{ size?: string }> {
  createRoom = async () => {
    const response = await window.fetch(serverPath + '/createRoom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    const { name } = data;
    window.location.hash = '#' + name;
    window.location.reload();
  };
  render() {
    return (
      <Popup
        content="Create a new room with a random URL that you can share with friends"
        trigger={
          <Button
            color="blue"
            size={this.props.size as any}
            icon
            labelPosition="left"
            onClick={this.createRoom}
            className="toolButton"
          >
            <Icon name="certificate" />
            New Room
          </Button>
        }
      />
    );
  }
}

export class TopBar extends React.Component<{
  user?: any;
  hideNewRoom?: boolean;
  hideSignin?: boolean;
}> {
  facebookSignIn = async () => {
    const provider = new firebase.auth.FacebookAuthProvider();
    const user = await firebase.auth().signInWithPopup(provider);
    if (process.env.NODE_ENV === 'development') {
      console.log(user);
    }
  };

  googleSignIn = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const user = await firebase.auth().signInWithPopup(provider);
    if (process.env.NODE_ENV === 'development') {
      console.log(user);
    }
  };

  emailSignIn = (email: string, password: string) => {
    firebase.auth().createUserWithEmailAndPassword(email, password);
  };

  signOut = () => {
    firebase.auth().signOut();
    window.location.reload();
  };

  render() {
    return (
      <React.Fragment>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            padding: '1em',
            paddingBottom: '0px',
          }}
        >
          <a href="/" style={{ display: 'flex' }}>
            <div
              style={{
                height: '48px',
                width: '48px',
                marginRight: '10px',
                borderRadius: '50%',
                position: 'relative',
                backgroundColor: '#' + getColorHex('blue8'),
              }}
            >
              <Icon
                inverted
                name="film"
                size="large"
                style={{
                  position: 'absolute',
                  top: 8,
                  width: '100%',
                  margin: '0 auto',
                }}
              />
              <Icon
                inverted
                name="group"
                size="large"
                color="green"
                style={{
                  position: 'absolute',
                  bottom: 8,
                  width: '100%',
                  margin: '0 auto',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#2185d0',
                  fontSize: '30px',
                  lineHeight: '30px',
                }}
              >
                Watch
              </div>
              <div
                style={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#21ba45',
                  fontSize: '30px',
                  lineHeight: '30px',
                  marginLeft: 'auto',
                }}
              >
                Party
              </div>
            </div>
          </a>
          <div
            style={{
              display: 'flex',
              marginLeft: '10px',
              alignItems: 'center',
            }}
          >
            <a
              href="https://discord.gg/3rYj5HV"
              target="_blank"
              rel="noopener noreferrer"
              className="footerIcon"
              title="Discord"
            >
              <Icon name="discord" size="big" link />
            </a>
            <a
              href="https://github.com/howardchung/watchparty"
              target="_blank"
              rel="noopener noreferrer"
              className="footerIcon"
              title="GitHub"
            >
              <Icon name="github" size="big" link />
            </a>
          </div>
          <div
            style={{
              display: 'flex',
              marginLeft: 'auto',
            }}
          >
            {!this.props.hideNewRoom && <NewRoomButton />}
            {!this.props.hideSignin && !this.props.user && (
              <Popup
                basic
                content="Sign in to automatically set your name and picture"
                trigger={
                  <Dropdown
                    style={{ height: '36px' }}
                    icon="sign in"
                    labeled
                    className="icon"
                    button
                    text="Sign in"
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={this.facebookSignIn}>
                        <Icon name="facebook" />
                        Facebook
                      </Dropdown.Item>
                      <Dropdown.Item onClick={this.googleSignIn}>
                        <Icon name="google" />
                        Google
                      </Dropdown.Item>
                      {/* <Dropdown.Item onClick={this.emailSignIn}>Email</Dropdown.Item> */}
                    </Dropdown.Menu>
                  </Dropdown>
                }
              />
            )}
            {!this.props.hideSignin && this.props.user && (
              <Button
                style={{ height: '36px' }}
                icon
                labelPosition="left"
                onClick={this.signOut}
              >
                <Icon name="sign out" />
                Sign out
              </Button>
            )}
            {/* <SettingsModal trigger={<Button fluid inverted color="green" size="medium" icon labelPosition="left" className="toolButton"><Icon name="setting" />Settings</Button>} /> */}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export class JeopardyTopBar extends React.Component<{ hideNewRoom?: boolean }> {
  createRoom = async () => {
    const response = await window.fetch(serverPath + '/createRoom', {
      method: 'POST',
    });
    const data = await response.json();
    const { name } = data;
    window.location.hash = '#' + name;
    window.location.reload();
  };

  render() {
    return (
      <React.Fragment>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            padding: '1em',
            paddingBottom: '0px',
          }}
        >
          <a href="/" style={{ display: 'flex' }}>
            <div
              className="logo small"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '48px',
                width: '48px',
                marginRight: '10px',
                borderRadius: '50%',
                position: 'relative',
                backgroundColor: '#209CEE',
              }}
            >
              J!
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div className="logo">Jeopardy!</div>
            </div>
          </a>
          {/* <div
            style={{
              display: 'flex',
              marginLeft: '10px',
              alignItems: 'center',
            }}
          >
            <a
              href="https://github.com/howardchung/jeopardy"
              target="_blank"
              rel="noopener noreferrer"
              className="footerIcon"
              title="GitHub"
            >
              <Icon name="github" size="big" link />
            </a>
          </div> */}
          <div
            style={{
              display: 'flex',
              width: '200px',
              marginLeft: 'auto',
            }}
          >
            {!this.props.hideNewRoom && (
              <Popup
                content="Create a new room with a random URL that you can share with friends"
                trigger={
                  <Button
                    fluid
                    color="blue"
                    size="medium"
                    icon
                    labelPosition="left"
                    onClick={this.createRoom}
                    className="toolButton"
                  >
                    <Icon name="certificate" />
                    New Room
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
