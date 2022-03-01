// This assumes an installation of Docker exists at the Docker VM host
// and that host is configured to accept our SSH key
import config from '../config';
import { v4 as uuidv4 } from 'uuid';
import { VMManager, VM } from './base';
import { imageName } from './utils';
//@ts-ignore
import sshExec from 'ssh-exec';

const gatewayHost = config.DOCKER_VM_HOST;
const sshConfig = {
  user: config.DOCKER_VM_HOST_SSH_USER || 'root',
  host: gatewayHost,
  // Defaults to ~/.ssh/id_rsa
  key: config.DOCKER_VM_HOST_SSH_KEY_BASE64
    ? Buffer.from(config.DOCKER_VM_HOST_SSH_KEY_BASE64, 'base64')
    : undefined,
};

export class Docker extends VMManager {
  size = '';
  largeSize = '';
  minRetries = 0;
  id = 'Docker';
  startVM = async (name: string) => {
    return new Promise<string>(async (resolve, reject) => {
      sshExec(
        `
        #!/bin/bash
        set -e
        PORT=$(comm -23 <(seq 5000 5063 | sort) <(ss -Htan | awk '{print $4}' | cut -d':' -f2 | sort -u) | shuf | head -n 1)
        INDEX=$(($PORT - 5000))
        UDP_START=$((59000+$INDEX*100))
        UDP_END=$((59099+$INDEX*100))
        docker run -d --rm --name=${name} --net=host --memory="2g" --cpus="2" -v /etc/letsencrypt:/etc/letsencrypt -l ${this.getTag()} -l index=$INDEX --log-opt max-size=1g --shm-size=1g --cap-add="SYS_ADMIN" -e NEKO_KEY="/etc/letsencrypt/live/${gatewayHost}/privkey.pem" -e NEKO_CERT="/etc/letsencrypt/live/${gatewayHost}/fullchain.pem" -e DISPLAY=":99.0" -e NEKO_SCREEN="${
          this.isLarge ? '1920x1080@30' : ''
        }" -e NEKO_PASSWORD=${name} -e NEKO_PASSWORD_ADMIN=${name} -e NEKO_BIND=":$PORT" -e NEKO_EPR=":$UDP_START-$UDP_END" -e NEKO_H264="1" ${imageName}
        `,
        sshConfig,
        (err: string, stdout: string) => {
          if (err) {
            return reject(err);
          }
          console.log(stdout);
          resolve(stdout.trim());
        }
      );
    });
  };

  terminateVM = async (id: string) => {
    return new Promise<void>((resolve, reject) => {
      sshExec(
        `docker rm -f ${id}`,
        sshConfig,
        (err: string, stdout: string) => {
          if (err) {
            return reject(err);
          }
          resolve();
        }
      );
    });
  };

  rebootVM = async (id: string) => {
    return await this.terminateVM(id);
  };

  // Override the base method, since we don't need to reuse docker containers
  resetVM = async (id: string) => {
    return await this.terminateVM(id);
  };

  getVM = async (id: string) => {
    return new Promise<VM>((resolve, reject) => {
      sshExec(
        `docker inspect ${id}`,
        sshConfig,
        (err: string, stdout: string) => {
          if (err) {
            return reject(err);
          }
          let data = null;
          try {
            data = JSON.parse(stdout)[0];
            if (!data) {
              return reject(new Error('no container with this ID found'));
            }
          } catch {
            console.warn(stdout);
            return reject('failed to parse json');
          }
          let server = this.mapServerObject(data);
          return resolve(server);
        }
      );
    });
  };

  listVMs = async (filter?: string) => {
    return new Promise<VM[]>((resolve, reject) => {
      sshExec(
        `docker inspect $(docker ps --filter label=${filter} --quiet --no-trunc) || true`,
        sshConfig,
        (err: string, stdout: string) => {
          // Swallow exceptions and return empty array
          if (err) {
            return resolve([]);
          }
          if (!stdout) {
            return resolve([]);
          }
          let data = [];
          try {
            data = JSON.parse(stdout);
          } catch (e) {
            console.warn(stdout);
            return reject('failed to parse json');
          }
          return resolve(data.map(this.mapServerObject));
        }
      );
    });
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
