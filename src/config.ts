export default {
  VITE_SERVER_HOST: import.meta.env.VITE_SERVER_HOST,
  VITE_OAUTH_REDIRECT_HOSTNAME: import.meta.env.VITE_OAUTH_REDIRECT_HOSTNAME,
  VITE_FIREBASE_CONFIG: import.meta.env.VITE_FIREBASE_CONFIG,
  VITE_STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
  VITE_RECAPTCHA_SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
  NODE_ENV: import.meta.env.DEV ? 'development' : 'production',
};
