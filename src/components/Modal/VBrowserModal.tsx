import React from 'react';
import { Modal, Button, Table, Alert, Select, Avatar } from '@mantine/core';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { SignInButton } from '../TopBar/TopBar';
import { serverPath } from '../../utils';
import { SubscribeButton } from '../SubscribeButton/SubscribeButton';
import config from '../../config';
import { MetadataContext } from '../../MetadataContext';
import { IconHourglass } from '@tabler/icons-react';

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
    region: 'any',
  };

  async componentDidMount() {
    const resp = await window.fetch(serverPath + '/metadata');
    const metadata = await resp.json();
    this.setState({ isFreePoolFull: metadata.isFreePoolFull });
  }
  render() {
    const regionOptions = [
      {
        label: 'Any available',
        value: 'any',
        image: { avatar: false, src: '' },
      },
      {
        label: 'US East',
        value: 'US',
        image: { avatar: false, src: '/flag-united-states.png' },
      },
      {
        label: 'US West',
        value: 'USW',
        image: { avatar: false, src: '/flag-united-states.png' },
      },
      {
        label: 'Europe',
        value: 'EU',
        image: { avatar: false, src: '/flag-european-union.png' },
      },
    ];
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
              region: this.state.region === 'any' ? '' : this.state.region,
            });
            closeModal();
          }}
        >
          {large ? 'Launch VBrowser+' : 'Continue with Free'}
        </Button>
      );
    };
    const vmPoolFullMessage = (
      <Alert
        style={{ maxWidth: '300px' }}
        color="red"
        icon={<IconHourglass />}
        title="No Free VBrowsers Available"
      >
        <div>
          <div>All of the free VBrowsers are currently being used.</div>
          <div>
            Please consider subscribing for anytime access to faster VBrowsers,
            or try again later.
          </div>
        </div>
      </Alert>
    );

    const subscribeButton = <SubscribeButton />;

    const canLaunch = this.context.user || !config.VITE_FIREBASE_CONFIG;
    return (
      <GoogleReCaptchaProvider
        reCaptchaKey={config.VITE_RECAPTCHA_SITE_KEY as string}
        useRecaptchaNet
      >
        <Modal
          opened
          onClose={closeModal}
          title="Launch a VBrowser"
          centered
          size="auto"
        >
          <div>
            You're about to launch a virtual browser to share in this room.
          </div>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th />
                <Table.Th>WatchParty Free</Table.Th>
                <Table.Th>WatchParty Plus</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              <Table.Tr>
                <Table.Td>VBrowser Max Resolution</Table.Td>
                <Table.Td>720p</Table.Td>
                <Table.Td>1080p</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>VBrowser CPU/RAM</Table.Td>
                <Table.Td>Standard</Table.Td>
                <Table.Td>Extra</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>VBrowser Session Length</Table.Td>
                <Table.Td>3 hours</Table.Td>
                <Table.Td>24 hours</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Recommended Max Viewers</Table.Td>
                <Table.Td>15</Table.Td>
                <Table.Td>30</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Region</Table.Td>
                <Table.Td>Where available </Table.Td>
                <Table.Td>
                  <Select
                    onChange={(value, option) =>
                      this.setState({ region: value })
                    }
                    value={this.state.region}
                    data={regionOptions}
                    renderOption={({ option }: { option: any }) => (
                      <div
                        key={option.value}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                        }}
                      >
                        <Avatar radius="xs" src={option.image.src} />
                        {option.label}
                      </div>
                    )}
                  />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td></Table.Td>
                <Table.Td>
                  {canLaunch ? (
                    this.state.isFreePoolFull ? (
                      vmPoolFullMessage
                    ) : (
                      <LaunchButton large={false} />
                    )
                  ) : (
                    <SignInButton />
                  )}
                </Table.Td>
                <Table.Td>
                  {this.context.isSubscriber ? (
                    <LaunchButton large />
                  ) : (
                    subscribeButton
                  )}
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Modal>
      </GoogleReCaptchaProvider>
    );
  }
}
