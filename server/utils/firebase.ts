import config from '../config.ts';
import admin from 'firebase-admin';

if (config.FIREBASE_ADMIN_SDK_CONFIG) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(config.FIREBASE_ADMIN_SDK_CONFIG),
    ),
    databaseURL: config.FIREBASE_DATABASE_URL,
  });
}

export async function validateUserToken(uid: string, token: string) {
  if (!config.FIREBASE_ADMIN_SDK_CONFIG) {
    return undefined;
  }
  if (!token) {
    return undefined;
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    if (uid !== decoded.uid) {
      // Valid but for wrong user
      return undefined;
    }
    return decoded;
  } catch (e) {
    // Promise rejects if verification failed
    console.log(e);
    return undefined;
  }
}

export async function writeData(key: string, value: string) {
  if (!config.FIREBASE_ADMIN_SDK_CONFIG) {
    return;
  }
  await admin.database().ref(key).set(value);
}

export async function getUserByEmail(email: string) {
  if (!config.FIREBASE_ADMIN_SDK_CONFIG) {
    return null;
  }
  try {
    return await admin.auth().getUserByEmail(email);
  } catch (e: any) {
    console.log(email, e.message);
  }
  return null;
}

export async function getUser(uid: string) {
  if (!config.FIREBASE_ADMIN_SDK_CONFIG) {
    return null;
  }
  return await admin.auth().getUser(uid);
}

export async function getUserEmail(uid: string) {
  if (!config.FIREBASE_ADMIN_SDK_CONFIG) {
    return null;
  }
  const user = await admin.auth().getUser(uid);
  return user.email;
}

export async function deleteUser(uid: string) {
  if (!config.FIREBASE_ADMIN_SDK_CONFIG) {
    return null;
  }
  return admin.auth().deleteUser(uid);
}
