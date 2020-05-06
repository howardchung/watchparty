const uuid = require('uuid');
const axios = require('axios');

async function launchVM() {
  // generate credentials and boot a VM
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
      // TODO switch to the newer image
      // image: 'a178943a-d2ae-449f-b8c0-80ca5447831f', // new customized ubuntu bionic
      volumes: {},
      organization: process.env.SCW_ORGANIZATION_ID,
      tags: ['vbrowser'],
    },
  });
  // console.log(response.data);
  const id = response.data.server.id;
  const host = `${id}.pub.cloud.scaleway.com`;
  const imageName = 'nurdism/neko:chromium';
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
sed -i 's/scripts-user$/\[scripts-user, always\]/' /etc/cloud/cloud.cfg
docker run -d --rm --name=vbrowser -v /etc/letsencrypt/archive/${host}:/cert -v /usr/share/fonts:/usr/share/fonts --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e SCREEN="1280x720@30" -e NEKO_PASSWORD=$(hostname) -e NEKO_PASSWORD_ADMIN=$(hostname) -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" -e NEKO_KEY="/cert/privkey1.pem" -e NEKO_CERT="/cert/fullchain1.pem" ${imageName}
`;
  const cloudInitNoSsl = `#!/bin/bash
# start browser
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 5000
sed -i 's/scripts-user$/\[scripts-user, always\]/' /etc/cloud/cloud.cfg
docker run -d --rm --name=vbrowser -v /usr/share/fonts:/usr/share/fonts --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e SCREEN="1280x720@30" -e NEKO_PASSWORD=$(hostname) -e NEKO_PASSWORD_ADMIN=$(hostname) -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" ${imageName}
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
  // console.log(response2.data);
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
  // console.log(response3.data);
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

async function resetVM(id) {
  const password = uuid.v4();
  const response = await axios({
    method: 'PATCH',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}`,
    headers: {
      'X-Auth-Token': process.env.SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      name: password,
      tags: ['vbrowser']
    },
  });
  const response2 = await axios({
    method: 'POST',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}/action`,
    headers: {
      'X-Auth-Token': process.env.SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      action: 'reboot',
    },
  });
}

async function listVMs() {
  const response = await axios({
    method: 'GET',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers`,
    headers: {
      'X-Auth-Token': process.env.SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      per_page: 100,
    },
  });
  return response.data.servers.filter(server => server.tags.includes('vbrowser')).map(server => ({ id: server.id, pass: server.name, host: server.id + '.pub.cloud.scaleway.com', tags: server.tags, creation_date: server.creation_date }));
}

async function resizeVMGroup() {
  // check to see how many VMs we need and how many we have
  const pool = await listVMs();
  const available = pool.filter(server => !server.tags.includes('inUse'));
  const used = pool.filter(server => server.tags.includes('inUse'));
  console.log('resizing VM group', 'pool:', pool.length, 'available:', available.length, 'used:', used.length);
  if (pool.length > 10) {
    // Max limit reached
    return;
  }
  if (available.length < 1) {
    // Need additional VMs
    launchVM();
  }
  if (available.length >= 3) {
    // We have too many VMs, terminate one
    await terminateVM(available[available.length - 1].id);
  }
}

async function assignVM() {
  // TODO Race condition, could assign the same VM twice? Use redis as lock?
  let selected = null;
  while (!selected) {
    const pool = await listVMs();
    const available = pool.filter(server => !server.tags.includes('inUse'));
    const candidate = available[0];
    // if none available, wait for one
    if (!candidate) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      continue;
    }
    await checkVMReady(candidate.host);
    selected = candidate;
  }
  // tag it with inUse
  const response = await axios({
    method: 'PATCH',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${selected.id}`,
    headers: {
      'X-Auth-Token': process.env.SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      tags: ['vbrowser', 'inUse']
    },
  });
  return selected;
}

async function cleanupVMs(rooms) {
  // Reset VMs in rooms that are:
  // assigned more than 6 hours ago
  // assigned to a room with no users
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    if (room.vBrowser && room.vBrowser.assignTime) {
      if (Number(new Date()) - room.vBrowser.assignTime > 6 * 60 * 60 * 1000 || room.roster.length === 0) {
        console.log('resetting VM in room', room.id);
        await room.resetRoomVM();
      }
    }
  }
  // TODO possible to leak VMs that get created and tagged inuse, but not persisted to redis
  // Delete old VMs
  // const pool = await listVMs();
  // for (let i = 0; i < pool.length; i++) {
  //   const server = pool[i];
  //   const oldVM = Number(new Date()) - Number(new Date(server.creation_date)) > 24 * 60 * 60 * 1000;
  //   if (oldVM) {
  //     console.log('terminating old vm', server.id);
  //     await terminateVM(server.id);
  //   }
  // }
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
    }
    console.log(retryCount, url, state);
    retryCount += 1;
    if (retryCount >= 200) {
      throw new Error('timed out waiting for instance');
    } else {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

module.exports = {
  launchVM,
  terminateVM,
  listVMs,
  resizeVMGroup,
  assignVM,
  checkVMReady,
  cleanupVMs,
  resetVM,
};
