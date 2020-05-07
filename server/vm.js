const uuid = require('uuid');
const axios = require('axios');
const Redis = require('ioredis');
let redis = undefined;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}

const VBROWSER_TAG = process.env.VBROWSER_TAG || 'vbrowser';
const SCW_SECRET_KEY = process.env.SCW_SECRET_KEY;
const SCW_ORGANIZATION_ID = process.env.SCW_ORGANIZATION_ID;

const isVBrowserFeatureEnabled = () =>
  Boolean(SCW_SECRET_KEY && SCW_ORGANIZATION_ID);

async function launchVM() {
  // generate credentials and boot a VM
  const password = uuid.v4();
  const response = await axios({
    method: 'POST',
    url: 'https://api.scaleway.com/instance/v1/zones/fr-par-1/servers',
    headers: {
      'X-Auth-Token': SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      name: password,
      dynamic_ip_required: true,
      commercial_type: 'DEV1-S',
      // image: 'ce6c9d21-0ff3-4355-b385-c930c9f22d9d', // ubuntu focal
      image: '8e96c468-2769-4314-bb39-f3c941f63d48', // debian customized
      volumes: {},
      organization: SCW_ORGANIZATION_ID,
      tags: [VBROWSER_TAG],
    },
  });
  // console.log(response.data);
  const id = response.data.server.id;
  const imageName = 'nurdism/neko:chromium';
  // set userdata for boot action
  const cloudInit = `#!/bin/bash
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 5000
sed -i 's/scripts-user$/\[scripts-user, always\]/' /etc/cloud/cloud.cfg
docker run -d --rm --name=vbrowser -v /usr/share/fonts:/usr/share/fonts --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e SCREEN="1280x720@30" -e NEKO_PASSWORD=$(hostname) -e NEKO_PASSWORD_ADMIN=$(hostname) -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" ${imageName}
`;
  const response2 = await axios({
    method: 'PATCH',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}/user_data/cloud-init`,
    headers: {
      'X-Auth-Token': SCW_SECRET_KEY,
      'Content-Type': 'text/plain',
    },
    data: cloudInit,
  });
  // console.log(response2.data);
  // boot the instance
  const response3 = await axios({
    method: 'POST',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}/action`,
    headers: {
      'X-Auth-Token': SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      action: 'poweron',
    },
  });
  // console.log(response3.data);
}

async function terminateVM(id) {
  const response = await axios({
    method: 'POST',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}/action`,
    headers: {
      'X-Auth-Token': SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      action: 'terminate',
    },
  });
}

async function resetVM(id) {
  const password = uuid.v4();
  const response2 = await axios({
    method: 'POST',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}/action`,
    headers: {
      'X-Auth-Token': SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      action: 'reboot',
    },
  });
  const response = await axios({
    method: 'PATCH',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}`,
    headers: {
      'X-Auth-Token': SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      name: password,
      tags: [VBROWSER_TAG],
    },
  });
}

async function listVMs() {
  const response = await axios({
    method: 'GET',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers`,
    headers: {
      'X-Auth-Token': SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      // TODO needs update if we go beyond 100 VMs
      per_page: 100,
    },
  });
  return response.data.servers
    .filter((server) => server.tags.includes(VBROWSER_TAG))
    .map((server) => ({
      id: server.id,
      pass: server.name,
      // The gateway handles SSL termination and proxies to the private IP
      host: 'gateway.watchparty.me/?ip=' + server.private_ip,
      state: server.state,
      tags: server.tags,
      creation_date: server.creation_date,
    }));
}

async function resizeVMGroup() {
  // check to see how many VMs we need and how many we have
  const pool = await listVMs();
  const available = pool.filter(
    (server) => server.tags.length === 1 && server.tags[0] === VBROWSER_TAG
  );
  const used = pool.filter((server) => server.tags.includes('inUse'));
  console.log(
    'resizing VM group',
    'pool:',
    pool.length,
    'available:',
    available.length,
    'used:',
    used.length
  );
  if (pool.length > 20) {
    // Max limit reached
    return;
  }
  if (available.length < 1) {
    // Need additional VMs
    launchVM();
  }
  if (available.length > 1) {
    // We have too many VMs, terminate one
    await terminateVM(available[0].id);
  }
}

async function assignVM() {
  // TODO blpop queue items
  let selected = null;
  while (!selected) {
    const pool = await listVMs();
    const available = pool.filter(
      (server) => server.tags.length === 1 && server.tags[0] === VBROWSER_TAG
    );
    const candidate = available[Math.floor(Math.random() * available.length)];
    // Acquire a lock on this candidate
    const guid = uuid.v4();
    let lock = candidate && (!redis || await redis.set('vbrowser:' + candidate.id, guid, 'NX', 'EX', 30));
    console.log(candidate, lock);
    if (candidate && lock) {
      // tag it with inUse
      const response = await axios({
        method: 'PATCH',
        url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${candidate.id}`,
        headers: {
          'X-Auth-Token': SCW_SECRET_KEY,
          'Content-Type': 'application/json',
        },
        data: {
          tags: [VBROWSER_TAG, 'inUse'],
        },
      });
      if (redis) {
        // Release the lock
        await redis.eval(
          `if redis.call("get",KEYS[1]) == ARGV[1]
then
  return redis.call("del",KEYS[1])
else
  return 0
end`,
          1,
          'vbrowser:' + candidate.id,
          guid
        );
      }
    } else {
      // if none available or couldn't lock, try again
      await new Promise((resolve) => setTimeout(resolve, 3000));
      continue;
    }
    // Wait for the assigned VM to be ready
    const ready = await checkVMReady(candidate.host);
    if (!ready) {
      await terminateVM(candidate.id);
    } else {
      selected = candidate;
    }
  }
  return selected;
}

async function cleanupVMs(rooms) {
  // Reset VMs in rooms that are:
  // assigned more than 6 hours ago
  // assigned to a room with no users
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    if (room.vBrowser && room.vBrowser.assignTime) {
      if (
        Number(new Date()) - room.vBrowser.assignTime > 6 * 60 * 60 * 1000 ||
        room.roster.length === 0
      ) {
        console.log('resetting VM in room', room.id);
        await room.resetRoomVM();
      }
    }
  }
  const useSet = new Set();
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    if (room.vBrowser && room.vBrowser.id) {
      useSet.add(room.vBrowser.id);
    }
  }
  // Find any VMs tagged inUse, but no room is using them, terminate them
  // TODO this is terminating VMs that are assigned and waiting for ready
  // const pool = await listVMs();
  // const used = pool.filter((server) => server.tags.includes('inUse'));
  // console.log(useSet, used);
  // for (let i = 0; i < used.length; i++) {
  //   const server = used[i];
  //   if (!useSet.has(server.id)) {
  //     console.log('terminating unused vm', server.id);
  //     await terminateVM(server.id);
  //   }
  // }
}

// TODO background process to check VMs and add them to ready pool/queue

async function checkVMReady(host) {
  let state = '';
  let retryCount = 0;
  while (!state) {
    // poll for status
    const url = 'http://' + host;
    try {
      const response4 = await axios({
        method: 'GET',
        url,
      });
      state = response4.data.slice(10);
    } catch (e) {
      // console.log(e);
      // console.log(e.response);
      // The server currently 404s on requests with a query string, so just treat the 404 message as success
      // The error code is not 404 maybe due to the proxy
      state = e.response.data === '404 page not found\n' ? 'ready' : '';
    }
    console.log(retryCount, url, state);
    retryCount += 1;
    if (retryCount >= 200) {
      return false;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  return true;
}

const cloudInitWithTls = (host) => `#!/bin/bash
until nslookup ${host}
do
sleep 5
echo "Trying DNS lookup again..."
done
    
# Generate cert with letsencrypt
certbot certonly --standalone -n --agree-tos --email howardzchung@gmail.com --domains ${host}
chmod -R 755 /etc/letsencrypt/archive

# start browser
iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 5000
sed -i 's/scripts-user$/\[scripts-user, always\]/' /etc/cloud/cloud.cfg
docker run -d --rm --name=vbrowser -v /etc/letsencrypt/archive/${host}:/cert -v /usr/share/fonts:/usr/share/fonts --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e SCREEN="1280x720@30" -e NEKO_PASSWORD=$(hostname) -e NEKO_PASSWORD_ADMIN=$(hostname) -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" -e NEKO_KEY="/cert/privkey1.pem" -e NEKO_CERT="/cert/fullchain1.pem" ${imageName}
`;

module.exports = {
  launchVM,
  terminateVM,
  listVMs,
  resizeVMGroup,
  assignVM,
  checkVMReady,
  cleanupVMs,
  resetVM,
  isVBrowserFeatureEnabled,
};
