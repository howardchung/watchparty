import axios from 'axios';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { VMManager, VM } from './base';
import { cloudInit, imageName } from './utils';

let redis = (undefined as unknown) as Redis.Redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}

const VBROWSER_TAG = process.env.VBROWSER_TAG || 'vbrowser';
const HETZNER_TOKEN = process.env.HETZNER_TOKEN;
const region = 'nbg1';
const gatewayHost = 'gateway3.watchparty.me';
const imageId = '16820085';

const mapServerObject = (server: any): VM => ({
  id: server.id.toString(),
  pass: server.name,
  // The gateway handles SSL termination and proxies to the private IP
  host: `${gatewayHost}/?ip=${server.private_net[0]?.ip}`,
  private_ip: server.private_net[0]?.ip,
  state: server.status,
  tags: Object.keys(server.labels),
  creation_date: server.created,
  originalName: server.labels.originalName,
});

export class Hetzner extends VMManager {
  redisQueueKey = 'availableListHetzner';
  startVM = async (name: string) => {
    try {
      const response = await axios({
        method: 'POST',
        url: `https://api.hetzner.cloud/v1/servers`,
        headers: {
          Authorization: 'Bearer ' + HETZNER_TOKEN,
          'Content-Type': 'application/json',
        },
        data: {
          name: name,
          server_type: 'cpx11', // cx11, cpx11, cpx21
          start_after_create: true,
          image: imageId,
          ssh_keys: [1570536],
          networks: [91163],
          user_data: cloudInit(imageName, true),
          labels: {
            [VBROWSER_TAG]: '1',
            originalName: name,
          },
          location: region,
        },
      });
      await redis.setex(`kv:${name}`, 24 * 3600, name);
      const id = response.data.server.id;
      return id;
    } catch (e) {
      console.log(e);
    }
  };

  terminateVM = async (id: string) => {
    const response = await axios({
      method: 'DELETE',
      url: `https://api.hetzner.cloud/v1/servers/${id}`,
      headers: {
        Authorization: 'Bearer ' + HETZNER_TOKEN,
      },
    });
  };

  rebootVM = async (id: string) => {
    // Hetzner does not update the hostname on instance name update
    // Workaround is to stick the password in Redis and serve it to the instance
    // Instance will use this instead of hostname as the password
    // Generate a new password
    const password = uuidv4();
    // Get the original hostname and update Redis
    const old = await this.getVM(id);
    await redis.setex(`kv:${old.originalName}`, 24 * 3600, password);

    // Update the VM's name
    const response = await axios({
      method: 'PUT',
      url: `https://api.hetzner.cloud/v1/servers/${id}`,
      headers: {
        Authorization: 'Bearer ' + HETZNER_TOKEN,
        'Content-Type': 'application/json',
      },
      data: {
        name: password,
      },
    });

    // Reboot the VM (also destroys the Docker container since it has --rm flag)
    const response2 = await axios({
      method: 'POST',
      url: `https://api.hetzner.cloud/v1/servers/${id}/actions/reboot`,
      headers: {
        Authorization: 'Bearer ' + HETZNER_TOKEN,
      },
    });
    return;
  };

  getVM = async (id: string) => {
    let result = null;
    while (!result) {
      const response = await axios({
        method: 'GET',
        url: `https://api.hetzner.cloud/v1/servers/${id}`,
        headers: {
          Authorization: 'Bearer ' + HETZNER_TOKEN,
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
    const response = await axios({
      method: 'GET',
      url: `https://api.hetzner.cloud/v1/servers`,
      headers: {
        Authorization: 'Bearer ' + HETZNER_TOKEN,
      },
      params: {
        // TODO paginate if this is too large
        per_page: 50,
        label_selector: filter,
      },
    });
    return response.data.servers
      .map(mapServerObject)
      .filter(
        (server: any) => server.tags.includes(VBROWSER_TAG) && server.private_ip
      );
  };
}
