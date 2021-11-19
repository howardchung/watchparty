import React from 'react';
import { Divider, Header, Icon, Step } from 'semantic-ui-react';
import firebase from 'firebase/compat/app';

import { NewRoomButton } from '../TopBar';
import styles from './Home.module.css';

export const Home = ({ user }: { user: firebase.User | undefined }) => {
  return (
    <div>
      <div className={styles.container}>
        <Hero
          heroText={'Watch videos in-sync with friends far away.'}
          subText={'No registration or download required.'}
          action={
            <div style={{ marginTop: '8px', width: '160px' }}>
              <NewRoomButton user={user} />
            </div>
          }
          image={'/screenshot4.png'}
        />
        <Divider horizontal>
          <Header inverted as="h4">
            <Icon name="film" />
            Multiple ways to watch
          </Header>
        </Divider>
        <div className={styles.featureSection}>
          <Feature
            icon="slideshare"
            title={`Screensharing`}
            text="Share a browser tab or an application."
          />
          <Feature
            icon="desktop"
            title={`VBrowser`}
            text="Launch a virtual browser in the cloud that all room members can view and control. No need to worry about slow upload speeds!"
          />
          <Feature
            icon="file"
            title={`File`}
            text="Upload and stream your own file."
          />
          <Feature
            icon="linkify"
            title={`URL`}
            text="Paste in a URL for everyone to watch from."
          />
          <Feature
            icon="youtube"
            title={`YouTube`}
            text="Watch videos in-sync from YouTube."
          />
        </div>
        <Hero
          heroText={'React to moments together.'}
          subText={"Find moments of shared joy even when you're apart."}
          image={'/screenshot18.png'}
          color="green"
        />
        <Divider horizontal>
          <Header inverted as="h4">
            <Icon name="cogs" />
            Features
          </Header>
        </Divider>
        <div className={styles.featureSection}>
          <Feature
            icon="sync"
            title="Synchronized"
            text="Starts, stops, and seeks are synchronized to everyone, so take those restroom and snack breaks without worrying about falling behind."
          />
          <Feature
            icon="conversation"
            title="Chat"
            text="Chat with others in your room. Memes and inside jokes encouraged."
          />
          <Feature
            icon="video"
            title="Video chat"
            text="Jump into video chat if there's something that you just can't express with text."
          />
        </div>
        <Hero
          heroText={'Theater mode.'}
          subText={
            'Bring video and chat front-and-center for minimal distractions.'
          }
          image={'/screenshot14.png'}
        />
        <Divider horizontal />
        <div
          style={{
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div className={styles.heroText}>Get started!</div>
          <div className={styles.featureSection}>
            <Step.Group style={{ margin: '8px' }}>
              <Step>
                <Icon name="certificate" />
                <Step.Content>
                  <Step.Title>1.</Step.Title>
                  <Step.Description>Make a room</Step.Description>
                </Step.Content>
              </Step>

              <Step>
                <Icon name="group" />
                <Step.Content>
                  <Step.Title>2.</Step.Title>
                  <Step.Description>Share link with friends</Step.Description>
                </Step.Content>
              </Step>

              <Step>
                <Icon name="film" />
                <Step.Content>
                  <Step.Title>3.</Step.Title>
                  <Step.Description>Pick something to watch</Step.Description>
                </Step.Content>
              </Step>

              <Step>
                <Icon name="thumbs up outline" />
                <Step.Content>
                  <Step.Title>4.</Step.Title>
                  <Step.Description>Success!</Step.Description>
                </Step.Content>
              </Step>
            </Step.Group>
          </div>
          <div style={{ width: '160px' }}>
            <NewRoomButton user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature = ({
  icon,
  text,
  title,
}: {
  icon: string;
  text: string;
  title: string;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flex: '1 1 0px',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px',
        minWidth: '180px',
      }}
    >
      <Icon fitted size="huge" name={icon as any} />
      <h4 className={styles.featureTitle}>{title}</h4>
      <div className={styles.featureText}>{text}</div>
    </div>
  );
};

const Hero = ({
  heroText,
  subText,
  action,
  image,
  color,
}: {
  heroText?: string;
  subText?: string;
  action?: React.ReactNode;
  image?: string;
  color?: string;
}) => {
  return (
    <div className={`${styles.hero} ${color === 'green' ? styles.green : ''}`}>
      <div className={styles.heroInner}>
        <div style={{ padding: '30px', flex: '1 1 0' }}>
          <div className={styles.heroText}>{heroText}</div>
          <div className={styles.subText}>{subText}</div>
          {action}
        </div>
        <div
          style={{
            flex: '1 1 0',
          }}
        >
          <img
            alt="hero"
            style={{ width: '100%', borderRadius: '10px' }}
            src={image}
          />
        </div>
      </div>
    </div>
  );
};
