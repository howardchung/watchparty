import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Redis from 'ioredis';
import { StringDict } from '..';
import { VMManager, VM } from './base';
import { Room } from '../room';
let redis = (undefined as unknown) as Redis.Redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}

const VBROWSER_TAG = process.env.VBROWSER_TAG || 'vbrowser';
const SCW_SECRET_KEY = process.env.SCW_SECRET_KEY;
const SCW_ORGANIZATION_ID = process.env.SCW_ORGANIZATION_ID;
const region = 'nl-ams-1';
const gatewayHost = 'gateway2.watchparty.me';
const imageId = '09f99a78-f093-4438-99c0-8a0705bf245b';
// const region = 'fr-par-1';
// const gatewayHost = 'gateway.watchparty.me';
// const imageId = '8e96c468-2769-4314-bb39-f3c941f63d48';

const mapServerObject = (server: any): VM => ({
  id: server.id,
  pass: server.name,
  // The gateway handles SSL termination and proxies to the private IP
  host: `${gatewayHost}/?ip=${server.private_ip}`,
  private_ip: server.private_ip,
  state: server.state,
  tags: server.tags,
  creation_date: server.creation_date,
});

export class Scaleway extends VMManager {
  launchVM = async () => {
    // generate credentials and boot a VM
    const password = uuidv4();
    const response = await axios({
      method: 'POST',
      url: `https://api.scaleway.com/instance/v1/zones/${region}/servers`,
      headers: {
        'X-Auth-Token': SCW_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        name: password,
        dynamic_ip_required: true,
        commercial_type: 'DEV1-M', // maybe DEV1-M for subscribers
        image: imageId,
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
      url: `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}/user_data/cloud-init`,
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
      url: `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}/action`,
      headers: {
        'X-Auth-Token': SCW_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        action: 'poweron',
      },
    });
    // console.log(response3.data);
    let result = await this.getVM(id);
    await redis.rpush('availableList', id);
    return result;
  };

  terminateVM = async (id: string) => {
    const response = await axios({
      method: 'POST',
      url: `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}/action`,
      headers: {
        'X-Auth-Token': SCW_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        action: 'terminate',
      },
    });
  };

  resetVM = async (id: string) => {
    // We can attempt to reuse the instance which is more efficient if users tend to use them for a short time
    // Otherwise terminating them is simpler but more expensive
    // terminateVM(id);
    const password = uuidv4();
    // Update the VM's name (also the HOST env var that will be used as password)
    const response = await axios({
      method: 'PATCH',
      url: `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}`,
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
      url: `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}/action`,
      headers: {
        'X-Auth-Token': SCW_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        action: 'reboot',
      },
    });
    // Add the VM back to the pool
    let result = await this.getVM(id);
    await redis.del('vbrowser:' + id);
    await redis.rpush('availableList', id);
  };

  getVM = async (id: string) => {
    let result = null;
    while (!result) {
      const response = await axios({
        method: 'GET',
        url: `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}`,
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
  };

  listVMs = async (filter?: string) => {
    const mapping: StringDict = {
      available: 'available',
      inUse: 'inUse',
    };
    let tags = mapping[filter as string];
    // console.log(filter, tags);
    const response = await axios({
      method: 'GET',
      url: `https://api.scaleway.com/instance/v1/zones/${region}/servers`,
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
  };
}
