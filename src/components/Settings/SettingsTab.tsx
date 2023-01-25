import React, { useState, useCallback } from 'react';
import {
  Icon,
  Divider,
  Radio,
  CheckboxProps,
  Message,
  Input,
  Button,
  Label,
  Popup,
} from 'semantic-ui-react';
// import { SignInButton } from '../TopBar/TopBar';
import { getCurrentSettings, updateSettings } from './LocalSettings';
import axios from 'axios';
import { serverPath } from '../../utils';
import { PermanentRoomModal } from '../Modal/PermanentRoomModal';
import firebase from 'firebase/compat/app';
import { Socket } from 'socket.io-client';
import { HexColorPicker } from 'react-colorful';

const defaultRoomTitleColor = '#FFFFFF';
const roomTitleMaxCharLength = 50;
const roomDescriptionMaxCharLength = 120;

interface SettingsTabProps {
  hide: boolean;
  user: firebase.User | undefined;
  roomLock: string;
  setRoomLock: Function;
  socket: Socket;
  isSubscriber: boolean;
  roomId: string;
  owner: string | undefined;
  setOwner: Function;
  vanity: string | undefined;
  setVanity: Function;
  roomLink: string;
  password: string | undefined;
  setPassword: Function;
  isChatDisabled: boolean;
  setIsChatDisabled: Function;
  clearChat: Function;
  roomTitle: string | undefined;
  setRoomTitle: Function;
  roomDescription: string | undefined;
  setRoomDescription: Function;
  roomTitleColor: string | undefined;
  setRoomTitleColor: Function;
  mediaPath: string | undefined;
  setMediaPath: Function;
}

export const SettingsTab = ({
  hide,
  user,
  roomLock,
  setRoomLock,
  socket,
  isSubscriber,
  owner,
  vanity,
  setVanity,
  roomLink,
  password,
  setPassword,
  isChatDisabled,
  setIsChatDisabled,
  clearChat,
  roomTitle,
  roomDescription,
  roomTitleColor,
  mediaPath,
  setMediaPath,
}: SettingsTabProps) => {
  const [updateTS, setUpdateTS] = useState(0);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [validVanity, setValidVanity] = useState(true);
  const [validVanityLoading, setValidVanityLoading] = useState(false);
  const [adminSettingsChanged, setAdminSettingsChanged] = useState(false);
  const [roomTitleInput, setRoomTitleInput] = useState<string | undefined>(
    undefined
  );
  const [roomDescriptionInput, setRoomDescriptionInput] = useState<
    string | undefined
  >(undefined);
  const [roomTitleColorInput, setRoomTitleColorInput] = useState<
    string | undefined
  >('');

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
  const setRoomOwner = useCallback(
    async (data: any) => {
      const token = await user?.getIdToken();
      socket.emit('CMD:setRoomOwner', {
        uid: user?.uid,
        token,
        ...data,
      });
    },
    [socket, user]
  );
  const checkValidVanity = useCallback(
    async (input: string) => {
      if (!input) {
        setValidVanity(true);
        return;
      }
      setValidVanity(false);
      setValidVanityLoading(true);
      const response = await axios.get(serverPath + '/resolveRoom/' + input);
      const data = response.data;
      setValidVanityLoading(false);
      if (
        data &&
        data.vanity &&
        data.vanity !== roomLink.split('/').slice(-1)[0]
      ) {
        // Already exists and doesn't match current room
        setValidVanity(false);
      } else {
        setValidVanity(true);
      }
    },
    [setValidVanity, roomLink]
  );
  const disableLocking =
    !Boolean(user) || Boolean(roomLock && roomLock !== user?.uid);
  const disableOwning = !Boolean(user) || Boolean(owner && owner !== user?.uid);

  return (
    <div
      style={{
        display: hide ? 'none' : 'block',
        color: 'white',
        overflow: 'scroll',
        padding: '8px',
      }}
    >
      {permModalOpen && (
        <PermanentRoomModal
          closeModal={() => setPermModalOpen(false)}
        ></PermanentRoomModal>
      )}
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
        disabled={disableLocking && disableOwning}
        onChange={(_e, data) => setRoomLock(data.checked)}
      />
      {
        <SettingRow
          icon={'clock'}
          name={`Make Room Permanent`}
          description={
            'Prevent this room from expiring. This also unlocks additional room features.'
          }
          helpIcon={
            <Icon
              name="help circle"
              onClick={() => setPermModalOpen(true)}
              style={{ cursor: 'pointer' }}
            ></Icon>
          }
          checked={Boolean(owner)}
          disabled={disableOwning}
          onChange={(_e, data) => setRoomOwner({ undo: !data.checked })}
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
              value={password}
              size="mini"
              onChange={(e) => {
                setAdminSettingsChanged(true);
                setPassword(e.target.value);
              }}
              fluid
            />
          }
          disabled={false}
        />
      )}
      {owner && owner === user?.uid && (
        <SettingRow
          icon={'folder'}
          name={`Set Room Media Source`}
          description="Set a media source URL with files to replace the default examples. Supports S3 buckets and nginx file servers."
          content={
            <Input
              value={mediaPath}
              size="mini"
              onChange={(e) => {
                setAdminSettingsChanged(true);
                setMediaPath(e.target.value);
              }}
              fluid
            />
          }
          disabled={false}
        />
      )}
      {owner && owner === user?.uid && (
        <SettingRow
          icon={'i cursor'}
          name={`Disable Chat`}
          description="Prevent users from sending messages in chat."
          checked={Boolean(isChatDisabled)}
          disabled={false}
          onChange={(_e, data) => {
            setAdminSettingsChanged(true);
            setIsChatDisabled(Boolean(data.checked));
          }}
        />
      )}
      {owner && owner === user?.uid && (
        <SettingRow
          icon={'i delete'}
          name={`Clear Chat`}
          description="Delete all existing chat messages"
          disabled={false}
          content={
            <Button
              color="red"
              icon
              labelPosition="left"
              onClick={() => clearChat()}
            >
              <Icon name="delete" />
              Delete Messages
            </Button>
          }
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
                value={vanity}
                disabled={!isSubscriber}
                onChange={(e) => {
                  setAdminSettingsChanged(true);
                  checkValidVanity(e.target.value);
                  setVanity(e.target.value);
                }}
                label={<Label>{`${window.location.origin}/r/`}</Label>}
                loading={validVanityLoading}
                fluid
                size="mini"
                icon
                action={
                  validVanity ? (
                    <Icon name="checkmark" color="green" />
                  ) : (
                    <Icon name="close" color="red" />
                  )
                }
              ></Input>
            </React.Fragment>
          }
        />
      )}
      {owner && owner === user?.uid && (
        <SettingRow
          icon={'pencil'}
          name={`Set Room Title, Description & Color`}
          description="Set the room title, description and title color to be displayed in the top bar."
          disabled={!isSubscriber}
          subOnly={true}
          content={
            <React.Fragment>
              <div style={{ display: 'flex', marginBottom: 2 }}>
                <Input
                  style={{ marginRight: 3, flexGrow: 1 }}
                  value={roomTitleInput ?? roomTitle}
                  disabled={!isSubscriber}
                  maxLength={roomTitleMaxCharLength}
                  onChange={(e) => {
                    setAdminSettingsChanged(true);
                    setRoomTitleInput(e.target.value);
                  }}
                  placeholder={`Title (max. ${roomTitleMaxCharLength} characters)`}
                  fluid
                  size="mini"
                  icon
                ></Input>
                <Popup
                  content={
                    <React.Fragment>
                      <h5>Edit Title Color</h5>
                      <HexColorPicker
                        color={
                          roomTitleColorInput ||
                          roomTitleColor ||
                          defaultRoomTitleColor
                        }
                        onChange={(e) => {
                          setAdminSettingsChanged(true);
                          setRoomTitleColorInput(e);
                        }}
                      />
                      <div
                        style={{
                          marginTop: 8,
                          paddingLeft: 4,
                          borderLeft: `24px solid ${roomTitleColorInput}`,
                        }}
                      >
                        {roomTitleColorInput?.toUpperCase()}
                      </div>
                    </React.Fragment>
                  }
                  on="click"
                  trigger={
                    <Button
                      icon
                      color="teal"
                      size="tiny"
                      style={{ margin: 0 }}
                      disabled={!isSubscriber}
                    >
                      <Icon name="paint brush" />
                    </Button>
                  }
                />
              </div>
              <Input
                style={{ marginBottom: 2 }}
                value={roomDescriptionInput ?? roomDescription}
                disabled={!isSubscriber}
                maxLength={roomDescriptionMaxCharLength}
                onChange={(e) => {
                  setAdminSettingsChanged(true);
                  setRoomDescriptionInput(e.target.value);
                }}
                placeholder={`Description (max. ${roomDescriptionMaxCharLength} characters)`}
                fluid
                size="mini"
                icon
              ></Input>
            </React.Fragment>
          }
        />
      )}
      <div
        style={{
          borderTop: '3px dashed white',
          marginTop: 10,
          marginBottom: 10,
        }}
      />
      {owner && owner === user?.uid && (
        <Button
          primary
          disabled={!validVanity || !adminSettingsChanged}
          labelPosition="left"
          icon
          fluid
          onClick={() => {
            setRoomState({
              vanity: vanity,
              password: password,
              isChatDisabled: isChatDisabled,
              roomTitle: roomTitleInput ?? roomTitle,
              roomDescription: roomDescriptionInput ?? roomDescription,
              roomTitleColor:
                roomTitleColorInput || roomTitleColor || defaultRoomTitleColor,
              mediaPath: mediaPath,
            });
            setAdminSettingsChanged(false);
          }}
        >
          <Icon name="save" />
          Save Admin Settings
        </Button>
      )}
      <div className="sectionHeader">Local Settings</div>
      <SettingRow
        updateTS={updateTS}
        icon="bell"
        name="Disable chat notification sound"
        description="Don't play a sound when a chat message is sent while you're on another tab"
        checked={Boolean(getCurrentSettings().disableChatSound)}
        disabled={false}
        onChange={(_e, data) => {
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
  content,
  subOnly,
  helpIcon,
}: {
  icon: string;
  name: string;
  description?: React.ReactNode;
  checked?: boolean;
  disabled: boolean;
  updateTS?: number;
  onChange?: (e: React.FormEvent, data: CheckboxProps) => void;
  content?: React.ReactNode;
  subOnly?: boolean;
  helpIcon?: React.ReactNode;
}) => {
  return (
    <React.Fragment>
      <Divider inverted horizontal />
      <div>
        <div style={{ display: 'flex' }}>
          <Icon size="large" name={icon as any} />
          <div>
            {name} {helpIcon}
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
        <div className="smallText" style={{ marginBottom: '8px' }}>
          {description}
        </div>
        {content}
      </div>
    </React.Fragment>
  );
};
