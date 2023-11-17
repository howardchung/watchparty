require('dotenv').config();
const fs = require('fs');

export default {
  build: {
    outDir: 'build',
  },
  server: {
    https: process.env.SSL_CRT_FILE
      ? {
          key: fs.readFileSync(process.env.SSL_KEY_FILE),
          cert: fs.readFileSync(process.env.SSL_CRT_FILE),
        }
      : null,
  },
};
