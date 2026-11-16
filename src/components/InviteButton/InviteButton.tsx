import React, { useState } from "react";
import { ActionIcon } from "../UI/UI";
import { InviteModal } from "../Modal/InviteModal";
import { IconUserPlus } from "../Icons/Icons";

export const InviteButton = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <>
      {inviteModalOpen && (
        <InviteModal closeInviteModal={() => setInviteModalOpen(false)} />
      )}
      <ActionIcon
        size="36px"
        color="green"
        title="Invite friends"
        onClick={() => setInviteModalOpen(true)}
      >
        <IconUserPlus size={18} />
      </ActionIcon>
    </>
  );
};
