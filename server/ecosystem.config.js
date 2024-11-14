module.exports = {
  apps: [
    // {
    //   name: 'server',
    //   script: './buildServer/server.js',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    //   env: {
    //     PORT: 80,
    //   },
    // },
    {
      name: 'shard1',
      script: './buildServer/server.js',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        SHARD: 1,
        PORT: 3001,
      },
    },
    {
      name: 'shard2',
      script: './buildServer/server.js',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        SHARD: 2,
        PORT: 3002,
      },
    },
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
        HETZNER_GATEWAY: 'gateway2.watchparty.me',
        HETZNER_SSH_KEYS: '1570536',
        HETZNER_IMAGE: '199010102',
        SCW_GATEWAY: 'gateway2.watchparty.me',
        SCW_IMAGE: '172bd9df-eba5-44e7-add0-f6edbb0f9c64',
        DO_GATEWAY: 'gateway2.watchparty.me',
        DO_IMAGE: '150334605',
        DO_SSH_KEYS: 'cc:3d:a7:d3:99:17:fe:b7:dd:59:c4:78:14:d4:02:d1',
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
    {
      name: 'discordBot',
      script: './buildServer/discordBot.js',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
