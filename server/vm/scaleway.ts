import config from '../config';
import axios from 'axios';
import { VMManager, VM } from './base';

const SCW_SECRET_KEY = config.SCW_SECRET_KEY;
const SCW_ORGANIZATION_ID = config.SCW_ORGANIZATION_ID;
const region = 'nl-ams-1'; //fr-par-1
const gatewayHost = config.SCW_GATEWAY;

export class Scaleway extends VMManager {
  size = 'DEV1-S'; // DEV1-S, DEV1-M, DEV1-L, GP1-XS
  largeSize = 'DEV1-M';
  minRetries = 5;
  reuseVMs = true;
  id = 'Scaleway';
  imageId = config.SCW_IMAGE;
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
        image: this.imageId,
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
      //data: cloudInit(),
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

  reimageVM = async (id: string) => {
    // Scaleway doesn't have a reimage/rebuild command. Delete the VM
    await this.terminateVMWrapper(id);
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
    return server;
  };

  listVMs = async (filter: string) => {
    const limit = this.getLimitSize();
    const pageCount = Math.ceil((limit || 1) / 100);
    const pages = Array.from(Array(pageCount).keys()).map((i) => i + 1);
    const responses: any[] = await Promise.all(
      pages.map((page) =>
        axios({
          method: 'GET',
          url: `https://api.scaleway.com/instance/v1/zones/${region}/servers`,
          headers: {
            'X-Auth-Token': SCW_SECRET_KEY,
            'Content-Type': 'application/json',
          },
          params: {
            page,
            per_page: 100,
            tags: filter,
          },
        }),
      ),
    );
    const responsesMapped = responses.map((response) =>
      response.data.servers.map(this.mapServerObject),
    );
    return responsesMapped.flat();
  };

  powerOn = async (_id: string) => {};

  attachToNetwork = async (_id: string) => {};

  updateSnapshot = async () => {
    return '';
  };

  mapServerObject = (server: any): VM => {
    // const ip = server.private_ip;
    const ip = server.public_ip?.address;
    return {
      id: server.id,
      // The gateway handles SSL termination and proxies to the private IP
      host: ip ? `${gatewayHost}/?ip=${ip}` : '',
      provider: this.id,
      large: this.isLarge,
      region: this.region,
    };
  };
}
