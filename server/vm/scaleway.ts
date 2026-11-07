import config from "../config.ts";
import { VMManager, type VM } from "./base.ts";

const SCW_SECRET_KEY = config.SCW_SECRET_KEY;
const SCW_ORGANIZATION_ID = config.SCW_ORGANIZATION_ID;
const region = "nl-ams-1"; //fr-par-1
const gatewayHost = config.SCW_GATEWAY;

export class Scaleway extends VMManager {
  size = "DEV1-S"; // DEV1-S, DEV1-M, DEV1-L, GP1-XS
  largeSize = "DEV1-M";
  minRetries = 5;
  reuseVMs = true;
  id = "Scaleway";
  imageId = config.SCW_IMAGE;
  startVM = async (name: string) => {
    const response = await fetch(
      `https://api.scaleway.com/instance/v1/zones/${region}/servers`,
      {
        method: "POST",
        headers: {
          "X-Auth-Token": SCW_SECRET_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          dynamic_ip_required: true,
          commercial_type: this.isLarge ? this.largeSize : this.size,
          image: this.imageId,
          volumes: {},
          organization: SCW_ORGANIZATION_ID,
          tags: [this.getTag()],
        }),
      },
    );
    if (!response.ok) {
      throw Object.assign(
        new Error(`HTTP ${response.status}: ${await response.text()}`),
        { status: response.status },
      );
    }
    const data = await response.json();
    // console.log(data);
    const id = data.server.id;
    const response2 = await fetch(
      `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}/user_data/cloud-init`,
      {
        method: "PATCH",
        headers: {
          "X-Auth-Token": SCW_SECRET_KEY,
          "Content-Type": "text/plain",
        },
        // set userdata for boot action
        //body: cloudInit(),
      },
    );
    if (!response2.ok) {
      throw Object.assign(
        new Error(`HTTP ${response2.status}: ${await response2.text()}`),
        { status: response2.status },
      );
    }
    // boot the instance
    const response3 = await fetch(
      `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}/action`,
      {
        method: "POST",
        headers: {
          "X-Auth-Token": SCW_SECRET_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "poweron",
        }),
      },
    );
    if (!response3.ok) {
      throw Object.assign(
        new Error(`HTTP ${response3.status}: ${await response3.text()}`),
        { status: response3.status },
      );
    }
    return id;
  };

  terminateVM = async (id: string) => {
    const response = await fetch(
      `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}/action`,
      {
        method: "POST",
        headers: {
          "X-Auth-Token": SCW_SECRET_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "terminate",
        }),
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
    // Reboot the VM (also destroys the Docker container since it has --rm flag)
    const response2 = await fetch(
      `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}/action`,
      {
        method: "POST",
        headers: {
          "X-Auth-Token": SCW_SECRET_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reboot",
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
    // Scaleway doesn't have a reimage/rebuild command. Delete the VM
    await this.terminateVMWrapper(id);
  };

  getVM = async (id: string) => {
    const response = await fetch(
      `https://api.scaleway.com/instance/v1/zones/${region}/servers/${id}`,
      {
        method: "GET",
        headers: {
          "X-Auth-Token": SCW_SECRET_KEY,
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
    let server = this.mapServerObject(data.server);
    return server;
  };

  listVMs = async (filter: string) => {
    const limit = this.getLimitSize();
    const pageCount = Math.ceil((limit || 1) / 100);
    const pages = Array.from(Array(pageCount).keys()).map((i) => i + 1);
    const responses: any[] = await Promise.all(
      pages.map(async (page) => {
        const params = new URLSearchParams({
          page: String(page),
          per_page: "100",
          tags: filter,
        });
        const resp = await fetch(
          `https://api.scaleway.com/instance/v1/zones/${region}/servers?${params}`,
          {
            method: "GET",
            headers: {
              "X-Auth-Token": SCW_SECRET_KEY,
              "Content-Type": "application/json",
            },
          },
        );
        if (!resp.ok) {
          throw Object.assign(
            new Error(`HTTP ${resp.status}: ${await resp.text()}`),
            { status: resp.status },
          );
        }
        return resp.json();
      }),
    );
    const responsesMapped = responses.map((data) =>
      data.servers.map(this.mapServerObject),
    );
    return responsesMapped.flat();
  };

  powerOn = async (_id: string) => {};

  attachToNetwork = async (_id: string) => {};

  updateSnapshot = async () => {
    return "";
  };

  mapServerObject = (server: any): VM => {
    // const ip = server.private_ip;
    const ip = server.public_ip?.address;
    return {
      id: server.id,
      // The gateway handles SSL termination and proxies to the private IP
      host: ip ? `${gatewayHost}/?ip=${ip}` : "",
      provider: this.id,
      large: this.isLarge,
      region: this.region,
    };
  };
}
