module.exports = {
  apps: [
    {
      name: 'server',
      script: './buildServer/server.js',
    },
    {
      name: 'vmBackground',
      script: './buildServer/vmBackground.js',
    },
    {
      name: 'syncSubs',
      script: './buildServer/syncSubs.js',
    },
  ],
};
