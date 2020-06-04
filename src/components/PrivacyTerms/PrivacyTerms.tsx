import React from 'react';
import ReactMarkdown from 'react-markdown';

export const Privacy = () => {
  return (
    <div style={{ color: 'white', margin: '50px' }}>
      <ReactMarkdown>
        {`
Privacy Policy
====
- Rooms are temporary and expire after one day of inactivity.
- We do not keep logs of the content that users watch.

Personal Information
----
- You are not required to register to use the service, but you have the option to sign in with an email or authentication provider, which will be used to display your name and picture in the rooms you join.
- If you provide this information, we may use it to contact you regarding your use of the service, or to link your account to a subscription.
- We do not share personal information with third parties.
- You have the right to request deletion of your user data, in accordance with various laws governing data protection.
- Payment information is handled by third-party providers such as Stripe. We do not collect or access financial information directly.

Cookies
----
- We use services such as Google Analytics to gauge usage of the service. These providers may set cookies or other information locally on your device.

Virtual Browsers
----
- Virtual machines are recycled after each session ends and any data on them is destroyed.
- Your commands are encrypted while in-transit to the virtual machine.
`}
      </ReactMarkdown>
    </div>
  );
};

export const Terms = () => {
  return (
    <div style={{ color: 'white', margin: '50px' }}>
      <ReactMarkdown>
        {`
Terms of Service
====
By using this service you agree to the following terms:
- You are over 13 years of age
- Your use of the service may be terminated if you are found to be sharing illegal or infringing content
- The service provides no guarantee of uptime or availability
- You use the service at your own risk of encountering objectionable content, as we do not actively moderate rooms unless content is found to be illegal or infringing
`}
      </ReactMarkdown>
    </div>
  );
};
