import React from 'react';
import { Modal, Header, Table, Button, Icon } from 'semantic-ui-react';
import { loadStripe } from '@stripe/stripe-js';
import { SignInButton } from '../TopBar/TopBar';
import config from '../../config';
import { MetadataContext } from '../../MetadataContext';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = config.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(config.VITE_STRIPE_PUBLIC_KEY as string)
  : null;

export class SubscribeModal extends React.Component<{
  closeSubscribe: () => void;
}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  onSubscribe = async () => {
    if (!stripePromise) {
      console.warn('Stripe integration is not configured, cannot subscribe');
      return;
    }
    const stripe = await stripePromise;
    const result = await stripe?.redirectToCheckout({
      lineItems: [
        {
          price:
            config.NODE_ENV === 'development'
              ? 'price_HNGtabCzD5qyfd'
              : 'price_HNDBoPDI7yYRi9',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      successUrl: window.location.href,
      cancelUrl: window.location.href,
      customerEmail: this.context.user?.email ?? undefined,
      clientReferenceId: this.context.user?.uid,
    });
    // If `redirectToCheckout` fails due to a browser or network
    // error, display the localized error message to your customer
    // using `error.message`.
    if (result && result.error) {
      console.error(result.error.message);
    }
  };
  render() {
    const { closeSubscribe } = this.props;
    return (
      <Modal open={true} onClose={closeSubscribe}>
        <Modal.Header>Subscribe to WatchParty Plus</Modal.Header>
        <Modal.Content image>
          {/* <Image wrapped size='medium' src='https://react.semantic-ui.com/images/avatar/large/rachel.png' /> */}
          <Modal.Description>
            <div>
              Subscriptions help us maintain the service and build new features!
              Please consider supporting us if you're enjoying WatchParty.
            </div>
            <Header>Features</Header>
            <Table definition unstackable striped celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell>WatchParty Free</Table.HeaderCell>
                  <Table.HeaderCell>WatchParty Plus</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {/* Priority support */}
                <Table.Row>
                  <Table.Cell>
                    Synchronized watching, chat, screenshare
                  </Table.Cell>
                  <Table.Cell>
                    <Icon name="check" />
                  </Table.Cell>
                  <Table.Cell>
                    <Icon name="check" />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Number of Permanent Rooms</Table.Cell>
                  <Table.Cell>1</Table.Cell>
                  <Table.Cell>20</Table.Cell>
                </Table.Row>
                {/* <Table.Row>
                  <Table.Cell>Max Room Capacity</Table.Cell>
                  <Table.Cell>20</Table.Cell>
                  <Table.Cell>100</Table.Cell>
                </Table.Row> */}
                <Table.Row>
                  <Table.Cell>VBrowser Access</Table.Cell>
                  <Table.Cell>When capacity allows</Table.Cell>
                  <Table.Cell>Anytime</Table.Cell>
                </Table.Row>
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
                  <Table.Cell>VBrowser Region Selection</Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <Icon name="check" />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    Share your screen/file to more viewers with Relay
                  </Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <Icon name="check" />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Custom Room URLs and Titles</Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <Icon name="check" />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    Discord Subscriber Role (with linked account)
                  </Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <Icon name="check" />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Animated Chat Avatar Frame</Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <Icon name="check" />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Price</Table.Cell>
                  <Table.Cell>$0 / month</Table.Cell>
                  <Table.Cell>$5 / month</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
            <div style={{ textAlign: 'right' }}>
              {/* if user isn't logged in, provide login prompt */}
              {this.context.user && this.context.user.email ? (
                <Button
                  icon
                  labelPosition="left"
                  color="blue"
                  size="large"
                  onClick={this.onSubscribe}
                >
                  <Icon name="cc stripe" />
                  Subscribe with Stripe
                </Button>
              ) : (
                <div>
                  Please sign in to subscribe: <SignInButton />
                </div>
              )}
            </div>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }
}
