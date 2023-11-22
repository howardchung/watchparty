import React, { useCallback, useContext, useState } from 'react';
import { Button, Icon, Popup } from 'semantic-ui-react';
import { serverPath } from '../../utils';
import { SubscribeModal } from '../Modal/SubscribeModal';
import { MetadataContext } from '../../MetadataContext';

export const SubscribeButton = () => {
  const { isSubscriber } = useContext(MetadataContext);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  if (isSubscriber) {
    return null;
  }
  return (
    <>
      {isSubscribeModalOpen && (
        <SubscribeModal closeSubscribe={() => setIsSubscribeModalOpen(false)} />
      )}
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
    </>
  );
};

export const ManageSubButton = ({}: {}) => {
  const { user } = useContext(MetadataContext);
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
    <Button
      fluid
      color="orange"
      className="toolButton"
      icon
      labelPosition="left"
      onClick={onManage}
    >
      <Icon name="wrench" />
      Manage Subscription
    </Button>
  );
};
