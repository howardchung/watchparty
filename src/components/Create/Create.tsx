import React, { useContext, useRef } from 'react';
import { createRoom } from '../TopBar/TopBar';
import { Dimmer, Loader } from 'semantic-ui-react';
import { MetadataContext } from '../../MetadataContext';

export const Create = () => {
  const { user } = useContext(MetadataContext);
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
          createRoom(
            user,
            false,
            new URLSearchParams(window.location.search).get('video') ??
              undefined,
          );
        }}
      />
    </Dimmer>
  );
};
