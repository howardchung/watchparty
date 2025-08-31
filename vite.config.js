import 'dotenv/config';
import fs from 'fs';

export default {
  build: {
    outDir: 'build',
    // sourcemap: true,
  },
  server: {
    https: process.env.SSL_CRT_FILE
      ? {
          key: fs.readFileSync(process.env.SSL_KEY_FILE),
          cert: fs.readFileSync(process.env.SSL_CRT_FILE),
        }
      : null,
    allowedHosts: true,
  },
};
