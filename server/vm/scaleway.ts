import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { StringDict } from '..';
import { VMManager, VM } from './base';
import { Room } from '../room';
import { cloudInit, imageName } from './utils';

const VBROWSER_TAG = process.env.VBROWSER_TAG || 'vbrowser';
const SCW_SECRET_KEY = process.env.SCW_SECRET_KEY;
const SCW_ORGANIZATION_ID = process.env.SCW_ORGANIZATION_ID;
const size = 'DEV1-M'; // DEV1-S, DEV1-M, DEV1-L
const region = 'nl-ams-1';
const gatewayHost = 'gateway2.watchparty.me';
const imageId = '1e72e882-f000-4c6e-b538-974af74c2a6a';
// const region = 'fr-par-1';
// const gatewayHost = 'gateway.watchparty.me';
// const imageId = '8e96c468-2769-4314-bb39-f3c941f63d48';

export class Scaleway extends VMManager {
  redisQueueKey = 'availableListScaleway';
  startVM = async (name: string) => {
    const response = await axios({
      method: 'POST',
      url: `https://api.scaleway.com/instance/v1/zones/${region}/servers`,
      headers: {
        'X-Auth-Token': SCW_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        name: name,
        dynamic_ip_required: true,
        commercial_type: size,
        image: imageId,
        volumes: {},
        organization: SCW_ORGANIZATION_ID,
        tags: [VBROWSER_TAG],
      },
    });
    // console.log(response.data);
    const id = response.data.server.id;
    const response2 = await axios({
      method: 'PATCH',
      url: `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}/user_data/cloud-init`,
      headers: {
        'X-Auth-Token': SCW_SECRET_KEY,
        'Content-Type': 'text/plain',
      },
      // set userdata for boot action
      data: cloudInit(imageName),
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
    return id;
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

  rebootVM = async (id: string) => {
    // Generate a new password
    const password = uuidv4();
    // Update the VM's name (also the hostname that will be used as password)
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
    return;
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
      let server = this.mapServerObject(response.data.server);
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
      .map(this.mapServerObject)
      .filter(
        (server: VM) => server.tags.includes(VBROWSER_TAG) && server.private_ip
      );
  };
  mapServerObject = (server: any): VM => ({
    id: server.id,
    pass: server.name,
    // The gateway handles SSL termination and proxies to the private IP
    host: `${gatewayHost}/?ip=${server.private_ip}`,
    private_ip: server.private_ip,
    state: server.state,
    tags: server.tags,
    creation_date: server.creation_date,
    provider: this.redisQueueKey,
  });
}
