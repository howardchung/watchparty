"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scaleway = void 0;
const config_1 = __importDefault(require("../config"));
const axios_1 = __importDefault(require("axios"));
const base_1 = require("./base");
const SCW_SECRET_KEY = config_1.default.SCW_SECRET_KEY;
const SCW_ORGANIZATION_ID = config_1.default.SCW_ORGANIZATION_ID;
const region = 'nl-ams-1'; //fr-par-1
const gatewayHost = config_1.default.SCW_GATEWAY;
class Scaleway extends base_1.VMManager {
    constructor() {
        super(...arguments);
        this.size = 'DEV1-S'; // DEV1-S, DEV1-M, DEV1-L, GP1-XS
        this.largeSize = 'DEV1-M';
        this.minRetries = 5;
        this.reuseVMs = true;
        this.id = 'Scaleway';
        this.imageId = config_1.default.SCW_IMAGE;
        this.startVM = async (name) => {
            const response = await (0, axios_1.default)({
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
            const response2 = await (0, axios_1.default)({
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
            const response3 = await (0, axios_1.default)({
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
        this.terminateVM = async (id) => {
            const response = await (0, axios_1.default)({
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
        this.rebootVM = async (id) => {
            // Reboot the VM (also destroys the Docker container since it has --rm flag)
            const response2 = await (0, axios_1.default)({
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
        this.reimageVM = async (id) => {
            // Scaleway doesn't have a reimage/rebuild command. Delete the VM
            await this.terminateVMWrapper(id);
        };
        this.getVM = async (id) => {
            const response = await (0, axios_1.default)({
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
        this.listVMs = async (filter) => {
            const limit = this.getLimitSize();
            const pageCount = Math.ceil((limit || 1) / 100);
            const pages = Array.from(Array(pageCount).keys()).map((i) => i + 1);
            const responses = await Promise.all(pages.map((page) => (0, axios_1.default)({
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
            })));
            const responsesMapped = responses.map((response) => response.data.servers.map(this.mapServerObject));
            return responsesMapped.flat();
        };
        this.powerOn = async (_id) => { };
        this.attachToNetwork = async (_id) => { };
        this.updateSnapshot = async () => {
            return '';
        };
        this.mapServerObject = (server) => {
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
}
exports.Scaleway = Scaleway;
