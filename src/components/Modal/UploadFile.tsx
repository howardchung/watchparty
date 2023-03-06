// import * as React from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import React from 'react';
import { Button, Icon, Input, Modal, Progress } from 'semantic-ui-react';
import classes from './UploadFile.module.css';

export interface IUploadFileProps {
  toggleIsUploadPress: Function;
}

export default function UploadFile(props: IUploadFileProps) {
  const { toggleIsUploadPress } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [File, setFile] = React.useState<File | null>(null);
  const [video, setVideo] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const handleFileClick = () => {
    inputRef?.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setIsLoading(true);
      handleUpload(e.target.files[0]);
    }
  };
  // {/* ====================== VIEO CONTENT UPLOADING TO BUNNY====================== */ }

  const handleUpload = async (file: File) => {
    if (!file) return;
    console.log('File: uploading file=>>', { file });
    const reader = new FileReader();
    reader.onload = async () => {
      const blob = new Blob([new Uint8Array(reader.result as ArrayBuffer)]);
      const uniqueID = new Date().getTime();
      const fileName = `${uniqueID + '_' + file.name}`;
      let config: AxiosRequestConfig = {
        method: 'PUT',
        url: `https://sg.storage.bunnycdn.com/asia-metawood/${fileName}`,
        headers: {
          'content-type': 'application/octet-stream',
          AccessKey: 'f24b834e-9408-417b-a712aaf9bbe0-dcb6-40b2',
        },
        data: blob,
        onUploadProgress: async (event: any) => {
          const progress = await Math.round(
            (event.loaded / event?.total) * 100
          );
          setProgress(progress);
          // console.log(`Upload progress: ${progress}%`);
        },
      };
      try {
        const data = await axios(config);
        data.data.HttpCode === 201 &&
          setVideo(`https://metawood.b-cdn.net/${fileName}`);
        // console.log(data);
        setIsLoading(false);
      } catch (error) {
        alert('Failed! Try Again');
        console.error({ error });
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const copyToClipboard = () => {
    video &&
      navigator.clipboard.writeText(video).then(
        function () {
          console.log('Copying to clipboard was successful!');
          alert('Copied to clipboard!');
        },
        function (err) {
          console.error(' Could not copy text: ', err);
        }
      );
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

      {/* ====================== UPLOAD FILE UI ====================== */}
      {!video && !isLoading && (
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
              onChange={handleFileChange}
              className={classes.fileInput}
              accept="video/*"
            />
          </div>
        </div>
      )}
      {/* <Dimmer active={isLoading}>
        <Loader indeterminate>Uploading Files</Loader>
      </Dimmer> */}
      {/* ====================== UI AFTER FILE SELECTION ====================== */}
      {File && (
        <div className={classes.content}>
          {/* <Image src={DemoImage} size='small' centered /> */}
          <video
            src={video ?? 'Uploading...'}
            width="170px"
            height="120px"
            autoPlay={false}
            muted
          />
          <h3 style={{ margin: '10px' }}>{File.name}</h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Progress
              className="control action "
              color="violet"
              value={Math.floor(progress)}
              total={100}
              progress="percent"
              size="medium"
              style={{
                flexGrow: 1,
                marginTop: 0,
                background: '#4B4B4B',
                marginBottom: 0,
                position: 'relative',
                width: '100%',
                minWidth: '400px',
                marginLeft: '40px',
              }}
            />
            {isLoading && (
              <h5 style={{ margin: '10px', color: 'white' }}>
                {isLoading ? 'Uploading File...' : ''}
              </h5>
            )}
            {video && (
              <Input
                inverted={true}
                action={{
                  content: 'Copy Link',
                  className: classes.InputAction,
                  onClick: copyToClipboard,
                }}
                placeholder=""
                value={video}
                className={classes.input}
              />
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
