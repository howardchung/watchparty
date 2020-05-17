import React from 'react';
import { serverPath, getColorHex } from './utils';
import { Icon, Popup, Button } from 'semantic-ui-react';
import './Jeopardy.css';

export class TopBar extends React.Component<{ fbUserID: string | undefined }> {
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
    const { fbUserID } = this.props;
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
            className="mobileStack"
            style={{
              display: 'flex',
              width: '450px',
              marginLeft: 'auto',
            }}
          >
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
            {!fbUserID && (
              <Popup
                content="Optionally sign in with Facebook to use your profile photo in chat"
                trigger={
                  <Button
                    fluid
                    icon
                    labelPosition="left"
                    onClick={() =>
                      window.FB.login(
                        (response: any) => {
                          window.location.reload();
                        },
                        { scope: 'public_profile,email' }
                      )
                    }
                    color="facebook"
                    className="toolButton"
                  >
                    <Icon name="facebook" />
                    Sign in
                  </Button>
                }
              />
            )}
            {fbUserID && (
              <Button
                fluid
                icon
                labelPosition="left"
                onClick={() =>
                  window.FB.logout((response: any) => {
                    window.location.reload();
                  })
                }
                color="facebook"
                className="toolButton"
              >
                <Icon name="facebook" />
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

export class JeopardyTopBar extends React.Component {
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
          <div
            className="mobileStack"
            style={{
              display: 'flex',
              width: '200px',
              marginLeft: 'auto',
            }}
          >
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
          </div>
        </div>
      </React.Fragment>
    );
  }
}
