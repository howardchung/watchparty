module.exports = {
  apps: [
    {
      name: 'server',
      script: './buildServer/server.js',
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
      name: 'vmBackground',
      script: './buildServer/vmBackground.js',
    },
    {
      name: 'syncSubs',
      script: './buildServer/syncSubs.js',
    },
    {
      name: 'stats',
      script: './buildServer/stats.js',
    },
  ],
};
