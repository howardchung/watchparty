import React, { useContext, useState } from "react";
import { Modal, Button, Table, Checkbox } from "@mantine/core";
import { SubscribeButton } from "../SubscribeButton/SubscribeButton";
import { MetadataContext } from "../../MetadataContext";
import { isClientTranscodeSupported } from "../../utils/clientTranscode";

export const FileShareModal = (props: {
  closeModal: () => void;
  startFileShare: (
    useMediaSoup: boolean,
    options?: { convert?: boolean },
  ) => void;
}) => {
  const context = useContext(MetadataContext);
  const { closeModal } = props;
  const [convert, setConvert] = useState(false);
  const canConvert = isClientTranscodeSupported();
  const subscribeButton = <SubscribeButton />;
  return (
    <Modal
      opened
      onClose={closeModal}
      title="Share a file"
      size="auto"
      centered
    >
      <div>You're about to share a file from your device.</div>
      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            <Table.Th>WatchParty Free</Table.Th>
            <Table.Th>WatchParty Plus (Relay)</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Method</Table.Td>
            <Table.Td>
              Stream your video to each viewer from your device.
            </Table.Td>
            <Table.Td>
              Stream your video to our relay server, which sends it to each
              viewer, reducing bandwidth usage.
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Latency</Table.Td>
            <Table.Td>{`<1s`}</Table.Td>
            <Table.Td>{`<1s`}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Recommended Max Viewers</Table.Td>
            <Table.Td>5</Table.Td>
            <Table.Td>20</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Recommended Upload Speed</Table.Td>
            <Table.Td>5 Mbps per viewer</Table.Td>
            <Table.Td>5 Mbps</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td></Table.Td>
            <Table.Td>
              <Button
                onClick={() => {
                  props.startFileShare(false, { convert });
                  props.closeModal();
                }}
              >
                Start Fileshare
              </Button>
            </Table.Td>
            <Table.Td>
              {context.isSubscriber ? (
                <Button
                  color="orange"
                  onClick={() => {
                    props.startFileShare(true, { convert });
                    props.closeModal();
                  }}
                >
                  Start Fileshare w/Relay
                </Button>
              ) : (
                subscribeButton
              )}
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
      <Checkbox
        mt="md"
        disabled={!canConvert}
        checked={convert}
        onChange={(e) => setConvert(e.currentTarget.checked)}
        label="Convert video on my device (use if the video or audio doesn't play)"
        description={
          canConvert
            ? "Converts to a web-compatible format in your browser, which uses your CPU/GPU while sharing. Supports MP4, MOV, MKV, WebM and MPEG-TS (not AVI)."
            : "Your browser doesn't support WebCodecs, which is required for converting."
        }
      />
    </Modal>
  );
};
