import config from '../config';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { VMManager, VM } from './base';

const SCW_SECRET_KEY = config.SCW_SECRET_KEY;
const SCW_ORGANIZATION_ID = config.SCW_ORGANIZATION_ID;
const region = 'nl-ams-1'; //fr-par-1
const gatewayHost = config.SCW_GATEWAY;
const imageId = config.SCW_IMAGE;

export class Scaleway extends VMManager {
  size = 'DEV1-S'; // DEV1-S, DEV1-M, DEV1-L, GP1-XS
  largeSize = 'DEV1-M';
  minRetries = 20;
  id = 'Scaleway';
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
        commercial_type: this.isLarge ? this.largeSize : this.size,
        image: imageId,
        volumes: {},
        organization: SCW_ORGANIZATION_ID,
        tags: [this.getTag()],
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
      //data: cloudInit(imageName, this.isLarge ? '1920x1080@30' : undefined),
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
        tags: [this.getTag()],
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
    const response = await axios({
      method: 'GET',
      url: `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}`,
      headers: {
        'X-Auth-Token': SCW_SECRET_KEY,
        'Content-Type': 'application/json',
      },
    });
    let server = this.mapServerObject(response.data.server);
    if (!server.private_ip) {
      return null;
    }
    return server;
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
      .filter((server: VM) => server.tags.includes(this.getTag()));
  };

  powerOn = async (_id: string) => {};

  attachToNetwork = async (_id: string) => {};

  updateSnapshot = async () => {
    return '';
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
    provider: this.id,
    large: this.isLarge,
    region: this.region,
  });
}
