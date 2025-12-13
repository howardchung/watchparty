import React from "react";
import { Modal, Loader, Menu, Text } from "@mantine/core";
import { IconFile } from "@tabler/icons-react";

export const MultiStreamModal = ({
  streams,
  setMedia,
  resetMultiSelect,
}: {
  streams: { name: string; url: string; length: number; playFn?: () => void }[];
  setMedia: (value: string) => void;
  resetMultiSelect: () => void;
}) => (
  <Modal opened onClose={resetMultiSelect} centered title="Select a file">
    {streams.length === 0 && <Loader />}
    {streams && (
      <Menu>
        {streams.map((file) => (
          <Menu.Item
            leftSection={<IconFile />}
            onClick={() => {
              setMedia(file.url);
              resetMultiSelect();
            }}
          >
            {file.name}
            <Text size="sm">{file.length.toLocaleString()} bytes</Text>
          </Menu.Item>
        ))}
      </Menu>
    )}
  </Modal>
);
