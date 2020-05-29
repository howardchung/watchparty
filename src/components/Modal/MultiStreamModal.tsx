import React from 'react';
import { Modal, Loader, List } from 'semantic-ui-react';

export const MultiStreamModal = ({
  streams,
  setMedia,
  resetMultiSelect,
}: {
  streams: any[];
  setMedia: Function;
  resetMultiSelect: Function;
}) => (
  <Modal inverted basic open closeIcon onClose={resetMultiSelect as any}>
    <Modal.Header>Select a file</Modal.Header>
    <Modal.Content>
      {streams.length === 0 && <Loader />}
      {streams && (
        <List inverted>
          {streams.map((file: any) => (
            <List.Item>
              <List.Icon name="file" />
              <List.Content>
                <List.Header
                  as="a"
                  onClick={() => {
                    setMedia(null, { value: file.url });
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
