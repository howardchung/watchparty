import React from 'react';
import './UserMenu.css';
import { Popup, Button } from 'semantic-ui-react';

export const UserMenu = ({
  user,
  socket,
  userToBeKicked,
  trigger,
  displayName,
  position,
}: {
  user: firebase.User;
  socket: SocketIOClient.Socket;
  userToBeKicked: string;
  trigger: any;
  icon?: string;
  displayName?: string;
  position?: any;
}) => {
  return (
    <Popup
      trigger={trigger}
      on="click"
      position={position}
      style={{ padding: 0, borderRadius: 0 }}
    >
      <div className="userMenuHeader">{displayName}</div>
      <div className="userMenuContent">
        <Button
          content="Kick"
          negative
          icon="ban"
          onClick={async () => {
            const token = await user?.getIdToken();
            socket.emit('kickUser', { userToBeKicked, uid: user?.uid, token });
          }}
        />
      </div>
    </Popup>
  );
};
