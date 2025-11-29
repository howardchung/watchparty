import React, { useContext } from 'react';
import { Modal, Button, Table } from '@mantine/core';
import { SubscribeButton } from '../SubscribeButton/SubscribeButton';
import { MetadataContext } from '../../MetadataContext';

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
            <Table.Th>WatchParty Plus (Convert)</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Method</Table.Td>
            <Table.Td>Stream your video to each viewer from your device. May not work with codecs not playable in browsers.</Table.Td>
            <Table.Td>
              Stream your video to our relay server, which sends it to each viewer, reducing bandwidth usage. May not work with codecs not playable in browsers.
            </Table.Td>
            <Table.Td>
              We convert your video in real-time to a web-compatible format and serve the result. Avoids codec compatibility issues and allows more viewers.
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Latency</Table.Td>
            <Table.Td>{`<1s`}</Table.Td>
            <Table.Td>{`<1s`}</Table.Td>
            <Table.Td>{`~5s`}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Recommended Max Viewers</Table.Td>
            <Table.Td>5</Table.Td>
            <Table.Td>20</Table.Td>
            <Table.Td>100</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Recommended Upload Speed</Table.Td>
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
                Start Fileshare
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
                    Start Fileshare w/Relay
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
                    Start Fileshare w/Convert
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
