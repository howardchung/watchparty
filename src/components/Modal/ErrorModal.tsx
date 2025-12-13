import React from "react";
import { Modal, Button } from "@mantine/core";
import { IconHome, IconRefresh } from "@tabler/icons-react";

export const ErrorModal = ({ error }: { error: string }) => {
  return (
    <Modal opened onClose={() => {}} title={error} centered>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <Button
          size="xl"
          onClick={() => {
            window.location.reload();
          }}
          leftSection={<IconRefresh />}
        >
          Try again
        </Button>
        <Button
          size="xl"
          onClick={() => {
            window.location.href = "/";
          }}
          leftSection={<IconHome />}
        >
          Go to home
        </Button>
      </div>
    </Modal>
  );
};
