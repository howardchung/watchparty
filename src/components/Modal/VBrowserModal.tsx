import React from 'react';
import { Modal, Button, Table } from 'semantic-ui-react';
import {
  GoogleReCaptchaProvider,
  withGoogleReCaptcha,
} from 'react-google-recaptcha-v3';

export class VBrowserModal extends React.Component<{
  closeModal: Function;
  startVBrowser: Function;
  isSubscriber: Boolean;
  subscribeButton: JSX.Element;
}> {
  render() {
    const { closeModal, startVBrowser } = this.props;
    const LaunchButton = withGoogleReCaptcha(
      ({ googleReCaptchaProps, large }: any) => (
        <Button
          size="large"
          color={large ? 'orange' : undefined}
          onClick={async () => {
            const token = await (googleReCaptchaProps as any).executeRecaptcha(
              'launchVBrowser'
            );
            startVBrowser(token, { size: large ? 'large' : '' });
            closeModal();
          }}
        >
          {large ? 'Launch VBrowser+' : 'Continue with Free'}
        </Button>
      )
    );
    return (
      <GoogleReCaptchaProvider
        reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY as string}
        useRecaptchaNet
      >
        <Modal open={true} onClose={closeModal as any}>
          <Modal.Header>Launch a VBrowser</Modal.Header>
          <Modal.Content image>
            <Modal.Description>
              <div>
                You're about to launch a virtual browser to share in this room.
              </div>
              <Table definition unstackable striped>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell>WatchParty Free</Table.HeaderCell>
                    <Table.HeaderCell>WatchParty Plus</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  <Table.Row>
                    <Table.Cell>VBrowser Resolution</Table.Cell>
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
                    <Table.Cell>12 hours</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell></Table.Cell>
                    <Table.Cell>
                      <LaunchButton />
                    </Table.Cell>
                    <Table.Cell>
                      {this.props.isSubscriber ? (
                        <LaunchButton large />
                      ) : (
                        this.props.subscribeButton
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
