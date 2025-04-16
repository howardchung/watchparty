"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Docker = void 0;
// This assumes an installation of Docker exists on the given host
// and that host is configured to accept our SSH key
const config_1 = __importDefault(require("../config"));
const base_1 = require("./base");
const utils_1 = require("./utils");
const fs_1 = __importDefault(require("fs"));
const os_1 = require("os");
const node_ssh_1 = require("node-ssh");
class Docker extends base_1.VMManager {
    constructor() {
        super(...arguments);
        // TODO support multiple Docker providers in the pool config with same region
        this.size = '';
        this.largeSize = '';
        this.minRetries = 0;
        this.reuseVMs = false;
        this.id = 'Docker';
        this.ssh = undefined;
        this.imageId = utils_1.imageName;
        this.getSSH = async () => {
            if (this.ssh && this.ssh.isConnected()) {
                return this.ssh;
            }
            const sshConfig = {
                username: config_1.default.DOCKER_VM_HOST_SSH_USER,
                host: this.hostname,
                // The private key the Docker host is configured to accept
                privateKey: config_1.default.DOCKER_VM_HOST_SSH_KEY_BASE64
                    ? Buffer.from(config_1.default.DOCKER_VM_HOST_SSH_KEY_BASE64, 'base64').toString()
                    : fs_1.default.readFileSync((0, os_1.homedir)() + '/.ssh/id_rsa').toString(),
            };
            this.ssh = new node_ssh_1.NodeSSH();
            await this.ssh.connect(sshConfig);
            return this.ssh;
        };
        this.startVM = async (name) => {
            const tag = this.getTag();
            const conn = await this.getSSH();
            // If in development, have neko share the same SSL cert as the other services
            // If in production, they are probably on different hosts and neko is behind a reverse proxy for SSL termination
            const sslEnv = config_1.default.NODE_ENV === 'development' &&
                config_1.default.SSL_KEY_FILE &&
                config_1.default.SSL_CRT_FILE
                ? `-e NEKO_KEY="${config_1.default.SSL_KEY_FILE}" -e NEKO_CERT="${config_1.default.SSL_CRT_FILE}"`
                : '';
            const { stdout, stderr } = await conn.execCommand(`
      #!/bin/bash
      set -e
      PORT=$(comm -23 <(seq 5000 5063 | sort) <(ss -Htan | awk '{print $4}' | cut -d':' -f2 | sort -u) | sort -n | head -n 1)
      INDEX=$(($PORT - 5000))
      UDP_START=$((59000+$INDEX*100))
      UDP_END=$((59099+$INDEX*100))
      docker run -d --rm --name=${name} --memory="2g" --cpus="2" -p $PORT:$PORT -p $UDP_START-$UDP_END:$UDP_START-$UDP_END/udp -v /etc/letsencrypt:/etc/letsencrypt -l ${tag} -l index=$INDEX --log-opt max-size=1g --shm-size=1g --cap-add="SYS_ADMIN" ${sslEnv} -e DISPLAY=":99.0" -e NEKO_PASSWORD=${name} -e NEKO_PASSWORD_ADMIN=${name} -e NEKO_ADMIN_KEY=${config_1.default.VBROWSER_ADMIN_KEY} -e NEKO_BIND=":$PORT" -e NEKO_EPR=":$UDP_START-$UDP_END" -e NEKO_H264="1" ${utils_1.imageName}
      `);
            console.log(stdout, stderr);
            return stdout.trim();
        };
        this.terminateVM = async (id) => {
            const conn = await this.getSSH();
            const { stdout, stderr } = await conn.execCommand(`docker rm -fv ${id}`);
            console.log(stdout, stderr);
            return;
        };
        this.rebootVM = async (id) => {
            // Docker containers aren't set to reuse, so do nothing (reset will terminate)
        };
        this.reimageVM = async (id) => {
            const conn = await this.getSSH();
            const { stdout, stderr } = await conn.execCommand(`docker pull ${this.imageId}`);
            console.log(stdout, stderr);
            // The container is out of date. Delete it
            this.terminateVMWrapper(id);
            return;
        };
        this.getVM = async (id) => {
            const conn = await this.getSSH();
            const { stdout } = await conn.execCommand(`docker inspect ${id}`);
            let data = null;
            try {
                data = JSON.parse(stdout)[0];
                if (!data) {
                    throw new Error('no container with this ID found');
                }
            }
            catch {
                console.warn(stdout);
                throw new Error('failed to parse json');
            }
            let server = this.mapServerObject(data);
            return server;
        };
        this.listVMs = async (filter) => {
            const conn = await this.getSSH();
            const listCmd = `docker inspect $(docker ps --filter label=${filter} --quiet --no-trunc)`;
            const { stdout } = await conn.execCommand(listCmd);
            if (!stdout) {
                return [];
            }
            let data = [];
            try {
                data = JSON.parse(stdout);
            }
            catch (e) {
                console.warn(stdout);
                throw new Error('failed to parse json');
            }
            return data.map(this.mapServerObject);
        };
        this.powerOn = async (id) => { };
        this.attachToNetwork = async (id) => { };
        this.updateSnapshot = async () => {
            return '';
        };
        this.mapServerObject = (server) => ({
            id: server.Id,
            host: `${this.hostname}:${5000 + Number(server.Config?.Labels?.index)}`,
            provider: this.id,
            large: this.isLarge,
            region: this.region,
        });
    }
}
exports.Docker = Docker;
