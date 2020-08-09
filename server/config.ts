require('dotenv').config();

const defaults = {
  REDIS_URL: 'localhost:6379', // Optional, for room persistence and VM queueing
  DATABASE_URL: 'localhost:5432', // Optional, for permanent rooms
  YOUTUBE_API_KEY: '', // Optional, provide one to enable searching YouTube
  NODE_ENV: '', // Usually, you should let process.env.NODE_ENV override this
  FIREBASE_ADMIN_SDK_CONFIG: '', // Optional, for features requiring sign-in/authentication
  FIREBASE_DATABASE_URL: '', // Optional (unused)
  STRIPE_SECRET_KEY: '', // Optional, for subscriptions
  VBROWSER_VM_BUFFER_LARGE: 0, // Extra large VMs to create
  VBROWSER_VM_BUFFER: 0, // Extra VMs to create
  VM_POOL_FIXED_SIZE_LARGE: 0, // If using a fixed VM pool, number of large VMs to create
  VM_POOL_FIXED_SIZE: 0, // If using a fixed VM pool, number of VMs to create
  VBROWSER_TAG: '', // Optional, tag to put on VBrowser VM instances
  DO_TOKEN: '', // Optional, for DigitalOcean VMs
  HETZNER_TOKEN: '', // Optional, for Hetzner VMs
  SCW_SECRET_KEY: '', // Optional, for Scaleway VMs
  SCW_ORGANIZATION_ID: '', // Optional, for Scaleway VMs
  DOCKER_VM_HOST: 'localhost', // Optional, for Docker VMs
  DOCKER_VM_HOST_SSH_USER: '', // Optional, username for Docker host
  DOCKER_VM_HOST_SSH_KEY_BASE64: '', // Optional, private SSH key for Docker host
  RECAPTCHA_SECRET_KEY: '', // Optional, Recaptcha for VBrowser creation
  HTTPS: '', // Optional, Set to use HTTPS on the server
  SSL_KEY_FILE: '', // Optional, Filename of SSL key
  SSL_CRT_FILE: '', // Optional, Filename of SSL cert
  PORT: 8080, // Port to use for server
  STATS_KEY: '', // Secret string to validate viewing stats
  CUSTOM_SETTINGS_HOSTNAME: '', // Hostname to send different config settings to client
  MEDIA_PATH: '', // Path of server where media files might be found (GitLab/S3/nginx)
  STREAM_PATH: '', // Path of server that supports additional video streams
  KV_KEY: '', // Secret string to validate use of KV endpoint (unused)
};

export default {
  ...defaults,
  ...process.env,
};
