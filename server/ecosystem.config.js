const hetznerImage = '53103669';
const hetznerGateway = 'gateway3.watchparty.me';
const hetznerGatewayUS = 'gateway2.watchparty.me';

module.exports = {
  apps: [
    {
      name: 'server',
      script: './buildServer/server.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        PORT: 80,
        HETZNER_GATEWAY: hetznerGateway,
        HETZNER_GATEWAY_US: hetznerGatewayUS,
        HETZNER_IMAGE: hetznerImage,
      },
    },
    {
      name: 'shard1',
      script: './buildServer/server.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        SHARD: 1,
        PORT: 3001,
        HETZNER_GATEWAY: hetznerGateway,
        HETZNER_GATEWAY_US: hetznerGatewayUS,
        HETZNER_IMAGE: hetznerImage,
      },
    },
    // {
    //   name: 'shard2',
    //   script: './buildServer/server.js',
    //   log_date_format: 'YYYY-MM-DD HH:mm Z',
    //   env: {
    //     SHARD: 2,
    //     PORT: 3002,
    //     HETZNER_GATEWAY: hetznerGateway,
    //     HETZNER_GATEWAY_US: hetznerGatewayUS,
    //     HETZNER_IMAGE: hetznerImage,
    //   },
    // },
    // {
    //   name: 'shard3',
    //   script: './buildServer/server.js',
    //   log_date_format: 'YYYY-MM-DD HH:mm Z',
    //   env: {
    //     SHARD: 3,
    //     PORT: 3003,
    //     HETZNER_GATEWAY: hetznerGateway,
    //     HETZNER_GATEWAY_US: hetznerGatewayUS,
    //     HETZNER_IMAGE: hetznerImage,
    //   },
    // },
    {
      name: 'vmWorker',
      script: './buildServer/vmWorker.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        HETZNER_GATEWAY: hetznerGateway,
        HETZNER_NETWORKS: '91163,1007910,1007911',
        HETZNER_GATEWAY_US: hetznerGatewayUS,
        HETZNER_NETWORKS_US: '1258313,1258314,1258315',
        HETZNER_SSH_KEYS: '1570536',
        HETZNER_IMAGE: hetznerImage,
      },
    },
    {
      name: 'syncSubs',
      script: './buildServer/syncSubs.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
    {
      name: 'timeSeries',
      script: './buildServer/timeSeries.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
    {
      name: 'cleanup',
      script: './buildServer/cleanup.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
  ],
};
