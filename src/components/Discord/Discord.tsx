import { useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { serverPath } from '../../utils';

type DiscordProps = {
  user?: firebase.User;
};

export const Discord = ({ user }: DiscordProps) => {
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
      await window.fetch(serverPath + '/discord/auth', {
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
      window.opener.location.reload(false);
      window.close();
    }
    if (user) {
      auth();
    }
  }, [user]);

  return null;
};
