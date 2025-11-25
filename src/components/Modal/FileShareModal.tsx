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
      <ul>
        <li>This feature is only supported on Chrome and Edge.</li>
        <li>
          Certain codecs such as AC3 aren't supported in Chrome (they work in
          Edge due to licensing)
        </li>
      </ul>
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
            <Table.Td>Method</Table.Td>
            <Table.Td>Stream your video to each viewer individually.</Table.Td>
            <Table.Td>
              Our relay server streams to viewers for you.
              <br />
              Higher quality and lower bandwidth usage.
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Latency</Table.Td>
            <Table.Td>{`< 1s`}</Table.Td>
            <Table.Td>{`< 1s`}</Table.Td>
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
                  props.startFileShare(false);
                  props.closeModal();
                }}
              >
                Start Fileshare
              </Button>
            </Table.Td>
            <Table.Td>
              <div style={{ display: 'flex', gap: '4px' }}>
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
                {context.beta ? (
                  <Button
                    color="green"
                    onClick={() => {
                      props.startConvert();
                      props.closeModal();
                    }}
                  >
                    Start Fileshare w/Convert
                  </Button>
                ) : null}
              </div>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Modal>
  );
};
