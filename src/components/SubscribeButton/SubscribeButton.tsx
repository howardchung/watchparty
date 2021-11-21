import React, { useCallback, useState } from 'react';
import { Button, Icon, Popup } from 'semantic-ui-react';
import { serverPath } from '../../utils';
import { SubscribeModal } from '../Modal/SubscribeModal';
import firebase from 'firebase/compat/app';

export const SubscribeButton = ({
  user,
  isSubscriber,
  isCustomer,
}: {
  user: firebase.User | undefined;
  isSubscriber: boolean;
  isCustomer: boolean;
}) => {
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const onManage = useCallback(async () => {
    const resp = await window.fetch(serverPath + '/manageSub', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: user?.uid,
        token: await user?.getIdToken(),
        return_url: window.location.href,
      }),
    });
    const session = await resp.json();
    console.log(session);
    window.location.assign(session.url);
  }, [user]);
  return (
    <>
      {isSubscribeModalOpen && (
        <SubscribeModal
          user={user}
          isSubscriber={isSubscriber}
          closeSubscribe={() => setIsSubscribeModalOpen(false)}
        />
      )}
      {!isSubscriber && (
        <Popup
          content="Subscribe to help support us and enable additional features!"
          trigger={
            <Button
              fluid
              color="orange"
              className="toolButton"
              icon
              labelPosition="left"
              onClick={() => setIsSubscribeModalOpen(true)}
            >
              <Icon name="plus" />
              Subscribe
            </Button>
          }
        />
      )}
      {isSubscriber && (
        <Popup
          content="Manage your subscription"
          trigger={
            <Button
              fluid
              color="orange"
              className="toolButton"
              icon
              labelPosition="left"
              onClick={onManage}
            >
              <Icon name="wrench" />
              Manage
            </Button>
          }
        />
      )}
    </>
  );
};
