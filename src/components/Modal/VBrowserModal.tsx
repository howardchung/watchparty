import React from 'react';
import { Modal, Button, Table, Message, Dropdown } from 'semantic-ui-react';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { SignInButton } from '../TopBar/TopBar';
import { serverPath } from '../../utils';
import firebase from 'firebase/compat/app';
import { SubscribeButton } from '../SubscribeButton/SubscribeButton';
import config from '../../config';
import { MetadataContext } from '../../MetadataContext';

export class VBrowserModal extends React.Component<{
  closeModal: () => void;
  startVBrowser: (
    rcToken: string,
    options: { size: string; region: string },
  ) => void;
}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  state = {
    isFreePoolFull: false,
    region: 'US',
  };

  async componentDidMount() {
    const resp = await window.fetch(serverPath + '/metadata');
    const metadata = await resp.json();
    this.setState({ isFreePoolFull: metadata.isFreePoolFull });
  }
  render() {
    const regionOptions = [
      {
        key: 'US',
        text: 'US East',
        value: 'US',
        image: { avatar: false, src: '/flag-united-states.png' },
      },
      {
        key: 'EU',
        text: 'Europe',
        value: 'EU',
        image: { avatar: false, src: '/flag-european-union.png' },
      },
    ];
    if (this.context.beta) {
      regionOptions.push({
        key: 'USW',
        text: 'US West',
        value: 'USW',
        image: { avatar: false, src: '/flag-united-states.png' },
      });
    }
    const { closeModal, startVBrowser } = this.props;
    const LaunchButton = ({ large }: { large: boolean }) => {
      const { executeRecaptcha } = useGoogleReCaptcha();
      return (
        <Button
          color={large ? 'orange' : undefined}
          onClick={async () => {
            const rcToken =
              executeRecaptcha && (await executeRecaptcha('launchVBrowser'));
            startVBrowser(rcToken ?? '', {
              size: large ? 'large' : '',
              region: large ? this.state.region : 'US',
            });
            closeModal();
          }}
        >
          {large ? 'Launch VBrowser+' : 'Continue with Free'}
        </Button>
      );
    };
    const vmPoolFullMessage = (
      <Message
        size="small"
        color="red"
        icon="hourglass two"
        style={{ width: '380px' }}
        header="No Free VBrowsers Available"
        content={
          <div>
            <div>All of the free VBrowsers are currently being used.</div>
            <div>
              Please consider subscribing for anytime access to faster
              VBrowsers, or try again later.
            </div>
          </div>
        }
      />
    );

    const subscribeButton = <SubscribeButton />;

    const canLaunch = this.context.user || !config.VITE_FIREBASE_CONFIG;
    return (
      <GoogleReCaptchaProvider
        reCaptchaKey={config.VITE_RECAPTCHA_SITE_KEY as string}
        useRecaptchaNet
      >
        <Modal open={true} onClose={closeModal}>
          <Modal.Header>Launch a VBrowser</Modal.Header>
          <Modal.Content image>
            <Modal.Description>
              <div>
                You're about to launch a virtual browser to share in this room.
              </div>
              <Table definition unstackable striped celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell>WatchParty Free</Table.HeaderCell>
                    <Table.HeaderCell>WatchParty Plus</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  <Table.Row>
                    <Table.Cell>VBrowser Max Resolution</Table.Cell>
                    <Table.Cell>720p</Table.Cell>
                    <Table.Cell>1080p</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>VBrowser CPU/RAM</Table.Cell>
                    <Table.Cell>Standard</Table.Cell>
                    <Table.Cell>Extra</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>VBrowser Session Length</Table.Cell>
                    <Table.Cell>3 hours</Table.Cell>
                    <Table.Cell>24 hours</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Recommended Max Viewers</Table.Cell>
                    <Table.Cell>15</Table.Cell>
                    <Table.Cell>30</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Region</Table.Cell>
                    <Table.Cell>Where available </Table.Cell>
                    <Table.Cell>
                      <Dropdown
                        selection
                        onChange={(e, { value }) =>
                          this.setState({ region: value })
                        }
                        value={this.state.region}
                        options={regionOptions}
                      ></Dropdown>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell></Table.Cell>
                    <Table.Cell>
                      {canLaunch ? (
                        this.state.isFreePoolFull ? (
                          vmPoolFullMessage
                        ) : (
                          <LaunchButton large={false} />
                        )
                      ) : (
                        <SignInButton fluid />
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {this.context.isSubscriber ? (
                        <LaunchButton large />
                      ) : (
                        subscribeButton
                      )}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </GoogleReCaptchaProvider>
    );
  }
}
