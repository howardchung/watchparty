import React from "react";
import { Modal, Title, Table, Button } from "../UI/UI";
import { SignInButton } from "../TopBar/TopBar";
import { MetadataContext } from "../../MetadataContext";
import { IconBrandStripeFilled, IconCheck } from "../Icons/Icons";
import { serverPath } from "../../utils/utils";

export class SubscribeModal extends React.Component<{
  closeSubscribe: () => void;
}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  onSubscribe = async () => {
    try {
      const user = this.context.user;
      const resp = await fetch(`${serverPath}/checkoutSub`, {
        credentials: "include",
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user?.uid,
          token: await user?.getIdToken(),
          return_url: window.location.href,
        }),
      });
      const json = await resp.json();
      if (json?.url) {
        window.location.href = json.url;
      } else {
        throw Error();
      }
    } catch (e) {
      console.error(e);
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
        <div style={{ color: "var(--text-secondary)", marginBottom: 12 }}>
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
            <Table.Tr>
              <Table.Td>Synchronized watching, chat, screenshare</Table.Td>
              <Table.Td>
                <IconCheck color="var(--accent-emerald)" size={18} />
              </Table.Td>
              <Table.Td>
                <IconCheck color="var(--accent-emerald)" size={18} />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Number of Permanent Rooms</Table.Td>
              <Table.Td>1</Table.Td>
              <Table.Td>20</Table.Td>
            </Table.Tr>
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
                <IconCheck color="var(--accent-emerald)" size={18} />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>
                Share your screen/file to more viewers with Relay
              </Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck color="var(--accent-emerald)" size={18} />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Custom room URLs and titles</Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck color="var(--accent-emerald)" size={18} />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Discord subscriber role (with linked account)</Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck color="var(--accent-emerald)" size={18} />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Colored names in chat</Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck color="var(--accent-emerald)" size={18} />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Price</Table.Td>
              <Table.Td>$0 / month</Table.Td>
              <Table.Td>$5 / month</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <div style={{ textAlign: "right", marginTop: 12 }}>
          {this.context.user && this.context.user.email ? (
            <Button
              leftSection={<IconBrandStripeFilled size={18} />}
              onClick={this.onSubscribe}
            >
              Subscribe with Stripe
            </Button>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <span>Please sign in to subscribe:</span>
              <SignInButton />
            </div>
          )}
        </div>
      </Modal>
    );
  }
}
