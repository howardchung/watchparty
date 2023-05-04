// import * as React from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import React from 'react';
import { Button, Icon, Input, Modal, Progress } from 'semantic-ui-react';
import classes from './UploadFile.module.css';
import placeholderImage from '../../assets/placeholder/placeholder-image.webp';
import copiedImage from '../../assets/upload/copied.svg';
import backIcon from '../../assets/upload/backIcon.svg';
import contentDetails from '../../assets/upload/contentDetails.svg';
import uploadIcon from '../../assets/upload/upload.svg';
import fileImage from '../../assets/upload/fileImage.png';
import solarQuit from '../../assets/upload/sorlarQuit.svg';
import crossIcon from '../../assets/upload/crossIcon.svg';
declare global {
  interface Window {
    vuplex: any;
  }
}
export interface IUploadFileProps {
  toggleIsUploadPress: Function;
}

export default function UploadFile(props: IUploadFileProps) {
  const { toggleIsUploadPress } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [File, setFile] = React.useState<File | null>(null);
  const [video, setVideo] = React.useState<string | null>(null);
  const [fileSize, setFileSize] = React.useState<string>('');
  const [loadingFileSize, setLoadingFileSize] = React.useState<string>('');
  const [progress, setProgress] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isCopied, setIsCopied] = React.useState<boolean>(false);

  function formatFileSize(size: number): string {
    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;
    const gigabyte = megabyte * 1024;

    if (size < kilobyte) {
      return size + ' B';
    } else if (size < megabyte) {
      return (size / kilobyte).toFixed(2) + ' KB';
    } else if (size < gigabyte) {
      return (size / megabyte).toFixed(2) + ' MB';
    } else {
      return (size / gigabyte).toFixed(2) + ' GB';
    }
  }

  const handleFileClick = () => {
    inputRef?.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const sizeFile = formatFileSize(selectedFile.size);
      setFileSize(sizeFile);
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
        url: `https://sg.storage.bunnycdn.com/metawood/${fileName}`,
        headers: {
          'content-type': 'application/octet-stream',
          AccessKey: process.env.REACT_APP_BUNNYCDN_ACCESS_KEY,
        },
        data: blob,
        onUploadProgress: async (event: any) => {
          setLoadingFileSize(formatFileSize(event.loaded));
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
          setVideo(`https://metawood-multiverse.b-cdn.net/${fileName}`);
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
    try {
      if (window?.vuplex) {
        // console.log('vuplex: ', { vuplex });
        window?.vuplex.postMessage({ type: 'videoURL', message: video });
        // The window.vuplex object already exists, so go ahead and send the message.
        // sendMessageToCSharp();
      } else {
        // The window.vuplex object hasn't been initialized yet because the page is still
        // loading, so add an event listener to send the message once it's initialized.
        window.addEventListener(
          'vuplexready',
          window?.vuplex.postMessage({ type: 'videoURL', message: video })
        );
      }
    } catch (error) {
      console.error('Something went wrong!');
    }

    video &&
      navigator.clipboard.writeText(video).then(
        function () {
          console.log('Copying to clipboard was successful!');
          setIsCopied(true);
        },
        function (err) {
          console.error(' Could not copy text: ', err);
        }
      );
  };
  return (
    <Modal inverted basic open className={classes.wrapper}>
      <div className={classes.cancelbtn}>
        <Icon size="big" name="cancel" onClick={() => toggleIsUploadPress()} />
      </div>

      {/* ====================== UPLOAD FILE UI ====================== */}
      {!video && !isLoading && (
        <div className={classes.content}>
          {/* <div className={classes.header}>
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
              size="big"
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
          </div> */}

          <div className={classes.subContent}>
            <div className={`${classes.contentDetails} flex my-4 lg:my-8`}>
              <img
                className="mx-auto"
                src={contentDetails}
                alt="contentDetails"
              />
            </div>
            <div>
              <label
                className={`${classes.fileUpload} w-[60%] mx-auto justify-center py-3 flex items-center`}
              >
                <input
                  ref={inputRef}
                  onChange={handleFileChange}
                  className={classes.fileInput}
                  accept="video/*"
                  type="file"
                />
                <span className="text-white font-semibold text-[18px]">
                  Upload
                </span>
                <img className="pl-3" src={uploadIcon} alt="uploadIcon" />
              </label>
            </div>
          </div>

          <div className={classes.backIcon}>
            <img
              className="cursor-pointer"
              onClick={() => toggleIsUploadPress()}
              src={backIcon}
              alt="backIcon"
            />
          </div>
          <div className={classes.solarQuit}>
            <img className="cursor-pointer" src={solarQuit} alt="solarQuit" />
          </div>
        </div>
      )}
      {/* <Dimmer active={isLoading}>
        <Loader indeterminate>Uploading Files</Loader>
      </Dimmer> */}
      {/* ====================== UI AFTER FILE SELECTION ====================== */}
      {File && (
        // <div className={classes.content}>
        //   {/* <Image src={DemoImage} size='small' centered /> */}
        //   {video ? (
        //     <video
        //       src={video ?? 'Uploading...'}
        //       width="220px"
        //       height="150px"
        //       autoPlay={false}
        //       muted
        //     />
        //   ) : (
        //     <img
        //       src={placeholderImage}
        //       width="220px"
        //       height="150"
        //       alt="loading..."
        //     />
        //   )}
        //   <h1 style={{ margin: '10px' }}>{File.name}</h1>
        //   <div
        //     style={{
        //       display: 'flex',
        //       flexDirection: 'column',
        //       justifyContent: 'center',
        //       alignItems: 'center',
        //     }}
        //   >
        //     <Progress
        //       className="control action "
        //       color="violet"
        //       value={Math.floor(progress)}
        //       total={100}
        //       progress="percent"
        //       size="medium"
        //       style={{
        //         flexGrow: 1,
        //         marginTop: 0,
        //         background: '#4B4B4B',
        //         marginBottom: 0,
        //         position: 'relative',
        //         width: '100%',
        //         minWidth: '420px',
        //         marginLeft: '40px',
        //       }}
        //     />
        //     {isLoading && (
        //       <h5 style={{ margin: '10px', color: 'white' }}>
        //         {isLoading ? 'Uploading File...' : ''}
        //       </h5>
        //     )}
        //     {video && (
        //       <Input
        //         inverted={true}
        //         action={{
        //           content: 'Copy Link',
        //           className: classes.InputAction,
        //           onClick: copyToClipboard,
        //         }}
        //         placeholder=""
        //         value={video}
        //         size="large"
        //         className={classes.input}
        //       />
        //     )}
        //   </div>
        // </div>
        <div className={classes.content}>
          <div className={classes.uploadSubContent}>
            <div className="flex justify-center">
              <img
                className={classes.fileImage}
                src={fileImage}
                alt="contentDetails"
              />
            </div>
            <h4 className="my-2 font-bold text-center">File Name</h4>
            <div className="relative upload-progress">
              <Progress
                color="violet"
                value={Math.floor(progress)}
                total={100}
                size="medium"
                className={classes.customProgress}
              />
              <div className="absolute left-[50%] translate-x-[-50%] top-[50%] text-[12px] z-10 font-bold translate-y-[-50%]">
                Uploading <span className="ml-2">{Math.floor(progress)} %</span>{' '}
              </div>
            </div>
            <div className="flex font-bold my-[6px] text-[14px] justify-between">
              <div>{loadingFileSize ? loadingFileSize : '0MB'}</div>
              <div>{fileSize ? fileSize : '0MB'}</div>
            </div>
            <div className="grid my-4 grid-cols-2 gap-4">
              <button
                className={`${
                  Number(progress) === 100
                    ? 'text-[#212121] bg-[#FFF]'
                    : 'text-[#212121] btn-disabled bg-[#A9A9A9]'
                } text-[18px] rounded-xl py-4 font-semibold`}
              >
                Add To playlist
              </button>
              <button
                onClick={copyToClipboard}
                className={`${
                  Number(progress) === 100
                    ? `${classes.linearBackground} text-[#fff] `
                    : 'text-[#AAAAAA] btn-disabled bg-[#5F5F5F]'
                } text-[18px] rounded-xl py-4 font-semibold`}
              >
                Play now
              </button>
            </div>
          </div>

          <div className={classes.backIcon}>
            <img
              // onClick={() => setFile(null)}
              onClick={() => toggleIsUploadPress()}
              className="cursor-pointer"
              src={crossIcon}
              alt="crossIcon"
            />
          </div>
          <div className={classes.solarQuit}>
            <img className="cursor-pointer" src={solarQuit} alt="solarQuit" />
          </div>
        </div>
      )}

      {/* {isCopied && (
        <div className={classes.content}>
          <div className={classes.copiedBox}>
            <img
              src={copiedImage}
              className={classes.copiedImage}
              alt="copied"
            />
            <h5>Link copied successfully</h5>
            <h4>Paste it in the search box to start viewing</h4>
          </div>
        </div>
      )} */}
    </Modal>
  );
}
