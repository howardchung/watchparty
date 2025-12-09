import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@mantine/core';
import styles from './Announce.module.css';
import config from '../../config';

const GITHUB_REPO = 'howardchung/watchparty-announcements';

type Issue = {
  title: string;
  body: string;
  number: number;
  updated_at: string;
};
const Announce = () => {
  const [announcement, setAnnouncement] = useState<Issue | null>(null);
  useEffect(() => {
    const update = async () => {
      const response = await fetch(
        'https://api.github.com/search/issues?' +
          new URLSearchParams({
            q: `repo:${GITHUB_REPO} label:${
              config.NODE_ENV === 'development' ? 'test' : 'release'
            }`,
            order: 'desc',
            page: '1',
            per_page: '1',
          }),
      );
      const data: { items: Issue[] } = await response.json();
      //   console.log(data);
      const top = data?.items?.[0];
      if (
        top?.number > Number(localStorage.getItem('announcement-dismiss')) &&
        new Date(top.updated_at) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ) {
        setAnnouncement(top);
      }
    };
    update();
  }, []);

  const onDismiss = useCallback((value: number) => {
    localStorage.setItem('announcement-dismiss', value.toString());
    setAnnouncement(null);
  }, []);

  return announcement != null ? (
    <div className={styles.announce}>
      {/* <h4>{announcement.title}</h4> */}
      <pre style={{ whiteSpace: 'pre-wrap' }}>{announcement.body}</pre>
      <aside>
        <Button color="blue" onClick={() => onDismiss(announcement.number)}>
          Dismiss
        </Button>
      </aside>
    </div>
  ) : null;
};

export default Announce;
