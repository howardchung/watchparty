import * as React from 'react';
import { Button, Icon, Image } from 'semantic-ui-react';
import classes from './EmptyTheatre.module.css';
export interface IEmptyTheatreProps {
  toggleIsUploadPress: Function;
}

export function EmptyTheatre(props: IEmptyTheatreProps) {
  const { toggleIsUploadPress } = props;
  return (
    <div className={classes.content}>
      <div className={classes.header}>
        <Image src="logo192.png" size="medium" centered />
      </div>
      <div className={classes.btncontainer}>
        <Button
          icon
          labelPosition="right"
          size="massive"
          className={classes.UploadButton}
          // onClick={handleFileClick}
          onClick={() => toggleIsUploadPress()}
        >
          Upload
          <Icon size="large" name="arrow alternate circle down outline" />
        </Button>
      </div>

      <div>
        <p>
          Psst! Did you know you can upload content from your computer and watch
          in metawood?
        </p>
        <p>Click on the upload button above.</p>
        <p>
          Alternatively, you can use the search link to look for YouTube URLs.
        </p>
      </div>
    </div>
  );
}
