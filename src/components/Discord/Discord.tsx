import { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import { serverPath } from '../../utils';

type DiscordProps = {
  user?: firebase.User;
};

export const Discord = ({ user }: DiscordProps) => {
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function auth() {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const [accessToken, tokenType] = [
        fragment.get('access_token'),
        fragment.get('token_type'),
      ];
      const result = await fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${tokenType} ${accessToken}`,
        },
      });
      const response = await result.json();
      const { username, discriminator } = response;

      const token = await user?.getIdToken();
      const authResponse = await window.fetch(serverPath + '/discord/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user?.uid,
          token,
          username,
          discriminator,
        }),
      });
      if (authResponse.status !== 200) {
        const body = await authResponse.json();
        setErrorMsg(body.error);
      } else {
        window.opener.location.reload(false);
        window.close();
      }
    }
    if (user) {
      auth();
    }
  }, [user]);

  if (errorMsg) {
    return <div style={{ color: 'red', fontSize: 20 }}>{errorMsg}</div>;
  }
  return null;
};
