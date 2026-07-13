export default {
  VITE_SERVER_HOST: import.meta.env.VITE_SERVER_HOST,
  VITE_OAUTH_REDIRECT_HOSTNAME:
    import.meta.env.VITE_OAUTH_REDIRECT_HOSTNAME ?? window.location.origin,
  VITE_FIREBASE_CONFIG: import.meta.env.VITE_FIREBASE_CONFIG ?? "",
  VITE_STRIPE_PUBLIC_KEY:
    import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? "",
  VITE_TURN_SERVERS: import.meta.env.VITE_TURN_SERVERS ?? "",
  VITE_TURN_USERNAME: import.meta.env.VITE_TURN_USERNAME ?? "",
  VITE_TURN_CREDENTIAL: import.meta.env.VITE_TURN_CREDENTIAL ?? "",
  VITE_FIREBASE_SIGNIN_METHODS: "facebook,google,email",
  NODE_ENV: import.meta.env.DEV ? "development" : "production",
};
