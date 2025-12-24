import React, { useCallback, useContext, useEffect } from "react";
import { Modal, PasswordInput, ActionIcon } from "@mantine/core";
import { IconKey } from "@tabler/icons-react";
import { addAndSavePassword, serverPath } from "../../utils/utils";
import { MetadataContext } from "../../MetadataContext";

export const PasswordModal = ({ roomId }: { roomId: string }) => {
  const setPassword = useCallback(() => {
    const password = (
      document.getElementById("roomPassword") as HTMLInputElement
    )?.value;
    addAndSavePassword(roomId, password);
    window.location.reload();
  }, [roomId]);
  const { user } = useContext(MetadataContext);
  useEffect(() => {
    const update = async () => {
      // Make sure we have the password for this room if we're the owner
      if (user) {
        const token = await user.getIdToken();
        const response = await fetch(
          serverPath + `/listRooms?uid=${user.uid}&token=${token}`,
        );
        if (response.ok) {
          const rooms = await response.json();
          const target = rooms.find((r: any) => r.roomId === roomId);
          if (target?.password) {
            addAndSavePassword(target.roomId, target.password);
            window.location.reload();
          }
        }
      }
    };
    update();
  }, [user]);
  return (
    <Modal
      onClose={() => {}}
      withCloseButton={false}
      opened
      centered
      size="md"
      title="This room requires a password"
    >
      <PasswordInput
        id="roomPassword"
        onKeyDown={(e: any) => e.key === "Enter" && setPassword()}
        rightSection={
          <ActionIcon onClick={setPassword}>
            <IconKey size={16} />
          </ActionIcon>
        }
      />
    </Modal>
  );
};
