import React from 'react';
import { Dropdown } from 'semantic-ui-react';

export const UserMenu = ({
  user,
  socket,
  style,
  userToBeKicked,
  trigger,
  icon,
}: {
  user: firebase.User;
  socket: SocketIOClient.Socket;
  style?: object;
  userToBeKicked: string;
  trigger: any;
  icon?: string;
}) => (
  <Dropdown trigger={trigger} style={style} icon={icon || null}>
    <Dropdown.Menu>
      <Dropdown.Item
        onClick={async () => {
          const token = await user?.getIdToken();
          socket.emit('kickUser', { userToBeKicked, uid: user?.uid, token });
        }}
      >
        Kick
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);
