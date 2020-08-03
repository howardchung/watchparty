import React, { useCallback } from 'react';
import { Modal, Header, Input, Icon } from 'semantic-ui-react';

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
      })
    );
    window.location.reload();
  }, [savedPasswords, roomId]);
  return (
    <Modal inverted basic open>
      <Header as="h1" style={{ textAlign: 'center' }}>
        This room requires a password.
      </Header>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Input
          id="roomPassword"
          type="password"
          size="large"
          onKeyPress={(e: any) => e.key === 'Enter' && setPassword()}
          icon={
            <Icon onClick={setPassword} name="key" inverted circular link />
          }
        />
      </div>
    </Modal>
  );
};
