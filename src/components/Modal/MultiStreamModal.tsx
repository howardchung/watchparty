import React from 'react';
import { Modal, Loader, List } from 'semantic-ui-react';

export const MultiStreamModal = ({
  streams,
  setMedia,
  resetMultiSelect,
}: {
  streams: { name: string; url: string; length: number; playFn?: Function }[];
  setMedia: Function;
  resetMultiSelect: Function;
}) => (
  <Modal inverted basic open closeIcon onClose={resetMultiSelect as any}>
    <Modal.Header>Select a file</Modal.Header>
    <Modal.Content>
      {streams.length === 0 && <Loader />}
      {streams && (
        <List inverted>
          {streams.map((file) => (
            <List.Item>
              <List.Icon name="file" />
              <List.Content>
                <List.Header
                  as="a"
                  onClick={() => {
                    if (file.playFn) {
                      file.playFn();
                    } else {
                      setMedia(null, { value: file.url });
                    }
                    resetMultiSelect();
                  }}
                >
                  {file.name}
                </List.Header>
                <List.Description>
                  {file.length.toLocaleString()} bytes
                </List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>
      )}
    </Modal.Content>
  </Modal>
);
