// This assumes an installation of Docker exists on the given host
// and that host is configured to accept our SSH key
import config from '../config';
import { VMManager, VM } from './base';
import { imageName } from './utils';
import fs from 'fs';
import { homedir } from 'os';
import { NodeSSH } from 'node-ssh';

export class Docker extends VMManager {
  // TODO support multiple Docker providers in the pool config with same region
  size = '';
  largeSize = '';
  minRetries = 0;
  reuseVMs = false;
  id = 'Docker';
  ssh: NodeSSH | undefined = undefined;
  imageId = imageName;

  getSSH = async () => {
    if (this.ssh && this.ssh.isConnected()) {
      return this.ssh;
    }
    const sshConfig = {
      username: config.DOCKER_VM_HOST_SSH_USER,
      host: this.hostname,
      // The private key the Docker host is configured to accept
      privateKey: config.DOCKER_VM_HOST_SSH_KEY_BASE64
        ? Buffer.from(config.DOCKER_VM_HOST_SSH_KEY_BASE64, 'base64').toString()
        : fs.readFileSync(homedir() + '/.ssh/id_rsa').toString(),
    };
    this.ssh = new NodeSSH();
    await this.ssh.connect(sshConfig);
    return this.ssh;
  };

  startVM = async (name: string) => {
    const tag = this.getTag();
    const conn = await this.getSSH();
    // If in development, have neko share the same SSL cert as the other services
    // If in production, they are probably on different hosts and neko is behind a reverse proxy for SSL termination
    const sslEnv =
      config.NODE_ENV === 'development' &&
      config.SSL_KEY_FILE &&
      config.SSL_CRT_FILE
        ? `-e NEKO_KEY="${config.SSL_KEY_FILE}" -e NEKO_CERT="${config.SSL_CRT_FILE}"`
        : '';
    const { stdout, stderr } = await conn.execCommand(
      `
      #!/bin/bash
      set -e
      PORT=$(comm -23 <(seq 5000 5063 | sort) <(ss -Htan | awk '{print $4}' | cut -d':' -f2 | sort -u) | shuf | head -n 1)
      INDEX=$(($PORT - 5000))
      UDP_START=$((59000+$INDEX*100))
      UDP_END=$((59099+$INDEX*100))
      docker run -d --rm --name=${name} --memory="2g" --cpus="2" -p $PORT:$PORT -p $UDP_START-$UDP_END:$UDP_START-$UDP_END/udp -v /etc/letsencrypt:/etc/letsencrypt -l ${tag} -l index=$INDEX --log-opt max-size=1g --shm-size=1g --cap-add="SYS_ADMIN" ${sslEnv} -e DISPLAY=":99.0" -e NEKO_PASSWORD=${name} -e NEKO_PASSWORD_ADMIN=${name} -e NEKO_ADMIN_KEY=${config.VBROWSER_ADMIN_KEY} -e NEKO_BIND=":$PORT" -e NEKO_EPR=":$UDP_START-$UDP_END" -e NEKO_H264="1" ${imageName}
      `,
    );
    console.log(stdout, stderr);
    return stdout.trim();
  };

  terminateVM = async (id: string) => {
    const conn = await this.getSSH();
    const { stdout, stderr } = await conn.execCommand(`docker rm -fv ${id}`);
    console.log(stdout, stderr);
    return;
  };

  rebootVM = async (id: string) => {
    // Docker containers aren't set to reuse, so do nothing (reset will terminate)
  };

  reimageVM = async (id: string) => {
    const conn = await this.getSSH();
    const { stdout, stderr } = await conn.execCommand(
      `docker pull ${this.imageId}`,
    );
    console.log(stdout, stderr);
    return;
  };

  getVM = async (id: string) => {
    const conn = await this.getSSH();
    const { stdout } = await conn.execCommand(`docker inspect ${id}`);
    let data = null;
    try {
      data = JSON.parse(stdout)[0];
      if (!data) {
        throw new Error('no container with this ID found');
      }
    } catch {
      console.warn(stdout);
      throw new Error('failed to parse json');
    }
    let server = this.mapServerObject(data);
    return server;
  };

  listVMs = async (filter: string) => {
    const conn = await this.getSSH();
    const listCmd = `docker inspect $(docker ps --filter label=${filter} --quiet --no-trunc)`;
    const { stdout } = await conn.execCommand(listCmd);
    if (!stdout) {
      return [];
    }
    let data = [];
    try {
      data = JSON.parse(stdout);
    } catch (e) {
      console.warn(stdout);
      throw new Error('failed to parse json');
    }
    return data.map(this.mapServerObject);
  };

  powerOn = async (id: string) => {};

  attachToNetwork = async (id: string) => {};

  updateSnapshot = async () => {
    return '';
  };

  mapServerObject = (server: any): VM => ({
    id: server.Id,
    host: `${this.hostname}:${5000 + Number(server.Config?.Labels?.index)}`,
    provider: this.id,
    large: this.isLarge,
    region: this.region,
  });
}
