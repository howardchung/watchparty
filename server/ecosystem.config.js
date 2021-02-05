module.exports = {
  apps: [
    {
      name: 'server',
      script: './buildServer/server.js',
      env: {
        PORT: 80,
      },
    },
    {
      name: 'shard1',
      script: './buildServer/server.js',
      env: {
        SHARD: 1,
        PORT: 3001,
      },
    },
    {
      name: 'shard2',
      script: './buildServer/server.js',
      env: {
        SHARD: 2,
        PORT: 3002,
      },
    },
    {
      name: 'vmWorker',
      script: './buildServer/vmWorker.js',
    },
    {
      name: 'syncSubs',
      script: './buildServer/syncSubs.js',
    },
    {
      name: 'timeSeries',
      script: './buildServer/timeSeries.js',
    },
    // {
    //   name: 'cleanup',
    //   script: './buildServer/cleanup.js',
    // },
  ],
};
