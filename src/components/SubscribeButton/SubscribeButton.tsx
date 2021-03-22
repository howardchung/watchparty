import React from 'react';
import { Button, Icon, Popup } from 'semantic-ui-react';

export const SubscribeButton = ({
  isSubscriber,
  isCustomer,
  openSubscribeModal,
  openManage,
}: {
  isSubscriber: boolean;
  isCustomer: boolean;
  openSubscribeModal: () => void;
  openManage: () => void;
}) => {
  return (
    <>
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
              onClick={openSubscribeModal}
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
              onClick={openManage}
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
