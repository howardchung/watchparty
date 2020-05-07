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
  Boolean(redis && SCW_SECRET_KEY && SCW_ORGANIZATION_ID);

const mapServerObject = (server) => ({
  id: server.id,
  pass: server.name,
  // The gateway handles SSL termination and proxies to the private IP
  host: 'gateway.watchparty.me/?ip=' + server.private_ip,
  private_ip: server.private_ip,
  state: server.state,
  tags: server.tags,
  creation_date: server.creation_date,
});

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
  let result = await getVM(id);
  while (!result.private_ip) {
    // Make sure the server has an IP
    console.log('launched VM has no IP yet:', id);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    result = await getVM(id);
  }
  return result;
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
    },
  });
}

async function getVM(id) {
  const response = await axios({
    method: 'GET',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}`,
    headers: {
      'X-Auth-Token': SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
  });
  return mapServerObject(response.data.server);
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
    .map(mapServerObject);
}

async function assignVM() {
  let selected = null;
  let lock = null;
  while (!selected) {
    let candidate = null;
    let availableSet = await redis.spop('availableSet');
    if (availableSet) {
      candidate = await getVM(availableSet);
      console.log('got available VM from pool:', availableSet);
    } else {
      console.log('creating VM');
      candidate = await launchVM();
    }
    const lock = await redis.set(
      'vbrowser:' + candidate.id,
      '1',
      'NX',
      'EX',
      180
    );
    if (!lock) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }
    const ready = await checkVMReady(candidate.host);
    if (!ready) {
      await terminateVM(candidate.id);
      return null;
    } else {
      selected = candidate;
    }
  }
  return selected;
}

async function resizeVMGroup(rooms) {
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
      } else {
        // Renew the lock on the VM
        await redis.set(
          'vbrowser:' + room.vBrowser.id,
          room.id,
          'NX',
          'EX',
          180
        );
      }
    }
  }
  // Clean up any unused VMs
  // allow a buffer of available VMs to exist for fast assignment
  const maxAvailable = Number(process.env.VBROWSER_VM_BUFFER) || 0;
  const pool = await listVMs();
  const usedKeys = await redis.keys('vbrowser:*');
  const available = pool.length - usedKeys.length;
  const availableSet = await redis.scard('availableSet');
  console.log(
    'pool:',
    pool.length,
    'used:',
    usedKeys.length,
    'available:',
    available,
    'availableSet:',
    availableSet
  );
  let extras = available - maxAvailable;
  for (let i = 0; i < pool.length; i++) {
    const server = pool[i];
    const inUse = await redis.get('vbrowser:' + server.id);
    if (!inUse && extras > 0) {
      console.log('terminating unused vm', server.id);
      await redis.srem('availableSet', server.id);
      await terminateVM(server.id);
      extras -= 1;
    } else if (!inUse) {
      console.log('adding unused vm to availableSet', server.id);
      await redis.sadd('availableSet', server.id);
    }
  }
  if (available < maxAvailable) {
    launchVM();
  }
}

async function checkVMReady(host) {
  let state = '';
  let retryCount = 0;
  while (!state) {
    // poll for status
    const url = 'https://' + host;
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
      // The error code is not 404 maybe due to the gateway
      state =
        e.response && e.response.data === '404 page not found\n' ? 'ready' : '';
    }
    console.log(retryCount, url, state);
    retryCount += 1;
    if (retryCount >= 50) {
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
  resetVM,
  isVBrowserFeatureEnabled,
};
