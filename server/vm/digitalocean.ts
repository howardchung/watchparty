import config from "../config.ts";
import { VMManager, type VM } from "./base.ts";

const DO_TOKEN = config.DO_TOKEN;
const region = "sfo3";
const gatewayHost = config.DO_GATEWAY;
const sshKeys = config.DO_SSH_KEYS.split(",");

export class DigitalOcean extends VMManager {
  size = "s-2vcpu-2gb"; // s-1vcpu-1gb, s-1vcpu-2gb, s-2vcpu-2gb, s-2vcpu-4gb, c-2, s-4vcpu-8gb
  largeSize = "s-4vcpu-8gb";
  minRetries = 5;
  reuseVMs = true;
  id = "DO";
  imageId = config.DO_IMAGE;
  startVM = async (name: string) => {
    const response = await fetch(`https://api.digitalocean.com/v2/droplets`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + DO_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        region: region,
        size: this.isLarge ? this.largeSize : this.size,
        image: Number(this.imageId),
        ssh_keys: sshKeys,
        private_networking: true,
        // user_data: cloudInit(),
        tags: [this.getTag()],
      }),
    });
    if (!response.ok) {
      throw Object.assign(
        new Error(`HTTP ${response.status}: ${await response.text()}`),
        { status: response.status },
      );
    }
    const data = await response.json();
    const id = data.droplet.id;
    return id;
  };

  terminateVM = async (id: string) => {
    const response = await fetch(
      `https://api.digitalocean.com/v2/droplets/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + DO_TOKEN,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      throw Object.assign(
        new Error(`HTTP ${response.status}: ${await response.text()}`),
        { status: response.status },
      );
    }
  };

  rebootVM = async (id: string) => {
    // Reboot the VM
    const response2 = await fetch(
      `https://api.digitalocean.com/v2/droplets/${id}/actions`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + DO_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "reboot",
        }),
      },
    );
    if (!response2.ok) {
      throw Object.assign(
        new Error(`HTTP ${response2.status}: ${await response2.text()}`),
        { status: response2.status },
      );
    }
    return;
  };

  reimageVM = async (id: string) => {
    // Rebuild the VM
    const response2 = await fetch(
      `https://api.digitalocean.com/v2/droplets/${id}/actions`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + DO_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "rebuild",
          image: Number(this.imageId),
        }),
      },
    );
    if (!response2.ok) {
      throw Object.assign(
        new Error(`HTTP ${response2.status}: ${await response2.text()}`),
        { status: response2.status },
      );
    }
    return;
  };

  getVM = async (id: string) => {
    const response = await fetch(
      `https://api.digitalocean.com/v2/droplets/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + DO_TOKEN,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      throw Object.assign(
        new Error(`HTTP ${response.status}: ${await response.text()}`),
        { status: response.status },
      );
    }
    const data = await response.json();
    let server = this.mapServerObject(data.droplet);
    return server;
  };

  listVMs = async (filter: string) => {
    // console.log(filter, tags);
    const params = new URLSearchParams({
      // TODO need to update if over 100 results
      per_page: "100",
      tag_name: filter,
    });
    const response = await fetch(
      `https://api.digitalocean.com/v2/droplets?${params}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + DO_TOKEN,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      throw Object.assign(
        new Error(`HTTP ${response.status}: ${await response.text()}`),
        { status: response.status },
      );
    }
    const data = await response.json();
    return data.droplets.map(this.mapServerObject);
  };

  powerOn = async (_id: string) => {};

  attachToNetwork = async (_id: string) => {};

  updateSnapshot = async () => {
    return "";
  };

  mapServerObject = (server: any): VM => {
    // const ip = server.networks.v4.find(
    //   (network: any) => network.type === 'private',
    // )?.ip_address;
    const ip = server.networks.v4.find(
      (network: any) => network.type === "public",
    )?.ip_address;
    return {
      id: server.id?.toString(),
      // The gateway handles SSL termination and proxies to the private IP
      host: ip ? `${gatewayHost}/?ip=${ip}` : "",
      provider: this.id,
      large: this.isLarge,
      region: this.region,
    };
  };
}
