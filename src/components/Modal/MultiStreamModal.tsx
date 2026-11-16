import React from "react";
import { Modal, Loader, Menu, Text } from "../UI/UI";
import { IconFile } from "../Icons/Icons";

export const MultiStreamModal = ({
  streams,
  setMedia,
  resetMultiSelect,
}: {
  streams: { name: string; url: string; length: number; playFn?: () => void }[];
  setMedia: (value: string) => void;
  resetMultiSelect: () => void;
}) => {
  return (
    <Modal opened onClose={resetMultiSelect} centered title="Select a file">
      {streams.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
          <Loader />
        </div>
      ) : (
        <Menu>
          {streams.map((file) => (
            <Menu.Item
              key={file.url}
              leftSection={<IconFile size={17} />}
              onClick={() => {
                setMedia(file.url);
                resetMultiSelect();
              }}
            >
              <div>{file.name}</div>
              <Text size="xs" c="grey">
                {file.length.toLocaleString()} bytes
              </Text>
            </Menu.Item>
          ))}
        </Menu>
      )}
    </Modal>
  );
};
