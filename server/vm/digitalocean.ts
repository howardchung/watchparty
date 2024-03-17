import config from '../config';
import axios from 'axios';
import { VMManager, VM } from './base';

const DO_TOKEN = config.DO_TOKEN;
const region = 'sfo3';
const gatewayHost = config.DO_GATEWAY;
const sshKeys = config.DO_SSH_KEYS.split(',');

export class DigitalOcean extends VMManager {
  size = 's-2vcpu-2gb'; // s-1vcpu-1gb, s-1vcpu-2gb, s-2vcpu-2gb, s-2vcpu-4gb, c-2, s-4vcpu-8gb
  largeSize = 's-4vcpu-8gb';
  minRetries = 5;
  reuseVMs = true;
  id = 'DO';
  imageId = config.DO_IMAGE;
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
        image: Number(this.imageId),
        ssh_keys: sshKeys,
        private_networking: true,
        // user_data: cloudInit(),
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
    // Reboot the VM
    const response2 = await axios({
      method: 'POST',
      url: `https://api.digitalocean.com/v2/droplets/${id}/actions`,
      headers: {
        Authorization: 'Bearer ' + DO_TOKEN,
        'Content-Type': 'application/json',
      },
      data: {
        type: 'reboot',
      },
    });
    return;
  };

  reimageVM = async (id: string) => {
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
        image: Number(this.imageId),
      },
    });
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
    return server;
  };

  listVMs = async (filter: string) => {
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
    return response.data.droplets.map(this.mapServerObject);
  };

  powerOn = async (_id: string) => {};

  attachToNetwork = async (_id: string) => {};

  updateSnapshot = async () => {
    return '';
  };

  mapServerObject = (server: any): VM => {
    // const ip = server.networks.v4.find(
    //   (network: any) => network.type === 'private',
    // )?.ip_address;
    const ip = server.networks.v4.find(
      (network: any) => network.type === 'public',
    )?.ip_address;
    return {
      id: server.id?.toString(),
      // The gateway handles SSL termination and proxies to the private IP
      host: ip ? `${gatewayHost}/?ip=${ip}` : '',
      provider: this.id,
      large: this.isLarge,
      region: this.region,
    };
  };
}
