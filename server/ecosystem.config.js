const hetznerImage = '51615253';

module.exports = {
  apps: [
    {
      name: 'server',
      script: './buildServer/server.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        PORT: 80,
        HETZNER_GATEWAY: 'gateway3.watchparty.me',
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
      },
    },
    // {
    //   name: 'shard2',
    //   script: './buildServer/server.js',
    //   log_date_format: 'YYYY-MM-DD HH:mm Z',
    //   env: {
    //     SHARD: 2,
    //     PORT: 3002,
    //   },
    // },
    // {
    //   name: 'shard3',
    //   script: './buildServer/server.js',
    //   log_date_format: 'YYYY-MM-DD HH:mm Z',
    //   env: {
    //     SHARD: 3,
    //     PORT: 3003,
    //   },
    // },
    {
      name: 'vmWorker',
      script: './buildServer/vmWorker.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        HETZNER_GATEWAY: 'gateway3.watchparty.me',
        HETZNER_NETWORKS: '91163,1007910,1007911',
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
    // {
    //   name: 'cleanup',
    //   script: './buildServer/cleanup.js',
    // log_date_format: 'YYYY-MM-DD HH:mm Z',
    // },
  ],
};
