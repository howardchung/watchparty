import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from 'semantic-ui-react';
import { Hero } from '../Home/Home';

const mdStyle = { color: 'white', margin: '50px', maxWidth: '800px' };

export const Privacy = () => {
  return (
    <div style={mdStyle}>
      <ReactMarkdown>
        {`
Privacy Policy
====

Rooms
----
- By default, rooms are temporary and expire after one day of inactivity.
- Users have the option of making a room permanent, which can be undone at any time.
- We do not keep logs of the content that users watch.

Personal Information
----
- You are not required to register to use the service, but you have the option to sign in with an email or authentication provider, which will be used to display your name and picture in the rooms you join.
- If you provide this information, we may use it to contact you regarding your use of the service, or to link your account to a subscription.
- We do not sell personal information to third parties.
- You have the right to request deletion of your user data, in accordance with various laws governing data protection. Please contact support@watchparty.me to request user data deletion.
- Payment information is handled by providers such as Stripe. We do not collect or access financial information directly.

Cookies
----
- We use services such as Google Analytics to measure usage. These services may set cookies or other information locally on your device.

Virtual Browsers
----
- Virtual machines are recycled after each session ends and any data on them is destroyed.
- Your commands are encrypted while in-transit to the virtual machine.

YouTube
----
- The service provides the ability to search and play YouTube videos. Google/YouTube may use data provided to the search service in accordance with the [Google Privacy Policy](https://policies.google.com/privacy).
`}
      </ReactMarkdown>
    </div>
  );
};

export const Terms = () => {
  return (
    <div style={mdStyle}>
      <ReactMarkdown>
        {`
Terms of Service
====
By using this service you agree to the following terms:
- You are over 13 years of age
- Your use of the service may be terminated if you are found to be sharing illegal or infringing content
- The service provides no guarantee of uptime or availability
- You use the service at your own risk of encountering objectionable content, as we do not actively moderate rooms unless content is found to be illegal or infringing

Subscriptions
----
- If you are dissatisfied with the service for any reason or believe you have been charged in error, please contact support@watchparty.me.
- We will provide a full refund of the most recent payment, no questions asked.

YouTube
----
The service provides the ability to search and play YouTube videos. By using the YouTube search you agree to the [YouTube Terms of Service](https://www.youtube.com/t/terms).
`}
      </ReactMarkdown>
    </div>
  );
};

export const FAQ = () => {
  return (
    <div style={mdStyle}>
      <ReactMarkdown>
        {`
FAQ
====
What's a VBrowser?
----
A virtual browser (VBrowser) is a browser running in the cloud that a room's members can connect to. Everyone in the room sees the same thing, so it's a great way to watch videos or collaborate on tasks together.

Why did my VBrowser session stop?
----
VBrowsers will terminate automatically if no one is in the room for a while.
VBrowser sessions are also limited to a maximum of 3 hours for free users, and 24 hours for subscribers.

Does everyone in the room need to be a subscriber to get the benefits?
----
No, only the person who created the VBrowser needs to be.

How do I access sites that have a "not available" message in the VBrowser?
----
Some sites may block traffic that's detected as coming from the cloud. You may need to install a VPN extension inside the virtual browser.

How come I'm not getting any audio when screensharing?
----
To share audio, you must be using Chrome/Edge and sharing a tab or desktop.

Is there a limit to how many people can be in a room?
----
Currently there isn't a hard limit, although the service hasn't been tested with more than 15 people or so. Screensharing and filesharing rely on one person uploading to everyone else, so it may not work well with large room sizes.

I own a website and I'd like to have a link that generates a WatchParty room with a specific video already set. How do I do this?
----
You can link to https://www.watchparty.me/create?video=URL_HERE to do this!

`}
      </ReactMarkdown>
    </div>
  );
};

export const DiscordBot = () => {
  return (
    <div>
      <Hero
        heroText={
          'Add the WatchParty Discord bot to your server to easily generate WatchParty links.'
        }
        subText={'/watch to generate a new empty room'}
        subText2={'/watch video <URL_HERE> to create a room with a video'}
        action={
          <Button
            style={{ marginTop: '1em' }}
            color="blue"
            size="big"
            target="_blank"
            href="https://discord.com/api/oauth2/authorize?client_id=1071394728513380372&permissions=2147485696&scope=bot"
          >
            Add to Discord
          </Button>
        }
        image={'/screenshot5.png'}
      />
    </div>
  );
};
