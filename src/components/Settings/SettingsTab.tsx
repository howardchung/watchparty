import React, { useState } from 'react';
import {
  Icon,
  Divider,
  Radio,
  CheckboxProps,
  Message,
} from 'semantic-ui-react';
// import { SignInButton } from '../TopBar/TopBar';
import { getCurrentSettings, updateSettings } from './LocalSettings';

export const SettingsTab = ({
  hide,
  user,
  roomLock,
  setRoomLock,
}: {
  hide: boolean;
  user: firebase.User | undefined;
  roomLock: string;
  setRoomLock: Function;
}) => {
  const [updateTS, setUpdateTS] = useState(0);
  // TODO display person who locked? tricky if they're disconnected
  const lockDisabled =
    !Boolean(user) || Boolean(roomLock && roomLock !== user?.uid);
  return (
    <div style={{ display: hide ? 'none' : 'block', color: 'white' }}>
      <div className="sectionHeader">Room Settings</div>
      <SettingRow
        icon={roomLock ? 'lock' : 'lock open'}
        name={`Lock Room`}
        description="When locked, only the locker can control the video"
        checked={Boolean(roomLock)}
        disabled={lockDisabled}
        onChange={(e, data) => setRoomLock(data.checked)}
      />
      {!Boolean(user) && !Boolean(roomLock) && (
        <Message color="yellow">
          You need to be signed in to lock the room.
        </Message>
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
}: {
  icon: string;
  name: string;
  description: React.ReactNode;
  checked: boolean;
  disabled: boolean;
  onChange: (e: React.FormEvent, data: CheckboxProps) => void;
  updateTS?: number;
}) => {
  return (
    <React.Fragment>
      <Divider inverted horizontal />

      <div>
        <div style={{ display: 'flex' }}>
          <Icon size="large" name={icon as any} />
          <div>{name}</div>
          <Radio
            style={{ marginLeft: 'auto' }}
            toggle
            checked={checked}
            disabled={disabled}
            onChange={onChange}
          />
        </div>
        <div className="smallText">{description}</div>
      </div>
    </React.Fragment>
  );
};
