import React, { useState } from "react";
import { Modal, TextInput, ActionIcon } from "../UI/UI";
import { IconCopy } from "../Icons/Icons";

export const InviteModal = ({
  closeInviteModal,
}: {
  closeInviteModal: () => void;
}) => {
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setInviteLinkCopied(true);
  };

  return (
    <Modal
      opened
      centered
      onClose={closeInviteModal}
      title="Invite friends and watch together!"
    >
      <TextInput
        label="Copy and share this link:"
        readOnly
        rightSection={
          <ActionIcon size="sm" onClick={handleCopyInviteLink} color="teal">
            <IconCopy size={15} />
          </ActionIcon>
        }
        defaultValue={window.location.href}
      />
      {inviteLinkCopied && (
        <div style={{ marginTop: 12 }}>
          <b style={{ color: "var(--accent-emerald)" }}>
            Link copied to clipboard.
          </b>
        </div>
      )}
    </Modal>
  );
};
