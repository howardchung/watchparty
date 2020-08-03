import React, { useState, useEffect, useCallback } from 'react';
import {
  Icon,
  Divider,
  Radio,
  CheckboxProps,
  Message,
  Input,
  Button,
  Label,
} from 'semantic-ui-react';
// import { SignInButton } from '../TopBar/TopBar';
import { getCurrentSettings, updateSettings } from './LocalSettings';
import { Socket } from 'socket.io';
import axios from 'axios';
import { serverPath } from '../../utils';

export const SettingsTab = ({
  hide,
  user,
  roomLock,
  setRoomLock,
  socket,
  isSubscriber,
  owner,
  password,
  vanity,
}: {
  hide: boolean;
  user: firebase.User | undefined;
  roomLock: string;
  setRoomLock: Function;
  socket: Socket;
  isSubscriber: boolean;
  owner?: string;
  vanity?: string;
  password?: string;
}) => {
  const [updateTS, setUpdateTS] = useState(0);
  const [newVanity, setNewVanity] = useState(vanity);
  const [newPassword, setNewPassword] = useState(password);
  useEffect(() => {
    (async () => {
      if (socket) {
        const token = user ? await user?.getIdToken() : undefined;
        socket.emit('CMD:getRoomState', {
          uid: user?.uid,
          token,
        });
      }
    })();
  }, [socket, user]);
  const setRoomState = useCallback(
    async (data: any) => {
      const token = await user?.getIdToken();
      socket.emit('CMD:setRoomState', {
        uid: user?.uid,
        token,
        ...data,
      });
    },
    [socket, user]
  );
  const [validVanity, setValidVanity] = useState(true);
  const [validVanityLoading, setValidVanityLoading] = useState(false);
  const checkValidVanity = useCallback(
    async (input: string) => {
      setValidVanityLoading(true);
      const response = await axios.get(serverPath + '/resolveRoom/' + input);
      const data = response.data;
      setValidVanityLoading(false);
      // console.log(data.vanity, vanity);
      if (data && data.vanity && data.vanity !== vanity) {
        // Already exists and doesn't match current room
        setValidVanity(false);
      } else {
        setValidVanity(true);
      }
    },
    [setValidVanity, vanity]
  );
  const getVanityURL = () => `${window.location.origin}/r/${vanity}`;
  const lockDisabled =
    !Boolean(user) || Boolean(roomLock && roomLock !== user?.uid);

  return (
    <div style={{ display: hide ? 'none' : 'block', color: 'white' }}>
      <div className="sectionHeader">Room Settings</div>
      {!user && (
        <Message color="yellow" size="tiny">
          You need to be signed in to change these settings.
        </Message>
      )}
      <SettingRow
        icon={roomLock ? 'lock' : 'lock open'}
        name={`Lock Room`}
        description="Only the person who locked the room can control the video."
        checked={Boolean(roomLock)}
        disabled={lockDisabled}
        onChange={(e, data) => setRoomLock(data.checked)}
      />
      {
        <SettingRow
          icon={'clock'}
          name={`Make Room Permanent`}
          description="Standard rooms are deleted after one day of inactivity. Permanent rooms aren't deleted and can have passwords/custom URLs. Free users can only have one permanent room at a time."
          checked={Boolean(owner)}
          disabled={Boolean(owner && owner !== user?.uid)}
          onChange={(e, data) =>
            setRoomState({ owner: data.checked ? user?.uid : undefined })
          }
        />
      }
      {owner && owner === user?.uid && (
        <div className="sectionHeader">Admin Settings</div>
      )}
      {owner && owner === user?.uid && (
        <SettingRow
          icon={'key'}
          name={`Set Room Password`}
          description="Users must know this password in order to join the room."
          content={
            <Input
              defaultValue={password}
              onChange={(e) => setNewPassword(e.target.value)}
              fluid
            />
          }
          disabled={false}
        />
      )}
      {owner && owner === user?.uid && (
        <SettingRow
          icon={'linkify'}
          name={`Set Custom Room URL`}
          description="Set a custom URL for this room. Inappropriate names may be revoked."
          checked={Boolean(roomLock)}
          disabled={!isSubscriber}
          subOnly={true}
          content={
            <React.Fragment>
              <Input
                defaultValue={vanity}
                disabled={!isSubscriber}
                onChange={(e) => {
                  checkValidVanity(e.target.value);
                  setNewVanity(e.target.value);
                }}
                label={`${window.location.origin}/r/`}
                loading={validVanityLoading}
                fluid
                size="mini"
                icon
              >
                <input />
                {validVanity ? (
                  <Icon name="checkmark" color="green" />
                ) : (
                  <Icon name="close" color="red" />
                )}
              </Input>
              <p />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  size="mini"
                  icon="copy"
                  onClick={() => {
                    navigator.clipboard.writeText(getVanityURL());
                  }}
                />
                <Label color="orange">
                  {vanity ? getVanityURL() : window.location.href}
                </Label>
              </div>
            </React.Fragment>
          }
        />
      )}
      <p />
      {owner && owner === user?.uid && (
        <Button
          primary
          disabled={
            (vanity === newVanity && password === newPassword) || !validVanity
          }
          fluid
          onClick={() =>
            setRoomState({
              vanity: newVanity,
              password: newPassword,
              owner: owner,
            })
          }
        >
          Save Admin Settings
        </Button>
      )}
      {/* MEDIA_PATH */}
      <div className="sectionHeader">Local Settings</div>
      <SettingRow
        updateTS={updateTS}
        icon="bell"
        name="Disable chat notification sound"
        description="Don't play a sound when a chat message is sent while you're on another tab"
        checked={Boolean(getCurrentSettings().disableChatSound)}
        disabled={false}
        onChange={(e, data) => {
          updateSettings(
            JSON.stringify({
              ...getCurrentSettings(),
              disableChatSound: data.checked,
            })
          );
          setUpdateTS(Number(new Date()));
        }}
      />
    </div>
  );
};

const SettingRow = ({
  icon,
  name,
  description,
  checked,
  disabled,
  onChange,
  updateTS,
  content,
  subOnly,
}: {
  icon: string;
  name: string;
  description: React.ReactNode;
  checked?: boolean;
  disabled: boolean;
  updateTS?: number;
  onChange?: (e: React.FormEvent, data: CheckboxProps) => void;
  content?: React.ReactNode;
  subOnly?: boolean;
}) => {
  return (
    <React.Fragment>
      <Divider inverted horizontal />
      <div>
        <div style={{ display: 'flex' }}>
          <Icon size="large" name={icon as any} />
          <div>
            {name}{' '}
            {subOnly ? (
              <Label size="mini" color="orange">
                Subscriber only
              </Label>
            ) : null}
          </div>
          {!content && (
            <Radio
              style={{ marginLeft: 'auto' }}
              toggle
              checked={checked}
              disabled={disabled}
              onChange={onChange}
            />
          )}
        </div>
        <div className="smallText">{description}</div>
        {content}
      </div>
    </React.Fragment>
  );
};
