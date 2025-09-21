export const apps = [
  // {
  //   name: 'server',
  //   script: './server/server.ts',
  //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  //   interpreter: 'node',
  //   env: {
  //     PORT: 80,
  //   },
  // },
  {
    name: 'shard1',
    script: './server/server.ts',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    interpreter: 'node',
    env: {
      SHARD: 1,
      PORT: 3001,
    },
  },
  {
    name: 'shard2',
    script: './server/server.ts',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    interpreter: 'node',
    env: {
      SHARD: 2,
      PORT: 3002,
    },
  },
  // {
  //   name: 'shard3',
  //   script: './server/server.ts',
  //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  //    interpreter: 'node',
  //   env: {
  //     SHARD: 3,
  //     PORT: 3003,
  //   },
  // },
  {
    name: 'vmWorker',
    script: './server/vmWorker.ts',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    interpreter: 'node',
    env: {
      HETZNER_GATEWAY: 'gateway2.watchparty.me',
      HETZNER_SSH_KEYS: '1570536',
      HETZNER_IMAGE: '301228245',
      SCW_GATEWAY: 'gateway2.watchparty.me',
      SCW_IMAGE: '172bd9df-eba5-44e7-add0-f6edbb0f9c64',
      DO_GATEWAY: 'gateway2.watchparty.me',
      DO_IMAGE: '150334605',
      DO_SSH_KEYS: 'cc:3d:a7:d3:99:17:fe:b7:dd:59:c4:78:14:d4:02:d1',
    },
  },
  {
    name: 'syncSubs',
    script: './server/syncSubs.ts',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    interpreter: 'node',
  },
  {
    name: 'timeSeries',
    script: './server/timeSeries.ts',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    interpreter: 'node',
  },
  {
    name: 'cleanup',
    script: './server/cleanup.ts',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    interpreter: 'node',
  },
  {
    name: 'discordBot',
    script: './server/discordBot.ts',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    interpreter: 'node',
  },
];
