import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { VMManager, VM } from './base';
import { cloudInit, imageName } from './utils';

const VBROWSER_TAG = process.env.VBROWSER_TAG || 'vbrowser';
const DO_TOKEN = process.env.DO_TOKEN;
const region = 'sfo2';
const size = 's-1vcpu-2gb'; // s-1vcpu-1gb, s-1vcpu-2gb, s-2vcpu-2gb
const gatewayHost = 'gateway4.watchparty.me';
const imageId = 64226647;
const sshKeys = ['cc:3d:a7:d3:99:17:fe:b7:dd:59:c4:78:14:d4:02:d1'];

export class DigitalOcean extends VMManager {
  redisQueueKey = 'availableListDO';
  startVM = async (name: string) => {
    const response = await axios({
      method: 'POST',
      url: `https://api.digitalocean.com/v2/droplets`,
      headers: {
        Authorization: 'Bearer ' + DO_TOKEN,
        'Content-Type': 'application/json',
      },
      data: {
        name: name,
        region: region,
        size,
        image: imageId,
        ssh_keys: sshKeys,
        private_networking: true,
        user_data: cloudInit(imageName),
        tags: [VBROWSER_TAG],
      },
    });
    const id = response.data.droplet.id;
    await this.getVM(id);
    // boot the instance
    const response3 = await axios({
      method: 'POST',
      url: `https://api.digitalocean.com/v2/droplets/${id}/actions`,
      headers: {
        Authorization: 'Bearer ' + DO_TOKEN,
        'Content-Type': 'application/json',
      },
      data: {
        type: 'power_on',
      },
    });
    // console.log(response3.data);
    return id;
  };

  terminateVM = async (id: string) => {
    const response = await axios({
      method: 'DELETE',
      url: `https://api.digitalocean.com/v2/droplets/${id}`,
      headers: {
        Authorization: 'Bearer ' + DO_TOKEN,
        'Content-Type': 'application/json',
      },
    });
  };

  rebootVM = async (id: string) => {
    // Generate a new password
    const password = uuidv4();
    // Update the VM's name (also the hostname that will be used as password)
    const response = await axios({
      method: 'POST',
      url: `https://api.digitalocean.com/v2/droplets/${id}/actions`,
      headers: {
        Authorization: 'Bearer ' + DO_TOKEN,
        'Content-Type': 'application/json',
      },
      data: {
        type: 'rename',
        name: password,
      },
    });

    const actionId = response.data.action.id;
    // Wait for the rename action to complete
    while (true) {
      const response3 = await axios({
        method: 'GET',
        url: `https://api.digitalocean.com/v2/actions/${actionId}`,
        headers: {
          Authorization: 'Bearer ' + DO_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      if (response3?.data?.action?.status === 'completed') {
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // Rebuild the VM
    const response2 = await axios({
      method: 'POST',
      url: `https://api.digitalocean.com/v2/droplets/${id}/actions`,
      headers: {
        Authorization: 'Bearer ' + DO_TOKEN,
        'Content-Type': 'application/json',
      },
      data: {
        type: 'rebuild',
        image: imageId,
      },
    });
    // Reboot the VM
    // const response2 = await axios({
    //   method: 'POST',
    //   url: `https://api.digitalocean.com/v2/droplets/${id}/actions`,
    //   headers: {
    //     Authorization: 'Bearer ' + DO_TOKEN,
    //     'Content-Type': 'application/json',
    //   },
    //   data: {
    //     type: 'reboot',
    //   },
    // });
    return;
  };

  getVM = async (id: string) => {
    let result = null;
    while (!result) {
      const response = await axios({
        method: 'GET',
        url: `https://api.digitalocean.com/v2/droplets/${id}`,
        headers: {
          Authorization: 'Bearer ' + DO_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      let server = this.mapServerObject(response.data.droplet);
      if (server.private_ip) {
        result = server;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
    return result;
  };

  listVMs = async (filter?: string) => {
    // console.log(filter, tags);
    const response = await axios({
      method: 'GET',
      url: `https://api.digitalocean.com/v2/droplets`,
      headers: {
        Authorization: 'Bearer ' + DO_TOKEN,
        'Content-Type': 'application/json',
      },
      params: {
        // TODO need to update if over 100 results
        per_page: 100,
        tag_name: filter,
      },
    });
    return response.data.droplets
      .map(this.mapServerObject)
      .filter(
        (server: VM) => server.tags.includes(VBROWSER_TAG) && server.private_ip
      );
  };

  mapServerObject = (server: any): VM => {
    const ip = server.networks.v4.find(
      (network: any) => network.type === 'private'
    )?.ip_address;
    return {
      id: server.id?.toString(),
      pass: server.name,
      // The gateway handles SSL termination and proxies to the private IP
      host: `${gatewayHost}/?ip=${ip}`,
      private_ip: ip,
      state: server.status,
      tags: server.tags,
      creation_date: server.created_at,
      provider: this.redisQueueKey,
    };
  };
}
