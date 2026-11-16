import React from "react";
import { Modal, Button } from "../UI/UI";
import { IconHome, IconRefresh } from "../Icons/Icons";

export const ErrorModal = ({ error }: { error: string }) => {
  return (
    <Modal opened onClose={() => {}} title={error} centered>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <Button
          size="lg"
          onClick={() => {
            window.location.reload();
          }}
          leftSection={<IconRefresh size={18} />}
        >
          Try again
        </Button>
        <Button
          size="lg"
          color="grey"
          onClick={() => {
            window.location.href = "/";
          }}
          leftSection={<IconHome size={18} />}
        >
          Go to home
        </Button>
      </div>
    </Modal>
  );
};
