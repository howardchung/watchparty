export default {
  VITE_SERVER_HOST: import.meta.env.VITE_SERVER_HOST,
  VITE_OAUTH_REDIRECT_HOSTNAME:
    import.meta.env.VITE_OAUTH_REDIRECT_HOSTNAME ?? 'https://www.watchparty.me',
  VITE_FIREBASE_CONFIG:
    import.meta.env.VITE_FIREBASE_CONFIG ??
    '{"apiKey":"AIzaSyA2fkXeFokJ-Ei_jnzDso5AmjbIaMdzuEc","authDomain":"watchparty-273604.firebaseapp.com","databaseURL":"https://watchparty-273604.firebaseio.com","projectId":"watchparty-273604","storageBucket":"watchparty-273604.appspot.com","messagingSenderId":"769614672795","appId":"1:769614672795:web:54bbda86288ab1a034273e"}',
  VITE_STRIPE_PUBLIC_KEY:
    import.meta.env.VITE_STRIPE_PUBLIC_KEY ??
    'pk_live_eVMbIifj5lnvgBleBCRaCv4E00aeXQkPxQ',
  VITE_RECAPTCHA_SITE_KEY:
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ??
    '6LeDGP4UAAAAAGYZZenyU-3fRdhL3p0BaBmiK9mM',
  NODE_ENV: import.meta.env.DEV ? 'development' : 'production',
};
