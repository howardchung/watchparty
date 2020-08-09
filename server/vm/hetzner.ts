import config from '../config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { VMManager, VM } from './base';
import { cloudInit, imageName } from './utils';

const HETZNER_TOKEN = config.HETZNER_TOKEN;
const region = 'nbg1';
const gatewayHost = 'gateway3.watchparty.me';
const sshKeys = [1570536];
const networks = [91163];
const imageId = 18088931;

export class Hetzner extends VMManager {
  size = 'cpx11'; // cx11, cpx11, cpx21, cpx31, ccx11
  largeSize = 'cpx31';
  redisQueueKey = 'availableListHetzner';
  redisStagingKey = 'stagingListHetzner';
  startVM = async (name: string) => {
    const response = await axios({
      method: 'POST',
      url: `https://api.hetzner.cloud/v1/servers`,
      headers: {
        Authorization: 'Bearer ' + HETZNER_TOKEN,
        'Content-Type': 'application/json',
      },
      data: {
        name: name,
        server_type: this.isLarge ? this.largeSize : this.size,
        start_after_create: true,
        image: imageId,
        ssh_keys: sshKeys,
        networks,
        user_data: cloudInit(
          imageName,
          this.isLarge ? '1920x1080@30' : undefined
        ),
        labels: {
          [this.tag]: '1',
          originalName: name,
        },
        location: region,
      },
    });
    const id = response.data.server.id;
    return id;
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
    // Hetzner does not update the hostname automatically on instance name update + reboot
    // It requires a rebuild command
    // Generate a new password
    const password = uuidv4();

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

    // Rebuild the VM
    const response2 = await axios({
      method: 'POST',
      url: `https://api.hetzner.cloud/v1/servers/${id}/actions/rebuild`,
      headers: {
        Authorization: 'Bearer ' + HETZNER_TOKEN,
      },
      data: {
        image: imageId,
      },
    });
    return;
  };

  getVM = async (id: string) => {
    const response = await axios({
      method: 'GET',
      url: `https://api.hetzner.cloud/v1/servers/${id}`,
      headers: {
        Authorization: 'Bearer ' + HETZNER_TOKEN,
      },
    });
    let server = this.mapServerObject(response.data.server);
    if (!server.private_ip) {
      throw new Error('vm not ready');
    }
    return server;
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
      .map(this.mapServerObject)
      .filter(
        (server: VM) => server.tags.includes(this.tag) && server.private_ip
      );
  };

  powerOn = async (id: string) => {
    // Poweron the server (usually not needed)
    try {
      const response2 = await axios({
        method: 'POST',
        url: `https://api.hetzner.cloud/v1/servers/${id}/actions/poweron`,
        headers: {
          Authorization: 'Bearer ' + HETZNER_TOKEN,
          'Content-Type': 'application/json',
        },
      });
    } catch (e) {
      console.error('failed to poweron');
    }
  };

  mapServerObject = (server: any): VM => ({
    id: server.id?.toString(),
    pass: server.name,
    // The gateway handles SSL termination and proxies to the private IP
    host: `${gatewayHost}/?ip=${server.private_net?.[0]?.ip}`,
    private_ip: server.private_net?.[0]?.ip,
    state: server.status,
    tags: Object.keys(server.labels),
    creation_date: server.created,
    originalName: server.labels.originalName,
    provider: this.getRedisQueueKey(),
    large: this.isLarge,
  });
}
