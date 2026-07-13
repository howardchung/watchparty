import React from "react";
import { Modal, Button, Table, Alert, Select } from "@mantine/core";
import { SignInButton } from "../TopBar/TopBar";
import { serverPath } from "../../utils/utils";
import { SubscribeButton } from "../SubscribeButton/SubscribeButton";
import config from "../../config";
import { MetadataContext } from "../../MetadataContext";
import { IconHourglass } from "@tabler/icons-react";
import { t } from "../../i18n";

export class VBrowserModal extends React.Component<{
  closeModal: () => void;
  startVBrowser: (options: { size: string; region: string }) => void;
}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  state = {
    isFreePoolFull: false,
    region: "any",
  };

  async componentDidMount() {
    const resp = await fetch(serverPath + "/metadata");
    const metadata = await resp.json();
    this.setState({ isFreePoolFull: metadata.isFreePoolFull });
  }
  render() {
    const regionOptions = [
      {
        label: "Any available",
        value: "any",
      },
      {
        label: "US East",
        value: "US",
      },
      {
        label: "US West",
        value: "USW",
      },
      {
        label: "Europe",
        value: "EU",
      },
    ];
    const { closeModal, startVBrowser } = this.props;
    const LaunchButton = ({ large }: { large: boolean }) => {
      return (
        <Button
          color={large ? "orange" : undefined}
          onClick={async () => {
            startVBrowser({
              size: large ? "large" : "",
              region: this.state.region === "any" ? "" : this.state.region,
            });
            closeModal();
          }}
        >
          {large ? "راه‌اندازی مرورگر +" : "ادامه با نسخه رایگان"}
        </Button>
      );
    };
    const vmPoolFullMessage = (
      <Alert
        style={{ maxWidth: "300px" }}
        color="red"
        icon={<IconHourglass />}
        title="مرورگر رایگان در دسترس نیست"
      >
        <div>
          <div>همه مرورگرهای رایگان در حال استفاده هستند.</div>
          <div>
            برای دسترسی همیشگی به مرورگر سریع‌تر اشتراک بگیرید یا بعداً دوباره تلاش کنید.
          </div>
        </div>
      </Alert>
    );

    const subscribeButton = <SubscribeButton />;

    const canLaunch = this.context.user || !config.VITE_FIREBASE_CONFIG;
    return (
      <Modal
        opened
        onClose={closeModal}
        title={t("virtualBrowser")}
        centered
        size="auto"
      >
        <div>یک مرورگر مجازی برای اشتراک‌گذاری در این اتاق راه‌اندازی می‌شود.</div>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>رایگان</Table.Th>
              <Table.Th>اشتراک</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            <Table.Tr>
              <Table.Td>بیشترین وضوح</Table.Td>
              <Table.Td>720p</Table.Td>
              <Table.Td>1080p</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>منابع CPU/RAM</Table.Td>
              <Table.Td>Standard</Table.Td>
              <Table.Td>Extra</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>مدت نشست</Table.Td>
              <Table.Td>3 hours</Table.Td>
              <Table.Td>24 hours</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>تعداد پیشنهادی بیننده</Table.Td>
              <Table.Td>15</Table.Td>
              <Table.Td>30</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>منطقه</Table.Td>
              <Table.Td>Where available </Table.Td>
              <Table.Td>
                <Select
                  onChange={(value, option) => this.setState({ region: value })}
                  value={this.state.region}
                  data={regionOptions}
                  renderOption={({ option }: { option: any }) => (
                    <div key={option.value}>{option.label}</div>
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
    );
  }
}
