import config from "../config.ts";
import { VMManager, type VM } from "./base.ts";
import fs from "node:fs";
import { redis } from "../utils/redis.ts";

const HETZNER_TOKEN = config.HETZNER_TOKEN;
const sshKeys = config.HETZNER_SSH_KEYS.split(",").map(Number);

export class Hetzner extends VMManager {
  size = "cx33";
  // keep existing server pools of cpx11 (US), disable deletion to keep pricing
  // add new HetznerEU as default free pool using cx33
  // premium pool updated to cpx32 (available in EU), legacy US servers use cpx31
  largeSize = "cpx32";
  largeSizeUS = "cpx31";
  minRetries = 5;
  reuseVMs = true;
  id = "Hetzner";
  gateway = config.HETZNER_GATEWAY;
  imageId = config.HETZNER_IMAGE;

  private getRandomDatacenter() {
    // US
    let datacenters = ["ash"];
    if (this.region === "USW") {
      datacenters = ["hil"];
    } else if (this.region === "EU") {
      datacenters = ["nbg1", "fsn1", "hel1"];
    }
    return datacenters[Math.floor(Math.random() * datacenters.length)];
  }

  startVM = async (name: string) => {
    let size = this.isLarge ? this.largeSize : this.size;
    if (this.isLarge && (this.region === "US" || this.region === "USW")) {
      size = this.largeSizeUS;
    }
    const data = {
      name: name,
      server_type: size,
      start_after_create: true,
      image: Number(this.imageId),
      ssh_keys: sshKeys,
      public_net: {
        enable_ipv4: true,
        enable_ipv6: false,
      },
      // networks: [
      //   this.networks[Math.floor(Math.random() * this.networks.length)],
      // ],
      // user_data: `replace with vbrowser.sh startup script if we want to boot vbrowser on instance creation (won't trigger on rebuild/restart)`
      labels: {
        [this.getTag()]: "1",
      },
      location: this.getRandomDatacenter(),
    };
    const response = await fetch(`https://api.hetzner.cloud/v1/servers`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + HETZNER_TOKEN,
        "Content-Type": "application/json",
        "User-Agent": "test",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw Object.assign(
        new Error(`HTTP ${response.status}: ${await response.text()}`),
        { status: response.status },
      );
    }
    const respData = await response.json();
    const id = respData.server.id;
    return id;
  };

  terminateVM = async (id: string) => {
    const response = await fetch(`https://api.hetzner.cloud/v1/servers/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + HETZNER_TOKEN,
        "User-Agent": "test",
      },
    });
    if (!response.ok) {
      throw Object.assign(
        new Error(`HTTP ${response.status}: ${await response.text()}`),
        { status: response.status },
      );
    }
  };

  rebootVM = async (id: string) => {
    // Reboot the VM
    const response = await fetch(
      `https://api.hetzner.cloud/v1/servers/${id}/actions/reboot`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + HETZNER_TOKEN,
          "User-Agent": "test",
        },
      },
    );
    if (!response.ok) {
      throw Object.assign(
        new Error(`HTTP ${response.status}: ${await response.text()}`),
        { status: response.status },
      );
    }
    return;
  };

  reimageVM = async (id: string) => {
    // Rebuild the VM
    const response = await fetch(
      `https://api.hetzner.cloud/v1/servers/${id}/actions/rebuild`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + HETZNER_TOKEN,
          "Content-Type": "application/json",
          "User-Agent": "test",
        },
        body: JSON.stringify({
          image: Number(this.imageId),
        }),
      },
    );
    if (!response.ok) {
      throw Object.assign(
        new Error(`HTTP ${response.status}: ${await response.text()}`),
        { status: response.status },
      );
    }
    return;
  };

  getVM = async (id: string) => {
    const response = await fetch(`https://api.hetzner.cloud/v1/servers/${id}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + HETZNER_TOKEN,
        "User-Agent": "test",
      },
    });
    if (!response.ok) {
      throw Object.assign(
        new Error(`HTTP ${response.status}: ${await response.text()}`),
        { status: response.status },
      );
    }
    const remaining = response.headers.get("ratelimit-remaining");
    console.log("[GETVM] %s: %s rate limit remaining", id, remaining);
    if (remaining) {
      await redis?.set("hetznerApiRemaining", remaining);
    }
    const data = await response.json();
    const server = this.mapServerObject(data.server);
    return server;
  };

  listVMs = async (filter: string) => {
    const limit = this.getLimitSize();
    const pageCount = Math.ceil((limit || 1) / 50);
    const pages = Array.from(Array(pageCount).keys()).map((i) => i + 1);
    const responses: any[] = await Promise.all(
      pages.map(async (page) => {
        const params = new URLSearchParams({
          sort: "id:asc",
          page: String(page),
          per_page: "50",
          label_selector: filter,
        });
        const resp = await fetch(
          `https://api.hetzner.cloud/v1/servers?${params}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + HETZNER_TOKEN,
              "User-Agent": "test",
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

  powerOn = async (id: string) => {
    // Poweron the server (usually not needed)
    try {
      const response = await fetch(
        `https://api.hetzner.cloud/v1/servers/${id}/actions/poweron`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + HETZNER_TOKEN,
            "Content-Type": "application/json",
            "User-Agent": "test",
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (e) {
      console.log("%s failed to poweron", id);
    }
  };

  attachToNetwork = async (id: string) => {
    // // Attach server to network (usually not needed)
    // try {
    //   const response: any = await fetch(`https://api.hetzner.cloud/v1/servers/${id}`, {
    //     method: 'GET',
    //     headers: {
    //       Authorization: 'Bearer ' + HETZNER_TOKEN,
    //     },
    //   });
    //   const data = await response.json();
    //   if (data.server.private_net?.[0] == null) {
    //     await fetch(`https://api.hetzner.cloud/v1/servers/${id}/actions/attach_to_network`, {
    //       method: 'POST',
    //       headers: {
    //         Authorization: 'Bearer ' + HETZNER_TOKEN,
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         network:
    //           this.networks[Math.floor(Math.random() * this.networks.length)],
    //       }),
    //     });
    //   }
    // } catch (e: any) {
    //   console.log('%s failed to attach to network', id);
    // }
  };

  updateSnapshot = async () => {
    const response = await fetch(`https://api.hetzner.cloud/v1/servers`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + HETZNER_TOKEN,
        "Content-Type": "application/json",
        "User-Agent": "test",
      },
      body: JSON.stringify({
        name: "vBrowserSnapshot",
        server_type: "cpx11",
        start_after_create: true,
        image: "docker-ce", // 15512617 for Ubuntu 20.04
        ssh_keys: sshKeys,
        user_data: fs
          .readFileSync(import.meta.dirname + "/../../dev/vbrowser.sh")
          .toString()
          .replace("{VBROWSER_ADMIN_KEY}", config.VBROWSER_ADMIN_KEY),
        location: this.getRandomDatacenter(),
      }),
    });
    if (!response.ok) {
      throw Object.assign(
        new Error(`HTTP ${response.status}: ${await response.text()}`),
        { status: response.status },
      );
    }
    const data = await response.json();
    const id = data.server.id;
    await new Promise((resolve) => setTimeout(resolve, 4 * 60 * 1000));
    // Validate snapshot server was created successfully
    // const response3 = await fetch(
    //   'http://' + data.server.public_net?.ipv4?.ip + ':5000'
    // );
    const response2 = await fetch(
      `https://api.hetzner.cloud/v1/servers/${id}/actions/create_image`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + HETZNER_TOKEN,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response2.ok) {
      throw Object.assign(
        new Error(`HTTP ${response2.status}: ${await response2.text()}`),
        { status: response2.status },
      );
    }
    const data2 = await response2.json();
    const imageId = data2.image.id;
    await this.terminateVM(id);
    return imageId;
  };

  mapServerObject = (server: any): VM => {
    const public_ip = server.public_net?.ipv4?.ip;
    // const private_ip = server.private_net?.[0]?.ip;
    const ip = public_ip;
    // We can use either the public or private IP for communicating between gateway and VM
    // Only signaling traffic goes through here since the video is transmitted over WebRTC
    // The private IP requires the server and gateway to be on the same network and there is a limit to the number of servers allowed
    return {
      id: server.id?.toString(),
      // The gateway handles SSL termination and proxies to the private IP
      host: ip ? `${this.gateway}/?ip=${ip}` : "",
      provider: this.id,
      large: this.isLarge,
      region: this.region,
    };
  };
}
