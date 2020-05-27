import React from 'react';
import { Icon, Menu } from 'semantic-ui-react';

const MediaPathSearchResult = (
  props: SearchResult & { setMedia: Function }
) => {
  const result = props;
  const setMedia = props.setMedia;
  return (
    <Menu.Item
      onClick={(e) => {
        setMedia(e, { value: result.url });
      }}
    >
      <div style={{ display: 'flex' }}>
        <Icon name="file" />
        {result.name}
      </div>
    </Menu.Item>
  );
};

export default MediaPathSearchResult;
