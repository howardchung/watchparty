import React, { useContext } from "react";
import { Modal, Button, Table } from "@mantine/core";
import { SubscribeButton } from "../SubscribeButton/SubscribeButton";
import { MetadataContext } from "../../MetadataContext";
import { t } from "../../i18n";

export const FileShareModal = (props: {
  closeModal: () => void;
  startFileShare: (useMediaSoup: boolean) => void;
  startConvert: () => void;
}) => {
  const context = useContext(MetadataContext);
  const { closeModal } = props;
  const subscribeButton = <SubscribeButton />;
  return (
    <Modal
      opened
      onClose={closeModal}
      title={t("shareFile")}
      size="auto"
      centered
    >
      <div>یک فایل از دستگاه شما برای همراهان اتاق به اشتراک گذاشته می‌شود.</div>
      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            <Table.Th>رایگان</Table.Th>
            <Table.Th>اشتراک — رله</Table.Th>
            <Table.Th>اشتراک — تبدیل</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          <Table.Tr>
            <Table.Td>روش</Table.Td>
            <Table.Td>
              Stream your video to each viewer from your device. May not work
              with codecs not playable in browsers.
            </Table.Td>
            <Table.Td>
              Stream your video to our relay server, which sends it to each
              viewer, reducing bandwidth usage. May not work with codecs not
              playable in browsers.
            </Table.Td>
            <Table.Td>
              We convert your video in real-time to a web-compatible format and
              serve the result. Avoids codec compatibility issues and allows
              more viewers.
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>تأخیر</Table.Td>
            <Table.Td>{`<1s`}</Table.Td>
            <Table.Td>{`<1s`}</Table.Td>
            <Table.Td>{`~5s`}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>تعداد پیشنهادی بیننده</Table.Td>
            <Table.Td>5</Table.Td>
            <Table.Td>20</Table.Td>
            <Table.Td>100</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>سرعت آپلود پیشنهادی</Table.Td>
            <Table.Td>5 Mbps per viewer</Table.Td>
            <Table.Td>5 Mbps</Table.Td>
            <Table.Td>5 Mbps</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td></Table.Td>
            <Table.Td>
              <Button
                onClick={() => {
                  props.startFileShare(false);
                  props.closeModal();
                }}
              >
                شروع اشتراک فایل
              </Button>
            </Table.Td>
            <Table.Td>
              {context.isSubscriber ? (
                <Button
                  color="orange"
                  onClick={() => {
                    props.startFileShare(true);
                    props.closeModal();
                  }}
                >
                  شروع اشتراک با رله
                </Button>
              ) : (
                subscribeButton
              )}
            </Table.Td>
            <Table.Td>
              {context.isSubscriber ? (
                <Button
                  color="orange"
                  onClick={() => {
                    props.startConvert();
                    props.closeModal();
                  }}
                >
                  شروع اشتراک با تبدیل
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
