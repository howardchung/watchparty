import React, { useContext } from "react";
import { Modal, Button, Table } from "@mantine/core";
import { SubscribeButton } from "../SubscribeButton/SubscribeButton";
import { MetadataContext } from "../../MetadataContext";
import { t } from "../../i18n";

export const ScreenShareModal = ({
  closeModal,
  startScreenShare,
}: {
  closeModal: () => void;
  startScreenShare: (useMediaSoup: boolean) => void;
}) => {
  const { isSubscriber } = useContext(MetadataContext);
  const subscribeButton = <SubscribeButton />;
  return (
    <Modal
      opened={true}
      onClose={closeModal}
      title={t("shareScreen")}
      centered
      size="auto"
    >
      <div>صفحه شما با همراهان اتاق به اشتراک گذاشته می‌شود.</div>
      <ul>
        <li>این قابلیت روی Chrome و Edge دسکتاپ پشتیبانی می‌شود.</li>
        <li>
          اشتراک صدا فقط برای کل صفحه یا یک تب مرورگر کار می‌کند، نه یک برنامه.
        </li>
      </ul>
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
            <Table.Td>روش</Table.Td>
            <Table.Td>
              Stream your video to each viewer from your device.
            </Table.Td>
            <Table.Td>
              Stream your video to our relay server, which sends it to each
              viewer, reducing bandwidth usage.
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>تأخیر</Table.Td>
            <Table.Td>{`<1s`}</Table.Td>
            <Table.Td>{`<1s`}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>تعداد پیشنهادی بیننده</Table.Td>
            <Table.Td>5</Table.Td>
            <Table.Td>20</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>سرعت آپلود پیشنهادی</Table.Td>
            <Table.Td>5 Mbps per viewer</Table.Td>
            <Table.Td>5 Mbps</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td></Table.Td>
            <Table.Td>
              <Button
                onClick={() => {
                  startScreenShare(false);
                  closeModal();
                }}
              >
                شروع اشتراک صفحه
              </Button>
            </Table.Td>
            <Table.Td>
              {isSubscriber ? (
                <Button
                  color="orange"
                  onClick={() => {
                    startScreenShare(true);
                    closeModal();
                  }}
                >
                  شروع اشتراک صفحه با رله
                </Button>
              ) : (
                subscribeButton
              )}
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Modal>
  );
};
