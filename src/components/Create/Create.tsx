import React, { useRef } from 'react';
import firebase from 'firebase/compat/app';
import { createRoom } from '../TopBar/TopBar';
import querystring from 'querystring';
import { Dimmer, Loader } from 'semantic-ui-react';

export const Create = ({ user }: { user: firebase.User | undefined }) => {
  const buttonEl = useRef<HTMLButtonElement>(null);
  setTimeout(() => {
    buttonEl?.current?.click();
  }, 1000);
  return (
    <Dimmer active>
      <Loader>Creating room. . .</Loader>
      <button
        style={{ display: 'none' }}
        ref={buttonEl}
        onClick={() => {
          console.log(user);
          createRoom(
            user,
            false,
            querystring.parse(window.location.search.substring(1))
              .video as string
          );
        }}
      />
    </Dimmer>
  );
};
