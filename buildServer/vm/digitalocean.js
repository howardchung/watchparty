"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalOcean = void 0;
const config_1 = __importDefault(require("../config"));
const axios_1 = __importDefault(require("axios"));
const base_1 = require("./base");
const DO_TOKEN = config_1.default.DO_TOKEN;
const region = 'sfo3';
const gatewayHost = config_1.default.DO_GATEWAY;
const sshKeys = config_1.default.DO_SSH_KEYS.split(',');
class DigitalOcean extends base_1.VMManager {
    constructor() {
        super(...arguments);
        this.size = 's-2vcpu-2gb'; // s-1vcpu-1gb, s-1vcpu-2gb, s-2vcpu-2gb, s-2vcpu-4gb, c-2, s-4vcpu-8gb
        this.largeSize = 's-4vcpu-8gb';
        this.minRetries = 5;
        this.reuseVMs = true;
        this.id = 'DO';
        this.imageId = config_1.default.DO_IMAGE;
        this.startVM = async (name) => {
            const response = await (0, axios_1.default)({
                method: 'POST',
                url: `https://api.digitalocean.com/v2/droplets`,
                headers: {
                    Authorization: 'Bearer ' + DO_TOKEN,
                    'Content-Type': 'application/json',
                },
                data: {
                    name: name,
                    region: region,
                    size: this.isLarge ? this.largeSize : this.size,
                    image: Number(this.imageId),
                    ssh_keys: sshKeys,
                    private_networking: true,
                    // user_data: cloudInit(),
                    tags: [this.getTag()],
                },
            });
            const id = response.data.droplet.id;
            return id;
        };
        this.terminateVM = async (id) => {
            const response = await (0, axios_1.default)({
                method: 'DELETE',
                url: `https://api.digitalocean.com/v2/droplets/${id}`,
                headers: {
                    Authorization: 'Bearer ' + DO_TOKEN,
                    'Content-Type': 'application/json',
                },
            });
        };
        this.rebootVM = async (id) => {
            // Reboot the VM
            const response2 = await (0, axios_1.default)({
                method: 'POST',
                url: `https://api.digitalocean.com/v2/droplets/${id}/actions`,
                headers: {
                    Authorization: 'Bearer ' + DO_TOKEN,
                    'Content-Type': 'application/json',
                },
                data: {
                    type: 'reboot',
                },
            });
            return;
        };
        this.reimageVM = async (id) => {
            // Rebuild the VM
            const response2 = await (0, axios_1.default)({
                method: 'POST',
                url: `https://api.digitalocean.com/v2/droplets/${id}/actions`,
                headers: {
                    Authorization: 'Bearer ' + DO_TOKEN,
                    'Content-Type': 'application/json',
                },
                data: {
                    type: 'rebuild',
                    image: Number(this.imageId),
                },
            });
            return;
        };
        this.getVM = async (id) => {
            const response = await (0, axios_1.default)({
                method: 'GET',
                url: `https://api.digitalocean.com/v2/droplets/${id}`,
                headers: {
                    Authorization: 'Bearer ' + DO_TOKEN,
                    'Content-Type': 'application/json',
                },
            });
            let server = this.mapServerObject(response.data.droplet);
            return server;
        };
        this.listVMs = async (filter) => {
            // console.log(filter, tags);
            const response = await (0, axios_1.default)({
                method: 'GET',
                url: `https://api.digitalocean.com/v2/droplets`,
                headers: {
                    Authorization: 'Bearer ' + DO_TOKEN,
                    'Content-Type': 'application/json',
                },
                params: {
                    // TODO need to update if over 100 results
                    per_page: 100,
                    tag_name: filter,
                },
            });
            return response.data.droplets.map(this.mapServerObject);
        };
        this.powerOn = async (_id) => { };
        this.attachToNetwork = async (_id) => { };
        this.updateSnapshot = async () => {
            return '';
        };
        this.mapServerObject = (server) => {
            // const ip = server.networks.v4.find(
            //   (network: any) => network.type === 'private',
            // )?.ip_address;
            const ip = server.networks.v4.find((network) => network.type === 'public')?.ip_address;
            return {
                id: server.id?.toString(),
                // The gateway handles SSL termination and proxies to the private IP
                host: ip ? `${gatewayHost}/?ip=${ip}` : '',
                provider: this.id,
                large: this.isLarge,
                region: this.region,
            };
        };
    }
}
exports.DigitalOcean = DigitalOcean;
