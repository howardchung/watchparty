import { useContext, useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import { serverPath } from '../../utils';
import { MetadataContext } from '../../MetadataContext';

export const Discord = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useContext(MetadataContext);
  useEffect(() => {
    async function auth() {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const [accessToken, tokenType] = [
        fragment.get('access_token'),
        fragment.get('token_type'),
      ];
      const token = await user?.getIdToken();
      const authResponse = await window.fetch(serverPath + '/linkAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user?.uid,
          kind: 'discord',
          token: token,
          tokenType,
          accessToken,
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
