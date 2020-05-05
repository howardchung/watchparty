const uuid = require('uuid');
const axios = require('axios');

async function launchVM(password) {
  // generate credentials and boot a VM
  try {
    const password = uuid.v4();
    const response = await axios({
      method: 'POST',
      url: 'https://api.scaleway.com/instance/v1/zones/fr-par-1/servers',
      headers: {
        'X-Auth-Token': process.env.SCW_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        name: password,
        dynamic_ip_required: true,
        commercial_type: 'DEV1-S',
        // image: 'ce6c9d21-0ff3-4355-b385-c930c9f22d9d', // ubuntu focal
        image: '8b7f4e65-8f3d-467e-8c63-ba6517bce5ca',
        // image: 'a178943a-d2ae-449f-b8c0-80ca5447831f', // new customized ubuntu bionic
        volumes: {},
        organization: process.env.SCW_ORGANIZATION_ID,
        tags: ['vbrowser'],
      },
    });
    console.log(response.data);
    const id = response.data.server.id;
    const host = `${id}.pub.cloud.scaleway.com`;
    // set userdata for boot action
    const cloudInit = `#!/bin/bash
until nslookup ${host}
do
sleep 5
echo "Trying DNS lookup again..."
done
    
# Generate cert with letsencrypt
certbot certonly --standalone -n --agree-tos --email howardzchung@gmail.com --domains ${host}

# start browser
iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 5000
docker run -d --rm --name=vbrowser -v /etc/letsencrypt/archive/${host}:/cert -v /usr/share/fonts:/usr/share/fonts --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e SCREEN="1280x720@30" -e NEKO_PASSWORD=${password} -e NEKO_PASSWORD_ADMIN=${password} -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" -e NEKO_KEY="/cert/privkey1.pem" -e NEKO_CERT="/cert/fullchain1.pem" nurdism/neko:chromium
`;
    const cloudInitNoSsl = `#!/bin/bash
# start browser
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 5000
docker run -d --rm --name=vbrowser -v /usr/share/fonts:/usr/share/fonts --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e SCREEN="1280x720@30" -e NEKO_PASSWORD=${password} -e NEKO_PASSWORD_ADMIN=${password} -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" nurdism/neko:chromium
`;
    const response2 = await axios({
      method: 'PATCH',
      url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}/user_data/cloud-init`,
      headers: {
        'X-Auth-Token': process.env.SCW_SECRET_KEY,
        'Content-Type': 'text/plain',
      },
      data: cloudInit,
    });
    console.log(response2.data);
    // boot the instance
    const response3 = await axios({
      method: 'POST',
      url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}/action`,
      headers: {
        'X-Auth-Token': process.env.SCW_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        action: 'poweron',
      },
    });
    console.log(response3.data);
    let state = '';
    let retryCount = 0;
    while (!state) {
      // poll for status
      try {
        const response4 = await axios({
          method: 'GET',
          url: 'https://' + host,
        });
        state = response4.data.slice(100);
      } catch (e) {
        // console.log(e);
      }
      console.log(retryCount, state);
      retryCount += 1;
      if (retryCount >= 200) {
        throw new Error('timed out waiting for instance');
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
    return { pass: password, host: host, id };
  } catch (e) {
    console.error(e);
    // console.error(e.response.status, e.response.data);
    return {};
  }
}

async function terminateVM(id) {
  const response = await axios({
    method: 'POST',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}/action`,
    headers: {
      'X-Auth-Token': process.env.SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      action: 'terminate',
    },
  });
}

module.exports = { launchVM, terminateVM };

// TODO listVMs
// TODO resizeVMGroup
// TODO assignVM
// TODO checkVMReady
// TODO process to check current pool and spawn new instances if needed
// TODO process to terminate any VMs that are too old
// TODO process to reboot any VMs that no one's using
// TODO distinguish between "no one using" and "released"
// TODO reboot VMs when they're released
