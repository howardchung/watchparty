import config from '../config';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { VMManager, VM } from './base';

const DO_TOKEN = config.DO_TOKEN;
const region = 'sfo3';
const gatewayHost = config.DO_GATEWAY;
const imageId = Number(config.DO_IMAGE);
const sshKeys = config.DO_SSH_KEYS.split(',');

export class DigitalOcean extends VMManager {
  size = 's-2vcpu-2gb'; // s-1vcpu-1gb, s-1vcpu-2gb, s-2vcpu-2gb, s-4vcpu-8gb, c-2
  largeSize = 's-2vcpu-2gb';
  minRetries = 20;
  id = 'DO';
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
        size: this.isLarge ? this.largeSize : this.size,
        image: imageId,
        ssh_keys: sshKeys,
        private_networking: true,
        // user_data: cloudInit(
        //   imageName,
        //   this.isLarge ? '1920x1080@30' : undefined
        // ),
        tags: [this.getTag()],
      },
    });
    const id = response.data.droplet.id;
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
    const response = await axios({
      method: 'GET',
      url: `https://api.digitalocean.com/v2/droplets/${id}`,
      headers: {
        Authorization: 'Bearer ' + DO_TOKEN,
        'Content-Type': 'application/json',
      },
    });
    let server = this.mapServerObject(response.data.droplet);
    if (!server.private_ip) {
      return null;
    }
    return server;
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
      .filter((server: VM) => server.tags.includes(this.getTag()));
  };

  powerOn = async (_id: string) => {};

  attachToNetwork = async (_id: string) => {};

  updateSnapshot = async () => {
    return '';
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
      provider: this.id,
      large: this.isLarge,
      region: this.region,
    };
  };
}
