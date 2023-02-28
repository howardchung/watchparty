import React, { useState } from 'react';
import { Modal, Header, Input } from 'semantic-ui-react';

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
    <Modal open centered={false} size="tiny" onClose={closeInviteModal}>
      <Modal.Header as="h3">Invite friends and watch together!</Modal.Header>
      <Modal.Content>
        <Header as="h5">Copy and share this link:</Header>
        <Input
          fluid
          readOnly
          action={{
            color: 'teal',
            labelPosition: 'right',
            icon: 'copy',
            content: 'Copy',
            onClick: handleCopyInviteLink,
          }}
          defaultValue={window.location.href}
        />
        {inviteLinkCopied && (
          <div style={{ marginTop: 15 }}>
            <b style={{ color: 'green' }}>Link copied to clipboard.</b>
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
};
