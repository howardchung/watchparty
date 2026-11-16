import React, { useCallback, useContext, useState } from "react";
import { Button } from "../UI/UI";
import { serverPath } from "../../utils/utils";
import { SubscribeModal } from "../Modal/SubscribeModal";
import { MetadataContext } from "../../MetadataContext";
import { IconStarFilled, IconTool } from "../Icons/Icons";

export const SubscribeButton = () => {
  const { isSubscriber } = useContext(MetadataContext);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  if (isSubscriber === undefined || isSubscriber) {
    return null;
  }
  return (
    <>
      {isSubscribeModalOpen && (
        <SubscribeModal closeSubscribe={() => setIsSubscribeModalOpen(false)} />
      )}
      <Button
        leftSection={<IconStarFilled size={16} />}
        color="orange"
        onClick={() => setIsSubscribeModalOpen(true)}
      >
        Subscribe
      </Button>
    </>
  );
};

export const ManageSubButton = ({}: {}) => {
  const { user } = useContext(MetadataContext);
  const onManage = useCallback(async () => {
    const resp = await fetch(serverPath + "/manageSub", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      leftSection={<IconTool size={16} />}
      color="orange"
      onClick={onManage}
    >
      Manage Subscription
    </Button>
  );
};
