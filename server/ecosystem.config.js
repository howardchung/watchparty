module.exports = {
  apps: [
    {
      name: 'server',
      script: './buildServer/server.js',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        PORT: 80,
      },
    },
    {
      name: 'shard1',
      script: './buildServer/server.js',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        SHARD: 1,
        PORT: 3001,
      },
    },
    // {
    //   name: 'shard2',
    //   script: './buildServer/server.js',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    //   env: {
    //     SHARD: 2,
    //     PORT: 3002,
    //   },
    // },
    // {
    //   name: 'shard3',
    //   script: './buildServer/server.js',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    //   env: {
    //     SHARD: 3,
    //     PORT: 3003,
    //   },
    // },
    {
      name: 'vmWorker',
      script: './buildServer/vmWorker.js',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        HETZNER_GATEWAY: 'gateway3.watchparty.me',
        HETZNER_NETWORKS: '91163,1007910,1007911',
        HETZNER_GATEWAY_US: 'gateway2.watchparty.me',
        HETZNER_NETWORKS_US: '1258313,1258314,1258315',
        HETZNER_SSH_KEYS: '1570536',
        HETZNER_IMAGE: '61352611',
        SCW_GATEWAY: 'gateway1.watchparty.me',
        SCW_IMAGE: '',
        DO_GATEWAY: 'gateway4.watchparty.me',
        DO_IMAGE: '',
        DO_SSH_KEYS: '',
      },
    },
    {
      name: 'syncSubs',
      script: './buildServer/syncSubs.js',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'timeSeries',
      script: './buildServer/timeSeries.js',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'cleanup',
      script: './buildServer/cleanup.js',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
