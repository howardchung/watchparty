import React, { useContext, useState } from "react";
import { Modal, Loader, Menu, Text, Checkbox } from "@mantine/core";
import { IconFile } from "@tabler/icons-react";
import { MetadataContext } from "../../MetadataContext";

export const MultiStreamModal = ({
  streams,
  setMedia,
  resetMultiSelect,
  startConvert,
}: {
  streams: { name: string; url: string; length: number; playFn?: () => void }[];
  setMedia: (value: string) => void;
  resetMultiSelect: () => void;
  startConvert: (sourceUrl?: string) => void;
}) => {
  const context = useContext(MetadataContext);
  const [convert, setConvert] = useState(false);
  return (
    <Modal opened onClose={resetMultiSelect} centered title="Select a file">
      {streams.length === 0 ? (
        <Loader />
      ) : (
        <>
          <Checkbox
            disabled={!context.isSubscriber}
            label="Convert media (use if no video or audio)"
            checked={convert}
            onChange={(e) => setConvert(e.target.checked)}
          />
          <Menu>
            {streams.map((file) => (
              <Menu.Item
                leftSection={<IconFile />}
                onClick={() => {
                  if (convert) {
                    startConvert(file.url);
                  } else {
                    setMedia(file.url);
                  }
                  resetMultiSelect();
                }}
              >
                {file.name}
                <Text size="sm">{file.length.toLocaleString()} bytes</Text>
              </Menu.Item>
            ))}
          </Menu>
        </>
      )}
    </Modal>
  );
};
