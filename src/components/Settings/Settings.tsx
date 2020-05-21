import React from 'react';
//@ts-ignore
import { Button, Form, Header, Icon, Modal, TextArea } from 'semantic-ui-react';

export const SettingsModal = ({ trigger }: any) => (
  <Modal trigger={trigger} basic closeIcon size="small">
    <Header icon="setting" content="Settings" />
    <Modal.Content>
      <Form>
        <TextArea rows={10} id="settings_textarea">
          {window.localStorage.getItem('watchparty-setting') ||
            JSON.stringify(getDefaultSettings(), null, 2)}
        </TextArea>
      </Form>
    </Modal.Content>
    <Modal.Actions>
      <Button
        color="green"
        inverted
        onClick={() => {
          const newSetting = (document.getElementById(
            'settings_textarea'
          ) as HTMLTextAreaElement)!.value;
          try {
            validateSettingsString(newSetting);
            updateSettings(newSetting);
            window.location.reload();
          } catch (e) {
            alert(e);
          }
        }}
      >
        <Icon name="checkmark" />
        Save
      </Button>
    </Modal.Actions>
  </Modal>
);

export function getDefaultSettings(): Settings {
  return {
    mediaPath: process.env.REACT_APP_MEDIA_PATH,
    streamPath: process.env.REACT_APP_STREAM_PATH,
  };
}

export function getCurrentSettings(): Settings {
  const setting = window.localStorage.getItem('watchparty-setting');
  try {
    let settings = validateSettingsString(setting);
    if (!settings) {
      throw new Error('failed to parse settings, using defaults');
    }
    return settings;
  } catch (e) {
    console.warn(e);
    return getDefaultSettings();
  }
}

/**
 * Validate a setting string. Return a parsed setting object if valid, otherwise throw exception
 */
export function validateSettingsString(
  setting: string | null
): Settings | null {
  // Don't have a setting or invalid value
  let settingObject: Settings = JSON.parse(setting as any);
  if (!setting || setting[0] !== '{') {
    throw new Error('failed to parse settings, using defaults');
  }
  return settingObject;
}

export function updateSettings(newSetting: string) {
  window.localStorage.setItem('watchparty-setting', newSetting);
}
