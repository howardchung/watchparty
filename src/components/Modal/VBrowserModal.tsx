import React from 'react';
import { Modal, Button, Icon } from 'semantic-ui-react';
import {
  GoogleReCaptchaProvider,
  withGoogleReCaptcha,
} from 'react-google-recaptcha-v3';

export class VBrowserModal extends React.Component<{
  closeModal: Function;
  openSubscribe: Function;
  startVBrowser: Function;
  isSubscriber: boolean;
}> {
  render() {
    const { closeModal, startVBrowser, openSubscribe } = this.props;
    const LaunchButton = withGoogleReCaptcha(({ googleReCaptchaProps }) => (
      <Button
        size="large"
        onClick={async () => {
          const token = await (googleReCaptchaProps as any).executeRecaptcha(
            'launchVBrowser'
          );
          startVBrowser(token);
          closeModal();
        }}
      >
        {this.props.isSubscriber ? 'Continue' : 'Continue with Free'}
      </Button>
    ));
    return (
      <GoogleReCaptchaProvider
        reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY as string}
        useRecaptchaNet
      >
        <Modal open={true} onClose={closeModal as any}>
          <Modal.Header>Launch a VBrowser</Modal.Header>
          <Modal.Content image>
            {/* <Image wrapped size='medium' src='https://react.semantic-ui.com/images/avatar/large/rachel.png' /> */}
            <Modal.Description>
              <div>
                You're about to launch a virtual browser to share in this room.
                {this.props.isSubscriber ? (
                  <ul>
                    <li>
                      Thanks for subscribing! Your session will be in 1080p and
                      last up to 12 hours.
                    </li>
                  </ul>
                ) : (
                  <ul>
                    <li>
                      Free virtual browsing sessions are limited to 3 hours at
                      720p resolution.
                    </li>
                    <li>
                      Please consider subscribing, which gets you higher
                      resolutions and longer sessions!
                    </li>
                  </ul>
                )}
              </div>
              <LaunchButton />
              {!this.props.isSubscriber && (
                <Button
                  icon
                  labelPosition="left"
                  size="large"
                  color="orange"
                  onClick={openSubscribe as any}
                >
                  <Icon name="plus" />
                  Subscribe
                </Button>
              )}
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </GoogleReCaptchaProvider>
    );
  }
}
