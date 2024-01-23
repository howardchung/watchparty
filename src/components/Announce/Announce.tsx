import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from 'semantic-ui-react';
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
    const fetch = async () => {
      const response = await axios.get<{ items: Issue[] }>(
        'https://api.github.com/search/issues',
        {
          params: {
            q: `repo:${GITHUB_REPO} label:${
              config.NODE_ENV === 'development' ? 'test' : 'release'
            }`,
            order: 'desc',
            page: 1,
            per_page: 1,
          },
        },
      );
      const data = response.data;
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
    fetch();
  }, []);

  const onDismiss = useCallback((value: number) => {
    localStorage.setItem('announcement-dismiss', value.toString());
    setAnnouncement(null);
  }, []);

  return announcement != null ? (
    <div className={styles.announce}>
      <main>
        {/* <h4>{announcement.title}</h4> */}
        {announcement.body && (
          <ReactMarkdown>{announcement.body}</ReactMarkdown>
        )}
      </main>
      <aside>
        <Button color="blue" onClick={() => onDismiss(announcement.number)}>
          Dismiss
        </Button>
      </aside>
    </div>
  ) : null;
};

export default Announce;
