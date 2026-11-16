import React from "react";
import { Menu } from "../UI/UI";
import { Socket } from "socket.io-client";
import { IconBan, IconTrashFilled, IconX } from "../Icons/Icons";

export const UserMenu = ({
  socket,
  userToManage,
  trigger,
  displayName,
  disabled,
  timestamp,
  isChatMessage,
}: {
  socket: Socket;
  userToManage: string;
  trigger: React.ReactNode;
  icon?: string;
  displayName?: string;
  disabled: boolean;
  timestamp?: string;
  isChatMessage?: boolean;
}) => {
  return (
    <Menu
      closeOnItemClick
      closeOnClickOutside
      disabled={disabled}
      trigger="click"
    >
      <Menu.Target>{trigger}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{displayName}</Menu.Label>
        {isChatMessage && (
          <Menu.Item
            leftSection={<IconX size={16} />}
            onClick={async () => {
              socket.emit("CMD:deleteChatMessages", {
                author: userToManage,
                timestamp: timestamp,
              });
            }}
          >
            Delete Message
          </Menu.Item>
        )}
        <Menu.Item
          leftSection={<IconTrashFilled size={16} />}
          onClick={async () => {
            socket.emit("CMD:deleteChatMessages", {
              author: userToManage,
            });
          }}
        >
          Delete User's Messages
        </Menu.Item>
        <Menu.Item
          leftSection={<IconBan size={16} />}
          onClick={async () => {
            socket.emit("CMD:kickUser", {
              userToBeKicked: userToManage,
            });
          }}
        >
          Kick User
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
