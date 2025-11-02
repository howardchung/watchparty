import React, { useCallback } from 'react';
import { Modal, PasswordInput, ActionIcon } from '@mantine/core';
import { IconKey } from '@tabler/icons-react';

export const PasswordModal = ({
  savedPasswords,
  roomId,
}: {
  savedPasswords: StringDict;
  roomId: string;
}) => {
  const setPassword = useCallback(() => {
    window.localStorage.setItem(
      'watchparty-passwords',
      JSON.stringify({
        ...savedPasswords,
        [roomId]: (document.getElementById('roomPassword') as HTMLInputElement)
          ?.value,
      }),
    );
    window.location.reload();
  }, [savedPasswords, roomId]);
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
        onKeyDown={(e: any) => e.key === 'Enter' && setPassword()}
        rightSection={
          <ActionIcon onClick={setPassword}>
            <IconKey size={16} />
          </ActionIcon>
        }
      />
    </Modal>
  );
};
