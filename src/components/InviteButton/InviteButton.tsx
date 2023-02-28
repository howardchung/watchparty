import React, { useState } from 'react';
import { Button, Icon, Popup } from 'semantic-ui-react';
import { InviteModal } from '../Modal/InviteModal';

export const InviteButton = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <>
      {inviteModalOpen && (
        <InviteModal closeInviteModal={() => setInviteModalOpen(false)} />
      )}
      <Popup
        content="Invite friends!"
        trigger={
          <Button
            color="green"
            icon
            labelPosition="left"
            fluid
            className="toolButton"
            style={{ minWidth: '12em' }}
            onClick={() => setInviteModalOpen(true)}
          >
            <Icon name="add user" />
            Invite Friends
          </Button>
        }
      />
    </>
  );
};
