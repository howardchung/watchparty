import React from "react";
import { Modal, Title, Table, Button } from "@mantine/core";
import { loadStripe } from "@stripe/stripe-js";
import { SignInButton } from "../TopBar/TopBar";
import config from "../../config";
import { MetadataContext } from "../../MetadataContext";
import { IconBrandStripeFilled, IconCheck } from "@tabler/icons-react";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = config.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(config.VITE_STRIPE_PUBLIC_KEY)
  : null;

export class SubscribeModal extends React.Component<{
  closeSubscribe: () => void;
}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  onSubscribe = async () => {
    if (!stripePromise) {
      console.warn("Stripe integration is not configured, cannot subscribe");
      return;
    }
    const stripe = await stripePromise;
    const result = await stripe?.redirectToCheckout({
      lineItems: [
        {
          price:
            config.NODE_ENV === "development"
              ? "price_HNGtabCzD5qyfd"
              : "price_HNDBoPDI7yYRi9",
          quantity: 1,
        },
      ],
      mode: "subscription",
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
      <Modal
        opened
        onClose={closeSubscribe}
        centered
        size="auto"
        title="Subscribe to WatchParty Plus"
      >
        <div>
          Subscriptions help us maintain the service and build new features!
          Please consider supporting us if you're enjoying WatchParty.
        </div>
        <Title order={6}>Features</Title>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>WatchParty Free</Table.Th>
              <Table.Th>WatchParty Plus</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {/* Priority support */}
            <Table.Tr>
              <Table.Td>Synchronized watching, chat, screenshare</Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Number of Permanent Rooms</Table.Td>
              <Table.Td>1</Table.Td>
              <Table.Td>20</Table.Td>
            </Table.Tr>
            {/* <Table.Tr>
                  <Table.Td>Max Room Capacity</Table.Td>
                  <Table.Td>20</Table.Td>
                  <Table.Td>100</Table.Td>
                </Table.Tr> */}
            <Table.Tr>
              <Table.Td>VBrowser Access</Table.Td>
              <Table.Td>When capacity allows</Table.Td>
              <Table.Td>Anytime</Table.Td>
            </Table.Tr>
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
              <Table.Td>VBrowser Region Selection</Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>
                Share your screen/file to more viewers with Relay
              </Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Custom room URLs and titles</Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Discord subscriber role (with linked account)</Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Colored names in chat</Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Price</Table.Td>
              <Table.Td>$0 / month</Table.Td>
              <Table.Td>$5 / month</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <div style={{ textAlign: "right" }}>
          {/* if user isn't logged in, provide login prompt */}
          {this.context.user && this.context.user.email ? (
            <Button
              leftSection={<IconBrandStripeFilled />}
              onClick={this.onSubscribe}
            >
              Subscribe with Stripe
            </Button>
          ) : (
            <div>
              Please sign in to subscribe: <SignInButton />
            </div>
          )}
        </div>
      </Modal>
    );
  }
}
