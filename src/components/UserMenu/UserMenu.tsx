import React, { useContext, useState } from 'react';
import { Popup, Button } from 'semantic-ui-react';
import { Socket } from 'socket.io-client';
import styles from './UserMenu.module.css';
import { MetadataContext } from '../../MetadataContext';

export const UserMenu = ({
  socket,
  userToManage,
  trigger,
  displayName,
  position,
  disabled,
  timestamp,
  isChatMessage,
}: {
  socket: Socket;
  userToManage: string;
  trigger: any;
  icon?: string;
  displayName?: string;
  position?: any;
  disabled: boolean;
  timestamp?: string;
  isChatMessage?: boolean;
}) => {
  const { user } = useContext(MetadataContext);
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  return (
    <Popup
      className={styles.userMenu}
      trigger={trigger}
      on="click"
      open={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      position={position}
      disabled={disabled}
    >
      <div className={styles.userMenuHeader}>{displayName}</div>
      <div className={styles.userMenuContent}>
        <Button.Group vertical labeled icon>
          <Button
            content="Kick"
            negative
            icon="ban"
            onClick={async () => {
              const token = await user?.getIdToken();
              socket.emit('kickUser', {
                userToBeKicked: userToManage,
                uid: user?.uid,
                token,
              });
              setIsOpen(false);
            }}
          />
          {isChatMessage && (
            <Button
              content="Delete Message"
              icon="comment"
              onClick={async () => {
                const token = await user?.getIdToken();
                socket.emit('CMD:deleteChatMessages', {
                  author: userToManage,
                  timestamp: timestamp,
                  uid: user?.uid,
                  token,
                });
                setIsOpen(false);
              }}
            />
          )}
          <Button
            content="Delete User's Messages"
            icon="comments"
            onClick={async () => {
              const token = await user?.getIdToken();
              socket.emit('CMD:deleteChatMessages', {
                author: userToManage,
                uid: user?.uid,
                token,
              });
              setIsOpen(false);
            }}
          />
        </Button.Group>
      </div>
    </Popup>
  );
};
