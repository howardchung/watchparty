// This assumes an installation of Docker exists at DOCKER_VM_HOST
// and that host is configured to accept our SSH key
import config from '../config';
import { VMManager, VM } from './base';
import { imageName } from './utils';
import fs from 'fs';
import { homedir } from 'os';
import { NodeSSH } from 'node-ssh';

const gatewayHost = config.DOCKER_VM_HOST;
let ssh: NodeSSH | undefined = undefined;

async function getSSH() {
  if (ssh && ssh.isConnected()) {
    return ssh;
  }
  if (!gatewayHost) {
    throw new Error('DOCKER_VM_HOST not defined');
  }
  const sshConfig = {
    username: config.DOCKER_VM_HOST_SSH_USER || 'root',
    host: gatewayHost,
    // The private key the Docker host is configured to accept
    privateKey: config.DOCKER_VM_HOST_SSH_KEY_BASE64
      ? Buffer.from(config.DOCKER_VM_HOST_SSH_KEY_BASE64, 'base64').toString()
      : // Defaults to ~/.ssh/id_rsa on the local server
        fs.readFileSync(homedir() + '/.ssh/id_rsa').toString(),
  };
  ssh = new NodeSSH();
  await ssh.connect(sshConfig);
  return ssh;
}

export class Docker extends VMManager {
  size = '';
  largeSize = '';
  minRetries = 0;
  reuseVMs = false;
  id = 'Docker';

  startVM = async (name: string) => {
    const tag = this.getTag();
    const conn = await getSSH();
    const { stdout, stderr } = await conn.execCommand(
      `
      #!/bin/bash
      set -e
      PORT=$(comm -23 <(seq 5000 5063 | sort) <(ss -Htan | awk '{print $4}' | cut -d':' -f2 | sort -u) | shuf | head -n 1)
      INDEX=$(($PORT - 5000))
      UDP_START=$((59000+$INDEX*100))
      UDP_END=$((59099+$INDEX*100))
      docker run -d --rm --name=${name} --memory="2g" --cpus="2" -p $PORT:$PORT -p $UDP_START-$UDP_END:$UDP_START-$UDP_END/udp -v /etc/letsencrypt:/etc/letsencrypt -l ${tag} -l index=$INDEX --log-opt max-size=1g --shm-size=1g --cap-add="SYS_ADMIN" -e NEKO_KEY="/etc/letsencrypt/live/${gatewayHost}/privkey.pem" -e NEKO_CERT="/etc/letsencrypt/live/${gatewayHost}/fullchain.pem" -e DISPLAY=":99.0" -e NEKO_PASSWORD=${name} -e NEKO_PASSWORD_ADMIN=${name} -e NEKO_BIND=":$PORT" -e NEKO_EPR=":$UDP_START-$UDP_END" -e NEKO_H264="1" ${imageName}
      `
    );
    console.log(stdout, stderr);
    return stdout.trim();
  };

  terminateVM = async (id: string) => {
    const conn = await getSSH();
    const { stdout, stderr } = await conn.execCommand(`docker rm -fv ${id}`);
    console.log(stdout, stderr);
    return;
  };

  rebootVM = async (id: string) => {
    // We don't need to reuse Docker containers
    return await this.terminateVMWrapper(id);
  };

  getVM = async (id: string) => {
    const conn = await getSSH();
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

  listVMs = async (filter?: string) => {
    const conn = await getSSH();
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
    pass: server.Name?.slice(1),
    host: `${gatewayHost}:${5000 + Number(server.Config?.Labels?.index)}`,
    private_ip: '',
    state: server.State?.Status,
    tags: server.Config?.Labels,
    creation_date: server.State?.StartedAt,
    provider: this.id,
    large: this.isLarge,
    region: this.region,
  });
}
