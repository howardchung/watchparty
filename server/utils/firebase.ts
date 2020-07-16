import * as admin from 'firebase-admin';

if (process.env.FIREBASE_ADMIN_SDK_CONFIG) {
  console.log(process.env.FIREBASE_ADMIN_SDK_CONFIG);
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG)
    ),
  });
}

export async function validateUserToken(uid: string, token: string) {
  if (!process.env.FIREBASE_ADMIN_SDK_CONFIG) {
    return undefined;
  }
  const decoded = await admin.auth().verifyIdToken(token);
  if (uid !== decoded.uid) {
    return undefined;
  }
  return decoded;
}
