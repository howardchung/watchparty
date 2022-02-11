import React, { useState } from 'react';
import './UserMenu.css';
import { Popup, Button } from 'semantic-ui-react';
import { Socket } from 'socket.io-client';
import firebase from 'firebase/compat/app';

export const UserMenu = ({
  user,
  socket,
  userToManage,
  trigger,
  displayName,
  position,
  disabled,
  timestamp,
  isChatMessage,
}: {
  user?: firebase.User;
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
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  return (
    <Popup
      className="userMenu"
      trigger={trigger}
      on="click"
      open={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      position={position}
      disabled={disabled}
    >
      <div className="userMenuHeader">{displayName}</div>
      <div className="userMenuContent">
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
