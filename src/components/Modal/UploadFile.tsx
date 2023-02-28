// import * as React from 'react';
import React from 'react';
import { Button, Icon, Modal } from 'semantic-ui-react';
import classes from './UploadFile.module.css';
export interface IUploadFileProps {
  toggleIsUploadPress: Function;
}

export default function UploadFile(props: IUploadFileProps) {
  const { toggleIsUploadPress } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleFileClick = () => {
    inputRef?.current?.click();
  };
  return (
    <Modal inverted basic open className={classes.wrapper}>
      <div className={classes.cancelbtn}>
        <Icon
          size="large"
          name="cancel"
          onClick={() => toggleIsUploadPress()}
        />
      </div>
      <div className={classes.content}>
        <div className={classes.header}>
          <h5>Follow the steps below to upload your content</h5>
          <ol>
            <li>CLick on the upload icon</li>
            <li>Select a file from local storage</li>
            <li>
              Copy the generated link and paste it in the Metawood application
            </li>
          </ol>
        </div>
        <div>
          <Button
            icon
            labelPosition="right"
            size="tiny"
            className={classes.UploadButton}
            onClick={handleFileClick}
            // onClick={() => toggleIsUploadPress()}
          >
            Upload
            <Icon size="large" name="arrow alternate circle down outline" />
          </Button>
          <input
            ref={inputRef}
            type="file"
            className={classes.fileInput}
            accept="video/*"
          />
        </div>
      </div>
    </Modal>
  );
}
