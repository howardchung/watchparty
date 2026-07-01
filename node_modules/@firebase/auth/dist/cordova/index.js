import { getApp, _getProvider } from '@firebase/app';
import { _ as _signInWithRedirect, a as _reauthenticateWithRedirect, b as _linkWithRedirect, r as registerAuth, i as initializeAuth, c as indexedDBLocalPersistence, d as cordovaPopupRedirectResolver } from './popup_redirect-2ba2e3ab.js';
export { A as ActionCodeOperation, a4 as ActionCodeURL, w as AuthCredential, t as AuthErrorCodes, E as EmailAuthCredential, B as EmailAuthProvider, C as FacebookAuthProvider, F as FactorId, D as GithubAuthProvider, G as GoogleAuthProvider, x as OAuthCredential, H as OAuthProvider, O as OperationType, y as PhoneAuthCredential, P as ProviderId, I as SAMLAuthProvider, S as SignInMethod, T as TwitterAuthProvider, U as applyActionCode, j as beforeAuthStateChanged, e as browserLocalPersistence, f as browserSessionPersistence, V as checkActionCode, R as confirmPasswordReset, v as connectAuthEmulator, d as cordovaPopupRedirectResolver, X as createUserWithEmailAndPassword, p as debugErrorMap, n as deleteUser, a1 as fetchSignInMethodsForEmail, ac as getAdditionalUserInfo, a9 as getIdToken, aa as getIdTokenResult, ae as getMultiFactorResolver, g as getRedirectResult, z as inMemoryPersistence, c as indexedDBLocalPersistence, i as initializeAuth, h as initializeRecaptchaConfig, $ as isSignInWithEmailLink, L as linkWithCredential, af as multiFactor, k as onAuthStateChanged, o as onIdTokenChanged, a5 as parseActionCodeURL, q as prodErrorMap, M as reauthenticateWithCredential, ad as reload, a2 as sendEmailVerification, Q as sendPasswordResetEmail, Z as sendSignInLinkToEmail, s as setPersistence, J as signInAnonymously, K as signInWithCredential, N as signInWithCustomToken, Y as signInWithEmailAndPassword, a0 as signInWithEmailLink, m as signOut, ab as unlink, l as updateCurrentUser, a7 as updateEmail, a8 as updatePassword, a6 as updateProfile, u as useDeviceLanguage, a3 as verifyBeforeUpdateEmail, W as verifyPasswordResetCode } from './popup_redirect-2ba2e3ab.js';
import 'tslib';
import '@firebase/util';
import '@firebase/component';
import '@firebase/logger';

/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function signInWithRedirect(auth, provider, resolver) {
    return _signInWithRedirect(auth, provider, resolver);
}
function reauthenticateWithRedirect(user, provider, resolver) {
    return _reauthenticateWithRedirect(user, provider, resolver);
}
function linkWithRedirect(user, provider, resolver) {
    return _linkWithRedirect(user, provider, resolver);
}

/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getAuth(app) {
    if (app === void 0) { app = getApp(); }
    var provider = _getProvider(app, 'auth');
    if (provider.isInitialized()) {
        return provider.getImmediate();
    }
    return initializeAuth(app, {
        persistence: indexedDBLocalPersistence,
        popupRedirectResolver: cordovaPopupRedirectResolver
    });
}
registerAuth("Cordova" /* ClientPlatform.CORDOVA */);

export { getAuth, linkWithRedirect, reauthenticateWithRedirect, signInWithRedirect };
//# sourceMappingURL=index.js.map
