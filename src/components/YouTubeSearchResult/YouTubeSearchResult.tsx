import React from 'react';
import { Icon, Menu } from 'semantic-ui-react';

import { decodeEntities } from '../../utils';

const YouTubeSearchResult = (props: SearchResult & { setMedia: Function }) => {
  const result = props;
  const setMedia = props.setMedia;
  return (
    <Menu.Item
      onClick={(e) => {
        setMedia(e, { value: result.url });
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img style={{ height: '40px' }} src={result.img} alt={result.name} />
        <Icon name="youtube" />
        <div style={{ marginLeft: '5px' }}>{decodeEntities(result.name)}</div>
      </div>
    </Menu.Item>
  );
};

export default YouTubeSearchResult;
