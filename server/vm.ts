import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Redis from 'ioredis';
import { StringDict } from '.';
let redis = (undefined as unknown) as Redis.Redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}

const VBROWSER_TAG = process.env.VBROWSER_TAG || 'vbrowser';
const SCW_SECRET_KEY = process.env.SCW_SECRET_KEY;
const SCW_ORGANIZATION_ID = process.env.SCW_ORGANIZATION_ID;

export const isVBrowserFeatureEnabled = () =>
  Boolean(process.env.REDIS_URL && SCW_SECRET_KEY && SCW_ORGANIZATION_ID);

const mapServerObject = (server: any) => ({
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
  const password = uuidv4();
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
  await redis.rpush('availableList', id);
  return result;
}

async function terminateVM(id: string) {
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

export async function resetVM(id: string) {
  // We can attempt to reuse the instance which is more efficient if users tend to use them for a short time
  // Otherwise terminating them is simpler but more expensive
  // terminateVM(id);
  const password = uuidv4();
  // Update the VM's name (also the HOST env var that will be used as password)
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
  // Reboot the VM (also destroys the Docker container since it has --rm flag)
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
  // Add the VM back to the pool
  let result = await getVM(id);
  await redis.del('vbrowser:' + id);
  await redis.rpush('availableList', id);
}

async function getVM(id: string) {
  let result = null;
  while (!result) {
    const response = await axios({
      method: 'GET',
      url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers/${id}`,
      headers: {
        'X-Auth-Token': SCW_SECRET_KEY,
        'Content-Type': 'application/json',
      },
    });
    let server = mapServerObject(response.data.server);
    if (server.private_ip) {
      result = server;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  return result;
}

async function listVMs(filter?: string) {
  const mapping: StringDict = {
    available: 'available',
    inUse: 'inUse',
  };
  let tags = mapping[filter as string];
  // console.log(filter, tags);
  const response = await axios({
    method: 'GET',
    url: `https://api.scaleway.com/instance/v1/zones/fr-par-1/servers`,
    headers: {
      'X-Auth-Token': SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    params: {
      // TODO need to update if over 100 results
      per_page: 100,
      tags,
    },
  });
  return response.data.servers
    .filter(
      (server: any) => server.tags.includes(VBROWSER_TAG) && server.private_ip
    )
    .map(mapServerObject);
}

export async function assignVM() {
  if (!isVBrowserFeatureEnabled()) {
    return null;
  }
  let selected = null;
  while (!selected) {
    const currSize = await redis.llen('availableList');
    if (currSize === 0) {
      await launchVM();
    }
    let resp = await redis.blpop('availableList', 0);
    const id = resp[1];
    console.log('[ASSIGN]', id);
    const lock = await redis.set('vbrowser:' + id, '1', 'NX', 'EX', 300);
    if (!lock) {
      console.log('failed to acquire lock on VM:', id);
      continue;
    }
    let candidate = await getVM(id);
    const ready = await checkVMReady(candidate.host);
    if (!ready) {
      await resetVM(candidate.id);
    } else {
      selected = candidate;
    }
  }
  return selected;
}

export async function resizeVMGroupIncr() {
  const maxAvailable = Number(process.env.VBROWSER_VM_BUFFER) || 0;
  const availableCount = await redis.llen('availableList');
  if (availableCount < maxAvailable) {
    console.log(
      '[RESIZE-LAUNCH]',
      'desired:',
      maxAvailable,
      'available:',
      availableCount
    );
    launchVM();
  }
}

export async function resizeVMGroupDecr() {
  const maxAvailable = Number(process.env.VBROWSER_VM_BUFFER) || 0;
  const availableCount = await redis.llen('availableList');
  if (availableCount > maxAvailable) {
    const diff = availableCount - maxAvailable;
    for (let i = 0; i < diff; i++) {
      const id = await redis.rpop('availableList');
      console.log(
        '[RESIZE-TERMINATE]',
        id,
        'desired:',
        maxAvailable,
        'available:',
        availableCount
      );
      await terminateVM(id);
    }
  }
}

export async function cleanupVMGroup() {
  // Clean up hanging VMs
  // It's possible we created a VM but lost track of it in redis
  // Take the list of VMs from API, subtract VMs that have a lock in redis or are in the available pool, delete the rest
  const allVMs = await listVMs();
  const usedKeys = (await redis.keys('vbrowser:*')).map((key) =>
    key.slice('vbrowser:'.length)
  );
  const availableKeys = await redis.lrange('availableList', 0, -1);
  const dontDelete = new Set([...usedKeys, ...availableKeys]);
  for (let i = 0; i < allVMs.length; i++) {
    const server = allVMs[i];
    if (!dontDelete.has(server.id)) {
      console.log('terminating hanging vm:', server.id);
      terminateVM(server.id);
    }
  }
}

export async function checkVMReady(host: string) {
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

const cloudInitWithTls = (host: string, imageName: string) => `#!/bin/bash
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
