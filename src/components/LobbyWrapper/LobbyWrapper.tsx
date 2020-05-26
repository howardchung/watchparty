import React from 'react';

export const LobbyContext = React.createContext<{
  io?: SocketIO.Socket;
}>({
  io: undefined,
});
// Placeholder component for handling lobby data later

const LobbyWrapper: React.FC<{ io?: SocketIO.Socket }> = (props) => {
  const { children, io } = props;

  return (
    <LobbyContext.Provider value={{ io }}>{children}</LobbyContext.Provider>
  );
};

export default LobbyWrapper;
