'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var app = require('@firebase/app');
var component = require('@firebase/component');
var logger = require('@firebase/logger');
var util = require('@firebase/util');
var webchannelWrapper = require('@firebase/webchannel-wrapper');

const b = "@firebase/firestore";

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Simple wrapper around a nullable UID. Mostly exists to make code more
 * readable.
 */
class V {
    constructor(t) {
        this.uid = t;
    }
    isAuthenticated() {
        return null != this.uid;
    }
    /**
     * Returns a key representing this user, suitable for inclusion in a
     * dictionary.
     */    toKey() {
        return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
    }
    isEqual(t) {
        return t.uid === this.uid;
    }
}

/** A user with a null UID. */ V.UNAUTHENTICATED = new V(null), 
// TODO(mikelehen): Look into getting a proper uid-equivalent for
// non-FirebaseAuth providers.
V.GOOGLE_CREDENTIALS = new V("google-credentials-uid"), V.FIRST_PARTY = new V("first-party-uid"), 
V.MOCK_USER = new V("mock-user");

/**
 * @license
 * Copyright 2017 Google LLC
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
let S = "9.23.0";

/**
 * @license
 * Copyright 2017 Google LLC
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
const D = new logger.Logger("@firebase/firestore");

// Helper methods are needed because variables can't be exported as read/write
function C() {
    return D.logLevel;
}

/**
 * Sets the verbosity of Cloud Firestore logs (debug, error, or silent).
 *
 * @param logLevel - The verbosity you set for activity and error logging. Can
 *   be any of the following values:
 *
 *   <ul>
 *     <li>`debug` for the most verbose logging level, primarily for
 *     debugging.</li>
 *     <li>`error` to log errors only.</li>
 *     <li><code>`silent` to turn off logging.</li>
 *   </ul>
 */ function x(t) {
    D.setLogLevel(t);
}

function N(t, ...e) {
    if (D.logLevel <= logger.LogLevel.DEBUG) {
        const n = e.map($);
        D.debug(`Firestore (${S}): ${t}`, ...n);
    }
}

function k(t, ...e) {
    if (D.logLevel <= logger.LogLevel.ERROR) {
        const n = e.map($);
        D.error(`Firestore (${S}): ${t}`, ...n);
    }
}

/**
 * @internal
 */ function M(t, ...e) {
    if (D.logLevel <= logger.LogLevel.WARN) {
        const n = e.map($);
        D.warn(`Firestore (${S}): ${t}`, ...n);
    }
}

/**
 * Converts an additional log parameter to a string representation.
 */ function $(t) {
    if ("string" == typeof t) return t;
    try {
        return e = t, JSON.stringify(e);
    } catch (e) {
        // Converting to JSON failed, just log the object directly
        return t;
    }
    /**
 * @license
 * Copyright 2020 Google LLC
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
    /** Formats an object as a JSON string, suitable for logging. */
    var e;
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Unconditionally fails, throwing an Error with the given message.
 * Messages are stripped in production builds.
 *
 * Returns `never` and can be used in expressions:
 * @example
 * let futureVar = fail('not implemented yet');
 */ function O(t = "Unexpected state") {
    // Log the failure in addition to throw an exception, just in case the
    // exception is swallowed.
    const e = `FIRESTORE (${S}) INTERNAL ASSERTION FAILED: ` + t;
    // NOTE: We don't use FirestoreError here because these are internal failures
    // that cannot be handled by the user. (Also it would create a circular
    // dependency between the error and assert modules which doesn't work.)
    throw k(e), new Error(e);
}

/**
 * Fails if the given assertion condition is false, throwing an Error with the
 * given message if it did.
 *
 * Messages are stripped in production builds.
 */ function F(t, e) {
    t || O();
}

/**
 * Fails if the given assertion condition is false, throwing an Error with the
 * given message if it did.
 *
 * The code of callsites invoking this function are stripped out in production
 * builds. Any side-effects of code within the debugAssert() invocation will not
 * happen in this case.
 *
 * @internal
 */ function B(t, e) {
    t || O();
}

/**
 * Casts `obj` to `T`. In non-production builds, verifies that `obj` is an
 * instance of `T` before casting.
 */ function L(t, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
e) {
    return t;
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ const q = {
    // Causes are copied from:
    // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
    /** Not an error; returned on success. */
    OK: "ok",
    /** The operation was cancelled (typically by the caller). */
    CANCELLED: "cancelled",
    /** Unknown error or an error from a different error domain. */
    UNKNOWN: "unknown",
    /**
     * Client specified an invalid argument. Note that this differs from
     * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
     * problematic regardless of the state of the system (e.g., a malformed file
     * name).
     */
    INVALID_ARGUMENT: "invalid-argument",
    /**
     * Deadline expired before operation could complete. For operations that
     * change the state of the system, this error may be returned even if the
     * operation has completed successfully. For example, a successful response
     * from a server could have been delayed long enough for the deadline to
     * expire.
     */
    DEADLINE_EXCEEDED: "deadline-exceeded",
    /** Some requested entity (e.g., file or directory) was not found. */
    NOT_FOUND: "not-found",
    /**
     * Some entity that we attempted to create (e.g., file or directory) already
     * exists.
     */
    ALREADY_EXISTS: "already-exists",
    /**
     * The caller does not have permission to execute the specified operation.
     * PERMISSION_DENIED must not be used for rejections caused by exhausting
     * some resource (use RESOURCE_EXHAUSTED instead for those errors).
     * PERMISSION_DENIED must not be used if the caller can not be identified
     * (use UNAUTHENTICATED instead for those errors).
     */
    PERMISSION_DENIED: "permission-denied",
    /**
     * The request does not have valid authentication credentials for the
     * operation.
     */
    UNAUTHENTICATED: "unauthenticated",
    /**
     * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
     * entire file system is out of space.
     */
    RESOURCE_EXHAUSTED: "resource-exhausted",
    /**
     * Operation was rejected because the system is not in a state required for
     * the operation's execution. For example, directory to be deleted may be
     * non-empty, an rmdir operation is applied to a non-directory, etc.
     *
     * A litmus test that may help a service implementor in deciding
     * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
     *  (a) Use UNAVAILABLE if the client can retry just the failing call.
     *  (b) Use ABORTED if the client should retry at a higher-level
     *      (e.g., restarting a read-modify-write sequence).
     *  (c) Use FAILED_PRECONDITION if the client should not retry until
     *      the system state has been explicitly fixed. E.g., if an "rmdir"
     *      fails because the directory is non-empty, FAILED_PRECONDITION
     *      should be returned since the client should not retry unless
     *      they have first fixed up the directory by deleting files from it.
     *  (d) Use FAILED_PRECONDITION if the client performs conditional
     *      REST Get/Update/Delete on a resource and the resource on the
     *      server does not match the condition. E.g., conflicting
     *      read-modify-write on the same resource.
     */
    FAILED_PRECONDITION: "failed-precondition",
    /**
     * The operation was aborted, typically due to a concurrency issue like
     * sequencer check failures, transaction aborts, etc.
     *
     * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
     * and UNAVAILABLE.
     */
    ABORTED: "aborted",
    /**
     * Operation was attempted past the valid range. E.g., seeking or reading
     * past end of file.
     *
     * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
     * if the system state changes. For example, a 32-bit file system will
     * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
     * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
     * an offset past the current file size.
     *
     * There is a fair bit of overlap between FAILED_PRECONDITION and
     * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
     * when it applies so that callers who are iterating through a space can
     * easily look for an OUT_OF_RANGE error to detect when they are done.
     */
    OUT_OF_RANGE: "out-of-range",
    /** Operation is not implemented or not supported/enabled in this service. */
    UNIMPLEMENTED: "unimplemented",
    /**
     * Internal errors. Means some invariants expected by underlying System has
     * been broken. If you see one of these errors, Something is very broken.
     */
    INTERNAL: "internal",
    /**
     * The service is currently unavailable. This is a most likely a transient
     * condition and may be corrected by retrying with a backoff.
     *
     * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
     * and UNAVAILABLE.
     */
    UNAVAILABLE: "unavailable",
    /** Unrecoverable data loss or corruption. */
    DATA_LOSS: "data-loss"
};

/** An error returned by a Firestore operation. */ class U extends util.FirebaseError {
    /** @hideconstructor */
    constructor(
    /**
     * The backend error code associated with this error.
     */
    t, 
    /**
     * A custom error description.
     */
    e) {
        super(t, e), this.code = t, this.message = e, 
        // HACK: We write a toString property directly because Error is not a real
        // class and so inheritance does not work correctly. We could alternatively
        // do the same "back-door inheritance" trick that FirebaseError does.
        this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ class K {
    constructor() {
        this.promise = new Promise(((t, e) => {
            this.resolve = t, this.reject = e;
        }));
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ class G {
    constructor(t, e) {
        this.user = e, this.type = "OAuth", this.headers = new Map, this.headers.set("Authorization", `Bearer ${t}`);
    }
}

/**
 * A CredentialsProvider that always yields an empty token.
 * @internal
 */ class Q {
    getToken() {
        return Promise.resolve(null);
    }
    invalidateToken() {}
    start(t, e) {
        // Fire with initial user.
        t.enqueueRetryable((() => e(V.UNAUTHENTICATED)));
    }
    shutdown() {}
}

/**
 * A CredentialsProvider that always returns a constant token. Used for
 * emulator token mocking.
 */ class j {
    constructor(t) {
        this.token = t, 
        /**
         * Stores the listener registered with setChangeListener()
         * This isn't actually necessary since the UID never changes, but we use this
         * to verify the listen contract is adhered to in tests.
         */
        this.changeListener = null;
    }
    getToken() {
        return Promise.resolve(this.token);
    }
    invalidateToken() {}
    start(t, e) {
        this.changeListener = e, 
        // Fire with initial user.
        t.enqueueRetryable((() => e(this.token.user)));
    }
    shutdown() {
        this.changeListener = null;
    }
}

class z {
    constructor(t) {
        this.t = t, 
        /** Tracks the current User. */
        this.currentUser = V.UNAUTHENTICATED, 
        /**
         * Counter used to detect if the token changed while a getToken request was
         * outstanding.
         */
        this.i = 0, this.forceRefresh = !1, this.auth = null;
    }
    start(t, e) {
        let n = this.i;
        // A change listener that prevents double-firing for the same token change.
                const s = t => this.i !== n ? (n = this.i, e(t)) : Promise.resolve();
        // A promise that can be waited on to block on the next token change.
        // This promise is re-created after each change.
                let i = new K;
        this.o = () => {
            this.i++, this.currentUser = this.u(), i.resolve(), i = new K, t.enqueueRetryable((() => s(this.currentUser)));
        };
        const r = () => {
            const e = i;
            t.enqueueRetryable((async () => {
                await e.promise, await s(this.currentUser);
            }));
        }, o = t => {
            N("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = t, this.auth.addAuthTokenListener(this.o), 
            r();
        };
        this.t.onInit((t => o(t))), 
        // Our users can initialize Auth right after Firestore, so we give it
        // a chance to register itself with the component framework before we
        // determine whether to start up in unauthenticated mode.
        setTimeout((() => {
            if (!this.auth) {
                const t = this.t.getImmediate({
                    optional: !0
                });
                t ? o(t) : (
                // If auth is still not available, proceed with `null` user
                N("FirebaseAuthCredentialsProvider", "Auth not yet detected"), i.resolve(), i = new K);
            }
        }), 0), r();
    }
    getToken() {
        // Take note of the current value of the tokenCounter so that this method
        // can fail (with an ABORTED error) if there is a token change while the
        // request is outstanding.
        const t = this.i, e = this.forceRefresh;
        return this.forceRefresh = !1, this.auth ? this.auth.getToken(e).then((e => 
        // Cancel the request since the token changed while the request was
        // outstanding so the response is potentially for a previous user (which
        // user, we can't be sure).
        this.i !== t ? (N("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), 
        this.getToken()) : e ? (F("string" == typeof e.accessToken), new G(e.accessToken, this.currentUser)) : null)) : Promise.resolve(null);
    }
    invalidateToken() {
        this.forceRefresh = !0;
    }
    shutdown() {
        this.auth && this.auth.removeAuthTokenListener(this.o);
    }
    // Auth.getUid() can return null even with a user logged in. It is because
    // getUid() is synchronous, but the auth code populating Uid is asynchronous.
    // This method should only be called in the AuthTokenListener callback
    // to guarantee to get the actual user.
    u() {
        const t = this.auth && this.auth.getUid();
        return F(null === t || "string" == typeof t), new V(t);
    }
}

/*
 * FirstPartyToken provides a fresh token each time its value
 * is requested, because if the token is too old, requests will be rejected.
 * Technically this may no longer be necessary since the SDK should gracefully
 * recover from unauthenticated errors (see b/33147818 for context), but it's
 * safer to keep the implementation as-is.
 */ class W {
    constructor(t, e, n) {
        this.h = t, this.l = e, this.m = n, this.type = "FirstParty", this.user = V.FIRST_PARTY, 
        this.g = new Map;
    }
    /**
     * Gets an authorization token, using a provided factory function, or return
     * null.
     */    p() {
        return this.m ? this.m() : null;
    }
    get headers() {
        this.g.set("X-Goog-AuthUser", this.h);
        // Use array notation to prevent minification
        const t = this.p();
        return t && this.g.set("Authorization", t), this.l && this.g.set("X-Goog-Iam-Authorization-Token", this.l), 
        this.g;
    }
}

/*
 * Provides user credentials required for the Firestore JavaScript SDK
 * to authenticate the user, using technique that is only available
 * to applications hosted by Google.
 */ class H {
    constructor(t, e, n) {
        this.h = t, this.l = e, this.m = n;
    }
    getToken() {
        return Promise.resolve(new W(this.h, this.l, this.m));
    }
    start(t, e) {
        // Fire with initial uid.
        t.enqueueRetryable((() => e(V.FIRST_PARTY)));
    }
    shutdown() {}
    invalidateToken() {}
}

class J {
    constructor(t) {
        this.value = t, this.type = "AppCheck", this.headers = new Map, t && t.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
    }
}

class Y {
    constructor(t) {
        this.I = t, this.forceRefresh = !1, this.appCheck = null, this.T = null;
    }
    start(t, e) {
        const n = t => {
            null != t.error && N("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${t.error.message}`);
            const n = t.token !== this.T;
            return this.T = t.token, N("FirebaseAppCheckTokenProvider", `Received ${n ? "new" : "existing"} token.`), 
            n ? e(t.token) : Promise.resolve();
        };
        this.o = e => {
            t.enqueueRetryable((() => n(e)));
        };
        const s = t => {
            N("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = t, this.appCheck.addTokenListener(this.o);
        };
        this.I.onInit((t => s(t))), 
        // Our users can initialize AppCheck after Firestore, so we give it
        // a chance to register itself with the component framework.
        setTimeout((() => {
            if (!this.appCheck) {
                const t = this.I.getImmediate({
                    optional: !0
                });
                t ? s(t) : 
                // If AppCheck is still not available, proceed without it.
                N("FirebaseAppCheckTokenProvider", "AppCheck not yet detected");
            }
        }), 0);
    }
    getToken() {
        const t = this.forceRefresh;
        return this.forceRefresh = !1, this.appCheck ? this.appCheck.getToken(t).then((t => t ? (F("string" == typeof t.token), 
        this.T = t.token, new J(t.token)) : null)) : Promise.resolve(null);
    }
    invalidateToken() {
        this.forceRefresh = !0;
    }
    shutdown() {
        this.appCheck && this.appCheck.removeTokenListener(this.o);
    }
}

/**
 * An AppCheck token provider that always yields an empty token.
 * @internal
 */ class X {
    getToken() {
        return Promise.resolve(new J(""));
    }
    invalidateToken() {}
    start(t, e) {}
    shutdown() {}
}

/**
 * Builds a CredentialsProvider depending on the type of
 * the credentials passed in.
 */
/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Generates `nBytes` of random bytes.
 *
 * If `nBytes < 0` , an error will be thrown.
 */
function Z(t) {
    // Polyfills for IE and WebWorker by using `self` and `msCrypto` when `crypto` is not available.
    const e = 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "undefined" != typeof self && (self.crypto || self.msCrypto), n = new Uint8Array(t);
    if (e && "function" == typeof e.getRandomValues) e.getRandomValues(n); else 
    // Falls back to Math.random
    for (let e = 0; e < t; e++) n[e] = Math.floor(256 * Math.random());
    return n;
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ class tt {
    static A() {
        // Alphanumeric characters
        const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", e = Math.floor(256 / t.length) * t.length;
        // The largest byte value that is a multiple of `char.length`.
                let n = "";
        for (;n.length < 20; ) {
            const s = Z(40);
            for (let i = 0; i < s.length; ++i) 
            // Only accept values that are [0, maxMultiple), this ensures they can
            // be evenly mapped to indices of `chars` via a modulo operation.
            n.length < 20 && s[i] < e && (n += t.charAt(s[i] % t.length));
        }
        return n;
    }
}

function et(t, e) {
    return t < e ? -1 : t > e ? 1 : 0;
}

/** Helper to compare arrays using isEqual(). */ function nt(t, e, n) {
    return t.length === e.length && t.every(((t, s) => n(t, e[s])));
}

/**
 * Returns the immediate lexicographically-following string. This is useful to
 * construct an inclusive range for indexeddb iterators.
 */ function st(t) {
    // Return the input string, with an additional NUL byte appended.
    return t + "\0";
}

/**
 * @license
 * Copyright 2017 Google LLC
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
// The earliest date supported by Firestore timestamps (0001-01-01T00:00:00Z).
/**
 * A `Timestamp` represents a point in time independent of any time zone or
 * calendar, represented as seconds and fractions of seconds at nanosecond
 * resolution in UTC Epoch time.
 *
 * It is encoded using the Proleptic Gregorian Calendar which extends the
 * Gregorian calendar backwards to year one. It is encoded assuming all minutes
 * are 60 seconds long, i.e. leap seconds are "smeared" so that no leap second
 * table is needed for interpretation. Range is from 0001-01-01T00:00:00Z to
 * 9999-12-31T23:59:59.999999999Z.
 *
 * For examples and further specifications, refer to the
 * {@link https://github.com/google/protobuf/blob/master/src/google/protobuf/timestamp.proto | Timestamp definition}.
 */
class it {
    /**
     * Creates a new timestamp.
     *
     * @param seconds - The number of seconds of UTC time since Unix epoch
     *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
     *     9999-12-31T23:59:59Z inclusive.
     * @param nanoseconds - The non-negative fractions of a second at nanosecond
     *     resolution. Negative second values with fractions must still have
     *     non-negative nanoseconds values that count forward in time. Must be
     *     from 0 to 999,999,999 inclusive.
     */
    constructor(
    /**
     * The number of seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z.
     */
    t, 
    /**
     * The fractions of a second at nanosecond resolution.*
     */
    e) {
        if (this.seconds = t, this.nanoseconds = e, e < 0) throw new U(q.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
        if (e >= 1e9) throw new U(q.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
        if (t < -62135596800) throw new U(q.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
        // This will break in the year 10,000.
                if (t >= 253402300800) throw new U(q.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
    }
    /**
     * Creates a new timestamp with the current date, with millisecond precision.
     *
     * @returns a new timestamp representing the current date.
     */    static now() {
        return it.fromMillis(Date.now());
    }
    /**
     * Creates a new timestamp from the given date.
     *
     * @param date - The date to initialize the `Timestamp` from.
     * @returns A new `Timestamp` representing the same point in time as the given
     *     date.
     */    static fromDate(t) {
        return it.fromMillis(t.getTime());
    }
    /**
     * Creates a new timestamp from the given number of milliseconds.
     *
     * @param milliseconds - Number of milliseconds since Unix epoch
     *     1970-01-01T00:00:00Z.
     * @returns A new `Timestamp` representing the same point in time as the given
     *     number of milliseconds.
     */    static fromMillis(t) {
        const e = Math.floor(t / 1e3), n = Math.floor(1e6 * (t - 1e3 * e));
        return new it(e, n);
    }
    /**
     * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
     * causes a loss of precision since `Date` objects only support millisecond
     * precision.
     *
     * @returns JavaScript `Date` object representing the same point in time as
     *     this `Timestamp`, with millisecond precision.
     */    toDate() {
        return new Date(this.toMillis());
    }
    /**
     * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
     * epoch). This operation causes a loss of precision.
     *
     * @returns The point in time corresponding to this timestamp, represented as
     *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
     */    toMillis() {
        return 1e3 * this.seconds + this.nanoseconds / 1e6;
    }
    _compareTo(t) {
        return this.seconds === t.seconds ? et(this.nanoseconds, t.nanoseconds) : et(this.seconds, t.seconds);
    }
    /**
     * Returns true if this `Timestamp` is equal to the provided one.
     *
     * @param other - The `Timestamp` to compare against.
     * @returns true if this `Timestamp` is equal to the provided one.
     */    isEqual(t) {
        return t.seconds === this.seconds && t.nanoseconds === this.nanoseconds;
    }
    /** Returns a textual representation of this `Timestamp`. */    toString() {
        return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
    }
    /** Returns a JSON-serializable representation of this `Timestamp`. */    toJSON() {
        return {
            seconds: this.seconds,
            nanoseconds: this.nanoseconds
        };
    }
    /**
     * Converts this object to a primitive string, which allows `Timestamp` objects
     * to be compared using the `>`, `<=`, `>=` and `>` operators.
     */    valueOf() {
        // This method returns a string of the form <seconds>.<nanoseconds> where
        // <seconds> is translated to have a non-negative value and both <seconds>
        // and <nanoseconds> are left-padded with zeroes to be a consistent length.
        // Strings with this format then have a lexiographical ordering that matches
        // the expected ordering. The <seconds> translation is done to avoid having
        // a leading negative sign (i.e. a leading '-' character) in its string
        // representation, which would affect its lexiographical ordering.
        const t = this.seconds - -62135596800;
        // Note: Up to 12 decimal digits are required to represent all valid
        // 'seconds' values.
                return String(t).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * A version of a document in Firestore. This corresponds to the version
 * timestamp, such as update_time or read_time.
 */ class rt {
    constructor(t) {
        this.timestamp = t;
    }
    static fromTimestamp(t) {
        return new rt(t);
    }
    static min() {
        return new rt(new it(0, 0));
    }
    static max() {
        return new rt(new it(253402300799, 999999999));
    }
    compareTo(t) {
        return this.timestamp._compareTo(t.timestamp);
    }
    isEqual(t) {
        return this.timestamp.isEqual(t.timestamp);
    }
    /** Returns a number representation of the version for use in spec tests. */    toMicroseconds() {
        // Convert to microseconds.
        return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
    }
    toString() {
        return "SnapshotVersion(" + this.timestamp.toString() + ")";
    }
    toTimestamp() {
        return this.timestamp;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Path represents an ordered sequence of string segments.
 */
class ot {
    constructor(t, e, n) {
        void 0 === e ? e = 0 : e > t.length && O(), void 0 === n ? n = t.length - e : n > t.length - e && O(), 
        this.segments = t, this.offset = e, this.len = n;
    }
    get length() {
        return this.len;
    }
    isEqual(t) {
        return 0 === ot.comparator(this, t);
    }
    child(t) {
        const e = this.segments.slice(this.offset, this.limit());
        return t instanceof ot ? t.forEach((t => {
            e.push(t);
        })) : e.push(t), this.construct(e);
    }
    /** The index of one past the last segment of the path. */    limit() {
        return this.offset + this.length;
    }
    popFirst(t) {
        return t = void 0 === t ? 1 : t, this.construct(this.segments, this.offset + t, this.length - t);
    }
    popLast() {
        return this.construct(this.segments, this.offset, this.length - 1);
    }
    firstSegment() {
        return this.segments[this.offset];
    }
    lastSegment() {
        return this.get(this.length - 1);
    }
    get(t) {
        return this.segments[this.offset + t];
    }
    isEmpty() {
        return 0 === this.length;
    }
    isPrefixOf(t) {
        if (t.length < this.length) return !1;
        for (let e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return !1;
        return !0;
    }
    isImmediateParentOf(t) {
        if (this.length + 1 !== t.length) return !1;
        for (let e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return !1;
        return !0;
    }
    forEach(t) {
        for (let e = this.offset, n = this.limit(); e < n; e++) t(this.segments[e]);
    }
    toArray() {
        return this.segments.slice(this.offset, this.limit());
    }
    static comparator(t, e) {
        const n = Math.min(t.length, e.length);
        for (let s = 0; s < n; s++) {
            const n = t.get(s), i = e.get(s);
            if (n < i) return -1;
            if (n > i) return 1;
        }
        return t.length < e.length ? -1 : t.length > e.length ? 1 : 0;
    }
}

/**
 * A slash-separated path for navigating resources (documents and collections)
 * within Firestore.
 *
 * @internal
 */ class ut extends ot {
    construct(t, e, n) {
        return new ut(t, e, n);
    }
    canonicalString() {
        // NOTE: The client is ignorant of any path segments containing escape
        // sequences (e.g. __id123__) and just passes them through raw (they exist
        // for legacy reasons and should not be used frequently).
        return this.toArray().join("/");
    }
    toString() {
        return this.canonicalString();
    }
    /**
     * Creates a resource path from the given slash-delimited string. If multiple
     * arguments are provided, all components are combined. Leading and trailing
     * slashes from all components are ignored.
     */    static fromString(...t) {
        // NOTE: The client is ignorant of any path segments containing escape
        // sequences (e.g. __id123__) and just passes them through raw (they exist
        // for legacy reasons and should not be used frequently).
        const e = [];
        for (const n of t) {
            if (n.indexOf("//") >= 0) throw new U(q.INVALID_ARGUMENT, `Invalid segment (${n}). Paths must not contain // in them.`);
            // Strip leading and traling slashed.
                        e.push(...n.split("/").filter((t => t.length > 0)));
        }
        return new ut(e);
    }
    static emptyPath() {
        return new ut([]);
    }
}

const ct = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

/**
 * A dot-separated path for navigating sub-objects within a document.
 * @internal
 */ class at extends ot {
    construct(t, e, n) {
        return new at(t, e, n);
    }
    /**
     * Returns true if the string could be used as a segment in a field path
     * without escaping.
     */    static isValidIdentifier(t) {
        return ct.test(t);
    }
    canonicalString() {
        return this.toArray().map((t => (t = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), 
        at.isValidIdentifier(t) || (t = "`" + t + "`"), t))).join(".");
    }
    toString() {
        return this.canonicalString();
    }
    /**
     * Returns true if this field references the key of a document.
     */    isKeyField() {
        return 1 === this.length && "__name__" === this.get(0);
    }
    /**
     * The field designating the key of a document.
     */    static keyField() {
        return new at([ "__name__" ]);
    }
    /**
     * Parses a field string from the given server-formatted string.
     *
     * - Splitting the empty string is not allowed (for now at least).
     * - Empty segments within the string (e.g. if there are two consecutive
     *   separators) are not allowed.
     *
     * TODO(b/37244157): we should make this more strict. Right now, it allows
     * non-identifier path components, even if they aren't escaped.
     */    static fromServerFormat(t) {
        const e = [];
        let n = "", s = 0;
        const i = () => {
            if (0 === n.length) throw new U(q.INVALID_ARGUMENT, `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
            e.push(n), n = "";
        };
        let r = !1;
        for (;s < t.length; ) {
            const e = t[s];
            if ("\\" === e) {
                if (s + 1 === t.length) throw new U(q.INVALID_ARGUMENT, "Path has trailing escape character: " + t);
                const e = t[s + 1];
                if ("\\" !== e && "." !== e && "`" !== e) throw new U(q.INVALID_ARGUMENT, "Path has invalid escape sequence: " + t);
                n += e, s += 2;
            } else "`" === e ? (r = !r, s++) : "." !== e || r ? (n += e, s++) : (i(), s++);
        }
        if (i(), r) throw new U(q.INVALID_ARGUMENT, "Unterminated ` in path: " + t);
        return new at(e);
    }
    static emptyPath() {
        return new at([]);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * @internal
 */ class ht {
    constructor(t) {
        this.path = t;
    }
    static fromPath(t) {
        return new ht(ut.fromString(t));
    }
    static fromName(t) {
        return new ht(ut.fromString(t).popFirst(5));
    }
    static empty() {
        return new ht(ut.emptyPath());
    }
    get collectionGroup() {
        return this.path.popLast().lastSegment();
    }
    /** Returns true if the document is in the specified collectionId. */    hasCollectionId(t) {
        return this.path.length >= 2 && this.path.get(this.path.length - 2) === t;
    }
    /** Returns the collection group (i.e. the name of the parent collection) for this key. */    getCollectionGroup() {
        return this.path.get(this.path.length - 2);
    }
    /** Returns the fully qualified path to the parent collection. */    getCollectionPath() {
        return this.path.popLast();
    }
    isEqual(t) {
        return null !== t && 0 === ut.comparator(this.path, t.path);
    }
    toString() {
        return this.path.toString();
    }
    static comparator(t, e) {
        return ut.comparator(t.path, e.path);
    }
    static isDocumentKey(t) {
        return t.length % 2 == 0;
    }
    /**
     * Creates and returns a new document key with the given segments.
     *
     * @param segments - The segments of the path to the document
     * @returns A new instance of DocumentKey
     */    static fromSegments(t) {
        return new ht(new ut(t.slice()));
    }
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
/**
 * The initial mutation batch id for each index. Gets updated during index
 * backfill.
 */
/**
 * An index definition for field indexes in Firestore.
 *
 * Every index is associated with a collection. The definition contains a list
 * of fields and their index kind (which can be `ASCENDING`, `DESCENDING` or
 * `CONTAINS` for ArrayContains/ArrayContainsAny queries).
 *
 * Unlike the backend, the SDK does not differentiate between collection or
 * collection group-scoped indices. Every index can be used for both single
 * collection and collection group queries.
 */
class lt {
    constructor(
    /**
     * The index ID. Returns -1 if the index ID is not available (e.g. the index
     * has not yet been persisted).
     */
    t, 
    /** The collection ID this index applies to. */
    e, 
    /** The field segments for this index. */
    n, 
    /** Shows how up-to-date the index is for the current user. */
    s) {
        this.indexId = t, this.collectionGroup = e, this.fields = n, this.indexState = s;
    }
}

/** An ID for an index that has not yet been added to persistence.  */
/** Returns the ArrayContains/ArrayContainsAny segment for this index. */
function ft(t) {
    return t.fields.find((t => 2 /* IndexKind.CONTAINS */ === t.kind));
}

/** Returns all directional (ascending/descending) segments for this index. */ function dt(t) {
    return t.fields.filter((t => 2 /* IndexKind.CONTAINS */ !== t.kind));
}

/**
 * Returns the order of the document key component for the given index.
 *
 * PORTING NOTE: This is only used in the Web IndexedDb implementation.
 */
/**
 * Compares indexes by collection group and segments. Ignores update time and
 * index ID.
 */
function wt(t, e) {
    let n = et(t.collectionGroup, e.collectionGroup);
    if (0 !== n) return n;
    for (let s = 0; s < Math.min(t.fields.length, e.fields.length); ++s) if (n = mt(t.fields[s], e.fields[s]), 
    0 !== n) return n;
    return et(t.fields.length, e.fields.length);
}

/** Returns a debug representation of the field index */ lt.UNKNOWN_ID = -1;

/** An index component consisting of field path and index type.  */
class _t {
    constructor(
    /** The field path of the component. */
    t, 
    /** The fields sorting order. */
    e) {
        this.fieldPath = t, this.kind = e;
    }
}

function mt(t, e) {
    const n = at.comparator(t.fieldPath, e.fieldPath);
    return 0 !== n ? n : et(t.kind, e.kind);
}

/**
 * Stores the "high water mark" that indicates how updated the Index is for the
 * current user.
 */ class gt {
    constructor(
    /**
     * Indicates when the index was last updated (relative to other indexes).
     */
    t, 
    /** The the latest indexed read time, document and batch id. */
    e) {
        this.sequenceNumber = t, this.offset = e;
    }
    /** The state of an index that has not yet been backfilled. */    static empty() {
        return new gt(0, It.min());
    }
}

/**
 * Creates an offset that matches all documents with a read time higher than
 * `readTime`.
 */ function yt(t, e) {
    // We want to create an offset that matches all documents with a read time
    // greater than the provided read time. To do so, we technically need to
    // create an offset for `(readTime, MAX_DOCUMENT_KEY)`. While we could use
    // Unicode codepoints to generate MAX_DOCUMENT_KEY, it is much easier to use
    // `(readTime + 1, DocumentKey.empty())` since `> DocumentKey.empty()` matches
    // all valid document IDs.
    const n = t.toTimestamp().seconds, s = t.toTimestamp().nanoseconds + 1, i = rt.fromTimestamp(1e9 === s ? new it(n + 1, 0) : new it(n, s));
    return new It(i, ht.empty(), e);
}

/** Creates a new offset based on the provided document. */ function pt(t) {
    return new It(t.readTime, t.key, -1);
}

/**
 * Stores the latest read time, document and batch ID that were processed for an
 * index.
 */ class It {
    constructor(
    /**
     * The latest read time version that has been indexed by Firestore for this
     * field index.
     */
    t, 
    /**
     * The key of the last document that was indexed for this query. Use
     * `DocumentKey.empty()` if no document has been indexed.
     */
    e, 
    /*
     * The largest mutation batch id that's been processed by Firestore.
     */
    n) {
        this.readTime = t, this.documentKey = e, this.largestBatchId = n;
    }
    /** Returns an offset that sorts before all regular offsets. */    static min() {
        return new It(rt.min(), ht.empty(), -1);
    }
    /** Returns an offset that sorts after all regular offsets. */    static max() {
        return new It(rt.max(), ht.empty(), -1);
    }
}

function Tt(t, e) {
    let n = t.readTime.compareTo(e.readTime);
    return 0 !== n ? n : (n = ht.comparator(t.documentKey, e.documentKey), 0 !== n ? n : et(t.largestBatchId, e.largestBatchId));
}

/**
 * @license
 * Copyright 2020 Google LLC
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
 */ const Et = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";

/**
 * A base class representing a persistence transaction, encapsulating both the
 * transaction's sequence numbers as well as a list of onCommitted listeners.
 *
 * When you call Persistence.runTransaction(), it will create a transaction and
 * pass it to your callback. You then pass it to any method that operates
 * on persistence.
 */ class At {
    constructor() {
        this.onCommittedListeners = [];
    }
    addOnCommittedListener(t) {
        this.onCommittedListeners.push(t);
    }
    raiseOnCommittedEvent() {
        this.onCommittedListeners.forEach((t => t()));
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Verifies the error thrown by a LocalStore operation. If a LocalStore
 * operation fails because the primary lease has been taken by another client,
 * we ignore the error (the persistence layer will immediately call
 * `applyPrimaryLease` to propagate the primary state change). All other errors
 * are re-thrown.
 *
 * @param err - An error returned by a LocalStore operation.
 * @returns A Promise that resolves after we recovered, or the original error.
 */ async function vt(t) {
    if (t.code !== q.FAILED_PRECONDITION || t.message !== Et) throw t;
    N("LocalStore", "Unexpectedly lost primary lease");
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * PersistencePromise is essentially a re-implementation of Promise except
 * it has a .next() method instead of .then() and .next() and .catch() callbacks
 * are executed synchronously when a PersistencePromise resolves rather than
 * asynchronously (Promise implementations use setImmediate() or similar).
 *
 * This is necessary to interoperate with IndexedDB which will automatically
 * commit transactions if control is returned to the event loop without
 * synchronously initiating another operation on the transaction.
 *
 * NOTE: .then() and .catch() only allow a single consumer, unlike normal
 * Promises.
 */ class Rt {
    constructor(t) {
        // NOTE: next/catchCallback will always point to our own wrapper functions,
        // not the user's raw next() or catch() callbacks.
        this.nextCallback = null, this.catchCallback = null, 
        // When the operation resolves, we'll set result or error and mark isDone.
        this.result = void 0, this.error = void 0, this.isDone = !1, 
        // Set to true when .then() or .catch() are called and prevents additional
        // chaining.
        this.callbackAttached = !1, t((t => {
            this.isDone = !0, this.result = t, this.nextCallback && 
            // value should be defined unless T is Void, but we can't express
            // that in the type system.
            this.nextCallback(t);
        }), (t => {
            this.isDone = !0, this.error = t, this.catchCallback && this.catchCallback(t);
        }));
    }
    catch(t) {
        return this.next(void 0, t);
    }
    next(t, e) {
        return this.callbackAttached && O(), this.callbackAttached = !0, this.isDone ? this.error ? this.wrapFailure(e, this.error) : this.wrapSuccess(t, this.result) : new Rt(((n, s) => {
            this.nextCallback = e => {
                this.wrapSuccess(t, e).next(n, s);
            }, this.catchCallback = t => {
                this.wrapFailure(e, t).next(n, s);
            };
        }));
    }
    toPromise() {
        return new Promise(((t, e) => {
            this.next(t, e);
        }));
    }
    wrapUserFunction(t) {
        try {
            const e = t();
            return e instanceof Rt ? e : Rt.resolve(e);
        } catch (t) {
            return Rt.reject(t);
        }
    }
    wrapSuccess(t, e) {
        return t ? this.wrapUserFunction((() => t(e))) : Rt.resolve(e);
    }
    wrapFailure(t, e) {
        return t ? this.wrapUserFunction((() => t(e))) : Rt.reject(e);
    }
    static resolve(t) {
        return new Rt(((e, n) => {
            e(t);
        }));
    }
    static reject(t) {
        return new Rt(((e, n) => {
            n(t);
        }));
    }
    static waitFor(
    // Accept all Promise types in waitFor().
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t) {
        return new Rt(((e, n) => {
            let s = 0, i = 0, r = !1;
            t.forEach((t => {
                ++s, t.next((() => {
                    ++i, r && i === s && e();
                }), (t => n(t)));
            })), r = !0, i === s && e();
        }));
    }
    /**
     * Given an array of predicate functions that asynchronously evaluate to a
     * boolean, implements a short-circuiting `or` between the results. Predicates
     * will be evaluated until one of them returns `true`, then stop. The final
     * result will be whether any of them returned `true`.
     */    static or(t) {
        let e = Rt.resolve(!1);
        for (const n of t) e = e.next((t => t ? Rt.resolve(t) : n()));
        return e;
    }
    static forEach(t, e) {
        const n = [];
        return t.forEach(((t, s) => {
            n.push(e.call(this, t, s));
        })), this.waitFor(n);
    }
    /**
     * Concurrently map all array elements through asynchronous function.
     */    static mapArray(t, e) {
        return new Rt(((n, s) => {
            const i = t.length, r = new Array(i);
            let o = 0;
            for (let u = 0; u < i; u++) {
                const c = u;
                e(t[c]).next((t => {
                    r[c] = t, ++o, o === i && n(r);
                }), (t => s(t)));
            }
        }));
    }
    /**
     * An alternative to recursive PersistencePromise calls, that avoids
     * potential memory problems from unbounded chains of promises.
     *
     * The `action` will be called repeatedly while `condition` is true.
     */    static doWhile(t, e) {
        return new Rt(((n, s) => {
            const i = () => {
                !0 === t() ? e().next((() => {
                    i();
                }), s) : n();
            };
            i();
        }));
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
// References to `window` are guarded by SimpleDb.isAvailable()
/* eslint-disable no-restricted-globals */
/**
 * Wraps an IDBTransaction and exposes a store() method to get a handle to a
 * specific object store.
 */
class Pt {
    constructor(t, e) {
        this.action = t, this.transaction = e, this.aborted = !1, 
        /**
         * A `Promise` that resolves with the result of the IndexedDb transaction.
         */
        this.v = new K, this.transaction.oncomplete = () => {
            this.v.resolve();
        }, this.transaction.onabort = () => {
            e.error ? this.v.reject(new St(t, e.error)) : this.v.resolve();
        }, this.transaction.onerror = e => {
            const n = kt(e.target.error);
            this.v.reject(new St(t, n));
        };
    }
    static open(t, e, n, s) {
        try {
            return new Pt(e, t.transaction(s, n));
        } catch (t) {
            throw new St(e, t);
        }
    }
    get R() {
        return this.v.promise;
    }
    abort(t) {
        t && this.v.reject(t), this.aborted || (N("SimpleDb", "Aborting transaction:", t ? t.message : "Client-initiated abort"), 
        this.aborted = !0, this.transaction.abort());
    }
    P() {
        // If the browser supports V3 IndexedDB, we invoke commit() explicitly to
        // speed up index DB processing if the event loop remains blocks.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = this.transaction;
        this.aborted || "function" != typeof t.commit || t.commit();
    }
    /**
     * Returns a SimpleDbStore<KeyType, ValueType> for the specified store. All
     * operations performed on the SimpleDbStore happen within the context of this
     * transaction and it cannot be used anymore once the transaction is
     * completed.
     *
     * Note that we can't actually enforce that the KeyType and ValueType are
     * correct, but they allow type safety through the rest of the consuming code.
     */    store(t) {
        const e = this.transaction.objectStore(t);
        return new Ct(e);
    }
}

/**
 * Provides a wrapper around IndexedDb with a simplified interface that uses
 * Promise-like return values to chain operations. Real promises cannot be used
 * since .then() continuations are executed asynchronously (e.g. via
 * .setImmediate), which would cause IndexedDB to end the transaction.
 * See PersistencePromise for more details.
 */ class bt {
    /*
     * Creates a new SimpleDb wrapper for IndexedDb database `name`.
     *
     * Note that `version` must not be a downgrade. IndexedDB does not support
     * downgrading the schema version. We currently do not support any way to do
     * versioning outside of IndexedDB's versioning mechanism, as only
     * version-upgrade transactions are allowed to do things like create
     * objectstores.
     */
    constructor(t, e, n) {
        this.name = t, this.version = e, this.V = n;
        // NOTE: According to https://bugs.webkit.org/show_bug.cgi?id=197050, the
        // bug we're checking for should exist in iOS >= 12.2 and < 13, but for
        // whatever reason it's much harder to hit after 12.2 so we only proactively
        // log on 12.2.
        12.2 === bt.S(util.getUA()) && k("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.");
    }
    /** Deletes the specified database. */    static delete(t) {
        return N("SimpleDb", "Removing database:", t), xt(window.indexedDB.deleteDatabase(t)).toPromise();
    }
    /** Returns true if IndexedDB is available in the current environment. */    static D() {
        if (!util.isIndexedDBAvailable()) return !1;
        if (bt.C()) return !0;
        // We extensively use indexed array values and compound keys,
        // which IE and Edge do not support. However, they still have indexedDB
        // defined on the window, so we need to check for them here and make sure
        // to return that persistence is not enabled for those browsers.
        // For tracking support of this feature, see here:
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/status/indexeddbarraysandmultientrysupport/
        // Check the UA string to find out the browser.
                const t = util.getUA(), e = bt.S(t), n = 0 < e && e < 10, s = bt.N(t), i = 0 < s && s < 4.5;
        // IE 10
        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
        // IE 11
        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
        // Edge
        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML,
        // like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
        // iOS Safari: Disable for users running iOS version < 10.
                return !(t.indexOf("MSIE ") > 0 || t.indexOf("Trident/") > 0 || t.indexOf("Edge/") > 0 || n || i);
    }
    /**
     * Returns true if the backing IndexedDB store is the Node IndexedDBShim
     * (see https://github.com/axemclion/IndexedDBShim).
     */    static C() {
        var t;
        return "undefined" != typeof process && "YES" === (null === (t = process.env) || void 0 === t ? void 0 : t.k);
    }
    /** Helper to get a typed SimpleDbStore from a transaction. */    static M(t, e) {
        return t.store(e);
    }
    // visible for testing
    /** Parse User Agent to determine iOS version. Returns -1 if not found. */
    static S(t) {
        const e = t.match(/i(?:phone|pad|pod) os ([\d_]+)/i), n = e ? e[1].split("_").slice(0, 2).join(".") : "-1";
        return Number(n);
    }
    // visible for testing
    /** Parse User Agent to determine Android version. Returns -1 if not found. */
    static N(t) {
        const e = t.match(/Android ([\d.]+)/i), n = e ? e[1].split(".").slice(0, 2).join(".") : "-1";
        return Number(n);
    }
    /**
     * Opens the specified database, creating or upgrading it if necessary.
     */    async $(t) {
        return this.db || (N("SimpleDb", "Opening database:", this.name), this.db = await new Promise(((e, n) => {
            // TODO(mikelehen): Investigate browser compatibility.
            // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
            // suggests IE9 and older WebKit browsers handle upgrade
            // differently. They expect setVersion, as described here:
            // https://developer.mozilla.org/en-US/docs/Web/API/IDBVersionChangeRequest/setVersion
            const s = indexedDB.open(this.name, this.version);
            s.onsuccess = t => {
                const n = t.target.result;
                e(n);
            }, s.onblocked = () => {
                n(new St(t, "Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."));
            }, s.onerror = e => {
                const s = e.target.error;
                "VersionError" === s.name ? n(new U(q.FAILED_PRECONDITION, "A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")) : "InvalidStateError" === s.name ? n(new U(q.FAILED_PRECONDITION, "Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: " + s)) : n(new St(t, s));
            }, s.onupgradeneeded = t => {
                N("SimpleDb", 'Database "' + this.name + '" requires upgrade from version:', t.oldVersion);
                const e = t.target.result;
                this.V.O(e, s.transaction, t.oldVersion, this.version).next((() => {
                    N("SimpleDb", "Database upgrade to version " + this.version + " complete");
                }));
            };
        }))), this.F && (this.db.onversionchange = t => this.F(t)), this.db;
    }
    B(t) {
        this.F = t, this.db && (this.db.onversionchange = e => t(e));
    }
    async runTransaction(t, e, n, s) {
        const i = "readonly" === e;
        let r = 0;
        for (;;) {
            ++r;
            try {
                this.db = await this.$(t);
                const e = Pt.open(this.db, t, i ? "readonly" : "readwrite", n), r = s(e).next((t => (e.P(), 
                t))).catch((t => (
                // Abort the transaction if there was an error.
                e.abort(t), Rt.reject(t)))).toPromise();
                // As noted above, errors are propagated by aborting the transaction. So
                // we swallow any error here to avoid the browser logging it as unhandled.
                return r.catch((() => {})), 
                // Wait for the transaction to complete (i.e. IndexedDb's onsuccess event to
                // fire), but still return the original transactionFnResult back to the
                // caller.
                await e.R, r;
            } catch (t) {
                const e = t, n = "FirebaseError" !== e.name && r < 3;
                // TODO(schmidt-sebastian): We could probably be smarter about this and
                // not retry exceptions that are likely unrecoverable (such as quota
                // exceeded errors).
                // Note: We cannot use an instanceof check for FirestoreException, since the
                // exception is wrapped in a generic error by our async/await handling.
                                if (N("SimpleDb", "Transaction failed with error:", e.message, "Retrying:", n), 
                this.close(), !n) return Promise.reject(e);
            }
        }
    }
    close() {
        this.db && this.db.close(), this.db = void 0;
    }
}

/**
 * A controller for iterating over a key range or index. It allows an iterate
 * callback to delete the currently-referenced object, or jump to a new key
 * within the key range or index.
 */ class Vt {
    constructor(t) {
        this.L = t, this.q = !1, this.U = null;
    }
    get isDone() {
        return this.q;
    }
    get K() {
        return this.U;
    }
    set cursor(t) {
        this.L = t;
    }
    /**
     * This function can be called to stop iteration at any point.
     */    done() {
        this.q = !0;
    }
    /**
     * This function can be called to skip to that next key, which could be
     * an index or a primary key.
     */    G(t) {
        this.U = t;
    }
    /**
     * Delete the current cursor value from the object store.
     *
     * NOTE: You CANNOT do this with a keysOnly query.
     */    delete() {
        return xt(this.L.delete());
    }
}

/** An error that wraps exceptions that thrown during IndexedDB execution. */ class St extends U {
    constructor(t, e) {
        super(q.UNAVAILABLE, `IndexedDB transaction '${t}' failed: ${e}`), this.name = "IndexedDbTransactionError";
    }
}

/** Verifies whether `e` is an IndexedDbTransactionError. */ function Dt(t) {
    // Use name equality, as instanceof checks on errors don't work with errors
    // that wrap other errors.
    return "IndexedDbTransactionError" === t.name;
}

/**
 * A wrapper around an IDBObjectStore providing an API that:
 *
 * 1) Has generic KeyType / ValueType parameters to provide strongly-typed
 * methods for acting against the object store.
 * 2) Deals with IndexedDB's onsuccess / onerror event callbacks, making every
 * method return a PersistencePromise instead.
 * 3) Provides a higher-level API to avoid needing to do excessive wrapping of
 * intermediate IndexedDB types (IDBCursorWithValue, etc.)
 */ class Ct {
    constructor(t) {
        this.store = t;
    }
    put(t, e) {
        let n;
        return void 0 !== e ? (N("SimpleDb", "PUT", this.store.name, t, e), n = this.store.put(e, t)) : (N("SimpleDb", "PUT", this.store.name, "<auto-key>", t), 
        n = this.store.put(t)), xt(n);
    }
    /**
     * Adds a new value into an Object Store and returns the new key. Similar to
     * IndexedDb's `add()`, this method will fail on primary key collisions.
     *
     * @param value - The object to write.
     * @returns The key of the value to add.
     */    add(t) {
        N("SimpleDb", "ADD", this.store.name, t, t);
        return xt(this.store.add(t));
    }
    /**
     * Gets the object with the specified key from the specified store, or null
     * if no object exists with the specified key.
     *
     * @key The key of the object to get.
     * @returns The object with the specified key or null if no object exists.
     */    get(t) {
        // We're doing an unsafe cast to ValueType.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return xt(this.store.get(t)).next((e => (
        // Normalize nonexistence to null.
        void 0 === e && (e = null), N("SimpleDb", "GET", this.store.name, t, e), e)));
    }
    delete(t) {
        N("SimpleDb", "DELETE", this.store.name, t);
        return xt(this.store.delete(t));
    }
    /**
     * If we ever need more of the count variants, we can add overloads. For now,
     * all we need is to count everything in a store.
     *
     * Returns the number of rows in the store.
     */    count() {
        N("SimpleDb", "COUNT", this.store.name);
        return xt(this.store.count());
    }
    j(t, e) {
        const n = this.options(t, e);
        // Use `getAll()` if the browser supports IndexedDB v3, as it is roughly
        // 20% faster. Unfortunately, getAll() does not support custom indices.
                if (n.index || "function" != typeof this.store.getAll) {
            const t = this.cursor(n), e = [];
            return this.W(t, ((t, n) => {
                e.push(n);
            })).next((() => e));
        }
        {
            const t = this.store.getAll(n.range);
            return new Rt(((e, n) => {
                t.onerror = t => {
                    n(t.target.error);
                }, t.onsuccess = t => {
                    e(t.target.result);
                };
            }));
        }
    }
    /**
     * Loads the first `count` elements from the provided index range. Loads all
     * elements if no limit is provided.
     */    H(t, e) {
        const n = this.store.getAll(t, null === e ? void 0 : e);
        return new Rt(((t, e) => {
            n.onerror = t => {
                e(t.target.error);
            }, n.onsuccess = e => {
                t(e.target.result);
            };
        }));
    }
    J(t, e) {
        N("SimpleDb", "DELETE ALL", this.store.name);
        const n = this.options(t, e);
        n.Y = !1;
        const s = this.cursor(n);
        return this.W(s, ((t, e, n) => n.delete()));
    }
    X(t, e) {
        let n;
        e ? n = t : (n = {}, e = t);
        const s = this.cursor(n);
        return this.W(s, e);
    }
    /**
     * Iterates over a store, but waits for the given callback to complete for
     * each entry before iterating the next entry. This allows the callback to do
     * asynchronous work to determine if this iteration should continue.
     *
     * The provided callback should return `true` to continue iteration, and
     * `false` otherwise.
     */    Z(t) {
        const e = this.cursor({});
        return new Rt(((n, s) => {
            e.onerror = t => {
                const e = kt(t.target.error);
                s(e);
            }, e.onsuccess = e => {
                const s = e.target.result;
                s ? t(s.primaryKey, s.value).next((t => {
                    t ? s.continue() : n();
                })) : n();
            };
        }));
    }
    W(t, e) {
        const n = [];
        return new Rt(((s, i) => {
            t.onerror = t => {
                i(t.target.error);
            }, t.onsuccess = t => {
                const i = t.target.result;
                if (!i) return void s();
                const r = new Vt(i), o = e(i.primaryKey, i.value, r);
                if (o instanceof Rt) {
                    const t = o.catch((t => (r.done(), Rt.reject(t))));
                    n.push(t);
                }
                r.isDone ? s() : null === r.K ? i.continue() : i.continue(r.K);
            };
        })).next((() => Rt.waitFor(n)));
    }
    options(t, e) {
        let n;
        return void 0 !== t && ("string" == typeof t ? n = t : e = t), {
            index: n,
            range: e
        };
    }
    cursor(t) {
        let e = "next";
        if (t.reverse && (e = "prev"), t.index) {
            const n = this.store.index(t.index);
            return t.Y ? n.openKeyCursor(t.range, e) : n.openCursor(t.range, e);
        }
        return this.store.openCursor(t.range, e);
    }
}

/**
 * Wraps an IDBRequest in a PersistencePromise, using the onsuccess / onerror
 * handlers to resolve / reject the PersistencePromise as appropriate.
 */ function xt(t) {
    return new Rt(((e, n) => {
        t.onsuccess = t => {
            const n = t.target.result;
            e(n);
        }, t.onerror = t => {
            const e = kt(t.target.error);
            n(e);
        };
    }));
}

// Guard so we only report the error once.
let Nt = !1;

function kt(t) {
    const e = bt.S(util.getUA());
    if (e >= 12.2 && e < 13) {
        const e = "An internal error was encountered in the Indexed Database server";
        if (t.message.indexOf(e) >= 0) {
            // Wrap error in a more descriptive one.
            const t = new U("internal", `IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${e}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);
            return Nt || (Nt = !0, 
            // Throw a global exception outside of this promise chain, for the user to
            // potentially catch.
            setTimeout((() => {
                throw t;
            }), 0)), t;
        }
    }
    return t;
}

/** This class is responsible for the scheduling of Index Backfiller. */
class Mt {
    constructor(t, e) {
        this.asyncQueue = t, this.tt = e, this.task = null;
    }
    start() {
        this.et(15e3);
    }
    stop() {
        this.task && (this.task.cancel(), this.task = null);
    }
    get started() {
        return null !== this.task;
    }
    et(t) {
        N("IndexBackiller", `Scheduled in ${t}ms`), this.task = this.asyncQueue.enqueueAfterDelay("index_backfill" /* TimerId.IndexBackfill */ , t, (async () => {
            this.task = null;
            try {
                N("IndexBackiller", `Documents written: ${await this.tt.nt()}`);
            } catch (t) {
                Dt(t) ? N("IndexBackiller", "Ignoring IndexedDB error during index backfill: ", t) : await vt(t);
            }
            await this.et(6e4);
        }));
    }
}

/** Implements the steps for backfilling indexes. */ class $t {
    constructor(
    /**
     * LocalStore provides access to IndexManager and LocalDocumentView.
     * These properties will update when the user changes. Consequently,
     * making a local copy of IndexManager and LocalDocumentView will require
     * updates over time. The simpler solution is to rely on LocalStore to have
     * an up-to-date references to IndexManager and LocalDocumentStore.
     */
    t, e) {
        this.localStore = t, this.persistence = e;
    }
    async nt(t = 50) {
        return this.persistence.runTransaction("Backfill Indexes", "readwrite-primary", (e => this.st(e, t)));
    }
    /** Writes index entries until the cap is reached. Returns the number of documents processed. */    st(t, e) {
        const n = new Set;
        let s = e, i = !0;
        return Rt.doWhile((() => !0 === i && s > 0), (() => this.localStore.indexManager.getNextCollectionGroupToUpdate(t).next((e => {
            if (null !== e && !n.has(e)) return N("IndexBackiller", `Processing collection: ${e}`), 
            this.it(t, e, s).next((t => {
                s -= t, n.add(e);
            }));
            i = !1;
        })))).next((() => e - s));
    }
    /**
     * Writes entries for the provided collection group. Returns the number of documents processed.
     */    it(t, e, n) {
        // Use the earliest offset of all field indexes to query the local cache.
        return this.localStore.indexManager.getMinOffsetFromCollectionGroup(t, e).next((s => this.localStore.localDocuments.getNextDocuments(t, e, s, n).next((n => {
            const i = n.changes;
            return this.localStore.indexManager.updateIndexEntries(t, i).next((() => this.rt(s, n))).next((n => (N("IndexBackiller", `Updating offset: ${n}`), 
            this.localStore.indexManager.updateCollectionGroup(t, e, n)))).next((() => i.size));
        }))));
    }
    /** Returns the next offset based on the provided documents. */    rt(t, e) {
        let n = t;
        return e.changes.forEach(((t, e) => {
            const s = pt(e);
            Tt(s, n) > 0 && (n = s);
        })), new It(n.readTime, n.documentKey, Math.max(e.batchId, t.largestBatchId));
    }
}

/**
 * @license
 * Copyright 2018 Google LLC
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
/**
 * `ListenSequence` is a monotonic sequence. It is initialized with a minimum value to
 * exceed. All subsequent calls to next will return increasing values. If provided with a
 * `SequenceNumberSyncer`, it will additionally bump its next value when told of a new value, as
 * well as write out sequence numbers that it produces via `next()`.
 */ class Ot {
    constructor(t, e) {
        this.previousValue = t, e && (e.sequenceNumberHandler = t => this.ot(t), this.ut = t => e.writeSequenceNumber(t));
    }
    ot(t) {
        return this.previousValue = Math.max(t, this.previousValue), this.previousValue;
    }
    next() {
        const t = ++this.previousValue;
        return this.ut && this.ut(t), t;
    }
}

Ot.ct = -1;

/**
 * Returns whether a variable is either undefined or null.
 */
function Ft(t) {
    return null == t;
}

/** Returns whether the value represents -0. */ function Bt(t) {
    // Detect if the value is -0.0. Based on polyfill from
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
    return 0 === t && 1 / t == -1 / 0;
}

/**
 * Returns whether a value is an integer and in the safe integer range
 * @param value - The value to test for being an integer and in the safe range
 */ function Lt(t) {
    return "number" == typeof t && Number.isInteger(t) && !Bt(t) && t <= Number.MAX_SAFE_INTEGER && t >= Number.MIN_SAFE_INTEGER;
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Encodes a resource path into a IndexedDb-compatible string form.
 */
function qt(t) {
    let e = "";
    for (let n = 0; n < t.length; n++) e.length > 0 && (e = Kt(e)), e = Ut(t.get(n), e);
    return Kt(e);
}

/** Encodes a single segment of a resource path into the given result */ function Ut(t, e) {
    let n = e;
    const s = t.length;
    for (let e = 0; e < s; e++) {
        const s = t.charAt(e);
        switch (s) {
          case "\0":
            n += "";
            break;

          case "":
            n += "";
            break;

          default:
            n += s;
        }
    }
    return n;
}

/** Encodes a path separator into the given result */ function Kt(t) {
    return t + "";
}

/**
 * Decodes the given IndexedDb-compatible string form of a resource path into
 * a ResourcePath instance. Note that this method is not suitable for use with
 * decoding resource names from the server; those are One Platform format
 * strings.
 */ function Gt(t) {
    // Event the empty path must encode as a path of at least length 2. A path
    // with exactly 2 must be the empty path.
    const e = t.length;
    if (F(e >= 2), 2 === e) return F("" === t.charAt(0) && "" === t.charAt(1)), ut.emptyPath();
    // Escape characters cannot exist past the second-to-last position in the
    // source value.
        const __PRIVATE_lastReasonableEscapeIndex = e - 2, n = [];
    let s = "";
    for (let i = 0; i < e; ) {
        // The last two characters of a valid encoded path must be a separator, so
        // there must be an end to this segment.
        const e = t.indexOf("", i);
        (e < 0 || e > __PRIVATE_lastReasonableEscapeIndex) && O();
        switch (t.charAt(e + 1)) {
          case "":
            const r = t.substring(i, e);
            let o;
            0 === s.length ? 
            // Avoid copying for the common case of a segment that excludes \0
            // and \001
            o = r : (s += r, o = s, s = ""), n.push(o);
            break;

          case "":
            s += t.substring(i, e), s += "\0";
            break;

          case "":
            // The escape character can be used in the output to encode itself.
            s += t.substring(i, e + 1);
            break;

          default:
            O();
        }
        i = e + 2;
    }
    return new ut(n);
}

/**
 * @license
 * Copyright 2022 Google LLC
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
 */ const Qt = [ "userId", "batchId" ];

/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * Name of the IndexedDb object store.
 *
 * Note that the name 'owner' is chosen to ensure backwards compatibility with
 * older clients that only supported single locked access to the persistence
 * layer.
 */
/**
 * Creates a [userId, encodedPath] key for use in the DbDocumentMutations
 * index to iterate over all at document mutations for a given path or lower.
 */
function jt(t, e) {
    return [ t, qt(e) ];
}

/**
 * Creates a full index key of [userId, encodedPath, batchId] for inserting
 * and deleting into the DbDocumentMutations index.
 */ function zt(t, e, n) {
    return [ t, qt(e), n ];
}

/**
 * Because we store all the useful information for this store in the key,
 * there is no useful information to store as the value. The raw (unencoded)
 * path cannot be stored because IndexedDb doesn't store prototype
 * information.
 */ const Wt = {}, Ht = [ "prefixPath", "collectionGroup", "readTime", "documentId" ], Jt = [ "prefixPath", "collectionGroup", "documentId" ], Yt = [ "collectionGroup", "readTime", "prefixPath", "documentId" ], Xt = [ "canonicalId", "targetId" ], Zt = [ "targetId", "path" ], te = [ "path", "targetId" ], ee = [ "collectionId", "parent" ], ne = [ "indexId", "uid" ], se = [ "uid", "sequenceNumber" ], ie = [ "indexId", "uid", "arrayValue", "directionalValue", "orderedDocumentKey", "documentKey" ], re = [ "indexId", "uid", "orderedDocumentKey" ], oe = [ "userId", "collectionPath", "documentId" ], ue = [ "userId", "collectionPath", "largestBatchId" ], ce = [ "userId", "collectionGroup", "largestBatchId" ], ae = [ ...[ ...[ ...[ ...[ "mutationQueues", "mutations", "documentMutations", "remoteDocuments", "targets", "owner", "targetGlobal", "targetDocuments" ], "clientMetadata" ], "remoteDocumentGlobal" ], "collectionParents" ], "bundles", "namedQueries" ], he = [ ...ae, "documentOverlays" ], le = [ "mutationQueues", "mutations", "documentMutations", "remoteDocumentsV14", "targets", "owner", "targetGlobal", "targetDocuments", "clientMetadata", "remoteDocumentGlobal", "collectionParents", "bundles", "namedQueries", "documentOverlays" ], fe = le, de = [ ...fe, "indexConfiguration", "indexState", "indexEntries" ];

/**
 * @license
 * Copyright 2020 Google LLC
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
class we extends At {
    constructor(t, e) {
        super(), this.ht = t, this.currentSequenceNumber = e;
    }
}

function _e(t, e) {
    const n = L(t);
    return bt.M(n.ht, e);
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ function me(t) {
    let e = 0;
    for (const n in t) Object.prototype.hasOwnProperty.call(t, n) && e++;
    return e;
}

function ge(t, e) {
    for (const n in t) Object.prototype.hasOwnProperty.call(t, n) && e(n, t[n]);
}

function ye(t) {
    for (const e in t) if (Object.prototype.hasOwnProperty.call(t, e)) return !1;
    return !0;
}

/**
 * @license
 * Copyright 2017 Google LLC
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
// An immutable sorted map implementation, based on a Left-leaning Red-Black
// tree.
class pe {
    constructor(t, e) {
        this.comparator = t, this.root = e || Te.EMPTY;
    }
    // Returns a copy of the map, with the specified key/value added or replaced.
    insert(t, e) {
        return new pe(this.comparator, this.root.insert(t, e, this.comparator).copy(null, null, Te.BLACK, null, null));
    }
    // Returns a copy of the map, with the specified key removed.
    remove(t) {
        return new pe(this.comparator, this.root.remove(t, this.comparator).copy(null, null, Te.BLACK, null, null));
    }
    // Returns the value of the node with the given key, or null.
    get(t) {
        let e = this.root;
        for (;!e.isEmpty(); ) {
            const n = this.comparator(t, e.key);
            if (0 === n) return e.value;
            n < 0 ? e = e.left : n > 0 && (e = e.right);
        }
        return null;
    }
    // Returns the index of the element in this sorted map, or -1 if it doesn't
    // exist.
    indexOf(t) {
        // Number of nodes that were pruned when descending right
        let e = 0, n = this.root;
        for (;!n.isEmpty(); ) {
            const s = this.comparator(t, n.key);
            if (0 === s) return e + n.left.size;
            s < 0 ? n = n.left : (
            // Count all nodes left of the node plus the node itself
            e += n.left.size + 1, n = n.right);
        }
        // Node not found
                return -1;
    }
    isEmpty() {
        return this.root.isEmpty();
    }
    // Returns the total number of nodes in the map.
    get size() {
        return this.root.size;
    }
    // Returns the minimum key in the map.
    minKey() {
        return this.root.minKey();
    }
    // Returns the maximum key in the map.
    maxKey() {
        return this.root.maxKey();
    }
    // Traverses the map in key order and calls the specified action function
    // for each key/value pair. If action returns true, traversal is aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    inorderTraversal(t) {
        return this.root.inorderTraversal(t);
    }
    forEach(t) {
        this.inorderTraversal(((e, n) => (t(e, n), !1)));
    }
    toString() {
        const t = [];
        return this.inorderTraversal(((e, n) => (t.push(`${e}:${n}`), !1))), `{${t.join(", ")}}`;
    }
    // Traverses the map in reverse key order and calls the specified action
    // function for each key/value pair. If action returns true, traversal is
    // aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    reverseTraversal(t) {
        return this.root.reverseTraversal(t);
    }
    // Returns an iterator over the SortedMap.
    getIterator() {
        return new Ie(this.root, null, this.comparator, !1);
    }
    getIteratorFrom(t) {
        return new Ie(this.root, t, this.comparator, !1);
    }
    getReverseIterator() {
        return new Ie(this.root, null, this.comparator, !0);
    }
    getReverseIteratorFrom(t) {
        return new Ie(this.root, t, this.comparator, !0);
    }
}

 // end SortedMap
// An iterator over an LLRBNode.
class Ie {
    constructor(t, e, n, s) {
        this.isReverse = s, this.nodeStack = [];
        let i = 1;
        for (;!t.isEmpty(); ) if (i = e ? n(t.key, e) : 1, 
        // flip the comparison if we're going in reverse
        e && s && (i *= -1), i < 0) 
        // This node is less than our start key. ignore it
        t = this.isReverse ? t.left : t.right; else {
            if (0 === i) {
                // This node is exactly equal to our start key. Push it on the stack,
                // but stop iterating;
                this.nodeStack.push(t);
                break;
            }
            // This node is greater than our start key, add it to the stack and move
            // to the next one
            this.nodeStack.push(t), t = this.isReverse ? t.right : t.left;
        }
    }
    getNext() {
        let t = this.nodeStack.pop();
        const e = {
            key: t.key,
            value: t.value
        };
        if (this.isReverse) for (t = t.left; !t.isEmpty(); ) this.nodeStack.push(t), t = t.right; else for (t = t.right; !t.isEmpty(); ) this.nodeStack.push(t), 
        t = t.left;
        return e;
    }
    hasNext() {
        return this.nodeStack.length > 0;
    }
    peek() {
        if (0 === this.nodeStack.length) return null;
        const t = this.nodeStack[this.nodeStack.length - 1];
        return {
            key: t.key,
            value: t.value
        };
    }
}

 // end SortedMapIterator
// Represents a node in a Left-leaning Red-Black tree.
class Te {
    constructor(t, e, n, s, i) {
        this.key = t, this.value = e, this.color = null != n ? n : Te.RED, this.left = null != s ? s : Te.EMPTY, 
        this.right = null != i ? i : Te.EMPTY, this.size = this.left.size + 1 + this.right.size;
    }
    // Returns a copy of the current node, optionally replacing pieces of it.
    copy(t, e, n, s, i) {
        return new Te(null != t ? t : this.key, null != e ? e : this.value, null != n ? n : this.color, null != s ? s : this.left, null != i ? i : this.right);
    }
    isEmpty() {
        return !1;
    }
    // Traverses the tree in key order and calls the specified action function
    // for each node. If action returns true, traversal is aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    inorderTraversal(t) {
        return this.left.inorderTraversal(t) || t(this.key, this.value) || this.right.inorderTraversal(t);
    }
    // Traverses the tree in reverse key order and calls the specified action
    // function for each node. If action returns true, traversal is aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    reverseTraversal(t) {
        return this.right.reverseTraversal(t) || t(this.key, this.value) || this.left.reverseTraversal(t);
    }
    // Returns the minimum node in the tree.
    min() {
        return this.left.isEmpty() ? this : this.left.min();
    }
    // Returns the maximum key in the tree.
    minKey() {
        return this.min().key;
    }
    // Returns the maximum key in the tree.
    maxKey() {
        return this.right.isEmpty() ? this.key : this.right.maxKey();
    }
    // Returns new tree, with the key/value added.
    insert(t, e, n) {
        let s = this;
        const i = n(t, s.key);
        return s = i < 0 ? s.copy(null, null, null, s.left.insert(t, e, n), null) : 0 === i ? s.copy(null, e, null, null, null) : s.copy(null, null, null, null, s.right.insert(t, e, n)), 
        s.fixUp();
    }
    removeMin() {
        if (this.left.isEmpty()) return Te.EMPTY;
        let t = this;
        return t.left.isRed() || t.left.left.isRed() || (t = t.moveRedLeft()), t = t.copy(null, null, null, t.left.removeMin(), null), 
        t.fixUp();
    }
    // Returns new tree, with the specified item removed.
    remove(t, e) {
        let n, s = this;
        if (e(t, s.key) < 0) s.left.isEmpty() || s.left.isRed() || s.left.left.isRed() || (s = s.moveRedLeft()), 
        s = s.copy(null, null, null, s.left.remove(t, e), null); else {
            if (s.left.isRed() && (s = s.rotateRight()), s.right.isEmpty() || s.right.isRed() || s.right.left.isRed() || (s = s.moveRedRight()), 
            0 === e(t, s.key)) {
                if (s.right.isEmpty()) return Te.EMPTY;
                n = s.right.min(), s = s.copy(n.key, n.value, null, null, s.right.removeMin());
            }
            s = s.copy(null, null, null, null, s.right.remove(t, e));
        }
        return s.fixUp();
    }
    isRed() {
        return this.color;
    }
    // Returns new tree after performing any needed rotations.
    fixUp() {
        let t = this;
        return t.right.isRed() && !t.left.isRed() && (t = t.rotateLeft()), t.left.isRed() && t.left.left.isRed() && (t = t.rotateRight()), 
        t.left.isRed() && t.right.isRed() && (t = t.colorFlip()), t;
    }
    moveRedLeft() {
        let t = this.colorFlip();
        return t.right.left.isRed() && (t = t.copy(null, null, null, null, t.right.rotateRight()), 
        t = t.rotateLeft(), t = t.colorFlip()), t;
    }
    moveRedRight() {
        let t = this.colorFlip();
        return t.left.left.isRed() && (t = t.rotateRight(), t = t.colorFlip()), t;
    }
    rotateLeft() {
        const t = this.copy(null, null, Te.RED, null, this.right.left);
        return this.right.copy(null, null, this.color, t, null);
    }
    rotateRight() {
        const t = this.copy(null, null, Te.RED, this.left.right, null);
        return this.left.copy(null, null, this.color, null, t);
    }
    colorFlip() {
        const t = this.left.copy(null, null, !this.left.color, null, null), e = this.right.copy(null, null, !this.right.color, null, null);
        return this.copy(null, null, !this.color, t, e);
    }
    // For testing.
    checkMaxDepth() {
        const t = this.check();
        return Math.pow(2, t) <= this.size + 1;
    }
    // In a balanced RB tree, the black-depth (number of black nodes) from root to
    // leaves is equal on both sides.  This function verifies that or asserts.
    check() {
        if (this.isRed() && this.left.isRed()) throw O();
        if (this.right.isRed()) throw O();
        const t = this.left.check();
        if (t !== this.right.check()) throw O();
        return t + (this.isRed() ? 0 : 1);
    }
}

 // end LLRBNode
// Empty node is shared between all LLRB trees.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Te.EMPTY = null, Te.RED = !0, Te.BLACK = !1;

// end LLRBEmptyNode
Te.EMPTY = new 
// Represents an empty node (a leaf node in the Red-Black Tree).
class {
    constructor() {
        this.size = 0;
    }
    get key() {
        throw O();
    }
    get value() {
        throw O();
    }
    get color() {
        throw O();
    }
    get left() {
        throw O();
    }
    get right() {
        throw O();
    }
    // Returns a copy of the current node.
    copy(t, e, n, s, i) {
        return this;
    }
    // Returns a copy of the tree, with the specified key/value added.
    insert(t, e, n) {
        return new Te(t, e);
    }
    // Returns a copy of the tree, with the specified key removed.
    remove(t, e) {
        return this;
    }
    isEmpty() {
        return !0;
    }
    inorderTraversal(t) {
        return !1;
    }
    reverseTraversal(t) {
        return !1;
    }
    minKey() {
        return null;
    }
    maxKey() {
        return null;
    }
    isRed() {
        return !1;
    }
    // For testing.
    checkMaxDepth() {
        return !0;
    }
    check() {
        return 0;
    }
};

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * SortedSet is an immutable (copy-on-write) collection that holds elements
 * in order specified by the provided comparator.
 *
 * NOTE: if provided comparator returns 0 for two elements, we consider them to
 * be equal!
 */
class Ee {
    constructor(t) {
        this.comparator = t, this.data = new pe(this.comparator);
    }
    has(t) {
        return null !== this.data.get(t);
    }
    first() {
        return this.data.minKey();
    }
    last() {
        return this.data.maxKey();
    }
    get size() {
        return this.data.size;
    }
    indexOf(t) {
        return this.data.indexOf(t);
    }
    /** Iterates elements in order defined by "comparator" */    forEach(t) {
        this.data.inorderTraversal(((e, n) => (t(e), !1)));
    }
    /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */    forEachInRange(t, e) {
        const n = this.data.getIteratorFrom(t[0]);
        for (;n.hasNext(); ) {
            const s = n.getNext();
            if (this.comparator(s.key, t[1]) >= 0) return;
            e(s.key);
        }
    }
    /**
     * Iterates over `elem`s such that: start &lt;= elem until false is returned.
     */    forEachWhile(t, e) {
        let n;
        for (n = void 0 !== e ? this.data.getIteratorFrom(e) : this.data.getIterator(); n.hasNext(); ) {
            if (!t(n.getNext().key)) return;
        }
    }
    /** Finds the least element greater than or equal to `elem`. */    firstAfterOrEqual(t) {
        const e = this.data.getIteratorFrom(t);
        return e.hasNext() ? e.getNext().key : null;
    }
    getIterator() {
        return new Ae(this.data.getIterator());
    }
    getIteratorFrom(t) {
        return new Ae(this.data.getIteratorFrom(t));
    }
    /** Inserts or updates an element */    add(t) {
        return this.copy(this.data.remove(t).insert(t, !0));
    }
    /** Deletes an element */    delete(t) {
        return this.has(t) ? this.copy(this.data.remove(t)) : this;
    }
    isEmpty() {
        return this.data.isEmpty();
    }
    unionWith(t) {
        let e = this;
        // Make sure `result` always refers to the larger one of the two sets.
                return e.size < t.size && (e = t, t = this), t.forEach((t => {
            e = e.add(t);
        })), e;
    }
    isEqual(t) {
        if (!(t instanceof Ee)) return !1;
        if (this.size !== t.size) return !1;
        const e = this.data.getIterator(), n = t.data.getIterator();
        for (;e.hasNext(); ) {
            const t = e.getNext().key, s = n.getNext().key;
            if (0 !== this.comparator(t, s)) return !1;
        }
        return !0;
    }
    toArray() {
        const t = [];
        return this.forEach((e => {
            t.push(e);
        })), t;
    }
    toString() {
        const t = [];
        return this.forEach((e => t.push(e))), "SortedSet(" + t.toString() + ")";
    }
    copy(t) {
        const e = new Ee(this.comparator);
        return e.data = t, e;
    }
}

class Ae {
    constructor(t) {
        this.iter = t;
    }
    getNext() {
        return this.iter.getNext().key;
    }
    hasNext() {
        return this.iter.hasNext();
    }
}

/**
 * Compares two sorted sets for equality using their natural ordering. The
 * method computes the intersection and invokes `onAdd` for every element that
 * is in `after` but not `before`. `onRemove` is invoked for every element in
 * `before` but missing from `after`.
 *
 * The method creates a copy of both `before` and `after` and runs in O(n log
 * n), where n is the size of the two lists.
 *
 * @param before - The elements that exist in the original set.
 * @param after - The elements to diff against the original set.
 * @param comparator - The comparator for the elements in before and after.
 * @param onAdd - A function to invoke for every element that is part of `
 * after` but not `before`.
 * @param onRemove - A function to invoke for every element that is part of
 * `before` but not `after`.
 */
/**
 * Returns the next element from the iterator or `undefined` if none available.
 */
function ve(t) {
    return t.hasNext() ? t.getNext() : void 0;
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Provides a set of fields that can be used to partially patch a document.
 * FieldMask is used in conjunction with ObjectValue.
 * Examples:
 *   foo - Overwrites foo entirely with the provided value. If foo is not
 *         present in the companion ObjectValue, the field is deleted.
 *   foo.bar - Overwrites only the field bar of the object foo.
 *             If foo is not an object, foo is replaced with an object
 *             containing foo
 */ class Re {
    constructor(t) {
        this.fields = t, 
        // TODO(dimond): validation of FieldMask
        // Sort the field mask to support `FieldMask.isEqual()` and assert below.
        t.sort(at.comparator);
    }
    static empty() {
        return new Re([]);
    }
    /**
     * Returns a new FieldMask object that is the result of adding all the given
     * fields paths to this field mask.
     */    unionWith(t) {
        let e = new Ee(at.comparator);
        for (const t of this.fields) e = e.add(t);
        for (const n of t) e = e.add(n);
        return new Re(e.toArray());
    }
    /**
     * Verifies that `fieldPath` is included by at least one field in this field
     * mask.
     *
     * This is an O(n) operation, where `n` is the size of the field mask.
     */    covers(t) {
        for (const e of this.fields) if (e.isPrefixOf(t)) return !0;
        return !1;
    }
    isEqual(t) {
        return nt(this.fields, t.fields, ((t, e) => t.isEqual(e)));
    }
}

/**
 * @license
 * Copyright 2023 Google LLC
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
/**
 * An error encountered while decoding base64 string.
 */ class Pe extends Error {
    constructor() {
        super(...arguments), this.name = "Base64DecodeError";
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/** Converts a Base64 encoded string to a binary string. */
/** True if and only if the Base64 conversion functions are available. */
function be() {
    return "undefined" != typeof atob;
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Immutable class that represents a "proto" byte string.
 *
 * Proto byte strings can either be Base64-encoded strings or Uint8Arrays when
 * sent on the wire. This class abstracts away this differentiation by holding
 * the proto byte string in a common class that must be converted into a string
 * before being sent as a proto.
 * @internal
 */ class Ve {
    constructor(t) {
        this.binaryString = t;
    }
    static fromBase64String(t) {
        const e = function(t) {
            try {
                return atob(t);
            } catch (t) {
                // Check that `DOMException` is defined before using it to avoid
                // "ReferenceError: Property 'DOMException' doesn't exist" in react-native.
                // (https://github.com/firebase/firebase-js-sdk/issues/7115)
                throw "undefined" != typeof DOMException && t instanceof DOMException ? new Pe("Invalid base64 string: " + t) : t;
            }
        }
        /** Converts a binary string to a Base64 encoded string. */ (t);
        return new Ve(e);
    }
    static fromUint8Array(t) {
        // TODO(indexing); Remove the copy of the byte string here as this method
        // is frequently called during indexing.
        const e = 
        /**
 * Helper function to convert an Uint8array to a binary string.
 */
        function(t) {
            let e = "";
            for (let n = 0; n < t.length; ++n) e += String.fromCharCode(t[n]);
            return e;
        }
        /**
 * Helper function to convert a binary string to an Uint8Array.
 */ (t);
        return new Ve(e);
    }
    [Symbol.iterator]() {
        let t = 0;
        return {
            next: () => t < this.binaryString.length ? {
                value: this.binaryString.charCodeAt(t++),
                done: !1
            } : {
                value: void 0,
                done: !0
            }
        };
    }
    toBase64() {
        return t = this.binaryString, btoa(t);
        var t;
    }
    toUint8Array() {
        return function(t) {
            const e = new Uint8Array(t.length);
            for (let n = 0; n < t.length; n++) e[n] = t.charCodeAt(n);
            return e;
        }
        /**
 * @license
 * Copyright 2020 Google LLC
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
        // A RegExp matching ISO 8601 UTC timestamps with optional fraction.
        (this.binaryString);
    }
    approximateByteSize() {
        return 2 * this.binaryString.length;
    }
    compareTo(t) {
        return et(this.binaryString, t.binaryString);
    }
    isEqual(t) {
        return this.binaryString === t.binaryString;
    }
}

Ve.EMPTY_BYTE_STRING = new Ve("");

const Se = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);

/**
 * Converts the possible Proto values for a timestamp value into a "seconds and
 * nanos" representation.
 */ function De(t) {
    // The json interface (for the browser) will return an iso timestamp string,
    // while the proto js library (for node) will return a
    // google.protobuf.Timestamp instance.
    if (F(!!t), "string" == typeof t) {
        // The date string can have higher precision (nanos) than the Date class
        // (millis), so we do some custom parsing here.
        // Parse the nanos right out of the string.
        let e = 0;
        const n = Se.exec(t);
        if (F(!!n), n[1]) {
            // Pad the fraction out to 9 digits (nanos).
            let t = n[1];
            t = (t + "000000000").substr(0, 9), e = Number(t);
        }
        // Parse the date to get the seconds.
                const s = new Date(t);
        return {
            seconds: Math.floor(s.getTime() / 1e3),
            nanos: e
        };
    }
    return {
        seconds: Ce(t.seconds),
        nanos: Ce(t.nanos)
    };
}

/**
 * Converts the possible Proto types for numbers into a JavaScript number.
 * Returns 0 if the value is not numeric.
 */ function Ce(t) {
    // TODO(bjornick): Handle int64 greater than 53 bits.
    return "number" == typeof t ? t : "string" == typeof t ? Number(t) : 0;
}

/** Converts the possible Proto types for Blobs into a ByteString. */ function xe(t) {
    return "string" == typeof t ? Ve.fromBase64String(t) : Ve.fromUint8Array(t);
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Represents a locally-applied ServerTimestamp.
 *
 * Server Timestamps are backed by MapValues that contain an internal field
 * `__type__` with a value of `server_timestamp`. The previous value and local
 * write time are stored in its `__previous_value__` and `__local_write_time__`
 * fields respectively.
 *
 * Notes:
 * - ServerTimestampValue instances are created as the result of applying a
 *   transform. They can only exist in the local view of a document. Therefore
 *   they do not need to be parsed or serialized.
 * - When evaluated locally (e.g. for snapshot.data()), they by default
 *   evaluate to `null`. This behavior can be configured by passing custom
 *   FieldValueOptions to value().
 * - With respect to other ServerTimestampValues, they sort by their
 *   localWriteTime.
 */ function Ne(t) {
    var e, n;
    return "server_timestamp" === (null === (n = ((null === (e = null == t ? void 0 : t.mapValue) || void 0 === e ? void 0 : e.fields) || {}).__type__) || void 0 === n ? void 0 : n.stringValue);
}

/**
 * Creates a new ServerTimestamp proto value (using the internal format).
 */
/**
 * Returns the value of the field before this ServerTimestamp was set.
 *
 * Preserving the previous values allows the user to display the last resoled
 * value until the backend responds with the timestamp.
 */
function ke(t) {
    const e = t.mapValue.fields.__previous_value__;
    return Ne(e) ? ke(e) : e;
}

/**
 * Returns the local time at which this timestamp was first set.
 */ function Me(t) {
    const e = De(t.mapValue.fields.__local_write_time__.timestampValue);
    return new it(e.seconds, e.nanos);
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ class $e {
    /**
     * Constructs a DatabaseInfo using the provided host, databaseId and
     * persistenceKey.
     *
     * @param databaseId - The database to use.
     * @param appId - The Firebase App Id.
     * @param persistenceKey - A unique identifier for this Firestore's local
     * storage (used in conjunction with the databaseId).
     * @param host - The Firestore backend host to connect to.
     * @param ssl - Whether to use SSL when connecting.
     * @param forceLongPolling - Whether to use the forceLongPolling option
     * when using WebChannel as the network transport.
     * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
     * option when using WebChannel as the network transport.
     * @param longPollingOptions Options that configure long-polling.
     * @param useFetchStreams Whether to use the Fetch API instead of
     * XMLHTTPRequest
     */
    constructor(t, e, n, s, i, r, o, u, c) {
        this.databaseId = t, this.appId = e, this.persistenceKey = n, this.host = s, this.ssl = i, 
        this.forceLongPolling = r, this.autoDetectLongPolling = o, this.longPollingOptions = u, 
        this.useFetchStreams = c;
    }
}

/** The default database name for a project. */
/**
 * Represents the database ID a Firestore client is associated with.
 * @internal
 */
class Oe {
    constructor(t, e) {
        this.projectId = t, this.database = e || "(default)";
    }
    static empty() {
        return new Oe("", "");
    }
    get isDefaultDatabase() {
        return "(default)" === this.database;
    }
    isEqual(t) {
        return t instanceof Oe && t.projectId === this.projectId && t.database === this.database;
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
const Fe = {
    mapValue: {
        fields: {
            __type__: {
                stringValue: "__max__"
            }
        }
    }
}, Be = {
    nullValue: "NULL_VALUE"
};

/** Extracts the backend's type order for the provided value. */
function Le(t) {
    return "nullValue" in t ? 0 /* TypeOrder.NullValue */ : "booleanValue" in t ? 1 /* TypeOrder.BooleanValue */ : "integerValue" in t || "doubleValue" in t ? 2 /* TypeOrder.NumberValue */ : "timestampValue" in t ? 3 /* TypeOrder.TimestampValue */ : "stringValue" in t ? 5 /* TypeOrder.StringValue */ : "bytesValue" in t ? 6 /* TypeOrder.BlobValue */ : "referenceValue" in t ? 7 /* TypeOrder.RefValue */ : "geoPointValue" in t ? 8 /* TypeOrder.GeoPointValue */ : "arrayValue" in t ? 9 /* TypeOrder.ArrayValue */ : "mapValue" in t ? Ne(t) ? 4 /* TypeOrder.ServerTimestampValue */ : en(t) ? 9007199254740991 /* TypeOrder.MaxValue */ : 10 /* TypeOrder.ObjectValue */ : O();
}

/** Tests `left` and `right` for equality based on the backend semantics. */ function qe(t, e) {
    if (t === e) return !0;
    const n = Le(t);
    if (n !== Le(e)) return !1;
    switch (n) {
      case 0 /* TypeOrder.NullValue */ :
      case 9007199254740991 /* TypeOrder.MaxValue */ :
        return !0;

      case 1 /* TypeOrder.BooleanValue */ :
        return t.booleanValue === e.booleanValue;

      case 4 /* TypeOrder.ServerTimestampValue */ :
        return Me(t).isEqual(Me(e));

      case 3 /* TypeOrder.TimestampValue */ :
        return function(t, e) {
            if ("string" == typeof t.timestampValue && "string" == typeof e.timestampValue && t.timestampValue.length === e.timestampValue.length) 
            // Use string equality for ISO 8601 timestamps
            return t.timestampValue === e.timestampValue;
            const n = De(t.timestampValue), s = De(e.timestampValue);
            return n.seconds === s.seconds && n.nanos === s.nanos;
        }(t, e);

      case 5 /* TypeOrder.StringValue */ :
        return t.stringValue === e.stringValue;

      case 6 /* TypeOrder.BlobValue */ :
        return function(t, e) {
            return xe(t.bytesValue).isEqual(xe(e.bytesValue));
        }(t, e);

      case 7 /* TypeOrder.RefValue */ :
        return t.referenceValue === e.referenceValue;

      case 8 /* TypeOrder.GeoPointValue */ :
        return function(t, e) {
            return Ce(t.geoPointValue.latitude) === Ce(e.geoPointValue.latitude) && Ce(t.geoPointValue.longitude) === Ce(e.geoPointValue.longitude);
        }(t, e);

      case 2 /* TypeOrder.NumberValue */ :
        return function(t, e) {
            if ("integerValue" in t && "integerValue" in e) return Ce(t.integerValue) === Ce(e.integerValue);
            if ("doubleValue" in t && "doubleValue" in e) {
                const n = Ce(t.doubleValue), s = Ce(e.doubleValue);
                return n === s ? Bt(n) === Bt(s) : isNaN(n) && isNaN(s);
            }
            return !1;
        }(t, e);

      case 9 /* TypeOrder.ArrayValue */ :
        return nt(t.arrayValue.values || [], e.arrayValue.values || [], qe);

      case 10 /* TypeOrder.ObjectValue */ :
        return function(t, e) {
            const n = t.mapValue.fields || {}, s = e.mapValue.fields || {};
            if (me(n) !== me(s)) return !1;
            for (const t in n) if (n.hasOwnProperty(t) && (void 0 === s[t] || !qe(n[t], s[t]))) return !1;
            return !0;
        }
        /** Returns true if the ArrayValue contains the specified element. */ (t, e);

      default:
        return O();
    }
}

function Ue(t, e) {
    return void 0 !== (t.values || []).find((t => qe(t, e)));
}

function Ke(t, e) {
    if (t === e) return 0;
    const n = Le(t), s = Le(e);
    if (n !== s) return et(n, s);
    switch (n) {
      case 0 /* TypeOrder.NullValue */ :
      case 9007199254740991 /* TypeOrder.MaxValue */ :
        return 0;

      case 1 /* TypeOrder.BooleanValue */ :
        return et(t.booleanValue, e.booleanValue);

      case 2 /* TypeOrder.NumberValue */ :
        return function(t, e) {
            const n = Ce(t.integerValue || t.doubleValue), s = Ce(e.integerValue || e.doubleValue);
            return n < s ? -1 : n > s ? 1 : n === s ? 0 : 
            // one or both are NaN.
            isNaN(n) ? isNaN(s) ? 0 : -1 : 1;
        }(t, e);

      case 3 /* TypeOrder.TimestampValue */ :
        return Ge(t.timestampValue, e.timestampValue);

      case 4 /* TypeOrder.ServerTimestampValue */ :
        return Ge(Me(t), Me(e));

      case 5 /* TypeOrder.StringValue */ :
        return et(t.stringValue, e.stringValue);

      case 6 /* TypeOrder.BlobValue */ :
        return function(t, e) {
            const n = xe(t), s = xe(e);
            return n.compareTo(s);
        }(t.bytesValue, e.bytesValue);

      case 7 /* TypeOrder.RefValue */ :
        return function(t, e) {
            const n = t.split("/"), s = e.split("/");
            for (let t = 0; t < n.length && t < s.length; t++) {
                const e = et(n[t], s[t]);
                if (0 !== e) return e;
            }
            return et(n.length, s.length);
        }(t.referenceValue, e.referenceValue);

      case 8 /* TypeOrder.GeoPointValue */ :
        return function(t, e) {
            const n = et(Ce(t.latitude), Ce(e.latitude));
            if (0 !== n) return n;
            return et(Ce(t.longitude), Ce(e.longitude));
        }(t.geoPointValue, e.geoPointValue);

      case 9 /* TypeOrder.ArrayValue */ :
        return function(t, e) {
            const n = t.values || [], s = e.values || [];
            for (let t = 0; t < n.length && t < s.length; ++t) {
                const e = Ke(n[t], s[t]);
                if (e) return e;
            }
            return et(n.length, s.length);
        }(t.arrayValue, e.arrayValue);

      case 10 /* TypeOrder.ObjectValue */ :
        return function(t, e) {
            if (t === Fe.mapValue && e === Fe.mapValue) return 0;
            if (t === Fe.mapValue) return 1;
            if (e === Fe.mapValue) return -1;
            const n = t.fields || {}, s = Object.keys(n), i = e.fields || {}, r = Object.keys(i);
            // Even though MapValues are likely sorted correctly based on their insertion
            // order (e.g. when received from the backend), local modifications can bring
            // elements out of order. We need to re-sort the elements to ensure that
            // canonical IDs are independent of insertion order.
            s.sort(), r.sort();
            for (let t = 0; t < s.length && t < r.length; ++t) {
                const e = et(s[t], r[t]);
                if (0 !== e) return e;
                const o = Ke(n[s[t]], i[r[t]]);
                if (0 !== o) return o;
            }
            return et(s.length, r.length);
        }
        /**
 * Generates the canonical ID for the provided field value (as used in Target
 * serialization).
 */ (t.mapValue, e.mapValue);

      default:
        throw O();
    }
}

function Ge(t, e) {
    if ("string" == typeof t && "string" == typeof e && t.length === e.length) return et(t, e);
    const n = De(t), s = De(e), i = et(n.seconds, s.seconds);
    return 0 !== i ? i : et(n.nanos, s.nanos);
}

function Qe(t) {
    return je(t);
}

function je(t) {
    return "nullValue" in t ? "null" : "booleanValue" in t ? "" + t.booleanValue : "integerValue" in t ? "" + t.integerValue : "doubleValue" in t ? "" + t.doubleValue : "timestampValue" in t ? function(t) {
        const e = De(t);
        return `time(${e.seconds},${e.nanos})`;
    }(t.timestampValue) : "stringValue" in t ? t.stringValue : "bytesValue" in t ? xe(t.bytesValue).toBase64() : "referenceValue" in t ? (n = t.referenceValue, 
    ht.fromName(n).toString()) : "geoPointValue" in t ? `geo(${(e = t.geoPointValue).latitude},${e.longitude})` : "arrayValue" in t ? function(t) {
        let e = "[", n = !0;
        for (const s of t.values || []) n ? n = !1 : e += ",", e += je(s);
        return e + "]";
    }
    /**
 * Returns an approximate (and wildly inaccurate) in-memory size for the field
 * value.
 *
 * The memory size takes into account only the actual user data as it resides
 * in memory and ignores object overhead.
 */ (t.arrayValue) : "mapValue" in t ? function(t) {
        // Iteration order in JavaScript is not guaranteed. To ensure that we generate
        // matching canonical IDs for identical maps, we need to sort the keys.
        const e = Object.keys(t.fields || {}).sort();
        let n = "{", s = !0;
        for (const i of e) s ? s = !1 : n += ",", n += `${i}:${je(t.fields[i])}`;
        return n + "}";
    }(t.mapValue) : O();
    var e, n;
}

function ze(t) {
    switch (Le(t)) {
      case 0 /* TypeOrder.NullValue */ :
      case 1 /* TypeOrder.BooleanValue */ :
        return 4;

      case 2 /* TypeOrder.NumberValue */ :
        return 8;

      case 3 /* TypeOrder.TimestampValue */ :
      case 8 /* TypeOrder.GeoPointValue */ :
        // GeoPoints are made up of two distinct numbers (latitude + longitude)
        return 16;

      case 4 /* TypeOrder.ServerTimestampValue */ :
        const e = ke(t);
        return e ? 16 + ze(e) : 16;

      case 5 /* TypeOrder.StringValue */ :
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures:
        // "JavaScript's String type is [...] a set of elements of 16-bit unsigned
        // integer values"
        return 2 * t.stringValue.length;

      case 6 /* TypeOrder.BlobValue */ :
        return xe(t.bytesValue).approximateByteSize();

      case 7 /* TypeOrder.RefValue */ :
        return t.referenceValue.length;

      case 9 /* TypeOrder.ArrayValue */ :
        return (t.arrayValue.values || []).reduce(((t, e) => t + ze(e)), 0);

      case 10 /* TypeOrder.ObjectValue */ :
        return function(t) {
            let e = 0;
            return ge(t.fields, ((t, n) => {
                e += t.length + ze(n);
            })), e;
        }(t.mapValue);

      default:
        throw O();
    }
}

/** Returns a reference value for the provided database and key. */
function We(t, e) {
    return {
        referenceValue: `projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`
    };
}

/** Returns true if `value` is an IntegerValue . */ function He(t) {
    return !!t && "integerValue" in t;
}

/** Returns true if `value` is a DoubleValue. */
/** Returns true if `value` is an ArrayValue. */
function Je(t) {
    return !!t && "arrayValue" in t;
}

/** Returns true if `value` is a NullValue. */ function Ye(t) {
    return !!t && "nullValue" in t;
}

/** Returns true if `value` is NaN. */ function Xe(t) {
    return !!t && "doubleValue" in t && isNaN(Number(t.doubleValue));
}

/** Returns true if `value` is a MapValue. */ function Ze(t) {
    return !!t && "mapValue" in t;
}

/** Creates a deep copy of `source`. */ function tn(t) {
    if (t.geoPointValue) return {
        geoPointValue: Object.assign({}, t.geoPointValue)
    };
    if (t.timestampValue && "object" == typeof t.timestampValue) return {
        timestampValue: Object.assign({}, t.timestampValue)
    };
    if (t.mapValue) {
        const e = {
            mapValue: {
                fields: {}
            }
        };
        return ge(t.mapValue.fields, ((t, n) => e.mapValue.fields[t] = tn(n))), e;
    }
    if (t.arrayValue) {
        const e = {
            arrayValue: {
                values: []
            }
        };
        for (let n = 0; n < (t.arrayValue.values || []).length; ++n) e.arrayValue.values[n] = tn(t.arrayValue.values[n]);
        return e;
    }
    return Object.assign({}, t);
}

/** Returns true if the Value represents the canonical {@link #MAX_VALUE} . */ function en(t) {
    return "__max__" === (((t.mapValue || {}).fields || {}).__type__ || {}).stringValue;
}

/** Returns the lowest value for the given value type (inclusive). */ function nn(t) {
    return "nullValue" in t ? Be : "booleanValue" in t ? {
        booleanValue: !1
    } : "integerValue" in t || "doubleValue" in t ? {
        doubleValue: NaN
    } : "timestampValue" in t ? {
        timestampValue: {
            seconds: Number.MIN_SAFE_INTEGER
        }
    } : "stringValue" in t ? {
        stringValue: ""
    } : "bytesValue" in t ? {
        bytesValue: ""
    } : "referenceValue" in t ? We(Oe.empty(), ht.empty()) : "geoPointValue" in t ? {
        geoPointValue: {
            latitude: -90,
            longitude: -180
        }
    } : "arrayValue" in t ? {
        arrayValue: {}
    } : "mapValue" in t ? {
        mapValue: {}
    } : O();
}

/** Returns the largest value for the given value type (exclusive). */ function sn(t) {
    return "nullValue" in t ? {
        booleanValue: !1
    } : "booleanValue" in t ? {
        doubleValue: NaN
    } : "integerValue" in t || "doubleValue" in t ? {
        timestampValue: {
            seconds: Number.MIN_SAFE_INTEGER
        }
    } : "timestampValue" in t ? {
        stringValue: ""
    } : "stringValue" in t ? {
        bytesValue: ""
    } : "bytesValue" in t ? We(Oe.empty(), ht.empty()) : "referenceValue" in t ? {
        geoPointValue: {
            latitude: -90,
            longitude: -180
        }
    } : "geoPointValue" in t ? {
        arrayValue: {}
    } : "arrayValue" in t ? {
        mapValue: {}
    } : "mapValue" in t ? Fe : O();
}

function rn(t, e) {
    const n = Ke(t.value, e.value);
    return 0 !== n ? n : t.inclusive && !e.inclusive ? -1 : !t.inclusive && e.inclusive ? 1 : 0;
}

function on(t, e) {
    const n = Ke(t.value, e.value);
    return 0 !== n ? n : t.inclusive && !e.inclusive ? 1 : !t.inclusive && e.inclusive ? -1 : 0;
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * An ObjectValue represents a MapValue in the Firestore Proto and offers the
 * ability to add and remove fields (via the ObjectValueBuilder).
 */ class un {
    constructor(t) {
        this.value = t;
    }
    static empty() {
        return new un({
            mapValue: {}
        });
    }
    /**
     * Returns the value at the given path or null.
     *
     * @param path - the path to search
     * @returns The value at the path or null if the path is not set.
     */    field(t) {
        if (t.isEmpty()) return this.value;
        {
            let e = this.value;
            for (let n = 0; n < t.length - 1; ++n) if (e = (e.mapValue.fields || {})[t.get(n)], 
            !Ze(e)) return null;
            return e = (e.mapValue.fields || {})[t.lastSegment()], e || null;
        }
    }
    /**
     * Sets the field to the provided value.
     *
     * @param path - The field path to set.
     * @param value - The value to set.
     */    set(t, e) {
        this.getFieldsMap(t.popLast())[t.lastSegment()] = tn(e);
    }
    /**
     * Sets the provided fields to the provided values.
     *
     * @param data - A map of fields to values (or null for deletes).
     */    setAll(t) {
        let e = at.emptyPath(), n = {}, s = [];
        t.forEach(((t, i) => {
            if (!e.isImmediateParentOf(i)) {
                // Insert the accumulated changes at this parent location
                const t = this.getFieldsMap(e);
                this.applyChanges(t, n, s), n = {}, s = [], e = i.popLast();
            }
            t ? n[i.lastSegment()] = tn(t) : s.push(i.lastSegment());
        }));
        const i = this.getFieldsMap(e);
        this.applyChanges(i, n, s);
    }
    /**
     * Removes the field at the specified path. If there is no field at the
     * specified path, nothing is changed.
     *
     * @param path - The field path to remove.
     */    delete(t) {
        const e = this.field(t.popLast());
        Ze(e) && e.mapValue.fields && delete e.mapValue.fields[t.lastSegment()];
    }
    isEqual(t) {
        return qe(this.value, t.value);
    }
    /**
     * Returns the map that contains the leaf element of `path`. If the parent
     * entry does not yet exist, or if it is not a map, a new map will be created.
     */    getFieldsMap(t) {
        let e = this.value;
        e.mapValue.fields || (e.mapValue = {
            fields: {}
        });
        for (let n = 0; n < t.length; ++n) {
            let s = e.mapValue.fields[t.get(n)];
            Ze(s) && s.mapValue.fields || (s = {
                mapValue: {
                    fields: {}
                }
            }, e.mapValue.fields[t.get(n)] = s), e = s;
        }
        return e.mapValue.fields;
    }
    /**
     * Modifies `fieldsMap` by adding, replacing or deleting the specified
     * entries.
     */    applyChanges(t, e, n) {
        ge(e, ((e, n) => t[e] = n));
        for (const e of n) delete t[e];
    }
    clone() {
        return new un(tn(this.value));
    }
}

/**
 * Returns a FieldMask built from all fields in a MapValue.
 */ function cn(t) {
    const e = [];
    return ge(t.fields, ((t, n) => {
        const s = new at([ t ]);
        if (Ze(n)) {
            const t = cn(n.mapValue).fields;
            if (0 === t.length) 
            // Preserve the empty map by adding it to the FieldMask.
            e.push(s); else 
            // For nested and non-empty ObjectValues, add the FieldPath of the
            // leaf nodes.
            for (const n of t) e.push(s.child(n));
        } else 
        // For nested and non-empty ObjectValues, add the FieldPath of the leaf
        // nodes.
        e.push(s);
    })), new Re(e);
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Represents a document in Firestore with a key, version, data and whether it
 * has local mutations applied to it.
 *
 * Documents can transition between states via `convertToFoundDocument()`,
 * `convertToNoDocument()` and `convertToUnknownDocument()`. If a document does
 * not transition to one of these states even after all mutations have been
 * applied, `isValidDocument()` returns false and the document should be removed
 * from all views.
 */ class an {
    constructor(t, e, n, s, i, r, o) {
        this.key = t, this.documentType = e, this.version = n, this.readTime = s, this.createTime = i, 
        this.data = r, this.documentState = o;
    }
    /**
     * Creates a document with no known version or data, but which can serve as
     * base document for mutations.
     */    static newInvalidDocument(t) {
        return new an(t, 0 /* DocumentType.INVALID */ , 
        /* version */ rt.min(), 
        /* readTime */ rt.min(), 
        /* createTime */ rt.min(), un.empty(), 0 /* DocumentState.SYNCED */);
    }
    /**
     * Creates a new document that is known to exist with the given data at the
     * given version.
     */    static newFoundDocument(t, e, n, s) {
        return new an(t, 1 /* DocumentType.FOUND_DOCUMENT */ , 
        /* version */ e, 
        /* readTime */ rt.min(), 
        /* createTime */ n, s, 0 /* DocumentState.SYNCED */);
    }
    /** Creates a new document that is known to not exist at the given version. */    static newNoDocument(t, e) {
        return new an(t, 2 /* DocumentType.NO_DOCUMENT */ , 
        /* version */ e, 
        /* readTime */ rt.min(), 
        /* createTime */ rt.min(), un.empty(), 0 /* DocumentState.SYNCED */);
    }
    /**
     * Creates a new document that is known to exist at the given version but
     * whose data is not known (e.g. a document that was updated without a known
     * base document).
     */    static newUnknownDocument(t, e) {
        return new an(t, 3 /* DocumentType.UNKNOWN_DOCUMENT */ , 
        /* version */ e, 
        /* readTime */ rt.min(), 
        /* createTime */ rt.min(), un.empty(), 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */);
    }
    /**
     * Changes the document type to indicate that it exists and that its version
     * and data are known.
     */    convertToFoundDocument(t, e) {
        // If a document is switching state from being an invalid or deleted
        // document to a valid (FOUND_DOCUMENT) document, either due to receiving an
        // update from Watch or due to applying a local set mutation on top
        // of a deleted document, our best guess about its createTime would be the
        // version at which the document transitioned to a FOUND_DOCUMENT.
        return !this.createTime.isEqual(rt.min()) || 2 /* DocumentType.NO_DOCUMENT */ !== this.documentType && 0 /* DocumentType.INVALID */ !== this.documentType || (this.createTime = t), 
        this.version = t, this.documentType = 1 /* DocumentType.FOUND_DOCUMENT */ , this.data = e, 
        this.documentState = 0 /* DocumentState.SYNCED */ , this;
    }
    /**
     * Changes the document type to indicate that it doesn't exist at the given
     * version.
     */    convertToNoDocument(t) {
        return this.version = t, this.documentType = 2 /* DocumentType.NO_DOCUMENT */ , 
        this.data = un.empty(), this.documentState = 0 /* DocumentState.SYNCED */ , this;
    }
    /**
     * Changes the document type to indicate that it exists at a given version but
     * that its data is not known (e.g. a document that was updated without a known
     * base document).
     */    convertToUnknownDocument(t) {
        return this.version = t, this.documentType = 3 /* DocumentType.UNKNOWN_DOCUMENT */ , 
        this.data = un.empty(), this.documentState = 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */ , 
        this;
    }
    setHasCommittedMutations() {
        return this.documentState = 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */ , this;
    }
    setHasLocalMutations() {
        return this.documentState = 1 /* DocumentState.HAS_LOCAL_MUTATIONS */ , this.version = rt.min(), 
        this;
    }
    setReadTime(t) {
        return this.readTime = t, this;
    }
    get hasLocalMutations() {
        return 1 /* DocumentState.HAS_LOCAL_MUTATIONS */ === this.documentState;
    }
    get hasCommittedMutations() {
        return 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */ === this.documentState;
    }
    get hasPendingWrites() {
        return this.hasLocalMutations || this.hasCommittedMutations;
    }
    isValidDocument() {
        return 0 /* DocumentType.INVALID */ !== this.documentType;
    }
    isFoundDocument() {
        return 1 /* DocumentType.FOUND_DOCUMENT */ === this.documentType;
    }
    isNoDocument() {
        return 2 /* DocumentType.NO_DOCUMENT */ === this.documentType;
    }
    isUnknownDocument() {
        return 3 /* DocumentType.UNKNOWN_DOCUMENT */ === this.documentType;
    }
    isEqual(t) {
        return t instanceof an && this.key.isEqual(t.key) && this.version.isEqual(t.version) && this.documentType === t.documentType && this.documentState === t.documentState && this.data.isEqual(t.data);
    }
    mutableCopy() {
        return new an(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
    }
    toString() {
        return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
    }
}

/**
 * Compares the value for field `field` in the provided documents. Throws if
 * the field does not exist in both documents.
 */
/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * Represents a bound of a query.
 *
 * The bound is specified with the given components representing a position and
 * whether it's just before or just after the position (relative to whatever the
 * query order is).
 *
 * The position represents a logical index position for a query. It's a prefix
 * of values for the (potentially implicit) order by clauses of a query.
 *
 * Bound provides a function to determine whether a document comes before or
 * after a bound. This is influenced by whether the position is just before or
 * just after the provided values.
 */
class hn {
    constructor(t, e) {
        this.position = t, this.inclusive = e;
    }
}

function ln(t, e, n) {
    let s = 0;
    for (let i = 0; i < t.position.length; i++) {
        const r = e[i], o = t.position[i];
        if (r.field.isKeyField()) s = ht.comparator(ht.fromName(o.referenceValue), n.key); else {
            s = Ke(o, n.data.field(r.field));
        }
        if ("desc" /* Direction.DESCENDING */ === r.dir && (s *= -1), 0 !== s) break;
    }
    return s;
}

/**
 * Returns true if a document sorts after a bound using the provided sort
 * order.
 */ function fn(t, e) {
    if (null === t) return null === e;
    if (null === e) return !1;
    if (t.inclusive !== e.inclusive || t.position.length !== e.position.length) return !1;
    for (let n = 0; n < t.position.length; n++) {
        if (!qe(t.position[n], e.position[n])) return !1;
    }
    return !0;
}

/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * An ordering on a field, in some Direction. Direction defaults to ASCENDING.
 */ class dn {
    constructor(t, e = "asc" /* Direction.ASCENDING */) {
        this.field = t, this.dir = e;
    }
}

function wn(t, e) {
    return t.dir === e.dir && t.field.isEqual(e.field);
}

/**
 * @license
 * Copyright 2022 Google LLC
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
 */ class _n {}

class mn extends _n {
    constructor(t, e, n) {
        super(), this.field = t, this.op = e, this.value = n;
    }
    /**
     * Creates a filter based on the provided arguments.
     */    static create(t, e, n) {
        return t.isKeyField() ? "in" /* Operator.IN */ === e || "not-in" /* Operator.NOT_IN */ === e ? this.createKeyFieldInFilter(t, e, n) : new Pn(t, e, n) : "array-contains" /* Operator.ARRAY_CONTAINS */ === e ? new Dn(t, n) : "in" /* Operator.IN */ === e ? new Cn(t, n) : "not-in" /* Operator.NOT_IN */ === e ? new xn(t, n) : "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ === e ? new Nn(t, n) : new mn(t, e, n);
    }
    static createKeyFieldInFilter(t, e, n) {
        return "in" /* Operator.IN */ === e ? new bn(t, n) : new Vn(t, n);
    }
    matches(t) {
        const e = t.data.field(this.field);
        // Types do not have to match in NOT_EQUAL filters.
                return "!=" /* Operator.NOT_EQUAL */ === this.op ? null !== e && this.matchesComparison(Ke(e, this.value)) : null !== e && Le(this.value) === Le(e) && this.matchesComparison(Ke(e, this.value));
        // Only compare types with matching backend order (such as double and int).
        }
    matchesComparison(t) {
        switch (this.op) {
          case "<" /* Operator.LESS_THAN */ :
            return t < 0;

          case "<=" /* Operator.LESS_THAN_OR_EQUAL */ :
            return t <= 0;

          case "==" /* Operator.EQUAL */ :
            return 0 === t;

          case "!=" /* Operator.NOT_EQUAL */ :
            return 0 !== t;

          case ">" /* Operator.GREATER_THAN */ :
            return t > 0;

          case ">=" /* Operator.GREATER_THAN_OR_EQUAL */ :
            return t >= 0;

          default:
            return O();
        }
    }
    isInequality() {
        return [ "<" /* Operator.LESS_THAN */ , "<=" /* Operator.LESS_THAN_OR_EQUAL */ , ">" /* Operator.GREATER_THAN */ , ">=" /* Operator.GREATER_THAN_OR_EQUAL */ , "!=" /* Operator.NOT_EQUAL */ , "not-in" /* Operator.NOT_IN */ ].indexOf(this.op) >= 0;
    }
    getFlattenedFilters() {
        return [ this ];
    }
    getFilters() {
        return [ this ];
    }
    getFirstInequalityField() {
        return this.isInequality() ? this.field : null;
    }
}

class gn extends _n {
    constructor(t, e) {
        super(), this.filters = t, this.op = e, this.lt = null;
    }
    /**
     * Creates a filter based on the provided arguments.
     */    static create(t, e) {
        return new gn(t, e);
    }
    matches(t) {
        return yn(this) ? void 0 === this.filters.find((e => !e.matches(t))) : void 0 !== this.filters.find((e => e.matches(t)));
    }
    getFlattenedFilters() {
        return null !== this.lt || (this.lt = this.filters.reduce(((t, e) => t.concat(e.getFlattenedFilters())), [])), 
        this.lt;
    }
    // Returns a mutable copy of `this.filters`
    getFilters() {
        return Object.assign([], this.filters);
    }
    getFirstInequalityField() {
        const t = this.ft((t => t.isInequality()));
        return null !== t ? t.field : null;
    }
    // Performs a depth-first search to find and return the first FieldFilter in the composite filter
    // that satisfies the predicate. Returns `null` if none of the FieldFilters satisfy the
    // predicate.
    ft(t) {
        for (const e of this.getFlattenedFilters()) if (t(e)) return e;
        return null;
    }
}

function yn(t) {
    return "and" /* CompositeOperator.AND */ === t.op;
}

function pn(t) {
    return "or" /* CompositeOperator.OR */ === t.op;
}

/**
 * Returns true if this filter is a conjunction of field filters only. Returns false otherwise.
 */ function In(t) {
    return Tn(t) && yn(t);
}

/**
 * Returns true if this filter does not contain any composite filters. Returns false otherwise.
 */ function Tn(t) {
    for (const e of t.filters) if (e instanceof gn) return !1;
    return !0;
}

function En(t) {
    if (t instanceof mn) 
    // TODO(b/29183165): Technically, this won't be unique if two values have
    // the same description, such as the int 3 and the string "3". So we should
    // add the types in here somehow, too.
    return t.field.canonicalString() + t.op.toString() + Qe(t.value);
    if (In(t)) 
    // Older SDK versions use an implicit AND operation between their filters.
    // In the new SDK versions, the developer may use an explicit AND filter.
    // To stay consistent with the old usages, we add a special case to ensure
    // the canonical ID for these two are the same. For example:
    // `col.whereEquals("a", 1).whereEquals("b", 2)` should have the same
    // canonical ID as `col.where(and(equals("a",1), equals("b",2)))`.
    return t.filters.map((t => En(t))).join(",");
    {
        // filter instanceof CompositeFilter
        const e = t.filters.map((t => En(t))).join(",");
        return `${t.op}(${e})`;
    }
}

function An(t, e) {
    return t instanceof mn ? function(t, e) {
        return e instanceof mn && t.op === e.op && t.field.isEqual(e.field) && qe(t.value, e.value);
    }(t, e) : t instanceof gn ? function(t, e) {
        if (e instanceof gn && t.op === e.op && t.filters.length === e.filters.length) {
            return t.filters.reduce(((t, n, s) => t && An(n, e.filters[s])), !0);
        }
        return !1;
    }
    /**
 * Returns a new composite filter that contains all filter from
 * `compositeFilter` plus all the given filters in `otherFilters`.
 */ (t, e) : void O();
}

function vn(t, e) {
    const n = t.filters.concat(e);
    return gn.create(n, t.op);
}

/** Returns a debug description for `filter`. */ function Rn(t) {
    return t instanceof mn ? function(t) {
        return `${t.field.canonicalString()} ${t.op} ${Qe(t.value)}`;
    }
    /** Filter that matches on key fields (i.e. '__name__'). */ (t) : t instanceof gn ? function(t) {
        return t.op.toString() + " {" + t.getFilters().map(Rn).join(" ,") + "}";
    }(t) : "Filter";
}

class Pn extends mn {
    constructor(t, e, n) {
        super(t, e, n), this.key = ht.fromName(n.referenceValue);
    }
    matches(t) {
        const e = ht.comparator(t.key, this.key);
        return this.matchesComparison(e);
    }
}

/** Filter that matches on key fields within an array. */ class bn extends mn {
    constructor(t, e) {
        super(t, "in" /* Operator.IN */ , e), this.keys = Sn("in" /* Operator.IN */ , e);
    }
    matches(t) {
        return this.keys.some((e => e.isEqual(t.key)));
    }
}

/** Filter that matches on key fields not present within an array. */ class Vn extends mn {
    constructor(t, e) {
        super(t, "not-in" /* Operator.NOT_IN */ , e), this.keys = Sn("not-in" /* Operator.NOT_IN */ , e);
    }
    matches(t) {
        return !this.keys.some((e => e.isEqual(t.key)));
    }
}

function Sn(t, e) {
    var n;
    return ((null === (n = e.arrayValue) || void 0 === n ? void 0 : n.values) || []).map((t => ht.fromName(t.referenceValue)));
}

/** A Filter that implements the array-contains operator. */ class Dn extends mn {
    constructor(t, e) {
        super(t, "array-contains" /* Operator.ARRAY_CONTAINS */ , e);
    }
    matches(t) {
        const e = t.data.field(this.field);
        return Je(e) && Ue(e.arrayValue, this.value);
    }
}

/** A Filter that implements the IN operator. */ class Cn extends mn {
    constructor(t, e) {
        super(t, "in" /* Operator.IN */ , e);
    }
    matches(t) {
        const e = t.data.field(this.field);
        return null !== e && Ue(this.value.arrayValue, e);
    }
}

/** A Filter that implements the not-in operator. */ class xn extends mn {
    constructor(t, e) {
        super(t, "not-in" /* Operator.NOT_IN */ , e);
    }
    matches(t) {
        if (Ue(this.value.arrayValue, {
            nullValue: "NULL_VALUE"
        })) return !1;
        const e = t.data.field(this.field);
        return null !== e && !Ue(this.value.arrayValue, e);
    }
}

/** A Filter that implements the array-contains-any operator. */ class Nn extends mn {
    constructor(t, e) {
        super(t, "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ , e);
    }
    matches(t) {
        const e = t.data.field(this.field);
        return !(!Je(e) || !e.arrayValue.values) && e.arrayValue.values.some((t => Ue(this.value.arrayValue, t)));
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
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
// Visible for testing
class kn {
    constructor(t, e = null, n = [], s = [], i = null, r = null, o = null) {
        this.path = t, this.collectionGroup = e, this.orderBy = n, this.filters = s, this.limit = i, 
        this.startAt = r, this.endAt = o, this.dt = null;
    }
}

/**
 * Initializes a Target with a path and optional additional query constraints.
 * Path must currently be empty if this is a collection group query.
 *
 * NOTE: you should always construct `Target` from `Query.toTarget` instead of
 * using this factory method, because `Query` provides an implicit `orderBy`
 * property.
 */ function Mn(t, e = null, n = [], s = [], i = null, r = null, o = null) {
    return new kn(t, e, n, s, i, r, o);
}

function $n(t) {
    const e = L(t);
    if (null === e.dt) {
        let t = e.path.canonicalString();
        null !== e.collectionGroup && (t += "|cg:" + e.collectionGroup), t += "|f:", t += e.filters.map((t => En(t))).join(","), 
        t += "|ob:", t += e.orderBy.map((t => function(t) {
            // TODO(b/29183165): Make this collision robust.
            return t.field.canonicalString() + t.dir;
        }(t))).join(","), Ft(e.limit) || (t += "|l:", t += e.limit), e.startAt && (t += "|lb:", 
        t += e.startAt.inclusive ? "b:" : "a:", t += e.startAt.position.map((t => Qe(t))).join(",")), 
        e.endAt && (t += "|ub:", t += e.endAt.inclusive ? "a:" : "b:", t += e.endAt.position.map((t => Qe(t))).join(",")), 
        e.dt = t;
    }
    return e.dt;
}

function On(t, e) {
    if (t.limit !== e.limit) return !1;
    if (t.orderBy.length !== e.orderBy.length) return !1;
    for (let n = 0; n < t.orderBy.length; n++) if (!wn(t.orderBy[n], e.orderBy[n])) return !1;
    if (t.filters.length !== e.filters.length) return !1;
    for (let n = 0; n < t.filters.length; n++) if (!An(t.filters[n], e.filters[n])) return !1;
    return t.collectionGroup === e.collectionGroup && (!!t.path.isEqual(e.path) && (!!fn(t.startAt, e.startAt) && fn(t.endAt, e.endAt)));
}

function Fn(t) {
    return ht.isDocumentKey(t.path) && null === t.collectionGroup && 0 === t.filters.length;
}

/** Returns the field filters that target the given field path. */ function Bn(t, e) {
    return t.filters.filter((t => t instanceof mn && t.field.isEqual(e)));
}

/**
 * Returns the values that are used in ARRAY_CONTAINS or ARRAY_CONTAINS_ANY
 * filters. Returns `null` if there are no such filters.
 */
/**
 * Returns the value to use as the lower bound for ascending index segment at
 * the provided `fieldPath` (or the upper bound for an descending segment).
 */
function Ln(t, e, n) {
    let s = Be, i = !0;
    // Process all filters to find a value for the current field segment
    for (const n of Bn(t, e)) {
        let t = Be, e = !0;
        switch (n.op) {
          case "<" /* Operator.LESS_THAN */ :
          case "<=" /* Operator.LESS_THAN_OR_EQUAL */ :
            t = nn(n.value);
            break;

          case "==" /* Operator.EQUAL */ :
          case "in" /* Operator.IN */ :
          case ">=" /* Operator.GREATER_THAN_OR_EQUAL */ :
            t = n.value;
            break;

          case ">" /* Operator.GREATER_THAN */ :
            t = n.value, e = !1;
            break;

          case "!=" /* Operator.NOT_EQUAL */ :
          case "not-in" /* Operator.NOT_IN */ :
            t = Be;
 // Remaining filters cannot be used as lower bounds.
                }
        rn({
            value: s,
            inclusive: i
        }, {
            value: t,
            inclusive: e
        }) < 0 && (s = t, i = e);
    }
    // If there is an additional bound, compare the values against the existing
    // range to see if we can narrow the scope.
        if (null !== n) for (let r = 0; r < t.orderBy.length; ++r) {
        if (t.orderBy[r].field.isEqual(e)) {
            const t = n.position[r];
            rn({
                value: s,
                inclusive: i
            }, {
                value: t,
                inclusive: n.inclusive
            }) < 0 && (s = t, i = n.inclusive);
            break;
        }
    }
    return {
        value: s,
        inclusive: i
    };
}

/**
 * Returns the value to use as the upper bound for ascending index segment at
 * the provided `fieldPath` (or the lower bound for a descending segment).
 */ function qn(t, e, n) {
    let s = Fe, i = !0;
    // Process all filters to find a value for the current field segment
    for (const n of Bn(t, e)) {
        let t = Fe, e = !0;
        switch (n.op) {
          case ">=" /* Operator.GREATER_THAN_OR_EQUAL */ :
          case ">" /* Operator.GREATER_THAN */ :
            t = sn(n.value), e = !1;
            break;

          case "==" /* Operator.EQUAL */ :
          case "in" /* Operator.IN */ :
          case "<=" /* Operator.LESS_THAN_OR_EQUAL */ :
            t = n.value;
            break;

          case "<" /* Operator.LESS_THAN */ :
            t = n.value, e = !1;
            break;

          case "!=" /* Operator.NOT_EQUAL */ :
          case "not-in" /* Operator.NOT_IN */ :
            t = Fe;
 // Remaining filters cannot be used as upper bounds.
                }
        on({
            value: s,
            inclusive: i
        }, {
            value: t,
            inclusive: e
        }) > 0 && (s = t, i = e);
    }
    // If there is an additional bound, compare the values against the existing
    // range to see if we can narrow the scope.
        if (null !== n) for (let r = 0; r < t.orderBy.length; ++r) {
        if (t.orderBy[r].field.isEqual(e)) {
            const t = n.position[r];
            on({
                value: s,
                inclusive: i
            }, {
                value: t,
                inclusive: n.inclusive
            }) > 0 && (s = t, i = n.inclusive);
            break;
        }
    }
    return {
        value: s,
        inclusive: i
    };
}

/** Returns the number of segments of a perfect index for this target. */
/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Query encapsulates all the query attributes we support in the SDK. It can
 * be run against the LocalStore, as well as be converted to a `Target` to
 * query the RemoteStore results.
 *
 * Visible for testing.
 */
class Un {
    /**
     * Initializes a Query with a path and optional additional query constraints.
     * Path must currently be empty if this is a collection group query.
     */
    constructor(t, e = null, n = [], s = [], i = null, r = "F" /* LimitType.First */ , o = null, u = null) {
        this.path = t, this.collectionGroup = e, this.explicitOrderBy = n, this.filters = s, 
        this.limit = i, this.limitType = r, this.startAt = o, this.endAt = u, this.wt = null, 
        // The corresponding `Target` of this `Query` instance.
        this._t = null, this.startAt, this.endAt;
    }
}

/** Creates a new Query instance with the options provided. */ function Kn(t, e, n, s, i, r, o, u) {
    return new Un(t, e, n, s, i, r, o, u);
}

/** Creates a new Query for a query that matches all documents at `path` */ function Gn(t) {
    return new Un(t);
}

/**
 * Helper to convert a collection group query into a collection query at a
 * specific path. This is used when executing collection group queries, since
 * we have to split the query into a set of collection queries at multiple
 * paths.
 */
/**
 * Returns true if this query does not specify any query constraints that
 * could remove results.
 */
function Qn(t) {
    return 0 === t.filters.length && null === t.limit && null == t.startAt && null == t.endAt && (0 === t.explicitOrderBy.length || 1 === t.explicitOrderBy.length && t.explicitOrderBy[0].field.isKeyField());
}

function jn(t) {
    return t.explicitOrderBy.length > 0 ? t.explicitOrderBy[0].field : null;
}

function zn(t) {
    for (const e of t.filters) {
        const t = e.getFirstInequalityField();
        if (null !== t) return t;
    }
    return null;
}

/**
 * Creates a new Query for a collection group query that matches all documents
 * within the provided collection group.
 */
/**
 * Returns whether the query matches a collection group rather than a specific
 * collection.
 */
function Wn(t) {
    return null !== t.collectionGroup;
}

/**
 * Returns the implicit order by constraint that is used to execute the Query,
 * which can be different from the order by constraints the user provided (e.g.
 * the SDK and backend always orders by `__name__`).
 */ function Hn(t) {
    const e = L(t);
    if (null === e.wt) {
        e.wt = [];
        const t = zn(e), n = jn(e);
        if (null !== t && null === n) 
        // In order to implicitly add key ordering, we must also add the
        // inequality filter field for it to be a valid query.
        // Note that the default inequality field and key ordering is ascending.
        t.isKeyField() || e.wt.push(new dn(t)), e.wt.push(new dn(at.keyField(), "asc" /* Direction.ASCENDING */)); else {
            let t = !1;
            for (const n of e.explicitOrderBy) e.wt.push(n), n.field.isKeyField() && (t = !0);
            if (!t) {
                // The order of the implicit key ordering always matches the last
                // explicit order by
                const t = e.explicitOrderBy.length > 0 ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir : "asc" /* Direction.ASCENDING */;
                e.wt.push(new dn(at.keyField(), t));
            }
        }
    }
    return e.wt;
}

/**
 * Converts this `Query` instance to it's corresponding `Target` representation.
 */ function Jn(t) {
    const e = L(t);
    if (!e._t) if ("F" /* LimitType.First */ === e.limitType) e._t = Mn(e.path, e.collectionGroup, Hn(e), e.filters, e.limit, e.startAt, e.endAt); else {
        // Flip the orderBy directions since we want the last results
        const t = [];
        for (const n of Hn(e)) {
            const e = "desc" /* Direction.DESCENDING */ === n.dir ? "asc" /* Direction.ASCENDING */ : "desc" /* Direction.DESCENDING */;
            t.push(new dn(n.field, e));
        }
        // We need to swap the cursors to match the now-flipped query ordering.
                const n = e.endAt ? new hn(e.endAt.position, e.endAt.inclusive) : null, s = e.startAt ? new hn(e.startAt.position, e.startAt.inclusive) : null;
        // Now return as a LimitType.First query.
        e._t = Mn(e.path, e.collectionGroup, t, e.filters, e.limit, n, s);
    }
    return e._t;
}

function Yn(t, e) {
    e.getFirstInequalityField(), zn(t);
    const n = t.filters.concat([ e ]);
    return new Un(t.path, t.collectionGroup, t.explicitOrderBy.slice(), n, t.limit, t.limitType, t.startAt, t.endAt);
}

function Xn(t, e, n) {
    return new Un(t.path, t.collectionGroup, t.explicitOrderBy.slice(), t.filters.slice(), e, n, t.startAt, t.endAt);
}

function Zn(t, e) {
    return On(Jn(t), Jn(e)) && t.limitType === e.limitType;
}

// TODO(b/29183165): This is used to get a unique string from a query to, for
// example, use as a dictionary key, but the implementation is subject to
// collisions. Make it collision-free.
function ts(t) {
    return `${$n(Jn(t))}|lt:${t.limitType}`;
}

function es(t) {
    return `Query(target=${function(t) {
        let e = t.path.canonicalString();
        return null !== t.collectionGroup && (e += " collectionGroup=" + t.collectionGroup), 
        t.filters.length > 0 && (e += `, filters: [${t.filters.map((t => Rn(t))).join(", ")}]`), 
        Ft(t.limit) || (e += ", limit: " + t.limit), t.orderBy.length > 0 && (e += `, orderBy: [${t.orderBy.map((t => function(t) {
            return `${t.field.canonicalString()} (${t.dir})`;
        }(t))).join(", ")}]`), t.startAt && (e += ", startAt: ", e += t.startAt.inclusive ? "b:" : "a:", 
        e += t.startAt.position.map((t => Qe(t))).join(",")), t.endAt && (e += ", endAt: ", 
        e += t.endAt.inclusive ? "a:" : "b:", e += t.endAt.position.map((t => Qe(t))).join(",")), 
        `Target(${e})`;
    }(Jn(t))}; limitType=${t.limitType})`;
}

/** Returns whether `doc` matches the constraints of `query`. */ function ns(t, e) {
    return e.isFoundDocument() && function(t, e) {
        const n = e.key.path;
        return null !== t.collectionGroup ? e.key.hasCollectionId(t.collectionGroup) && t.path.isPrefixOf(n) : ht.isDocumentKey(t.path) ? t.path.isEqual(n) : t.path.isImmediateParentOf(n);
    }
    /**
 * A document must have a value for every ordering clause in order to show up
 * in the results.
 */ (t, e) && function(t, e) {
        // We must use `queryOrderBy()` to get the list of all orderBys (both implicit and explicit).
        // Note that for OR queries, orderBy applies to all disjunction terms and implicit orderBys must
        // be taken into account. For example, the query "a > 1 || b==1" has an implicit "orderBy a" due
        // to the inequality, and is evaluated as "a > 1 orderBy a || b==1 orderBy a".
        // A document with content of {b:1} matches the filters, but does not match the orderBy because
        // it's missing the field 'a'.
        for (const n of Hn(t)) 
        // order by key always matches
        if (!n.field.isKeyField() && null === e.data.field(n.field)) return !1;
        return !0;
    }(t, e) && function(t, e) {
        for (const n of t.filters) if (!n.matches(e)) return !1;
        return !0;
    }
    /** Makes sure a document is within the bounds, if provided. */ (t, e) && function(t, e) {
        if (t.startAt && !
        /**
 * Returns true if a document sorts before a bound using the provided sort
 * order.
 */
        function(t, e, n) {
            const s = ln(t, e, n);
            return t.inclusive ? s <= 0 : s < 0;
        }(t.startAt, Hn(t), e)) return !1;
        if (t.endAt && !function(t, e, n) {
            const s = ln(t, e, n);
            return t.inclusive ? s >= 0 : s > 0;
        }(t.endAt, Hn(t), e)) return !1;
        return !0;
    }
    /**
 * Returns the collection group that this query targets.
 *
 * PORTING NOTE: This is only used in the Web SDK to facilitate multi-tab
 * synchronization for query results.
 */ (t, e);
}

function ss(t) {
    return t.collectionGroup || (t.path.length % 2 == 1 ? t.path.lastSegment() : t.path.get(t.path.length - 2));
}

/**
 * Returns a new comparator function that can be used to compare two documents
 * based on the Query's ordering constraint.
 */ function is(t) {
    return (e, n) => {
        let s = !1;
        for (const i of Hn(t)) {
            const t = rs(i, e, n);
            if (0 !== t) return t;
            s = s || i.field.isKeyField();
        }
        return 0;
    };
}

function rs(t, e, n) {
    const s = t.field.isKeyField() ? ht.comparator(e.key, n.key) : function(t, e, n) {
        const s = e.data.field(t), i = n.data.field(t);
        return null !== s && null !== i ? Ke(s, i) : O();
    }(t.field, e, n);
    switch (t.dir) {
      case "asc" /* Direction.ASCENDING */ :
        return s;

      case "desc" /* Direction.DESCENDING */ :
        return -1 * s;

      default:
        return O();
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * A map implementation that uses objects as keys. Objects must have an
 * associated equals function and must be immutable. Entries in the map are
 * stored together with the key being produced from the mapKeyFn. This map
 * automatically handles collisions of keys.
 */ class os {
    constructor(t, e) {
        this.mapKeyFn = t, this.equalsFn = e, 
        /**
         * The inner map for a key/value pair. Due to the possibility of collisions we
         * keep a list of entries that we do a linear search through to find an actual
         * match. Note that collisions should be rare, so we still expect near
         * constant time lookups in practice.
         */
        this.inner = {}, 
        /** The number of entries stored in the map */
        this.innerSize = 0;
    }
    /** Get a value for this key, or undefined if it does not exist. */    get(t) {
        const e = this.mapKeyFn(t), n = this.inner[e];
        if (void 0 !== n) for (const [e, s] of n) if (this.equalsFn(e, t)) return s;
    }
    has(t) {
        return void 0 !== this.get(t);
    }
    /** Put this key and value in the map. */    set(t, e) {
        const n = this.mapKeyFn(t), s = this.inner[n];
        if (void 0 === s) return this.inner[n] = [ [ t, e ] ], void this.innerSize++;
        for (let n = 0; n < s.length; n++) if (this.equalsFn(s[n][0], t)) 
        // This is updating an existing entry and does not increase `innerSize`.
        return void (s[n] = [ t, e ]);
        s.push([ t, e ]), this.innerSize++;
    }
    /**
     * Remove this key from the map. Returns a boolean if anything was deleted.
     */    delete(t) {
        const e = this.mapKeyFn(t), n = this.inner[e];
        if (void 0 === n) return !1;
        for (let s = 0; s < n.length; s++) if (this.equalsFn(n[s][0], t)) return 1 === n.length ? delete this.inner[e] : n.splice(s, 1), 
        this.innerSize--, !0;
        return !1;
    }
    forEach(t) {
        ge(this.inner, ((e, n) => {
            for (const [e, s] of n) t(e, s);
        }));
    }
    isEmpty() {
        return ye(this.inner);
    }
    size() {
        return this.innerSize;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ const us = new pe(ht.comparator);

function cs() {
    return us;
}

const as = new pe(ht.comparator);

function hs(...t) {
    let e = as;
    for (const n of t) e = e.insert(n.key, n);
    return e;
}

function ls(t) {
    let e = as;
    return t.forEach(((t, n) => e = e.insert(t, n.overlayedDocument))), e;
}

function fs() {
    return ws();
}

function ds() {
    return ws();
}

function ws() {
    return new os((t => t.toString()), ((t, e) => t.isEqual(e)));
}

const _s = new pe(ht.comparator);

const ms = new Ee(ht.comparator);

function gs(...t) {
    let e = ms;
    for (const n of t) e = e.add(n);
    return e;
}

const ys = new Ee(et);

function ps() {
    return ys;
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Returns an DoubleValue for `value` that is encoded based the serializer's
 * `useProto3Json` setting.
 */ function Is(t, e) {
    if (t.useProto3Json) {
        if (isNaN(e)) return {
            doubleValue: "NaN"
        };
        if (e === 1 / 0) return {
            doubleValue: "Infinity"
        };
        if (e === -1 / 0) return {
            doubleValue: "-Infinity"
        };
    }
    return {
        doubleValue: Bt(e) ? "-0" : e
    };
}

/**
 * Returns an IntegerValue for `value`.
 */ function Ts(t) {
    return {
        integerValue: "" + t
    };
}

/**
 * Returns a value for a number that's appropriate to put into a proto.
 * The return value is an IntegerValue if it can safely represent the value,
 * otherwise a DoubleValue is returned.
 */ function Es(t, e) {
    return Lt(e) ? Ts(e) : Is(t, e);
}

/**
 * @license
 * Copyright 2018 Google LLC
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
/** Used to represent a field transform on a mutation. */ class As {
    constructor() {
        // Make sure that the structural type of `TransformOperation` is unique.
        // See https://github.com/microsoft/TypeScript/issues/5451
        this._ = void 0;
    }
}

/**
 * Computes the local transform result against the provided `previousValue`,
 * optionally using the provided localWriteTime.
 */ function vs(t, e, n) {
    return t instanceof bs ? function(t, e) {
        const n = {
            fields: {
                __type__: {
                    stringValue: "server_timestamp"
                },
                __local_write_time__: {
                    timestampValue: {
                        seconds: t.seconds,
                        nanos: t.nanoseconds
                    }
                }
            }
        };
        // We should avoid storing deeply nested server timestamp map values
        // because we never use the intermediate "previous values".
        // For example:
        // previous: 42L, add: t1, result: t1 -> 42L
        // previous: t1,  add: t2, result: t2 -> 42L (NOT t2 -> t1 -> 42L)
        // previous: t2,  add: t3, result: t3 -> 42L (NOT t3 -> t2 -> t1 -> 42L)
        // `getPreviousValue` recursively traverses server timestamps to find the
        // least recent Value.
                return e && Ne(e) && (e = ke(e)), e && (n.fields.__previous_value__ = e), 
        {
            mapValue: n
        };
    }(n, e) : t instanceof Vs ? Ss(t, e) : t instanceof Ds ? Cs(t, e) : function(t, e) {
        // PORTING NOTE: Since JavaScript's integer arithmetic is limited to 53 bit
        // precision and resolves overflows by reducing precision, we do not
        // manually cap overflows at 2^63.
        const n = Ps(t, e), s = Ns(n) + Ns(t.gt);
        return He(n) && He(t.gt) ? Ts(s) : Is(t.serializer, s);
    }(t, e);
}

/**
 * Computes a final transform result after the transform has been acknowledged
 * by the server, potentially using the server-provided transformResult.
 */ function Rs(t, e, n) {
    // The server just sends null as the transform result for array operations,
    // so we have to calculate a result the same as we do for local
    // applications.
    return t instanceof Vs ? Ss(t, e) : t instanceof Ds ? Cs(t, e) : n;
}

/**
 * If this transform operation is not idempotent, returns the base value to
 * persist for this transform. If a base value is returned, the transform
 * operation is always applied to this base value, even if document has
 * already been updated.
 *
 * Base values provide consistent behavior for non-idempotent transforms and
 * allow us to return the same latency-compensated value even if the backend
 * has already applied the transform operation. The base value is null for
 * idempotent transforms, as they can be re-played even if the backend has
 * already applied them.
 *
 * @returns a base value to store along with the mutation, or null for
 * idempotent transforms.
 */ function Ps(t, e) {
    return t instanceof xs ? He(n = e) || function(t) {
        return !!t && "doubleValue" in t;
    }
    /** Returns true if `value` is either an IntegerValue or a DoubleValue. */ (n) ? e : {
        integerValue: 0
    } : null;
    var n;
}

/** Transforms a value into a server-generated timestamp. */
class bs extends As {}

/** Transforms an array value via a union operation. */ class Vs extends As {
    constructor(t) {
        super(), this.elements = t;
    }
}

function Ss(t, e) {
    const n = ks(e);
    for (const e of t.elements) n.some((t => qe(t, e))) || n.push(e);
    return {
        arrayValue: {
            values: n
        }
    };
}

/** Transforms an array value via a remove operation. */ class Ds extends As {
    constructor(t) {
        super(), this.elements = t;
    }
}

function Cs(t, e) {
    let n = ks(e);
    for (const e of t.elements) n = n.filter((t => !qe(t, e)));
    return {
        arrayValue: {
            values: n
        }
    };
}

/**
 * Implements the backend semantics for locally computed NUMERIC_ADD (increment)
 * transforms. Converts all field values to integers or doubles, but unlike the
 * backend does not cap integer values at 2^63. Instead, JavaScript number
 * arithmetic is used and precision loss can occur for values greater than 2^53.
 */ class xs extends As {
    constructor(t, e) {
        super(), this.serializer = t, this.gt = e;
    }
}

function Ns(t) {
    return Ce(t.integerValue || t.doubleValue);
}

function ks(t) {
    return Je(t) && t.arrayValue.values ? t.arrayValue.values.slice() : [];
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/** A field path and the TransformOperation to perform upon it. */ class Ms {
    constructor(t, e) {
        this.field = t, this.transform = e;
    }
}

function $s(t, e) {
    return t.field.isEqual(e.field) && function(t, e) {
        return t instanceof Vs && e instanceof Vs || t instanceof Ds && e instanceof Ds ? nt(t.elements, e.elements, qe) : t instanceof xs && e instanceof xs ? qe(t.gt, e.gt) : t instanceof bs && e instanceof bs;
    }(t.transform, e.transform);
}

/** The result of successfully applying a mutation to the backend. */
class Os {
    constructor(
    /**
     * The version at which the mutation was committed:
     *
     * - For most operations, this is the updateTime in the WriteResult.
     * - For deletes, the commitTime of the WriteResponse (because deletes are
     *   not stored and have no updateTime).
     *
     * Note that these versions can be different: No-op writes will not change
     * the updateTime even though the commitTime advances.
     */
    t, 
    /**
     * The resulting fields returned from the backend after a mutation
     * containing field transforms has been committed. Contains one FieldValue
     * for each FieldTransform that was in the mutation.
     *
     * Will be empty if the mutation did not contain any field transforms.
     */
    e) {
        this.version = t, this.transformResults = e;
    }
}

/**
 * Encodes a precondition for a mutation. This follows the model that the
 * backend accepts with the special case of an explicit "empty" precondition
 * (meaning no precondition).
 */ class Fs {
    constructor(t, e) {
        this.updateTime = t, this.exists = e;
    }
    /** Creates a new empty Precondition. */    static none() {
        return new Fs;
    }
    /** Creates a new Precondition with an exists flag. */    static exists(t) {
        return new Fs(void 0, t);
    }
    /** Creates a new Precondition based on a version a document exists at. */    static updateTime(t) {
        return new Fs(t);
    }
    /** Returns whether this Precondition is empty. */    get isNone() {
        return void 0 === this.updateTime && void 0 === this.exists;
    }
    isEqual(t) {
        return this.exists === t.exists && (this.updateTime ? !!t.updateTime && this.updateTime.isEqual(t.updateTime) : !t.updateTime);
    }
}

/** Returns true if the preconditions is valid for the given document. */ function Bs(t, e) {
    return void 0 !== t.updateTime ? e.isFoundDocument() && e.version.isEqual(t.updateTime) : void 0 === t.exists || t.exists === e.isFoundDocument();
}

/**
 * A mutation describes a self-contained change to a document. Mutations can
 * create, replace, delete, and update subsets of documents.
 *
 * Mutations not only act on the value of the document but also its version.
 *
 * For local mutations (mutations that haven't been committed yet), we preserve
 * the existing version for Set and Patch mutations. For Delete mutations, we
 * reset the version to 0.
 *
 * Here's the expected transition table.
 *
 * MUTATION           APPLIED TO            RESULTS IN
 *
 * SetMutation        Document(v3)          Document(v3)
 * SetMutation        NoDocument(v3)        Document(v0)
 * SetMutation        InvalidDocument(v0)   Document(v0)
 * PatchMutation      Document(v3)          Document(v3)
 * PatchMutation      NoDocument(v3)        NoDocument(v3)
 * PatchMutation      InvalidDocument(v0)   UnknownDocument(v3)
 * DeleteMutation     Document(v3)          NoDocument(v0)
 * DeleteMutation     NoDocument(v3)        NoDocument(v0)
 * DeleteMutation     InvalidDocument(v0)   NoDocument(v0)
 *
 * For acknowledged mutations, we use the updateTime of the WriteResponse as
 * the resulting version for Set and Patch mutations. As deletes have no
 * explicit update time, we use the commitTime of the WriteResponse for
 * Delete mutations.
 *
 * If a mutation is acknowledged by the backend but fails the precondition check
 * locally, we transition to an `UnknownDocument` and rely on Watch to send us
 * the updated version.
 *
 * Field transforms are used only with Patch and Set Mutations. We use the
 * `updateTransforms` message to store transforms, rather than the `transforms`s
 * messages.
 *
 * ## Subclassing Notes
 *
 * Every type of mutation needs to implement its own applyToRemoteDocument() and
 * applyToLocalView() to implement the actual behavior of applying the mutation
 * to some source document (see `setMutationApplyToRemoteDocument()` for an
 * example).
 */ class Ls {}

/**
 * A utility method to calculate a `Mutation` representing the overlay from the
 * final state of the document, and a `FieldMask` representing the fields that
 * are mutated by the local mutations.
 */ function qs(t, e) {
    if (!t.hasLocalMutations || e && 0 === e.fields.length) return null;
    // mask is null when sets or deletes are applied to the current document.
        if (null === e) return t.isNoDocument() ? new Ys(t.key, Fs.none()) : new js(t.key, t.data, Fs.none());
    {
        const n = t.data, s = un.empty();
        let i = new Ee(at.comparator);
        for (let t of e.fields) if (!i.has(t)) {
            let e = n.field(t);
            // If we are deleting a nested field, we take the immediate parent as
            // the mask used to construct the resulting mutation.
            // Justification: Nested fields can create parent fields implicitly. If
            // only a leaf entry is deleted in later mutations, the parent field
            // should still remain, but we may have lost this information.
            // Consider mutation (foo.bar 1), then mutation (foo.bar delete()).
            // This leaves the final result (foo, {}). Despite the fact that `doc`
            // has the correct result, `foo` is not in `mask`, and the resulting
            // mutation would miss `foo`.
                        null === e && t.length > 1 && (t = t.popLast(), e = n.field(t)), null === e ? s.delete(t) : s.set(t, e), 
            i = i.add(t);
        }
        return new zs(t.key, s, new Re(i.toArray()), Fs.none());
    }
}

/**
 * Applies this mutation to the given document for the purposes of computing a
 * new remote document. If the input document doesn't match the expected state
 * (e.g. it is invalid or outdated), the document type may transition to
 * unknown.
 *
 * @param mutation - The mutation to apply.
 * @param document - The document to mutate. The input document can be an
 *     invalid document if the client has no knowledge of the pre-mutation state
 *     of the document.
 * @param mutationResult - The result of applying the mutation from the backend.
 */ function Us(t, e, n) {
    t instanceof js ? function(t, e, n) {
        // Unlike setMutationApplyToLocalView, if we're applying a mutation to a
        // remote document the server has accepted the mutation so the precondition
        // must have held.
        const s = t.value.clone(), i = Hs(t.fieldTransforms, e, n.transformResults);
        s.setAll(i), e.convertToFoundDocument(n.version, s).setHasCommittedMutations();
    }(t, e, n) : t instanceof zs ? function(t, e, n) {
        if (!Bs(t.precondition, e)) 
        // Since the mutation was not rejected, we know that the precondition
        // matched on the backend. We therefore must not have the expected version
        // of the document in our cache and convert to an UnknownDocument with a
        // known updateTime.
        return void e.convertToUnknownDocument(n.version);
        const s = Hs(t.fieldTransforms, e, n.transformResults), i = e.data;
        i.setAll(Ws(t)), i.setAll(s), e.convertToFoundDocument(n.version, i).setHasCommittedMutations();
    }(t, e, n) : function(t, e, n) {
        // Unlike applyToLocalView, if we're applying a mutation to a remote
        // document the server has accepted the mutation so the precondition must
        // have held.
        e.convertToNoDocument(n.version).setHasCommittedMutations();
    }(0, e, n);
}

/**
 * Applies this mutation to the given document for the purposes of computing
 * the new local view of a document. If the input document doesn't match the
 * expected state, the document is not modified.
 *
 * @param mutation - The mutation to apply.
 * @param document - The document to mutate. The input document can be an
 *     invalid document if the client has no knowledge of the pre-mutation state
 *     of the document.
 * @param previousMask - The fields that have been updated before applying this mutation.
 * @param localWriteTime - A timestamp indicating the local write time of the
 *     batch this mutation is a part of.
 * @returns A `FieldMask` representing the fields that are changed by applying this mutation.
 */ function Ks(t, e, n, s) {
    return t instanceof js ? function(t, e, n, s) {
        if (!Bs(t.precondition, e)) 
        // The mutation failed to apply (e.g. a document ID created with add()
        // caused a name collision).
        return n;
        const i = t.value.clone(), r = Js(t.fieldTransforms, s, e);
        return i.setAll(r), e.convertToFoundDocument(e.version, i).setHasLocalMutations(), 
        null;
 // SetMutation overwrites all fields.
        }
    /**
 * A mutation that modifies fields of the document at the given key with the
 * given values. The values are applied through a field mask:
 *
 *  * When a field is in both the mask and the values, the corresponding field
 *    is updated.
 *  * When a field is in neither the mask nor the values, the corresponding
 *    field is unmodified.
 *  * When a field is in the mask but not in the values, the corresponding field
 *    is deleted.
 *  * When a field is not in the mask but is in the values, the values map is
 *    ignored.
 */ (t, e, n, s) : t instanceof zs ? function(t, e, n, s) {
        if (!Bs(t.precondition, e)) return n;
        const i = Js(t.fieldTransforms, s, e), r = e.data;
        if (r.setAll(Ws(t)), r.setAll(i), e.convertToFoundDocument(e.version, r).setHasLocalMutations(), 
        null === n) return null;
        return n.unionWith(t.fieldMask.fields).unionWith(t.fieldTransforms.map((t => t.field)));
    }
    /**
 * Returns a FieldPath/Value map with the content of the PatchMutation.
 */ (t, e, n, s) : function(t, e, n) {
        if (Bs(t.precondition, e)) return e.convertToNoDocument(e.version).setHasLocalMutations(), 
        null;
        return n;
    }
    /**
 * A mutation that verifies the existence of the document at the given key with
 * the provided precondition.
 *
 * The `verify` operation is only used in Transactions, and this class serves
 * primarily to facilitate serialization into protos.
 */ (t, e, n);
}

/**
 * If this mutation is not idempotent, returns the base value to persist with
 * this mutation. If a base value is returned, the mutation is always applied
 * to this base value, even if document has already been updated.
 *
 * The base value is a sparse object that consists of only the document
 * fields for which this mutation contains a non-idempotent transformation
 * (e.g. a numeric increment). The provided value guarantees consistent
 * behavior for non-idempotent transforms and allow us to return the same
 * latency-compensated value even if the backend has already applied the
 * mutation. The base value is null for idempotent mutations, as they can be
 * re-played even if the backend has already applied them.
 *
 * @returns a base value to store along with the mutation, or null for
 * idempotent mutations.
 */ function Gs(t, e) {
    let n = null;
    for (const s of t.fieldTransforms) {
        const t = e.data.field(s.field), i = Ps(s.transform, t || null);
        null != i && (null === n && (n = un.empty()), n.set(s.field, i));
    }
    return n || null;
}

function Qs(t, e) {
    return t.type === e.type && (!!t.key.isEqual(e.key) && (!!t.precondition.isEqual(e.precondition) && (!!function(t, e) {
        return void 0 === t && void 0 === e || !(!t || !e) && nt(t, e, ((t, e) => $s(t, e)));
    }(t.fieldTransforms, e.fieldTransforms) && (0 /* MutationType.Set */ === t.type ? t.value.isEqual(e.value) : 1 /* MutationType.Patch */ !== t.type || t.data.isEqual(e.data) && t.fieldMask.isEqual(e.fieldMask)))));
}

/**
 * A mutation that creates or replaces the document at the given key with the
 * object value contents.
 */ class js extends Ls {
    constructor(t, e, n, s = []) {
        super(), this.key = t, this.value = e, this.precondition = n, this.fieldTransforms = s, 
        this.type = 0 /* MutationType.Set */;
    }
    getFieldMask() {
        return null;
    }
}

class zs extends Ls {
    constructor(t, e, n, s, i = []) {
        super(), this.key = t, this.data = e, this.fieldMask = n, this.precondition = s, 
        this.fieldTransforms = i, this.type = 1 /* MutationType.Patch */;
    }
    getFieldMask() {
        return this.fieldMask;
    }
}

function Ws(t) {
    const e = new Map;
    return t.fieldMask.fields.forEach((n => {
        if (!n.isEmpty()) {
            const s = t.data.field(n);
            e.set(n, s);
        }
    })), e;
}

/**
 * Creates a list of "transform results" (a transform result is a field value
 * representing the result of applying a transform) for use after a mutation
 * containing transforms has been acknowledged by the server.
 *
 * @param fieldTransforms - The field transforms to apply the result to.
 * @param mutableDocument - The current state of the document after applying all
 * previous mutations.
 * @param serverTransformResults - The transform results received by the server.
 * @returns The transform results list.
 */ function Hs(t, e, n) {
    const s = new Map;
    F(t.length === n.length);
    for (let i = 0; i < n.length; i++) {
        const r = t[i], o = r.transform, u = e.data.field(r.field);
        s.set(r.field, Rs(o, u, n[i]));
    }
    return s;
}

/**
 * Creates a list of "transform results" (a transform result is a field value
 * representing the result of applying a transform) for use when applying a
 * transform locally.
 *
 * @param fieldTransforms - The field transforms to apply the result to.
 * @param localWriteTime - The local time of the mutation (used to
 *     generate ServerTimestampValues).
 * @param mutableDocument - The document to apply transforms on.
 * @returns The transform results list.
 */ function Js(t, e, n) {
    const s = new Map;
    for (const i of t) {
        const t = i.transform, r = n.data.field(i.field);
        s.set(i.field, vs(t, r, e));
    }
    return s;
}

/** A mutation that deletes the document at the given key. */ class Ys extends Ls {
    constructor(t, e) {
        super(), this.key = t, this.precondition = e, this.type = 2 /* MutationType.Delete */ , 
        this.fieldTransforms = [];
    }
    getFieldMask() {
        return null;
    }
}

class Xs extends Ls {
    constructor(t, e) {
        super(), this.key = t, this.precondition = e, this.type = 3 /* MutationType.Verify */ , 
        this.fieldTransforms = [];
    }
    getFieldMask() {
        return null;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * A batch of mutations that will be sent as one unit to the backend.
 */ class Zs {
    /**
     * @param batchId - The unique ID of this mutation batch.
     * @param localWriteTime - The original write time of this mutation.
     * @param baseMutations - Mutations that are used to populate the base
     * values when this mutation is applied locally. This can be used to locally
     * overwrite values that are persisted in the remote document cache. Base
     * mutations are never sent to the backend.
     * @param mutations - The user-provided mutations in this mutation batch.
     * User-provided mutations are applied both locally and remotely on the
     * backend.
     */
    constructor(t, e, n, s) {
        this.batchId = t, this.localWriteTime = e, this.baseMutations = n, this.mutations = s;
    }
    /**
     * Applies all the mutations in this MutationBatch to the specified document
     * to compute the state of the remote document
     *
     * @param document - The document to apply mutations to.
     * @param batchResult - The result of applying the MutationBatch to the
     * backend.
     */    applyToRemoteDocument(t, e) {
        const n = e.mutationResults;
        for (let e = 0; e < this.mutations.length; e++) {
            const s = this.mutations[e];
            if (s.key.isEqual(t.key)) {
                Us(s, t, n[e]);
            }
        }
    }
    /**
     * Computes the local view of a document given all the mutations in this
     * batch.
     *
     * @param document - The document to apply mutations to.
     * @param mutatedFields - Fields that have been updated before applying this mutation batch.
     * @returns A `FieldMask` representing all the fields that are mutated.
     */    applyToLocalView(t, e) {
        // First, apply the base state. This allows us to apply non-idempotent
        // transform against a consistent set of values.
        for (const n of this.baseMutations) n.key.isEqual(t.key) && (e = Ks(n, t, e, this.localWriteTime));
        // Second, apply all user-provided mutations.
                for (const n of this.mutations) n.key.isEqual(t.key) && (e = Ks(n, t, e, this.localWriteTime));
        return e;
    }
    /**
     * Computes the local view for all provided documents given the mutations in
     * this batch. Returns a `DocumentKey` to `Mutation` map which can be used to
     * replace all the mutation applications.
     */    applyToLocalDocumentSet(t, e) {
        // TODO(mrschmidt): This implementation is O(n^2). If we apply the mutations
        // directly (as done in `applyToLocalView()`), we can reduce the complexity
        // to O(n).
        const n = ds();
        return this.mutations.forEach((s => {
            const i = t.get(s.key), r = i.overlayedDocument;
            // TODO(mutabledocuments): This method should take a MutableDocumentMap
            // and we should remove this cast.
                        let o = this.applyToLocalView(r, i.mutatedFields);
            // Set mutatedFields to null if the document is only from local mutations.
            // This creates a Set or Delete mutation, instead of trying to create a
            // patch mutation as the overlay.
                        o = e.has(s.key) ? null : o;
            const u = qs(r, o);
            null !== u && n.set(s.key, u), r.isValidDocument() || r.convertToNoDocument(rt.min());
        })), n;
    }
    keys() {
        return this.mutations.reduce(((t, e) => t.add(e.key)), gs());
    }
    isEqual(t) {
        return this.batchId === t.batchId && nt(this.mutations, t.mutations, ((t, e) => Qs(t, e))) && nt(this.baseMutations, t.baseMutations, ((t, e) => Qs(t, e)));
    }
}

/** The result of applying a mutation batch to the backend. */ class ti {
    constructor(t, e, n, 
    /**
     * A pre-computed mapping from each mutated document to the resulting
     * version.
     */
    s) {
        this.batch = t, this.commitVersion = e, this.mutationResults = n, this.docVersions = s;
    }
    /**
     * Creates a new MutationBatchResult for the given batch and results. There
     * must be one result for each mutation in the batch. This static factory
     * caches a document=&gt;version mapping (docVersions).
     */    static from(t, e, n) {
        F(t.mutations.length === n.length);
        let s = _s;
        const i = t.mutations;
        for (let t = 0; t < i.length; t++) s = s.insert(i[t].key, n[t].version);
        return new ti(t, e, n, s);
    }
}

/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * Representation of an overlay computed by Firestore.
 *
 * Holds information about a mutation and the largest batch id in Firestore when
 * the mutation was created.
 */ class ei {
    constructor(t, e) {
        this.largestBatchId = t, this.mutation = e;
    }
    getKey() {
        return this.mutation.key;
    }
    isEqual(t) {
        return null !== t && this.mutation === t.mutation;
    }
    toString() {
        return `Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`;
    }
}

/**
 * @license
 * Copyright 2023 Google LLC
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
/**
 * Concrete implementation of the Aggregate type.
 */ class ni {
    constructor(t, e, n) {
        this.alias = t, this.yt = e, this.fieldPath = n;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ class si {
    constructor(t, e) {
        this.count = t, this.unchangedNames = e;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Error Codes describing the different ways GRPC can fail. These are copied
 * directly from GRPC's sources here:
 *
 * https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
 *
 * Important! The names of these identifiers matter because the string forms
 * are used for reverse lookups from the webchannel stream. Do NOT change the
 * names of these identifiers or change this into a const enum.
 */ var ii, ri;

/**
 * Determines whether an error code represents a permanent error when received
 * in response to a non-write operation.
 *
 * See isPermanentWriteError for classifying write errors.
 */
function oi(t) {
    switch (t) {
      default:
        return O();

      case q.CANCELLED:
      case q.UNKNOWN:
      case q.DEADLINE_EXCEEDED:
      case q.RESOURCE_EXHAUSTED:
      case q.INTERNAL:
      case q.UNAVAILABLE:
 // Unauthenticated means something went wrong with our token and we need
        // to retry with new credentials which will happen automatically.
              case q.UNAUTHENTICATED:
        return !1;

      case q.INVALID_ARGUMENT:
      case q.NOT_FOUND:
      case q.ALREADY_EXISTS:
      case q.PERMISSION_DENIED:
      case q.FAILED_PRECONDITION:
 // Aborted might be retried in some scenarios, but that is dependant on
        // the context and should handled individually by the calling code.
        // See https://cloud.google.com/apis/design/errors.
              case q.ABORTED:
      case q.OUT_OF_RANGE:
      case q.UNIMPLEMENTED:
      case q.DATA_LOSS:
        return !0;
    }
}

/**
 * Determines whether an error code represents a permanent error when received
 * in response to a write operation.
 *
 * Write operations must be handled specially because as of b/119437764, ABORTED
 * errors on the write stream should be retried too (even though ABORTED errors
 * are not generally retryable).
 *
 * Note that during the initial handshake on the write stream an ABORTED error
 * signals that we should discard our stream token (i.e. it is permanent). This
 * means a handshake error should be classified with isPermanentError, above.
 */
/**
 * Maps an error Code from GRPC status code number, like 0, 1, or 14. These
 * are not the same as HTTP status codes.
 *
 * @returns The Code equivalent to the given GRPC status code. Fails if there
 *     is no match.
 */
function ui(t) {
    if (void 0 === t) 
    // This shouldn't normally happen, but in certain error cases (like trying
    // to send invalid proto messages) we may get an error with no GRPC code.
    return k("GRPC error has no .code"), q.UNKNOWN;
    switch (t) {
      case ii.OK:
        return q.OK;

      case ii.CANCELLED:
        return q.CANCELLED;

      case ii.UNKNOWN:
        return q.UNKNOWN;

      case ii.DEADLINE_EXCEEDED:
        return q.DEADLINE_EXCEEDED;

      case ii.RESOURCE_EXHAUSTED:
        return q.RESOURCE_EXHAUSTED;

      case ii.INTERNAL:
        return q.INTERNAL;

      case ii.UNAVAILABLE:
        return q.UNAVAILABLE;

      case ii.UNAUTHENTICATED:
        return q.UNAUTHENTICATED;

      case ii.INVALID_ARGUMENT:
        return q.INVALID_ARGUMENT;

      case ii.NOT_FOUND:
        return q.NOT_FOUND;

      case ii.ALREADY_EXISTS:
        return q.ALREADY_EXISTS;

      case ii.PERMISSION_DENIED:
        return q.PERMISSION_DENIED;

      case ii.FAILED_PRECONDITION:
        return q.FAILED_PRECONDITION;

      case ii.ABORTED:
        return q.ABORTED;

      case ii.OUT_OF_RANGE:
        return q.OUT_OF_RANGE;

      case ii.UNIMPLEMENTED:
        return q.UNIMPLEMENTED;

      case ii.DATA_LOSS:
        return q.DATA_LOSS;

      default:
        return O();
    }
}

/**
 * Converts an HTTP response's error status to the equivalent error code.
 *
 * @param status - An HTTP error response status ("FAILED_PRECONDITION",
 * "UNKNOWN", etc.)
 * @returns The equivalent Code. Non-matching responses are mapped to
 *     Code.UNKNOWN.
 */ (ri = ii || (ii = {}))[ri.OK = 0] = "OK", ri[ri.CANCELLED = 1] = "CANCELLED", 
ri[ri.UNKNOWN = 2] = "UNKNOWN", ri[ri.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", 
ri[ri.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", ri[ri.NOT_FOUND = 5] = "NOT_FOUND", 
ri[ri.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", ri[ri.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", 
ri[ri.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", ri[ri.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", 
ri[ri.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", ri[ri.ABORTED = 10] = "ABORTED", 
ri[ri.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", ri[ri.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", 
ri[ri.INTERNAL = 13] = "INTERNAL", ri[ri.UNAVAILABLE = 14] = "UNAVAILABLE", ri[ri.DATA_LOSS = 15] = "DATA_LOSS";

/**
 * @license
 * Copyright 2023 Google LLC
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
/**
 * Manages "testing hooks", hooks into the internals of the SDK to verify
 * internal state and events during integration tests. Do not use this class
 * except for testing purposes.
 *
 * There are two ways to retrieve the global singleton instance of this class:
 * 1. The `instance` property, which returns null if the global singleton
 *      instance has not been created. Use this property if the caller should
 *      "do nothing" if there are no testing hooks registered, such as when
 *      delivering an event to notify registered callbacks.
 * 2. The `getOrCreateInstance()` method, which creates the global singleton
 *      instance if it has not been created. Use this method if the instance is
 *      needed to, for example, register a callback.
 *
 * @internal
 */
class ci {
    constructor() {
        this.onExistenceFilterMismatchCallbacks = new Map;
    }
    /**
     * Returns the singleton instance of this class, or null if it has not been
     * initialized.
     */    static get instance() {
        return ai;
    }
    /**
     * Returns the singleton instance of this class, creating it if is has never
     * been created before.
     */    static getOrCreateInstance() {
        return null === ai && (ai = new ci), ai;
    }
    /**
     * Registers a callback to be notified when an existence filter mismatch
     * occurs in the Watch listen stream.
     *
     * The relative order in which callbacks are notified is unspecified; do not
     * rely on any particular ordering. If a given callback is registered multiple
     * times then it will be notified multiple times, once per registration.
     *
     * @param callback the callback to invoke upon existence filter mismatch.
     *
     * @return a function that, when called, unregisters the given callback; only
     * the first invocation of the returned function does anything; all subsequent
     * invocations do nothing.
     */    onExistenceFilterMismatch(t) {
        const e = Symbol();
        return this.onExistenceFilterMismatchCallbacks.set(e, t), () => this.onExistenceFilterMismatchCallbacks.delete(e);
    }
    /**
     * Invokes all currently-registered `onExistenceFilterMismatch` callbacks.
     * @param info Information about the existence filter mismatch.
     */    notifyOnExistenceFilterMismatch(t) {
        this.onExistenceFilterMismatchCallbacks.forEach((e => e(t)));
    }
}

/** The global singleton instance of `TestingHooks`. */ let ai = null;

/**
 * @license
 * Copyright 2023 Google LLC
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
/**
 * An instance of the Platform's 'TextEncoder' implementation.
 */ function hi() {
    return new TextEncoder;
}

/**
 * An instance of the Platform's 'TextDecoder' implementation.
 */
/**
 * @license
 * Copyright 2022 Google LLC
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
const li = new webchannelWrapper.Integer([ 4294967295, 4294967295 ], 0);

// Hash a string using md5 hashing algorithm.
function fi(t) {
    const e = hi().encode(t), n = new webchannelWrapper.Md5;
    return n.update(e), new Uint8Array(n.digest());
}

// Interpret the 16 bytes array as two 64-bit unsigned integers, encoded using
// 2’s complement using little endian.
function di(t) {
    const e = new DataView(t.buffer), n = e.getUint32(0, /* littleEndian= */ !0), s = e.getUint32(4, /* littleEndian= */ !0), i = e.getUint32(8, /* littleEndian= */ !0), r = e.getUint32(12, /* littleEndian= */ !0);
    return [ new webchannelWrapper.Integer([ n, s ], 0), new webchannelWrapper.Integer([ i, r ], 0) ];
}

class wi {
    constructor(t, e, n) {
        if (this.bitmap = t, this.padding = e, this.hashCount = n, e < 0 || e >= 8) throw new _i(`Invalid padding: ${e}`);
        if (n < 0) throw new _i(`Invalid hash count: ${n}`);
        if (t.length > 0 && 0 === this.hashCount) 
        // Only empty bloom filter can have 0 hash count.
        throw new _i(`Invalid hash count: ${n}`);
        if (0 === t.length && 0 !== e) 
        // Empty bloom filter should have 0 padding.
        throw new _i(`Invalid padding when bitmap length is 0: ${e}`);
        this.It = 8 * t.length - e, 
        // Set the bit count in Integer to avoid repetition in mightContain().
        this.Tt = webchannelWrapper.Integer.fromNumber(this.It);
    }
    // Calculate the ith hash value based on the hashed 64bit integers,
    // and calculate its corresponding bit index in the bitmap to be checked.
    Et(t, e, n) {
        // Calculate hashed value h(i) = h1 + (i * h2).
        let s = t.add(e.multiply(webchannelWrapper.Integer.fromNumber(n)));
        // Wrap if hash value overflow 64bit.
                return 1 === s.compare(li) && (s = new webchannelWrapper.Integer([ s.getBits(0), s.getBits(1) ], 0)), 
        s.modulo(this.Tt).toNumber();
    }
    // Return whether the bit on the given index in the bitmap is set to 1.
    At(t) {
        return 0 != (this.bitmap[Math.floor(t / 8)] & 1 << t % 8);
    }
    vt(t) {
        // Empty bitmap should always return false on membership check.
        if (0 === this.It) return !1;
        const e = fi(t), [n, s] = di(e);
        for (let t = 0; t < this.hashCount; t++) {
            const e = this.Et(n, s, t);
            if (!this.At(e)) return !1;
        }
        return !0;
    }
    /** Create bloom filter for testing purposes only. */    static create(t, e, n) {
        const s = t % 8 == 0 ? 0 : 8 - t % 8, i = new Uint8Array(Math.ceil(t / 8)), r = new wi(i, s, e);
        return n.forEach((t => r.insert(t))), r;
    }
    insert(t) {
        if (0 === this.It) return;
        const e = fi(t), [n, s] = di(e);
        for (let t = 0; t < this.hashCount; t++) {
            const e = this.Et(n, s, t);
            this.Rt(e);
        }
    }
    Rt(t) {
        const e = Math.floor(t / 8), n = t % 8;
        this.bitmap[e] |= 1 << n;
    }
}

class _i extends Error {
    constructor() {
        super(...arguments), this.name = "BloomFilterError";
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * An event from the RemoteStore. It is split into targetChanges (changes to the
 * state or the set of documents in our watched targets) and documentUpdates
 * (changes to the actual documents).
 */ class mi {
    constructor(
    /**
     * The snapshot version this event brings us up to, or MIN if not set.
     */
    t, 
    /**
     * A map from target to changes to the target. See TargetChange.
     */
    e, 
    /**
     * A map of targets that is known to be inconsistent, and the purpose for
     * re-listening. Listens for these targets should be re-established without
     * resume tokens.
     */
    n, 
    /**
     * A set of which documents have changed or been deleted, along with the
     * doc's new values (if not deleted).
     */
    s, 
    /**
     * A set of which document updates are due only to limbo resolution targets.
     */
    i) {
        this.snapshotVersion = t, this.targetChanges = e, this.targetMismatches = n, this.documentUpdates = s, 
        this.resolvedLimboDocuments = i;
    }
    /**
     * HACK: Views require RemoteEvents in order to determine whether the view is
     * CURRENT, but secondary tabs don't receive remote events. So this method is
     * used to create a synthesized RemoteEvent that can be used to apply a
     * CURRENT status change to a View, for queries executed in a different tab.
     */
    // PORTING NOTE: Multi-tab only
    static createSynthesizedRemoteEventForCurrentChange(t, e, n) {
        const s = new Map;
        return s.set(t, gi.createSynthesizedTargetChangeForCurrentChange(t, e, n)), new mi(rt.min(), s, new pe(et), cs(), gs());
    }
}

/**
 * A TargetChange specifies the set of changes for a specific target as part of
 * a RemoteEvent. These changes track which documents are added, modified or
 * removed, as well as the target's resume token and whether the target is
 * marked CURRENT.
 * The actual changes *to* documents are not part of the TargetChange since
 * documents may be part of multiple targets.
 */ class gi {
    constructor(
    /**
     * An opaque, server-assigned token that allows watching a query to be resumed
     * after disconnecting without retransmitting all the data that matches the
     * query. The resume token essentially identifies a point in time from which
     * the server should resume sending results.
     */
    t, 
    /**
     * The "current" (synced) status of this target. Note that "current"
     * has special meaning in the RPC protocol that implies that a target is
     * both up-to-date and consistent with the rest of the watch stream.
     */
    e, 
    /**
     * The set of documents that were newly assigned to this target as part of
     * this remote event.
     */
    n, 
    /**
     * The set of documents that were already assigned to this target but received
     * an update during this remote event.
     */
    s, 
    /**
     * The set of documents that were removed from this target as part of this
     * remote event.
     */
    i) {
        this.resumeToken = t, this.current = e, this.addedDocuments = n, this.modifiedDocuments = s, 
        this.removedDocuments = i;
    }
    /**
     * This method is used to create a synthesized TargetChanges that can be used to
     * apply a CURRENT status change to a View (for queries executed in a different
     * tab) or for new queries (to raise snapshots with correct CURRENT status).
     */    static createSynthesizedTargetChangeForCurrentChange(t, e, n) {
        return new gi(n, e, gs(), gs(), gs());
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Represents a changed document and a list of target ids to which this change
 * applies.
 *
 * If document has been deleted NoDocument will be provided.
 */ class yi {
    constructor(
    /** The new document applies to all of these targets. */
    t, 
    /** The new document is removed from all of these targets. */
    e, 
    /** The key of the document for this change. */
    n, 
    /**
     * The new document or NoDocument if it was deleted. Is null if the
     * document went out of view without the server sending a new document.
     */
    s) {
        this.Pt = t, this.removedTargetIds = e, this.key = n, this.bt = s;
    }
}

class pi {
    constructor(t, e) {
        this.targetId = t, this.Vt = e;
    }
}

class Ii {
    constructor(
    /** What kind of change occurred to the watch target. */
    t, 
    /** The target IDs that were added/removed/set. */
    e, 
    /**
     * An opaque, server-assigned token that allows watching a target to be
     * resumed after disconnecting without retransmitting all the data that
     * matches the target. The resume token essentially identifies a point in
     * time from which the server should resume sending results.
     */
    n = Ve.EMPTY_BYTE_STRING
    /** An RPC error indicating why the watch failed. */ , s = null) {
        this.state = t, this.targetIds = e, this.resumeToken = n, this.cause = s;
    }
}

/** Tracks the internal state of a Watch target. */ class Ti {
    constructor() {
        /**
         * The number of pending responses (adds or removes) that we are waiting on.
         * We only consider targets active that have no pending responses.
         */
        this.St = 0, 
        /**
         * Keeps track of the document changes since the last raised snapshot.
         *
         * These changes are continuously updated as we receive document updates and
         * always reflect the current set of changes against the last issued snapshot.
         */
        this.Dt = vi(), 
        /** See public getters for explanations of these fields. */
        this.Ct = Ve.EMPTY_BYTE_STRING, this.xt = !1, 
        /**
         * Whether this target state should be included in the next snapshot. We
         * initialize to true so that newly-added targets are included in the next
         * RemoteEvent.
         */
        this.Nt = !0;
    }
    /**
     * Whether this target has been marked 'current'.
     *
     * 'Current' has special meaning in the RPC protocol: It implies that the
     * Watch backend has sent us all changes up to the point at which the target
     * was added and that the target is consistent with the rest of the watch
     * stream.
     */    get current() {
        return this.xt;
    }
    /** The last resume token sent to us for this target. */    get resumeToken() {
        return this.Ct;
    }
    /** Whether this target has pending target adds or target removes. */    get kt() {
        return 0 !== this.St;
    }
    /** Whether we have modified any state that should trigger a snapshot. */    get Mt() {
        return this.Nt;
    }
    /**
     * Applies the resume token to the TargetChange, but only when it has a new
     * value. Empty resumeTokens are discarded.
     */    $t(t) {
        t.approximateByteSize() > 0 && (this.Nt = !0, this.Ct = t);
    }
    /**
     * Creates a target change from the current set of changes.
     *
     * To reset the document changes after raising this snapshot, call
     * `clearPendingChanges()`.
     */    Ot() {
        let t = gs(), e = gs(), n = gs();
        return this.Dt.forEach(((s, i) => {
            switch (i) {
              case 0 /* ChangeType.Added */ :
                t = t.add(s);
                break;

              case 2 /* ChangeType.Modified */ :
                e = e.add(s);
                break;

              case 1 /* ChangeType.Removed */ :
                n = n.add(s);
                break;

              default:
                O();
            }
        })), new gi(this.Ct, this.xt, t, e, n);
    }
    /**
     * Resets the document changes and sets `hasPendingChanges` to false.
     */    Ft() {
        this.Nt = !1, this.Dt = vi();
    }
    Bt(t, e) {
        this.Nt = !0, this.Dt = this.Dt.insert(t, e);
    }
    Lt(t) {
        this.Nt = !0, this.Dt = this.Dt.remove(t);
    }
    qt() {
        this.St += 1;
    }
    Ut() {
        this.St -= 1;
    }
    Kt() {
        this.Nt = !0, this.xt = !0;
    }
}

/**
 * A helper class to accumulate watch changes into a RemoteEvent.
 */
class Ei {
    constructor(t) {
        this.Gt = t, 
        /** The internal state of all tracked targets. */
        this.Qt = new Map, 
        /** Keeps track of the documents to update since the last raised snapshot. */
        this.jt = cs(), 
        /** A mapping of document keys to their set of target IDs. */
        this.zt = Ai(), 
        /**
         * A map of targets with existence filter mismatches. These targets are
         * known to be inconsistent and their listens needs to be re-established by
         * RemoteStore.
         */
        this.Wt = new pe(et);
    }
    /**
     * Processes and adds the DocumentWatchChange to the current set of changes.
     */    Ht(t) {
        for (const e of t.Pt) t.bt && t.bt.isFoundDocument() ? this.Jt(e, t.bt) : this.Yt(e, t.key, t.bt);
        for (const e of t.removedTargetIds) this.Yt(e, t.key, t.bt);
    }
    /** Processes and adds the WatchTargetChange to the current set of changes. */    Xt(t) {
        this.forEachTarget(t, (e => {
            const n = this.Zt(e);
            switch (t.state) {
              case 0 /* WatchTargetChangeState.NoChange */ :
                this.te(e) && n.$t(t.resumeToken);
                break;

              case 1 /* WatchTargetChangeState.Added */ :
                // We need to decrement the number of pending acks needed from watch
                // for this targetId.
                n.Ut(), n.kt || 
                // We have a freshly added target, so we need to reset any state
                // that we had previously. This can happen e.g. when remove and add
                // back a target for existence filter mismatches.
                n.Ft(), n.$t(t.resumeToken);
                break;

              case 2 /* WatchTargetChangeState.Removed */ :
                // We need to keep track of removed targets to we can post-filter and
                // remove any target changes.
                // We need to decrement the number of pending acks needed from watch
                // for this targetId.
                n.Ut(), n.kt || this.removeTarget(e);
                break;

              case 3 /* WatchTargetChangeState.Current */ :
                this.te(e) && (n.Kt(), n.$t(t.resumeToken));
                break;

              case 4 /* WatchTargetChangeState.Reset */ :
                this.te(e) && (
                // Reset the target and synthesizes removes for all existing
                // documents. The backend will re-add any documents that still
                // match the target before it sends the next global snapshot.
                this.ee(e), n.$t(t.resumeToken));
                break;

              default:
                O();
            }
        }));
    }
    /**
     * Iterates over all targetIds that the watch change applies to: either the
     * targetIds explicitly listed in the change or the targetIds of all currently
     * active targets.
     */    forEachTarget(t, e) {
        t.targetIds.length > 0 ? t.targetIds.forEach(e) : this.Qt.forEach(((t, n) => {
            this.te(n) && e(n);
        }));
    }
    /**
     * Handles existence filters and synthesizes deletes for filter mismatches.
     * Targets that are invalidated by filter mismatches are added to
     * `pendingTargetResets`.
     */    ne(t) {
        var e;
        const n = t.targetId, s = t.Vt.count, i = this.se(n);
        if (i) {
            const r = i.target;
            if (Fn(r)) if (0 === s) {
                // The existence filter told us the document does not exist. We deduce
                // that this document does not exist and apply a deleted document to
                // our updates. Without applying this deleted document there might be
                // another query that will raise this document as part of a snapshot
                // until it is resolved, essentially exposing inconsistency between
                // queries.
                const t = new ht(r.path);
                this.Yt(n, t, an.newNoDocument(t, rt.min()));
            } else F(1 === s); else {
                const i = this.ie(n);
                // Existence filter mismatch. Mark the documents as being in limbo, and
                // raise a snapshot with `isFromCache:true`.
                                if (i !== s) {
                    // Apply bloom filter to identify and mark removed documents.
                    const s = this.re(t, i);
                    if (0 /* BloomFilterApplicationStatus.Success */ !== s) {
                        // If bloom filter application fails, we reset the mapping and
                        // trigger re-run of the query.
                        this.ee(n);
                        const t = 2 /* BloomFilterApplicationStatus.FalsePositive */ === s ? "TargetPurposeExistenceFilterMismatchBloom" /* TargetPurpose.ExistenceFilterMismatchBloom */ : "TargetPurposeExistenceFilterMismatch" /* TargetPurpose.ExistenceFilterMismatch */;
                        this.Wt = this.Wt.insert(n, t);
                    }
                    null === (e = ci.instance) || void 0 === e || e.notifyOnExistenceFilterMismatch(function(t, e, n) {
                        var s, i, r, o, u, c;
                        const a = {
                            localCacheCount: e,
                            existenceFilterCount: n.count
                        }, h = n.unchangedNames;
                        h && (a.bloomFilter = {
                            applied: 0 /* BloomFilterApplicationStatus.Success */ === t,
                            hashCount: null !== (s = null == h ? void 0 : h.hashCount) && void 0 !== s ? s : 0,
                            bitmapLength: null !== (o = null === (r = null === (i = null == h ? void 0 : h.bits) || void 0 === i ? void 0 : i.bitmap) || void 0 === r ? void 0 : r.length) && void 0 !== o ? o : 0,
                            padding: null !== (c = null === (u = null == h ? void 0 : h.bits) || void 0 === u ? void 0 : u.padding) && void 0 !== c ? c : 0
                        });
                        return a;
                    }
                    /**
 * @license
 * Copyright 2017 Google LLC
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
 */ (s, i, t.Vt));
                }
            }
        }
    }
    /**
     * Apply bloom filter to remove the deleted documents, and return the
     * application status.
     */    re(t, e) {
        const {unchangedNames: n, count: s} = t.Vt;
        if (!n || !n.bits) return 1 /* BloomFilterApplicationStatus.Skipped */;
        const {bits: {bitmap: i = "", padding: r = 0}, hashCount: o = 0} = n;
        let u, c;
        try {
            u = xe(i).toUint8Array();
        } catch (t) {
            if (t instanceof Pe) return M("Decoding the base64 bloom filter in existence filter failed (" + t.message + "); ignoring the bloom filter and falling back to full re-query."), 
            1 /* BloomFilterApplicationStatus.Skipped */;
            throw t;
        }
        try {
            // BloomFilter throws error if the inputs are invalid.
            c = new wi(u, r, o);
        } catch (t) {
            return M(t instanceof _i ? "BloomFilter error: " : "Applying bloom filter failed: ", t), 
            1 /* BloomFilterApplicationStatus.Skipped */;
        }
        if (0 === c.It) return 1 /* BloomFilterApplicationStatus.Skipped */;
        return s !== e - this.oe(t.targetId, c) ? 2 /* BloomFilterApplicationStatus.FalsePositive */ : 0 /* BloomFilterApplicationStatus.Success */;
    }
    /**
     * Filter out removed documents based on bloom filter membership result and
     * return number of documents removed.
     */    oe(t, e) {
        const n = this.Gt.getRemoteKeysForTarget(t);
        let s = 0;
        return n.forEach((n => {
            const i = this.Gt.ue(), r = `projects/${i.projectId}/databases/${i.database}/documents/${n.path.canonicalString()}`;
            e.vt(r) || (this.Yt(t, n, /*updatedDocument=*/ null), s++);
        })), s;
    }
    /**
     * Converts the currently accumulated state into a remote event at the
     * provided snapshot version. Resets the accumulated changes before returning.
     */    ce(t) {
        const e = new Map;
        this.Qt.forEach(((n, s) => {
            const i = this.se(s);
            if (i) {
                if (n.current && Fn(i.target)) {
                    // Document queries for document that don't exist can produce an empty
                    // result set. To update our local cache, we synthesize a document
                    // delete if we have not previously received the document. This
                    // resolves the limbo state of the document, removing it from
                    // limboDocumentRefs.
                    // TODO(dimond): Ideally we would have an explicit lookup target
                    // instead resulting in an explicit delete message and we could
                    // remove this special logic.
                    const e = new ht(i.target.path);
                    null !== this.jt.get(e) || this.ae(s, e) || this.Yt(s, e, an.newNoDocument(e, t));
                }
                n.Mt && (e.set(s, n.Ot()), n.Ft());
            }
        }));
        let n = gs();
        // We extract the set of limbo-only document updates as the GC logic
        // special-cases documents that do not appear in the target cache.
        
        // TODO(gsoltis): Expand on this comment once GC is available in the JS
        // client.
                this.zt.forEach(((t, e) => {
            let s = !0;
            e.forEachWhile((t => {
                const e = this.se(t);
                return !e || "TargetPurposeLimboResolution" /* TargetPurpose.LimboResolution */ === e.purpose || (s = !1, 
                !1);
            })), s && (n = n.add(t));
        })), this.jt.forEach(((e, n) => n.setReadTime(t)));
        const s = new mi(t, e, this.Wt, this.jt, n);
        return this.jt = cs(), this.zt = Ai(), this.Wt = new pe(et), s;
    }
    /**
     * Adds the provided document to the internal list of document updates and
     * its document key to the given target's mapping.
     */
    // Visible for testing.
    Jt(t, e) {
        if (!this.te(t)) return;
        const n = this.ae(t, e.key) ? 2 /* ChangeType.Modified */ : 0 /* ChangeType.Added */;
        this.Zt(t).Bt(e.key, n), this.jt = this.jt.insert(e.key, e), this.zt = this.zt.insert(e.key, this.he(e.key).add(t));
    }
    /**
     * Removes the provided document from the target mapping. If the
     * document no longer matches the target, but the document's state is still
     * known (e.g. we know that the document was deleted or we received the change
     * that caused the filter mismatch), the new document can be provided
     * to update the remote document cache.
     */
    // Visible for testing.
    Yt(t, e, n) {
        if (!this.te(t)) return;
        const s = this.Zt(t);
        this.ae(t, e) ? s.Bt(e, 1 /* ChangeType.Removed */) : 
        // The document may have entered and left the target before we raised a
        // snapshot, so we can just ignore the change.
        s.Lt(e), this.zt = this.zt.insert(e, this.he(e).delete(t)), n && (this.jt = this.jt.insert(e, n));
    }
    removeTarget(t) {
        this.Qt.delete(t);
    }
    /**
     * Returns the current count of documents in the target. This includes both
     * the number of documents that the LocalStore considers to be part of the
     * target as well as any accumulated changes.
     */    ie(t) {
        const e = this.Zt(t).Ot();
        return this.Gt.getRemoteKeysForTarget(t).size + e.addedDocuments.size - e.removedDocuments.size;
    }
    /**
     * Increment the number of acks needed from watch before we can consider the
     * server to be 'in-sync' with the client's active targets.
     */    qt(t) {
        this.Zt(t).qt();
    }
    Zt(t) {
        let e = this.Qt.get(t);
        return e || (e = new Ti, this.Qt.set(t, e)), e;
    }
    he(t) {
        let e = this.zt.get(t);
        return e || (e = new Ee(et), this.zt = this.zt.insert(t, e)), e;
    }
    /**
     * Verifies that the user is still interested in this target (by calling
     * `getTargetDataForTarget()`) and that we are not waiting for pending ADDs
     * from watch.
     */    te(t) {
        const e = null !== this.se(t);
        return e || N("WatchChangeAggregator", "Detected inactive target", t), e;
    }
    /**
     * Returns the TargetData for an active target (i.e. a target that the user
     * is still interested in that has no outstanding target change requests).
     */    se(t) {
        const e = this.Qt.get(t);
        return e && e.kt ? null : this.Gt.le(t);
    }
    /**
     * Resets the state of a Watch target to its initial state (e.g. sets
     * 'current' to false, clears the resume token and removes its target mapping
     * from all documents).
     */    ee(t) {
        this.Qt.set(t, new Ti);
        this.Gt.getRemoteKeysForTarget(t).forEach((e => {
            this.Yt(t, e, /*updatedDocument=*/ null);
        }));
    }
    /**
     * Returns whether the LocalStore considers the document to be part of the
     * specified target.
     */    ae(t, e) {
        return this.Gt.getRemoteKeysForTarget(t).has(e);
    }
}

function Ai() {
    return new pe(ht.comparator);
}

function vi() {
    return new pe(ht.comparator);
}

const Ri = (() => {
    const t = {
        asc: "ASCENDING",
        desc: "DESCENDING"
    };
    return t;
})(), Pi = (() => {
    const t = {
        "<": "LESS_THAN",
        "<=": "LESS_THAN_OR_EQUAL",
        ">": "GREATER_THAN",
        ">=": "GREATER_THAN_OR_EQUAL",
        "==": "EQUAL",
        "!=": "NOT_EQUAL",
        "array-contains": "ARRAY_CONTAINS",
        in: "IN",
        "not-in": "NOT_IN",
        "array-contains-any": "ARRAY_CONTAINS_ANY"
    };
    return t;
})(), bi = (() => {
    const t = {
        and: "AND",
        or: "OR"
    };
    return t;
})();

/**
 * This class generates JsonObject values for the Datastore API suitable for
 * sending to either GRPC stub methods or via the JSON/HTTP REST API.
 *
 * The serializer supports both Protobuf.js and Proto3 JSON formats. By
 * setting `useProto3Json` to true, the serializer will use the Proto3 JSON
 * format.
 *
 * For a description of the Proto3 JSON format check
 * https://developers.google.com/protocol-buffers/docs/proto3#json
 *
 * TODO(klimt): We can remove the databaseId argument if we keep the full
 * resource name in documents.
 */
class Vi {
    constructor(t, e) {
        this.databaseId = t, this.useProto3Json = e;
    }
}

/**
 * Returns a value for a number (or null) that's appropriate to put into
 * a google.protobuf.Int32Value proto.
 * DO NOT USE THIS FOR ANYTHING ELSE.
 * This method cheats. It's typed as returning "number" because that's what
 * our generated proto interfaces say Int32Value must be. But GRPC actually
 * expects a { value: <number> } struct.
 */
function Si(t, e) {
    return t.useProto3Json || Ft(e) ? e : {
        value: e
    };
}

/**
 * Returns a number (or null) from a google.protobuf.Int32Value proto.
 */
/**
 * Returns a value for a Date that's appropriate to put into a proto.
 */
function Di(t, e) {
    if (t.useProto3Json) {
        return `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + e.nanoseconds).slice(-9)}Z`;
    }
    return {
        seconds: "" + e.seconds,
        nanos: e.nanoseconds
    };
}

/**
 * Returns a value for bytes that's appropriate to put in a proto.
 *
 * Visible for testing.
 */
function Ci(t, e) {
    return t.useProto3Json ? e.toBase64() : e.toUint8Array();
}

/**
 * Returns a ByteString based on the proto string value.
 */ function xi(t, e) {
    return Di(t, e.toTimestamp());
}

function Ni(t) {
    return F(!!t), rt.fromTimestamp(function(t) {
        const e = De(t);
        return new it(e.seconds, e.nanos);
    }(t));
}

function ki(t, e) {
    return function(t) {
        return new ut([ "projects", t.projectId, "databases", t.database ]);
    }(t).child("documents").child(e).canonicalString();
}

function Mi(t) {
    const e = ut.fromString(t);
    return F(ur(e)), e;
}

function $i(t, e) {
    return ki(t.databaseId, e.path);
}

function Oi(t, e) {
    const n = Mi(e);
    if (n.get(1) !== t.databaseId.projectId) throw new U(q.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + n.get(1) + " vs " + t.databaseId.projectId);
    if (n.get(3) !== t.databaseId.database) throw new U(q.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + n.get(3) + " vs " + t.databaseId.database);
    return new ht(qi(n));
}

function Fi(t, e) {
    return ki(t.databaseId, e);
}

function Bi(t) {
    const e = Mi(t);
    // In v1beta1 queries for collections at the root did not have a trailing
    // "/documents". In v1 all resource paths contain "/documents". Preserve the
    // ability to read the v1beta1 form for compatibility with queries persisted
    // in the local target cache.
        return 4 === e.length ? ut.emptyPath() : qi(e);
}

function Li(t) {
    return new ut([ "projects", t.databaseId.projectId, "databases", t.databaseId.database ]).canonicalString();
}

function qi(t) {
    return F(t.length > 4 && "documents" === t.get(4)), t.popFirst(5);
}

/** Creates a Document proto from key and fields (but no create/update time) */ function Ui(t, e, n) {
    return {
        name: $i(t, e),
        fields: n.value.mapValue.fields
    };
}

function Ki(t, e, n) {
    const s = Oi(t, e.name), i = Ni(e.updateTime), r = e.createTime ? Ni(e.createTime) : rt.min(), o = new un({
        mapValue: {
            fields: e.fields
        }
    }), u = an.newFoundDocument(s, i, r, o);
    return n && u.setHasCommittedMutations(), n ? u.setHasCommittedMutations() : u;
}

function Gi(t, e) {
    return "found" in e ? function(t, e) {
        F(!!e.found), e.found.name, e.found.updateTime;
        const n = Oi(t, e.found.name), s = Ni(e.found.updateTime), i = e.found.createTime ? Ni(e.found.createTime) : rt.min(), r = new un({
            mapValue: {
                fields: e.found.fields
            }
        });
        return an.newFoundDocument(n, s, i, r);
    }(t, e) : "missing" in e ? function(t, e) {
        F(!!e.missing), F(!!e.readTime);
        const n = Oi(t, e.missing), s = Ni(e.readTime);
        return an.newNoDocument(n, s);
    }(t, e) : O();
}

function Qi(t, e) {
    let n;
    if ("targetChange" in e) {
        e.targetChange;
        // proto3 default value is unset in JSON (undefined), so use 'NO_CHANGE'
        // if unset
        const s = function(t) {
            return "NO_CHANGE" === t ? 0 /* WatchTargetChangeState.NoChange */ : "ADD" === t ? 1 /* WatchTargetChangeState.Added */ : "REMOVE" === t ? 2 /* WatchTargetChangeState.Removed */ : "CURRENT" === t ? 3 /* WatchTargetChangeState.Current */ : "RESET" === t ? 4 /* WatchTargetChangeState.Reset */ : O();
        }(e.targetChange.targetChangeType || "NO_CHANGE"), i = e.targetChange.targetIds || [], r = function(t, e) {
            return t.useProto3Json ? (F(void 0 === e || "string" == typeof e), Ve.fromBase64String(e || "")) : (F(void 0 === e || e instanceof Uint8Array), 
            Ve.fromUint8Array(e || new Uint8Array));
        }(t, e.targetChange.resumeToken), o = e.targetChange.cause, u = o && function(t) {
            const e = void 0 === t.code ? q.UNKNOWN : ui(t.code);
            return new U(e, t.message || "");
        }(o);
        n = new Ii(s, i, r, u || null);
    } else if ("documentChange" in e) {
        e.documentChange;
        const s = e.documentChange;
        s.document, s.document.name, s.document.updateTime;
        const i = Oi(t, s.document.name), r = Ni(s.document.updateTime), o = s.document.createTime ? Ni(s.document.createTime) : rt.min(), u = new un({
            mapValue: {
                fields: s.document.fields
            }
        }), c = an.newFoundDocument(i, r, o, u), a = s.targetIds || [], h = s.removedTargetIds || [];
        n = new yi(a, h, c.key, c);
    } else if ("documentDelete" in e) {
        e.documentDelete;
        const s = e.documentDelete;
        s.document;
        const i = Oi(t, s.document), r = s.readTime ? Ni(s.readTime) : rt.min(), o = an.newNoDocument(i, r), u = s.removedTargetIds || [];
        n = new yi([], u, o.key, o);
    } else if ("documentRemove" in e) {
        e.documentRemove;
        const s = e.documentRemove;
        s.document;
        const i = Oi(t, s.document), r = s.removedTargetIds || [];
        n = new yi([], r, i, null);
    } else {
        if (!("filter" in e)) return O();
        {
            e.filter;
            const t = e.filter;
            t.targetId;
            const {count: s = 0, unchangedNames: i} = t, r = new si(s, i), o = t.targetId;
            n = new pi(o, r);
        }
    }
    return n;
}

function ji(t, e) {
    let n;
    if (e instanceof js) n = {
        update: Ui(t, e.key, e.value)
    }; else if (e instanceof Ys) n = {
        delete: $i(t, e.key)
    }; else if (e instanceof zs) n = {
        update: Ui(t, e.key, e.data),
        updateMask: or(e.fieldMask)
    }; else {
        if (!(e instanceof Xs)) return O();
        n = {
            verify: $i(t, e.key)
        };
    }
    return e.fieldTransforms.length > 0 && (n.updateTransforms = e.fieldTransforms.map((t => function(t, e) {
        const n = e.transform;
        if (n instanceof bs) return {
            fieldPath: e.field.canonicalString(),
            setToServerValue: "REQUEST_TIME"
        };
        if (n instanceof Vs) return {
            fieldPath: e.field.canonicalString(),
            appendMissingElements: {
                values: n.elements
            }
        };
        if (n instanceof Ds) return {
            fieldPath: e.field.canonicalString(),
            removeAllFromArray: {
                values: n.elements
            }
        };
        if (n instanceof xs) return {
            fieldPath: e.field.canonicalString(),
            increment: n.gt
        };
        throw O();
    }(0, t)))), e.precondition.isNone || (n.currentDocument = function(t, e) {
        return void 0 !== e.updateTime ? {
            updateTime: xi(t, e.updateTime)
        } : void 0 !== e.exists ? {
            exists: e.exists
        } : O();
    }(t, e.precondition)), n;
}

function zi(t, e) {
    const n = e.currentDocument ? function(t) {
        return void 0 !== t.updateTime ? Fs.updateTime(Ni(t.updateTime)) : void 0 !== t.exists ? Fs.exists(t.exists) : Fs.none();
    }(e.currentDocument) : Fs.none(), s = e.updateTransforms ? e.updateTransforms.map((e => function(t, e) {
        let n = null;
        if ("setToServerValue" in e) F("REQUEST_TIME" === e.setToServerValue), n = new bs; else if ("appendMissingElements" in e) {
            const t = e.appendMissingElements.values || [];
            n = new Vs(t);
        } else if ("removeAllFromArray" in e) {
            const t = e.removeAllFromArray.values || [];
            n = new Ds(t);
        } else "increment" in e ? n = new xs(t, e.increment) : O();
        const s = at.fromServerFormat(e.fieldPath);
        return new Ms(s, n);
    }(t, e))) : [];
    if (e.update) {
        e.update.name;
        const i = Oi(t, e.update.name), r = new un({
            mapValue: {
                fields: e.update.fields
            }
        });
        if (e.updateMask) {
            const t = function(t) {
                const e = t.fieldPaths || [];
                return new Re(e.map((t => at.fromServerFormat(t))));
            }(e.updateMask);
            return new zs(i, r, t, n, s);
        }
        return new js(i, r, n, s);
    }
    if (e.delete) {
        const s = Oi(t, e.delete);
        return new Ys(s, n);
    }
    if (e.verify) {
        const s = Oi(t, e.verify);
        return new Xs(s, n);
    }
    return O();
}

function Wi(t, e) {
    return t && t.length > 0 ? (F(void 0 !== e), t.map((t => function(t, e) {
        // NOTE: Deletes don't have an updateTime.
        let n = t.updateTime ? Ni(t.updateTime) : Ni(e);
        return n.isEqual(rt.min()) && (
        // The Firestore Emulator currently returns an update time of 0 for
        // deletes of non-existing documents (rather than null). This breaks the
        // test "get deleted doc while offline with source=cache" as NoDocuments
        // with version 0 are filtered by IndexedDb's RemoteDocumentCache.
        // TODO(#2149): Remove this when Emulator is fixed
        n = Ni(e)), new Os(n, t.transformResults || []);
    }(t, e)))) : [];
}

function Hi(t, e) {
    return {
        documents: [ Fi(t, e.path) ]
    };
}

function Ji(t, e) {
    // Dissect the path into parent, collectionId, and optional key filter.
    const n = {
        structuredQuery: {}
    }, s = e.path;
    null !== e.collectionGroup ? (n.parent = Fi(t, s), n.structuredQuery.from = [ {
        collectionId: e.collectionGroup,
        allDescendants: !0
    } ]) : (n.parent = Fi(t, s.popLast()), n.structuredQuery.from = [ {
        collectionId: s.lastSegment()
    } ]);
    const i = function(t) {
        if (0 === t.length) return;
        return rr(gn.create(t, "and" /* CompositeOperator.AND */));
    }(e.filters);
    i && (n.structuredQuery.where = i);
    const r = function(t) {
        if (0 === t.length) return;
        return t.map((t => 
        // visible for testing
        function(t) {
            return {
                field: sr(t.field),
                direction: tr(t.dir)
            };
        }(t)));
    }(e.orderBy);
    r && (n.structuredQuery.orderBy = r);
    const o = Si(t, e.limit);
    var u;
    return null !== o && (n.structuredQuery.limit = o), e.startAt && (n.structuredQuery.startAt = {
        before: (u = e.startAt).inclusive,
        values: u.position
    }), e.endAt && (n.structuredQuery.endAt = function(t) {
        return {
            before: !t.inclusive,
            values: t.position
        };
    }(e.endAt)), n;
}

function Yi(t) {
    let e = Bi(t.parent);
    const n = t.structuredQuery, s = n.from ? n.from.length : 0;
    let i = null;
    if (s > 0) {
        F(1 === s);
        const t = n.from[0];
        t.allDescendants ? i = t.collectionId : e = e.child(t.collectionId);
    }
    let r = [];
    n.where && (r = function(t) {
        const e = Zi(t);
        if (e instanceof gn && In(e)) return e.getFilters();
        return [ e ];
    }(n.where));
    let o = [];
    n.orderBy && (o = n.orderBy.map((t => function(t) {
        return new dn(ir(t.field), 
        // visible for testing
        function(t) {
            switch (t) {
              case "ASCENDING":
                return "asc" /* Direction.ASCENDING */;

              case "DESCENDING":
                return "desc" /* Direction.DESCENDING */;

              default:
                return;
            }
        }
        // visible for testing
        (t.direction));
    }
    // visible for testing
    (t))));
    let u = null;
    n.limit && (u = function(t) {
        let e;
        return e = "object" == typeof t ? t.value : t, Ft(e) ? null : e;
    }(n.limit));
    let c = null;
    n.startAt && (c = function(t) {
        const e = !!t.before, n = t.values || [];
        return new hn(n, e);
    }(n.startAt));
    let a = null;
    return n.endAt && (a = function(t) {
        const e = !t.before, n = t.values || [];
        return new hn(n, e);
    }
    // visible for testing
    (n.endAt)), Kn(e, i, o, r, u, "F" /* LimitType.First */ , c, a);
}

function Xi(t, e) {
    const n = function(t) {
        switch (t) {
          case "TargetPurposeListen" /* TargetPurpose.Listen */ :
            return null;

          case "TargetPurposeExistenceFilterMismatch" /* TargetPurpose.ExistenceFilterMismatch */ :
            return "existence-filter-mismatch";

          case "TargetPurposeExistenceFilterMismatchBloom" /* TargetPurpose.ExistenceFilterMismatchBloom */ :
            return "existence-filter-mismatch-bloom";

          case "TargetPurposeLimboResolution" /* TargetPurpose.LimboResolution */ :
            return "limbo-document";

          default:
            return O();
        }
    }(e.purpose);
    return null == n ? null : {
        "goog-listen-tags": n
    };
}

function Zi(t) {
    return void 0 !== t.unaryFilter ? function(t) {
        switch (t.unaryFilter.op) {
          case "IS_NAN":
            const e = ir(t.unaryFilter.field);
            return mn.create(e, "==" /* Operator.EQUAL */ , {
                doubleValue: NaN
            });

          case "IS_NULL":
            const n = ir(t.unaryFilter.field);
            return mn.create(n, "==" /* Operator.EQUAL */ , {
                nullValue: "NULL_VALUE"
            });

          case "IS_NOT_NAN":
            const s = ir(t.unaryFilter.field);
            return mn.create(s, "!=" /* Operator.NOT_EQUAL */ , {
                doubleValue: NaN
            });

          case "IS_NOT_NULL":
            const i = ir(t.unaryFilter.field);
            return mn.create(i, "!=" /* Operator.NOT_EQUAL */ , {
                nullValue: "NULL_VALUE"
            });

          default:
            return O();
        }
    }(t) : void 0 !== t.fieldFilter ? function(t) {
        return mn.create(ir(t.fieldFilter.field), function(t) {
            switch (t) {
              case "EQUAL":
                return "==" /* Operator.EQUAL */;

              case "NOT_EQUAL":
                return "!=" /* Operator.NOT_EQUAL */;

              case "GREATER_THAN":
                return ">" /* Operator.GREATER_THAN */;

              case "GREATER_THAN_OR_EQUAL":
                return ">=" /* Operator.GREATER_THAN_OR_EQUAL */;

              case "LESS_THAN":
                return "<" /* Operator.LESS_THAN */;

              case "LESS_THAN_OR_EQUAL":
                return "<=" /* Operator.LESS_THAN_OR_EQUAL */;

              case "ARRAY_CONTAINS":
                return "array-contains" /* Operator.ARRAY_CONTAINS */;

              case "IN":
                return "in" /* Operator.IN */;

              case "NOT_IN":
                return "not-in" /* Operator.NOT_IN */;

              case "ARRAY_CONTAINS_ANY":
                return "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */;

              default:
                return O();
            }
        }(t.fieldFilter.op), t.fieldFilter.value);
    }(t) : void 0 !== t.compositeFilter ? function(t) {
        return gn.create(t.compositeFilter.filters.map((t => Zi(t))), function(t) {
            switch (t) {
              case "AND":
                return "and" /* CompositeOperator.AND */;

              case "OR":
                return "or" /* CompositeOperator.OR */;

              default:
                return O();
            }
        }(t.compositeFilter.op));
    }(t) : O();
}

function tr(t) {
    return Ri[t];
}

function er(t) {
    return Pi[t];
}

function nr(t) {
    return bi[t];
}

function sr(t) {
    return {
        fieldPath: t.canonicalString()
    };
}

function ir(t) {
    return at.fromServerFormat(t.fieldPath);
}

function rr(t) {
    return t instanceof mn ? function(t) {
        if ("==" /* Operator.EQUAL */ === t.op) {
            if (Xe(t.value)) return {
                unaryFilter: {
                    field: sr(t.field),
                    op: "IS_NAN"
                }
            };
            if (Ye(t.value)) return {
                unaryFilter: {
                    field: sr(t.field),
                    op: "IS_NULL"
                }
            };
        } else if ("!=" /* Operator.NOT_EQUAL */ === t.op) {
            if (Xe(t.value)) return {
                unaryFilter: {
                    field: sr(t.field),
                    op: "IS_NOT_NAN"
                }
            };
            if (Ye(t.value)) return {
                unaryFilter: {
                    field: sr(t.field),
                    op: "IS_NOT_NULL"
                }
            };
        }
        return {
            fieldFilter: {
                field: sr(t.field),
                op: er(t.op),
                value: t.value
            }
        };
    }(t) : t instanceof gn ? function(t) {
        const e = t.getFilters().map((t => rr(t)));
        if (1 === e.length) return e[0];
        return {
            compositeFilter: {
                op: nr(t.op),
                filters: e
            }
        };
    }(t) : O();
}

function or(t) {
    const e = [];
    return t.fields.forEach((t => e.push(t.canonicalString()))), {
        fieldPaths: e
    };
}

function ur(t) {
    // Resource names have at least 4 components (project ID, database ID)
    return t.length >= 4 && "projects" === t.get(0) && "databases" === t.get(2);
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * An immutable set of metadata that the local store tracks for each target.
 */ class cr {
    constructor(
    /** The target being listened to. */
    t, 
    /**
     * The target ID to which the target corresponds; Assigned by the
     * LocalStore for user listens and by the SyncEngine for limbo watches.
     */
    e, 
    /** The purpose of the target. */
    n, 
    /**
     * The sequence number of the last transaction during which this target data
     * was modified.
     */
    s, 
    /** The latest snapshot version seen for this target. */
    i = rt.min()
    /**
     * The maximum snapshot version at which the associated view
     * contained no limbo documents.
     */ , r = rt.min()
    /**
     * An opaque, server-assigned token that allows watching a target to be
     * resumed after disconnecting without retransmitting all the data that
     * matches the target. The resume token essentially identifies a point in
     * time from which the server should resume sending results.
     */ , o = Ve.EMPTY_BYTE_STRING
    /**
     * The number of documents that last matched the query at the resume token or
     * read time. Documents are counted only when making a listen request with
     * resume token or read time, otherwise, keep it null.
     */ , u = null) {
        this.target = t, this.targetId = e, this.purpose = n, this.sequenceNumber = s, this.snapshotVersion = i, 
        this.lastLimboFreeSnapshotVersion = r, this.resumeToken = o, this.expectedCount = u;
    }
    /** Creates a new target data instance with an updated sequence number. */    withSequenceNumber(t) {
        return new cr(this.target, this.targetId, this.purpose, t, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, this.expectedCount);
    }
    /**
     * Creates a new target data instance with an updated resume token and
     * snapshot version.
     */    withResumeToken(t, e) {
        return new cr(this.target, this.targetId, this.purpose, this.sequenceNumber, e, this.lastLimboFreeSnapshotVersion, t, 
        /* expectedCount= */ null);
    }
    /**
     * Creates a new target data instance with an updated expected count.
     */    withExpectedCount(t) {
        return new cr(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, t);
    }
    /**
     * Creates a new target data instance with an updated last limbo free
     * snapshot version number.
     */    withLastLimboFreeSnapshotVersion(t) {
        return new cr(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, t, this.resumeToken, this.expectedCount);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/** Serializer for values stored in the LocalStore. */ class ar {
    constructor(t) {
        this.fe = t;
    }
}

/** Decodes a remote document from storage locally to a Document. */ function hr(t, e) {
    let n;
    if (e.document) n = Ki(t.fe, e.document, !!e.hasCommittedMutations); else if (e.noDocument) {
        const t = ht.fromSegments(e.noDocument.path), s = wr(e.noDocument.readTime);
        n = an.newNoDocument(t, s), e.hasCommittedMutations && n.setHasCommittedMutations();
    } else {
        if (!e.unknownDocument) return O();
        {
            const t = ht.fromSegments(e.unknownDocument.path), s = wr(e.unknownDocument.version);
            n = an.newUnknownDocument(t, s);
        }
    }
    return e.readTime && n.setReadTime(function(t) {
        const e = new it(t[0], t[1]);
        return rt.fromTimestamp(e);
    }(e.readTime)), n;
}

/** Encodes a document for storage locally. */ function lr(t, e) {
    const n = e.key, s = {
        prefixPath: n.getCollectionPath().popLast().toArray(),
        collectionGroup: n.collectionGroup,
        documentId: n.path.lastSegment(),
        readTime: fr(e.readTime),
        hasCommittedMutations: e.hasCommittedMutations
    };
    if (e.isFoundDocument()) s.document = function(t, e) {
        return {
            name: $i(t, e.key),
            fields: e.data.value.mapValue.fields,
            updateTime: Di(t, e.version.toTimestamp()),
            createTime: Di(t, e.createTime.toTimestamp())
        };
    }(t.fe, e); else if (e.isNoDocument()) s.noDocument = {
        path: n.path.toArray(),
        readTime: dr(e.version)
    }; else {
        if (!e.isUnknownDocument()) return O();
        s.unknownDocument = {
            path: n.path.toArray(),
            version: dr(e.version)
        };
    }
    return s;
}

function fr(t) {
    const e = t.toTimestamp();
    return [ e.seconds, e.nanoseconds ];
}

function dr(t) {
    const e = t.toTimestamp();
    return {
        seconds: e.seconds,
        nanoseconds: e.nanoseconds
    };
}

function wr(t) {
    const e = new it(t.seconds, t.nanoseconds);
    return rt.fromTimestamp(e);
}

/** Encodes a batch of mutations into a DbMutationBatch for local storage. */
/** Decodes a DbMutationBatch into a MutationBatch */
function _r(t, e) {
    const n = (e.baseMutations || []).map((e => zi(t.fe, e)));
    // Squash old transform mutations into existing patch or set mutations.
    // The replacement of representing `transforms` with `update_transforms`
    // on the SDK means that old `transform` mutations stored in IndexedDB need
    // to be updated to `update_transforms`.
    // TODO(b/174608374): Remove this code once we perform a schema migration.
        for (let t = 0; t < e.mutations.length - 1; ++t) {
        const n = e.mutations[t];
        if (t + 1 < e.mutations.length && void 0 !== e.mutations[t + 1].transform) {
            const s = e.mutations[t + 1];
            n.updateTransforms = s.transform.fieldTransforms, e.mutations.splice(t + 1, 1), 
            ++t;
        }
    }
    const s = e.mutations.map((e => zi(t.fe, e))), i = it.fromMillis(e.localWriteTimeMs);
    return new Zs(e.batchId, i, n, s);
}

/** Decodes a DbTarget into TargetData */ function mr(t) {
    const e = wr(t.readTime), n = void 0 !== t.lastLimboFreeSnapshotVersion ? wr(t.lastLimboFreeSnapshotVersion) : rt.min();
    let s;
    var i;
    return void 0 !== t.query.documents ? (F(1 === (i = t.query).documents.length), 
    s = Jn(Gn(Bi(i.documents[0])))) : s = function(t) {
        return Jn(Yi(t));
    }(t.query), new cr(s, t.targetId, "TargetPurposeListen" /* TargetPurpose.Listen */ , t.lastListenSequenceNumber, e, n, Ve.fromBase64String(t.resumeToken));
}

/** Encodes TargetData into a DbTarget for storage locally. */ function gr(t, e) {
    const n = dr(e.snapshotVersion), s = dr(e.lastLimboFreeSnapshotVersion);
    let i;
    i = Fn(e.target) ? Hi(t.fe, e.target) : Ji(t.fe, e.target);
    // We can't store the resumeToken as a ByteString in IndexedDb, so we
    // convert it to a base64 string for storage.
        const r = e.resumeToken.toBase64();
    // lastListenSequenceNumber is always 0 until we do real GC.
        return {
        targetId: e.targetId,
        canonicalId: $n(e.target),
        readTime: n,
        resumeToken: r,
        lastListenSequenceNumber: e.sequenceNumber,
        lastLimboFreeSnapshotVersion: s,
        query: i
    };
}

/**
 * A helper function for figuring out what kind of query has been stored.
 */
/**
 * Encodes a `BundledQuery` from bundle proto to a Query object.
 *
 * This reconstructs the original query used to build the bundle being loaded,
 * including features exists only in SDKs (for example: limit-to-last).
 */
function yr(t) {
    const e = Yi({
        parent: t.parent,
        structuredQuery: t.structuredQuery
    });
    return "LAST" === t.limitType ? Xn(e, e.limit, "L" /* LimitType.Last */) : e;
}

/** Encodes a NamedQuery proto object to a NamedQuery model object. */
/** Encodes a DbDocumentOverlay object to an Overlay model object. */
function pr(t, e) {
    return new ei(e.largestBatchId, zi(t.fe, e.overlayMutation));
}

/** Decodes an Overlay model object into a DbDocumentOverlay object. */
/**
 * Returns the DbDocumentOverlayKey corresponding to the given user and
 * document key.
 */
function Ir(t, e) {
    const n = e.path.lastSegment();
    return [ t, qt(e.path.popLast()), n ];
}

function Tr(t, e, n, s) {
    return {
        indexId: t,
        uid: e.uid || "",
        sequenceNumber: n,
        readTime: dr(s.readTime),
        documentKey: qt(s.documentKey.path),
        largestBatchId: s.largestBatchId
    };
}

/**
 * @license
 * Copyright 2020 Google LLC
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
 */ class Er {
    getBundleMetadata(t, e) {
        return Ar(t).get(e).next((t => {
            if (t) return {
                id: (e = t).bundleId,
                createTime: wr(e.createTime),
                version: e.version
            };
            /** Encodes a DbBundle to a BundleMetadata object. */
            var e;
            /** Encodes a BundleMetadata to a DbBundle. */        }));
    }
    saveBundleMetadata(t, e) {
        return Ar(t).put({
            bundleId: (n = e).id,
            createTime: dr(Ni(n.createTime)),
            version: n.version
        });
        var n;
        /** Encodes a DbNamedQuery to a NamedQuery. */    }
    getNamedQuery(t, e) {
        return vr(t).get(e).next((t => {
            if (t) return {
                name: (e = t).name,
                query: yr(e.bundledQuery),
                readTime: wr(e.readTime)
            };
            var e;
            /** Encodes a NamedQuery from a bundle proto to a DbNamedQuery. */        }));
    }
    saveNamedQuery(t, e) {
        return vr(t).put(function(t) {
            return {
                name: t.name,
                readTime: dr(Ni(t.readTime)),
                bundledQuery: t.bundledQuery
            };
        }(e));
    }
}

/**
 * Helper to get a typed SimpleDbStore for the bundles object store.
 */ function Ar(t) {
    return _e(t, "bundles");
}

/**
 * Helper to get a typed SimpleDbStore for the namedQueries object store.
 */ function vr(t) {
    return _e(t, "namedQueries");
}

/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * Implementation of DocumentOverlayCache using IndexedDb.
 */ class Rr {
    /**
     * @param serializer - The document serializer.
     * @param userId - The userId for which we are accessing overlays.
     */
    constructor(t, e) {
        this.serializer = t, this.userId = e;
    }
    static de(t, e) {
        const n = e.uid || "";
        return new Rr(t, n);
    }
    getOverlay(t, e) {
        return Pr(t).get(Ir(this.userId, e)).next((t => t ? pr(this.serializer, t) : null));
    }
    getOverlays(t, e) {
        const n = fs();
        return Rt.forEach(e, (e => this.getOverlay(t, e).next((t => {
            null !== t && n.set(e, t);
        })))).next((() => n));
    }
    saveOverlays(t, e, n) {
        const s = [];
        return n.forEach(((n, i) => {
            const r = new ei(e, i);
            s.push(this.we(t, r));
        })), Rt.waitFor(s);
    }
    removeOverlaysForBatchId(t, e, n) {
        const s = new Set;
        // Get the set of unique collection paths.
                e.forEach((t => s.add(qt(t.getCollectionPath()))));
        const i = [];
        return s.forEach((e => {
            const s = IDBKeyRange.bound([ this.userId, e, n ], [ this.userId, e, n + 1 ], 
            /*lowerOpen=*/ !1, 
            /*upperOpen=*/ !0);
            i.push(Pr(t).J("collectionPathOverlayIndex", s));
        })), Rt.waitFor(i);
    }
    getOverlaysForCollection(t, e, n) {
        const s = fs(), i = qt(e), r = IDBKeyRange.bound([ this.userId, i, n ], [ this.userId, i, Number.POSITIVE_INFINITY ], 
        /*lowerOpen=*/ !0);
        return Pr(t).j("collectionPathOverlayIndex", r).next((t => {
            for (const e of t) {
                const t = pr(this.serializer, e);
                s.set(t.getKey(), t);
            }
            return s;
        }));
    }
    getOverlaysForCollectionGroup(t, e, n, s) {
        const i = fs();
        let r;
        // We want batch IDs larger than `sinceBatchId`, and so the lower bound
        // is not inclusive.
                const o = IDBKeyRange.bound([ this.userId, e, n ], [ this.userId, e, Number.POSITIVE_INFINITY ], 
        /*lowerOpen=*/ !0);
        return Pr(t).X({
            index: "collectionGroupOverlayIndex",
            range: o
        }, ((t, e, n) => {
            // We do not want to return partial batch overlays, even if the size
            // of the result set exceeds the given `count` argument. Therefore, we
            // continue to aggregate results even after the result size exceeds
            // `count` if there are more overlays from the `currentBatchId`.
            const o = pr(this.serializer, e);
            i.size() < s || o.largestBatchId === r ? (i.set(o.getKey(), o), r = o.largestBatchId) : n.done();
        })).next((() => i));
    }
    we(t, e) {
        return Pr(t).put(function(t, e, n) {
            const [s, i, r] = Ir(e, n.mutation.key);
            return {
                userId: e,
                collectionPath: i,
                documentId: r,
                collectionGroup: n.mutation.key.getCollectionGroup(),
                largestBatchId: n.largestBatchId,
                overlayMutation: ji(t.fe, n.mutation)
            };
        }(this.serializer, this.userId, e));
    }
}

/**
 * Helper to get a typed SimpleDbStore for the document overlay object store.
 */ function Pr(t) {
    return _e(t, "documentOverlays");
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
// Note: This code is copied from the backend. Code that is not used by
// Firestore was removed.
/** Firestore index value writer.  */
class br {
    constructor() {}
    // The write methods below short-circuit writing terminators for values
    // containing a (terminating) truncated value.
    // As an example, consider the resulting encoding for:
    // ["bar", [2, "foo"]] -> (STRING, "bar", TERM, ARRAY, NUMBER, 2, STRING, "foo", TERM, TERM, TERM)
    // ["bar", [2, truncated("foo")]] -> (STRING, "bar", TERM, ARRAY, NUMBER, 2, STRING, "foo", TRUNC)
    // ["bar", truncated(["foo"])] -> (STRING, "bar", TERM, ARRAY. STRING, "foo", TERM, TRUNC)
    /** Writes an index value.  */
    _e(t, e) {
        this.me(t, e), 
        // Write separator to split index values
        // (see go/firestore-storage-format#encodings).
        e.ge();
    }
    me(t, e) {
        if ("nullValue" in t) this.ye(e, 5); else if ("booleanValue" in t) this.ye(e, 10), 
        e.pe(t.booleanValue ? 1 : 0); else if ("integerValue" in t) this.ye(e, 15), e.pe(Ce(t.integerValue)); else if ("doubleValue" in t) {
            const n = Ce(t.doubleValue);
            isNaN(n) ? this.ye(e, 13) : (this.ye(e, 15), Bt(n) ? 
            // -0.0, 0 and 0.0 are all considered the same
            e.pe(0) : e.pe(n));
        } else if ("timestampValue" in t) {
            const n = t.timestampValue;
            this.ye(e, 20), "string" == typeof n ? e.Ie(n) : (e.Ie(`${n.seconds || ""}`), e.pe(n.nanos || 0));
        } else if ("stringValue" in t) this.Te(t.stringValue, e), this.Ee(e); else if ("bytesValue" in t) this.ye(e, 30), 
        e.Ae(xe(t.bytesValue)), this.Ee(e); else if ("referenceValue" in t) this.ve(t.referenceValue, e); else if ("geoPointValue" in t) {
            const n = t.geoPointValue;
            this.ye(e, 45), e.pe(n.latitude || 0), e.pe(n.longitude || 0);
        } else "mapValue" in t ? en(t) ? this.ye(e, Number.MAX_SAFE_INTEGER) : (this.Re(t.mapValue, e), 
        this.Ee(e)) : "arrayValue" in t ? (this.Pe(t.arrayValue, e), this.Ee(e)) : O();
    }
    Te(t, e) {
        this.ye(e, 25), this.be(t, e);
    }
    be(t, e) {
        e.Ie(t);
    }
    Re(t, e) {
        const n = t.fields || {};
        this.ye(e, 55);
        for (const t of Object.keys(n)) this.Te(t, e), this.me(n[t], e);
    }
    Pe(t, e) {
        const n = t.values || [];
        this.ye(e, 50);
        for (const t of n) this.me(t, e);
    }
    ve(t, e) {
        this.ye(e, 37);
        ht.fromName(t).path.forEach((t => {
            this.ye(e, 60), this.be(t, e);
        }));
    }
    ye(t, e) {
        t.pe(e);
    }
    Ee(t) {
        // While the SDK does not implement truncation, the truncation marker is
        // used to terminate all variable length values (which are strings, bytes,
        // references, arrays and maps).
        t.pe(2);
    }
}

br.Ve = new br;

/**
 * Counts the number of zeros in a byte.
 *
 * Visible for testing.
 */
function Vr(t) {
    if (0 === t) return 8;
    let e = 0;
    return t >> 4 == 0 && (
    // Test if the first four bits are zero.
    e += 4, t <<= 4), t >> 6 == 0 && (
    // Test if the first two (or next two) bits are zero.
    e += 2, t <<= 2), t >> 7 == 0 && (
    // Test if the remaining bit is zero.
    e += 1), e;
}

/** Counts the number of leading zeros in the given byte array. */
/**
 * Returns the number of bytes required to store "value". Leading zero bytes
 * are skipped.
 */
function Sr(t) {
    // This is just the number of bytes for the unsigned representation of the number.
    const e = 64 - function(t) {
        let e = 0;
        for (let n = 0; n < 8; ++n) {
            const s = Vr(255 & t[n]);
            if (e += s, 8 !== s) break;
        }
        return e;
    }(t);
    return Math.ceil(e / 8);
}

/**
 * OrderedCodeWriter is a minimal-allocation implementation of the writing
 * behavior defined by the backend.
 *
 * The code is ported from its Java counterpart.
 */ class Dr {
    constructor() {
        this.buffer = new Uint8Array(1024), this.position = 0;
    }
    Se(t) {
        const e = t[Symbol.iterator]();
        let n = e.next();
        for (;!n.done; ) this.De(n.value), n = e.next();
        this.Ce();
    }
    xe(t) {
        const e = t[Symbol.iterator]();
        let n = e.next();
        for (;!n.done; ) this.Ne(n.value), n = e.next();
        this.ke();
    }
    /** Writes utf8 bytes into this byte sequence, ascending. */    Me(t) {
        for (const e of t) {
            const t = e.charCodeAt(0);
            if (t < 128) this.De(t); else if (t < 2048) this.De(960 | t >>> 6), this.De(128 | 63 & t); else if (e < "\ud800" || "\udbff" < e) this.De(480 | t >>> 12), 
            this.De(128 | 63 & t >>> 6), this.De(128 | 63 & t); else {
                const t = e.codePointAt(0);
                this.De(240 | t >>> 18), this.De(128 | 63 & t >>> 12), this.De(128 | 63 & t >>> 6), 
                this.De(128 | 63 & t);
            }
        }
        this.Ce();
    }
    /** Writes utf8 bytes into this byte sequence, descending */    $e(t) {
        for (const e of t) {
            const t = e.charCodeAt(0);
            if (t < 128) this.Ne(t); else if (t < 2048) this.Ne(960 | t >>> 6), this.Ne(128 | 63 & t); else if (e < "\ud800" || "\udbff" < e) this.Ne(480 | t >>> 12), 
            this.Ne(128 | 63 & t >>> 6), this.Ne(128 | 63 & t); else {
                const t = e.codePointAt(0);
                this.Ne(240 | t >>> 18), this.Ne(128 | 63 & t >>> 12), this.Ne(128 | 63 & t >>> 6), 
                this.Ne(128 | 63 & t);
            }
        }
        this.ke();
    }
    Oe(t) {
        // Values are encoded with a single byte length prefix, followed by the
        // actual value in big-endian format with leading 0 bytes dropped.
        const e = this.Fe(t), n = Sr(e);
        this.Be(1 + n), this.buffer[this.position++] = 255 & n;
        // Write the length
        for (let t = e.length - n; t < e.length; ++t) this.buffer[this.position++] = 255 & e[t];
    }
    Le(t) {
        // Values are encoded with a single byte length prefix, followed by the
        // inverted value in big-endian format with leading 0 bytes dropped.
        const e = this.Fe(t), n = Sr(e);
        this.Be(1 + n), this.buffer[this.position++] = ~(255 & n);
        // Write the length
        for (let t = e.length - n; t < e.length; ++t) this.buffer[this.position++] = ~(255 & e[t]);
    }
    /**
     * Writes the "infinity" byte sequence that sorts after all other byte
     * sequences written in ascending order.
     */    qe() {
        this.Ue(255), this.Ue(255);
    }
    /**
     * Writes the "infinity" byte sequence that sorts before all other byte
     * sequences written in descending order.
     */    Ke() {
        this.Ge(255), this.Ge(255);
    }
    /**
     * Resets the buffer such that it is the same as when it was newly
     * constructed.
     */    reset() {
        this.position = 0;
    }
    seed(t) {
        this.Be(t.length), this.buffer.set(t, this.position), this.position += t.length;
    }
    /** Makes a copy of the encoded bytes in this buffer.  */    Qe() {
        return this.buffer.slice(0, this.position);
    }
    /**
     * Encodes `val` into an encoding so that the order matches the IEEE 754
     * floating-point comparison results with the following exceptions:
     *   -0.0 < 0.0
     *   all non-NaN < NaN
     *   NaN = NaN
     */    Fe(t) {
        const e = 
        /** Converts a JavaScript number to a byte array (using big endian encoding). */
        function(t) {
            const e = new DataView(new ArrayBuffer(8));
            return e.setFloat64(0, t, /* littleEndian= */ !1), new Uint8Array(e.buffer);
        }(t), n = 0 != (128 & e[0]);
        // Check if the first bit is set. We use a bit mask since value[0] is
        // encoded as a number from 0 to 255.
                // Revert the two complement to get natural ordering
        e[0] ^= n ? 255 : 128;
        for (let t = 1; t < e.length; ++t) e[t] ^= n ? 255 : 0;
        return e;
    }
    /** Writes a single byte ascending to the buffer. */    De(t) {
        const e = 255 & t;
        0 === e ? (this.Ue(0), this.Ue(255)) : 255 === e ? (this.Ue(255), this.Ue(0)) : this.Ue(e);
    }
    /** Writes a single byte descending to the buffer.  */    Ne(t) {
        const e = 255 & t;
        0 === e ? (this.Ge(0), this.Ge(255)) : 255 === e ? (this.Ge(255), this.Ge(0)) : this.Ge(t);
    }
    Ce() {
        this.Ue(0), this.Ue(1);
    }
    ke() {
        this.Ge(0), this.Ge(1);
    }
    Ue(t) {
        this.Be(1), this.buffer[this.position++] = t;
    }
    Ge(t) {
        this.Be(1), this.buffer[this.position++] = ~t;
    }
    Be(t) {
        const e = t + this.position;
        if (e <= this.buffer.length) return;
        // Try doubling.
                let n = 2 * this.buffer.length;
        // Still not big enough? Just allocate the right size.
                n < e && (n = e);
        // Create the new buffer.
                const s = new Uint8Array(n);
        s.set(this.buffer), // copy old data
        this.buffer = s;
    }
}

class Cr {
    constructor(t) {
        this.je = t;
    }
    Ae(t) {
        this.je.Se(t);
    }
    Ie(t) {
        this.je.Me(t);
    }
    pe(t) {
        this.je.Oe(t);
    }
    ge() {
        this.je.qe();
    }
}

class xr {
    constructor(t) {
        this.je = t;
    }
    Ae(t) {
        this.je.xe(t);
    }
    Ie(t) {
        this.je.$e(t);
    }
    pe(t) {
        this.je.Le(t);
    }
    ge() {
        this.je.Ke();
    }
}

/**
 * Implements `DirectionalIndexByteEncoder` using `OrderedCodeWriter` for the
 * actual encoding.
 */ class Nr {
    constructor() {
        this.je = new Dr, this.ze = new Cr(this.je), this.We = new xr(this.je);
    }
    seed(t) {
        this.je.seed(t);
    }
    He(t) {
        return 0 /* IndexKind.ASCENDING */ === t ? this.ze : this.We;
    }
    Qe() {
        return this.je.Qe();
    }
    reset() {
        this.je.reset();
    }
}

/**
 * @license
 * Copyright 2022 Google LLC
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
/** Represents an index entry saved by the SDK in persisted storage. */ class kr {
    constructor(t, e, n, s) {
        this.indexId = t, this.documentKey = e, this.arrayValue = n, this.directionalValue = s;
    }
    /**
     * Returns an IndexEntry entry that sorts immediately after the current
     * directional value.
     */    Je() {
        const t = this.directionalValue.length, e = 0 === t || 255 === this.directionalValue[t - 1] ? t + 1 : t, n = new Uint8Array(e);
        return n.set(this.directionalValue, 0), e !== t ? n.set([ 0 ], this.directionalValue.length) : ++n[n.length - 1], 
        new kr(this.indexId, this.documentKey, this.arrayValue, n);
    }
}

function Mr(t, e) {
    let n = t.indexId - e.indexId;
    return 0 !== n ? n : (n = $r(t.arrayValue, e.arrayValue), 0 !== n ? n : (n = $r(t.directionalValue, e.directionalValue), 
    0 !== n ? n : ht.comparator(t.documentKey, e.documentKey)));
}

function $r(t, e) {
    for (let n = 0; n < t.length && n < e.length; ++n) {
        const s = t[n] - e[n];
        if (0 !== s) return s;
    }
    return t.length - e.length;
}

/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * A light query planner for Firestore.
 *
 * This class matches a `FieldIndex` against a Firestore Query `Target`. It
 * determines whether a given index can be used to serve the specified target.
 *
 * The following table showcases some possible index configurations:
 *
 * Query                                               | Index
 * -----------------------------------------------------------------------------
 * where('a', '==', 'a').where('b', '==', 'b')         | a ASC, b DESC
 * where('a', '==', 'a').where('b', '==', 'b')         | a ASC
 * where('a', '==', 'a').where('b', '==', 'b')         | b DESC
 * where('a', '>=', 'a').orderBy('a')                  | a ASC
 * where('a', '>=', 'a').orderBy('a', 'desc')          | a DESC
 * where('a', '>=', 'a').orderBy('a').orderBy('b')     | a ASC, b ASC
 * where('a', '>=', 'a').orderBy('a').orderBy('b')     | a ASC
 * where('a', 'array-contains', 'a').orderBy('b')      | a CONTAINS, b ASCENDING
 * where('a', 'array-contains', 'a').orderBy('b')      | a CONTAINS
 */ class Or {
    constructor(t) {
        this.collectionId = null != t.collectionGroup ? t.collectionGroup : t.path.lastSegment(), 
        this.Ye = t.orderBy, this.Xe = [];
        for (const e of t.filters) {
            const t = e;
            t.isInequality() ? this.Ze = t : this.Xe.push(t);
        }
    }
    /**
     * Returns whether the index can be used to serve the TargetIndexMatcher's
     * target.
     *
     * An index is considered capable of serving the target when:
     * - The target uses all index segments for its filters and orderBy clauses.
     *   The target can have additional filter and orderBy clauses, but not
     *   fewer.
     * - If an ArrayContains/ArrayContainsAnyfilter is used, the index must also
     *   have a corresponding `CONTAINS` segment.
     * - All directional index segments can be mapped to the target as a series of
     *   equality filters, a single inequality filter and a series of orderBy
     *   clauses.
     * - The segments that represent the equality filters may appear out of order.
     * - The optional segment for the inequality filter must appear after all
     *   equality segments.
     * - The segments that represent that orderBy clause of the target must appear
     *   in order after all equality and inequality segments. Single orderBy
     *   clauses cannot be skipped, but a continuous orderBy suffix may be
     *   omitted.
     */    tn(t) {
        F(t.collectionGroup === this.collectionId);
        // If there is an array element, find a matching filter.
        const e = ft(t);
        if (void 0 !== e && !this.en(e)) return !1;
        const n = dt(t);
        let s = new Set, i = 0, r = 0;
        // Process all equalities first. Equalities can appear out of order.
        for (;i < n.length && this.en(n[i]); ++i) s = s.add(n[i].fieldPath.canonicalString());
        // If we already have processed all segments, all segments are used to serve
        // the equality filters and we do not need to map any segments to the
        // target's inequality and orderBy clauses.
                if (i === n.length) return !0;
        if (void 0 !== this.Ze) {
            // If there is an inequality filter and the field was not in one of the
            // equality filters above, the next segment must match both the filter
            // and the first orderBy clause.
            if (!s.has(this.Ze.field.canonicalString())) {
                const t = n[i];
                if (!this.nn(this.Ze, t) || !this.sn(this.Ye[r++], t)) return !1;
            }
            ++i;
        }
        // All remaining segments need to represent the prefix of the target's
        // orderBy.
                for (;i < n.length; ++i) {
            const t = n[i];
            if (r >= this.Ye.length || !this.sn(this.Ye[r++], t)) return !1;
        }
        return !0;
    }
    en(t) {
        for (const e of this.Xe) if (this.nn(e, t)) return !0;
        return !1;
    }
    nn(t, e) {
        if (void 0 === t || !t.field.isEqual(e.fieldPath)) return !1;
        const n = "array-contains" /* Operator.ARRAY_CONTAINS */ === t.op || "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ === t.op;
        return 2 /* IndexKind.CONTAINS */ === e.kind === n;
    }
    sn(t, e) {
        return !!t.field.isEqual(e.fieldPath) && (0 /* IndexKind.ASCENDING */ === e.kind && "asc" /* Direction.ASCENDING */ === t.dir || 1 /* IndexKind.DESCENDING */ === e.kind && "desc" /* Direction.DESCENDING */ === t.dir);
    }
}

/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * Provides utility functions that help with boolean logic transformations needed for handling
 * complex filters used in queries.
 */
/**
 * The `in` filter is only a syntactic sugar over a disjunction of equalities. For instance: `a in
 * [1,2,3]` is in fact `a==1 || a==2 || a==3`. This method expands any `in` filter in the given
 * input into a disjunction of equality filters and returns the expanded filter.
 */ function Fr(t) {
    var e, n;
    if (F(t instanceof mn || t instanceof gn), t instanceof mn) {
        if (t instanceof Cn) {
            const s = (null === (n = null === (e = t.value.arrayValue) || void 0 === e ? void 0 : e.values) || void 0 === n ? void 0 : n.map((e => mn.create(t.field, "==" /* Operator.EQUAL */ , e)))) || [];
            return gn.create(s, "or" /* CompositeOperator.OR */);
        }
        // We have reached other kinds of field filters.
        return t;
    }
    // We have a composite filter.
        const s = t.filters.map((t => Fr(t)));
    return gn.create(s, t.op);
}

/**
 * Given a composite filter, returns the list of terms in its disjunctive normal form.
 *
 * <p>Each element in the return value is one term of the resulting DNF. For instance: For the
 * input: (A || B) && C, the DNF form is: (A && C) || (B && C), and the return value is a list
 * with two elements: a composite filter that performs (A && C), and a composite filter that
 * performs (B && C).
 *
 * @param filter the composite filter to calculate DNF transform for.
 * @return the terms in the DNF transform.
 */ function Br(t) {
    if (0 === t.getFilters().length) return [];
    const e = Kr(Fr(t));
    return F(Ur(e)), Lr(e) || qr(e) ? [ e ] : e.getFilters();
}

/** Returns true if the given filter is a single field filter. e.g. (a == 10). */ function Lr(t) {
    return t instanceof mn;
}

/**
 * Returns true if the given filter is the conjunction of one or more field filters. e.g. (a == 10
 * && b == 20)
 */ function qr(t) {
    return t instanceof gn && In(t);
}

/**
 * Returns whether or not the given filter is in disjunctive normal form (DNF).
 *
 * <p>In boolean logic, a disjunctive normal form (DNF) is a canonical normal form of a logical
 * formula consisting of a disjunction of conjunctions; it can also be described as an OR of ANDs.
 *
 * <p>For more info, visit: https://en.wikipedia.org/wiki/Disjunctive_normal_form
 */ function Ur(t) {
    return Lr(t) || qr(t) || 
    /**
 * Returns true if the given filter is the disjunction of one or more "flat conjunctions" and
 * field filters. e.g. (a == 10) || (b==20 && c==30)
 */
    function(t) {
        if (t instanceof gn && pn(t)) {
            for (const e of t.getFilters()) if (!Lr(e) && !qr(e)) return !1;
            return !0;
        }
        return !1;
    }(t);
}

function Kr(t) {
    if (F(t instanceof mn || t instanceof gn), t instanceof mn) return t;
    if (1 === t.filters.length) return Kr(t.filters[0]);
    // Compute DNF for each of the subfilters first
        const e = t.filters.map((t => Kr(t)));
    let n = gn.create(e, t.op);
    return n = jr(n), Ur(n) ? n : (F(n instanceof gn), F(yn(n)), F(n.filters.length > 1), 
    n.filters.reduce(((t, e) => Gr(t, e))));
}

function Gr(t, e) {
    let n;
    return F(t instanceof mn || t instanceof gn), F(e instanceof mn || e instanceof gn), 
    // FieldFilter FieldFilter
    n = t instanceof mn ? e instanceof mn ? function(t, e) {
        // Conjunction distribution for two field filters is the conjunction of them.
        return gn.create([ t, e ], "and" /* CompositeOperator.AND */);
    }(t, e) : Qr(t, e) : e instanceof mn ? Qr(e, t) : function(t, e) {
        // There are four cases:
        // (A & B) & (C & D) --> (A & B & C & D)
        // (A & B) & (C | D) --> (A & B & C) | (A & B & D)
        // (A | B) & (C & D) --> (C & D & A) | (C & D & B)
        // (A | B) & (C | D) --> (A & C) | (A & D) | (B & C) | (B & D)
        // Case 1 is a merge.
        if (F(t.filters.length > 0 && e.filters.length > 0), yn(t) && yn(e)) return vn(t, e.getFilters());
        // Case 2,3,4 all have at least one side (lhs or rhs) that is a disjunction. In all three cases
        // we should take each element of the disjunction and distribute it over the other side, and
        // return the disjunction of the distribution results.
                const n = pn(t) ? t : e, s = pn(t) ? e : t, i = n.filters.map((t => Gr(t, s)));
        return gn.create(i, "or" /* CompositeOperator.OR */);
    }(t, e), jr(n);
}

function Qr(t, e) {
    // There are two cases:
    // A & (B & C) --> (A & B & C)
    // A & (B | C) --> (A & B) | (A & C)
    if (yn(e)) 
    // Case 1
    return vn(e, t.getFilters());
    {
        // Case 2
        const n = e.filters.map((e => Gr(t, e)));
        return gn.create(n, "or" /* CompositeOperator.OR */);
    }
}

/**
 * Applies the associativity property to the given filter and returns the resulting filter.
 *
 * <ul>
 *   <li>A | (B | C) == (A | B) | C == (A | B | C)
 *   <li>A & (B & C) == (A & B) & C == (A & B & C)
 * </ul>
 *
 * <p>For more info, visit: https://en.wikipedia.org/wiki/Associative_property#Propositional_logic
 */ function jr(t) {
    if (F(t instanceof mn || t instanceof gn), t instanceof mn) return t;
    const e = t.getFilters();
    // If the composite filter only contains 1 filter, apply associativity to it.
        if (1 === e.length) return jr(e[0]);
    // Associativity applied to a flat composite filter results is itself.
        if (Tn(t)) return t;
    // First apply associativity to all subfilters. This will in turn recursively apply
    // associativity to all nested composite filters and field filters.
        const n = e.map((t => jr(t))), s = [];
    // For composite subfilters that perform the same kind of logical operation as `compositeFilter`
    // take out their filters and add them to `compositeFilter`. For example:
    // compositeFilter = (A | (B | C | D))
    // compositeSubfilter = (B | C | D)
    // Result: (A | B | C | D)
    // Note that the `compositeSubfilter` has been eliminated, and its filters (B, C, D) have been
    // added to the top-level "compositeFilter".
        return n.forEach((e => {
        e instanceof mn ? s.push(e) : e instanceof gn && (e.op === t.op ? 
        // compositeFilter: (A | (B | C))
        // compositeSubfilter: (B | C)
        // Result: (A | B | C)
        s.push(...e.filters) : 
        // compositeFilter: (A | (B & C))
        // compositeSubfilter: (B & C)
        // Result: (A | (B & C))
        s.push(e));
    })), 1 === s.length ? s[0] : gn.create(s, t.op);
}

/**
 * @license
 * Copyright 2019 Google LLC
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
/**
 * An in-memory implementation of IndexManager.
 */ class zr {
    constructor() {
        this.rn = new Wr;
    }
    addToCollectionParentIndex(t, e) {
        return this.rn.add(e), Rt.resolve();
    }
    getCollectionParents(t, e) {
        return Rt.resolve(this.rn.getEntries(e));
    }
    addFieldIndex(t, e) {
        // Field indices are not supported with memory persistence.
        return Rt.resolve();
    }
    deleteFieldIndex(t, e) {
        // Field indices are not supported with memory persistence.
        return Rt.resolve();
    }
    getDocumentsMatchingTarget(t, e) {
        // Field indices are not supported with memory persistence.
        return Rt.resolve(null);
    }
    getIndexType(t, e) {
        // Field indices are not supported with memory persistence.
        return Rt.resolve(0 /* IndexType.NONE */);
    }
    getFieldIndexes(t, e) {
        // Field indices are not supported with memory persistence.
        return Rt.resolve([]);
    }
    getNextCollectionGroupToUpdate(t) {
        // Field indices are not supported with memory persistence.
        return Rt.resolve(null);
    }
    getMinOffset(t, e) {
        return Rt.resolve(It.min());
    }
    getMinOffsetFromCollectionGroup(t, e) {
        return Rt.resolve(It.min());
    }
    updateCollectionGroup(t, e, n) {
        // Field indices are not supported with memory persistence.
        return Rt.resolve();
    }
    updateIndexEntries(t, e) {
        // Field indices are not supported with memory persistence.
        return Rt.resolve();
    }
}

/**
 * Internal implementation of the collection-parent index exposed by MemoryIndexManager.
 * Also used for in-memory caching by IndexedDbIndexManager and initial index population
 * in indexeddb_schema.ts
 */ class Wr {
    constructor() {
        this.index = {};
    }
    // Returns false if the entry already existed.
    add(t) {
        const e = t.lastSegment(), n = t.popLast(), s = this.index[e] || new Ee(ut.comparator), i = !s.has(n);
        return this.index[e] = s.add(n), i;
    }
    has(t) {
        const e = t.lastSegment(), n = t.popLast(), s = this.index[e];
        return s && s.has(n);
    }
    getEntries(t) {
        return (this.index[t] || new Ee(ut.comparator)).toArray();
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
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
 */ const Hr = new Uint8Array(0);

/**
 * A persisted implementation of IndexManager.
 *
 * PORTING NOTE: Unlike iOS and Android, the Web SDK does not memoize index
 * data as it supports multi-tab access.
 */
class Jr {
    constructor(t, e) {
        this.user = t, this.databaseId = e, 
        /**
         * An in-memory copy of the index entries we've already written since the SDK
         * launched. Used to avoid re-writing the same entry repeatedly.
         *
         * This is *NOT* a complete cache of what's in persistence and so can never be
         * used to satisfy reads.
         */
        this.on = new Wr, 
        /**
         * Maps from a target to its equivalent list of sub-targets. Each sub-target
         * contains only one term from the target's disjunctive normal form (DNF).
         */
        this.un = new os((t => $n(t)), ((t, e) => On(t, e))), this.uid = t.uid || "";
    }
    /**
     * Adds a new entry to the collection parent index.
     *
     * Repeated calls for the same collectionPath should be avoided within a
     * transaction as IndexedDbIndexManager only caches writes once a transaction
     * has been committed.
     */    addToCollectionParentIndex(t, e) {
        if (!this.on.has(e)) {
            const n = e.lastSegment(), s = e.popLast();
            t.addOnCommittedListener((() => {
                // Add the collection to the in memory cache only if the transaction was
                // successfully committed.
                this.on.add(e);
            }));
            const i = {
                collectionId: n,
                parent: qt(s)
            };
            return Yr(t).put(i);
        }
        return Rt.resolve();
    }
    getCollectionParents(t, e) {
        const n = [], s = IDBKeyRange.bound([ e, "" ], [ st(e), "" ], 
        /*lowerOpen=*/ !1, 
        /*upperOpen=*/ !0);
        return Yr(t).j(s).next((t => {
            for (const s of t) {
                // This collectionId guard shouldn't be necessary (and isn't as long
                // as we're running in a real browser), but there's a bug in
                // indexeddbshim that breaks our range in our tests running in node:
                // https://github.com/axemclion/IndexedDBShim/issues/334
                if (s.collectionId !== e) break;
                n.push(Gt(s.parent));
            }
            return n;
        }));
    }
    addFieldIndex(t, e) {
        // TODO(indexing): Verify that the auto-incrementing index ID works in
        // Safari & Firefox.
        const n = Zr(t), s = function(t) {
            return {
                indexId: t.indexId,
                collectionGroup: t.collectionGroup,
                fields: t.fields.map((t => [ t.fieldPath.canonicalString(), t.kind ]))
            };
        }(e);
        delete s.indexId;
        // `indexId` is auto-populated by IndexedDb
        const i = n.add(s);
        if (e.indexState) {
            const n = to(t);
            return i.next((t => {
                n.put(Tr(t, this.user, e.indexState.sequenceNumber, e.indexState.offset));
            }));
        }
        return i.next();
    }
    deleteFieldIndex(t, e) {
        const n = Zr(t), s = to(t), i = Xr(t);
        return n.delete(e.indexId).next((() => s.delete(IDBKeyRange.bound([ e.indexId ], [ e.indexId + 1 ], 
        /*lowerOpen=*/ !1, 
        /*upperOpen=*/ !0)))).next((() => i.delete(IDBKeyRange.bound([ e.indexId ], [ e.indexId + 1 ], 
        /*lowerOpen=*/ !1, 
        /*upperOpen=*/ !0))));
    }
    getDocumentsMatchingTarget(t, e) {
        const n = Xr(t);
        let s = !0;
        const i = new Map;
        return Rt.forEach(this.cn(e), (e => this.an(t, e).next((t => {
            s && (s = !!t), i.set(e, t);
        })))).next((() => {
            if (s) {
                let t = gs();
                const s = [];
                return Rt.forEach(i, ((i, r) => {
                    var o;
                    N("IndexedDbIndexManager", `Using index ${o = i, `id=${o.indexId}|cg=${o.collectionGroup}|f=${o.fields.map((t => `${t.fieldPath}:${t.kind}`)).join(",")}`} to execute ${$n(e)}`);
                    const u = function(t, e) {
                        const n = ft(e);
                        if (void 0 === n) return null;
                        for (const e of Bn(t, n.fieldPath)) switch (e.op) {
                          case "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ :
                            return e.value.arrayValue.values || [];

                          case "array-contains" /* Operator.ARRAY_CONTAINS */ :
                            return [ e.value ];
                            // Remaining filters are not array filters.
                                                }
                        return null;
                    }
                    /**
 * Returns the list of values that are used in != or NOT_IN filters. Returns
 * `null` if there are no such filters.
 */ (r, i), c = function(t, e) {
                        const n = new Map;
                        for (const s of dt(e)) for (const e of Bn(t, s.fieldPath)) switch (e.op) {
                          case "==" /* Operator.EQUAL */ :
                          case "in" /* Operator.IN */ :
                            // Encode equality prefix, which is encoded in the index value before
                            // the inequality (e.g. `a == 'a' && b != 'b'` is encoded to
                            // `value != 'ab'`).
                            n.set(s.fieldPath.canonicalString(), e.value);
                            break;

                          case "not-in" /* Operator.NOT_IN */ :
                          case "!=" /* Operator.NOT_EQUAL */ :
                            // NotIn/NotEqual is always a suffix. There cannot be any remaining
                            // segments and hence we can return early here.
                            return n.set(s.fieldPath.canonicalString(), e.value), Array.from(n.values());
                            // Remaining filters cannot be used as notIn bounds.
                                                }
                        return null;
                    }
                    /**
 * Returns a lower bound of field values that can be used as a starting point to
 * scan the index defined by `fieldIndex`. Returns `MIN_VALUE` if no lower bound
 * exists.
 */ (r, i), a = function(t, e) {
                        const n = [];
                        let s = !0;
                        // For each segment, retrieve a lower bound if there is a suitable filter or
                        // startAt.
                                                for (const i of dt(e)) {
                            const e = 0 /* IndexKind.ASCENDING */ === i.kind ? Ln(t, i.fieldPath, t.startAt) : qn(t, i.fieldPath, t.startAt);
                            n.push(e.value), s && (s = e.inclusive);
                        }
                        return new hn(n, s);
                    }
                    /**
 * Returns an upper bound of field values that can be used as an ending point
 * when scanning the index defined by `fieldIndex`. Returns `MAX_VALUE` if no
 * upper bound exists.
 */ (r, i), h = function(t, e) {
                        const n = [];
                        let s = !0;
                        // For each segment, retrieve an upper bound if there is a suitable filter or
                        // endAt.
                                                for (const i of dt(e)) {
                            const e = 0 /* IndexKind.ASCENDING */ === i.kind ? qn(t, i.fieldPath, t.endAt) : Ln(t, i.fieldPath, t.endAt);
                            n.push(e.value), s && (s = e.inclusive);
                        }
                        return new hn(n, s);
                    }(r, i), l = this.hn(i, r, a), f = this.hn(i, r, h), d = this.ln(i, r, c), w = this.fn(i.indexId, u, l, a.inclusive, f, h.inclusive, d);
                    return Rt.forEach(w, (i => n.H(i, e.limit).next((e => {
                        e.forEach((e => {
                            const n = ht.fromSegments(e.documentKey);
                            t.has(n) || (t = t.add(n), s.push(n));
                        }));
                    }))));
                })).next((() => s));
            }
            return Rt.resolve(null);
        }));
    }
    cn(t) {
        let e = this.un.get(t);
        if (e) return e;
        if (0 === t.filters.length) e = [ t ]; else {
            e = Br(gn.create(t.filters, "and" /* CompositeOperator.AND */)).map((e => Mn(t.path, t.collectionGroup, t.orderBy, e.getFilters(), t.limit, t.startAt, t.endAt)));
        }
        return this.un.set(t, e), e;
    }
    /**
     * Constructs a key range query on `DbIndexEntryStore` that unions all
     * bounds.
     */    fn(t, e, n, s, i, r, o) {
        // The number of total index scans we union together. This is similar to a
        // distributed normal form, but adapted for array values. We create a single
        // index range per value in an ARRAY_CONTAINS or ARRAY_CONTAINS_ANY filter
        // combined with the values from the query bounds.
        const u = (null != e ? e.length : 1) * Math.max(n.length, i.length), c = u / (null != e ? e.length : 1), a = [];
        for (let h = 0; h < u; ++h) {
            const u = e ? this.dn(e[h / c]) : Hr, l = this.wn(t, u, n[h % c], s), f = this._n(t, u, i[h % c], r), d = o.map((e => this.wn(t, u, e, 
            /* inclusive= */ !0)));
            a.push(...this.createRange(l, f, d));
        }
        return a;
    }
    /** Generates the lower bound for `arrayValue` and `directionalValue`. */    wn(t, e, n, s) {
        const i = new kr(t, ht.empty(), e, n);
        return s ? i : i.Je();
    }
    /** Generates the upper bound for `arrayValue` and `directionalValue`. */    _n(t, e, n, s) {
        const i = new kr(t, ht.empty(), e, n);
        return s ? i.Je() : i;
    }
    an(t, e) {
        const n = new Or(e), s = null != e.collectionGroup ? e.collectionGroup : e.path.lastSegment();
        return this.getFieldIndexes(t, s).next((t => {
            // Return the index with the most number of segments.
            let e = null;
            for (const s of t) {
                n.tn(s) && (!e || s.fields.length > e.fields.length) && (e = s);
            }
            return e;
        }));
    }
    getIndexType(t, e) {
        let n = 2 /* IndexType.FULL */;
        const s = this.cn(e);
        return Rt.forEach(s, (e => this.an(t, e).next((t => {
            t ? 0 /* IndexType.NONE */ !== n && t.fields.length < function(t) {
                let e = new Ee(at.comparator), n = !1;
                for (const s of t.filters) for (const t of s.getFlattenedFilters()) 
                // __name__ is not an explicit segment of any index, so we don't need to
                // count it.
                t.field.isKeyField() || (
                // ARRAY_CONTAINS or ARRAY_CONTAINS_ANY filters must be counted separately.
                // For instance, it is possible to have an index for "a ARRAY a ASC". Even
                // though these are on the same field, they should be counted as two
                // separate segments in an index.
                "array-contains" /* Operator.ARRAY_CONTAINS */ === t.op || "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ === t.op ? n = !0 : e = e.add(t.field));
                for (const n of t.orderBy) 
                // __name__ is not an explicit segment of any index, so we don't need to
                // count it.
                n.field.isKeyField() || (e = e.add(n.field));
                return e.size + (n ? 1 : 0);
            }(e) && (n = 1 /* IndexType.PARTIAL */) : n = 0 /* IndexType.NONE */;
        })))).next((() => 
        // OR queries have more than one sub-target (one sub-target per DNF term). We currently consider
        // OR queries that have a `limit` to have a partial index. For such queries we perform sorting
        // and apply the limit in memory as a post-processing step.
        function(t) {
            return null !== t.limit;
        }(e) && s.length > 1 && 2 /* IndexType.FULL */ === n ? 1 /* IndexType.PARTIAL */ : n));
    }
    /**
     * Returns the byte encoded form of the directional values in the field index.
     * Returns `null` if the document does not have all fields specified in the
     * index.
     */    mn(t, e) {
        const n = new Nr;
        for (const s of dt(t)) {
            const t = e.data.field(s.fieldPath);
            if (null == t) return null;
            const i = n.He(s.kind);
            br.Ve._e(t, i);
        }
        return n.Qe();
    }
    /** Encodes a single value to the ascending index format. */    dn(t) {
        const e = new Nr;
        return br.Ve._e(t, e.He(0 /* IndexKind.ASCENDING */)), e.Qe();
    }
    /**
     * Returns an encoded form of the document key that sorts based on the key
     * ordering of the field index.
     */    gn(t, e) {
        const n = new Nr;
        return br.Ve._e(We(this.databaseId, e), n.He(function(t) {
            const e = dt(t);
            return 0 === e.length ? 0 /* IndexKind.ASCENDING */ : e[e.length - 1].kind;
        }(t))), n.Qe();
    }
    /**
     * Encodes the given field values according to the specification in `target`.
     * For IN queries, a list of possible values is returned.
     */    ln(t, e, n) {
        if (null === n) return [];
        let s = [];
        s.push(new Nr);
        let i = 0;
        for (const r of dt(t)) {
            const t = n[i++];
            for (const n of s) if (this.yn(e, r.fieldPath) && Je(t)) s = this.pn(s, r, t); else {
                const e = n.He(r.kind);
                br.Ve._e(t, e);
            }
        }
        return this.In(s);
    }
    /**
     * Encodes the given bounds according to the specification in `target`. For IN
     * queries, a list of possible values is returned.
     */    hn(t, e, n) {
        return this.ln(t, e, n.position);
    }
    /** Returns the byte representation for the provided encoders. */    In(t) {
        const e = [];
        for (let n = 0; n < t.length; ++n) e[n] = t[n].Qe();
        return e;
    }
    /**
     * Creates a separate encoder for each element of an array.
     *
     * The method appends each value to all existing encoders (e.g. filter("a",
     * "==", "a1").filter("b", "in", ["b1", "b2"]) becomes ["a1,b1", "a1,b2"]). A
     * list of new encoders is returned.
     */    pn(t, e, n) {
        const s = [ ...t ], i = [];
        for (const t of n.arrayValue.values || []) for (const n of s) {
            const s = new Nr;
            s.seed(n.Qe()), br.Ve._e(t, s.He(e.kind)), i.push(s);
        }
        return i;
    }
    yn(t, e) {
        return !!t.filters.find((t => t instanceof mn && t.field.isEqual(e) && ("in" /* Operator.IN */ === t.op || "not-in" /* Operator.NOT_IN */ === t.op)));
    }
    getFieldIndexes(t, e) {
        const n = Zr(t), s = to(t);
        return (e ? n.j("collectionGroupIndex", IDBKeyRange.bound(e, e)) : n.j()).next((t => {
            const e = [];
            return Rt.forEach(t, (t => s.get([ t.indexId, this.uid ]).next((n => {
                e.push(function(t, e) {
                    const n = e ? new gt(e.sequenceNumber, new It(wr(e.readTime), new ht(Gt(e.documentKey)), e.largestBatchId)) : gt.empty(), s = t.fields.map((([t, e]) => new _t(at.fromServerFormat(t), e)));
                    return new lt(t.indexId, t.collectionGroup, s, n);
                }(t, n));
            })))).next((() => e));
        }));
    }
    getNextCollectionGroupToUpdate(t) {
        return this.getFieldIndexes(t).next((t => 0 === t.length ? null : (t.sort(((t, e) => {
            const n = t.indexState.sequenceNumber - e.indexState.sequenceNumber;
            return 0 !== n ? n : et(t.collectionGroup, e.collectionGroup);
        })), t[0].collectionGroup)));
    }
    updateCollectionGroup(t, e, n) {
        const s = Zr(t), i = to(t);
        return this.Tn(t).next((t => s.j("collectionGroupIndex", IDBKeyRange.bound(e, e)).next((e => Rt.forEach(e, (e => i.put(Tr(e.indexId, this.user, t, n))))))));
    }
    updateIndexEntries(t, e) {
        // Porting Note: `getFieldIndexes()` on Web does not cache index lookups as
        // it could be used across different IndexedDB transactions. As any cached
        // data might be invalidated by other multi-tab clients, we can only trust
        // data within a single IndexedDB transaction. We therefore add a cache
        // here.
        const n = new Map;
        return Rt.forEach(e, ((e, s) => {
            const i = n.get(e.collectionGroup);
            return (i ? Rt.resolve(i) : this.getFieldIndexes(t, e.collectionGroup)).next((i => (n.set(e.collectionGroup, i), 
            Rt.forEach(i, (n => this.En(t, e, n).next((e => {
                const i = this.An(s, n);
                return e.isEqual(i) ? Rt.resolve() : this.vn(t, s, n, e, i);
            })))))));
        }));
    }
    Rn(t, e, n, s) {
        return Xr(t).put({
            indexId: s.indexId,
            uid: this.uid,
            arrayValue: s.arrayValue,
            directionalValue: s.directionalValue,
            orderedDocumentKey: this.gn(n, e.key),
            documentKey: e.key.path.toArray()
        });
    }
    Pn(t, e, n, s) {
        return Xr(t).delete([ s.indexId, this.uid, s.arrayValue, s.directionalValue, this.gn(n, e.key), e.key.path.toArray() ]);
    }
    En(t, e, n) {
        const s = Xr(t);
        let i = new Ee(Mr);
        return s.X({
            index: "documentKeyIndex",
            range: IDBKeyRange.only([ n.indexId, this.uid, this.gn(n, e) ])
        }, ((t, s) => {
            i = i.add(new kr(n.indexId, e, s.arrayValue, s.directionalValue));
        })).next((() => i));
    }
    /** Creates the index entries for the given document. */    An(t, e) {
        let n = new Ee(Mr);
        const s = this.mn(e, t);
        if (null == s) return n;
        const i = ft(e);
        if (null != i) {
            const r = t.data.field(i.fieldPath);
            if (Je(r)) for (const i of r.arrayValue.values || []) n = n.add(new kr(e.indexId, t.key, this.dn(i), s));
        } else n = n.add(new kr(e.indexId, t.key, Hr, s));
        return n;
    }
    /**
     * Updates the index entries for the provided document by deleting entries
     * that are no longer referenced in `newEntries` and adding all newly added
     * entries.
     */    vn(t, e, n, s, i) {
        N("IndexedDbIndexManager", "Updating index entries for document '%s'", e.key);
        const r = [];
        return function(t, e, n, s, i) {
            const r = t.getIterator(), o = e.getIterator();
            let u = ve(r), c = ve(o);
            // Walk through the two sets at the same time, using the ordering defined by
            // `comparator`.
            for (;u || c; ) {
                let t = !1, e = !1;
                if (u && c) {
                    const s = n(u, c);
                    s < 0 ? 
                    // The element was removed if the next element in our ordered
                    // walkthrough is only in `before`.
                    e = !0 : s > 0 && (
                    // The element was added if the next element in our ordered walkthrough
                    // is only in `after`.
                    t = !0);
                } else null != u ? e = !0 : t = !0;
                t ? (s(c), c = ve(o)) : e ? (i(u), u = ve(r)) : (u = ve(r), c = ve(o));
            }
        }(s, i, Mr, (
        /* onAdd= */ s => {
            r.push(this.Rn(t, e, n, s));
        }), (
        /* onRemove= */ s => {
            r.push(this.Pn(t, e, n, s));
        })), Rt.waitFor(r);
    }
    Tn(t) {
        let e = 1;
        return to(t).X({
            index: "sequenceNumberIndex",
            reverse: !0,
            range: IDBKeyRange.upperBound([ this.uid, Number.MAX_SAFE_INTEGER ])
        }, ((t, n, s) => {
            s.done(), e = n.sequenceNumber + 1;
        })).next((() => e));
    }
    /**
     * Returns a new set of IDB ranges that splits the existing range and excludes
     * any values that match the `notInValue` from these ranges. As an example,
     * '[foo > 2 && foo != 3]` becomes  `[foo > 2 && < 3, foo > 3]`.
     */    createRange(t, e, n) {
        // The notIn values need to be sorted and unique so that we can return a
        // sorted set of non-overlapping ranges.
        n = n.sort(((t, e) => Mr(t, e))).filter(((t, e, n) => !e || 0 !== Mr(t, n[e - 1])));
        const s = [];
        s.push(t);
        for (const i of n) {
            const n = Mr(i, t), r = Mr(i, e);
            if (0 === n) 
            // `notInValue` is the lower bound. We therefore need to raise the bound
            // to the next value.
            s[0] = t.Je(); else if (n > 0 && r < 0) 
            // `notInValue` is in the middle of the range
            s.push(i), s.push(i.Je()); else if (r > 0) 
            // `notInValue` (and all following values) are out of the range
            break;
        }
        s.push(e);
        const i = [];
        for (let t = 0; t < s.length; t += 2) {
            // If we encounter two bounds that will create an unmatchable key range,
            // then we return an empty set of key ranges.
            if (this.bn(s[t], s[t + 1])) return [];
            const e = [ s[t].indexId, this.uid, s[t].arrayValue, s[t].directionalValue, Hr, [] ], n = [ s[t + 1].indexId, this.uid, s[t + 1].arrayValue, s[t + 1].directionalValue, Hr, [] ];
            i.push(IDBKeyRange.bound(e, n));
        }
        return i;
    }
    bn(t, e) {
        // If lower bound is greater than the upper bound, then the key
        // range can never be matched.
        return Mr(t, e) > 0;
    }
    getMinOffsetFromCollectionGroup(t, e) {
        return this.getFieldIndexes(t, e).next(eo);
    }
    getMinOffset(t, e) {
        return Rt.mapArray(this.cn(e), (e => this.an(t, e).next((t => t || O())))).next(eo);
    }
}

/**
 * Helper to get a typed SimpleDbStore for the collectionParents
 * document store.
 */ function Yr(t) {
    return _e(t, "collectionParents");
}

/**
 * Helper to get a typed SimpleDbStore for the index entry object store.
 */ function Xr(t) {
    return _e(t, "indexEntries");
}

/**
 * Helper to get a typed SimpleDbStore for the index configuration object store.
 */ function Zr(t) {
    return _e(t, "indexConfiguration");
}

/**
 * Helper to get a typed SimpleDbStore for the index state object store.
 */ function to(t) {
    return _e(t, "indexState");
}

function eo(t) {
    F(0 !== t.length);
    let e = t[0].indexState.offset, n = e.largestBatchId;
    for (let s = 1; s < t.length; s++) {
        const i = t[s].indexState.offset;
        Tt(i, e) < 0 && (e = i), n < i.largestBatchId && (n = i.largestBatchId);
    }
    return new It(e.readTime, e.documentKey, n);
}

/**
 * @license
 * Copyright 2018 Google LLC
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
 */ const no = {
    didRun: !1,
    sequenceNumbersCollected: 0,
    targetsRemoved: 0,
    documentsRemoved: 0
};

class so {
    constructor(
    // When we attempt to collect, we will only do so if the cache size is greater than this
    // threshold. Passing `COLLECTION_DISABLED` here will cause collection to always be skipped.
    t, 
    // The percentage of sequence numbers that we will attempt to collect
    e, 
    // A cap on the total number of sequence numbers that will be collected. This prevents
    // us from collecting a huge number of sequence numbers if the cache has grown very large.
    n) {
        this.cacheSizeCollectionThreshold = t, this.percentileToCollect = e, this.maximumSequenceNumbersToCollect = n;
    }
    static withCacheSize(t) {
        return new so(t, so.DEFAULT_COLLECTION_PERCENTILE, so.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Delete a mutation batch and the associated document mutations.
 * @returns A PersistencePromise of the document mutations that were removed.
 */
function io(t, e, n) {
    const s = t.store("mutations"), i = t.store("documentMutations"), r = [], o = IDBKeyRange.only(n.batchId);
    let u = 0;
    const c = s.X({
        range: o
    }, ((t, e, n) => (u++, n.delete())));
    r.push(c.next((() => {
        F(1 === u);
    })));
    const a = [];
    for (const t of n.mutations) {
        const s = zt(e, t.key.path, n.batchId);
        r.push(i.delete(s)), a.push(t.key);
    }
    return Rt.waitFor(r).next((() => a));
}

/**
 * Returns an approximate size for the given document.
 */ function ro(t) {
    if (!t) return 0;
    let e;
    if (t.document) e = t.document; else if (t.unknownDocument) e = t.unknownDocument; else {
        if (!t.noDocument) throw O();
        e = t.noDocument;
    }
    return JSON.stringify(e).length;
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/** A mutation queue for a specific user, backed by IndexedDB. */ so.DEFAULT_COLLECTION_PERCENTILE = 10, 
so.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT = 1e3, so.DEFAULT = new so(41943040, so.DEFAULT_COLLECTION_PERCENTILE, so.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT), 
so.DISABLED = new so(-1, 0, 0);

class oo {
    constructor(
    /**
     * The normalized userId (e.g. null UID => "" userId) used to store /
     * retrieve mutations.
     */
    t, e, n, s) {
        this.userId = t, this.serializer = e, this.indexManager = n, this.referenceDelegate = s, 
        /**
         * Caches the document keys for pending mutation batches. If the mutation
         * has been removed from IndexedDb, the cached value may continue to
         * be used to retrieve the batch's document keys. To remove a cached value
         * locally, `removeCachedMutationKeys()` should be invoked either directly
         * or through `removeMutationBatches()`.
         *
         * With multi-tab, when the primary client acknowledges or rejects a mutation,
         * this cache is used by secondary clients to invalidate the local
         * view of the documents that were previously affected by the mutation.
         */
        // PORTING NOTE: Multi-tab only.
        this.Vn = {};
    }
    /**
     * Creates a new mutation queue for the given user.
     * @param user - The user for which to create a mutation queue.
     * @param serializer - The serializer to use when persisting to IndexedDb.
     */    static de(t, e, n, s) {
        // TODO(mcg): Figure out what constraints there are on userIDs
        // In particular, are there any reserved characters? are empty ids allowed?
        // For the moment store these together in the same mutations table assuming
        // that empty userIDs aren't allowed.
        F("" !== t.uid);
        const i = t.isAuthenticated() ? t.uid : "";
        return new oo(i, e, n, s);
    }
    checkEmpty(t) {
        let e = !0;
        const n = IDBKeyRange.bound([ this.userId, Number.NEGATIVE_INFINITY ], [ this.userId, Number.POSITIVE_INFINITY ]);
        return co(t).X({
            index: "userMutationsIndex",
            range: n
        }, ((t, n, s) => {
            e = !1, s.done();
        })).next((() => e));
    }
    addMutationBatch(t, e, n, s) {
        const i = ao(t), r = co(t);
        // The IndexedDb implementation in Chrome (and Firefox) does not handle
        // compound indices that include auto-generated keys correctly. To ensure
        // that the index entry is added correctly in all browsers, we perform two
        // writes: The first write is used to retrieve the next auto-generated Batch
        // ID, and the second write populates the index and stores the actual
        // mutation batch.
        // See: https://bugs.chromium.org/p/chromium/issues/detail?id=701972
        // We write an empty object to obtain key
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return r.add({}).next((o => {
            F("number" == typeof o);
            const u = new Zs(o, e, n, s), c = function(t, e, n) {
                const s = n.baseMutations.map((e => ji(t.fe, e))), i = n.mutations.map((e => ji(t.fe, e)));
                return {
                    userId: e,
                    batchId: n.batchId,
                    localWriteTimeMs: n.localWriteTime.toMillis(),
                    baseMutations: s,
                    mutations: i
                };
            }(this.serializer, this.userId, u), a = [];
            let h = new Ee(((t, e) => et(t.canonicalString(), e.canonicalString())));
            for (const t of s) {
                const e = zt(this.userId, t.key.path, o);
                h = h.add(t.key.path.popLast()), a.push(r.put(c)), a.push(i.put(e, Wt));
            }
            return h.forEach((e => {
                a.push(this.indexManager.addToCollectionParentIndex(t, e));
            })), t.addOnCommittedListener((() => {
                this.Vn[o] = u.keys();
            })), Rt.waitFor(a).next((() => u));
        }));
    }
    lookupMutationBatch(t, e) {
        return co(t).get(e).next((t => t ? (F(t.userId === this.userId), _r(this.serializer, t)) : null));
    }
    /**
     * Returns the document keys for the mutation batch with the given batchId.
     * For primary clients, this method returns `null` after
     * `removeMutationBatches()` has been called. Secondary clients return a
     * cached result until `removeCachedMutationKeys()` is invoked.
     */
    // PORTING NOTE: Multi-tab only.
    Sn(t, e) {
        return this.Vn[e] ? Rt.resolve(this.Vn[e]) : this.lookupMutationBatch(t, e).next((t => {
            if (t) {
                const n = t.keys();
                return this.Vn[e] = n, n;
            }
            return null;
        }));
    }
    getNextMutationBatchAfterBatchId(t, e) {
        const n = e + 1, s = IDBKeyRange.lowerBound([ this.userId, n ]);
        let i = null;
        return co(t).X({
            index: "userMutationsIndex",
            range: s
        }, ((t, e, s) => {
            e.userId === this.userId && (F(e.batchId >= n), i = _r(this.serializer, e)), s.done();
        })).next((() => i));
    }
    getHighestUnacknowledgedBatchId(t) {
        const e = IDBKeyRange.upperBound([ this.userId, Number.POSITIVE_INFINITY ]);
        let n = -1;
        return co(t).X({
            index: "userMutationsIndex",
            range: e,
            reverse: !0
        }, ((t, e, s) => {
            n = e.batchId, s.done();
        })).next((() => n));
    }
    getAllMutationBatches(t) {
        const e = IDBKeyRange.bound([ this.userId, -1 ], [ this.userId, Number.POSITIVE_INFINITY ]);
        return co(t).j("userMutationsIndex", e).next((t => t.map((t => _r(this.serializer, t)))));
    }
    getAllMutationBatchesAffectingDocumentKey(t, e) {
        // Scan the document-mutation index starting with a prefix starting with
        // the given documentKey.
        const n = jt(this.userId, e.path), s = IDBKeyRange.lowerBound(n), i = [];
        return ao(t).X({
            range: s
        }, ((n, s, r) => {
            const [o, u, c] = n, a = Gt(u);
            // Only consider rows matching exactly the specific key of
            // interest. Note that because we order by path first, and we
            // order terminators before path separators, we'll encounter all
            // the index rows for documentKey contiguously. In particular, all
            // the rows for documentKey will occur before any rows for
            // documents nested in a subcollection beneath documentKey so we
            // can stop as soon as we hit any such row.
                        if (o === this.userId && e.path.isEqual(a)) 
            // Look up the mutation batch in the store.
            return co(t).get(c).next((t => {
                if (!t) throw O();
                F(t.userId === this.userId), i.push(_r(this.serializer, t));
            }));
            r.done();
        })).next((() => i));
    }
    getAllMutationBatchesAffectingDocumentKeys(t, e) {
        let n = new Ee(et);
        const s = [];
        return e.forEach((e => {
            const i = jt(this.userId, e.path), r = IDBKeyRange.lowerBound(i), o = ao(t).X({
                range: r
            }, ((t, s, i) => {
                const [r, o, u] = t, c = Gt(o);
                // Only consider rows matching exactly the specific key of
                // interest. Note that because we order by path first, and we
                // order terminators before path separators, we'll encounter all
                // the index rows for documentKey contiguously. In particular, all
                // the rows for documentKey will occur before any rows for
                // documents nested in a subcollection beneath documentKey so we
                // can stop as soon as we hit any such row.
                                r === this.userId && e.path.isEqual(c) ? n = n.add(u) : i.done();
            }));
            s.push(o);
        })), Rt.waitFor(s).next((() => this.Dn(t, n)));
    }
    getAllMutationBatchesAffectingQuery(t, e) {
        const n = e.path, s = n.length + 1, i = jt(this.userId, n), r = IDBKeyRange.lowerBound(i);
        // Collect up unique batchIDs encountered during a scan of the index. Use a
        // SortedSet to accumulate batch IDs so they can be traversed in order in a
        // scan of the main table.
        let o = new Ee(et);
        return ao(t).X({
            range: r
        }, ((t, e, i) => {
            const [r, u, c] = t, a = Gt(u);
            r === this.userId && n.isPrefixOf(a) ? 
            // Rows with document keys more than one segment longer than the
            // query path can't be matches. For example, a query on 'rooms'
            // can't match the document /rooms/abc/messages/xyx.
            // TODO(mcg): we'll need a different scanner when we implement
            // ancestor queries.
            a.length === s && (o = o.add(c)) : i.done();
        })).next((() => this.Dn(t, o)));
    }
    Dn(t, e) {
        const n = [], s = [];
        // TODO(rockwood): Implement this using iterate.
        return e.forEach((e => {
            s.push(co(t).get(e).next((t => {
                if (null === t) throw O();
                F(t.userId === this.userId), n.push(_r(this.serializer, t));
            })));
        })), Rt.waitFor(s).next((() => n));
    }
    removeMutationBatch(t, e) {
        return io(t.ht, this.userId, e).next((n => (t.addOnCommittedListener((() => {
            this.Cn(e.batchId);
        })), Rt.forEach(n, (e => this.referenceDelegate.markPotentiallyOrphaned(t, e))))));
    }
    /**
     * Clears the cached keys for a mutation batch. This method should be
     * called by secondary clients after they process mutation updates.
     *
     * Note that this method does not have to be called from primary clients as
     * the corresponding cache entries are cleared when an acknowledged or
     * rejected batch is removed from the mutation queue.
     */
    // PORTING NOTE: Multi-tab only
    Cn(t) {
        delete this.Vn[t];
    }
    performConsistencyCheck(t) {
        return this.checkEmpty(t).next((e => {
            if (!e) return Rt.resolve();
            // Verify that there are no entries in the documentMutations index if
            // the queue is empty.
                        const n = IDBKeyRange.lowerBound([ this.userId ]);
            const s = [];
            return ao(t).X({
                range: n
            }, ((t, e, n) => {
                if (t[0] === this.userId) {
                    const e = Gt(t[1]);
                    s.push(e);
                } else n.done();
            })).next((() => {
                F(0 === s.length);
            }));
        }));
    }
    containsKey(t, e) {
        return uo(t, this.userId, e);
    }
    // PORTING NOTE: Multi-tab only (state is held in memory in other clients).
    /** Returns the mutation queue's metadata from IndexedDb. */
    xn(t) {
        return ho(t).get(this.userId).next((t => t || {
            userId: this.userId,
            lastAcknowledgedBatchId: -1,
            lastStreamToken: ""
        }));
    }
}

/**
 * @returns true if the mutation queue for the given user contains a pending
 *         mutation for the given key.
 */ function uo(t, e, n) {
    const s = jt(e, n.path), i = s[1], r = IDBKeyRange.lowerBound(s);
    let o = !1;
    return ao(t).X({
        range: r,
        Y: !0
    }, ((t, n, s) => {
        const [r, u, /*batchID*/ c] = t;
        r === e && u === i && (o = !0), s.done();
    })).next((() => o));
}

/** Returns true if any mutation queue contains the given document. */
/**
 * Helper to get a typed SimpleDbStore for the mutations object store.
 */
function co(t) {
    return _e(t, "mutations");
}

/**
 * Helper to get a typed SimpleDbStore for the mutationQueues object store.
 */ function ao(t) {
    return _e(t, "documentMutations");
}

/**
 * Helper to get a typed SimpleDbStore for the mutationQueues object store.
 */ function ho(t) {
    return _e(t, "mutationQueues");
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/** Offset to ensure non-overlapping target ids. */
/**
 * Generates monotonically increasing target IDs for sending targets to the
 * watch stream.
 *
 * The client constructs two generators, one for the target cache, and one for
 * for the sync engine (to generate limbo documents targets). These
 * generators produce non-overlapping IDs (by using even and odd IDs
 * respectively).
 *
 * By separating the target ID space, the query cache can generate target IDs
 * that persist across client restarts, while sync engine can independently
 * generate in-memory target IDs that are transient and can be reused after a
 * restart.
 */
class lo {
    constructor(t) {
        this.Nn = t;
    }
    next() {
        return this.Nn += 2, this.Nn;
    }
    static kn() {
        // The target cache generator must return '2' in its first call to `next()`
        // as there is no differentiation in the protocol layer between an unset
        // number and the number '0'. If we were to sent a target with target ID
        // '0', the backend would consider it unset and replace it with its own ID.
        return new lo(0);
    }
    static Mn() {
        // Sync engine assigns target IDs for limbo document detection.
        return new lo(-1);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ class fo {
    constructor(t, e) {
        this.referenceDelegate = t, this.serializer = e;
    }
    // PORTING NOTE: We don't cache global metadata for the target cache, since
    // some of it (in particular `highestTargetId`) can be modified by secondary
    // tabs. We could perhaps be more granular (and e.g. still cache
    // `lastRemoteSnapshotVersion` in memory) but for simplicity we currently go
    // to IndexedDb whenever we need to read metadata. We can revisit if it turns
    // out to have a meaningful performance impact.
    allocateTargetId(t) {
        return this.$n(t).next((e => {
            const n = new lo(e.highestTargetId);
            return e.highestTargetId = n.next(), this.On(t, e).next((() => e.highestTargetId));
        }));
    }
    getLastRemoteSnapshotVersion(t) {
        return this.$n(t).next((t => rt.fromTimestamp(new it(t.lastRemoteSnapshotVersion.seconds, t.lastRemoteSnapshotVersion.nanoseconds))));
    }
    getHighestSequenceNumber(t) {
        return this.$n(t).next((t => t.highestListenSequenceNumber));
    }
    setTargetsMetadata(t, e, n) {
        return this.$n(t).next((s => (s.highestListenSequenceNumber = e, n && (s.lastRemoteSnapshotVersion = n.toTimestamp()), 
        e > s.highestListenSequenceNumber && (s.highestListenSequenceNumber = e), this.On(t, s))));
    }
    addTargetData(t, e) {
        return this.Fn(t, e).next((() => this.$n(t).next((n => (n.targetCount += 1, this.Bn(e, n), 
        this.On(t, n))))));
    }
    updateTargetData(t, e) {
        return this.Fn(t, e);
    }
    removeTargetData(t, e) {
        return this.removeMatchingKeysForTargetId(t, e.targetId).next((() => wo(t).delete(e.targetId))).next((() => this.$n(t))).next((e => (F(e.targetCount > 0), 
        e.targetCount -= 1, this.On(t, e))));
    }
    /**
     * Drops any targets with sequence number less than or equal to the upper bound, excepting those
     * present in `activeTargetIds`. Document associations for the removed targets are also removed.
     * Returns the number of targets removed.
     */    removeTargets(t, e, n) {
        let s = 0;
        const i = [];
        return wo(t).X(((r, o) => {
            const u = mr(o);
            u.sequenceNumber <= e && null === n.get(u.targetId) && (s++, i.push(this.removeTargetData(t, u)));
        })).next((() => Rt.waitFor(i))).next((() => s));
    }
    /**
     * Call provided function with each `TargetData` that we have cached.
     */    forEachTarget(t, e) {
        return wo(t).X(((t, n) => {
            const s = mr(n);
            e(s);
        }));
    }
    $n(t) {
        return _o(t).get("targetGlobalKey").next((t => (F(null !== t), t)));
    }
    On(t, e) {
        return _o(t).put("targetGlobalKey", e);
    }
    Fn(t, e) {
        return wo(t).put(gr(this.serializer, e));
    }
    /**
     * In-place updates the provided metadata to account for values in the given
     * TargetData. Saving is done separately. Returns true if there were any
     * changes to the metadata.
     */    Bn(t, e) {
        let n = !1;
        return t.targetId > e.highestTargetId && (e.highestTargetId = t.targetId, n = !0), 
        t.sequenceNumber > e.highestListenSequenceNumber && (e.highestListenSequenceNumber = t.sequenceNumber, 
        n = !0), n;
    }
    getTargetCount(t) {
        return this.$n(t).next((t => t.targetCount));
    }
    getTargetData(t, e) {
        // Iterating by the canonicalId may yield more than one result because
        // canonicalId values are not required to be unique per target. This query
        // depends on the queryTargets index to be efficient.
        const n = $n(e), s = IDBKeyRange.bound([ n, Number.NEGATIVE_INFINITY ], [ n, Number.POSITIVE_INFINITY ]);
        let i = null;
        return wo(t).X({
            range: s,
            index: "queryTargetsIndex"
        }, ((t, n, s) => {
            const r = mr(n);
            // After finding a potential match, check that the target is
            // actually equal to the requested target.
                        On(e, r.target) && (i = r, s.done());
        })).next((() => i));
    }
    addMatchingKeys(t, e, n) {
        // PORTING NOTE: The reverse index (documentsTargets) is maintained by
        // IndexedDb.
        const s = [], i = mo(t);
        return e.forEach((e => {
            const r = qt(e.path);
            s.push(i.put({
                targetId: n,
                path: r
            })), s.push(this.referenceDelegate.addReference(t, n, e));
        })), Rt.waitFor(s);
    }
    removeMatchingKeys(t, e, n) {
        // PORTING NOTE: The reverse index (documentsTargets) is maintained by
        // IndexedDb.
        const s = mo(t);
        return Rt.forEach(e, (e => {
            const i = qt(e.path);
            return Rt.waitFor([ s.delete([ n, i ]), this.referenceDelegate.removeReference(t, n, e) ]);
        }));
    }
    removeMatchingKeysForTargetId(t, e) {
        const n = mo(t), s = IDBKeyRange.bound([ e ], [ e + 1 ], 
        /*lowerOpen=*/ !1, 
        /*upperOpen=*/ !0);
        return n.delete(s);
    }
    getMatchingKeysForTargetId(t, e) {
        const n = IDBKeyRange.bound([ e ], [ e + 1 ], 
        /*lowerOpen=*/ !1, 
        /*upperOpen=*/ !0), s = mo(t);
        let i = gs();
        return s.X({
            range: n,
            Y: !0
        }, ((t, e, n) => {
            const s = Gt(t[1]), r = new ht(s);
            i = i.add(r);
        })).next((() => i));
    }
    containsKey(t, e) {
        const n = qt(e.path), s = IDBKeyRange.bound([ n ], [ st(n) ], 
        /*lowerOpen=*/ !1, 
        /*upperOpen=*/ !0);
        let i = 0;
        return mo(t).X({
            index: "documentTargetsIndex",
            Y: !0,
            range: s
        }, (([t, e], n, s) => {
            // Having a sentinel row for a document does not count as containing that document;
            // For the target cache, containing the document means the document is part of some
            // target.
            0 !== t && (i++, s.done());
        })).next((() => i > 0));
    }
    /**
     * Looks up a TargetData entry by target ID.
     *
     * @param targetId - The target ID of the TargetData entry to look up.
     * @returns The cached TargetData entry, or null if the cache has no entry for
     * the target.
     */
    // PORTING NOTE: Multi-tab only.
    le(t, e) {
        return wo(t).get(e).next((t => t ? mr(t) : null));
    }
}

/**
 * Helper to get a typed SimpleDbStore for the queries object store.
 */ function wo(t) {
    return _e(t, "targets");
}

/**
 * Helper to get a typed SimpleDbStore for the target globals object store.
 */ function _o(t) {
    return _e(t, "targetGlobal");
}

/**
 * Helper to get a typed SimpleDbStore for the document target object store.
 */ function mo(t) {
    return _e(t, "targetDocuments");
}

/**
 * @license
 * Copyright 2020 Google LLC
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
 */ function go([t, e], [n, s]) {
    const i = et(t, n);
    return 0 === i ? et(e, s) : i;
}

/**
 * Used to calculate the nth sequence number. Keeps a rolling buffer of the
 * lowest n values passed to `addElement`, and finally reports the largest of
 * them in `maxValue`.
 */ class yo {
    constructor(t) {
        this.Ln = t, this.buffer = new Ee(go), this.qn = 0;
    }
    Un() {
        return ++this.qn;
    }
    Kn(t) {
        const e = [ t, this.Un() ];
        if (this.buffer.size < this.Ln) this.buffer = this.buffer.add(e); else {
            const t = this.buffer.last();
            go(e, t) < 0 && (this.buffer = this.buffer.delete(t).add(e));
        }
    }
    get maxValue() {
        // Guaranteed to be non-empty. If we decide we are not collecting any
        // sequence numbers, nthSequenceNumber below short-circuits. If we have
        // decided that we are collecting n sequence numbers, it's because n is some
        // percentage of the existing sequence numbers. That means we should never
        // be in a situation where we are collecting sequence numbers but don't
        // actually have any.
        return this.buffer.last()[0];
    }
}

/**
 * This class is responsible for the scheduling of LRU garbage collection. It handles checking
 * whether or not GC is enabled, as well as which delay to use before the next run.
 */ class po {
    constructor(t, e, n) {
        this.garbageCollector = t, this.asyncQueue = e, this.localStore = n, this.Gn = null;
    }
    start() {
        -1 !== this.garbageCollector.params.cacheSizeCollectionThreshold && this.Qn(6e4);
    }
    stop() {
        this.Gn && (this.Gn.cancel(), this.Gn = null);
    }
    get started() {
        return null !== this.Gn;
    }
    Qn(t) {
        N("LruGarbageCollector", `Garbage collection scheduled in ${t}ms`), this.Gn = this.asyncQueue.enqueueAfterDelay("lru_garbage_collection" /* TimerId.LruGarbageCollection */ , t, (async () => {
            this.Gn = null;
            try {
                await this.localStore.collectGarbage(this.garbageCollector);
            } catch (t) {
                Dt(t) ? N("LruGarbageCollector", "Ignoring IndexedDB error during garbage collection: ", t) : await vt(t);
            }
            await this.Qn(3e5);
        }));
    }
}

/**
 * Implements the steps for LRU garbage collection.
 */ class Io {
    constructor(t, e) {
        this.jn = t, this.params = e;
    }
    calculateTargetCount(t, e) {
        return this.jn.zn(t).next((t => Math.floor(e / 100 * t)));
    }
    nthSequenceNumber(t, e) {
        if (0 === e) return Rt.resolve(Ot.ct);
        const n = new yo(e);
        return this.jn.forEachTarget(t, (t => n.Kn(t.sequenceNumber))).next((() => this.jn.Wn(t, (t => n.Kn(t))))).next((() => n.maxValue));
    }
    removeTargets(t, e, n) {
        return this.jn.removeTargets(t, e, n);
    }
    removeOrphanedDocuments(t, e) {
        return this.jn.removeOrphanedDocuments(t, e);
    }
    collect(t, e) {
        return -1 === this.params.cacheSizeCollectionThreshold ? (N("LruGarbageCollector", "Garbage collection skipped; disabled"), 
        Rt.resolve(no)) : this.getCacheSize(t).next((n => n < this.params.cacheSizeCollectionThreshold ? (N("LruGarbageCollector", `Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`), 
        no) : this.Hn(t, e)));
    }
    getCacheSize(t) {
        return this.jn.getCacheSize(t);
    }
    Hn(t, e) {
        let n, s, i, r, o, c, a;
        const h = Date.now();
        return this.calculateTargetCount(t, this.params.percentileToCollect).next((e => (
        // Cap at the configured max
        e > this.params.maximumSequenceNumbersToCollect ? (N("LruGarbageCollector", `Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${e}`), 
        s = this.params.maximumSequenceNumbersToCollect) : s = e, r = Date.now(), this.nthSequenceNumber(t, s)))).next((s => (n = s, 
        o = Date.now(), this.removeTargets(t, n, e)))).next((e => (i = e, c = Date.now(), 
        this.removeOrphanedDocuments(t, n)))).next((t => {
            if (a = Date.now(), C() <= logger.LogLevel.DEBUG) {
                N("LruGarbageCollector", `LRU Garbage Collection\n\tCounted targets in ${r - h}ms\n\tDetermined least recently used ${s} in ` + (o - r) + "ms\n" + `\tRemoved ${i} targets in ` + (c - o) + "ms\n" + `\tRemoved ${t} documents in ` + (a - c) + "ms\n" + `Total Duration: ${a - h}ms`);
            }
            return Rt.resolve({
                didRun: !0,
                sequenceNumbersCollected: s,
                targetsRemoved: i,
                documentsRemoved: t
            });
        }));
    }
}

function To(t, e) {
    return new Io(t, e);
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/** Provides LRU functionality for IndexedDB persistence. */ class Eo {
    constructor(t, e) {
        this.db = t, this.garbageCollector = To(this, e);
    }
    zn(t) {
        const e = this.Jn(t);
        return this.db.getTargetCache().getTargetCount(t).next((t => e.next((e => t + e))));
    }
    Jn(t) {
        let e = 0;
        return this.Wn(t, (t => {
            e++;
        })).next((() => e));
    }
    forEachTarget(t, e) {
        return this.db.getTargetCache().forEachTarget(t, e);
    }
    Wn(t, e) {
        return this.Yn(t, ((t, n) => e(n)));
    }
    addReference(t, e, n) {
        return Ao(t, n);
    }
    removeReference(t, e, n) {
        return Ao(t, n);
    }
    removeTargets(t, e, n) {
        return this.db.getTargetCache().removeTargets(t, e, n);
    }
    markPotentiallyOrphaned(t, e) {
        return Ao(t, e);
    }
    /**
     * Returns true if anything would prevent this document from being garbage
     * collected, given that the document in question is not present in any
     * targets and has a sequence number less than or equal to the upper bound for
     * the collection run.
     */    Xn(t, e) {
        return function(t, e) {
            let n = !1;
            return ho(t).Z((s => uo(t, s, e).next((t => (t && (n = !0), Rt.resolve(!t)))))).next((() => n));
        }(t, e);
    }
    removeOrphanedDocuments(t, e) {
        const n = this.db.getRemoteDocumentCache().newChangeBuffer(), s = [];
        let i = 0;
        return this.Yn(t, ((r, o) => {
            if (o <= e) {
                const e = this.Xn(t, r).next((e => {
                    if (!e) 
                    // Our size accounting requires us to read all documents before
                    // removing them.
                    return i++, n.getEntry(t, r).next((() => (n.removeEntry(r, rt.min()), mo(t).delete([ 0, qt(r.path) ]))));
                }));
                s.push(e);
            }
        })).next((() => Rt.waitFor(s))).next((() => n.apply(t))).next((() => i));
    }
    removeTarget(t, e) {
        const n = e.withSequenceNumber(t.currentSequenceNumber);
        return this.db.getTargetCache().updateTargetData(t, n);
    }
    updateLimboDocument(t, e) {
        return Ao(t, e);
    }
    /**
     * Call provided function for each document in the cache that is 'orphaned'. Orphaned
     * means not a part of any target, so the only entry in the target-document index for
     * that document will be the sentinel row (targetId 0), which will also have the sequence
     * number for the last time the document was accessed.
     */    Yn(t, e) {
        const n = mo(t);
        let s, i = Ot.ct;
        return n.X({
            index: "documentTargetsIndex"
        }, (([t, n], {path: r, sequenceNumber: o}) => {
            0 === t ? (
            // if nextToReport is valid, report it, this is a new key so the
            // last one must not be a member of any targets.
            i !== Ot.ct && e(new ht(Gt(s)), i), 
            // set nextToReport to be this sequence number. It's the next one we
            // might report, if we don't find any targets for this document.
            // Note that the sequence number must be defined when the targetId
            // is 0.
            i = o, s = r) : 
            // set nextToReport to be invalid, we know we don't need to report
            // this one since we found a target for it.
            i = Ot.ct;
        })).next((() => {
            // Since we report sequence numbers after getting to the next key, we
            // need to check if the last key we iterated over was an orphaned
            // document and report it.
            i !== Ot.ct && e(new ht(Gt(s)), i);
        }));
    }
    getCacheSize(t) {
        return this.db.getRemoteDocumentCache().getSize(t);
    }
}

function Ao(t, e) {
    return mo(t).put(
    /**
 * @returns A value suitable for writing a sentinel row in the target-document
 * store.
 */
    function(t, e) {
        return {
            targetId: 0,
            path: qt(t.path),
            sequenceNumber: e
        };
    }(e, t.currentSequenceNumber));
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * An in-memory buffer of entries to be written to a RemoteDocumentCache.
 * It can be used to batch up a set of changes to be written to the cache, but
 * additionally supports reading entries back with the `getEntry()` method,
 * falling back to the underlying RemoteDocumentCache if no entry is
 * buffered.
 *
 * Entries added to the cache *must* be read first. This is to facilitate
 * calculating the size delta of the pending changes.
 *
 * PORTING NOTE: This class was implemented then removed from other platforms.
 * If byte-counting ends up being needed on the other platforms, consider
 * porting this class as part of that implementation work.
 */ class vo {
    constructor() {
        // A mapping of document key to the new cache entry that should be written.
        this.changes = new os((t => t.toString()), ((t, e) => t.isEqual(e))), this.changesApplied = !1;
    }
    /**
     * Buffers a `RemoteDocumentCache.addEntry()` call.
     *
     * You can only modify documents that have already been retrieved via
     * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
     */    addEntry(t) {
        this.assertNotApplied(), this.changes.set(t.key, t);
    }
    /**
     * Buffers a `RemoteDocumentCache.removeEntry()` call.
     *
     * You can only remove documents that have already been retrieved via
     * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
     */    removeEntry(t, e) {
        this.assertNotApplied(), this.changes.set(t, an.newInvalidDocument(t).setReadTime(e));
    }
    /**
     * Looks up an entry in the cache. The buffered changes will first be checked,
     * and if no buffered change applies, this will forward to
     * `RemoteDocumentCache.getEntry()`.
     *
     * @param transaction - The transaction in which to perform any persistence
     *     operations.
     * @param documentKey - The key of the entry to look up.
     * @returns The cached document or an invalid document if we have nothing
     * cached.
     */    getEntry(t, e) {
        this.assertNotApplied();
        const n = this.changes.get(e);
        return void 0 !== n ? Rt.resolve(n) : this.getFromCache(t, e);
    }
    /**
     * Looks up several entries in the cache, forwarding to
     * `RemoteDocumentCache.getEntry()`.
     *
     * @param transaction - The transaction in which to perform any persistence
     *     operations.
     * @param documentKeys - The keys of the entries to look up.
     * @returns A map of cached documents, indexed by key. If an entry cannot be
     *     found, the corresponding key will be mapped to an invalid document.
     */    getEntries(t, e) {
        return this.getAllFromCache(t, e);
    }
    /**
     * Applies buffered changes to the underlying RemoteDocumentCache, using
     * the provided transaction.
     */    apply(t) {
        return this.assertNotApplied(), this.changesApplied = !0, this.applyChanges(t);
    }
    /** Helper to assert this.changes is not null  */    assertNotApplied() {}
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * The RemoteDocumentCache for IndexedDb. To construct, invoke
 * `newIndexedDbRemoteDocumentCache()`.
 */ class Ro {
    constructor(t) {
        this.serializer = t;
    }
    setIndexManager(t) {
        this.indexManager = t;
    }
    /**
     * Adds the supplied entries to the cache.
     *
     * All calls of `addEntry` are required to go through the RemoteDocumentChangeBuffer
     * returned by `newChangeBuffer()` to ensure proper accounting of metadata.
     */    addEntry(t, e, n) {
        return So(t).put(n);
    }
    /**
     * Removes a document from the cache.
     *
     * All calls of `removeEntry`  are required to go through the RemoteDocumentChangeBuffer
     * returned by `newChangeBuffer()` to ensure proper accounting of metadata.
     */    removeEntry(t, e, n) {
        return So(t).delete(
        /**
 * Returns a key that can be used for document lookups via the primary key of
 * the DbRemoteDocument object store.
 */
        function(t, e) {
            const n = t.path.toArray();
            return [ 
            /* prefix path */ n.slice(0, n.length - 2), 
            /* collection id */ n[n.length - 2], fr(e), 
            /* document id */ n[n.length - 1] ];
        }
        /**
 * Returns a key that can be used for document lookups on the
 * `DbRemoteDocumentDocumentCollectionGroupIndex` index.
 */ (e, n));
    }
    /**
     * Updates the current cache size.
     *
     * Callers to `addEntry()` and `removeEntry()` *must* call this afterwards to update the
     * cache's metadata.
     */    updateMetadata(t, e) {
        return this.getMetadata(t).next((n => (n.byteSize += e, this.Zn(t, n))));
    }
    getEntry(t, e) {
        let n = an.newInvalidDocument(e);
        return So(t).X({
            index: "documentKeyIndex",
            range: IDBKeyRange.only(Do(e))
        }, ((t, s) => {
            n = this.ts(e, s);
        })).next((() => n));
    }
    /**
     * Looks up an entry in the cache.
     *
     * @param documentKey - The key of the entry to look up.
     * @returns The cached document entry and its size.
     */    es(t, e) {
        let n = {
            size: 0,
            document: an.newInvalidDocument(e)
        };
        return So(t).X({
            index: "documentKeyIndex",
            range: IDBKeyRange.only(Do(e))
        }, ((t, s) => {
            n = {
                document: this.ts(e, s),
                size: ro(s)
            };
        })).next((() => n));
    }
    getEntries(t, e) {
        let n = cs();
        return this.ns(t, e, ((t, e) => {
            const s = this.ts(t, e);
            n = n.insert(t, s);
        })).next((() => n));
    }
    /**
     * Looks up several entries in the cache.
     *
     * @param documentKeys - The set of keys entries to look up.
     * @returns A map of documents indexed by key and a map of sizes indexed by
     *     key (zero if the document does not exist).
     */    ss(t, e) {
        let n = cs(), s = new pe(ht.comparator);
        return this.ns(t, e, ((t, e) => {
            const i = this.ts(t, e);
            n = n.insert(t, i), s = s.insert(t, ro(e));
        })).next((() => ({
            documents: n,
            rs: s
        })));
    }
    ns(t, e, n) {
        if (e.isEmpty()) return Rt.resolve();
        let s = new Ee(xo);
        e.forEach((t => s = s.add(t)));
        const i = IDBKeyRange.bound(Do(s.first()), Do(s.last())), r = s.getIterator();
        let o = r.getNext();
        return So(t).X({
            index: "documentKeyIndex",
            range: i
        }, ((t, e, s) => {
            const i = ht.fromSegments([ ...e.prefixPath, e.collectionGroup, e.documentId ]);
            // Go through keys not found in cache.
                        for (;o && xo(o, i) < 0; ) n(o, null), o = r.getNext();
            o && o.isEqual(i) && (
            // Key found in cache.
            n(o, e), o = r.hasNext() ? r.getNext() : null), 
            // Skip to the next key (if there is one).
            o ? s.G(Do(o)) : s.done();
        })).next((() => {
            // The rest of the keys are not in the cache. One case where `iterate`
            // above won't go through them is when the cache is empty.
            for (;o; ) n(o, null), o = r.hasNext() ? r.getNext() : null;
        }));
    }
    getDocumentsMatchingQuery(t, e, n, s) {
        const i = e.path, r = [ i.popLast().toArray(), i.lastSegment(), fr(n.readTime), n.documentKey.path.isEmpty() ? "" : n.documentKey.path.lastSegment() ], o = [ i.popLast().toArray(), i.lastSegment(), [ Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER ], "" ];
        return So(t).j(IDBKeyRange.bound(r, o, !0)).next((t => {
            let n = cs();
            for (const i of t) {
                const t = this.ts(ht.fromSegments(i.prefixPath.concat(i.collectionGroup, i.documentId)), i);
                t.isFoundDocument() && (ns(e, t) || s.has(t.key)) && (
                // Either the document matches the given query, or it is mutated.
                n = n.insert(t.key, t));
            }
            return n;
        }));
    }
    getAllFromCollectionGroup(t, e, n, s) {
        let i = cs();
        const r = Co(e, n), o = Co(e, It.max());
        return So(t).X({
            index: "collectionGroupIndex",
            range: IDBKeyRange.bound(r, o, !0)
        }, ((t, e, n) => {
            const r = this.ts(ht.fromSegments(e.prefixPath.concat(e.collectionGroup, e.documentId)), e);
            i = i.insert(r.key, r), i.size === s && n.done();
        })).next((() => i));
    }
    newChangeBuffer(t) {
        return new bo(this, !!t && t.trackRemovals);
    }
    getSize(t) {
        return this.getMetadata(t).next((t => t.byteSize));
    }
    getMetadata(t) {
        return Vo(t).get("remoteDocumentGlobalKey").next((t => (F(!!t), t)));
    }
    Zn(t, e) {
        return Vo(t).put("remoteDocumentGlobalKey", e);
    }
    /**
     * Decodes `dbRemoteDoc` and returns the document (or an invalid document if
     * the document corresponds to the format used for sentinel deletes).
     */    ts(t, e) {
        if (e) {
            const t = hr(this.serializer, e);
            // Whether the document is a sentinel removal and should only be used in the
            // `getNewDocumentChanges()`
                        if (!(t.isNoDocument() && t.version.isEqual(rt.min()))) return t;
        }
        return an.newInvalidDocument(t);
    }
}

/** Creates a new IndexedDbRemoteDocumentCache. */ function Po(t) {
    return new Ro(t);
}

/**
 * Handles the details of adding and updating documents in the IndexedDbRemoteDocumentCache.
 *
 * Unlike the MemoryRemoteDocumentChangeBuffer, the IndexedDb implementation computes the size
 * delta for all submitted changes. This avoids having to re-read all documents from IndexedDb
 * when we apply the changes.
 */ class bo extends vo {
    /**
     * @param documentCache - The IndexedDbRemoteDocumentCache to apply the changes to.
     * @param trackRemovals - Whether to create sentinel deletes that can be tracked by
     * `getNewDocumentChanges()`.
     */
    constructor(t, e) {
        super(), this.os = t, this.trackRemovals = e, 
        // A map of document sizes and read times prior to applying the changes in
        // this buffer.
        this.us = new os((t => t.toString()), ((t, e) => t.isEqual(e)));
    }
    applyChanges(t) {
        const e = [];
        let n = 0, s = new Ee(((t, e) => et(t.canonicalString(), e.canonicalString())));
        return this.changes.forEach(((i, r) => {
            const o = this.us.get(i);
            if (e.push(this.os.removeEntry(t, i, o.readTime)), r.isValidDocument()) {
                const u = lr(this.os.serializer, r);
                s = s.add(i.path.popLast());
                const c = ro(u);
                n += c - o.size, e.push(this.os.addEntry(t, i, u));
            } else if (n -= o.size, this.trackRemovals) {
                // In order to track removals, we store a "sentinel delete" in the
                // RemoteDocumentCache. This entry is represented by a NoDocument
                // with a version of 0 and ignored by `maybeDecodeDocument()` but
                // preserved in `getNewDocumentChanges()`.
                const n = lr(this.os.serializer, r.convertToNoDocument(rt.min()));
                e.push(this.os.addEntry(t, i, n));
            }
        })), s.forEach((n => {
            e.push(this.os.indexManager.addToCollectionParentIndex(t, n));
        })), e.push(this.os.updateMetadata(t, n)), Rt.waitFor(e);
    }
    getFromCache(t, e) {
        // Record the size of everything we load from the cache so we can compute a delta later.
        return this.os.es(t, e).next((t => (this.us.set(e, {
            size: t.size,
            readTime: t.document.readTime
        }), t.document)));
    }
    getAllFromCache(t, e) {
        // Record the size of everything we load from the cache so we can compute
        // a delta later.
        return this.os.ss(t, e).next((({documents: t, rs: e}) => (
        // Note: `getAllFromCache` returns two maps instead of a single map from
        // keys to `DocumentSizeEntry`s. This is to allow returning the
        // `MutableDocumentMap` directly, without a conversion.
        e.forEach(((e, n) => {
            this.us.set(e, {
                size: n,
                readTime: t.get(e).readTime
            });
        })), t)));
    }
}

function Vo(t) {
    return _e(t, "remoteDocumentGlobal");
}

/**
 * Helper to get a typed SimpleDbStore for the remoteDocuments object store.
 */ function So(t) {
    return _e(t, "remoteDocumentsV14");
}

/**
 * Returns a key that can be used for document lookups on the
 * `DbRemoteDocumentDocumentKeyIndex` index.
 */ function Do(t) {
    const e = t.path.toArray();
    return [ 
    /* prefix path */ e.slice(0, e.length - 2), 
    /* collection id */ e[e.length - 2], 
    /* document id */ e[e.length - 1] ];
}

function Co(t, e) {
    const n = e.documentKey.path.toArray();
    return [ 
    /* collection id */ t, fr(e.readTime), 
    /* prefix path */ n.slice(0, n.length - 2), 
    /* document id */ n.length > 0 ? n[n.length - 1] : "" ];
}

/**
 * Comparator that compares document keys according to the primary key sorting
 * used by the `DbRemoteDocumentDocument` store (by prefix path, collection id
 * and then document ID).
 *
 * Visible for testing.
 */ function xo(t, e) {
    const n = t.path.toArray(), s = e.path.toArray();
    // The ordering is based on https://chromium.googlesource.com/chromium/blink/+/fe5c21fef94dae71c1c3344775b8d8a7f7e6d9ec/Source/modules/indexeddb/IDBKey.cpp#74
    let i = 0;
    for (let t = 0; t < n.length - 2 && t < s.length - 2; ++t) if (i = et(n[t], s[t]), 
    i) return i;
    return i = et(n.length, s.length), i || (i = et(n[n.length - 2], s[s.length - 2]), 
    i || et(n[n.length - 1], s[s.length - 1]));
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Schema Version for the Web client:
 * 1.  Initial version including Mutation Queue, Query Cache, and Remote
 *     Document Cache
 * 2.  Used to ensure a targetGlobal object exists and add targetCount to it. No
 *     longer required because migration 3 unconditionally clears it.
 * 3.  Dropped and re-created Query Cache to deal with cache corruption related
 *     to limbo resolution. Addresses
 *     https://github.com/firebase/firebase-ios-sdk/issues/1548
 * 4.  Multi-Tab Support.
 * 5.  Removal of held write acks.
 * 6.  Create document global for tracking document cache size.
 * 7.  Ensure every cached document has a sentinel row with a sequence number.
 * 8.  Add collection-parent index for Collection Group queries.
 * 9.  Change RemoteDocumentChanges store to be keyed by readTime rather than
 *     an auto-incrementing ID. This is required for Index-Free queries.
 * 10. Rewrite the canonical IDs to the explicit Protobuf-based format.
 * 11. Add bundles and named_queries for bundle support.
 * 12. Add document overlays.
 * 13. Rewrite the keys of the remote document cache to allow for efficient
 *     document lookup via `getAll()`.
 * 14. Add overlays.
 * 15. Add indexing support.
 */
/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * Represents a local view (overlay) of a document, and the fields that are
 * locally mutated.
 */
class No {
    constructor(t, 
    /**
     * The fields that are locally mutated by patch mutations.
     *
     * If the overlayed	document is from set or delete mutations, this is `null`.
     * If there is no overlay (mutation) for the document, this is an empty `FieldMask`.
     */
    e) {
        this.overlayedDocument = t, this.mutatedFields = e;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * A readonly view of the local state of all documents we're tracking (i.e. we
 * have a cached version in remoteDocumentCache or local mutations for the
 * document). The view is computed by applying the mutations in the
 * MutationQueue to the RemoteDocumentCache.
 */ class ko {
    constructor(t, e, n, s) {
        this.remoteDocumentCache = t, this.mutationQueue = e, this.documentOverlayCache = n, 
        this.indexManager = s;
    }
    /**
     * Get the local view of the document identified by `key`.
     *
     * @returns Local view of the document or null if we don't have any cached
     * state for it.
     */    getDocument(t, e) {
        let n = null;
        return this.documentOverlayCache.getOverlay(t, e).next((s => (n = s, this.remoteDocumentCache.getEntry(t, e)))).next((t => (null !== n && Ks(n.mutation, t, Re.empty(), it.now()), 
        t)));
    }
    /**
     * Gets the local view of the documents identified by `keys`.
     *
     * If we don't have cached state for a document in `keys`, a NoDocument will
     * be stored for that key in the resulting set.
     */    getDocuments(t, e) {
        return this.remoteDocumentCache.getEntries(t, e).next((e => this.getLocalViewOfDocuments(t, e, gs()).next((() => e))));
    }
    /**
     * Similar to `getDocuments`, but creates the local view from the given
     * `baseDocs` without retrieving documents from the local store.
     *
     * @param transaction - The transaction this operation is scoped to.
     * @param docs - The documents to apply local mutations to get the local views.
     * @param existenceStateChanged - The set of document keys whose existence state
     *   is changed. This is useful to determine if some documents overlay needs
     *   to be recalculated.
     */    getLocalViewOfDocuments(t, e, n = gs()) {
        const s = fs();
        return this.populateOverlays(t, s, e).next((() => this.computeViews(t, e, s, n).next((t => {
            let e = hs();
            return t.forEach(((t, n) => {
                e = e.insert(t, n.overlayedDocument);
            })), e;
        }))));
    }
    /**
     * Gets the overlayed documents for the given document map, which will include
     * the local view of those documents and a `FieldMask` indicating which fields
     * are mutated locally, `null` if overlay is a Set or Delete mutation.
     */    getOverlayedDocuments(t, e) {
        const n = fs();
        return this.populateOverlays(t, n, e).next((() => this.computeViews(t, e, n, gs())));
    }
    /**
     * Fetches the overlays for {@code docs} and adds them to provided overlay map
     * if the map does not already contain an entry for the given document key.
     */    populateOverlays(t, e, n) {
        const s = [];
        return n.forEach((t => {
            e.has(t) || s.push(t);
        })), this.documentOverlayCache.getOverlays(t, s).next((t => {
            t.forEach(((t, n) => {
                e.set(t, n);
            }));
        }));
    }
    /**
     * Computes the local view for the given documents.
     *
     * @param docs - The documents to compute views for. It also has the base
     *   version of the documents.
     * @param overlays - The overlays that need to be applied to the given base
     *   version of the documents.
     * @param existenceStateChanged - A set of documents whose existence states
     *   might have changed. This is used to determine if we need to re-calculate
     *   overlays from mutation queues.
     * @return A map represents the local documents view.
     */    computeViews(t, e, n, s) {
        let i = cs();
        const r = ws(), o = ws();
        return e.forEach(((t, e) => {
            const o = n.get(e.key);
            // Recalculate an overlay if the document's existence state changed due to
            // a remote event *and* the overlay is a PatchMutation. This is because
            // document existence state can change if some patch mutation's
            // preconditions are met.
            // NOTE: we recalculate when `overlay` is undefined as well, because there
            // might be a patch mutation whose precondition does not match before the
            // change (hence overlay is undefined), but would now match.
                        s.has(e.key) && (void 0 === o || o.mutation instanceof zs) ? i = i.insert(e.key, e) : void 0 !== o ? (r.set(e.key, o.mutation.getFieldMask()), 
            Ks(o.mutation, e, o.mutation.getFieldMask(), it.now())) : 
            // no overlay exists
            // Using EMPTY to indicate there is no overlay for the document.
            r.set(e.key, Re.empty());
        })), this.recalculateAndSaveOverlays(t, i).next((t => (t.forEach(((t, e) => r.set(t, e))), 
        e.forEach(((t, e) => {
            var n;
            return o.set(t, new No(e, null !== (n = r.get(t)) && void 0 !== n ? n : null));
        })), o)));
    }
    recalculateAndSaveOverlays(t, e) {
        const n = ws();
        // A reverse lookup map from batch id to the documents within that batch.
                let s = new pe(((t, e) => t - e)), i = gs();
        return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t, e).next((t => {
            for (const i of t) i.keys().forEach((t => {
                const r = e.get(t);
                if (null === r) return;
                let o = n.get(t) || Re.empty();
                o = i.applyToLocalView(r, o), n.set(t, o);
                const u = (s.get(i.batchId) || gs()).add(t);
                s = s.insert(i.batchId, u);
            }));
        })).next((() => {
            const r = [], o = s.getReverseIterator();
            // Iterate in descending order of batch IDs, and skip documents that are
            // already saved.
                        for (;o.hasNext(); ) {
                const s = o.getNext(), u = s.key, c = s.value, a = ds();
                c.forEach((t => {
                    if (!i.has(t)) {
                        const s = qs(e.get(t), n.get(t));
                        null !== s && a.set(t, s), i = i.add(t);
                    }
                })), r.push(this.documentOverlayCache.saveOverlays(t, u, a));
            }
            return Rt.waitFor(r);
        })).next((() => n));
    }
    /**
     * Recalculates overlays by reading the documents from remote document cache
     * first, and saves them after they are calculated.
     */    recalculateAndSaveOverlaysForDocumentKeys(t, e) {
        return this.remoteDocumentCache.getEntries(t, e).next((e => this.recalculateAndSaveOverlays(t, e)));
    }
    /**
     * Performs a query against the local view of all documents.
     *
     * @param transaction - The persistence transaction.
     * @param query - The query to match documents against.
     * @param offset - Read time and key to start scanning by (exclusive).
     */    getDocumentsMatchingQuery(t, e, n) {
        /**
 * Returns whether the query matches a single document by path (rather than a
 * collection).
 */
        return function(t) {
            return ht.isDocumentKey(t.path) && null === t.collectionGroup && 0 === t.filters.length;
        }(e) ? this.getDocumentsMatchingDocumentQuery(t, e.path) : Wn(e) ? this.getDocumentsMatchingCollectionGroupQuery(t, e, n) : this.getDocumentsMatchingCollectionQuery(t, e, n);
    }
    /**
     * Given a collection group, returns the next documents that follow the provided offset, along
     * with an updated batch ID.
     *
     * <p>The documents returned by this method are ordered by remote version from the provided
     * offset. If there are no more remote documents after the provided offset, documents with
     * mutations in order of batch id from the offset are returned. Since all documents in a batch are
     * returned together, the total number of documents returned can exceed {@code count}.
     *
     * @param transaction
     * @param collectionGroup The collection group for the documents.
     * @param offset The offset to index into.
     * @param count The number of documents to return
     * @return A LocalWriteResult with the documents that follow the provided offset and the last processed batch id.
     */    getNextDocuments(t, e, n, s) {
        return this.remoteDocumentCache.getAllFromCollectionGroup(t, e, n, s).next((i => {
            const r = s - i.size > 0 ? this.documentOverlayCache.getOverlaysForCollectionGroup(t, e, n.largestBatchId, s - i.size) : Rt.resolve(fs());
            // The callsite will use the largest batch ID together with the latest read time to create
            // a new index offset. Since we only process batch IDs if all remote documents have been read,
            // no overlay will increase the overall read time. This is why we only need to special case
            // the batch id.
                        let o = -1, u = i;
            return r.next((e => Rt.forEach(e, ((e, n) => (o < n.largestBatchId && (o = n.largestBatchId), 
            i.get(e) ? Rt.resolve() : this.remoteDocumentCache.getEntry(t, e).next((t => {
                u = u.insert(e, t);
            }))))).next((() => this.populateOverlays(t, e, i))).next((() => this.computeViews(t, u, e, gs()))).next((t => ({
                batchId: o,
                changes: ls(t)
            })))));
        }));
    }
    getDocumentsMatchingDocumentQuery(t, e) {
        // Just do a simple document lookup.
        return this.getDocument(t, new ht(e)).next((t => {
            let e = hs();
            return t.isFoundDocument() && (e = e.insert(t.key, t)), e;
        }));
    }
    getDocumentsMatchingCollectionGroupQuery(t, e, n) {
        const s = e.collectionGroup;
        let i = hs();
        return this.indexManager.getCollectionParents(t, s).next((r => Rt.forEach(r, (r => {
            const o = function(t, e) {
                return new Un(e, 
                /*collectionGroup=*/ null, t.explicitOrderBy.slice(), t.filters.slice(), t.limit, t.limitType, t.startAt, t.endAt);
            }(e, r.child(s));
            return this.getDocumentsMatchingCollectionQuery(t, o, n).next((t => {
                t.forEach(((t, e) => {
                    i = i.insert(t, e);
                }));
            }));
        })).next((() => i))));
    }
    getDocumentsMatchingCollectionQuery(t, e, n) {
        // Query the remote documents and overlay mutations.
        let s;
        return this.documentOverlayCache.getOverlaysForCollection(t, e.path, n.largestBatchId).next((i => (s = i, 
        this.remoteDocumentCache.getDocumentsMatchingQuery(t, e, n, s)))).next((t => {
            // As documents might match the query because of their overlay we need to
            // include documents for all overlays in the initial document set.
            s.forEach(((e, n) => {
                const s = n.getKey();
                null === t.get(s) && (t = t.insert(s, an.newInvalidDocument(s)));
            }));
            // Apply the overlays and match against the query.
            let n = hs();
            return t.forEach(((t, i) => {
                const r = s.get(t);
                void 0 !== r && Ks(r.mutation, i, Re.empty(), it.now()), 
                // Finally, insert the documents that still match the query
                ns(e, i) && (n = n.insert(t, i));
            })), n;
        }));
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
 */ class Mo {
    constructor(t) {
        this.serializer = t, this.cs = new Map, this.hs = new Map;
    }
    getBundleMetadata(t, e) {
        return Rt.resolve(this.cs.get(e));
    }
    saveBundleMetadata(t, e) {
        /** Decodes a BundleMetadata proto into a BundleMetadata object. */
        var n;
        return this.cs.set(e.id, {
            id: (n = e).id,
            version: n.version,
            createTime: Ni(n.createTime)
        }), Rt.resolve();
    }
    getNamedQuery(t, e) {
        return Rt.resolve(this.hs.get(e));
    }
    saveNamedQuery(t, e) {
        return this.hs.set(e.name, function(t) {
            return {
                name: t.name,
                query: yr(t.bundledQuery),
                readTime: Ni(t.readTime)
            };
        }(e)), Rt.resolve();
    }
}

/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * An in-memory implementation of DocumentOverlayCache.
 */ class $o {
    constructor() {
        // A map sorted by DocumentKey, whose value is a pair of the largest batch id
        // for the overlay and the overlay itself.
        this.overlays = new pe(ht.comparator), this.ls = new Map;
    }
    getOverlay(t, e) {
        return Rt.resolve(this.overlays.get(e));
    }
    getOverlays(t, e) {
        const n = fs();
        return Rt.forEach(e, (e => this.getOverlay(t, e).next((t => {
            null !== t && n.set(e, t);
        })))).next((() => n));
    }
    saveOverlays(t, e, n) {
        return n.forEach(((n, s) => {
            this.we(t, e, s);
        })), Rt.resolve();
    }
    removeOverlaysForBatchId(t, e, n) {
        const s = this.ls.get(n);
        return void 0 !== s && (s.forEach((t => this.overlays = this.overlays.remove(t))), 
        this.ls.delete(n)), Rt.resolve();
    }
    getOverlaysForCollection(t, e, n) {
        const s = fs(), i = e.length + 1, r = new ht(e.child("")), o = this.overlays.getIteratorFrom(r);
        for (;o.hasNext(); ) {
            const t = o.getNext().value, r = t.getKey();
            if (!e.isPrefixOf(r.path)) break;
            // Documents from sub-collections
                        r.path.length === i && (t.largestBatchId > n && s.set(t.getKey(), t));
        }
        return Rt.resolve(s);
    }
    getOverlaysForCollectionGroup(t, e, n, s) {
        let i = new pe(((t, e) => t - e));
        const r = this.overlays.getIterator();
        for (;r.hasNext(); ) {
            const t = r.getNext().value;
            if (t.getKey().getCollectionGroup() === e && t.largestBatchId > n) {
                let e = i.get(t.largestBatchId);
                null === e && (e = fs(), i = i.insert(t.largestBatchId, e)), e.set(t.getKey(), t);
            }
        }
        const o = fs(), u = i.getIterator();
        for (;u.hasNext(); ) {
            if (u.getNext().value.forEach(((t, e) => o.set(t, e))), o.size() >= s) break;
        }
        return Rt.resolve(o);
    }
    we(t, e, n) {
        // Remove the association of the overlay to its batch id.
        const s = this.overlays.get(n.key);
        if (null !== s) {
            const t = this.ls.get(s.largestBatchId).delete(n.key);
            this.ls.set(s.largestBatchId, t);
        }
        this.overlays = this.overlays.insert(n.key, new ei(e, n));
        // Create the association of this overlay to the given largestBatchId.
        let i = this.ls.get(e);
        void 0 === i && (i = gs(), this.ls.set(e, i)), this.ls.set(e, i.add(n.key));
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * A collection of references to a document from some kind of numbered entity
 * (either a target ID or batch ID). As references are added to or removed from
 * the set corresponding events are emitted to a registered garbage collector.
 *
 * Each reference is represented by a DocumentReference object. Each of them
 * contains enough information to uniquely identify the reference. They are all
 * stored primarily in a set sorted by key. A document is considered garbage if
 * there's no references in that set (this can be efficiently checked thanks to
 * sorting by key).
 *
 * ReferenceSet also keeps a secondary set that contains references sorted by
 * IDs. This one is used to efficiently implement removal of all references by
 * some target ID.
 */ class Oo {
    constructor() {
        // A set of outstanding references to a document sorted by key.
        this.fs = new Ee(Fo.ds), 
        // A set of outstanding references to a document sorted by target id.
        this.ws = new Ee(Fo._s);
    }
    /** Returns true if the reference set contains no references. */    isEmpty() {
        return this.fs.isEmpty();
    }
    /** Adds a reference to the given document key for the given ID. */    addReference(t, e) {
        const n = new Fo(t, e);
        this.fs = this.fs.add(n), this.ws = this.ws.add(n);
    }
    /** Add references to the given document keys for the given ID. */    gs(t, e) {
        t.forEach((t => this.addReference(t, e)));
    }
    /**
     * Removes a reference to the given document key for the given
     * ID.
     */    removeReference(t, e) {
        this.ys(new Fo(t, e));
    }
    ps(t, e) {
        t.forEach((t => this.removeReference(t, e)));
    }
    /**
     * Clears all references with a given ID. Calls removeRef() for each key
     * removed.
     */    Is(t) {
        const e = new ht(new ut([])), n = new Fo(e, t), s = new Fo(e, t + 1), i = [];
        return this.ws.forEachInRange([ n, s ], (t => {
            this.ys(t), i.push(t.key);
        })), i;
    }
    Ts() {
        this.fs.forEach((t => this.ys(t)));
    }
    ys(t) {
        this.fs = this.fs.delete(t), this.ws = this.ws.delete(t);
    }
    Es(t) {
        const e = new ht(new ut([])), n = new Fo(e, t), s = new Fo(e, t + 1);
        let i = gs();
        return this.ws.forEachInRange([ n, s ], (t => {
            i = i.add(t.key);
        })), i;
    }
    containsKey(t) {
        const e = new Fo(t, 0), n = this.fs.firstAfterOrEqual(e);
        return null !== n && t.isEqual(n.key);
    }
}

class Fo {
    constructor(t, e) {
        this.key = t, this.As = e;
    }
    /** Compare by key then by ID */    static ds(t, e) {
        return ht.comparator(t.key, e.key) || et(t.As, e.As);
    }
    /** Compare by ID then by key */    static _s(t, e) {
        return et(t.As, e.As) || ht.comparator(t.key, e.key);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ class Bo {
    constructor(t, e) {
        this.indexManager = t, this.referenceDelegate = e, 
        /**
         * The set of all mutations that have been sent but not yet been applied to
         * the backend.
         */
        this.mutationQueue = [], 
        /** Next value to use when assigning sequential IDs to each mutation batch. */
        this.vs = 1, 
        /** An ordered mapping between documents and the mutations batch IDs. */
        this.Rs = new Ee(Fo.ds);
    }
    checkEmpty(t) {
        return Rt.resolve(0 === this.mutationQueue.length);
    }
    addMutationBatch(t, e, n, s) {
        const i = this.vs;
        this.vs++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1];
        const r = new Zs(i, e, n, s);
        this.mutationQueue.push(r);
        // Track references by document key and index collection parents.
        for (const e of s) this.Rs = this.Rs.add(new Fo(e.key, i)), this.indexManager.addToCollectionParentIndex(t, e.key.path.popLast());
        return Rt.resolve(r);
    }
    lookupMutationBatch(t, e) {
        return Rt.resolve(this.Ps(e));
    }
    getNextMutationBatchAfterBatchId(t, e) {
        const n = e + 1, s = this.bs(n), i = s < 0 ? 0 : s;
        // The requested batchId may still be out of range so normalize it to the
        // start of the queue.
                return Rt.resolve(this.mutationQueue.length > i ? this.mutationQueue[i] : null);
    }
    getHighestUnacknowledgedBatchId() {
        return Rt.resolve(0 === this.mutationQueue.length ? -1 : this.vs - 1);
    }
    getAllMutationBatches(t) {
        return Rt.resolve(this.mutationQueue.slice());
    }
    getAllMutationBatchesAffectingDocumentKey(t, e) {
        const n = new Fo(e, 0), s = new Fo(e, Number.POSITIVE_INFINITY), i = [];
        return this.Rs.forEachInRange([ n, s ], (t => {
            const e = this.Ps(t.As);
            i.push(e);
        })), Rt.resolve(i);
    }
    getAllMutationBatchesAffectingDocumentKeys(t, e) {
        let n = new Ee(et);
        return e.forEach((t => {
            const e = new Fo(t, 0), s = new Fo(t, Number.POSITIVE_INFINITY);
            this.Rs.forEachInRange([ e, s ], (t => {
                n = n.add(t.As);
            }));
        })), Rt.resolve(this.Vs(n));
    }
    getAllMutationBatchesAffectingQuery(t, e) {
        // Use the query path as a prefix for testing if a document matches the
        // query.
        const n = e.path, s = n.length + 1;
        // Construct a document reference for actually scanning the index. Unlike
        // the prefix the document key in this reference must have an even number of
        // segments. The empty segment can be used a suffix of the query path
        // because it precedes all other segments in an ordered traversal.
        let i = n;
        ht.isDocumentKey(i) || (i = i.child(""));
        const r = new Fo(new ht(i), 0);
        // Find unique batchIDs referenced by all documents potentially matching the
        // query.
                let o = new Ee(et);
        return this.Rs.forEachWhile((t => {
            const e = t.key.path;
            return !!n.isPrefixOf(e) && (
            // Rows with document keys more than one segment longer than the query
            // path can't be matches. For example, a query on 'rooms' can't match
            // the document /rooms/abc/messages/xyx.
            // TODO(mcg): we'll need a different scanner when we implement
            // ancestor queries.
            e.length === s && (o = o.add(t.As)), !0);
        }), r), Rt.resolve(this.Vs(o));
    }
    Vs(t) {
        // Construct an array of matching batches, sorted by batchID to ensure that
        // multiple mutations affecting the same document key are applied in order.
        const e = [];
        return t.forEach((t => {
            const n = this.Ps(t);
            null !== n && e.push(n);
        })), e;
    }
    removeMutationBatch(t, e) {
        F(0 === this.Ss(e.batchId, "removed")), this.mutationQueue.shift();
        let n = this.Rs;
        return Rt.forEach(e.mutations, (s => {
            const i = new Fo(s.key, e.batchId);
            return n = n.delete(i), this.referenceDelegate.markPotentiallyOrphaned(t, s.key);
        })).next((() => {
            this.Rs = n;
        }));
    }
    Cn(t) {
        // No-op since the memory mutation queue does not maintain a separate cache.
    }
    containsKey(t, e) {
        const n = new Fo(e, 0), s = this.Rs.firstAfterOrEqual(n);
        return Rt.resolve(e.isEqual(s && s.key));
    }
    performConsistencyCheck(t) {
        return this.mutationQueue.length, Rt.resolve();
    }
    /**
     * Finds the index of the given batchId in the mutation queue and asserts that
     * the resulting index is within the bounds of the queue.
     *
     * @param batchId - The batchId to search for
     * @param action - A description of what the caller is doing, phrased in passive
     * form (e.g. "acknowledged" in a routine that acknowledges batches).
     */    Ss(t, e) {
        return this.bs(t);
    }
    /**
     * Finds the index of the given batchId in the mutation queue. This operation
     * is O(1).
     *
     * @returns The computed index of the batch with the given batchId, based on
     * the state of the queue. Note this index can be negative if the requested
     * batchId has already been remvoed from the queue or past the end of the
     * queue if the batchId is larger than the last added batch.
     */    bs(t) {
        if (0 === this.mutationQueue.length) 
        // As an index this is past the end of the queue
        return 0;
        // Examine the front of the queue to figure out the difference between the
        // batchId and indexes in the array. Note that since the queue is ordered
        // by batchId, if the first batch has a larger batchId then the requested
        // batchId doesn't exist in the queue.
                return t - this.mutationQueue[0].batchId;
    }
    /**
     * A version of lookupMutationBatch that doesn't return a promise, this makes
     * other functions that uses this code easier to read and more efficent.
     */    Ps(t) {
        const e = this.bs(t);
        if (e < 0 || e >= this.mutationQueue.length) return null;
        return this.mutationQueue[e];
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * The memory-only RemoteDocumentCache for IndexedDb. To construct, invoke
 * `newMemoryRemoteDocumentCache()`.
 */
class Lo {
    /**
     * @param sizer - Used to assess the size of a document. For eager GC, this is
     * expected to just return 0 to avoid unnecessarily doing the work of
     * calculating the size.
     */
    constructor(t) {
        this.Ds = t, 
        /** Underlying cache of documents and their read times. */
        this.docs = new pe(ht.comparator), 
        /** Size of all cached documents. */
        this.size = 0;
    }
    setIndexManager(t) {
        this.indexManager = t;
    }
    /**
     * Adds the supplied entry to the cache and updates the cache size as appropriate.
     *
     * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
     * returned by `newChangeBuffer()`.
     */    addEntry(t, e) {
        const n = e.key, s = this.docs.get(n), i = s ? s.size : 0, r = this.Ds(e);
        return this.docs = this.docs.insert(n, {
            document: e.mutableCopy(),
            size: r
        }), this.size += r - i, this.indexManager.addToCollectionParentIndex(t, n.path.popLast());
    }
    /**
     * Removes the specified entry from the cache and updates the cache size as appropriate.
     *
     * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
     * returned by `newChangeBuffer()`.
     */    removeEntry(t) {
        const e = this.docs.get(t);
        e && (this.docs = this.docs.remove(t), this.size -= e.size);
    }
    getEntry(t, e) {
        const n = this.docs.get(e);
        return Rt.resolve(n ? n.document.mutableCopy() : an.newInvalidDocument(e));
    }
    getEntries(t, e) {
        let n = cs();
        return e.forEach((t => {
            const e = this.docs.get(t);
            n = n.insert(t, e ? e.document.mutableCopy() : an.newInvalidDocument(t));
        })), Rt.resolve(n);
    }
    getDocumentsMatchingQuery(t, e, n, s) {
        let i = cs();
        // Documents are ordered by key, so we can use a prefix scan to narrow down
        // the documents we need to match the query against.
                const r = e.path, o = new ht(r.child("")), u = this.docs.getIteratorFrom(o);
        for (;u.hasNext(); ) {
            const {key: t, value: {document: o}} = u.getNext();
            if (!r.isPrefixOf(t.path)) break;
            t.path.length > r.length + 1 || (Tt(pt(o), n) <= 0 || (s.has(o.key) || ns(e, o)) && (i = i.insert(o.key, o.mutableCopy())));
        }
        return Rt.resolve(i);
    }
    getAllFromCollectionGroup(t, e, n, s) {
        // This method should only be called from the IndexBackfiller if persistence
        // is enabled.
        O();
    }
    Cs(t, e) {
        return Rt.forEach(this.docs, (t => e(t)));
    }
    newChangeBuffer(t) {
        // `trackRemovals` is ignores since the MemoryRemoteDocumentCache keeps
        // a separate changelog and does not need special handling for removals.
        return new qo(this);
    }
    getSize(t) {
        return Rt.resolve(this.size);
    }
}

/**
 * Creates a new memory-only RemoteDocumentCache.
 *
 * @param sizer - Used to assess the size of a document. For eager GC, this is
 * expected to just return 0 to avoid unnecessarily doing the work of
 * calculating the size.
 */
/**
 * Handles the details of adding and updating documents in the MemoryRemoteDocumentCache.
 */
class qo extends vo {
    constructor(t) {
        super(), this.os = t;
    }
    applyChanges(t) {
        const e = [];
        return this.changes.forEach(((n, s) => {
            s.isValidDocument() ? e.push(this.os.addEntry(t, s)) : this.os.removeEntry(n);
        })), Rt.waitFor(e);
    }
    getFromCache(t, e) {
        return this.os.getEntry(t, e);
    }
    getAllFromCache(t, e) {
        return this.os.getEntries(t, e);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ class Uo {
    constructor(t) {
        this.persistence = t, 
        /**
         * Maps a target to the data about that target
         */
        this.xs = new os((t => $n(t)), On), 
        /** The last received snapshot version. */
        this.lastRemoteSnapshotVersion = rt.min(), 
        /** The highest numbered target ID encountered. */
        this.highestTargetId = 0, 
        /** The highest sequence number encountered. */
        this.Ns = 0, 
        /**
         * A ordered bidirectional mapping between documents and the remote target
         * IDs.
         */
        this.ks = new Oo, this.targetCount = 0, this.Ms = lo.kn();
    }
    forEachTarget(t, e) {
        return this.xs.forEach(((t, n) => e(n))), Rt.resolve();
    }
    getLastRemoteSnapshotVersion(t) {
        return Rt.resolve(this.lastRemoteSnapshotVersion);
    }
    getHighestSequenceNumber(t) {
        return Rt.resolve(this.Ns);
    }
    allocateTargetId(t) {
        return this.highestTargetId = this.Ms.next(), Rt.resolve(this.highestTargetId);
    }
    setTargetsMetadata(t, e, n) {
        return n && (this.lastRemoteSnapshotVersion = n), e > this.Ns && (this.Ns = e), 
        Rt.resolve();
    }
    Fn(t) {
        this.xs.set(t.target, t);
        const e = t.targetId;
        e > this.highestTargetId && (this.Ms = new lo(e), this.highestTargetId = e), t.sequenceNumber > this.Ns && (this.Ns = t.sequenceNumber);
    }
    addTargetData(t, e) {
        return this.Fn(e), this.targetCount += 1, Rt.resolve();
    }
    updateTargetData(t, e) {
        return this.Fn(e), Rt.resolve();
    }
    removeTargetData(t, e) {
        return this.xs.delete(e.target), this.ks.Is(e.targetId), this.targetCount -= 1, 
        Rt.resolve();
    }
    removeTargets(t, e, n) {
        let s = 0;
        const i = [];
        return this.xs.forEach(((r, o) => {
            o.sequenceNumber <= e && null === n.get(o.targetId) && (this.xs.delete(r), i.push(this.removeMatchingKeysForTargetId(t, o.targetId)), 
            s++);
        })), Rt.waitFor(i).next((() => s));
    }
    getTargetCount(t) {
        return Rt.resolve(this.targetCount);
    }
    getTargetData(t, e) {
        const n = this.xs.get(e) || null;
        return Rt.resolve(n);
    }
    addMatchingKeys(t, e, n) {
        return this.ks.gs(e, n), Rt.resolve();
    }
    removeMatchingKeys(t, e, n) {
        this.ks.ps(e, n);
        const s = this.persistence.referenceDelegate, i = [];
        return s && e.forEach((e => {
            i.push(s.markPotentiallyOrphaned(t, e));
        })), Rt.waitFor(i);
    }
    removeMatchingKeysForTargetId(t, e) {
        return this.ks.Is(e), Rt.resolve();
    }
    getMatchingKeysForTargetId(t, e) {
        const n = this.ks.Es(e);
        return Rt.resolve(n);
    }
    containsKey(t, e) {
        return Rt.resolve(this.ks.containsKey(e));
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * A memory-backed instance of Persistence. Data is stored only in RAM and
 * not persisted across sessions.
 */
class Ko {
    /**
     * The constructor accepts a factory for creating a reference delegate. This
     * allows both the delegate and this instance to have strong references to
     * each other without having nullable fields that would then need to be
     * checked or asserted on every access.
     */
    constructor(t, e) {
        this.$s = {}, this.overlays = {}, this.Os = new Ot(0), this.Fs = !1, this.Fs = !0, 
        this.referenceDelegate = t(this), this.Bs = new Uo(this);
        this.indexManager = new zr, this.remoteDocumentCache = function(t) {
            return new Lo(t);
        }((t => this.referenceDelegate.Ls(t))), this.serializer = new ar(e), this.qs = new Mo(this.serializer);
    }
    start() {
        return Promise.resolve();
    }
    shutdown() {
        // No durable state to ensure is closed on shutdown.
        return this.Fs = !1, Promise.resolve();
    }
    get started() {
        return this.Fs;
    }
    setDatabaseDeletedListener() {
        // No op.
    }
    setNetworkEnabled() {
        // No op.
    }
    getIndexManager(t) {
        // We do not currently support indices for memory persistence, so we can
        // return the same shared instance of the memory index manager.
        return this.indexManager;
    }
    getDocumentOverlayCache(t) {
        let e = this.overlays[t.toKey()];
        return e || (e = new $o, this.overlays[t.toKey()] = e), e;
    }
    getMutationQueue(t, e) {
        let n = this.$s[t.toKey()];
        return n || (n = new Bo(e, this.referenceDelegate), this.$s[t.toKey()] = n), n;
    }
    getTargetCache() {
        return this.Bs;
    }
    getRemoteDocumentCache() {
        return this.remoteDocumentCache;
    }
    getBundleCache() {
        return this.qs;
    }
    runTransaction(t, e, n) {
        N("MemoryPersistence", "Starting transaction:", t);
        const s = new Go(this.Os.next());
        return this.referenceDelegate.Us(), n(s).next((t => this.referenceDelegate.Ks(s).next((() => t)))).toPromise().then((t => (s.raiseOnCommittedEvent(), 
        t)));
    }
    Gs(t, e) {
        return Rt.or(Object.values(this.$s).map((n => () => n.containsKey(t, e))));
    }
}

/**
 * Memory persistence is not actually transactional, but future implementations
 * may have transaction-scoped state.
 */ class Go extends At {
    constructor(t) {
        super(), this.currentSequenceNumber = t;
    }
}

class Qo {
    constructor(t) {
        this.persistence = t, 
        /** Tracks all documents that are active in Query views. */
        this.Qs = new Oo, 
        /** The list of documents that are potentially GCed after each transaction. */
        this.js = null;
    }
    static zs(t) {
        return new Qo(t);
    }
    get Ws() {
        if (this.js) return this.js;
        throw O();
    }
    addReference(t, e, n) {
        return this.Qs.addReference(n, e), this.Ws.delete(n.toString()), Rt.resolve();
    }
    removeReference(t, e, n) {
        return this.Qs.removeReference(n, e), this.Ws.add(n.toString()), Rt.resolve();
    }
    markPotentiallyOrphaned(t, e) {
        return this.Ws.add(e.toString()), Rt.resolve();
    }
    removeTarget(t, e) {
        this.Qs.Is(e.targetId).forEach((t => this.Ws.add(t.toString())));
        const n = this.persistence.getTargetCache();
        return n.getMatchingKeysForTargetId(t, e.targetId).next((t => {
            t.forEach((t => this.Ws.add(t.toString())));
        })).next((() => n.removeTargetData(t, e)));
    }
    Us() {
        this.js = new Set;
    }
    Ks(t) {
        // Remove newly orphaned documents.
        const e = this.persistence.getRemoteDocumentCache().newChangeBuffer();
        return Rt.forEach(this.Ws, (n => {
            const s = ht.fromPath(n);
            return this.Hs(t, s).next((t => {
                t || e.removeEntry(s, rt.min());
            }));
        })).next((() => (this.js = null, e.apply(t))));
    }
    updateLimboDocument(t, e) {
        return this.Hs(t, e).next((t => {
            t ? this.Ws.delete(e.toString()) : this.Ws.add(e.toString());
        }));
    }
    Ls(t) {
        // For eager GC, we don't care about the document size, there are no size thresholds.
        return 0;
    }
    Hs(t, e) {
        return Rt.or([ () => Rt.resolve(this.Qs.containsKey(e)), () => this.persistence.getTargetCache().containsKey(t, e), () => this.persistence.Gs(t, e) ]);
    }
}

class jo {
    constructor(t, e) {
        this.persistence = t, this.Js = new os((t => qt(t.path)), ((t, e) => t.isEqual(e))), 
        this.garbageCollector = To(this, e);
    }
    static zs(t, e) {
        return new jo(t, e);
    }
    // No-ops, present so memory persistence doesn't have to care which delegate
    // it has.
    Us() {}
    Ks(t) {
        return Rt.resolve();
    }
    forEachTarget(t, e) {
        return this.persistence.getTargetCache().forEachTarget(t, e);
    }
    zn(t) {
        const e = this.Jn(t);
        return this.persistence.getTargetCache().getTargetCount(t).next((t => e.next((e => t + e))));
    }
    Jn(t) {
        let e = 0;
        return this.Wn(t, (t => {
            e++;
        })).next((() => e));
    }
    Wn(t, e) {
        return Rt.forEach(this.Js, ((n, s) => this.Xn(t, n, s).next((t => t ? Rt.resolve() : e(s)))));
    }
    removeTargets(t, e, n) {
        return this.persistence.getTargetCache().removeTargets(t, e, n);
    }
    removeOrphanedDocuments(t, e) {
        let n = 0;
        const s = this.persistence.getRemoteDocumentCache(), i = s.newChangeBuffer();
        return s.Cs(t, (s => this.Xn(t, s, e).next((t => {
            t || (n++, i.removeEntry(s, rt.min()));
        })))).next((() => i.apply(t))).next((() => n));
    }
    markPotentiallyOrphaned(t, e) {
        return this.Js.set(e, t.currentSequenceNumber), Rt.resolve();
    }
    removeTarget(t, e) {
        const n = e.withSequenceNumber(t.currentSequenceNumber);
        return this.persistence.getTargetCache().updateTargetData(t, n);
    }
    addReference(t, e, n) {
        return this.Js.set(n, t.currentSequenceNumber), Rt.resolve();
    }
    removeReference(t, e, n) {
        return this.Js.set(n, t.currentSequenceNumber), Rt.resolve();
    }
    updateLimboDocument(t, e) {
        return this.Js.set(e, t.currentSequenceNumber), Rt.resolve();
    }
    Ls(t) {
        let e = t.key.toString().length;
        return t.isFoundDocument() && (e += ze(t.data.value)), e;
    }
    Xn(t, e, n) {
        return Rt.or([ () => this.persistence.Gs(t, e), () => this.persistence.getTargetCache().containsKey(t, e), () => {
            const t = this.Js.get(e);
            return Rt.resolve(void 0 !== t && t > n);
        } ]);
    }
    getCacheSize(t) {
        return this.persistence.getRemoteDocumentCache().getSize(t);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/** Performs database creation and schema upgrades. */ class zo {
    constructor(t) {
        this.serializer = t;
    }
    /**
     * Performs database creation and schema upgrades.
     *
     * Note that in production, this method is only ever used to upgrade the schema
     * to SCHEMA_VERSION. Different values of toVersion are only used for testing
     * and local feature development.
     */    O(t, e, n, s) {
        const i = new Pt("createOrUpgrade", e);
        n < 1 && s >= 1 && (function(t) {
            t.createObjectStore("owner");
        }(t), function(t) {
            t.createObjectStore("mutationQueues", {
                keyPath: "userId"
            });
            t.createObjectStore("mutations", {
                keyPath: "batchId",
                autoIncrement: !0
            }).createIndex("userMutationsIndex", Qt, {
                unique: !0
            }), t.createObjectStore("documentMutations");
        }
        /**
 * Upgrade function to migrate the 'mutations' store from V1 to V3. Loads
 * and rewrites all data.
 */ (t), Wo(t), function(t) {
            t.createObjectStore("remoteDocuments");
        }(t));
        // Migration 2 to populate the targetGlobal object no longer needed since
        // migration 3 unconditionally clears it.
                let r = Rt.resolve();
        return n < 3 && s >= 3 && (
        // Brand new clients don't need to drop and recreate--only clients that
        // potentially have corrupt data.
        0 !== n && (!function(t) {
            t.deleteObjectStore("targetDocuments"), t.deleteObjectStore("targets"), t.deleteObjectStore("targetGlobal");
        }(t), Wo(t)), r = r.next((() => 
        /**
 * Creates the target global singleton row.
 *
 * @param txn - The version upgrade transaction for indexeddb
 */
        function(t) {
            const e = t.store("targetGlobal"), n = {
                highestTargetId: 0,
                highestListenSequenceNumber: 0,
                lastRemoteSnapshotVersion: rt.min().toTimestamp(),
                targetCount: 0
            };
            return e.put("targetGlobalKey", n);
        }(i)))), n < 4 && s >= 4 && (0 !== n && (
        // Schema version 3 uses auto-generated keys to generate globally unique
        // mutation batch IDs (this was previously ensured internally by the
        // client). To migrate to the new schema, we have to read all mutations
        // and write them back out. We preserve the existing batch IDs to guarantee
        // consistency with other object stores. Any further mutation batch IDs will
        // be auto-generated.
        r = r.next((() => function(t, e) {
            return e.store("mutations").j().next((n => {
                t.deleteObjectStore("mutations");
                t.createObjectStore("mutations", {
                    keyPath: "batchId",
                    autoIncrement: !0
                }).createIndex("userMutationsIndex", Qt, {
                    unique: !0
                });
                const s = e.store("mutations"), i = n.map((t => s.put(t)));
                return Rt.waitFor(i);
            }));
        }(t, i)))), r = r.next((() => {
            !function(t) {
                t.createObjectStore("clientMetadata", {
                    keyPath: "clientId"
                });
            }(t);
        }))), n < 5 && s >= 5 && (r = r.next((() => this.Ys(i)))), n < 6 && s >= 6 && (r = r.next((() => (function(t) {
            t.createObjectStore("remoteDocumentGlobal");
        }(t), this.Xs(i))))), n < 7 && s >= 7 && (r = r.next((() => this.Zs(i)))), n < 8 && s >= 8 && (r = r.next((() => this.ti(t, i)))), 
        n < 9 && s >= 9 && (r = r.next((() => {
            // Multi-Tab used to manage its own changelog, but this has been moved
            // to the DbRemoteDocument object store itself. Since the previous change
            // log only contained transient data, we can drop its object store.
            !function(t) {
                t.objectStoreNames.contains("remoteDocumentChanges") && t.deleteObjectStore("remoteDocumentChanges");
            }(t);
            // Note: Schema version 9 used to create a read time index for the
            // RemoteDocumentCache. This is now done with schema version 13.
                }))), n < 10 && s >= 10 && (r = r.next((() => this.ei(i)))), n < 11 && s >= 11 && (r = r.next((() => {
            !function(t) {
                t.createObjectStore("bundles", {
                    keyPath: "bundleId"
                });
            }(t), function(t) {
                t.createObjectStore("namedQueries", {
                    keyPath: "name"
                });
            }(t);
        }))), n < 12 && s >= 12 && (r = r.next((() => {
            !function(t) {
                const e = t.createObjectStore("documentOverlays", {
                    keyPath: oe
                });
                e.createIndex("collectionPathOverlayIndex", ue, {
                    unique: !1
                }), e.createIndex("collectionGroupOverlayIndex", ce, {
                    unique: !1
                });
            }(t);
        }))), n < 13 && s >= 13 && (r = r.next((() => function(t) {
            const e = t.createObjectStore("remoteDocumentsV14", {
                keyPath: Ht
            });
            e.createIndex("documentKeyIndex", Jt), e.createIndex("collectionGroupIndex", Yt);
        }(t))).next((() => this.ni(t, i))).next((() => t.deleteObjectStore("remoteDocuments")))), 
        n < 14 && s >= 14 && (r = r.next((() => this.si(t, i)))), n < 15 && s >= 15 && (r = r.next((() => function(t) {
            t.createObjectStore("indexConfiguration", {
                keyPath: "indexId",
                autoIncrement: !0
            }).createIndex("collectionGroupIndex", "collectionGroup", {
                unique: !1
            });
            t.createObjectStore("indexState", {
                keyPath: ne
            }).createIndex("sequenceNumberIndex", se, {
                unique: !1
            });
            t.createObjectStore("indexEntries", {
                keyPath: ie
            }).createIndex("documentKeyIndex", re, {
                unique: !1
            });
        }(t)))), r;
    }
    Xs(t) {
        let e = 0;
        return t.store("remoteDocuments").X(((t, n) => {
            e += ro(n);
        })).next((() => {
            const n = {
                byteSize: e
            };
            return t.store("remoteDocumentGlobal").put("remoteDocumentGlobalKey", n);
        }));
    }
    Ys(t) {
        const e = t.store("mutationQueues"), n = t.store("mutations");
        return e.j().next((e => Rt.forEach(e, (e => {
            const s = IDBKeyRange.bound([ e.userId, -1 ], [ e.userId, e.lastAcknowledgedBatchId ]);
            return n.j("userMutationsIndex", s).next((n => Rt.forEach(n, (n => {
                F(n.userId === e.userId);
                const s = _r(this.serializer, n);
                return io(t, e.userId, s).next((() => {}));
            }))));
        }))));
    }
    /**
     * Ensures that every document in the remote document cache has a corresponding sentinel row
     * with a sequence number. Missing rows are given the most recently used sequence number.
     */    Zs(t) {
        const e = t.store("targetDocuments"), n = t.store("remoteDocuments");
        return t.store("targetGlobal").get("targetGlobalKey").next((t => {
            const s = [];
            return n.X(((n, i) => {
                const r = new ut(n), o = function(t) {
                    return [ 0, qt(t) ];
                }(r);
                s.push(e.get(o).next((n => n ? Rt.resolve() : (n => e.put({
                    targetId: 0,
                    path: qt(n),
                    sequenceNumber: t.highestListenSequenceNumber
                }))(r))));
            })).next((() => Rt.waitFor(s)));
        }));
    }
    ti(t, e) {
        // Create the index.
        t.createObjectStore("collectionParents", {
            keyPath: ee
        });
        const n = e.store("collectionParents"), s = new Wr, i = t => {
            if (s.add(t)) {
                const e = t.lastSegment(), s = t.popLast();
                return n.put({
                    collectionId: e,
                    parent: qt(s)
                });
            }
        };
        // Helper to add an index entry iff we haven't already written it.
                // Index existing remote documents.
        return e.store("remoteDocuments").X({
            Y: !0
        }, ((t, e) => {
            const n = new ut(t);
            return i(n.popLast());
        })).next((() => e.store("documentMutations").X({
            Y: !0
        }, (([t, e, n], s) => {
            const r = Gt(e);
            return i(r.popLast());
        }))));
    }
    ei(t) {
        const e = t.store("targets");
        return e.X(((t, n) => {
            const s = mr(n), i = gr(this.serializer, s);
            return e.put(i);
        }));
    }
    ni(t, e) {
        const n = e.store("remoteDocuments"), s = [];
        return n.X(((t, n) => {
            const i = e.store("remoteDocumentsV14"), r = (o = n, o.document ? new ht(ut.fromString(o.document.name).popFirst(5)) : o.noDocument ? ht.fromSegments(o.noDocument.path) : o.unknownDocument ? ht.fromSegments(o.unknownDocument.path) : O()).path.toArray();
            var o;
            /**
 * @license
 * Copyright 2017 Google LLC
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
 */            const u = {
                prefixPath: r.slice(0, r.length - 2),
                collectionGroup: r[r.length - 2],
                documentId: r[r.length - 1],
                readTime: n.readTime || [ 0, 0 ],
                unknownDocument: n.unknownDocument,
                noDocument: n.noDocument,
                document: n.document,
                hasCommittedMutations: !!n.hasCommittedMutations
            };
            s.push(i.put(u));
        })).next((() => Rt.waitFor(s)));
    }
    si(t, e) {
        const n = e.store("mutations"), s = Po(this.serializer), i = new Ko(Qo.zs, this.serializer.fe);
        return n.j().next((t => {
            const n = new Map;
            return t.forEach((t => {
                var e;
                let s = null !== (e = n.get(t.userId)) && void 0 !== e ? e : gs();
                _r(this.serializer, t).keys().forEach((t => s = s.add(t))), n.set(t.userId, s);
            })), Rt.forEach(n, ((t, n) => {
                const r = new V(n), o = Rr.de(this.serializer, r), u = i.getIndexManager(r), c = oo.de(r, this.serializer, u, i.referenceDelegate);
                return new ko(s, c, o, u).recalculateAndSaveOverlaysForDocumentKeys(new we(e, Ot.ct), t).next();
            }));
        }));
    }
}

function Wo(t) {
    t.createObjectStore("targetDocuments", {
        keyPath: Zt
    }).createIndex("documentTargetsIndex", te, {
        unique: !0
    });
    // NOTE: This is unique only because the TargetId is the suffix.
    t.createObjectStore("targets", {
        keyPath: "targetId"
    }).createIndex("queryTargetsIndex", Xt, {
        unique: !0
    }), t.createObjectStore("targetGlobal");
}

const Ho = "Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.";

/**
 * Oldest acceptable age in milliseconds for client metadata before the client
 * is considered inactive and its associated data is garbage collected.
 */
/**
 * An IndexedDB-backed instance of Persistence. Data is stored persistently
 * across sessions.
 *
 * On Web only, the Firestore SDKs support shared access to its persistence
 * layer. This allows multiple browser tabs to read and write to IndexedDb and
 * to synchronize state even without network connectivity. Shared access is
 * currently optional and not enabled unless all clients invoke
 * `enablePersistence()` with `{synchronizeTabs:true}`.
 *
 * In multi-tab mode, if multiple clients are active at the same time, the SDK
 * will designate one client as the “primary client”. An effort is made to pick
 * a visible, network-connected and active client, and this client is
 * responsible for letting other clients know about its presence. The primary
 * client writes a unique client-generated identifier (the client ID) to
 * IndexedDb’s “owner” store every 4 seconds. If the primary client fails to
 * update this entry, another client can acquire the lease and take over as
 * primary.
 *
 * Some persistence operations in the SDK are designated as primary-client only
 * operations. This includes the acknowledgment of mutations and all updates of
 * remote documents. The effects of these operations are written to persistence
 * and then broadcast to other tabs via LocalStorage (see
 * `WebStorageSharedClientState`), which then refresh their state from
 * persistence.
 *
 * Similarly, the primary client listens to notifications sent by secondary
 * clients to discover persistence changes written by secondary clients, such as
 * the addition of new mutations and query targets.
 *
 * If multi-tab is not enabled and another tab already obtained the primary
 * lease, IndexedDbPersistence enters a failed state and all subsequent
 * operations will automatically fail.
 *
 * Additionally, there is an optimization so that when a tab is closed, the
 * primary lease is released immediately (this is especially important to make
 * sure that a refreshed tab is able to immediately re-acquire the primary
 * lease). Unfortunately, IndexedDB cannot be reliably used in window.unload
 * since it is an asynchronous API. So in addition to attempting to give up the
 * lease, the leaseholder writes its client ID to a "zombiedClient" entry in
 * LocalStorage which acts as an indicator that another tab should go ahead and
 * take the primary lease immediately regardless of the current lease timestamp.
 *
 * TODO(b/114226234): Remove `synchronizeTabs` section when multi-tab is no
 * longer optional.
 */
class Jo {
    constructor(
    /**
     * Whether to synchronize the in-memory state of multiple tabs and share
     * access to local persistence.
     */
    t, e, n, s, i, r, o, u, c, 
    /**
     * If set to true, forcefully obtains database access. Existing tabs will
     * no longer be able to access IndexedDB.
     */
    a, h = 15) {
        if (this.allowTabSynchronization = t, this.persistenceKey = e, this.clientId = n, 
        this.ii = i, this.window = r, this.document = o, this.ri = c, this.oi = a, this.ui = h, 
        this.Os = null, this.Fs = !1, this.isPrimary = !1, this.networkEnabled = !0, 
        /** Our window.unload handler, if registered. */
        this.ci = null, this.inForeground = !1, 
        /** Our 'visibilitychange' listener if registered. */
        this.ai = null, 
        /** The client metadata refresh task. */
        this.hi = null, 
        /** The last time we garbage collected the client metadata object store. */
        this.li = Number.NEGATIVE_INFINITY, 
        /** A listener to notify on primary state changes. */
        this.fi = t => Promise.resolve(), !Jo.D()) throw new U(q.UNIMPLEMENTED, "This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");
        this.referenceDelegate = new Eo(this, s), this.di = e + "main", this.serializer = new ar(u), 
        this.wi = new bt(this.di, this.ui, new zo(this.serializer)), this.Bs = new fo(this.referenceDelegate, this.serializer), 
        this.remoteDocumentCache = Po(this.serializer), this.qs = new Er, this.window && this.window.localStorage ? this._i = this.window.localStorage : (this._i = null, 
        !1 === a && k("IndexedDbPersistence", "LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."));
    }
    /**
     * Attempt to start IndexedDb persistence.
     *
     * @returns Whether persistence was enabled.
     */    start() {
        // NOTE: This is expected to fail sometimes (in the case of another tab
        // already having the persistence lock), so it's the first thing we should
        // do.
        return this.mi().then((() => {
            if (!this.isPrimary && !this.allowTabSynchronization) 
            // Fail `start()` if `synchronizeTabs` is disabled and we cannot
            // obtain the primary lease.
            throw new U(q.FAILED_PRECONDITION, Ho);
            return this.gi(), this.yi(), this.pi(), this.runTransaction("getHighestListenSequenceNumber", "readonly", (t => this.Bs.getHighestSequenceNumber(t)));
        })).then((t => {
            this.Os = new Ot(t, this.ri);
        })).then((() => {
            this.Fs = !0;
        })).catch((t => (this.wi && this.wi.close(), Promise.reject(t))));
    }
    /**
     * Registers a listener that gets called when the primary state of the
     * instance changes. Upon registering, this listener is invoked immediately
     * with the current primary state.
     *
     * PORTING NOTE: This is only used for Web multi-tab.
     */    Ii(t) {
        return this.fi = async e => {
            if (this.started) return t(e);
        }, t(this.isPrimary);
    }
    /**
     * Registers a listener that gets called when the database receives a
     * version change event indicating that it has deleted.
     *
     * PORTING NOTE: This is only used for Web multi-tab.
     */    setDatabaseDeletedListener(t) {
        this.wi.B((async e => {
            // Check if an attempt is made to delete IndexedDB.
            null === e.newVersion && await t();
        }));
    }
    /**
     * Adjusts the current network state in the client's metadata, potentially
     * affecting the primary lease.
     *
     * PORTING NOTE: This is only used for Web multi-tab.
     */    setNetworkEnabled(t) {
        this.networkEnabled !== t && (this.networkEnabled = t, 
        // Schedule a primary lease refresh for immediate execution. The eventual
        // lease update will be propagated via `primaryStateListener`.
        this.ii.enqueueAndForget((async () => {
            this.started && await this.mi();
        })));
    }
    /**
     * Updates the client metadata in IndexedDb and attempts to either obtain or
     * extend the primary lease for the local client. Asynchronously notifies the
     * primary state listener if the client either newly obtained or released its
     * primary lease.
     */    mi() {
        return this.runTransaction("updateClientMetadataAndTryBecomePrimary", "readwrite", (t => Xo(t).put({
            clientId: this.clientId,
            updateTimeMs: Date.now(),
            networkEnabled: this.networkEnabled,
            inForeground: this.inForeground
        }).next((() => {
            if (this.isPrimary) return this.Ti(t).next((t => {
                t || (this.isPrimary = !1, this.ii.enqueueRetryable((() => this.fi(!1))));
            }));
        })).next((() => this.Ei(t))).next((e => this.isPrimary && !e ? this.Ai(t).next((() => !1)) : !!e && this.vi(t).next((() => !0)))))).catch((t => {
            if (Dt(t)) 
            // Proceed with the existing state. Any subsequent access to
            // IndexedDB will verify the lease.
            return N("IndexedDbPersistence", "Failed to extend owner lease: ", t), this.isPrimary;
            if (!this.allowTabSynchronization) throw t;
            return N("IndexedDbPersistence", "Releasing owner lease after error during lease refresh", t), 
            /* isPrimary= */ !1;
        })).then((t => {
            this.isPrimary !== t && this.ii.enqueueRetryable((() => this.fi(t))), this.isPrimary = t;
        }));
    }
    Ti(t) {
        return Yo(t).get("owner").next((t => Rt.resolve(this.Ri(t))));
    }
    Pi(t) {
        return Xo(t).delete(this.clientId);
    }
    /**
     * If the garbage collection threshold has passed, prunes the
     * RemoteDocumentChanges and the ClientMetadata store based on the last update
     * time of all clients.
     */    async bi() {
        if (this.isPrimary && !this.Vi(this.li, 18e5)) {
            this.li = Date.now();
            const t = await this.runTransaction("maybeGarbageCollectMultiClientState", "readwrite-primary", (t => {
                const e = _e(t, "clientMetadata");
                return e.j().next((t => {
                    const n = this.Si(t, 18e5), s = t.filter((t => -1 === n.indexOf(t)));
                    // Delete metadata for clients that are no longer considered active.
                    return Rt.forEach(s, (t => e.delete(t.clientId))).next((() => s));
                }));
            })).catch((() => []));
            // Delete potential leftover entries that may continue to mark the
            // inactive clients as zombied in LocalStorage.
            // Ideally we'd delete the IndexedDb and LocalStorage zombie entries for
            // the client atomically, but we can't. So we opt to delete the IndexedDb
            // entries first to avoid potentially reviving a zombied client.
                        if (this._i) for (const e of t) this._i.removeItem(this.Di(e.clientId));
        }
    }
    /**
     * Schedules a recurring timer to update the client metadata and to either
     * extend or acquire the primary lease if the client is eligible.
     */    pi() {
        this.hi = this.ii.enqueueAfterDelay("client_metadata_refresh" /* TimerId.ClientMetadataRefresh */ , 4e3, (() => this.mi().then((() => this.bi())).then((() => this.pi()))));
    }
    /** Checks whether `client` is the local client. */    Ri(t) {
        return !!t && t.ownerId === this.clientId;
    }
    /**
     * Evaluate the state of all active clients and determine whether the local
     * client is or can act as the holder of the primary lease. Returns whether
     * the client is eligible for the lease, but does not actually acquire it.
     * May return 'false' even if there is no active leaseholder and another
     * (foreground) client should become leaseholder instead.
     */    Ei(t) {
        if (this.oi) return Rt.resolve(!0);
        return Yo(t).get("owner").next((e => {
            // A client is eligible for the primary lease if:
            // - its network is enabled and the client's tab is in the foreground.
            // - its network is enabled and no other client's tab is in the
            //   foreground.
            // - every clients network is disabled and the client's tab is in the
            //   foreground.
            // - every clients network is disabled and no other client's tab is in
            //   the foreground.
            // - the `forceOwningTab` setting was passed in.
            if (null !== e && this.Vi(e.leaseTimestampMs, 5e3) && !this.Ci(e.ownerId)) {
                if (this.Ri(e) && this.networkEnabled) return !0;
                if (!this.Ri(e)) {
                    if (!e.allowTabSynchronization) 
                    // Fail the `canActAsPrimary` check if the current leaseholder has
                    // not opted into multi-tab synchronization. If this happens at
                    // client startup, we reject the Promise returned by
                    // `enablePersistence()` and the user can continue to use Firestore
                    // with in-memory persistence.
                    // If this fails during a lease refresh, we will instead block the
                    // AsyncQueue from executing further operations. Note that this is
                    // acceptable since mixing & matching different `synchronizeTabs`
                    // settings is not supported.
                    // TODO(b/114226234): Remove this check when `synchronizeTabs` can
                    // no longer be turned off.
                    throw new U(q.FAILED_PRECONDITION, Ho);
                    return !1;
                }
            }
            return !(!this.networkEnabled || !this.inForeground) || Xo(t).j().next((t => void 0 === this.Si(t, 5e3).find((t => {
                if (this.clientId !== t.clientId) {
                    const e = !this.networkEnabled && t.networkEnabled, n = !this.inForeground && t.inForeground, s = this.networkEnabled === t.networkEnabled;
                    if (e || n && s) return !0;
                }
                return !1;
            }))));
        })).next((t => (this.isPrimary !== t && N("IndexedDbPersistence", `Client ${t ? "is" : "is not"} eligible for a primary lease.`), 
        t)));
    }
    async shutdown() {
        // The shutdown() operations are idempotent and can be called even when
        // start() aborted (e.g. because it couldn't acquire the persistence lease).
        this.Fs = !1, this.xi(), this.hi && (this.hi.cancel(), this.hi = null), this.Ni(), 
        this.ki(), 
        // Use `SimpleDb.runTransaction` directly to avoid failing if another tab
        // has obtained the primary lease.
        await this.wi.runTransaction("shutdown", "readwrite", [ "owner", "clientMetadata" ], (t => {
            const e = new we(t, Ot.ct);
            return this.Ai(e).next((() => this.Pi(e)));
        })), this.wi.close(), 
        // Remove the entry marking the client as zombied from LocalStorage since
        // we successfully deleted its metadata from IndexedDb.
        this.Mi();
    }
    /**
     * Returns clients that are not zombied and have an updateTime within the
     * provided threshold.
     */    Si(t, e) {
        return t.filter((t => this.Vi(t.updateTimeMs, e) && !this.Ci(t.clientId)));
    }
    /**
     * Returns the IDs of the clients that are currently active. If multi-tab
     * is not supported, returns an array that only contains the local client's
     * ID.
     *
     * PORTING NOTE: This is only used for Web multi-tab.
     */    $i() {
        return this.runTransaction("getActiveClients", "readonly", (t => Xo(t).j().next((t => this.Si(t, 18e5).map((t => t.clientId))))));
    }
    get started() {
        return this.Fs;
    }
    getMutationQueue(t, e) {
        return oo.de(t, this.serializer, e, this.referenceDelegate);
    }
    getTargetCache() {
        return this.Bs;
    }
    getRemoteDocumentCache() {
        return this.remoteDocumentCache;
    }
    getIndexManager(t) {
        return new Jr(t, this.serializer.fe.databaseId);
    }
    getDocumentOverlayCache(t) {
        return Rr.de(this.serializer, t);
    }
    getBundleCache() {
        return this.qs;
    }
    runTransaction(t, e, n) {
        N("IndexedDbPersistence", "Starting transaction:", t);
        const s = "readonly" === e ? "readonly" : "readwrite", i = 15 === (r = this.ui) ? de : 14 === r ? fe : 13 === r ? le : 12 === r ? he : 11 === r ? ae : void O();
        /** Returns the object stores for the provided schema. */
        var r;
        let o;
        // Do all transactions as readwrite against all object stores, since we
        // are the only reader/writer.
                return this.wi.runTransaction(t, s, i, (s => (o = new we(s, this.Os ? this.Os.next() : Ot.ct), 
        "readwrite-primary" === e ? this.Ti(o).next((t => !!t || this.Ei(o))).next((e => {
            if (!e) throw k(`Failed to obtain primary lease for action '${t}'.`), this.isPrimary = !1, 
            this.ii.enqueueRetryable((() => this.fi(!1))), new U(q.FAILED_PRECONDITION, Et);
            return n(o);
        })).next((t => this.vi(o).next((() => t)))) : this.Oi(o).next((() => n(o)))))).then((t => (o.raiseOnCommittedEvent(), 
        t)));
    }
    /**
     * Verifies that the current tab is the primary leaseholder or alternatively
     * that the leaseholder has opted into multi-tab synchronization.
     */
    // TODO(b/114226234): Remove this check when `synchronizeTabs` can no longer
    // be turned off.
    Oi(t) {
        return Yo(t).get("owner").next((t => {
            if (null !== t && this.Vi(t.leaseTimestampMs, 5e3) && !this.Ci(t.ownerId) && !this.Ri(t) && !(this.oi || this.allowTabSynchronization && t.allowTabSynchronization)) throw new U(q.FAILED_PRECONDITION, Ho);
        }));
    }
    /**
     * Obtains or extends the new primary lease for the local client. This
     * method does not verify that the client is eligible for this lease.
     */    vi(t) {
        const e = {
            ownerId: this.clientId,
            allowTabSynchronization: this.allowTabSynchronization,
            leaseTimestampMs: Date.now()
        };
        return Yo(t).put("owner", e);
    }
    static D() {
        return bt.D();
    }
    /** Checks the primary lease and removes it if we are the current primary. */    Ai(t) {
        const e = Yo(t);
        return e.get("owner").next((t => this.Ri(t) ? (N("IndexedDbPersistence", "Releasing primary lease."), 
        e.delete("owner")) : Rt.resolve()));
    }
    /** Verifies that `updateTimeMs` is within `maxAgeMs`. */    Vi(t, e) {
        const n = Date.now();
        return !(t < n - e) && (!(t > n) || (k(`Detected an update time that is in the future: ${t} > ${n}`), 
        !1));
    }
    gi() {
        null !== this.document && "function" == typeof this.document.addEventListener && (this.ai = () => {
            this.ii.enqueueAndForget((() => (this.inForeground = "visible" === this.document.visibilityState, 
            this.mi())));
        }, this.document.addEventListener("visibilitychange", this.ai), this.inForeground = "visible" === this.document.visibilityState);
    }
    Ni() {
        this.ai && (this.document.removeEventListener("visibilitychange", this.ai), this.ai = null);
    }
    /**
     * Attaches a window.unload handler that will synchronously write our
     * clientId to a "zombie client id" location in LocalStorage. This can be used
     * by tabs trying to acquire the primary lease to determine that the lease
     * is no longer valid even if the timestamp is recent. This is particularly
     * important for the refresh case (so the tab correctly re-acquires the
     * primary lease). LocalStorage is used for this rather than IndexedDb because
     * it is a synchronous API and so can be used reliably from  an unload
     * handler.
     */    yi() {
        var t;
        "function" == typeof (null === (t = this.window) || void 0 === t ? void 0 : t.addEventListener) && (this.ci = () => {
            // Note: In theory, this should be scheduled on the AsyncQueue since it
            // accesses internal state. We execute this code directly during shutdown
            // to make sure it gets a chance to run.
            this.xi();
            const t = /(?:Version|Mobile)\/1[456]/;
            util.isSafari() && (navigator.appVersion.match(t) || navigator.userAgent.match(t)) && 
            // On Safari 14, 15, and 16, we do not run any cleanup actions as it might
            // trigger a bug that prevents Safari from re-opening IndexedDB during
            // the next page load.
            // See https://bugs.webkit.org/show_bug.cgi?id=226547
            this.ii.enterRestrictedMode(/* purgeExistingTasks= */ !0), this.ii.enqueueAndForget((() => this.shutdown()));
        }, this.window.addEventListener("pagehide", this.ci));
    }
    ki() {
        this.ci && (this.window.removeEventListener("pagehide", this.ci), this.ci = null);
    }
    /**
     * Returns whether a client is "zombied" based on its LocalStorage entry.
     * Clients become zombied when their tab closes without running all of the
     * cleanup logic in `shutdown()`.
     */    Ci(t) {
        var e;
        try {
            const n = null !== (null === (e = this._i) || void 0 === e ? void 0 : e.getItem(this.Di(t)));
            return N("IndexedDbPersistence", `Client '${t}' ${n ? "is" : "is not"} zombied in LocalStorage`), 
            n;
        } catch (t) {
            // Gracefully handle if LocalStorage isn't working.
            return k("IndexedDbPersistence", "Failed to get zombied client id.", t), !1;
        }
    }
    /**
     * Record client as zombied (a client that had its tab closed). Zombied
     * clients are ignored during primary tab selection.
     */    xi() {
        if (this._i) try {
            this._i.setItem(this.Di(this.clientId), String(Date.now()));
        } catch (t) {
            // Gracefully handle if LocalStorage isn't available / working.
            k("Failed to set zombie client id.", t);
        }
    }
    /** Removes the zombied client entry if it exists. */    Mi() {
        if (this._i) try {
            this._i.removeItem(this.Di(this.clientId));
        } catch (t) {
            // Ignore
        }
    }
    Di(t) {
        return `firestore_zombie_${this.persistenceKey}_${t}`;
    }
}

/**
 * Helper to get a typed SimpleDbStore for the primary client object store.
 */ function Yo(t) {
    return _e(t, "owner");
}

/**
 * Helper to get a typed SimpleDbStore for the client metadata object store.
 */ function Xo(t) {
    return _e(t, "clientMetadata");
}

/**
 * Generates a string used as a prefix when storing data in IndexedDB and
 * LocalStorage.
 */ function Zo(t, e) {
    // Use two different prefix formats:
    //   * firestore / persistenceKey / projectID . databaseID / ...
    //   * firestore / persistenceKey / projectID / ...
    // projectIDs are DNS-compatible names and cannot contain dots
    // so there's no danger of collisions.
    let n = t.projectId;
    return t.isDefaultDatabase || (n += "." + t.database), "firestore/" + e + "/" + n + "/";
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * A set of changes to what documents are currently in view and out of view for
 * a given query. These changes are sent to the LocalStore by the View (via
 * the SyncEngine) and are used to pin / unpin documents as appropriate.
 */
class tu {
    constructor(t, e, n, s) {
        this.targetId = t, this.fromCache = e, this.Fi = n, this.Bi = s;
    }
    static Li(t, e) {
        let n = gs(), s = gs();
        for (const t of e.docChanges) switch (t.type) {
          case 0 /* ChangeType.Added */ :
            n = n.add(t.doc.key);
            break;

          case 1 /* ChangeType.Removed */ :
            s = s.add(t.doc.key);
 // do nothing
                }
        return new tu(t, e.fromCache, n, s);
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
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
/**
 * The Firestore query engine.
 *
 * Firestore queries can be executed in three modes. The Query Engine determines
 * what mode to use based on what data is persisted. The mode only determines
 * the runtime complexity of the query - the result set is equivalent across all
 * implementations.
 *
 * The Query engine will use indexed-based execution if a user has configured
 * any index that can be used to execute query (via `setIndexConfiguration()`).
 * Otherwise, the engine will try to optimize the query by re-using a previously
 * persisted query result. If that is not possible, the query will be executed
 * via a full collection scan.
 *
 * Index-based execution is the default when available. The query engine
 * supports partial indexed execution and merges the result from the index
 * lookup with documents that have not yet been indexed. The index evaluation
 * matches the backend's format and as such, the SDK can use indexing for all
 * queries that the backend supports.
 *
 * If no index exists, the query engine tries to take advantage of the target
 * document mapping in the TargetCache. These mappings exists for all queries
 * that have been synced with the backend at least once and allow the query
 * engine to only read documents that previously matched a query plus any
 * documents that were edited after the query was last listened to.
 *
 * There are some cases when this optimization is not guaranteed to produce
 * the same results as full collection scans. In these cases, query
 * processing falls back to full scans. These cases are:
 *
 * - Limit queries where a document that matched the query previously no longer
 *   matches the query.
 *
 * - Limit queries where a document edit may cause the document to sort below
 *   another document that is in the local cache.
 *
 * - Queries that have never been CURRENT or free of limbo documents.
 */ class eu {
    constructor() {
        this.qi = !1;
    }
    /** Sets the document view to query against. */    initialize(t, e) {
        this.Ui = t, this.indexManager = e, this.qi = !0;
    }
    /** Returns all local documents matching the specified query. */    getDocumentsMatchingQuery(t, e, n, s) {
        return this.Ki(t, e).next((i => i || this.Gi(t, e, s, n))).next((n => n || this.Qi(t, e)));
    }
    /**
     * Performs an indexed query that evaluates the query based on a collection's
     * persisted index values. Returns `null` if an index is not available.
     */    Ki(t, e) {
        if (Qn(e)) 
        // Queries that match all documents don't benefit from using
        // key-based lookups. It is more efficient to scan all documents in a
        // collection, rather than to perform individual lookups.
        return Rt.resolve(null);
        let n = Jn(e);
        return this.indexManager.getIndexType(t, n).next((s => 0 /* IndexType.NONE */ === s ? null : (null !== e.limit && 1 /* IndexType.PARTIAL */ === s && (
        // We cannot apply a limit for targets that are served using a partial
        // index. If a partial index will be used to serve the target, the
        // query may return a superset of documents that match the target
        // (e.g. if the index doesn't include all the target's filters), or
        // may return the correct set of documents in the wrong order (e.g. if
        // the index doesn't include a segment for one of the orderBys).
        // Therefore, a limit should not be applied in such cases.
        e = Xn(e, null, "F" /* LimitType.First */), n = Jn(e)), this.indexManager.getDocumentsMatchingTarget(t, n).next((s => {
            const i = gs(...s);
            return this.Ui.getDocuments(t, i).next((s => this.indexManager.getMinOffset(t, n).next((n => {
                const r = this.ji(e, s);
                return this.zi(e, r, i, n.readTime) ? this.Ki(t, Xn(e, null, "F" /* LimitType.First */)) : this.Wi(t, r, e, n);
            }))));
        })))));
    }
    /**
     * Performs a query based on the target's persisted query mapping. Returns
     * `null` if the mapping is not available or cannot be used.
     */    Gi(t, e, n, s) {
        return Qn(e) || s.isEqual(rt.min()) ? this.Qi(t, e) : this.Ui.getDocuments(t, n).next((i => {
            const r = this.ji(e, i);
            return this.zi(e, r, n, s) ? this.Qi(t, e) : (C() <= logger.LogLevel.DEBUG && N("QueryEngine", "Re-using previous result from %s to execute query: %s", s.toString(), es(e)), 
            this.Wi(t, r, e, yt(s, -1)));
        }));
        // Queries that have never seen a snapshot without limbo free documents
        // should also be run as a full collection scan.
        }
    /** Applies the query filter and sorting to the provided documents.  */    ji(t, e) {
        // Sort the documents and re-apply the query filter since previously
        // matching documents do not necessarily still match the query.
        let n = new Ee(is(t));
        return e.forEach(((e, s) => {
            ns(t, s) && (n = n.add(s));
        })), n;
    }
    /**
     * Determines if a limit query needs to be refilled from cache, making it
     * ineligible for index-free execution.
     *
     * @param query - The query.
     * @param sortedPreviousResults - The documents that matched the query when it
     * was last synchronized, sorted by the query's comparator.
     * @param remoteKeys - The document keys that matched the query at the last
     * snapshot.
     * @param limboFreeSnapshotVersion - The version of the snapshot when the
     * query was last synchronized.
     */    zi(t, e, n, s) {
        if (null === t.limit) 
        // Queries without limits do not need to be refilled.
        return !1;
        if (n.size !== e.size) 
        // The query needs to be refilled if a previously matching document no
        // longer matches.
        return !0;
        // Limit queries are not eligible for index-free query execution if there is
        // a potential that an older document from cache now sorts before a document
        // that was previously part of the limit. This, however, can only happen if
        // the document at the edge of the limit goes out of limit.
        // If a document that is not the limit boundary sorts differently,
        // the boundary of the limit itself did not change and documents from cache
        // will continue to be "rejected" by this boundary. Therefore, we can ignore
        // any modifications that don't affect the last document.
                const i = "F" /* LimitType.First */ === t.limitType ? e.last() : e.first();
        return !!i && (i.hasPendingWrites || i.version.compareTo(s) > 0);
    }
    Qi(t, e) {
        return C() <= logger.LogLevel.DEBUG && N("QueryEngine", "Using full collection scan to execute query:", es(e)), 
        this.Ui.getDocumentsMatchingQuery(t, e, It.min());
    }
    /**
     * Combines the results from an indexed execution with the remaining documents
     * that have not yet been indexed.
     */    Wi(t, e, n, s) {
        // Retrieve all results for documents that were updated since the offset.
        return this.Ui.getDocumentsMatchingQuery(t, n, s).next((t => (
        // Merge with existing results
        e.forEach((e => {
            t = t.insert(e.key, e);
        })), t)));
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Implements `LocalStore` interface.
 *
 * Note: some field defined in this class might have public access level, but
 * the class is not exported so they are only accessible from this module.
 * This is useful to implement optional features (like bundles) in free
 * functions, such that they are tree-shakeable.
 */
class nu {
    constructor(
    /** Manages our in-memory or durable persistence. */
    t, e, n, s) {
        this.persistence = t, this.Hi = e, this.serializer = s, 
        /**
         * Maps a targetID to data about its target.
         *
         * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
         * of `applyRemoteEvent()` idempotent.
         */
        this.Ji = new pe(et), 
        /** Maps a target to its targetID. */
        // TODO(wuandy): Evaluate if TargetId can be part of Target.
        this.Yi = new os((t => $n(t)), On), 
        /**
         * A per collection group index of the last read time processed by
         * `getNewDocumentChanges()`.
         *
         * PORTING NOTE: This is only used for multi-tab synchronization.
         */
        this.Xi = new Map, this.Zi = t.getRemoteDocumentCache(), this.Bs = t.getTargetCache(), 
        this.qs = t.getBundleCache(), this.tr(n);
    }
    tr(t) {
        // TODO(indexing): Add spec tests that test these components change after a
        // user change
        this.documentOverlayCache = this.persistence.getDocumentOverlayCache(t), this.indexManager = this.persistence.getIndexManager(t), 
        this.mutationQueue = this.persistence.getMutationQueue(t, this.indexManager), this.localDocuments = new ko(this.Zi, this.mutationQueue, this.documentOverlayCache, this.indexManager), 
        this.Zi.setIndexManager(this.indexManager), this.Hi.initialize(this.localDocuments, this.indexManager);
    }
    collectGarbage(t) {
        return this.persistence.runTransaction("Collect garbage", "readwrite-primary", (e => t.collect(e, this.Ji)));
    }
}

function su(
/** Manages our in-memory or durable persistence. */
t, e, n, s) {
    return new nu(t, e, n, s);
}

/**
 * Tells the LocalStore that the currently authenticated user has changed.
 *
 * In response the local store switches the mutation queue to the new user and
 * returns any resulting document changes.
 */
// PORTING NOTE: Android and iOS only return the documents affected by the
// change.
async function iu(t, e) {
    const n = L(t);
    return await n.persistence.runTransaction("Handle user change", "readonly", (t => {
        // Swap out the mutation queue, grabbing the pending mutation batches
        // before and after.
        let s;
        return n.mutationQueue.getAllMutationBatches(t).next((i => (s = i, n.tr(e), n.mutationQueue.getAllMutationBatches(t)))).next((e => {
            const i = [], r = [];
            // Union the old/new changed keys.
            let o = gs();
            for (const t of s) {
                i.push(t.batchId);
                for (const e of t.mutations) o = o.add(e.key);
            }
            for (const t of e) {
                r.push(t.batchId);
                for (const e of t.mutations) o = o.add(e.key);
            }
            // Return the set of all (potentially) changed documents and the list
            // of mutation batch IDs that were affected by change.
                        return n.localDocuments.getDocuments(t, o).next((t => ({
                er: t,
                removedBatchIds: i,
                addedBatchIds: r
            })));
        }));
    }));
}

/* Accepts locally generated Mutations and commit them to storage. */
/**
 * Acknowledges the given batch.
 *
 * On the happy path when a batch is acknowledged, the local store will
 *
 *  + remove the batch from the mutation queue;
 *  + apply the changes to the remote document cache;
 *  + recalculate the latency compensated view implied by those changes (there
 *    may be mutations in the queue that affect the documents but haven't been
 *    acknowledged yet); and
 *  + give the changed documents back the sync engine
 *
 * @returns The resulting (modified) documents.
 */
function ru(t, e) {
    const n = L(t);
    return n.persistence.runTransaction("Acknowledge batch", "readwrite-primary", (t => {
        const s = e.batch.keys(), i = n.Zi.newChangeBuffer({
            trackRemovals: !0
        });
        return function(t, e, n, s) {
            const i = n.batch, r = i.keys();
            let o = Rt.resolve();
            return r.forEach((t => {
                o = o.next((() => s.getEntry(e, t))).next((e => {
                    const r = n.docVersions.get(t);
                    F(null !== r), e.version.compareTo(r) < 0 && (i.applyToRemoteDocument(e, n), e.isValidDocument() && (
                    // We use the commitVersion as the readTime rather than the
                    // document's updateTime since the updateTime is not advanced
                    // for updates that do not modify the underlying document.
                    e.setReadTime(n.commitVersion), s.addEntry(e)));
                }));
            })), o.next((() => t.mutationQueue.removeMutationBatch(e, i)));
        }
        /** Returns the local view of the documents affected by a mutation batch. */
        // PORTING NOTE: Multi-Tab only.
        (n, t, e, i).next((() => i.apply(t))).next((() => n.mutationQueue.performConsistencyCheck(t))).next((() => n.documentOverlayCache.removeOverlaysForBatchId(t, s, e.batch.batchId))).next((() => n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(t, function(t) {
            let e = gs();
            for (let n = 0; n < t.mutationResults.length; ++n) {
                t.mutationResults[n].transformResults.length > 0 && (e = e.add(t.batch.mutations[n].key));
            }
            return e;
        }
        /**
 * Removes mutations from the MutationQueue for the specified batch;
 * LocalDocuments will be recalculated.
 *
 * @returns The resulting modified documents.
 */ (e)))).next((() => n.localDocuments.getDocuments(t, s)));
    }));
}

/**
 * Returns the last consistent snapshot processed (used by the RemoteStore to
 * determine whether to buffer incoming snapshots from the backend).
 */
function ou(t) {
    const e = L(t);
    return e.persistence.runTransaction("Get last remote snapshot version", "readonly", (t => e.Bs.getLastRemoteSnapshotVersion(t)));
}

/**
 * Updates the "ground-state" (remote) documents. We assume that the remote
 * event reflects any write batches that have been acknowledged or rejected
 * (i.e. we do not re-apply local mutations to updates from this event).
 *
 * LocalDocuments are re-calculated if there are remaining mutations in the
 * queue.
 */ function uu(t, e) {
    const n = L(t), s = e.snapshotVersion;
    let i = n.Ji;
    return n.persistence.runTransaction("Apply remote event", "readwrite-primary", (t => {
        const r = n.Zi.newChangeBuffer({
            trackRemovals: !0
        });
        // Reset newTargetDataByTargetMap in case this transaction gets re-run.
                i = n.Ji;
        const o = [];
        e.targetChanges.forEach(((r, u) => {
            const c = i.get(u);
            if (!c) return;
            // Only update the remote keys if the target is still active. This
            // ensures that we can persist the updated target data along with
            // the updated assignment.
                        o.push(n.Bs.removeMatchingKeys(t, r.removedDocuments, u).next((() => n.Bs.addMatchingKeys(t, r.addedDocuments, u))));
            let a = c.withSequenceNumber(t.currentSequenceNumber);
            null !== e.targetMismatches.get(u) ? a = a.withResumeToken(Ve.EMPTY_BYTE_STRING, rt.min()).withLastLimboFreeSnapshotVersion(rt.min()) : r.resumeToken.approximateByteSize() > 0 && (a = a.withResumeToken(r.resumeToken, s)), 
            i = i.insert(u, a), 
            // Update the target data if there are target changes (or if
            // sufficient time has passed since the last update).
            /**
 * Returns true if the newTargetData should be persisted during an update of
 * an active target. TargetData should always be persisted when a target is
 * being released and should not call this function.
 *
 * While the target is active, TargetData updates can be omitted when nothing
 * about the target has changed except metadata like the resume token or
 * snapshot version. Occasionally it's worth the extra write to prevent these
 * values from getting too stale after a crash, but this doesn't have to be
 * too frequent.
 */
            function(t, e, n) {
                // Always persist target data if we don't already have a resume token.
                if (0 === t.resumeToken.approximateByteSize()) return !0;
                // Don't allow resume token changes to be buffered indefinitely. This
                // allows us to be reasonably up-to-date after a crash and avoids needing
                // to loop over all active queries on shutdown. Especially in the browser
                // we may not get time to do anything interesting while the current tab is
                // closing.
                                if (e.snapshotVersion.toMicroseconds() - t.snapshotVersion.toMicroseconds() >= 3e8) return !0;
                // Otherwise if the only thing that has changed about a target is its resume
                // token it's not worth persisting. Note that the RemoteStore keeps an
                // in-memory view of the currently active targets which includes the current
                // resume token, so stream failure or user changes will still use an
                // up-to-date resume token regardless of what we do here.
                                return n.addedDocuments.size + n.modifiedDocuments.size + n.removedDocuments.size > 0;
            }
            /**
 * Notifies local store of the changed views to locally pin documents.
 */ (c, a, r) && o.push(n.Bs.updateTargetData(t, a));
        }));
        let u = cs(), c = gs();
        // HACK: The only reason we allow a null snapshot version is so that we
        // can synthesize remote events when we get permission denied errors while
        // trying to resolve the state of a locally cached document that is in
        // limbo.
        if (e.documentUpdates.forEach((s => {
            e.resolvedLimboDocuments.has(s) && o.push(n.persistence.referenceDelegate.updateLimboDocument(t, s));
        })), 
        // Each loop iteration only affects its "own" doc, so it's safe to get all
        // the remote documents in advance in a single call.
        o.push(cu(t, r, e.documentUpdates).next((t => {
            u = t.nr, c = t.sr;
        }))), !s.isEqual(rt.min())) {
            const e = n.Bs.getLastRemoteSnapshotVersion(t).next((e => n.Bs.setTargetsMetadata(t, t.currentSequenceNumber, s)));
            o.push(e);
        }
        return Rt.waitFor(o).next((() => r.apply(t))).next((() => n.localDocuments.getLocalViewOfDocuments(t, u, c))).next((() => u));
    })).then((t => (n.Ji = i, t)));
}

/**
 * Populates document change buffer with documents from backend or a bundle.
 * Returns the document changes resulting from applying those documents, and
 * also a set of documents whose existence state are changed as a result.
 *
 * @param txn - Transaction to use to read existing documents from storage.
 * @param documentBuffer - Document buffer to collect the resulted changes to be
 *        applied to storage.
 * @param documents - Documents to be applied.
 */ function cu(t, e, n) {
    let s = gs(), i = gs();
    return n.forEach((t => s = s.add(t))), e.getEntries(t, s).next((t => {
        let s = cs();
        return n.forEach(((n, r) => {
            const o = t.get(n);
            // Check if see if there is a existence state change for this document.
                        r.isFoundDocument() !== o.isFoundDocument() && (i = i.add(n)), 
            // Note: The order of the steps below is important, since we want
            // to ensure that rejected limbo resolutions (which fabricate
            // NoDocuments with SnapshotVersion.min()) never add documents to
            // cache.
            r.isNoDocument() && r.version.isEqual(rt.min()) ? (
            // NoDocuments with SnapshotVersion.min() are used in manufactured
            // events. We remove these documents from cache since we lost
            // access.
            e.removeEntry(n, r.readTime), s = s.insert(n, r)) : !o.isValidDocument() || r.version.compareTo(o.version) > 0 || 0 === r.version.compareTo(o.version) && o.hasPendingWrites ? (e.addEntry(r), 
            s = s.insert(n, r)) : N("LocalStore", "Ignoring outdated watch update for ", n, ". Current version:", o.version, " Watch version:", r.version);
        })), {
            nr: s,
            sr: i
        };
    }));
}

/**
 * Gets the mutation batch after the passed in batchId in the mutation queue
 * or null if empty.
 * @param afterBatchId - If provided, the batch to search after.
 * @returns The next mutation or null if there wasn't one.
 */
function au(t, e) {
    const n = L(t);
    return n.persistence.runTransaction("Get next mutation batch", "readonly", (t => (void 0 === e && (e = -1), 
    n.mutationQueue.getNextMutationBatchAfterBatchId(t, e))));
}

/**
 * Reads the current value of a Document with a given key or null if not
 * found - used for testing.
 */
/**
 * Assigns the given target an internal ID so that its results can be pinned so
 * they don't get GC'd. A target must be allocated in the local store before
 * the store can be used to manage its view.
 *
 * Allocating an already allocated `Target` will return the existing `TargetData`
 * for that `Target`.
 */
function hu(t, e) {
    const n = L(t);
    return n.persistence.runTransaction("Allocate target", "readwrite", (t => {
        let s;
        return n.Bs.getTargetData(t, e).next((i => i ? (
        // This target has been listened to previously, so reuse the
        // previous targetID.
        // TODO(mcg): freshen last accessed date?
        s = i, Rt.resolve(s)) : n.Bs.allocateTargetId(t).next((i => (s = new cr(e, i, "TargetPurposeListen" /* TargetPurpose.Listen */ , t.currentSequenceNumber), 
        n.Bs.addTargetData(t, s).next((() => s)))))));
    })).then((t => {
        // If Multi-Tab is enabled, the existing target data may be newer than
        // the in-memory data
        const s = n.Ji.get(t.targetId);
        return (null === s || t.snapshotVersion.compareTo(s.snapshotVersion) > 0) && (n.Ji = n.Ji.insert(t.targetId, t), 
        n.Yi.set(e, t.targetId)), t;
    }));
}

/**
 * Returns the TargetData as seen by the LocalStore, including updates that may
 * have not yet been persisted to the TargetCache.
 */
// Visible for testing.
/**
 * Unpins all the documents associated with the given target. If
 * `keepPersistedTargetData` is set to false and Eager GC enabled, the method
 * directly removes the associated target data from the target cache.
 *
 * Releasing a non-existing `Target` is a no-op.
 */
// PORTING NOTE: `keepPersistedTargetData` is multi-tab only.
async function lu(t, e, n) {
    const s = L(t), i = s.Ji.get(e), r = n ? "readwrite" : "readwrite-primary";
    try {
        n || await s.persistence.runTransaction("Release target", r, (t => s.persistence.referenceDelegate.removeTarget(t, i)));
    } catch (t) {
        if (!Dt(t)) throw t;
        // All `releaseTarget` does is record the final metadata state for the
        // target, but we've been recording this periodically during target
        // activity. If we lose this write this could cause a very slight
        // difference in the order of target deletion during GC, but we
        // don't define exact LRU semantics so this is acceptable.
        N("LocalStore", `Failed to update sequence numbers for target ${e}: ${t}`);
    }
    s.Ji = s.Ji.remove(e), s.Yi.delete(i.target);
}

/**
 * Runs the specified query against the local store and returns the results,
 * potentially taking advantage of query data from previous executions (such
 * as the set of remote keys).
 *
 * @param usePreviousResults - Whether results from previous executions can
 * be used to optimize this query execution.
 */ function fu(t, e, n) {
    const s = L(t);
    let i = rt.min(), r = gs();
    return s.persistence.runTransaction("Execute query", "readonly", (t => function(t, e, n) {
        const s = L(t), i = s.Yi.get(n);
        return void 0 !== i ? Rt.resolve(s.Ji.get(i)) : s.Bs.getTargetData(e, n);
    }(s, t, Jn(e)).next((e => {
        if (e) return i = e.lastLimboFreeSnapshotVersion, s.Bs.getMatchingKeysForTargetId(t, e.targetId).next((t => {
            r = t;
        }));
    })).next((() => s.Hi.getDocumentsMatchingQuery(t, e, n ? i : rt.min(), n ? r : gs()))).next((t => (_u(s, ss(e), t), 
    {
        documents: t,
        ir: r
    })))));
}

// PORTING NOTE: Multi-Tab only.
function du(t, e) {
    const n = L(t), s = L(n.Bs), i = n.Ji.get(e);
    return i ? Promise.resolve(i.target) : n.persistence.runTransaction("Get target data", "readonly", (t => s.le(t, e).next((t => t ? t.target : null))));
}

/**
 * Returns the set of documents that have been updated since the last call.
 * If this is the first call, returns the set of changes since client
 * initialization. Further invocations will return document that have changed
 * since the prior call.
 */
// PORTING NOTE: Multi-Tab only.
function wu(t, e) {
    const n = L(t), s = n.Xi.get(e) || rt.min();
    // Get the current maximum read time for the collection. This should always
    // exist, but to reduce the chance for regressions we default to
    // SnapshotVersion.Min()
    // TODO(indexing): Consider removing the default value.
        return n.persistence.runTransaction("Get new document changes", "readonly", (t => n.Zi.getAllFromCollectionGroup(t, e, yt(s, -1), 
    /* limit= */ Number.MAX_SAFE_INTEGER))).then((t => (_u(n, e, t), t)));
}

/** Sets the collection group's maximum read time from the given documents. */
// PORTING NOTE: Multi-Tab only.
function _u(t, e, n) {
    let s = t.Xi.get(e) || rt.min();
    n.forEach(((t, e) => {
        e.readTime.compareTo(s) > 0 && (s = e.readTime);
    })), t.Xi.set(e, s);
}

/**
 * Creates a new target using the given bundle name, which will be used to
 * hold the keys of all documents from the bundle in query-document mappings.
 * This ensures that the loaded documents do not get garbage collected
 * right away.
 */
/**
 * Applies the documents from a bundle to the "ground-state" (remote)
 * documents.
 *
 * LocalDocuments are re-calculated if there are remaining mutations in the
 * queue.
 */
async function mu(t, e, n, s) {
    const i = L(t);
    let r = gs(), o = cs();
    for (const t of n) {
        const n = e.rr(t.metadata.name);
        t.document && (r = r.add(n));
        const s = e.ur(t);
        s.setReadTime(e.cr(t.metadata.readTime)), o = o.insert(n, s);
    }
    const u = i.Zi.newChangeBuffer({
        trackRemovals: !0
    }), c = await hu(i, function(t) {
        // It is OK that the path used for the query is not valid, because this will
        // not be read and queried.
        return Jn(Gn(ut.fromString(`__bundle__/docs/${t}`)));
    }(s));
    // Allocates a target to hold all document keys from the bundle, such that
    // they will not get garbage collected right away.
        return i.persistence.runTransaction("Apply bundle documents", "readwrite", (t => cu(t, u, o).next((e => (u.apply(t), 
    e))).next((e => i.Bs.removeMatchingKeysForTargetId(t, c.targetId).next((() => i.Bs.addMatchingKeys(t, r, c.targetId))).next((() => i.localDocuments.getLocalViewOfDocuments(t, e.nr, e.sr))).next((() => e.nr))))));
}

/**
 * Returns a promise of a boolean to indicate if the given bundle has already
 * been loaded and the create time is newer than the current loading bundle.
 */
/**
 * Saves the given `NamedQuery` to local persistence.
 */
async function gu(t, e, n = gs()) {
    // Allocate a target for the named query such that it can be resumed
    // from associated read time if users use it to listen.
    // NOTE: this also means if no corresponding target exists, the new target
    // will remain active and will not get collected, unless users happen to
    // unlisten the query somehow.
    const s = await hu(t, Jn(yr(e.bundledQuery))), i = L(t);
    return i.persistence.runTransaction("Save named query", "readwrite", (t => {
        const r = Ni(e.readTime);
        // Simply save the query itself if it is older than what the SDK already
        // has.
                if (s.snapshotVersion.compareTo(r) >= 0) return i.qs.saveNamedQuery(t, e);
        // Update existing target data because the query from the bundle is newer.
                const o = s.withResumeToken(Ve.EMPTY_BYTE_STRING, r);
        return i.Ji = i.Ji.insert(o.targetId, o), i.Bs.updateTargetData(t, o).next((() => i.Bs.removeMatchingKeysForTargetId(t, s.targetId))).next((() => i.Bs.addMatchingKeys(t, n, s.targetId))).next((() => i.qs.saveNamedQuery(t, e)));
    }));
}

/** Assembles the key for a client state in WebStorage */
function yu(t, e) {
    return `firestore_clients_${t}_${e}`;
}

// The format of the WebStorage key that stores the mutation state is:
//     firestore_mutations_<persistence_prefix>_<batch_id>
//     (for unauthenticated users)
// or: firestore_mutations_<persistence_prefix>_<batch_id>_<user_uid>

// 'user_uid' is last to avoid needing to escape '_' characters that it might
// contain.
/** Assembles the key for a mutation batch in WebStorage */
function pu(t, e, n) {
    let s = `firestore_mutations_${t}_${n}`;
    return e.isAuthenticated() && (s += `_${e.uid}`), s;
}

// The format of the WebStorage key that stores a query target's metadata is:
//     firestore_targets_<persistence_prefix>_<target_id>
/** Assembles the key for a query state in WebStorage */
function Iu(t, e) {
    return `firestore_targets_${t}_${e}`;
}

// The WebStorage prefix that stores the primary tab's online state. The
// format of the key is:
//     firestore_online_state_<persistence_prefix>
/**
 * Holds the state of a mutation batch, including its user ID, batch ID and
 * whether the batch is 'pending', 'acknowledged' or 'rejected'.
 */
// Visible for testing
class Tu {
    constructor(t, e, n, s) {
        this.user = t, this.batchId = e, this.state = n, this.error = s;
    }
    /**
     * Parses a MutationMetadata from its JSON representation in WebStorage.
     * Logs a warning and returns null if the format of the data is not valid.
     */    static ar(t, e, n) {
        const s = JSON.parse(n);
        let i, r = "object" == typeof s && -1 !== [ "pending", "acknowledged", "rejected" ].indexOf(s.state) && (void 0 === s.error || "object" == typeof s.error);
        return r && s.error && (r = "string" == typeof s.error.message && "string" == typeof s.error.code, 
        r && (i = new U(s.error.code, s.error.message))), r ? new Tu(t, e, s.state, i) : (k("SharedClientState", `Failed to parse mutation state for ID '${e}': ${n}`), 
        null);
    }
    hr() {
        const t = {
            state: this.state,
            updateTimeMs: Date.now()
        };
        return this.error && (t.error = {
            code: this.error.code,
            message: this.error.message
        }), JSON.stringify(t);
    }
}

/**
 * Holds the state of a query target, including its target ID and whether the
 * target is 'not-current', 'current' or 'rejected'.
 */
// Visible for testing
class Eu {
    constructor(t, e, n) {
        this.targetId = t, this.state = e, this.error = n;
    }
    /**
     * Parses a QueryTargetMetadata from its JSON representation in WebStorage.
     * Logs a warning and returns null if the format of the data is not valid.
     */    static ar(t, e) {
        const n = JSON.parse(e);
        let s, i = "object" == typeof n && -1 !== [ "not-current", "current", "rejected" ].indexOf(n.state) && (void 0 === n.error || "object" == typeof n.error);
        return i && n.error && (i = "string" == typeof n.error.message && "string" == typeof n.error.code, 
        i && (s = new U(n.error.code, n.error.message))), i ? new Eu(t, n.state, s) : (k("SharedClientState", `Failed to parse target state for ID '${t}': ${e}`), 
        null);
    }
    hr() {
        const t = {
            state: this.state,
            updateTimeMs: Date.now()
        };
        return this.error && (t.error = {
            code: this.error.code,
            message: this.error.message
        }), JSON.stringify(t);
    }
}

/**
 * This class represents the immutable ClientState for a client read from
 * WebStorage, containing the list of active query targets.
 */ class Au {
    constructor(t, e) {
        this.clientId = t, this.activeTargetIds = e;
    }
    /**
     * Parses a RemoteClientState from the JSON representation in WebStorage.
     * Logs a warning and returns null if the format of the data is not valid.
     */    static ar(t, e) {
        const n = JSON.parse(e);
        let s = "object" == typeof n && n.activeTargetIds instanceof Array, i = ps();
        for (let t = 0; s && t < n.activeTargetIds.length; ++t) s = Lt(n.activeTargetIds[t]), 
        i = i.add(n.activeTargetIds[t]);
        return s ? new Au(t, i) : (k("SharedClientState", `Failed to parse client data for instance '${t}': ${e}`), 
        null);
    }
}

/**
 * This class represents the online state for all clients participating in
 * multi-tab. The online state is only written to by the primary client, and
 * used in secondary clients to update their query views.
 */ class vu {
    constructor(t, e) {
        this.clientId = t, this.onlineState = e;
    }
    /**
     * Parses a SharedOnlineState from its JSON representation in WebStorage.
     * Logs a warning and returns null if the format of the data is not valid.
     */    static ar(t) {
        const e = JSON.parse(t);
        return "object" == typeof e && -1 !== [ "Unknown", "Online", "Offline" ].indexOf(e.onlineState) && "string" == typeof e.clientId ? new vu(e.clientId, e.onlineState) : (k("SharedClientState", `Failed to parse online state: ${t}`), 
        null);
    }
}

/**
 * Metadata state of the local client. Unlike `RemoteClientState`, this class is
 * mutable and keeps track of all pending mutations, which allows us to
 * update the range of pending mutation batch IDs as new mutations are added or
 * removed.
 *
 * The data in `LocalClientState` is not read from WebStorage and instead
 * updated via its instance methods. The updated state can be serialized via
 * `toWebStorageJSON()`.
 */
// Visible for testing.
class Ru {
    constructor() {
        this.activeTargetIds = ps();
    }
    lr(t) {
        this.activeTargetIds = this.activeTargetIds.add(t);
    }
    dr(t) {
        this.activeTargetIds = this.activeTargetIds.delete(t);
    }
    /**
     * Converts this entry into a JSON-encoded format we can use for WebStorage.
     * Does not encode `clientId` as it is part of the key in WebStorage.
     */    hr() {
        const t = {
            activeTargetIds: this.activeTargetIds.toArray(),
            updateTimeMs: Date.now()
        };
        return JSON.stringify(t);
    }
}

/**
 * `WebStorageSharedClientState` uses WebStorage (window.localStorage) as the
 * backing store for the SharedClientState. It keeps track of all active
 * clients and supports modifications of the local client's data.
 */ class Pu {
    constructor(t, e, n, s, i) {
        this.window = t, this.ii = e, this.persistenceKey = n, this.wr = s, this.syncEngine = null, 
        this.onlineStateHandler = null, this.sequenceNumberHandler = null, this._r = this.mr.bind(this), 
        this.gr = new pe(et), this.started = !1, 
        /**
         * Captures WebStorage events that occur before `start()` is called. These
         * events are replayed once `WebStorageSharedClientState` is started.
         */
        this.yr = [];
        // Escape the special characters mentioned here:
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
        const r = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        this.storage = this.window.localStorage, this.currentUser = i, this.pr = yu(this.persistenceKey, this.wr), 
        this.Ir = 
        /** Assembles the key for the current sequence number. */
        function(t) {
            return `firestore_sequence_number_${t}`;
        }
        /**
 * @license
 * Copyright 2018 Google LLC
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
 */ (this.persistenceKey), this.gr = this.gr.insert(this.wr, new Ru), this.Tr = new RegExp(`^firestore_clients_${r}_([^_]*)$`), 
        this.Er = new RegExp(`^firestore_mutations_${r}_(\\d+)(?:_(.*))?$`), this.Ar = new RegExp(`^firestore_targets_${r}_(\\d+)$`), 
        this.vr = 
        /** Assembles the key for the online state of the primary tab. */
        function(t) {
            return `firestore_online_state_${t}`;
        }
        // The WebStorage prefix that plays as a event to indicate the remote documents
        // might have changed due to some secondary tabs loading a bundle.
        // format of the key is:
        //     firestore_bundle_loaded_v2_<persistenceKey>
        // The version ending with "v2" stores the list of modified collection groups.
        (this.persistenceKey), this.Rr = function(t) {
            return `firestore_bundle_loaded_v2_${t}`;
        }
        // The WebStorage key prefix for the key that stores the last sequence number allocated. The key
        // looks like 'firestore_sequence_number_<persistence_prefix>'.
        (this.persistenceKey), 
        // Rather than adding the storage observer during start(), we add the
        // storage observer during initialization. This ensures that we collect
        // events before other components populate their initial state (during their
        // respective start() calls). Otherwise, we might for example miss a
        // mutation that is added after LocalStore's start() processed the existing
        // mutations but before we observe WebStorage events.
        this.window.addEventListener("storage", this._r);
    }
    /** Returns 'true' if WebStorage is available in the current environment. */    static D(t) {
        return !(!t || !t.localStorage);
    }
    async start() {
        // Retrieve the list of existing clients to backfill the data in
        // SharedClientState.
        const t = await this.syncEngine.$i();
        for (const e of t) {
            if (e === this.wr) continue;
            const t = this.getItem(yu(this.persistenceKey, e));
            if (t) {
                const n = Au.ar(e, t);
                n && (this.gr = this.gr.insert(n.clientId, n));
            }
        }
        this.Pr();
        // Check if there is an existing online state and call the callback handler
        // if applicable.
        const e = this.storage.getItem(this.vr);
        if (e) {
            const t = this.br(e);
            t && this.Vr(t);
        }
        for (const t of this.yr) this.mr(t);
        this.yr = [], 
        // Register a window unload hook to remove the client metadata entry from
        // WebStorage even if `shutdown()` was not called.
        this.window.addEventListener("pagehide", (() => this.shutdown())), this.started = !0;
    }
    writeSequenceNumber(t) {
        this.setItem(this.Ir, JSON.stringify(t));
    }
    getAllActiveQueryTargets() {
        return this.Sr(this.gr);
    }
    isActiveQueryTarget(t) {
        let e = !1;
        return this.gr.forEach(((n, s) => {
            s.activeTargetIds.has(t) && (e = !0);
        })), e;
    }
    addPendingMutation(t) {
        this.Dr(t, "pending");
    }
    updateMutationState(t, e, n) {
        this.Dr(t, e, n), 
        // Once a final mutation result is observed by other clients, they no longer
        // access the mutation's metadata entry. Since WebStorage replays events
        // in order, it is safe to delete the entry right after updating it.
        this.Cr(t);
    }
    addLocalQueryTarget(t) {
        let e = "not-current";
        // Lookup an existing query state if the target ID was already registered
        // by another tab
                if (this.isActiveQueryTarget(t)) {
            const n = this.storage.getItem(Iu(this.persistenceKey, t));
            if (n) {
                const s = Eu.ar(t, n);
                s && (e = s.state);
            }
        }
        return this.Nr.lr(t), this.Pr(), e;
    }
    removeLocalQueryTarget(t) {
        this.Nr.dr(t), this.Pr();
    }
    isLocalQueryTarget(t) {
        return this.Nr.activeTargetIds.has(t);
    }
    clearQueryState(t) {
        this.removeItem(Iu(this.persistenceKey, t));
    }
    updateQueryState(t, e, n) {
        this.kr(t, e, n);
    }
    handleUserChange(t, e, n) {
        e.forEach((t => {
            this.Cr(t);
        })), this.currentUser = t, n.forEach((t => {
            this.addPendingMutation(t);
        }));
    }
    setOnlineState(t) {
        this.Mr(t);
    }
    notifyBundleLoaded(t) {
        this.$r(t);
    }
    shutdown() {
        this.started && (this.window.removeEventListener("storage", this._r), this.removeItem(this.pr), 
        this.started = !1);
    }
    getItem(t) {
        const e = this.storage.getItem(t);
        return N("SharedClientState", "READ", t, e), e;
    }
    setItem(t, e) {
        N("SharedClientState", "SET", t, e), this.storage.setItem(t, e);
    }
    removeItem(t) {
        N("SharedClientState", "REMOVE", t), this.storage.removeItem(t);
    }
    mr(t) {
        // Note: The function is typed to take Event to be interface-compatible with
        // `Window.addEventListener`.
        const e = t;
        if (e.storageArea === this.storage) {
            if (N("SharedClientState", "EVENT", e.key, e.newValue), e.key === this.pr) return void k("Received WebStorage notification for local change. Another client might have garbage-collected our state");
            this.ii.enqueueRetryable((async () => {
                if (this.started) {
                    if (null !== e.key) if (this.Tr.test(e.key)) {
                        if (null == e.newValue) {
                            const t = this.Or(e.key);
                            return this.Fr(t, null);
                        }
                        {
                            const t = this.Br(e.key, e.newValue);
                            if (t) return this.Fr(t.clientId, t);
                        }
                    } else if (this.Er.test(e.key)) {
                        if (null !== e.newValue) {
                            const t = this.Lr(e.key, e.newValue);
                            if (t) return this.qr(t);
                        }
                    } else if (this.Ar.test(e.key)) {
                        if (null !== e.newValue) {
                            const t = this.Ur(e.key, e.newValue);
                            if (t) return this.Kr(t);
                        }
                    } else if (e.key === this.vr) {
                        if (null !== e.newValue) {
                            const t = this.br(e.newValue);
                            if (t) return this.Vr(t);
                        }
                    } else if (e.key === this.Ir) {
                        const t = function(t) {
                            let e = Ot.ct;
                            if (null != t) try {
                                const n = JSON.parse(t);
                                F("number" == typeof n), e = n;
                            } catch (t) {
                                k("SharedClientState", "Failed to read sequence number from WebStorage", t);
                            }
                            return e;
                        }
                        /**
 * `MemorySharedClientState` is a simple implementation of SharedClientState for
 * clients using memory persistence. The state in this class remains fully
 * isolated and no synchronization is performed.
 */ (e.newValue);
                        t !== Ot.ct && this.sequenceNumberHandler(t);
                    } else if (e.key === this.Rr) {
                        const t = this.Gr(e.newValue);
                        await Promise.all(t.map((t => this.syncEngine.Qr(t))));
                    }
                } else this.yr.push(e);
            }));
        }
    }
    get Nr() {
        return this.gr.get(this.wr);
    }
    Pr() {
        this.setItem(this.pr, this.Nr.hr());
    }
    Dr(t, e, n) {
        const s = new Tu(this.currentUser, t, e, n), i = pu(this.persistenceKey, this.currentUser, t);
        this.setItem(i, s.hr());
    }
    Cr(t) {
        const e = pu(this.persistenceKey, this.currentUser, t);
        this.removeItem(e);
    }
    Mr(t) {
        const e = {
            clientId: this.wr,
            onlineState: t
        };
        this.storage.setItem(this.vr, JSON.stringify(e));
    }
    kr(t, e, n) {
        const s = Iu(this.persistenceKey, t), i = new Eu(t, e, n);
        this.setItem(s, i.hr());
    }
    $r(t) {
        const e = JSON.stringify(Array.from(t));
        this.setItem(this.Rr, e);
    }
    /**
     * Parses a client state key in WebStorage. Returns null if the key does not
     * match the expected key format.
     */    Or(t) {
        const e = this.Tr.exec(t);
        return e ? e[1] : null;
    }
    /**
     * Parses a client state in WebStorage. Returns 'null' if the value could not
     * be parsed.
     */    Br(t, e) {
        const n = this.Or(t);
        return Au.ar(n, e);
    }
    /**
     * Parses a mutation batch state in WebStorage. Returns 'null' if the value
     * could not be parsed.
     */    Lr(t, e) {
        const n = this.Er.exec(t), s = Number(n[1]), i = void 0 !== n[2] ? n[2] : null;
        return Tu.ar(new V(i), s, e);
    }
    /**
     * Parses a query target state from WebStorage. Returns 'null' if the value
     * could not be parsed.
     */    Ur(t, e) {
        const n = this.Ar.exec(t), s = Number(n[1]);
        return Eu.ar(s, e);
    }
    /**
     * Parses an online state from WebStorage. Returns 'null' if the value
     * could not be parsed.
     */    br(t) {
        return vu.ar(t);
    }
    Gr(t) {
        return JSON.parse(t);
    }
    async qr(t) {
        if (t.user.uid === this.currentUser.uid) return this.syncEngine.jr(t.batchId, t.state, t.error);
        N("SharedClientState", `Ignoring mutation for non-active user ${t.user.uid}`);
    }
    Kr(t) {
        return this.syncEngine.zr(t.targetId, t.state, t.error);
    }
    Fr(t, e) {
        const n = e ? this.gr.insert(t, e) : this.gr.remove(t), s = this.Sr(this.gr), i = this.Sr(n), r = [], o = [];
        return i.forEach((t => {
            s.has(t) || r.push(t);
        })), s.forEach((t => {
            i.has(t) || o.push(t);
        })), this.syncEngine.Wr(r, o).then((() => {
            this.gr = n;
        }));
    }
    Vr(t) {
        // We check whether the client that wrote this online state is still active
        // by comparing its client ID to the list of clients kept active in
        // IndexedDb. If a client does not update their IndexedDb client state
        // within 5 seconds, it is considered inactive and we don't emit an online
        // state event.
        this.gr.get(t.clientId) && this.onlineStateHandler(t.onlineState);
    }
    Sr(t) {
        let e = ps();
        return t.forEach(((t, n) => {
            e = e.unionWith(n.activeTargetIds);
        })), e;
    }
}

class bu {
    constructor() {
        this.Hr = new Ru, this.Jr = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
    }
    addPendingMutation(t) {
        // No op.
    }
    updateMutationState(t, e, n) {
        // No op.
    }
    addLocalQueryTarget(t) {
        return this.Hr.lr(t), this.Jr[t] || "not-current";
    }
    updateQueryState(t, e, n) {
        this.Jr[t] = e;
    }
    removeLocalQueryTarget(t) {
        this.Hr.dr(t);
    }
    isLocalQueryTarget(t) {
        return this.Hr.activeTargetIds.has(t);
    }
    clearQueryState(t) {
        delete this.Jr[t];
    }
    getAllActiveQueryTargets() {
        return this.Hr.activeTargetIds;
    }
    isActiveQueryTarget(t) {
        return this.Hr.activeTargetIds.has(t);
    }
    start() {
        return this.Hr = new Ru, Promise.resolve();
    }
    handleUserChange(t, e, n) {
        // No op.
    }
    setOnlineState(t) {
        // No op.
    }
    shutdown() {}
    writeSequenceNumber(t) {}
    notifyBundleLoaded(t) {
        // No op.
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
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
 */ class Vu {
    Yr(t) {
        // No-op.
    }
    shutdown() {
        // No-op.
    }
}

/**
 * @license
 * Copyright 2019 Google LLC
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
// References to `window` are guarded by BrowserConnectivityMonitor.isAvailable()
/* eslint-disable no-restricted-globals */
/**
 * Browser implementation of ConnectivityMonitor.
 */
class Su {
    constructor() {
        this.Xr = () => this.Zr(), this.eo = () => this.no(), this.so = [], this.io();
    }
    Yr(t) {
        this.so.push(t);
    }
    shutdown() {
        window.removeEventListener("online", this.Xr), window.removeEventListener("offline", this.eo);
    }
    io() {
        window.addEventListener("online", this.Xr), window.addEventListener("offline", this.eo);
    }
    Zr() {
        N("ConnectivityMonitor", "Network connectivity changed: AVAILABLE");
        for (const t of this.so) t(0 /* NetworkStatus.AVAILABLE */);
    }
    no() {
        N("ConnectivityMonitor", "Network connectivity changed: UNAVAILABLE");
        for (const t of this.so) t(1 /* NetworkStatus.UNAVAILABLE */);
    }
    // TODO(chenbrian): Consider passing in window either into this component or
    // here for testing via FakeWindow.
    /** Checks that all used attributes of window are available. */
    static D() {
        return "undefined" != typeof window && void 0 !== window.addEventListener && void 0 !== window.removeEventListener;
    }
}

/**
 * @license
 * Copyright 2023 Google LLC
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
/**
 * The value returned from the most recent invocation of
 * `generateUniqueDebugId()`, or null if it has never been invoked.
 */ let Du = null;

/**
 * Generates and returns an initial value for `lastUniqueDebugId`.
 *
 * The returned value is randomly selected from a range of integers that are
 * represented as 8 hexadecimal digits. This means that (within reason) any
 * numbers generated by incrementing the returned number by 1 will also be
 * represented by 8 hexadecimal digits. This leads to all "IDs" having the same
 * length when converted to a hexadecimal string, making reading logs containing
 * these IDs easier to follow. And since the return value is randomly selected
 * it will help to differentiate between logs from different executions.
 */
/**
 * Generates and returns a unique ID as a hexadecimal string.
 *
 * The returned ID is intended to be used in debug logging messages to help
 * correlate log messages that may be spatially separated in the logs, but
 * logically related. For example, a network connection could include the same
 * "debug ID" string in all of its log messages to help trace a specific
 * connection over time.
 *
 * @return the 10-character generated ID (e.g. "0xa1b2c3d4").
 */
function Cu() {
    return null === Du ? Du = 268435456 + Math.round(2147483648 * Math.random()) : Du++, 
    "0x" + Du.toString(16);
}

/**
 * @license
 * Copyright 2020 Google LLC
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
 */ const xu = {
    BatchGetDocuments: "batchGet",
    Commit: "commit",
    RunQuery: "runQuery",
    RunAggregationQuery: "runAggregationQuery"
};

/**
 * Maps RPC names to the corresponding REST endpoint name.
 *
 * We use array notation to avoid mangling.
 */
/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Provides a simple helper class that implements the Stream interface to
 * bridge to other implementations that are streams but do not implement the
 * interface. The stream callbacks are invoked with the callOn... methods.
 */
class Nu {
    constructor(t) {
        this.ro = t.ro, this.oo = t.oo;
    }
    uo(t) {
        this.co = t;
    }
    ao(t) {
        this.ho = t;
    }
    onMessage(t) {
        this.lo = t;
    }
    close() {
        this.oo();
    }
    send(t) {
        this.ro(t);
    }
    fo() {
        this.co();
    }
    wo(t) {
        this.ho(t);
    }
    _o(t) {
        this.lo(t);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ const ku = "WebChannelConnection";

class Mu extends 
/**
 * Base class for all Rest-based connections to the backend (WebChannel and
 * HTTP).
 */
class {
    constructor(t) {
        this.databaseInfo = t, this.databaseId = t.databaseId;
        const e = t.ssl ? "https" : "http";
        this.mo = e + "://" + t.host, this.yo = "projects/" + this.databaseId.projectId + "/databases/" + this.databaseId.database + "/documents";
    }
    get po() {
        // Both `invokeRPC()` and `invokeStreamingRPC()` use their `path` arguments to determine
        // where to run the query, and expect the `request` to NOT specify the "path".
        return !1;
    }
    Io(t, e, n, s, i) {
        const r = Cu(), o = this.To(t, e);
        N("RestConnection", `Sending RPC '${t}' ${r}:`, o, n);
        const u = {};
        return this.Eo(u, s, i), this.Ao(t, o, u, n).then((e => (N("RestConnection", `Received RPC '${t}' ${r}: `, e), 
        e)), (e => {
            throw M("RestConnection", `RPC '${t}' ${r} failed with error: `, e, "url: ", o, "request:", n), 
            e;
        }));
    }
    vo(t, e, n, s, i, r) {
        // The REST API automatically aggregates all of the streamed results, so we
        // can just use the normal invoke() method.
        return this.Io(t, e, n, s, i);
    }
    /**
     * Modifies the headers for a request, adding any authorization token if
     * present and any additional headers for the request.
     */    Eo(t, e, n) {
        t["X-Goog-Api-Client"] = "gl-js/ fire/" + S, 
        // Content-Type: text/plain will avoid preflight requests which might
        // mess with CORS and redirects by proxies. If we add custom headers
        // we will need to change this code to potentially use the $httpOverwrite
        // parameter supported by ESF to avoid triggering preflight requests.
        t["Content-Type"] = "text/plain", this.databaseInfo.appId && (t["X-Firebase-GMPID"] = this.databaseInfo.appId), 
        e && e.headers.forEach(((e, n) => t[n] = e)), n && n.headers.forEach(((e, n) => t[n] = e));
    }
    To(t, e) {
        const n = xu[t];
        return `${this.mo}/v1/${e}:${n}`;
    }
} {
    constructor(t) {
        super(t), this.forceLongPolling = t.forceLongPolling, this.autoDetectLongPolling = t.autoDetectLongPolling, 
        this.useFetchStreams = t.useFetchStreams, this.longPollingOptions = t.longPollingOptions;
    }
    Ao(t, e, n, s) {
        const i = Cu();
        return new Promise(((r, o) => {
            const u = new webchannelWrapper.XhrIo;
            u.setWithCredentials(!0), u.listenOnce(webchannelWrapper.EventType.COMPLETE, (() => {
                try {
                    switch (u.getLastErrorCode()) {
                      case webchannelWrapper.ErrorCode.NO_ERROR:
                        const e = u.getResponseJson();
                        N(ku, `XHR for RPC '${t}' ${i} received:`, JSON.stringify(e)), r(e);
                        break;

                      case webchannelWrapper.ErrorCode.TIMEOUT:
                        N(ku, `RPC '${t}' ${i} timed out`), o(new U(q.DEADLINE_EXCEEDED, "Request time out"));
                        break;

                      case webchannelWrapper.ErrorCode.HTTP_ERROR:
                        const n = u.getStatus();
                        if (N(ku, `RPC '${t}' ${i} failed with status:`, n, "response text:", u.getResponseText()), 
                        n > 0) {
                            let t = u.getResponseJson();
                            Array.isArray(t) && (t = t[0]);
                            const e = null == t ? void 0 : t.error;
                            if (e && e.status && e.message) {
                                const t = function(t) {
                                    const e = t.toLowerCase().replace(/_/g, "-");
                                    return Object.values(q).indexOf(e) >= 0 ? e : q.UNKNOWN;
                                }(e.status);
                                o(new U(t, e.message));
                            } else o(new U(q.UNKNOWN, "Server responded with status " + u.getStatus()));
                        } else 
                        // If we received an HTTP_ERROR but there's no status code,
                        // it's most probably a connection issue
                        o(new U(q.UNAVAILABLE, "Connection failed."));
                        break;

                      default:
                        O();
                    }
                } finally {
                    N(ku, `RPC '${t}' ${i} completed.`);
                }
            }));
            const c = JSON.stringify(s);
            N(ku, `RPC '${t}' ${i} sending request:`, s), u.send(e, "POST", c, n, 15);
        }));
    }
    Ro(t, e, n) {
        const s = Cu(), i = [ this.mo, "/", "google.firestore.v1.Firestore", "/", t, "/channel" ], r = webchannelWrapper.createWebChannelTransport(), o = webchannelWrapper.getStatEventTarget(), u = {
            // Required for backend stickiness, routing behavior is based on this
            // parameter.
            httpSessionIdParam: "gsessionid",
            initMessageHeaders: {},
            messageUrlParams: {
                // This param is used to improve routing and project isolation by the
                // backend and must be included in every request.
                database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`
            },
            sendRawJson: !0,
            supportsCrossDomainXhr: !0,
            internalChannelParams: {
                // Override the default timeout (randomized between 10-20 seconds) since
                // a large write batch on a slow internet connection may take a long
                // time to send to the backend. Rather than have WebChannel impose a
                // tight timeout which could lead to infinite timeouts and retries, we
                // set it very large (5-10 minutes) and rely on the browser's builtin
                // timeouts to kick in if the request isn't working.
                forwardChannelRequestTimeoutMs: 6e5
            },
            forceLongPolling: this.forceLongPolling,
            detectBufferingProxy: this.autoDetectLongPolling
        }, c = this.longPollingOptions.timeoutSeconds;
        void 0 !== c && (u.longPollingTimeout = Math.round(1e3 * c)), this.useFetchStreams && (u.xmlHttpFactory = new webchannelWrapper.FetchXmlHttpFactory({})), 
        this.Eo(u.initMessageHeaders, e, n), 
        // Sending the custom headers we just added to request.initMessageHeaders
        // (Authorization, etc.) will trigger the browser to make a CORS preflight
        // request because the XHR will no longer meet the criteria for a "simple"
        // CORS request:
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
        // Therefore to avoid the CORS preflight request (an extra network
        // roundtrip), we use the encodeInitMessageHeaders option to specify that
        // the headers should instead be encoded in the request's POST payload,
        // which is recognized by the webchannel backend.
        u.encodeInitMessageHeaders = !0;
        const a = i.join("");
        N(ku, `Creating RPC '${t}' stream ${s}: ${a}`, u);
        const h = r.createWebChannel(a, u);
        // WebChannel supports sending the first message with the handshake - saving
        // a network round trip. However, it will have to call send in the same
        // JS event loop as open. In order to enforce this, we delay actually
        // opening the WebChannel until send is called. Whether we have called
        // open is tracked with this variable.
                let l = !1, f = !1;
        // A flag to determine whether the stream was closed (by us or through an
        // error/close event) to avoid delivering multiple close events or sending
        // on a closed stream
                const d = new Nu({
            ro: e => {
                f ? N(ku, `Not sending because RPC '${t}' stream ${s} is closed:`, e) : (l || (N(ku, `Opening RPC '${t}' stream ${s} transport.`), 
                h.open(), l = !0), N(ku, `RPC '${t}' stream ${s} sending:`, e), h.send(e));
            },
            oo: () => h.close()
        }), w = (t, e, n) => {
            // TODO(dimond): closure typing seems broken because WebChannel does
            // not implement goog.events.Listenable
            t.listen(e, (t => {
                try {
                    n(t);
                } catch (t) {
                    setTimeout((() => {
                        throw t;
                    }), 0);
                }
            }));
        };
        // Closure events are guarded and exceptions are swallowed, so catch any
        // exception and rethrow using a setTimeout so they become visible again.
        // Note that eventually this function could go away if we are confident
        // enough the code is exception free.
                return w(h, webchannelWrapper.WebChannel.EventType.OPEN, (() => {
            f || N(ku, `RPC '${t}' stream ${s} transport opened.`);
        })), w(h, webchannelWrapper.WebChannel.EventType.CLOSE, (() => {
            f || (f = !0, N(ku, `RPC '${t}' stream ${s} transport closed`), d.wo());
        })), w(h, webchannelWrapper.WebChannel.EventType.ERROR, (e => {
            f || (f = !0, M(ku, `RPC '${t}' stream ${s} transport errored:`, e), d.wo(new U(q.UNAVAILABLE, "The operation could not be completed")));
        })), w(h, webchannelWrapper.WebChannel.EventType.MESSAGE, (e => {
            var n;
            if (!f) {
                const i = e.data[0];
                F(!!i);
                // TODO(b/35143891): There is a bug in One Platform that caused errors
                // (and only errors) to be wrapped in an extra array. To be forward
                // compatible with the bug we need to check either condition. The latter
                // can be removed once the fix has been rolled out.
                // Use any because msgData.error is not typed.
                const r = i, o = r.error || (null === (n = r[0]) || void 0 === n ? void 0 : n.error);
                if (o) {
                    N(ku, `RPC '${t}' stream ${s} received error:`, o);
                    // error.status will be a string like 'OK' or 'NOT_FOUND'.
                    const e = o.status;
                    let n = 
                    /**
 * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
 *
 * @returns The Code equivalent to the given status string or undefined if
 *     there is no match.
 */
                    function(t) {
                        // lookup by string
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const e = ii[t];
                        if (void 0 !== e) return ui(e);
                    }(e), i = o.message;
                    void 0 === n && (n = q.INTERNAL, i = "Unknown error status: " + e + " with message " + o.message), 
                    // Mark closed so no further events are propagated
                    f = !0, d.wo(new U(n, i)), h.close();
                } else N(ku, `RPC '${t}' stream ${s} received:`, i), d._o(i);
            }
        })), w(o, webchannelWrapper.Event.STAT_EVENT, (e => {
            e.stat === webchannelWrapper.Stat.PROXY ? N(ku, `RPC '${t}' stream ${s} detected buffering proxy`) : e.stat === webchannelWrapper.Stat.NOPROXY && N(ku, `RPC '${t}' stream ${s} detected no buffering proxy`);
        })), setTimeout((() => {
            // Technically we could/should wait for the WebChannel opened event,
            // but because we want to send the first message with the WebChannel
            // handshake we pretend the channel opened here (asynchronously), and
            // then delay the actual open until the first message is sent.
            d.fo();
        }), 0), d;
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/** Initializes the WebChannelConnection for the browser. */
/**
 * @license
 * Copyright 2020 Google LLC
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
/** The Platform's 'window' implementation or null if not available. */
function $u() {
    // `window` is not always available, e.g. in ReactNative and WebWorkers.
    // eslint-disable-next-line no-restricted-globals
    return "undefined" != typeof window ? window : null;
}

/** The Platform's 'document' implementation or null if not available. */ function Ou() {
    // `document` is not always available, e.g. in ReactNative and WebWorkers.
    // eslint-disable-next-line no-restricted-globals
    return "undefined" != typeof document ? document : null;
}

/**
 * @license
 * Copyright 2020 Google LLC
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
 */ function Fu(t) {
    return new Vi(t, /* useProto3Json= */ !0);
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * A helper for running delayed tasks following an exponential backoff curve
 * between attempts.
 *
 * Each delay is made up of a "base" delay which follows the exponential
 * backoff curve, and a +/- 50% "jitter" that is calculated and added to the
 * base delay. This prevents clients from accidentally synchronizing their
 * delays causing spikes of load to the backend.
 */
class Bu {
    constructor(
    /**
     * The AsyncQueue to run backoff operations on.
     */
    t, 
    /**
     * The ID to use when scheduling backoff operations on the AsyncQueue.
     */
    e, 
    /**
     * The initial delay (used as the base delay on the first retry attempt).
     * Note that jitter will still be applied, so the actual delay could be as
     * little as 0.5*initialDelayMs.
     */
    n = 1e3
    /**
     * The multiplier to use to determine the extended base delay after each
     * attempt.
     */ , s = 1.5
    /**
     * The maximum base delay after which no further backoff is performed.
     * Note that jitter will still be applied, so the actual delay could be as
     * much as 1.5*maxDelayMs.
     */ , i = 6e4) {
        this.ii = t, this.timerId = e, this.Po = n, this.bo = s, this.Vo = i, this.So = 0, 
        this.Do = null, 
        /** The last backoff attempt, as epoch milliseconds. */
        this.Co = Date.now(), this.reset();
    }
    /**
     * Resets the backoff delay.
     *
     * The very next backoffAndWait() will have no delay. If it is called again
     * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
     * subsequent ones will increase according to the backoffFactor.
     */    reset() {
        this.So = 0;
    }
    /**
     * Resets the backoff delay to the maximum delay (e.g. for use after a
     * RESOURCE_EXHAUSTED error).
     */    xo() {
        this.So = this.Vo;
    }
    /**
     * Returns a promise that resolves after currentDelayMs, and increases the
     * delay for any subsequent attempts. If there was a pending backoff operation
     * already, it will be canceled.
     */    No(t) {
        // Cancel any pending backoff operation.
        this.cancel();
        // First schedule using the current base (which may be 0 and should be
        // honored as such).
        const e = Math.floor(this.So + this.ko()), n = Math.max(0, Date.now() - this.Co), s = Math.max(0, e - n);
        // Guard against lastAttemptTime being in the future due to a clock change.
                s > 0 && N("ExponentialBackoff", `Backing off for ${s} ms (base delay: ${this.So} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`), 
        this.Do = this.ii.enqueueAfterDelay(this.timerId, s, (() => (this.Co = Date.now(), 
        t()))), 
        // Apply backoff factor to determine next delay and ensure it is within
        // bounds.
        this.So *= this.bo, this.So < this.Po && (this.So = this.Po), this.So > this.Vo && (this.So = this.Vo);
    }
    Mo() {
        null !== this.Do && (this.Do.skipDelay(), this.Do = null);
    }
    cancel() {
        null !== this.Do && (this.Do.cancel(), this.Do = null);
    }
    /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */    ko() {
        return (Math.random() - .5) * this.So;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * A PersistentStream is an abstract base class that represents a streaming RPC
 * to the Firestore backend. It's built on top of the connections own support
 * for streaming RPCs, and adds several critical features for our clients:
 *
 *   - Exponential backoff on failure
 *   - Authentication via CredentialsProvider
 *   - Dispatching all callbacks into the shared worker queue
 *   - Closing idle streams after 60 seconds of inactivity
 *
 * Subclasses of PersistentStream implement serialization of models to and
 * from the JSON representation of the protocol buffers for a specific
 * streaming RPC.
 *
 * ## Starting and Stopping
 *
 * Streaming RPCs are stateful and need to be start()ed before messages can
 * be sent and received. The PersistentStream will call the onOpen() function
 * of the listener once the stream is ready to accept requests.
 *
 * Should a start() fail, PersistentStream will call the registered onClose()
 * listener with a FirestoreError indicating what went wrong.
 *
 * A PersistentStream can be started and stopped repeatedly.
 *
 * Generic types:
 *  SendType: The type of the outgoing message of the underlying
 *    connection stream
 *  ReceiveType: The type of the incoming message of the underlying
 *    connection stream
 *  ListenerType: The type of the listener that will be used for callbacks
 */
class Lu {
    constructor(t, e, n, s, i, r, o, u) {
        this.ii = t, this.$o = n, this.Oo = s, this.connection = i, this.authCredentialsProvider = r, 
        this.appCheckCredentialsProvider = o, this.listener = u, this.state = 0 /* PersistentStreamState.Initial */ , 
        /**
         * A close count that's incremented every time the stream is closed; used by
         * getCloseGuardedDispatcher() to invalidate callbacks that happen after
         * close.
         */
        this.Fo = 0, this.Bo = null, this.Lo = null, this.stream = null, this.qo = new Bu(t, e);
    }
    /**
     * Returns true if start() has been called and no error has occurred. True
     * indicates the stream is open or in the process of opening (which
     * encompasses respecting backoff, getting auth tokens, and starting the
     * actual RPC). Use isOpen() to determine if the stream is open and ready for
     * outbound requests.
     */    Uo() {
        return 1 /* PersistentStreamState.Starting */ === this.state || 5 /* PersistentStreamState.Backoff */ === this.state || this.Ko();
    }
    /**
     * Returns true if the underlying RPC is open (the onOpen() listener has been
     * called) and the stream is ready for outbound requests.
     */    Ko() {
        return 2 /* PersistentStreamState.Open */ === this.state || 3 /* PersistentStreamState.Healthy */ === this.state;
    }
    /**
     * Starts the RPC. Only allowed if isStarted() returns false. The stream is
     * not immediately ready for use: onOpen() will be invoked when the RPC is
     * ready for outbound requests, at which point isOpen() will return true.
     *
     * When start returns, isStarted() will return true.
     */    start() {
        4 /* PersistentStreamState.Error */ !== this.state ? this.auth() : this.Go();
    }
    /**
     * Stops the RPC. This call is idempotent and allowed regardless of the
     * current isStarted() state.
     *
     * When stop returns, isStarted() and isOpen() will both return false.
     */    async stop() {
        this.Uo() && await this.close(0 /* PersistentStreamState.Initial */);
    }
    /**
     * After an error the stream will usually back off on the next attempt to
     * start it. If the error warrants an immediate restart of the stream, the
     * sender can use this to indicate that the receiver should not back off.
     *
     * Each error will call the onClose() listener. That function can decide to
     * inhibit backoff if required.
     */    Qo() {
        this.state = 0 /* PersistentStreamState.Initial */ , this.qo.reset();
    }
    /**
     * Marks this stream as idle. If no further actions are performed on the
     * stream for one minute, the stream will automatically close itself and
     * notify the stream's onClose() handler with Status.OK. The stream will then
     * be in a !isStarted() state, requiring the caller to start the stream again
     * before further use.
     *
     * Only streams that are in state 'Open' can be marked idle, as all other
     * states imply pending network operations.
     */    jo() {
        // Starts the idle time if we are in state 'Open' and are not yet already
        // running a timer (in which case the previous idle timeout still applies).
        this.Ko() && null === this.Bo && (this.Bo = this.ii.enqueueAfterDelay(this.$o, 6e4, (() => this.zo())));
    }
    /** Sends a message to the underlying stream. */    Wo(t) {
        this.Ho(), this.stream.send(t);
    }
    /** Called by the idle timer when the stream should close due to inactivity. */    async zo() {
        if (this.Ko()) 
        // When timing out an idle stream there's no reason to force the stream into backoff when
        // it restarts so set the stream state to Initial instead of Error.
        return this.close(0 /* PersistentStreamState.Initial */);
    }
    /** Marks the stream as active again. */    Ho() {
        this.Bo && (this.Bo.cancel(), this.Bo = null);
    }
    /** Cancels the health check delayed operation. */    Jo() {
        this.Lo && (this.Lo.cancel(), this.Lo = null);
    }
    /**
     * Closes the stream and cleans up as necessary:
     *
     * * closes the underlying GRPC stream;
     * * calls the onClose handler with the given 'error';
     * * sets internal stream state to 'finalState';
     * * adjusts the backoff timer based on the error
     *
     * A new stream can be opened by calling start().
     *
     * @param finalState - the intended state of the stream after closing.
     * @param error - the error the connection was closed with.
     */    async close(t, e) {
        // Cancel any outstanding timers (they're guaranteed not to execute).
        this.Ho(), this.Jo(), this.qo.cancel(), 
        // Invalidates any stream-related callbacks (e.g. from auth or the
        // underlying stream), guaranteeing they won't execute.
        this.Fo++, 4 /* PersistentStreamState.Error */ !== t ? 
        // If this is an intentional close ensure we don't delay our next connection attempt.
        this.qo.reset() : e && e.code === q.RESOURCE_EXHAUSTED ? (
        // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
        k(e.toString()), k("Using maximum backoff delay to prevent overloading the backend."), 
        this.qo.xo()) : e && e.code === q.UNAUTHENTICATED && 3 /* PersistentStreamState.Healthy */ !== this.state && (
        // "unauthenticated" error means the token was rejected. This should rarely
        // happen since both Auth and AppCheck ensure a sufficient TTL when we
        // request a token. If a user manually resets their system clock this can
        // fail, however. In this case, we should get a Code.UNAUTHENTICATED error
        // before we received the first message and we need to invalidate the token
        // to ensure that we fetch a new token.
        this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()), 
        // Clean up the underlying stream because we are no longer interested in events.
        null !== this.stream && (this.Yo(), this.stream.close(), this.stream = null), 
        // This state must be assigned before calling onClose() to allow the callback to
        // inhibit backoff or otherwise manipulate the state in its non-started state.
        this.state = t, 
        // Notify the listener that the stream closed.
        await this.listener.ao(e);
    }
    /**
     * Can be overridden to perform additional cleanup before the stream is closed.
     * Calling super.tearDown() is not required.
     */    Yo() {}
    auth() {
        this.state = 1 /* PersistentStreamState.Starting */;
        const t = this.Xo(this.Fo), e = this.Fo;
        // TODO(mikelehen): Just use dispatchIfNotClosed, but see TODO below.
                Promise.all([ this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken() ]).then((([t, n]) => {
            // Stream can be stopped while waiting for authentication.
            // TODO(mikelehen): We really should just use dispatchIfNotClosed
            // and let this dispatch onto the queue, but that opened a spec test can
            // of worms that I don't want to deal with in this PR.
            this.Fo === e && 
            // Normally we'd have to schedule the callback on the AsyncQueue.
            // However, the following calls are safe to be called outside the
            // AsyncQueue since they don't chain asynchronous calls
            this.Zo(t, n);
        }), (e => {
            t((() => {
                const t = new U(q.UNKNOWN, "Fetching auth token failed: " + e.message);
                return this.tu(t);
            }));
        }));
    }
    Zo(t, e) {
        const n = this.Xo(this.Fo);
        this.stream = this.eu(t, e), this.stream.uo((() => {
            n((() => (this.state = 2 /* PersistentStreamState.Open */ , this.Lo = this.ii.enqueueAfterDelay(this.Oo, 1e4, (() => (this.Ko() && (this.state = 3 /* PersistentStreamState.Healthy */), 
            Promise.resolve()))), this.listener.uo())));
        })), this.stream.ao((t => {
            n((() => this.tu(t)));
        })), this.stream.onMessage((t => {
            n((() => this.onMessage(t)));
        }));
    }
    Go() {
        this.state = 5 /* PersistentStreamState.Backoff */ , this.qo.No((async () => {
            this.state = 0 /* PersistentStreamState.Initial */ , this.start();
        }));
    }
    // Visible for tests
    tu(t) {
        // In theory the stream could close cleanly, however, in our current model
        // we never expect this to happen because if we stop a stream ourselves,
        // this callback will never be called. To prevent cases where we retry
        // without a backoff accidentally, we set the stream to error in all cases.
        return N("PersistentStream", `close with error: ${t}`), this.stream = null, this.close(4 /* PersistentStreamState.Error */ , t);
    }
    /**
     * Returns a "dispatcher" function that dispatches operations onto the
     * AsyncQueue but only runs them if closeCount remains unchanged. This allows
     * us to turn auth / stream callbacks into no-ops if the stream is closed /
     * re-opened, etc.
     */    Xo(t) {
        return e => {
            this.ii.enqueueAndForget((() => this.Fo === t ? e() : (N("PersistentStream", "stream callback skipped by getCloseGuardedDispatcher."), 
            Promise.resolve())));
        };
    }
}

/**
 * A PersistentStream that implements the Listen RPC.
 *
 * Once the Listen stream has called the onOpen() listener, any number of
 * listen() and unlisten() calls can be made to control what changes will be
 * sent from the server for ListenResponses.
 */ class qu extends Lu {
    constructor(t, e, n, s, i, r) {
        super(t, "listen_stream_connection_backoff" /* TimerId.ListenStreamConnectionBackoff */ , "listen_stream_idle" /* TimerId.ListenStreamIdle */ , "health_check_timeout" /* TimerId.HealthCheckTimeout */ , e, n, s, r), 
        this.serializer = i;
    }
    eu(t, e) {
        return this.connection.Ro("Listen", t, e);
    }
    onMessage(t) {
        // A successful response means the stream is healthy
        this.qo.reset();
        const e = Qi(this.serializer, t), n = function(t) {
            // We have only reached a consistent snapshot for the entire stream if there
            // is a read_time set and it applies to all targets (i.e. the list of
            // targets is empty). The backend is guaranteed to send such responses.
            if (!("targetChange" in t)) return rt.min();
            const e = t.targetChange;
            return e.targetIds && e.targetIds.length ? rt.min() : e.readTime ? Ni(e.readTime) : rt.min();
        }(t);
        return this.listener.nu(e, n);
    }
    /**
     * Registers interest in the results of the given target. If the target
     * includes a resumeToken it will be included in the request. Results that
     * affect the target will be streamed back as WatchChange messages that
     * reference the targetId.
     */    su(t) {
        const e = {};
        e.database = Li(this.serializer), e.addTarget = function(t, e) {
            let n;
            const s = e.target;
            if (n = Fn(s) ? {
                documents: Hi(t, s)
            } : {
                query: Ji(t, s)
            }, n.targetId = e.targetId, e.resumeToken.approximateByteSize() > 0) {
                n.resumeToken = Ci(t, e.resumeToken);
                const s = Si(t, e.expectedCount);
                null !== s && (n.expectedCount = s);
            } else if (e.snapshotVersion.compareTo(rt.min()) > 0) {
                // TODO(wuandy): Consider removing above check because it is most likely true.
                // Right now, many tests depend on this behaviour though (leaving min() out
                // of serialization).
                n.readTime = Di(t, e.snapshotVersion.toTimestamp());
                const s = Si(t, e.expectedCount);
                null !== s && (n.expectedCount = s);
            }
            return n;
        }(this.serializer, t);
        const n = Xi(this.serializer, t);
        n && (e.labels = n), this.Wo(e);
    }
    /**
     * Unregisters interest in the results of the target associated with the
     * given targetId.
     */    iu(t) {
        const e = {};
        e.database = Li(this.serializer), e.removeTarget = t, this.Wo(e);
    }
}

/**
 * A Stream that implements the Write RPC.
 *
 * The Write RPC requires the caller to maintain special streamToken
 * state in between calls, to help the server understand which responses the
 * client has processed by the time the next request is made. Every response
 * will contain a streamToken; this value must be passed to the next
 * request.
 *
 * After calling start() on this stream, the next request must be a handshake,
 * containing whatever streamToken is on hand. Once a response to this
 * request is received, all pending mutations may be submitted. When
 * submitting multiple batches of mutations at the same time, it's
 * okay to use the same streamToken for the calls to writeMutations.
 *
 * TODO(b/33271235): Use proto types
 */ class Uu extends Lu {
    constructor(t, e, n, s, i, r) {
        super(t, "write_stream_connection_backoff" /* TimerId.WriteStreamConnectionBackoff */ , "write_stream_idle" /* TimerId.WriteStreamIdle */ , "health_check_timeout" /* TimerId.HealthCheckTimeout */ , e, n, s, r), 
        this.serializer = i, this.ru = !1;
    }
    /**
     * Tracks whether or not a handshake has been successfully exchanged and
     * the stream is ready to accept mutations.
     */    get ou() {
        return this.ru;
    }
    // Override of PersistentStream.start
    start() {
        this.ru = !1, this.lastStreamToken = void 0, super.start();
    }
    Yo() {
        this.ru && this.uu([]);
    }
    eu(t, e) {
        return this.connection.Ro("Write", t, e);
    }
    onMessage(t) {
        if (
        // Always capture the last stream token.
        F(!!t.streamToken), this.lastStreamToken = t.streamToken, this.ru) {
            // A successful first write response means the stream is healthy,
            // Note, that we could consider a successful handshake healthy, however,
            // the write itself might be causing an error we want to back off from.
            this.qo.reset();
            const e = Wi(t.writeResults, t.commitTime), n = Ni(t.commitTime);
            return this.listener.cu(n, e);
        }
        // The first response is always the handshake response
        return F(!t.writeResults || 0 === t.writeResults.length), this.ru = !0, this.listener.au();
    }
    /**
     * Sends an initial streamToken to the server, performing the handshake
     * required to make the StreamingWrite RPC work. Subsequent
     * calls should wait until onHandshakeComplete was called.
     */    hu() {
        // TODO(dimond): Support stream resumption. We intentionally do not set the
        // stream token on the handshake, ignoring any stream token we might have.
        const t = {};
        t.database = Li(this.serializer), this.Wo(t);
    }
    /** Sends a group of mutations to the Firestore backend to apply. */    uu(t) {
        const e = {
            streamToken: this.lastStreamToken,
            writes: t.map((t => ji(this.serializer, t)))
        };
        this.Wo(e);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Datastore and its related methods are a wrapper around the external Google
 * Cloud Datastore grpc API, which provides an interface that is more convenient
 * for the rest of the client SDK architecture to consume.
 */
/**
 * An implementation of Datastore that exposes additional state for internal
 * consumption.
 */
class Ku extends class {} {
    constructor(t, e, n, s) {
        super(), this.authCredentials = t, this.appCheckCredentials = e, this.connection = n, 
        this.serializer = s, this.lu = !1;
    }
    fu() {
        if (this.lu) throw new U(q.FAILED_PRECONDITION, "The client has already been terminated.");
    }
    /** Invokes the provided RPC with auth and AppCheck tokens. */    Io(t, e, n) {
        return this.fu(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((([s, i]) => this.connection.Io(t, e, n, s, i))).catch((t => {
            throw "FirebaseError" === t.name ? (t.code === q.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), 
            this.appCheckCredentials.invalidateToken()), t) : new U(q.UNKNOWN, t.toString());
        }));
    }
    /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */    vo(t, e, n, s) {
        return this.fu(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((([i, r]) => this.connection.vo(t, e, n, i, r, s))).catch((t => {
            throw "FirebaseError" === t.name ? (t.code === q.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), 
            this.appCheckCredentials.invalidateToken()), t) : new U(q.UNKNOWN, t.toString());
        }));
    }
    terminate() {
        this.lu = !0;
    }
}

// TODO(firestorexp): Make sure there is only one Datastore instance per
// firestore-exp client.
async function Gu(t, e, n) {
    var s;
    const i = L(t), {request: r, du: o} = function(t, e, n) {
        const s = Ji(t, e), i = {}, r = [];
        let o = 0;
        return n.forEach((t => {
            // Map all client-side aliases to a unique short-form
            // alias. This avoids issues with client-side aliases that
            // exceed the 1500-byte string size limit.
            const e = "aggregate_" + o++;
            i[e] = t.alias, "count" === t.yt ? r.push({
                alias: e,
                count: {}
            }) : "avg" === t.yt ? r.push({
                alias: e,
                avg: {
                    field: sr(t.fieldPath)
                }
            }) : "sum" === t.yt && r.push({
                alias: e,
                sum: {
                    field: sr(t.fieldPath)
                }
            });
        })), {
            request: {
                structuredAggregationQuery: {
                    aggregations: r,
                    structuredQuery: s.structuredQuery
                },
                parent: s.parent
            },
            du: i
        };
    }(i.serializer, Jn(e), n), u = r.parent;
    i.connection.po || delete r.parent;
    const c = (await i.vo("RunAggregationQuery", u, r, /*expectedResponseCount=*/ 1)).filter((t => !!t.result));
    // Omit RunAggregationQueryResponse that only contain readTimes.
        F(1 === c.length);
    // Remap the short-form aliases that were sent to the server
    // to the client-side aliases. Users will access the results
    // using the client-side alias.
    const a = null === (s = c[0].result) || void 0 === s ? void 0 : s.aggregateFields;
    return Object.keys(a).reduce(((t, e) => (t[o[e]] = a[e], t)), {});
}

/**
 * A component used by the RemoteStore to track the OnlineState (that is,
 * whether or not the client as a whole should be considered to be online or
 * offline), implementing the appropriate heuristics.
 *
 * In particular, when the client is trying to connect to the backend, we
 * allow up to MAX_WATCH_STREAM_FAILURES within ONLINE_STATE_TIMEOUT_MS for
 * a connection to succeed. If we have too many failures or the timeout elapses,
 * then we set the OnlineState to Offline, and the client will behave as if
 * it is offline (get()s will return cached data, etc.).
 */
class Qu {
    constructor(t, e) {
        this.asyncQueue = t, this.onlineStateHandler = e, 
        /** The current OnlineState. */
        this.state = "Unknown" /* OnlineState.Unknown */ , 
        /**
         * A count of consecutive failures to open the stream. If it reaches the
         * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
         * Offline.
         */
        this.wu = 0, 
        /**
         * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
         * transition from OnlineState.Unknown to OnlineState.Offline without waiting
         * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
         */
        this._u = null, 
        /**
         * Whether the client should log a warning message if it fails to connect to
         * the backend (initially true, cleared after a successful stream, or if we've
         * logged the message already).
         */
        this.mu = !0;
    }
    /**
     * Called by RemoteStore when a watch stream is started (including on each
     * backoff attempt).
     *
     * If this is the first attempt, it sets the OnlineState to Unknown and starts
     * the onlineStateTimer.
     */    gu() {
        0 === this.wu && (this.yu("Unknown" /* OnlineState.Unknown */), this._u = this.asyncQueue.enqueueAfterDelay("online_state_timeout" /* TimerId.OnlineStateTimeout */ , 1e4, (() => (this._u = null, 
        this.pu("Backend didn't respond within 10 seconds."), this.yu("Offline" /* OnlineState.Offline */), 
        Promise.resolve()))));
    }
    /**
     * Updates our OnlineState as appropriate after the watch stream reports a
     * failure. The first failure moves us to the 'Unknown' state. We then may
     * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
     * actually transition to the 'Offline' state.
     */    Iu(t) {
        "Online" /* OnlineState.Online */ === this.state ? this.yu("Unknown" /* OnlineState.Unknown */) : (this.wu++, 
        this.wu >= 1 && (this.Tu(), this.pu(`Connection failed 1 times. Most recent error: ${t.toString()}`), 
        this.yu("Offline" /* OnlineState.Offline */)));
    }
    /**
     * Explicitly sets the OnlineState to the specified state.
     *
     * Note that this resets our timers / failure counters, etc. used by our
     * Offline heuristics, so must not be used in place of
     * handleWatchStreamStart() and handleWatchStreamFailure().
     */    set(t) {
        this.Tu(), this.wu = 0, "Online" /* OnlineState.Online */ === t && (
        // We've connected to watch at least once. Don't warn the developer
        // about being offline going forward.
        this.mu = !1), this.yu(t);
    }
    yu(t) {
        t !== this.state && (this.state = t, this.onlineStateHandler(t));
    }
    pu(t) {
        const e = `Could not reach Cloud Firestore backend. ${t}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
        this.mu ? (k(e), this.mu = !1) : N("OnlineStateTracker", e);
    }
    Tu() {
        null !== this._u && (this._u.cancel(), this._u = null);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ class ju {
    constructor(
    /**
     * The local store, used to fill the write pipeline with outbound mutations.
     */
    t, 
    /** The client-side proxy for interacting with the backend. */
    e, n, s, i) {
        this.localStore = t, this.datastore = e, this.asyncQueue = n, this.remoteSyncer = {}, 
        /**
         * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
         * LocalStore via fillWritePipeline() and have or will send to the write
         * stream.
         *
         * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
         * restart the write stream. When the stream is established the writes in the
         * pipeline will be sent in order.
         *
         * Writes remain in writePipeline until they are acknowledged by the backend
         * and thus will automatically be re-sent if the stream is interrupted /
         * restarted before they're acknowledged.
         *
         * Write responses from the backend are linked to their originating request
         * purely based on order, and so we can just shift() writes from the front of
         * the writePipeline as we receive responses.
         */
        this.Eu = [], 
        /**
         * A mapping of watched targets that the client cares about tracking and the
         * user has explicitly called a 'listen' for this target.
         *
         * These targets may or may not have been sent to or acknowledged by the
         * server. On re-establishing the listen stream, these targets should be sent
         * to the server. The targets removed with unlistens are removed eagerly
         * without waiting for confirmation from the listen stream.
         */
        this.Au = new Map, 
        /**
         * A set of reasons for why the RemoteStore may be offline. If empty, the
         * RemoteStore may start its network connections.
         */
        this.vu = new Set, 
        /**
         * Event handlers that get called when the network is disabled or enabled.
         *
         * PORTING NOTE: These functions are used on the Web client to create the
         * underlying streams (to support tree-shakeable streams). On Android and iOS,
         * the streams are created during construction of RemoteStore.
         */
        this.Ru = [], this.Pu = i, this.Pu.Yr((t => {
            n.enqueueAndForget((async () => {
                // Porting Note: Unlike iOS, `restartNetwork()` is called even when the
                // network becomes unreachable as we don't have any other way to tear
                // down our streams.
                ec(this) && (N("RemoteStore", "Restarting streams for network reachability change."), 
                await async function(t) {
                    const e = L(t);
                    e.vu.add(4 /* OfflineCause.ConnectivityChange */), await Wu(e), e.bu.set("Unknown" /* OnlineState.Unknown */), 
                    e.vu.delete(4 /* OfflineCause.ConnectivityChange */), await zu(e);
                }(this));
            }));
        })), this.bu = new Qu(n, s);
    }
}

async function zu(t) {
    if (ec(t)) for (const e of t.Ru) await e(/* enabled= */ !0);
}

/**
 * Temporarily disables the network. The network can be re-enabled using
 * enableNetwork().
 */ async function Wu(t) {
    for (const e of t.Ru) await e(/* enabled= */ !1);
}

/**
 * Starts new listen for the given target. Uses resume token if provided. It
 * is a no-op if the target of given `TargetData` is already being listened to.
 */
function Hu(t, e) {
    const n = L(t);
    n.Au.has(e.targetId) || (
    // Mark this as something the client is currently listening for.
    n.Au.set(e.targetId, e), tc(n) ? 
    // The listen will be sent in onWatchStreamOpen
    Zu(n) : pc(n).Ko() && Yu(n, e));
}

/**
 * Removes the listen from server. It is a no-op if the given target id is
 * not being listened to.
 */ function Ju(t, e) {
    const n = L(t), s = pc(n);
    n.Au.delete(e), s.Ko() && Xu(n, e), 0 === n.Au.size && (s.Ko() ? s.jo() : ec(n) && 
    // Revert to OnlineState.Unknown if the watch stream is not open and we
    // have no listeners, since without any listens to send we cannot
    // confirm if the stream is healthy and upgrade to OnlineState.Online.
    n.bu.set("Unknown" /* OnlineState.Unknown */));
}

/**
 * We need to increment the the expected number of pending responses we're due
 * from watch so we wait for the ack to process any messages from this target.
 */ function Yu(t, e) {
    if (t.Vu.qt(e.targetId), e.resumeToken.approximateByteSize() > 0 || e.snapshotVersion.compareTo(rt.min()) > 0) {
        const n = t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;
        e = e.withExpectedCount(n);
    }
    pc(t).su(e);
}

/**
 * We need to increment the expected number of pending responses we're due
 * from watch so we wait for the removal on the server before we process any
 * messages from this target.
 */ function Xu(t, e) {
    t.Vu.qt(e), pc(t).iu(e);
}

function Zu(t) {
    t.Vu = new Ei({
        getRemoteKeysForTarget: e => t.remoteSyncer.getRemoteKeysForTarget(e),
        le: e => t.Au.get(e) || null,
        ue: () => t.datastore.serializer.databaseId
    }), pc(t).start(), t.bu.gu();
}

/**
 * Returns whether the watch stream should be started because it's necessary
 * and has not yet been started.
 */ function tc(t) {
    return ec(t) && !pc(t).Uo() && t.Au.size > 0;
}

function ec(t) {
    return 0 === L(t).vu.size;
}

function nc(t) {
    t.Vu = void 0;
}

async function sc(t) {
    t.Au.forEach(((e, n) => {
        Yu(t, e);
    }));
}

async function ic(t, e) {
    nc(t), 
    // If we still need the watch stream, retry the connection.
    tc(t) ? (t.bu.Iu(e), Zu(t)) : 
    // No need to restart watch stream because there are no active targets.
    // The online state is set to unknown because there is no active attempt
    // at establishing a connection
    t.bu.set("Unknown" /* OnlineState.Unknown */);
}

async function rc(t, e, n) {
    if (
    // Mark the client as online since we got a message from the server
    t.bu.set("Online" /* OnlineState.Online */), e instanceof Ii && 2 /* WatchTargetChangeState.Removed */ === e.state && e.cause) 
    // There was an error on a target, don't wait for a consistent snapshot
    // to raise events
    try {
        await 
        /** Handles an error on a target */
        async function(t, e) {
            const n = e.cause;
            for (const s of e.targetIds) 
            // A watched target might have been removed already.
            t.Au.has(s) && (await t.remoteSyncer.rejectListen(s, n), t.Au.delete(s), t.Vu.removeTarget(s));
        }
        /**
 * Attempts to fill our write pipeline with writes from the LocalStore.
 *
 * Called internally to bootstrap or refill the write pipeline and by
 * SyncEngine whenever there are new mutations to process.
 *
 * Starts the write stream if necessary.
 */ (t, e);
    } catch (n) {
        N("RemoteStore", "Failed to remove targets %s: %s ", e.targetIds.join(","), n), 
        await oc(t, n);
    } else if (e instanceof yi ? t.Vu.Ht(e) : e instanceof pi ? t.Vu.ne(e) : t.Vu.Xt(e), 
    !n.isEqual(rt.min())) try {
        const e = await ou(t.localStore);
        n.compareTo(e) >= 0 && 
        // We have received a target change with a global snapshot if the snapshot
        // version is not equal to SnapshotVersion.min().
        await 
        /**
 * Takes a batch of changes from the Datastore, repackages them as a
 * RemoteEvent, and passes that on to the listener, which is typically the
 * SyncEngine.
 */
        function(t, e) {
            const n = t.Vu.ce(e);
            // Update in-memory resume tokens. LocalStore will update the
            // persistent view of these when applying the completed RemoteEvent.
                        return n.targetChanges.forEach(((n, s) => {
                if (n.resumeToken.approximateByteSize() > 0) {
                    const i = t.Au.get(s);
                    // A watched target might have been removed already.
                                        i && t.Au.set(s, i.withResumeToken(n.resumeToken, e));
                }
            })), 
            // Re-establish listens for the targets that have been invalidated by
            // existence filter mismatches.
            n.targetMismatches.forEach(((e, n) => {
                const s = t.Au.get(e);
                if (!s) 
                // A watched target might have been removed already.
                return;
                // Clear the resume token for the target, since we're in a known mismatch
                // state.
                                t.Au.set(e, s.withResumeToken(Ve.EMPTY_BYTE_STRING, s.snapshotVersion)), 
                // Cause a hard reset by unwatching and rewatching immediately, but
                // deliberately don't send a resume token so that we get a full update.
                Xu(t, e);
                // Mark the target we send as being on behalf of an existence filter
                // mismatch, but don't actually retain that in listenTargets. This ensures
                // that we flag the first re-listen this way without impacting future
                // listens of this target (that might happen e.g. on reconnect).
                const i = new cr(s.target, e, n, s.sequenceNumber);
                Yu(t, i);
            })), t.remoteSyncer.applyRemoteEvent(n);
        }(t, n);
    } catch (e) {
        N("RemoteStore", "Failed to raise snapshot:", e), await oc(t, e);
    }
}

/**
 * Recovery logic for IndexedDB errors that takes the network offline until
 * `op` succeeds. Retries are scheduled with backoff using
 * `enqueueRetryable()`. If `op()` is not provided, IndexedDB access is
 * validated via a generic operation.
 *
 * The returned Promise is resolved once the network is disabled and before
 * any retry attempt.
 */ async function oc(t, e, n) {
    if (!Dt(e)) throw e;
    t.vu.add(1 /* OfflineCause.IndexedDbFailed */), 
    // Disable network and raise offline snapshots
    await Wu(t), t.bu.set("Offline" /* OnlineState.Offline */), n || (
    // Use a simple read operation to determine if IndexedDB recovered.
    // Ideally, we would expose a health check directly on SimpleDb, but
    // RemoteStore only has access to persistence through LocalStore.
    n = () => ou(t.localStore)), 
    // Probe IndexedDB periodically and re-enable network
    t.asyncQueue.enqueueRetryable((async () => {
        N("RemoteStore", "Retrying IndexedDB access"), await n(), t.vu.delete(1 /* OfflineCause.IndexedDbFailed */), 
        await zu(t);
    }));
}

/**
 * Executes `op`. If `op` fails, takes the network offline until `op`
 * succeeds. Returns after the first attempt.
 */ function uc(t, e) {
    return e().catch((n => oc(t, n, e)));
}

async function cc(t) {
    const e = L(t), n = Ic(e);
    let s = e.Eu.length > 0 ? e.Eu[e.Eu.length - 1].batchId : -1;
    for (;ac(e); ) try {
        const t = await au(e.localStore, s);
        if (null === t) {
            0 === e.Eu.length && n.jo();
            break;
        }
        s = t.batchId, hc(e, t);
    } catch (t) {
        await oc(e, t);
    }
    lc(e) && fc(e);
}

/**
 * Returns true if we can add to the write pipeline (i.e. the network is
 * enabled and the write pipeline is not full).
 */ function ac(t) {
    return ec(t) && t.Eu.length < 10;
}

/**
 * Queues additional writes to be sent to the write stream, sending them
 * immediately if the write stream is established.
 */ function hc(t, e) {
    t.Eu.push(e);
    const n = Ic(t);
    n.Ko() && n.ou && n.uu(e.mutations);
}

function lc(t) {
    return ec(t) && !Ic(t).Uo() && t.Eu.length > 0;
}

function fc(t) {
    Ic(t).start();
}

async function dc(t) {
    Ic(t).hu();
}

async function wc(t) {
    const e = Ic(t);
    // Send the write pipeline now that the stream is established.
        for (const n of t.Eu) e.uu(n.mutations);
}

async function _c(t, e, n) {
    const s = t.Eu.shift(), i = ti.from(s, e, n);
    await uc(t, (() => t.remoteSyncer.applySuccessfulWrite(i))), 
    // It's possible that with the completion of this mutation another
    // slot has freed up.
    await cc(t);
}

async function mc(t, e) {
    // If the write stream closed after the write handshake completes, a write
    // operation failed and we fail the pending operation.
    e && Ic(t).ou && 
    // This error affects the actual write.
    await async function(t, e) {
        // Only handle permanent errors here. If it's transient, just let the retry
        // logic kick in.
        if (n = e.code, oi(n) && n !== q.ABORTED) {
            // This was a permanent error, the request itself was the problem
            // so it's not going to succeed if we resend it.
            const n = t.Eu.shift();
            // In this case it's also unlikely that the server itself is melting
            // down -- this was just a bad request so inhibit backoff on the next
            // restart.
                        Ic(t).Qo(), await uc(t, (() => t.remoteSyncer.rejectFailedWrite(n.batchId, e))), 
            // It's possible that with the completion of this mutation
            // another slot has freed up.
            await cc(t);
        }
        var n;
    }(t, e), 
    // The write stream might have been started by refilling the write
    // pipeline for failed writes
    lc(t) && fc(t);
}

async function gc(t, e) {
    const n = L(t);
    n.asyncQueue.verifyOperationInProgress(), N("RemoteStore", "RemoteStore received new credentials");
    const s = ec(n);
    // Tear down and re-create our network streams. This will ensure we get a
    // fresh auth token for the new user and re-fill the write pipeline with
    // new mutations from the LocalStore (since mutations are per-user).
        n.vu.add(3 /* OfflineCause.CredentialChange */), await Wu(n), s && 
    // Don't set the network status to Unknown if we are offline.
    n.bu.set("Unknown" /* OnlineState.Unknown */), await n.remoteSyncer.handleCredentialChange(e), 
    n.vu.delete(3 /* OfflineCause.CredentialChange */), await zu(n);
}

/**
 * Toggles the network state when the client gains or loses its primary lease.
 */ async function yc(t, e) {
    const n = L(t);
    e ? (n.vu.delete(2 /* OfflineCause.IsSecondary */), await zu(n)) : e || (n.vu.add(2 /* OfflineCause.IsSecondary */), 
    await Wu(n), n.bu.set("Unknown" /* OnlineState.Unknown */));
}

/**
 * If not yet initialized, registers the WatchStream and its network state
 * callback with `remoteStoreImpl`. Returns the existing stream if one is
 * already available.
 *
 * PORTING NOTE: On iOS and Android, the WatchStream gets registered on startup.
 * This is not done on Web to allow it to be tree-shaken.
 */ function pc(t) {
    return t.Su || (
    // Create stream (but note that it is not started yet).
    t.Su = function(t, e, n) {
        const s = L(t);
        return s.fu(), new qu(e, s.connection, s.authCredentials, s.appCheckCredentials, s.serializer, n);
    }
    /**
 * @license
 * Copyright 2018 Google LLC
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
 */ (t.datastore, t.asyncQueue, {
        uo: sc.bind(null, t),
        ao: ic.bind(null, t),
        nu: rc.bind(null, t)
    }), t.Ru.push((async e => {
        e ? (t.Su.Qo(), tc(t) ? Zu(t) : t.bu.set("Unknown" /* OnlineState.Unknown */)) : (await t.Su.stop(), 
        nc(t));
    }))), t.Su;
}

/**
 * If not yet initialized, registers the WriteStream and its network state
 * callback with `remoteStoreImpl`. Returns the existing stream if one is
 * already available.
 *
 * PORTING NOTE: On iOS and Android, the WriteStream gets registered on startup.
 * This is not done on Web to allow it to be tree-shaken.
 */ function Ic(t) {
    return t.Du || (
    // Create stream (but note that it is not started yet).
    t.Du = function(t, e, n) {
        const s = L(t);
        return s.fu(), new Uu(e, s.connection, s.authCredentials, s.appCheckCredentials, s.serializer, n);
    }(t.datastore, t.asyncQueue, {
        uo: dc.bind(null, t),
        ao: mc.bind(null, t),
        au: wc.bind(null, t),
        cu: _c.bind(null, t)
    }), t.Ru.push((async e => {
        e ? (t.Du.Qo(), 
        // This will start the write stream if necessary.
        await cc(t)) : (await t.Du.stop(), t.Eu.length > 0 && (N("RemoteStore", `Stopping write stream with ${t.Eu.length} pending writes`), 
        t.Eu = []));
    }))), t.Du;
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Represents an operation scheduled to be run in the future on an AsyncQueue.
 *
 * It is created via DelayedOperation.createAndSchedule().
 *
 * Supports cancellation (via cancel()) and early execution (via skipDelay()).
 *
 * Note: We implement `PromiseLike` instead of `Promise`, as the `Promise` type
 * in newer versions of TypeScript defines `finally`, which is not available in
 * IE.
 */
class Tc {
    constructor(t, e, n, s, i) {
        this.asyncQueue = t, this.timerId = e, this.targetTimeMs = n, this.op = s, this.removalCallback = i, 
        this.deferred = new K, this.then = this.deferred.promise.then.bind(this.deferred.promise), 
        // It's normal for the deferred promise to be canceled (due to cancellation)
        // and so we attach a dummy catch callback to avoid
        // 'UnhandledPromiseRejectionWarning' log spam.
        this.deferred.promise.catch((t => {}));
    }
    /**
     * Creates and returns a DelayedOperation that has been scheduled to be
     * executed on the provided asyncQueue after the provided delayMs.
     *
     * @param asyncQueue - The queue to schedule the operation on.
     * @param id - A Timer ID identifying the type of operation this is.
     * @param delayMs - The delay (ms) before the operation should be scheduled.
     * @param op - The operation to run.
     * @param removalCallback - A callback to be called synchronously once the
     *   operation is executed or canceled, notifying the AsyncQueue to remove it
     *   from its delayedOperations list.
     *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
     *   the DelayedOperation class public.
     */    static createAndSchedule(t, e, n, s, i) {
        const r = Date.now() + n, o = new Tc(t, e, r, s, i);
        return o.start(n), o;
    }
    /**
     * Starts the timer. This is called immediately after construction by
     * createAndSchedule().
     */    start(t) {
        this.timerHandle = setTimeout((() => this.handleDelayElapsed()), t);
    }
    /**
     * Queues the operation to run immediately (if it hasn't already been run or
     * canceled).
     */    skipDelay() {
        return this.handleDelayElapsed();
    }
    /**
     * Cancels the operation if it hasn't already been executed or canceled. The
     * promise will be rejected.
     *
     * As long as the operation has not yet been run, calling cancel() provides a
     * guarantee that the operation will not be run.
     */    cancel(t) {
        null !== this.timerHandle && (this.clearTimeout(), this.deferred.reject(new U(q.CANCELLED, "Operation cancelled" + (t ? ": " + t : ""))));
    }
    handleDelayElapsed() {
        this.asyncQueue.enqueueAndForget((() => null !== this.timerHandle ? (this.clearTimeout(), 
        this.op().then((t => this.deferred.resolve(t)))) : Promise.resolve()));
    }
    clearTimeout() {
        null !== this.timerHandle && (this.removalCallback(this), clearTimeout(this.timerHandle), 
        this.timerHandle = null);
    }
}

/**
 * Returns a FirestoreError that can be surfaced to the user if the provided
 * error is an IndexedDbTransactionError. Re-throws the error otherwise.
 */ function Ec(t, e) {
    if (k("AsyncQueue", `${e}: ${t}`), Dt(t)) return new U(q.UNAVAILABLE, `${e}: ${t}`);
    throw t;
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * DocumentSet is an immutable (copy-on-write) collection that holds documents
 * in order specified by the provided comparator. We always add a document key
 * comparator on top of what is provided to guarantee document equality based on
 * the key.
 */ class Ac {
    /** The default ordering is by key if the comparator is omitted */
    constructor(t) {
        // We are adding document key comparator to the end as it's the only
        // guaranteed unique property of a document.
        this.comparator = t ? (e, n) => t(e, n) || ht.comparator(e.key, n.key) : (t, e) => ht.comparator(t.key, e.key), 
        this.keyedMap = hs(), this.sortedSet = new pe(this.comparator);
    }
    /**
     * Returns an empty copy of the existing DocumentSet, using the same
     * comparator.
     */    static emptySet(t) {
        return new Ac(t.comparator);
    }
    has(t) {
        return null != this.keyedMap.get(t);
    }
    get(t) {
        return this.keyedMap.get(t);
    }
    first() {
        return this.sortedSet.minKey();
    }
    last() {
        return this.sortedSet.maxKey();
    }
    isEmpty() {
        return this.sortedSet.isEmpty();
    }
    /**
     * Returns the index of the provided key in the document set, or -1 if the
     * document key is not present in the set;
     */    indexOf(t) {
        const e = this.keyedMap.get(t);
        return e ? this.sortedSet.indexOf(e) : -1;
    }
    get size() {
        return this.sortedSet.size;
    }
    /** Iterates documents in order defined by "comparator" */    forEach(t) {
        this.sortedSet.inorderTraversal(((e, n) => (t(e), !1)));
    }
    /** Inserts or updates a document with the same key */    add(t) {
        // First remove the element if we have it.
        const e = this.delete(t.key);
        return e.copy(e.keyedMap.insert(t.key, t), e.sortedSet.insert(t, null));
    }
    /** Deletes a document with a given key */    delete(t) {
        const e = this.get(t);
        return e ? this.copy(this.keyedMap.remove(t), this.sortedSet.remove(e)) : this;
    }
    isEqual(t) {
        if (!(t instanceof Ac)) return !1;
        if (this.size !== t.size) return !1;
        const e = this.sortedSet.getIterator(), n = t.sortedSet.getIterator();
        for (;e.hasNext(); ) {
            const t = e.getNext().key, s = n.getNext().key;
            if (!t.isEqual(s)) return !1;
        }
        return !0;
    }
    toString() {
        const t = [];
        return this.forEach((e => {
            t.push(e.toString());
        })), 0 === t.length ? "DocumentSet ()" : "DocumentSet (\n  " + t.join("  \n") + "\n)";
    }
    copy(t, e) {
        const n = new Ac;
        return n.comparator = this.comparator, n.keyedMap = t, n.sortedSet = e, n;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * DocumentChangeSet keeps track of a set of changes to docs in a query, merging
 * duplicate events for the same doc.
 */ class vc {
    constructor() {
        this.Cu = new pe(ht.comparator);
    }
    track(t) {
        const e = t.doc.key, n = this.Cu.get(e);
        n ? 
        // Merge the new change with the existing change.
        0 /* ChangeType.Added */ !== t.type && 3 /* ChangeType.Metadata */ === n.type ? this.Cu = this.Cu.insert(e, t) : 3 /* ChangeType.Metadata */ === t.type && 1 /* ChangeType.Removed */ !== n.type ? this.Cu = this.Cu.insert(e, {
            type: n.type,
            doc: t.doc
        }) : 2 /* ChangeType.Modified */ === t.type && 2 /* ChangeType.Modified */ === n.type ? this.Cu = this.Cu.insert(e, {
            type: 2 /* ChangeType.Modified */ ,
            doc: t.doc
        }) : 2 /* ChangeType.Modified */ === t.type && 0 /* ChangeType.Added */ === n.type ? this.Cu = this.Cu.insert(e, {
            type: 0 /* ChangeType.Added */ ,
            doc: t.doc
        }) : 1 /* ChangeType.Removed */ === t.type && 0 /* ChangeType.Added */ === n.type ? this.Cu = this.Cu.remove(e) : 1 /* ChangeType.Removed */ === t.type && 2 /* ChangeType.Modified */ === n.type ? this.Cu = this.Cu.insert(e, {
            type: 1 /* ChangeType.Removed */ ,
            doc: n.doc
        }) : 0 /* ChangeType.Added */ === t.type && 1 /* ChangeType.Removed */ === n.type ? this.Cu = this.Cu.insert(e, {
            type: 2 /* ChangeType.Modified */ ,
            doc: t.doc
        }) : 
        // This includes these cases, which don't make sense:
        // Added->Added
        // Removed->Removed
        // Modified->Added
        // Removed->Modified
        // Metadata->Added
        // Removed->Metadata
        O() : this.Cu = this.Cu.insert(e, t);
    }
    xu() {
        const t = [];
        return this.Cu.inorderTraversal(((e, n) => {
            t.push(n);
        })), t;
    }
}

class Rc {
    constructor(t, e, n, s, i, r, o, u, c) {
        this.query = t, this.docs = e, this.oldDocs = n, this.docChanges = s, this.mutatedKeys = i, 
        this.fromCache = r, this.syncStateChanged = o, this.excludesMetadataChanges = u, 
        this.hasCachedResults = c;
    }
    /** Returns a view snapshot as if all documents in the snapshot were added. */    static fromInitialDocuments(t, e, n, s, i) {
        const r = [];
        return e.forEach((t => {
            r.push({
                type: 0 /* ChangeType.Added */ ,
                doc: t
            });
        })), new Rc(t, e, Ac.emptySet(e), r, n, s, 
        /* syncStateChanged= */ !0, 
        /* excludesMetadataChanges= */ !1, i);
    }
    get hasPendingWrites() {
        return !this.mutatedKeys.isEmpty();
    }
    isEqual(t) {
        if (!(this.fromCache === t.fromCache && this.hasCachedResults === t.hasCachedResults && this.syncStateChanged === t.syncStateChanged && this.mutatedKeys.isEqual(t.mutatedKeys) && Zn(this.query, t.query) && this.docs.isEqual(t.docs) && this.oldDocs.isEqual(t.oldDocs))) return !1;
        const e = this.docChanges, n = t.docChanges;
        if (e.length !== n.length) return !1;
        for (let t = 0; t < e.length; t++) if (e[t].type !== n[t].type || !e[t].doc.isEqual(n[t].doc)) return !1;
        return !0;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Holds the listeners and the last received ViewSnapshot for a query being
 * tracked by EventManager.
 */ class Pc {
    constructor() {
        this.Nu = void 0, this.listeners = [];
    }
}

class bc {
    constructor() {
        this.queries = new os((t => ts(t)), Zn), this.onlineState = "Unknown" /* OnlineState.Unknown */ , 
        this.ku = new Set;
    }
}

async function Vc(t, e) {
    const n = L(t), s = e.query;
    let i = !1, r = n.queries.get(s);
    if (r || (i = !0, r = new Pc), i) try {
        r.Nu = await n.onListen(s);
    } catch (t) {
        const n = Ec(t, `Initialization of query '${es(e.query)}' failed`);
        return void e.onError(n);
    }
    if (n.queries.set(s, r), r.listeners.push(e), 
    // Run global snapshot listeners if a consistent snapshot has been emitted.
    e.Mu(n.onlineState), r.Nu) {
        e.$u(r.Nu) && xc(n);
    }
}

async function Sc(t, e) {
    const n = L(t), s = e.query;
    let i = !1;
    const r = n.queries.get(s);
    if (r) {
        const t = r.listeners.indexOf(e);
        t >= 0 && (r.listeners.splice(t, 1), i = 0 === r.listeners.length);
    }
    if (i) return n.queries.delete(s), n.onUnlisten(s);
}

function Dc(t, e) {
    const n = L(t);
    let s = !1;
    for (const t of e) {
        const e = t.query, i = n.queries.get(e);
        if (i) {
            for (const e of i.listeners) e.$u(t) && (s = !0);
            i.Nu = t;
        }
    }
    s && xc(n);
}

function Cc(t, e, n) {
    const s = L(t), i = s.queries.get(e);
    if (i) for (const t of i.listeners) t.onError(n);
    // Remove all listeners. NOTE: We don't need to call syncEngine.unlisten()
    // after an error.
        s.queries.delete(e);
}

// Call all global snapshot listeners that have been set.
function xc(t) {
    t.ku.forEach((t => {
        t.next();
    }));
}

/**
 * QueryListener takes a series of internal view snapshots and determines
 * when to raise the event.
 *
 * It uses an Observer to dispatch events.
 */ class Nc {
    constructor(t, e, n) {
        this.query = t, this.Ou = e, 
        /**
         * Initial snapshots (e.g. from cache) may not be propagated to the wrapped
         * observer. This flag is set to true once we've actually raised an event.
         */
        this.Fu = !1, this.Bu = null, this.onlineState = "Unknown" /* OnlineState.Unknown */ , 
        this.options = n || {};
    }
    /**
     * Applies the new ViewSnapshot to this listener, raising a user-facing event
     * if applicable (depending on what changed, whether the user has opted into
     * metadata-only changes, etc.). Returns true if a user-facing event was
     * indeed raised.
     */    $u(t) {
        if (!this.options.includeMetadataChanges) {
            // Remove the metadata only changes.
            const e = [];
            for (const n of t.docChanges) 3 /* ChangeType.Metadata */ !== n.type && e.push(n);
            t = new Rc(t.query, t.docs, t.oldDocs, e, t.mutatedKeys, t.fromCache, t.syncStateChanged, 
            /* excludesMetadataChanges= */ !0, t.hasCachedResults);
        }
        let e = !1;
        return this.Fu ? this.Lu(t) && (this.Ou.next(t), e = !0) : this.qu(t, this.onlineState) && (this.Uu(t), 
        e = !0), this.Bu = t, e;
    }
    onError(t) {
        this.Ou.error(t);
    }
    /** Returns whether a snapshot was raised. */    Mu(t) {
        this.onlineState = t;
        let e = !1;
        return this.Bu && !this.Fu && this.qu(this.Bu, t) && (this.Uu(this.Bu), e = !0), 
        e;
    }
    qu(t, e) {
        // Always raise the first event when we're synced
        if (!t.fromCache) return !0;
        // NOTE: We consider OnlineState.Unknown as online (it should become Offline
        // or Online if we wait long enough).
                const n = "Offline" /* OnlineState.Offline */ !== e;
        // Don't raise the event if we're online, aren't synced yet (checked
        // above) and are waiting for a sync.
                return (!this.options.Ku || !n) && (!t.docs.isEmpty() || t.hasCachedResults || "Offline" /* OnlineState.Offline */ === e);
        // Raise data from cache if we have any documents, have cached results before,
        // or we are offline.
        }
    Lu(t) {
        // We don't need to handle includeDocumentMetadataChanges here because
        // the Metadata only changes have already been stripped out if needed.
        // At this point the only changes we will see are the ones we should
        // propagate.
        if (t.docChanges.length > 0) return !0;
        const e = this.Bu && this.Bu.hasPendingWrites !== t.hasPendingWrites;
        return !(!t.syncStateChanged && !e) && !0 === this.options.includeMetadataChanges;
        // Generally we should have hit one of the cases above, but it's possible
        // to get here if there were only metadata docChanges and they got
        // stripped out.
        }
    Uu(t) {
        t = Rc.fromInitialDocuments(t.query, t.docs, t.mutatedKeys, t.fromCache, t.hasCachedResults), 
        this.Fu = !0, this.Ou.next(t);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * A complete element in the bundle stream, together with the byte length it
 * occupies in the stream.
 */ class kc {
    constructor(t, 
    // How many bytes this element takes to store in the bundle.
    e) {
        this.Gu = t, this.byteLength = e;
    }
    Qu() {
        return "metadata" in this.Gu;
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Helper to convert objects from bundles to model objects in the SDK.
 */ class Mc {
    constructor(t) {
        this.serializer = t;
    }
    rr(t) {
        return Oi(this.serializer, t);
    }
    /**
     * Converts a BundleDocument to a MutableDocument.
     */    ur(t) {
        return t.metadata.exists ? Ki(this.serializer, t.document, !1) : an.newNoDocument(this.rr(t.metadata.name), this.cr(t.metadata.readTime));
    }
    cr(t) {
        return Ni(t);
    }
}

/**
 * A class to process the elements from a bundle, load them into local
 * storage and provide progress update while loading.
 */ class $c {
    constructor(t, e, n) {
        this.ju = t, this.localStore = e, this.serializer = n, 
        /** Batched queries to be saved into storage */
        this.queries = [], 
        /** Batched documents to be saved into storage */
        this.documents = [], 
        /** The collection groups affected by this bundle. */
        this.collectionGroups = new Set, this.progress = Oc(t);
    }
    /**
     * Adds an element from the bundle to the loader.
     *
     * Returns a new progress if adding the element leads to a new progress,
     * otherwise returns null.
     */    zu(t) {
        this.progress.bytesLoaded += t.byteLength;
        let e = this.progress.documentsLoaded;
        if (t.Gu.namedQuery) this.queries.push(t.Gu.namedQuery); else if (t.Gu.documentMetadata) {
            this.documents.push({
                metadata: t.Gu.documentMetadata
            }), t.Gu.documentMetadata.exists || ++e;
            const n = ut.fromString(t.Gu.documentMetadata.name);
            this.collectionGroups.add(n.get(n.length - 2));
        } else t.Gu.document && (this.documents[this.documents.length - 1].document = t.Gu.document, 
        ++e);
        return e !== this.progress.documentsLoaded ? (this.progress.documentsLoaded = e, 
        Object.assign({}, this.progress)) : null;
    }
    Wu(t) {
        const e = new Map, n = new Mc(this.serializer);
        for (const s of t) if (s.metadata.queries) {
            const t = n.rr(s.metadata.name);
            for (const n of s.metadata.queries) {
                const s = (e.get(n) || gs()).add(t);
                e.set(n, s);
            }
        }
        return e;
    }
    /**
     * Update the progress to 'Success' and return the updated progress.
     */    async complete() {
        const t = await mu(this.localStore, new Mc(this.serializer), this.documents, this.ju.id), e = this.Wu(this.documents);
        for (const t of this.queries) await gu(this.localStore, t, e.get(t.name));
        return this.progress.taskState = "Success", {
            progress: this.progress,
            Hu: this.collectionGroups,
            Ju: t
        };
    }
}

/**
 * Returns a `LoadBundleTaskProgress` representing the initial progress of
 * loading a bundle.
 */ function Oc(t) {
    return {
        taskState: "Running",
        documentsLoaded: 0,
        bytesLoaded: 0,
        totalDocuments: t.totalDocuments,
        totalBytes: t.totalBytes
    };
}

/**
 * Returns a `LoadBundleTaskProgress` representing the progress that the loading
 * has succeeded.
 */
/**
 * @license
 * Copyright 2017 Google LLC
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
class Fc {
    constructor(t) {
        this.key = t;
    }
}

class Bc {
    constructor(t) {
        this.key = t;
    }
}

/**
 * View is responsible for computing the final merged truth of what docs are in
 * a query. It gets notified of local and remote changes to docs, and applies
 * the query filters and limits to determine the most correct possible results.
 */ class Lc {
    constructor(t, 
    /** Documents included in the remote target */
    e) {
        this.query = t, this.Yu = e, this.Xu = null, this.hasCachedResults = !1, 
        /**
         * A flag whether the view is current with the backend. A view is considered
         * current after it has seen the current flag from the backend and did not
         * lose consistency within the watch stream (e.g. because of an existence
         * filter mismatch).
         */
        this.current = !1, 
        /** Documents in the view but not in the remote target */
        this.Zu = gs(), 
        /** Document Keys that have local changes */
        this.mutatedKeys = gs(), this.tc = is(t), this.ec = new Ac(this.tc);
    }
    /**
     * The set of remote documents that the server has told us belongs to the target associated with
     * this view.
     */    get nc() {
        return this.Yu;
    }
    /**
     * Iterates over a set of doc changes, applies the query limit, and computes
     * what the new results should be, what the changes were, and whether we may
     * need to go back to the local cache for more results. Does not make any
     * changes to the view.
     * @param docChanges - The doc changes to apply to this view.
     * @param previousChanges - If this is being called with a refill, then start
     *        with this set of docs and changes instead of the current view.
     * @returns a new set of docs, changes, and refill flag.
     */    sc(t, e) {
        const n = e ? e.ic : new vc, s = e ? e.ec : this.ec;
        let i = e ? e.mutatedKeys : this.mutatedKeys, r = s, o = !1;
        // Track the last doc in a (full) limit. This is necessary, because some
        // update (a delete, or an update moving a doc past the old limit) might
        // mean there is some other document in the local cache that either should
        // come (1) between the old last limit doc and the new last document, in the
        // case of updates, or (2) after the new last document, in the case of
        // deletes. So we keep this doc at the old limit to compare the updates to.
        // Note that this should never get used in a refill (when previousChanges is
        // set), because there will only be adds -- no deletes or updates.
        const u = "F" /* LimitType.First */ === this.query.limitType && s.size === this.query.limit ? s.last() : null, c = "L" /* LimitType.Last */ === this.query.limitType && s.size === this.query.limit ? s.first() : null;
        // Drop documents out to meet limit/limitToLast requirement.
        if (t.inorderTraversal(((t, e) => {
            const a = s.get(t), h = ns(this.query, e) ? e : null, l = !!a && this.mutatedKeys.has(a.key), f = !!h && (h.hasLocalMutations || 
            // We only consider committed mutations for documents that were
            // mutated during the lifetime of the view.
            this.mutatedKeys.has(h.key) && h.hasCommittedMutations);
            let d = !1;
            // Calculate change
                        if (a && h) {
                a.data.isEqual(h.data) ? l !== f && (n.track({
                    type: 3 /* ChangeType.Metadata */ ,
                    doc: h
                }), d = !0) : this.rc(a, h) || (n.track({
                    type: 2 /* ChangeType.Modified */ ,
                    doc: h
                }), d = !0, (u && this.tc(h, u) > 0 || c && this.tc(h, c) < 0) && (
                // This doc moved from inside the limit to outside the limit.
                // That means there may be some other doc in the local cache
                // that should be included instead.
                o = !0));
            } else !a && h ? (n.track({
                type: 0 /* ChangeType.Added */ ,
                doc: h
            }), d = !0) : a && !h && (n.track({
                type: 1 /* ChangeType.Removed */ ,
                doc: a
            }), d = !0, (u || c) && (
            // A doc was removed from a full limit query. We'll need to
            // requery from the local cache to see if we know about some other
            // doc that should be in the results.
            o = !0));
            d && (h ? (r = r.add(h), i = f ? i.add(t) : i.delete(t)) : (r = r.delete(t), i = i.delete(t)));
        })), null !== this.query.limit) for (;r.size > this.query.limit; ) {
            const t = "F" /* LimitType.First */ === this.query.limitType ? r.last() : r.first();
            r = r.delete(t.key), i = i.delete(t.key), n.track({
                type: 1 /* ChangeType.Removed */ ,
                doc: t
            });
        }
        return {
            ec: r,
            ic: n,
            zi: o,
            mutatedKeys: i
        };
    }
    rc(t, e) {
        // We suppress the initial change event for documents that were modified as
        // part of a write acknowledgment (e.g. when the value of a server transform
        // is applied) as Watch will send us the same document again.
        // By suppressing the event, we only raise two user visible events (one with
        // `hasPendingWrites` and the final state of the document) instead of three
        // (one with `hasPendingWrites`, the modified document with
        // `hasPendingWrites` and the final state of the document).
        return t.hasLocalMutations && e.hasCommittedMutations && !e.hasLocalMutations;
    }
    /**
     * Updates the view with the given ViewDocumentChanges and optionally updates
     * limbo docs and sync state from the provided target change.
     * @param docChanges - The set of changes to make to the view's docs.
     * @param updateLimboDocuments - Whether to update limbo documents based on
     *        this change.
     * @param targetChange - A target change to apply for computing limbo docs and
     *        sync state.
     * @returns A new ViewChange with the given docs, changes, and sync state.
     */
    // PORTING NOTE: The iOS/Android clients always compute limbo document changes.
    applyChanges(t, e, n) {
        const s = this.ec;
        this.ec = t.ec, this.mutatedKeys = t.mutatedKeys;
        // Sort changes based on type and query comparator
        const i = t.ic.xu();
        i.sort(((t, e) => function(t, e) {
            const n = t => {
                switch (t) {
                  case 0 /* ChangeType.Added */ :
                    return 1;

                  case 2 /* ChangeType.Modified */ :
                  case 3 /* ChangeType.Metadata */ :
                    // A metadata change is converted to a modified change at the public
                    // api layer.  Since we sort by document key and then change type,
                    // metadata and modified changes must be sorted equivalently.
                    return 2;

                  case 1 /* ChangeType.Removed */ :
                    return 0;

                  default:
                    return O();
                }
            };
            return n(t) - n(e);
        }
        /**
 * @license
 * Copyright 2020 Google LLC
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
 */ (t.type, e.type) || this.tc(t.doc, e.doc))), this.oc(n);
        const r = e ? this.uc() : [], o = 0 === this.Zu.size && this.current ? 1 /* SyncState.Synced */ : 0 /* SyncState.Local */ , u = o !== this.Xu;
        if (this.Xu = o, 0 !== i.length || u) {
            return {
                snapshot: new Rc(this.query, t.ec, s, i, t.mutatedKeys, 0 /* SyncState.Local */ === o, u, 
                /* excludesMetadataChanges= */ !1, !!n && n.resumeToken.approximateByteSize() > 0),
                cc: r
            };
        }
        // no changes
        return {
            cc: r
        };
    }
    /**
     * Applies an OnlineState change to the view, potentially generating a
     * ViewChange if the view's syncState changes as a result.
     */    Mu(t) {
        return this.current && "Offline" /* OnlineState.Offline */ === t ? (
        // If we're offline, set `current` to false and then call applyChanges()
        // to refresh our syncState and generate a ViewChange as appropriate. We
        // are guaranteed to get a new TargetChange that sets `current` back to
        // true once the client is back online.
        this.current = !1, this.applyChanges({
            ec: this.ec,
            ic: new vc,
            mutatedKeys: this.mutatedKeys,
            zi: !1
        }, 
        /* updateLimboDocuments= */ !1)) : {
            cc: []
        };
    }
    /**
     * Returns whether the doc for the given key should be in limbo.
     */    ac(t) {
        // If the remote end says it's part of this query, it's not in limbo.
        return !this.Yu.has(t) && (
        // The local store doesn't think it's a result, so it shouldn't be in limbo.
        !!this.ec.has(t) && !this.ec.get(t).hasLocalMutations);
    }
    /**
     * Updates syncedDocuments, current, and limbo docs based on the given change.
     * Returns the list of changes to which docs are in limbo.
     */    oc(t) {
        t && (t.addedDocuments.forEach((t => this.Yu = this.Yu.add(t))), t.modifiedDocuments.forEach((t => {})), 
        t.removedDocuments.forEach((t => this.Yu = this.Yu.delete(t))), this.current = t.current);
    }
    uc() {
        // We can only determine limbo documents when we're in-sync with the server.
        if (!this.current) return [];
        // TODO(klimt): Do this incrementally so that it's not quadratic when
        // updating many documents.
                const t = this.Zu;
        this.Zu = gs(), this.ec.forEach((t => {
            this.ac(t.key) && (this.Zu = this.Zu.add(t.key));
        }));
        // Diff the new limbo docs with the old limbo docs.
        const e = [];
        return t.forEach((t => {
            this.Zu.has(t) || e.push(new Bc(t));
        })), this.Zu.forEach((n => {
            t.has(n) || e.push(new Fc(n));
        })), e;
    }
    /**
     * Update the in-memory state of the current view with the state read from
     * persistence.
     *
     * We update the query view whenever a client's primary status changes:
     * - When a client transitions from primary to secondary, it can miss
     *   LocalStorage updates and its query views may temporarily not be
     *   synchronized with the state on disk.
     * - For secondary to primary transitions, the client needs to update the list
     *   of `syncedDocuments` since secondary clients update their query views
     *   based purely on synthesized RemoteEvents.
     *
     * @param queryResult.documents - The documents that match the query according
     * to the LocalStore.
     * @param queryResult.remoteKeys - The keys of the documents that match the
     * query according to the backend.
     *
     * @returns The ViewChange that resulted from this synchronization.
     */
    // PORTING NOTE: Multi-tab only.
    hc(t) {
        this.Yu = t.ir, this.Zu = gs();
        const e = this.sc(t.documents);
        return this.applyChanges(e, /*updateLimboDocuments=*/ !0);
    }
    /**
     * Returns a view snapshot as if this query was just listened to. Contains
     * a document add for every existing document and the `fromCache` and
     * `hasPendingWrites` status of the already established view.
     */
    // PORTING NOTE: Multi-tab only.
    lc() {
        return Rc.fromInitialDocuments(this.query, this.ec, this.mutatedKeys, 0 /* SyncState.Local */ === this.Xu, this.hasCachedResults);
    }
}

/**
 * QueryView contains all of the data that SyncEngine needs to keep track of for
 * a particular query.
 */
class qc {
    constructor(
    /**
     * The query itself.
     */
    t, 
    /**
     * The target number created by the client that is used in the watch
     * stream to identify this query.
     */
    e, 
    /**
     * The view is responsible for computing the final merged truth of what
     * docs are in the query. It gets notified of local and remote changes,
     * and applies the query filters and limits to determine the most correct
     * possible results.
     */
    n) {
        this.query = t, this.targetId = e, this.view = n;
    }
}

/** Tracks a limbo resolution. */ class Uc {
    constructor(t) {
        this.key = t, 
        /**
         * Set to true once we've received a document. This is used in
         * getRemoteKeysForTarget() and ultimately used by WatchChangeAggregator to
         * decide whether it needs to manufacture a delete event for the target once
         * the target is CURRENT.
         */
        this.fc = !1;
    }
}

/**
 * An implementation of `SyncEngine` coordinating with other parts of SDK.
 *
 * The parts of SyncEngine that act as a callback to RemoteStore need to be
 * registered individually. This is done in `syncEngineWrite()` and
 * `syncEngineListen()` (as well as `applyPrimaryState()`) as these methods
 * serve as entry points to RemoteStore's functionality.
 *
 * Note: some field defined in this class might have public access level, but
 * the class is not exported so they are only accessible from this module.
 * This is useful to implement optional features (like bundles) in free
 * functions, such that they are tree-shakeable.
 */ class Kc {
    constructor(t, e, n, 
    // PORTING NOTE: Manages state synchronization in multi-tab environments.
    s, i, r) {
        this.localStore = t, this.remoteStore = e, this.eventManager = n, this.sharedClientState = s, 
        this.currentUser = i, this.maxConcurrentLimboResolutions = r, this.dc = {}, this.wc = new os((t => ts(t)), Zn), 
        this._c = new Map, 
        /**
         * The keys of documents that are in limbo for which we haven't yet started a
         * limbo resolution query. The strings in this set are the result of calling
         * `key.path.canonicalString()` where `key` is a `DocumentKey` object.
         *
         * The `Set` type was chosen because it provides efficient lookup and removal
         * of arbitrary elements and it also maintains insertion order, providing the
         * desired queue-like FIFO semantics.
         */
        this.mc = new Set, 
        /**
         * Keeps track of the target ID for each document that is in limbo with an
         * active target.
         */
        this.gc = new pe(ht.comparator), 
        /**
         * Keeps track of the information about an active limbo resolution for each
         * active target ID that was started for the purpose of limbo resolution.
         */
        this.yc = new Map, this.Ic = new Oo, 
        /** Stores user completion handlers, indexed by User and BatchId. */
        this.Tc = {}, 
        /** Stores user callbacks waiting for all pending writes to be acknowledged. */
        this.Ec = new Map, this.Ac = lo.Mn(), this.onlineState = "Unknown" /* OnlineState.Unknown */ , 
        // The primary state is set to `true` or `false` immediately after Firestore
        // startup. In the interim, a client should only be considered primary if
        // `isPrimary` is true.
        this.vc = void 0;
    }
    get isPrimaryClient() {
        return !0 === this.vc;
    }
}

/**
 * Initiates the new listen, resolves promise when listen enqueued to the
 * server. All the subsequent view snapshots or errors are sent to the
 * subscribed handlers. Returns the initial snapshot.
 */
async function Gc(t, e) {
    const n = pa(t);
    let s, i;
    const r = n.wc.get(e);
    if (r) 
    // PORTING NOTE: With Multi-Tab Web, it is possible that a query view
    // already exists when EventManager calls us for the first time. This
    // happens when the primary tab is already listening to this query on
    // behalf of another tab and the user of the primary also starts listening
    // to the query. EventManager will not have an assigned target ID in this
    // case and calls `listen` to obtain this ID.
    s = r.targetId, n.sharedClientState.addLocalQueryTarget(s), i = r.view.lc(); else {
        const t = await hu(n.localStore, Jn(e)), r = n.sharedClientState.addLocalQueryTarget(t.targetId);
        s = t.targetId, i = await Qc(n, e, s, "current" === r, t.resumeToken), n.isPrimaryClient && Hu(n.remoteStore, t);
    }
    return i;
}

/**
 * Registers a view for a previously unknown query and computes its initial
 * snapshot.
 */ async function Qc(t, e, n, s, i) {
    // PORTING NOTE: On Web only, we inject the code that registers new Limbo
    // targets based on view changes. This allows us to only depend on Limbo
    // changes when user code includes queries.
    t.Rc = (e, n, s) => async function(t, e, n, s) {
        let i = e.view.sc(n);
        i.zi && (
        // The query has a limit and some docs were removed, so we need
        // to re-run the query against the local store to make sure we
        // didn't lose any good docs that had been past the limit.
        i = await fu(t.localStore, e.query, 
        /* usePreviousResults= */ !1).then((({documents: t}) => e.view.sc(t, i))));
        const r = s && s.targetChanges.get(e.targetId), o = e.view.applyChanges(i, 
        /* updateLimboDocuments= */ t.isPrimaryClient, r);
        return ia(t, e.targetId, o.cc), o.snapshot;
    }(t, e, n, s);
    const r = await fu(t.localStore, e, 
    /* usePreviousResults= */ !0), o = new Lc(e, r.ir), u = o.sc(r.documents), c = gi.createSynthesizedTargetChangeForCurrentChange(n, s && "Offline" /* OnlineState.Offline */ !== t.onlineState, i), a = o.applyChanges(u, 
    /* updateLimboDocuments= */ t.isPrimaryClient, c);
    ia(t, n, a.cc);
    const h = new qc(e, n, o);
    return t.wc.set(e, h), t._c.has(n) ? t._c.get(n).push(e) : t._c.set(n, [ e ]), a.snapshot;
}

/** Stops listening to the query. */ async function jc(t, e) {
    const n = L(t), s = n.wc.get(e), i = n._c.get(s.targetId);
    if (i.length > 1) return n._c.set(s.targetId, i.filter((t => !Zn(t, e)))), void n.wc.delete(e);
    // No other queries are mapped to the target, clean up the query and the target.
        if (n.isPrimaryClient) {
        // We need to remove the local query target first to allow us to verify
        // whether any other client is still interested in this target.
        n.sharedClientState.removeLocalQueryTarget(s.targetId);
        n.sharedClientState.isActiveQueryTarget(s.targetId) || await lu(n.localStore, s.targetId, 
        /*keepPersistedTargetData=*/ !1).then((() => {
            n.sharedClientState.clearQueryState(s.targetId), Ju(n.remoteStore, s.targetId), 
            na(n, s.targetId);
        })).catch(vt);
    } else na(n, s.targetId), await lu(n.localStore, s.targetId, 
    /*keepPersistedTargetData=*/ !0);
}

/**
 * Initiates the write of local mutation batch which involves adding the
 * writes to the mutation queue, notifying the remote store about new
 * mutations and raising events for any changes this write caused.
 *
 * The promise returned by this call is resolved when the above steps
 * have completed, *not* when the write was acked by the backend. The
 * userCallback is resolved once the write was acked/rejected by the
 * backend (or failed locally for any other reason).
 */ async function zc(t, e, n) {
    const s = Ia(t);
    try {
        const t = await function(t, e) {
            const n = L(t), s = it.now(), i = e.reduce(((t, e) => t.add(e.key)), gs());
            let r, o;
            return n.persistence.runTransaction("Locally write mutations", "readwrite", (t => {
                // Figure out which keys do not have a remote version in the cache, this
                // is needed to create the right overlay mutation: if no remote version
                // presents, we do not need to create overlays as patch mutations.
                // TODO(Overlay): Is there a better way to determine this? Using the
                //  document version does not work because local mutations set them back
                //  to 0.
                let u = cs(), c = gs();
                return n.Zi.getEntries(t, i).next((t => {
                    u = t, u.forEach(((t, e) => {
                        e.isValidDocument() || (c = c.add(t));
                    }));
                })).next((() => n.localDocuments.getOverlayedDocuments(t, u))).next((i => {
                    r = i;
                    // For non-idempotent mutations (such as `FieldValue.increment()`),
                    // we record the base state in a separate patch mutation. This is
                    // later used to guarantee consistent values and prevents flicker
                    // even if the backend sends us an update that already includes our
                    // transform.
                    const o = [];
                    for (const t of e) {
                        const e = Gs(t, r.get(t.key).overlayedDocument);
                        null != e && 
                        // NOTE: The base state should only be applied if there's some
                        // existing document to override, so use a Precondition of
                        // exists=true
                        o.push(new zs(t.key, e, cn(e.value.mapValue), Fs.exists(!0)));
                    }
                    return n.mutationQueue.addMutationBatch(t, s, o, e);
                })).next((e => {
                    o = e;
                    const s = e.applyToLocalDocumentSet(r, c);
                    return n.documentOverlayCache.saveOverlays(t, e.batchId, s);
                }));
            })).then((() => ({
                batchId: o.batchId,
                changes: ls(r)
            })));
        }(s.localStore, e);
        s.sharedClientState.addPendingMutation(t.batchId), function(t, e, n) {
            let s = t.Tc[t.currentUser.toKey()];
            s || (s = new pe(et));
            s = s.insert(e, n), t.Tc[t.currentUser.toKey()] = s;
        }
        /**
 * Resolves or rejects the user callback for the given batch and then discards
 * it.
 */ (s, t.batchId, n), await ua(s, t.changes), await cc(s.remoteStore);
    } catch (t) {
        // If we can't persist the mutation, we reject the user callback and
        // don't send the mutation. The user can then retry the write.
        const e = Ec(t, "Failed to persist write");
        n.reject(e);
    }
}

/**
 * Applies one remote event to the sync engine, notifying any views of the
 * changes, and releasing any pending mutation batches that would become
 * visible because of the snapshot version the remote event contains.
 */ async function Wc(t, e) {
    const n = L(t);
    try {
        const t = await uu(n.localStore, e);
        // Update `receivedDocument` as appropriate for any limbo targets.
                e.targetChanges.forEach(((t, e) => {
            const s = n.yc.get(e);
            s && (
            // Since this is a limbo resolution lookup, it's for a single document
            // and it could be added, modified, or removed, but not a combination.
            F(t.addedDocuments.size + t.modifiedDocuments.size + t.removedDocuments.size <= 1), 
            t.addedDocuments.size > 0 ? s.fc = !0 : t.modifiedDocuments.size > 0 ? F(s.fc) : t.removedDocuments.size > 0 && (F(s.fc), 
            s.fc = !1));
        })), await ua(n, t, e);
    } catch (t) {
        await vt(t);
    }
}

/**
 * Applies an OnlineState change to the sync engine and notifies any views of
 * the change.
 */ function Hc(t, e, n) {
    const s = L(t);
    // If we are the secondary client, we explicitly ignore the remote store's
    // online state (the local client may go offline, even though the primary
    // tab remains online) and only apply the primary tab's online state from
    // SharedClientState.
        if (s.isPrimaryClient && 0 /* OnlineStateSource.RemoteStore */ === n || !s.isPrimaryClient && 1 /* OnlineStateSource.SharedClientState */ === n) {
        const t = [];
        s.wc.forEach(((n, s) => {
            const i = s.view.Mu(e);
            i.snapshot && t.push(i.snapshot);
        })), function(t, e) {
            const n = L(t);
            n.onlineState = e;
            let s = !1;
            n.queries.forEach(((t, n) => {
                for (const t of n.listeners) 
                // Run global snapshot listeners if a consistent snapshot has been emitted.
                t.Mu(e) && (s = !0);
            })), s && xc(n);
        }(s.eventManager, e), t.length && s.dc.nu(t), s.onlineState = e, s.isPrimaryClient && s.sharedClientState.setOnlineState(e);
    }
}

/**
 * Rejects the listen for the given targetID. This can be triggered by the
 * backend for any active target.
 *
 * @param syncEngine - The sync engine implementation.
 * @param targetId - The targetID corresponds to one previously initiated by the
 * user as part of TargetData passed to listen() on RemoteStore.
 * @param err - A description of the condition that has forced the rejection.
 * Nearly always this will be an indication that the user is no longer
 * authorized to see the data matching the target.
 */ async function Jc(t, e, n) {
    const s = L(t);
    // PORTING NOTE: Multi-tab only.
        s.sharedClientState.updateQueryState(e, "rejected", n);
    const i = s.yc.get(e), r = i && i.key;
    if (r) {
        // TODO(klimt): We really only should do the following on permission
        // denied errors, but we don't have the cause code here.
        // It's a limbo doc. Create a synthetic event saying it was deleted.
        // This is kind of a hack. Ideally, we would have a method in the local
        // store to purge a document. However, it would be tricky to keep all of
        // the local store's invariants with another method.
        let t = new pe(ht.comparator);
        // TODO(b/217189216): This limbo document should ideally have a read time,
        // so that it is picked up by any read-time based scans. The backend,
        // however, does not send a read time for target removals.
                t = t.insert(r, an.newNoDocument(r, rt.min()));
        const n = gs().add(r), i = new mi(rt.min(), 
        /* targetChanges= */ new Map, 
        /* targetMismatches= */ new pe(et), t, n);
        await Wc(s, i), 
        // Since this query failed, we won't want to manually unlisten to it.
        // We only remove it from bookkeeping after we successfully applied the
        // RemoteEvent. If `applyRemoteEvent()` throws, we want to re-listen to
        // this query when the RemoteStore restarts the Watch stream, which should
        // re-trigger the target failure.
        s.gc = s.gc.remove(r), s.yc.delete(e), oa(s);
    } else await lu(s.localStore, e, 
    /* keepPersistedTargetData */ !1).then((() => na(s, e, n))).catch(vt);
}

async function Yc(t, e) {
    const n = L(t), s = e.batch.batchId;
    try {
        const t = await ru(n.localStore, e);
        // The local store may or may not be able to apply the write result and
        // raise events immediately (depending on whether the watcher is caught
        // up), so we raise user callbacks first so that they consistently happen
        // before listen events.
                ea(n, s, /*error=*/ null), ta(n, s), n.sharedClientState.updateMutationState(s, "acknowledged"), 
        await ua(n, t);
    } catch (t) {
        await vt(t);
    }
}

async function Xc(t, e, n) {
    const s = L(t);
    try {
        const t = await function(t, e) {
            const n = L(t);
            return n.persistence.runTransaction("Reject batch", "readwrite-primary", (t => {
                let s;
                return n.mutationQueue.lookupMutationBatch(t, e).next((e => (F(null !== e), s = e.keys(), 
                n.mutationQueue.removeMutationBatch(t, e)))).next((() => n.mutationQueue.performConsistencyCheck(t))).next((() => n.documentOverlayCache.removeOverlaysForBatchId(t, s, e))).next((() => n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(t, s))).next((() => n.localDocuments.getDocuments(t, s)));
            }));
        }
        /**
 * Returns the largest (latest) batch id in mutation queue that is pending
 * server response.
 *
 * Returns `BATCHID_UNKNOWN` if the queue is empty.
 */ (s.localStore, e);
        // The local store may or may not be able to apply the write result and
        // raise events immediately (depending on whether the watcher is caught up),
        // so we raise user callbacks first so that they consistently happen before
        // listen events.
                ea(s, e, n), ta(s, e), s.sharedClientState.updateMutationState(e, "rejected", n), 
        await ua(s, t);
    } catch (n) {
        await vt(n);
    }
}

/**
 * Registers a user callback that resolves when all pending mutations at the moment of calling
 * are acknowledged .
 */ async function Zc(t, e) {
    const n = L(t);
    ec(n.remoteStore) || N("SyncEngine", "The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled.");
    try {
        const t = await function(t) {
            const e = L(t);
            return e.persistence.runTransaction("Get highest unacknowledged batch id", "readonly", (t => e.mutationQueue.getHighestUnacknowledgedBatchId(t)));
        }(n.localStore);
        if (-1 === t) 
        // Trigger the callback right away if there is no pending writes at the moment.
        return void e.resolve();
        const s = n.Ec.get(t) || [];
        s.push(e), n.Ec.set(t, s);
    } catch (t) {
        const n = Ec(t, "Initialization of waitForPendingWrites() operation failed");
        e.reject(n);
    }
}

/**
 * Triggers the callbacks that are waiting for this batch id to get acknowledged by server,
 * if there are any.
 */ function ta(t, e) {
    (t.Ec.get(e) || []).forEach((t => {
        t.resolve();
    })), t.Ec.delete(e);
}

/** Reject all outstanding callbacks waiting for pending writes to complete. */ function ea(t, e, n) {
    const s = L(t);
    let i = s.Tc[s.currentUser.toKey()];
    // NOTE: Mutations restored from persistence won't have callbacks, so it's
    // okay for there to be no callback for this ID.
        if (i) {
        const t = i.get(e);
        t && (n ? t.reject(n) : t.resolve(), i = i.remove(e)), s.Tc[s.currentUser.toKey()] = i;
    }
}

function na(t, e, n = null) {
    t.sharedClientState.removeLocalQueryTarget(e);
    for (const s of t._c.get(e)) t.wc.delete(s), n && t.dc.Pc(s, n);
    if (t._c.delete(e), t.isPrimaryClient) {
        t.Ic.Is(e).forEach((e => {
            t.Ic.containsKey(e) || 
            // We removed the last reference for this key
            sa(t, e);
        }));
    }
}

function sa(t, e) {
    t.mc.delete(e.path.canonicalString());
    // It's possible that the target already got removed because the query failed. In that case,
    // the key won't exist in `limboTargetsByKey`. Only do the cleanup if we still have the target.
    const n = t.gc.get(e);
    null !== n && (Ju(t.remoteStore, n), t.gc = t.gc.remove(e), t.yc.delete(n), oa(t));
}

function ia(t, e, n) {
    for (const s of n) if (s instanceof Fc) t.Ic.addReference(s.key, e), ra(t, s); else if (s instanceof Bc) {
        N("SyncEngine", "Document no longer in limbo: " + s.key), t.Ic.removeReference(s.key, e);
        t.Ic.containsKey(s.key) || 
        // We removed the last reference for this key
        sa(t, s.key);
    } else O();
}

function ra(t, e) {
    const n = e.key, s = n.path.canonicalString();
    t.gc.get(n) || t.mc.has(s) || (N("SyncEngine", "New document in limbo: " + n), t.mc.add(s), 
    oa(t));
}

/**
 * Starts listens for documents in limbo that are enqueued for resolution,
 * subject to a maximum number of concurrent resolutions.
 *
 * Without bounding the number of concurrent resolutions, the server can fail
 * with "resource exhausted" errors which can lead to pathological client
 * behavior as seen in https://github.com/firebase/firebase-js-sdk/issues/2683.
 */ function oa(t) {
    for (;t.mc.size > 0 && t.gc.size < t.maxConcurrentLimboResolutions; ) {
        const e = t.mc.values().next().value;
        t.mc.delete(e);
        const n = new ht(ut.fromString(e)), s = t.Ac.next();
        t.yc.set(s, new Uc(n)), t.gc = t.gc.insert(n, s), Hu(t.remoteStore, new cr(Jn(Gn(n.path)), s, "TargetPurposeLimboResolution" /* TargetPurpose.LimboResolution */ , Ot.ct));
    }
}

async function ua(t, e, n) {
    const s = L(t), i = [], r = [], o = [];
    s.wc.isEmpty() || (s.wc.forEach(((t, u) => {
        o.push(s.Rc(u, e, n).then((t => {
            // Update views if there are actual changes.
            if (
            // If there are changes, or we are handling a global snapshot, notify
            // secondary clients to update query state.
            (t || n) && s.isPrimaryClient && s.sharedClientState.updateQueryState(u.targetId, (null == t ? void 0 : t.fromCache) ? "not-current" : "current"), 
            t) {
                i.push(t);
                const e = tu.Li(u.targetId, t);
                r.push(e);
            }
        })));
    })), await Promise.all(o), s.dc.nu(i), await async function(t, e) {
        const n = L(t);
        try {
            await n.persistence.runTransaction("notifyLocalViewChanges", "readwrite", (t => Rt.forEach(e, (e => Rt.forEach(e.Fi, (s => n.persistence.referenceDelegate.addReference(t, e.targetId, s))).next((() => Rt.forEach(e.Bi, (s => n.persistence.referenceDelegate.removeReference(t, e.targetId, s)))))))));
        } catch (t) {
            if (!Dt(t)) throw t;
            // If `notifyLocalViewChanges` fails, we did not advance the sequence
            // number for the documents that were included in this transaction.
            // This might trigger them to be deleted earlier than they otherwise
            // would have, but it should not invalidate the integrity of the data.
            N("LocalStore", "Failed to update sequence numbers: " + t);
        }
        for (const t of e) {
            const e = t.targetId;
            if (!t.fromCache) {
                const t = n.Ji.get(e), s = t.snapshotVersion, i = t.withLastLimboFreeSnapshotVersion(s);
                // Advance the last limbo free snapshot version
                                n.Ji = n.Ji.insert(e, i);
            }
        }
    }(s.localStore, r));
}

async function ca(t, e) {
    const n = L(t);
    if (!n.currentUser.isEqual(e)) {
        N("SyncEngine", "User change. New user:", e.toKey());
        const t = await iu(n.localStore, e);
        n.currentUser = e, 
        // Fails tasks waiting for pending writes requested by previous user.
        function(t, e) {
            t.Ec.forEach((t => {
                t.forEach((t => {
                    t.reject(new U(q.CANCELLED, e));
                }));
            })), t.Ec.clear();
        }(n, "'waitForPendingWrites' promise is rejected due to a user change."), 
        // TODO(b/114226417): Consider calling this only in the primary tab.
        n.sharedClientState.handleUserChange(e, t.removedBatchIds, t.addedBatchIds), await ua(n, t.er);
    }
}

function aa(t, e) {
    const n = L(t), s = n.yc.get(e);
    if (s && s.fc) return gs().add(s.key);
    {
        let t = gs();
        const s = n._c.get(e);
        if (!s) return t;
        for (const e of s) {
            const s = n.wc.get(e);
            t = t.unionWith(s.view.nc);
        }
        return t;
    }
}

/**
 * Reconcile the list of synced documents in an existing view with those
 * from persistence.
 */ async function ha(t, e) {
    const n = L(t), s = await fu(n.localStore, e.query, 
    /* usePreviousResults= */ !0), i = e.view.hc(s);
    return n.isPrimaryClient && ia(n, e.targetId, i.cc), i;
}

/**
 * Retrieves newly changed documents from remote document cache and raises
 * snapshots if needed.
 */
// PORTING NOTE: Multi-Tab only.
async function la(t, e) {
    const n = L(t);
    return wu(n.localStore, e).then((t => ua(n, t)));
}

/** Applies a mutation state to an existing batch.  */
// PORTING NOTE: Multi-Tab only.
async function fa(t, e, n, s) {
    const i = L(t), r = await function(t, e) {
        const n = L(t), s = L(n.mutationQueue);
        return n.persistence.runTransaction("Lookup mutation documents", "readonly", (t => s.Sn(t, e).next((e => e ? n.localDocuments.getDocuments(t, e) : Rt.resolve(null)))));
    }
    // PORTING NOTE: Multi-Tab only.
    (i.localStore, e);
    null !== r ? ("pending" === n ? 
    // If we are the primary client, we need to send this write to the
    // backend. Secondary clients will ignore these writes since their remote
    // connection is disabled.
    await cc(i.remoteStore) : "acknowledged" === n || "rejected" === n ? (
    // NOTE: Both these methods are no-ops for batches that originated from
    // other clients.
    ea(i, e, s || null), ta(i, e), function(t, e) {
        L(L(t).mutationQueue).Cn(e);
    }
    // PORTING NOTE: Multi-Tab only.
    (i.localStore, e)) : O(), await ua(i, r)) : 
    // A throttled tab may not have seen the mutation before it was completed
    // and removed from the mutation queue, in which case we won't have cached
    // the affected documents. In this case we can safely ignore the update
    // since that means we didn't apply the mutation locally at all (if we
    // had, we would have cached the affected documents), and so we will just
    // see any resulting document changes via normal remote document updates
    // as applicable.
    N("SyncEngine", "Cannot apply mutation batch with id: " + e);
}

/** Applies a query target change from a different tab. */
// PORTING NOTE: Multi-Tab only.
async function da(t, e) {
    const n = L(t);
    if (pa(n), Ia(n), !0 === e && !0 !== n.vc) {
        // Secondary tabs only maintain Views for their local listeners and the
        // Views internal state may not be 100% populated (in particular
        // secondary tabs don't track syncedDocuments, the set of documents the
        // server considers to be in the target). So when a secondary becomes
        // primary, we need to need to make sure that all views for all targets
        // match the state on disk.
        const t = n.sharedClientState.getAllActiveQueryTargets(), e = await wa(n, t.toArray());
        n.vc = !0, await yc(n.remoteStore, !0);
        for (const t of e) Hu(n.remoteStore, t);
    } else if (!1 === e && !1 !== n.vc) {
        const t = [];
        let e = Promise.resolve();
        n._c.forEach(((s, i) => {
            n.sharedClientState.isLocalQueryTarget(i) ? t.push(i) : e = e.then((() => (na(n, i), 
            lu(n.localStore, i, 
            /*keepPersistedTargetData=*/ !0)))), Ju(n.remoteStore, i);
        })), await e, await wa(n, t), 
        // PORTING NOTE: Multi-Tab only.
        function(t) {
            const e = L(t);
            e.yc.forEach(((t, n) => {
                Ju(e.remoteStore, n);
            })), e.Ic.Ts(), e.yc = new Map, e.gc = new pe(ht.comparator);
        }
        /**
 * Reconcile the query views of the provided query targets with the state from
 * persistence. Raises snapshots for any changes that affect the local
 * client and returns the updated state of all target's query data.
 *
 * @param syncEngine - The sync engine implementation
 * @param targets - the list of targets with views that need to be recomputed
 * @param transitionToPrimary - `true` iff the tab transitions from a secondary
 * tab to a primary tab
 */
        // PORTING NOTE: Multi-Tab only.
        (n), n.vc = !1, await yc(n.remoteStore, !1);
    }
}

async function wa(t, e, n) {
    const s = L(t), i = [], r = [];
    for (const t of e) {
        let e;
        const n = s._c.get(t);
        if (n && 0 !== n.length) {
            // For queries that have a local View, we fetch their current state
            // from LocalStore (as the resume token and the snapshot version
            // might have changed) and reconcile their views with the persisted
            // state (the list of syncedDocuments may have gotten out of sync).
            e = await hu(s.localStore, Jn(n[0]));
            for (const t of n) {
                const e = s.wc.get(t), n = await ha(s, e);
                n.snapshot && r.push(n.snapshot);
            }
        } else {
            // For queries that never executed on this client, we need to
            // allocate the target in LocalStore and initialize a new View.
            const n = await du(s.localStore, t);
            e = await hu(s.localStore, n), await Qc(s, _a(n), t, 
            /*current=*/ !1, e.resumeToken);
        }
        i.push(e);
    }
    return s.dc.nu(r), i;
}

/**
 * Creates a `Query` object from the specified `Target`. There is no way to
 * obtain the original `Query`, so we synthesize a `Query` from the `Target`
 * object.
 *
 * The synthesized result might be different from the original `Query`, but
 * since the synthesized `Query` should return the same results as the
 * original one (only the presentation of results might differ), the potential
 * difference will not cause issues.
 */
// PORTING NOTE: Multi-Tab only.
function _a(t) {
    return Kn(t.path, t.collectionGroup, t.orderBy, t.filters, t.limit, "F" /* LimitType.First */ , t.startAt, t.endAt);
}

/** Returns the IDs of the clients that are currently active. */
// PORTING NOTE: Multi-Tab only.
function ma(t) {
    const e = L(t);
    return L(L(e.localStore).persistence).$i();
}

/** Applies a query target change from a different tab. */
// PORTING NOTE: Multi-Tab only.
async function ga(t, e, n, s) {
    const i = L(t);
    if (i.vc) 
    // If we receive a target state notification via WebStorage, we are
    // either already secondary or another tab has taken the primary lease.
    return void N("SyncEngine", "Ignoring unexpected query state notification.");
    const r = i._c.get(e);
    if (r && r.length > 0) switch (n) {
      case "current":
      case "not-current":
        {
            const t = await wu(i.localStore, ss(r[0])), s = mi.createSynthesizedRemoteEventForCurrentChange(e, "current" === n, Ve.EMPTY_BYTE_STRING);
            await ua(i, t, s);
            break;
        }

      case "rejected":
        await lu(i.localStore, e, 
        /* keepPersistedTargetData */ !0), na(i, e, s);
        break;

      default:
        O();
    }
}

/** Adds or removes Watch targets for queries from different tabs. */ async function ya(t, e, n) {
    const s = pa(t);
    if (s.vc) {
        for (const t of e) {
            if (s._c.has(t)) {
                // A target might have been added in a previous attempt
                N("SyncEngine", "Adding an already active target " + t);
                continue;
            }
            const e = await du(s.localStore, t), n = await hu(s.localStore, e);
            await Qc(s, _a(e), n.targetId, 
            /*current=*/ !1, n.resumeToken), Hu(s.remoteStore, n);
        }
        for (const t of n) 
        // Check that the target is still active since the target might have been
        // removed if it has been rejected by the backend.
        s._c.has(t) && 
        // Release queries that are still active.
        await lu(s.localStore, t, 
        /* keepPersistedTargetData */ !1).then((() => {
            Ju(s.remoteStore, t), na(s, t);
        })).catch(vt);
    }
}

function pa(t) {
    const e = L(t);
    return e.remoteStore.remoteSyncer.applyRemoteEvent = Wc.bind(null, e), e.remoteStore.remoteSyncer.getRemoteKeysForTarget = aa.bind(null, e), 
    e.remoteStore.remoteSyncer.rejectListen = Jc.bind(null, e), e.dc.nu = Dc.bind(null, e.eventManager), 
    e.dc.Pc = Cc.bind(null, e.eventManager), e;
}

function Ia(t) {
    const e = L(t);
    return e.remoteStore.remoteSyncer.applySuccessfulWrite = Yc.bind(null, e), e.remoteStore.remoteSyncer.rejectFailedWrite = Xc.bind(null, e), 
    e;
}

/**
 * Loads a Firestore bundle into the SDK. The returned promise resolves when
 * the bundle finished loading.
 *
 * @param syncEngine - SyncEngine to use.
 * @param bundleReader - Bundle to load into the SDK.
 * @param task - LoadBundleTask used to update the loading progress to public API.
 */ function Ta(t, e, n) {
    const s = L(t);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (
    /** Loads a bundle and returns the list of affected collection groups. */
    async function(t, e, n) {
        try {
            const s = await e.getMetadata();
            if (await function(t, e) {
                const n = L(t), s = Ni(e.createTime);
                return n.persistence.runTransaction("hasNewerBundle", "readonly", (t => n.qs.getBundleMetadata(t, e.id))).then((t => !!t && t.createTime.compareTo(s) >= 0));
            }
            /**
 * Saves the given `BundleMetadata` to local persistence.
 */ (t.localStore, s)) return await e.close(), n._completeWith(function(t) {
                return {
                    taskState: "Success",
                    documentsLoaded: t.totalDocuments,
                    bytesLoaded: t.totalBytes,
                    totalDocuments: t.totalDocuments,
                    totalBytes: t.totalBytes
                };
            }(s)), Promise.resolve(new Set);
            n._updateProgress(Oc(s));
            const i = new $c(s, t.localStore, e.serializer);
            let r = await e.bc();
            for (;r; ) {
                const t = await i.zu(r);
                t && n._updateProgress(t), r = await e.bc();
            }
            const o = await i.complete();
            return await ua(t, o.Ju, 
            /* remoteEvent */ void 0), 
            // Save metadata, so loading the same bundle will skip.
            await function(t, e) {
                const n = L(t);
                return n.persistence.runTransaction("Save bundle", "readwrite", (t => n.qs.saveBundleMetadata(t, e)));
            }
            /**
 * Returns a promise of a `NamedQuery` associated with given query name. Promise
 * resolves to undefined if no persisted data can be found.
 */ (t.localStore, s), n._completeWith(o.progress), Promise.resolve(o.Hu);
        } catch (t) {
            return M("SyncEngine", `Loading bundle failed with ${t}`), n._failWith(t), Promise.resolve(new Set);
        }
    }
    /**
 * @license
 * Copyright 2020 Google LLC
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
    /**
 * Provides all components needed for Firestore with in-memory persistence.
 * Uses EagerGC garbage collection.
 */)(s, e, n).then((t => {
        s.sharedClientState.notifyBundleLoaded(t);
    }));
}

class Ea {
    constructor() {
        this.synchronizeTabs = !1;
    }
    async initialize(t) {
        this.serializer = Fu(t.databaseInfo.databaseId), this.sharedClientState = this.createSharedClientState(t), 
        this.persistence = this.createPersistence(t), await this.persistence.start(), this.localStore = this.createLocalStore(t), 
        this.gcScheduler = this.createGarbageCollectionScheduler(t, this.localStore), this.indexBackfillerScheduler = this.createIndexBackfillerScheduler(t, this.localStore);
    }
    createGarbageCollectionScheduler(t, e) {
        return null;
    }
    createIndexBackfillerScheduler(t, e) {
        return null;
    }
    createLocalStore(t) {
        return su(this.persistence, new eu, t.initialUser, this.serializer);
    }
    createPersistence(t) {
        return new Ko(Qo.zs, this.serializer);
    }
    createSharedClientState(t) {
        return new bu;
    }
    async terminate() {
        this.gcScheduler && this.gcScheduler.stop(), await this.sharedClientState.shutdown(), 
        await this.persistence.shutdown();
    }
}

class Aa extends Ea {
    constructor(t) {
        super(), this.cacheSizeBytes = t;
    }
    createGarbageCollectionScheduler(t, e) {
        F(this.persistence.referenceDelegate instanceof jo);
        const n = this.persistence.referenceDelegate.garbageCollector;
        return new po(n, t.asyncQueue, e);
    }
    createPersistence(t) {
        const e = void 0 !== this.cacheSizeBytes ? so.withCacheSize(this.cacheSizeBytes) : so.DEFAULT;
        return new Ko((t => jo.zs(t, e)), this.serializer);
    }
}

/**
 * Provides all components needed for Firestore with IndexedDB persistence.
 */ class va extends Ea {
    constructor(t, e, n) {
        super(), this.Vc = t, this.cacheSizeBytes = e, this.forceOwnership = n, this.synchronizeTabs = !1;
    }
    async initialize(t) {
        await super.initialize(t), await this.Vc.initialize(this, t), 
        // Enqueue writes from a previous session
        await Ia(this.Vc.syncEngine), await cc(this.Vc.remoteStore), 
        // NOTE: This will immediately call the listener, so we make sure to
        // set it after localStore / remoteStore are started.
        await this.persistence.Ii((() => (this.gcScheduler && !this.gcScheduler.started && this.gcScheduler.start(), 
        this.indexBackfillerScheduler && !this.indexBackfillerScheduler.started && this.indexBackfillerScheduler.start(), 
        Promise.resolve())));
    }
    createLocalStore(t) {
        return su(this.persistence, new eu, t.initialUser, this.serializer);
    }
    createGarbageCollectionScheduler(t, e) {
        const n = this.persistence.referenceDelegate.garbageCollector;
        return new po(n, t.asyncQueue, e);
    }
    createIndexBackfillerScheduler(t, e) {
        const n = new $t(e, this.persistence);
        return new Mt(t.asyncQueue, n);
    }
    createPersistence(t) {
        const e = Zo(t.databaseInfo.databaseId, t.databaseInfo.persistenceKey), n = void 0 !== this.cacheSizeBytes ? so.withCacheSize(this.cacheSizeBytes) : so.DEFAULT;
        return new Jo(this.synchronizeTabs, e, t.clientId, n, t.asyncQueue, $u(), Ou(), this.serializer, this.sharedClientState, !!this.forceOwnership);
    }
    createSharedClientState(t) {
        return new bu;
    }
}

/**
 * Provides all components needed for Firestore with multi-tab IndexedDB
 * persistence.
 *
 * In the legacy client, this provider is used to provide both multi-tab and
 * non-multi-tab persistence since we cannot tell at build time whether
 * `synchronizeTabs` will be enabled.
 */ class Ra extends va {
    constructor(t, e) {
        super(t, e, /* forceOwnership= */ !1), this.Vc = t, this.cacheSizeBytes = e, this.synchronizeTabs = !0;
    }
    async initialize(t) {
        await super.initialize(t);
        const e = this.Vc.syncEngine;
        this.sharedClientState instanceof Pu && (this.sharedClientState.syncEngine = {
            jr: fa.bind(null, e),
            zr: ga.bind(null, e),
            Wr: ya.bind(null, e),
            $i: ma.bind(null, e),
            Qr: la.bind(null, e)
        }, await this.sharedClientState.start()), 
        // NOTE: This will immediately call the listener, so we make sure to
        // set it after localStore / remoteStore are started.
        await this.persistence.Ii((async t => {
            await da(this.Vc.syncEngine, t), this.gcScheduler && (t && !this.gcScheduler.started ? this.gcScheduler.start() : t || this.gcScheduler.stop()), 
            this.indexBackfillerScheduler && (t && !this.indexBackfillerScheduler.started ? this.indexBackfillerScheduler.start() : t || this.indexBackfillerScheduler.stop());
        }));
    }
    createSharedClientState(t) {
        const e = $u();
        if (!Pu.D(e)) throw new U(q.UNIMPLEMENTED, "IndexedDB persistence is only available on platforms that support LocalStorage.");
        const n = Zo(t.databaseInfo.databaseId, t.databaseInfo.persistenceKey);
        return new Pu(e, t.asyncQueue, n, t.clientId, t.initialUser);
    }
}

/**
 * Initializes and wires the components that are needed to interface with the
 * network.
 */ class Pa {
    async initialize(t, e) {
        this.localStore || (this.localStore = t.localStore, this.sharedClientState = t.sharedClientState, 
        this.datastore = this.createDatastore(e), this.remoteStore = this.createRemoteStore(e), 
        this.eventManager = this.createEventManager(e), this.syncEngine = this.createSyncEngine(e, 
        /* startAsPrimary=*/ !t.synchronizeTabs), this.sharedClientState.onlineStateHandler = t => Hc(this.syncEngine, t, 1 /* OnlineStateSource.SharedClientState */), 
        this.remoteStore.remoteSyncer.handleCredentialChange = ca.bind(null, this.syncEngine), 
        await yc(this.remoteStore, this.syncEngine.isPrimaryClient));
    }
    createEventManager(t) {
        return new bc;
    }
    createDatastore(t) {
        const e = Fu(t.databaseInfo.databaseId), n = (s = t.databaseInfo, new Mu(s));
        var s;
        /** Return the Platform-specific connectivity monitor. */        return function(t, e, n, s) {
            return new Ku(t, e, n, s);
        }(t.authCredentials, t.appCheckCredentials, n, e);
    }
    createRemoteStore(t) {
        return e = this.localStore, n = this.datastore, s = t.asyncQueue, i = t => Hc(this.syncEngine, t, 0 /* OnlineStateSource.RemoteStore */), 
        r = Su.D() ? new Su : new Vu, new ju(e, n, s, i, r);
        var e, n, s, i, r;
        /** Re-enables the network. Idempotent. */    }
    createSyncEngine(t, e) {
        return function(t, e, n, 
        // PORTING NOTE: Manages state synchronization in multi-tab environments.
        s, i, r, o) {
            const u = new Kc(t, e, n, s, i, r);
            return o && (u.vc = !0), u;
        }(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, t.initialUser, t.maxConcurrentLimboResolutions, e);
    }
    terminate() {
        return async function(t) {
            const e = L(t);
            N("RemoteStore", "RemoteStore shutting down."), e.vu.add(5 /* OfflineCause.Shutdown */), 
            await Wu(e), e.Pu.shutdown(), 
            // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
            // triggering spurious listener events with cached data, etc.
            e.bu.set("Unknown" /* OnlineState.Unknown */);
        }(this.remoteStore);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * How many bytes to read each time when `ReadableStreamReader.read()` is
 * called. Only applicable for byte streams that we control (e.g. those backed
 * by an UInt8Array).
 */
/**
 * Builds a `ByteStreamReader` from a UInt8Array.
 * @param source - The data source to use.
 * @param bytesPerRead - How many bytes each `read()` from the returned reader
 *        will read.
 */
function ba(t, e = 10240) {
    let n = 0;
    // The TypeScript definition for ReadableStreamReader changed. We use
    // `any` here to allow this code to compile with different versions.
    // See https://github.com/microsoft/TypeScript/issues/42970
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async read() {
            if (n < t.byteLength) {
                const s = {
                    value: t.slice(n, n + e),
                    done: !1
                };
                return n += e, s;
            }
            return {
                done: !0
            };
        },
        async cancel() {},
        releaseLock() {},
        closed: Promise.resolve()
    };
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * On web, a `ReadableStream` is wrapped around by a `ByteStreamReader`.
 */
/**
 * @license
 * Copyright 2017 Google LLC
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
/*
 * A wrapper implementation of Observer<T> that will dispatch events
 * asynchronously. To allow immediate silencing, a mute call is added which
 * causes events scheduled to no longer be raised.
 */
class Va {
    constructor(t) {
        this.observer = t, 
        /**
         * When set to true, will not raise future events. Necessary to deal with
         * async detachment of listener.
         */
        this.muted = !1;
    }
    next(t) {
        this.observer.next && this.Sc(this.observer.next, t);
    }
    error(t) {
        this.observer.error ? this.Sc(this.observer.error, t) : k("Uncaught Error in snapshot listener:", t.toString());
    }
    Dc() {
        this.muted = !0;
    }
    Sc(t, e) {
        this.muted || setTimeout((() => {
            this.muted || t(e);
        }), 0);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * A class representing a bundle.
 *
 * Takes a bundle stream or buffer, and presents abstractions to read bundled
 * elements out of the underlying content.
 */ class Sa {
    constructor(
    /** The reader to read from underlying binary bundle data source. */
    t, e) {
        this.Cc = t, this.serializer = e, 
        /** Cached bundle metadata. */
        this.metadata = new K, 
        /**
         * Internal buffer to hold bundle content, accumulating incomplete element
         * content.
         */
        this.buffer = new Uint8Array, this.xc = new TextDecoder("utf-8"), 
        // Read the metadata (which is the first element).
        this.Nc().then((t => {
            t && t.Qu() ? this.metadata.resolve(t.Gu.metadata) : this.metadata.reject(new Error(`The first element of the bundle is not a metadata, it is\n             ${JSON.stringify(null == t ? void 0 : t.Gu)}`));
        }), (t => this.metadata.reject(t)));
    }
    close() {
        return this.Cc.cancel();
    }
    async getMetadata() {
        return this.metadata.promise;
    }
    async bc() {
        // Makes sure metadata is read before proceeding.
        return await this.getMetadata(), this.Nc();
    }
    /**
     * Reads from the head of internal buffer, and pulling more data from
     * underlying stream if a complete element cannot be found, until an
     * element(including the prefixed length and the JSON string) is found.
     *
     * Once a complete element is read, it is dropped from internal buffer.
     *
     * Returns either the bundled element, or null if we have reached the end of
     * the stream.
     */    async Nc() {
        const t = await this.kc();
        if (null === t) return null;
        const e = this.xc.decode(t), n = Number(e);
        isNaN(n) && this.Mc(`length string (${e}) is not valid number`);
        const s = await this.$c(n);
        return new kc(JSON.parse(s), t.length + n);
    }
    /** First index of '{' from the underlying buffer. */    Oc() {
        return this.buffer.findIndex((t => t === "{".charCodeAt(0)));
    }
    /**
     * Reads from the beginning of the internal buffer, until the first '{', and
     * return the content.
     *
     * If reached end of the stream, returns a null.
     */    async kc() {
        for (;this.Oc() < 0; ) {
            if (await this.Fc()) break;
        }
        // Broke out of the loop because underlying stream is closed, and there
        // happens to be no more data to process.
                if (0 === this.buffer.length) return null;
        const t = this.Oc();
        // Broke out of the loop because underlying stream is closed, but still
        // cannot find an open bracket.
                t < 0 && this.Mc("Reached the end of bundle when a length string is expected.");
        const e = this.buffer.slice(0, t);
        // Update the internal buffer to drop the read length.
                return this.buffer = this.buffer.slice(t), e;
    }
    /**
     * Reads from a specified position from the internal buffer, for a specified
     * number of bytes, pulling more data from the underlying stream if needed.
     *
     * Returns a string decoded from the read bytes.
     */    async $c(t) {
        for (;this.buffer.length < t; ) {
            await this.Fc() && this.Mc("Reached the end of bundle when more is expected.");
        }
        const e = this.xc.decode(this.buffer.slice(0, t));
        // Update the internal buffer to drop the read json string.
                return this.buffer = this.buffer.slice(t), e;
    }
    Mc(t) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        throw this.Cc.cancel(), new Error(`Invalid bundle format: ${t}`);
    }
    /**
     * Pulls more data from underlying stream to internal buffer.
     * Returns a boolean indicating whether the stream is finished.
     */    async Fc() {
        const t = await this.Cc.read();
        if (!t.done) {
            const e = new Uint8Array(this.buffer.length + t.value.length);
            e.set(this.buffer), e.set(t.value, this.buffer.length), this.buffer = e;
        }
        return t.done;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * Internal transaction object responsible for accumulating the mutations to
 * perform and the base versions for any documents read.
 */
class Da {
    constructor(t) {
        this.datastore = t, 
        // The version of each document that was read during this transaction.
        this.readVersions = new Map, this.mutations = [], this.committed = !1, 
        /**
         * A deferred usage error that occurred previously in this transaction that
         * will cause the transaction to fail once it actually commits.
         */
        this.lastWriteError = null, 
        /**
         * Set of documents that have been written in the transaction.
         *
         * When there's more than one write to the same key in a transaction, any
         * writes after the first are handled differently.
         */
        this.writtenDocs = new Set;
    }
    async lookup(t) {
        if (this.ensureCommitNotCalled(), this.mutations.length > 0) throw new U(q.INVALID_ARGUMENT, "Firestore transactions require all reads to be executed before all writes.");
        const e = await async function(t, e) {
            const n = L(t), s = Li(n.serializer) + "/documents", i = {
                documents: e.map((t => $i(n.serializer, t)))
            }, r = await n.vo("BatchGetDocuments", s, i, e.length), o = new Map;
            r.forEach((t => {
                const e = Gi(n.serializer, t);
                o.set(e.key.toString(), e);
            }));
            const u = [];
            return e.forEach((t => {
                const e = o.get(t.toString());
                F(!!e), u.push(e);
            })), u;
        }(this.datastore, t);
        return e.forEach((t => this.recordVersion(t))), e;
    }
    set(t, e) {
        this.write(e.toMutation(t, this.precondition(t))), this.writtenDocs.add(t.toString());
    }
    update(t, e) {
        try {
            this.write(e.toMutation(t, this.preconditionForUpdate(t)));
        } catch (t) {
            this.lastWriteError = t;
        }
        this.writtenDocs.add(t.toString());
    }
    delete(t) {
        this.write(new Ys(t, this.precondition(t))), this.writtenDocs.add(t.toString());
    }
    async commit() {
        if (this.ensureCommitNotCalled(), this.lastWriteError) throw this.lastWriteError;
        const t = this.readVersions;
        // For each mutation, note that the doc was written.
                this.mutations.forEach((e => {
            t.delete(e.key.toString());
        })), 
        // For each document that was read but not written to, we want to perform
        // a `verify` operation.
        t.forEach(((t, e) => {
            const n = ht.fromPath(e);
            this.mutations.push(new Xs(n, this.precondition(n)));
        })), await async function(t, e) {
            const n = L(t), s = Li(n.serializer) + "/documents", i = {
                writes: e.map((t => ji(n.serializer, t)))
            };
            await n.Io("Commit", s, i);
        }(this.datastore, this.mutations), this.committed = !0;
    }
    recordVersion(t) {
        let e;
        if (t.isFoundDocument()) e = t.version; else {
            if (!t.isNoDocument()) throw O();
            // Represent a deleted doc using SnapshotVersion.min().
            e = rt.min();
        }
        const n = this.readVersions.get(t.key.toString());
        if (n) {
            if (!e.isEqual(n)) 
            // This transaction will fail no matter what.
            throw new U(q.ABORTED, "Document version changed between two reads.");
        } else this.readVersions.set(t.key.toString(), e);
    }
    /**
     * Returns the version of this document when it was read in this transaction,
     * as a precondition, or no precondition if it was not read.
     */    precondition(t) {
        const e = this.readVersions.get(t.toString());
        return !this.writtenDocs.has(t.toString()) && e ? e.isEqual(rt.min()) ? Fs.exists(!1) : Fs.updateTime(e) : Fs.none();
    }
    /**
     * Returns the precondition for a document if the operation is an update.
     */    preconditionForUpdate(t) {
        const e = this.readVersions.get(t.toString());
        // The first time a document is written, we want to take into account the
        // read time and existence
                if (!this.writtenDocs.has(t.toString()) && e) {
            if (e.isEqual(rt.min())) 
            // The document doesn't exist, so fail the transaction.
            // This has to be validated locally because you can't send a
            // precondition that a document does not exist without changing the
            // semantics of the backend write to be an insert. This is the reverse
            // of what we want, since we want to assert that the document doesn't
            // exist but then send the update and have it fail. Since we can't
            // express that to the backend, we have to validate locally.
            // Note: this can change once we can send separate verify writes in the
            // transaction.
            throw new U(q.INVALID_ARGUMENT, "Can't update a document that doesn't exist.");
            // Document exists, base precondition on document update time.
                        return Fs.updateTime(e);
        }
        // Document was not read, so we just use the preconditions for a blind
        // update.
        return Fs.exists(!0);
    }
    write(t) {
        this.ensureCommitNotCalled(), this.mutations.push(t);
    }
    ensureCommitNotCalled() {}
}

/**
 * @license
 * Copyright 2019 Google LLC
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
/**
 * TransactionRunner encapsulates the logic needed to run and retry transactions
 * with backoff.
 */ class Ca {
    constructor(t, e, n, s, i) {
        this.asyncQueue = t, this.datastore = e, this.options = n, this.updateFunction = s, 
        this.deferred = i, this.Bc = n.maxAttempts, this.qo = new Bu(this.asyncQueue, "transaction_retry" /* TimerId.TransactionRetry */);
    }
    /** Runs the transaction and sets the result on deferred. */    run() {
        this.Bc -= 1, this.Lc();
    }
    Lc() {
        this.qo.No((async () => {
            const t = new Da(this.datastore), e = this.qc(t);
            e && e.then((e => {
                this.asyncQueue.enqueueAndForget((() => t.commit().then((() => {
                    this.deferred.resolve(e);
                })).catch((t => {
                    this.Uc(t);
                }))));
            })).catch((t => {
                this.Uc(t);
            }));
        }));
    }
    qc(t) {
        try {
            const e = this.updateFunction(t);
            return !Ft(e) && e.catch && e.then ? e : (this.deferred.reject(Error("Transaction callback must return a Promise")), 
            null);
        } catch (t) {
            // Do not retry errors thrown by user provided updateFunction.
            return this.deferred.reject(t), null;
        }
    }
    Uc(t) {
        this.Bc > 0 && this.Kc(t) ? (this.Bc -= 1, this.asyncQueue.enqueueAndForget((() => (this.Lc(), 
        Promise.resolve())))) : this.deferred.reject(t);
    }
    Kc(t) {
        if ("FirebaseError" === t.name) {
            // In transactions, the backend will fail outdated reads with FAILED_PRECONDITION and
            // non-matching document versions with ABORTED. These errors should be retried.
            const e = t.code;
            return "aborted" === e || "failed-precondition" === e || "already-exists" === e || !oi(e);
        }
        return !1;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * FirestoreClient is a top-level class that constructs and owns all of the //
 * pieces of the client SDK architecture. It is responsible for creating the //
 * async queue that is shared by all of the other components in the system. //
 */
class xa {
    constructor(t, e, 
    /**
     * Asynchronous queue responsible for all of our internal processing. When
     * we get incoming work from the user (via public API) or the network
     * (incoming GRPC messages), we should always schedule onto this queue.
     * This ensures all of our work is properly serialized (e.g. we don't
     * start processing a new operation while the previous one is waiting for
     * an async I/O to complete).
     */
    n, s) {
        this.authCredentials = t, this.appCheckCredentials = e, this.asyncQueue = n, this.databaseInfo = s, 
        this.user = V.UNAUTHENTICATED, this.clientId = tt.A(), this.authCredentialListener = () => Promise.resolve(), 
        this.appCheckCredentialListener = () => Promise.resolve(), this.authCredentials.start(n, (async t => {
            N("FirestoreClient", "Received user=", t.uid), await this.authCredentialListener(t), 
            this.user = t;
        })), this.appCheckCredentials.start(n, (t => (N("FirestoreClient", "Received new app check token=", t), 
        this.appCheckCredentialListener(t, this.user))));
    }
    async getConfiguration() {
        return {
            asyncQueue: this.asyncQueue,
            databaseInfo: this.databaseInfo,
            clientId: this.clientId,
            authCredentials: this.authCredentials,
            appCheckCredentials: this.appCheckCredentials,
            initialUser: this.user,
            maxConcurrentLimboResolutions: 100
        };
    }
    setCredentialChangeListener(t) {
        this.authCredentialListener = t;
    }
    setAppCheckTokenChangeListener(t) {
        this.appCheckCredentialListener = t;
    }
    /**
     * Checks that the client has not been terminated. Ensures that other methods on //
     * this class cannot be called after the client is terminated. //
     */    verifyNotTerminated() {
        if (this.asyncQueue.isShuttingDown) throw new U(q.FAILED_PRECONDITION, "The client has already been terminated.");
    }
    terminate() {
        this.asyncQueue.enterRestrictedMode();
        const t = new K;
        return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async () => {
            try {
                this._onlineComponents && await this._onlineComponents.terminate(), this._offlineComponents && await this._offlineComponents.terminate(), 
                // The credentials provider must be terminated after shutting down the
                // RemoteStore as it will prevent the RemoteStore from retrieving auth
                // tokens.
                this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), t.resolve();
            } catch (e) {
                const n = Ec(e, "Failed to shutdown persistence");
                t.reject(n);
            }
        })), t.promise;
    }
}

async function Na(t, e) {
    t.asyncQueue.verifyOperationInProgress(), N("FirestoreClient", "Initializing OfflineComponentProvider");
    const n = await t.getConfiguration();
    await e.initialize(n);
    let s = n.initialUser;
    t.setCredentialChangeListener((async t => {
        s.isEqual(t) || (await iu(e.localStore, t), s = t);
    })), 
    // When a user calls clearPersistence() in one client, all other clients
    // need to be terminated to allow the delete to succeed.
    e.persistence.setDatabaseDeletedListener((() => t.terminate())), t._offlineComponents = e;
}

async function ka(t, e) {
    t.asyncQueue.verifyOperationInProgress();
    const n = await $a(t);
    N("FirestoreClient", "Initializing OnlineComponentProvider");
    const s = await t.getConfiguration();
    await e.initialize(n, s), 
    // The CredentialChangeListener of the online component provider takes
    // precedence over the offline component provider.
    t.setCredentialChangeListener((t => gc(e.remoteStore, t))), t.setAppCheckTokenChangeListener(((t, n) => gc(e.remoteStore, n))), 
    t._onlineComponents = e;
}

/**
 * Decides whether the provided error allows us to gracefully disable
 * persistence (as opposed to crashing the client).
 */ function Ma(t) {
    return "FirebaseError" === t.name ? t.code === q.FAILED_PRECONDITION || t.code === q.UNIMPLEMENTED : !("undefined" != typeof DOMException && t instanceof DOMException) || (
    // When the browser is out of quota we could get either quota exceeded
    // or an aborted error depending on whether the error happened during
    // schema migration.
    22 === t.code || 20 === t.code || 
    // Firefox Private Browsing mode disables IndexedDb and returns
    // INVALID_STATE for any usage.
    11 === t.code);
}

async function $a(t) {
    if (!t._offlineComponents) if (t._uninitializedComponentsProvider) {
        N("FirestoreClient", "Using user provided OfflineComponentProvider");
        try {
            await Na(t, t._uninitializedComponentsProvider._offline);
        } catch (e) {
            const n = e;
            if (!Ma(n)) throw n;
            M("Error using user provided cache. Falling back to memory cache: " + n), await Na(t, new Ea);
        }
    } else N("FirestoreClient", "Using default OfflineComponentProvider"), await Na(t, new Ea);
    return t._offlineComponents;
}

async function Oa(t) {
    return t._onlineComponents || (t._uninitializedComponentsProvider ? (N("FirestoreClient", "Using user provided OnlineComponentProvider"), 
    await ka(t, t._uninitializedComponentsProvider._online)) : (N("FirestoreClient", "Using default OnlineComponentProvider"), 
    await ka(t, new Pa))), t._onlineComponents;
}

function Fa(t) {
    return $a(t).then((t => t.persistence));
}

function Ba(t) {
    return $a(t).then((t => t.localStore));
}

function La(t) {
    return Oa(t).then((t => t.remoteStore));
}

function qa(t) {
    return Oa(t).then((t => t.syncEngine));
}

function Ua(t) {
    return Oa(t).then((t => t.datastore));
}

async function Ka(t) {
    const e = await Oa(t), n = e.eventManager;
    return n.onListen = Gc.bind(null, e.syncEngine), n.onUnlisten = jc.bind(null, e.syncEngine), 
    n;
}

/** Enables the network connection and re-enqueues all pending operations. */ function Ga(t) {
    return t.asyncQueue.enqueue((async () => {
        const e = await Fa(t), n = await La(t);
        return e.setNetworkEnabled(!0), function(t) {
            const e = L(t);
            return e.vu.delete(0 /* OfflineCause.UserDisabled */), zu(e);
        }(n);
    }));
}

/** Disables the network connection. Pending operations will not complete. */ function Qa(t) {
    return t.asyncQueue.enqueue((async () => {
        const e = await Fa(t), n = await La(t);
        return e.setNetworkEnabled(!1), async function(t) {
            const e = L(t);
            e.vu.add(0 /* OfflineCause.UserDisabled */), await Wu(e), 
            // Set the OnlineState to Offline so get()s return from cache, etc.
            e.bu.set("Offline" /* OnlineState.Offline */);
        }(n);
    }));
}

/**
 * Returns a Promise that resolves when all writes that were pending at the time
 * this method was called received server acknowledgement. An acknowledgement
 * can be either acceptance or rejection.
 */ function ja(t, e) {
    const n = new K;
    return t.asyncQueue.enqueueAndForget((async () => async function(t, e, n) {
        try {
            const s = await function(t, e) {
                const n = L(t);
                return n.persistence.runTransaction("read document", "readonly", (t => n.localDocuments.getDocument(t, e)));
            }(t, e);
            s.isFoundDocument() ? n.resolve(s) : s.isNoDocument() ? n.resolve(null) : n.reject(new U(q.UNAVAILABLE, "Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)"));
        } catch (t) {
            const s = Ec(t, `Failed to get document '${e} from cache`);
            n.reject(s);
        }
    }
    /**
 * Retrieves a latency-compensated document from the backend via a
 * SnapshotListener.
 */ (await Ba(t), e, n))), n.promise;
}

function za(t, e, n = {}) {
    const s = new K;
    return t.asyncQueue.enqueueAndForget((async () => function(t, e, n, s, i) {
        const r = new Va({
            next: r => {
                // Remove query first before passing event to user to avoid
                // user actions affecting the now stale query.
                e.enqueueAndForget((() => Sc(t, o)));
                const u = r.docs.has(n);
                !u && r.fromCache ? 
                // TODO(dimond): If we're online and the document doesn't
                // exist then we resolve with a doc.exists set to false. If
                // we're offline however, we reject the Promise in this
                // case. Two options: 1) Cache the negative response from
                // the server so we can deliver that even when you're
                // offline 2) Actually reject the Promise in the online case
                // if the document doesn't exist.
                i.reject(new U(q.UNAVAILABLE, "Failed to get document because the client is offline.")) : u && r.fromCache && s && "server" === s.source ? i.reject(new U(q.UNAVAILABLE, 'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')) : i.resolve(r);
            },
            error: t => i.reject(t)
        }), o = new Nc(Gn(n.path), r, {
            includeMetadataChanges: !0,
            Ku: !0
        });
        return Vc(t, o);
    }(await Ka(t), t.asyncQueue, e, n, s))), s.promise;
}

function Wa(t, e) {
    const n = new K;
    return t.asyncQueue.enqueueAndForget((async () => async function(t, e, n) {
        try {
            const s = await fu(t, e, 
            /* usePreviousResults= */ !0), i = new Lc(e, s.ir), r = i.sc(s.documents), o = i.applyChanges(r, 
            /* updateLimboDocuments= */ !1);
            n.resolve(o.snapshot);
        } catch (t) {
            const s = Ec(t, `Failed to execute query '${e} against cache`);
            n.reject(s);
        }
    }
    /**
 * Retrieves a latency-compensated query snapshot from the backend via a
 * SnapshotListener.
 */ (await Ba(t), e, n))), n.promise;
}

function Ha(t, e, n = {}) {
    const s = new K;
    return t.asyncQueue.enqueueAndForget((async () => function(t, e, n, s, i) {
        const r = new Va({
            next: n => {
                // Remove query first before passing event to user to avoid
                // user actions affecting the now stale query.
                e.enqueueAndForget((() => Sc(t, o))), n.fromCache && "server" === s.source ? i.reject(new U(q.UNAVAILABLE, 'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')) : i.resolve(n);
            },
            error: t => i.reject(t)
        }), o = new Nc(n, r, {
            includeMetadataChanges: !0,
            Ku: !0
        });
        return Vc(t, o);
    }(await Ka(t), t.asyncQueue, e, n, s))), s.promise;
}

function Ja(t, e) {
    const n = new Va(e);
    return t.asyncQueue.enqueueAndForget((async () => function(t, e) {
        L(t).ku.add(e), 
        // Immediately fire an initial event, indicating all existing listeners
        // are in-sync.
        e.next();
    }(await Ka(t), n))), () => {
        n.Dc(), t.asyncQueue.enqueueAndForget((async () => function(t, e) {
            L(t).ku.delete(e);
        }(await Ka(t), n)));
    };
}

/**
 * Takes an updateFunction in which a set of reads and writes can be performed
 * atomically. In the updateFunction, the client can read and write values
 * using the supplied transaction object. After the updateFunction, all
 * changes will be committed. If a retryable error occurs (ex: some other
 * client has changed any of the data referenced), then the updateFunction
 * will be called again after a backoff. If the updateFunction still fails
 * after all retries, then the transaction will be rejected.
 *
 * The transaction object passed to the updateFunction contains methods for
 * accessing documents and collections. Unlike other datastore access, data
 * accessed with the transaction will not reflect local changes that have not
 * been committed. For this reason, it is required that all reads are
 * performed before any writes. Transactions must be performed while online.
 */ function Ya(t, e, n, s) {
    const i = function(t, e) {
        let n;
        n = "string" == typeof t ? hi().encode(t) : t;
        return function(t, e) {
            return new Sa(t, e);
        }(function(t, e) {
            if (t instanceof Uint8Array) return ba(t, e);
            if (t instanceof ArrayBuffer) return ba(new Uint8Array(t), e);
            if (t instanceof ReadableStream) return t.getReader();
            throw new Error("Source of `toByteStreamReader` has to be a ArrayBuffer or ReadableStream");
        }(n), e);
    }(n, Fu(e));
    t.asyncQueue.enqueueAndForget((async () => {
        Ta(await qa(t), i, s);
    }));
}

function Xa(t, e) {
    return t.asyncQueue.enqueue((async () => function(t, e) {
        const n = L(t);
        return n.persistence.runTransaction("Get named query", "readonly", (t => n.qs.getNamedQuery(t, e)));
    }(await Ba(t), e)));
}

function Za(t, e) {
    return t.asyncQueue.enqueue((async () => async function(t, e) {
        const n = L(t), s = n.indexManager, i = [];
        return n.persistence.runTransaction("Configure indexes", "readwrite", (t => s.getFieldIndexes(t).next((n => 
        /**
 * @license
 * Copyright 2017 Google LLC
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
        /**
 * Compares two array for equality using comparator. The method computes the
 * intersection and invokes `onAdd` for every element that is in `after` but not
 * `before`. `onRemove` is invoked for every element in `before` but missing
 * from `after`.
 *
 * The method creates a copy of both `before` and `after` and runs in O(n log
 * n), where n is the size of the two lists.
 *
 * @param before - The elements that exist in the original array.
 * @param after - The elements to diff against the original array.
 * @param comparator - The comparator for the elements in before and after.
 * @param onAdd - A function to invoke for every element that is part of `
 * after` but not `before`.
 * @param onRemove - A function to invoke for every element that is part of
 * `before` but not `after`.
 */
        function(t, e, n, s, i) {
            t = [ ...t ], e = [ ...e ], t.sort(n), e.sort(n);
            const r = t.length, o = e.length;
            let u = 0, c = 0;
            for (;u < o && c < r; ) {
                const r = n(t[c], e[u]);
                r < 0 ? 
                // The element was removed if the next element in our ordered
                // walkthrough is only in `before`.
                i(t[c++]) : r > 0 ? 
                // The element was added if the next element in our ordered walkthrough
                // is only in `after`.
                s(e[u++]) : (u++, c++);
            }
            for (;u < o; ) s(e[u++]);
            for (;c < r; ) i(t[c++]);
        }(n, e, wt, (e => {
            i.push(s.addFieldIndex(t, e));
        }), (e => {
            i.push(s.deleteFieldIndex(t, e));
        })))).next((() => Rt.waitFor(i)))));
    }
    /**
 * @license
 * Copyright 2019 Google LLC
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
    // The format of the LocalStorage key that stores the client state is:
    //     firestore_clients_<persistence_prefix>_<instance_key>
    (await Ba(t), e)));
}

/**
 * @license
 * Copyright 2023 Google LLC
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
/**
 * Compares two `ExperimentalLongPollingOptions` objects for equality.
 */
/**
 * Creates and returns a new `ExperimentalLongPollingOptions` with the same
 * option values as the given instance.
 */
function th(t) {
    const e = {};
    return void 0 !== t.timeoutSeconds && (e.timeoutSeconds = t.timeoutSeconds), e;
}

/**
 * @license
 * Copyright 2020 Google LLC
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
 */ const eh = new Map;

/**
 * An instance map that ensures only one Datastore exists per Firestore
 * instance.
 */
/**
 * @license
 * Copyright 2017 Google LLC
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
function nh(t, e, n) {
    if (!n) throw new U(q.INVALID_ARGUMENT, `Function ${t}() cannot be called with an empty ${e}.`);
}

/**
 * Validates that two boolean options are not set at the same time.
 * @internal
 */ function sh(t, e, n, s) {
    if (!0 === e && !0 === s) throw new U(q.INVALID_ARGUMENT, `${t} and ${n} cannot be used together.`);
}

/**
 * Validates that `path` refers to a document (indicated by the fact it contains
 * an even numbers of segments).
 */ function ih(t) {
    if (!ht.isDocumentKey(t)) throw new U(q.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`);
}

/**
 * Validates that `path` refers to a collection (indicated by the fact it
 * contains an odd numbers of segments).
 */ function rh(t) {
    if (ht.isDocumentKey(t)) throw new U(q.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`);
}

/**
 * Returns true if it's a non-null object without a custom prototype
 * (i.e. excludes Array, Date, etc.).
 */
/** Returns a string describing the type / value of the provided input. */
function oh(t) {
    if (void 0 === t) return "undefined";
    if (null === t) return "null";
    if ("string" == typeof t) return t.length > 20 && (t = `${t.substring(0, 20)}...`), 
    JSON.stringify(t);
    if ("number" == typeof t || "boolean" == typeof t) return "" + t;
    if ("object" == typeof t) {
        if (t instanceof Array) return "an array";
        {
            const e = 
            /** try to get the constructor name for an object. */
            function(t) {
                if (t.constructor) return t.constructor.name;
                return null;
            }
            /**
 * Casts `obj` to `T`, optionally unwrapping Compat types to expose the
 * underlying instance. Throws if  `obj` is not an instance of `T`.
 *
 * This cast is used in the Lite and Full SDK to verify instance types for
 * arguments passed to the public API.
 * @internal
 */ (t);
            return e ? `a custom ${e} object` : "an object";
        }
    }
    return "function" == typeof t ? "a function" : O();
}

function uh(t, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
e) {
    if ("_delegate" in t && (
    // Unwrap Compat types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t = t._delegate), !(t instanceof e)) {
        if (e.name === t.constructor.name) throw new U(q.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
        {
            const n = oh(t);
            throw new U(q.INVALID_ARGUMENT, `Expected type '${e.name}', but it was: ${n}`);
        }
    }
    return t;
}

function ch(t, e) {
    if (e <= 0) throw new U(q.INVALID_ARGUMENT, `Function ${t}() requires a positive number, but it was: ${e}.`);
}

/**
 * @license
 * Copyright 2020 Google LLC
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
// settings() defaults:
/**
 * A concrete type describing all the values that can be applied via a
 * user-supplied `FirestoreSettings` object. This is a separate type so that
 * defaults can be supplied and the value can be checked for equality.
 */
class ah {
    constructor(t) {
        var e, n;
        if (void 0 === t.host) {
            if (void 0 !== t.ssl) throw new U(q.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
            this.host = "firestore.googleapis.com", this.ssl = true;
        } else this.host = t.host, this.ssl = null === (e = t.ssl) || void 0 === e || e;
        if (this.credentials = t.credentials, this.ignoreUndefinedProperties = !!t.ignoreUndefinedProperties, 
        this.cache = t.localCache, void 0 === t.cacheSizeBytes) this.cacheSizeBytes = 41943040; else {
            if (-1 !== t.cacheSizeBytes && t.cacheSizeBytes < 1048576) throw new U(q.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
            this.cacheSizeBytes = t.cacheSizeBytes;
        }
        sh("experimentalForceLongPolling", t.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", t.experimentalAutoDetectLongPolling), 
        this.experimentalForceLongPolling = !!t.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = !1 : void 0 === t.experimentalAutoDetectLongPolling ? this.experimentalAutoDetectLongPolling = true : 
        // For backwards compatibility, coerce the value to boolean even though
        // the TypeScript compiler has narrowed the type to boolean already.
        // noinspection PointlessBooleanExpressionJS
        this.experimentalAutoDetectLongPolling = !!t.experimentalAutoDetectLongPolling, 
        this.experimentalLongPollingOptions = th(null !== (n = t.experimentalLongPollingOptions) && void 0 !== n ? n : {}), 
        function(t) {
            if (void 0 !== t.timeoutSeconds) {
                if (isNaN(t.timeoutSeconds)) throw new U(q.INVALID_ARGUMENT, `invalid long polling timeout: ${t.timeoutSeconds} (must not be NaN)`);
                if (t.timeoutSeconds < 5) throw new U(q.INVALID_ARGUMENT, `invalid long polling timeout: ${t.timeoutSeconds} (minimum allowed value is 5)`);
                if (t.timeoutSeconds > 30) throw new U(q.INVALID_ARGUMENT, `invalid long polling timeout: ${t.timeoutSeconds} (maximum allowed value is 30)`);
            }
        }
        /**
 * @license
 * Copyright 2020 Google LLC
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
        /**
 * The Cloud Firestore service interface.
 *
 * Do not call this constructor directly. Instead, use {@link (getFirestore:1)}.
 */ (this.experimentalLongPollingOptions), this.useFetchStreams = !!t.useFetchStreams;
    }
    isEqual(t) {
        return this.host === t.host && this.ssl === t.ssl && this.credentials === t.credentials && this.cacheSizeBytes === t.cacheSizeBytes && this.experimentalForceLongPolling === t.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === t.experimentalAutoDetectLongPolling && (e = this.experimentalLongPollingOptions, 
        n = t.experimentalLongPollingOptions, e.timeoutSeconds === n.timeoutSeconds) && this.ignoreUndefinedProperties === t.ignoreUndefinedProperties && this.useFetchStreams === t.useFetchStreams;
        var e, n;
    }
}

class hh {
    /** @hideconstructor */
    constructor(t, e, n, s) {
        this._authCredentials = t, this._appCheckCredentials = e, this._databaseId = n, 
        this._app = s, 
        /**
         * Whether it's a Firestore or Firestore Lite instance.
         */
        this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new ah({}), 
        this._settingsFrozen = !1;
    }
    /**
     * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
     * instance.
     */    get app() {
        if (!this._app) throw new U(q.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
        return this._app;
    }
    get _initialized() {
        return this._settingsFrozen;
    }
    get _terminated() {
        return void 0 !== this._terminateTask;
    }
    _setSettings(t) {
        if (this._settingsFrozen) throw new U(q.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
        this._settings = new ah(t), void 0 !== t.credentials && (this._authCredentials = function(t) {
            if (!t) return new Q;
            switch (t.type) {
              case "firstParty":
                return new H(t.sessionIndex || "0", t.iamToken || null, t.authTokenFactory || null);

              case "provider":
                return t.client;

              default:
                throw new U(q.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
            }
        }(t.credentials));
    }
    _getSettings() {
        return this._settings;
    }
    _freezeSettings() {
        return this._settingsFrozen = !0, this._settings;
    }
    _delete() {
        return this._terminateTask || (this._terminateTask = this._terminate()), this._terminateTask;
    }
    /** Returns a JSON-serializable representation of this `Firestore` instance. */    toJSON() {
        return {
            app: this._app,
            databaseId: this._databaseId,
            settings: this._settings
        };
    }
    /**
     * Terminates all components used by this client. Subclasses can override
     * this method to clean up their own dependencies, but must also call this
     * method.
     *
     * Only ever called once.
     */    _terminate() {
        /**
 * Removes all components associated with the provided instance. Must be called
 * when the `Firestore` instance is terminated.
 */
        return function(t) {
            const e = eh.get(t);
            e && (N("ComponentProvider", "Removing Datastore"), eh.delete(t), e.terminate());
        }(this), Promise.resolve();
    }
}

/**
 * Modify this instance to communicate with the Cloud Firestore emulator.
 *
 * Note: This must be called before this instance has been used to do any
 * operations.
 *
 * @param firestore - The `Firestore` instance to configure to connect to the
 * emulator.
 * @param host - the emulator host (ex: localhost).
 * @param port - the emulator port (ex: 9000).
 * @param options.mockUserToken - the mock auth token to use for unit testing
 * Security Rules.
 */ function lh(t, e, n, s = {}) {
    var i;
    const r = (t = uh(t, hh))._getSettings(), o = `${e}:${n}`;
    if ("firestore.googleapis.com" !== r.host && r.host !== o && M("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."), 
    t._setSettings(Object.assign(Object.assign({}, r), {
        host: o,
        ssl: !1
    })), s.mockUserToken) {
        let e, n;
        if ("string" == typeof s.mockUserToken) e = s.mockUserToken, n = V.MOCK_USER; else {
            // Let createMockUserToken validate first (catches common mistakes like
            // invalid field "uid" and missing field "sub" / "user_id".)
            e = util.createMockUserToken(s.mockUserToken, null === (i = t._app) || void 0 === i ? void 0 : i.options.projectId);
            const r = s.mockUserToken.sub || s.mockUserToken.user_id;
            if (!r) throw new U(q.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
            n = new V(r);
        }
        t._authCredentials = new j(new G(e, n));
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * A `DocumentReference` refers to a document location in a Firestore database
 * and can be used to write, read, or listen to the location. The document at
 * the referenced location may or may not exist.
 */ class fh {
    /** @hideconstructor */
    constructor(t, 
    /**
     * If provided, the `FirestoreDataConverter` associated with this instance.
     */
    e, n) {
        this.converter = e, this._key = n, 
        /** The type of this Firestore reference. */
        this.type = "document", this.firestore = t;
    }
    get _path() {
        return this._key.path;
    }
    /**
     * The document's identifier within its collection.
     */    get id() {
        return this._key.path.lastSegment();
    }
    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     */    get path() {
        return this._key.path.canonicalString();
    }
    /**
     * The collection this `DocumentReference` belongs to.
     */    get parent() {
        return new wh(this.firestore, this.converter, this._key.path.popLast());
    }
    withConverter(t) {
        return new fh(this.firestore, t, this._key);
    }
}

/**
 * A `Query` refers to a query which you can read or listen to. You can also
 * construct refined `Query` objects by adding filters and ordering.
 */ class dh {
    // This is the lite version of the Query class in the main SDK.
    /** @hideconstructor protected */
    constructor(t, 
    /**
     * If provided, the `FirestoreDataConverter` associated with this instance.
     */
    e, n) {
        this.converter = e, this._query = n, 
        /** The type of this Firestore reference. */
        this.type = "query", this.firestore = t;
    }
    withConverter(t) {
        return new dh(this.firestore, t, this._query);
    }
}

/**
 * A `CollectionReference` object can be used for adding documents, getting
 * document references, and querying for documents (using {@link (query:1)}).
 */ class wh extends dh {
    /** @hideconstructor */
    constructor(t, e, n) {
        super(t, e, Gn(n)), this._path = n, 
        /** The type of this Firestore reference. */
        this.type = "collection";
    }
    /** The collection's identifier. */    get id() {
        return this._query.path.lastSegment();
    }
    /**
     * A string representing the path of the referenced collection (relative
     * to the root of the database).
     */    get path() {
        return this._query.path.canonicalString();
    }
    /**
     * A reference to the containing `DocumentReference` if this is a
     * subcollection. If this isn't a subcollection, the reference is null.
     */    get parent() {
        const t = this._path.popLast();
        return t.isEmpty() ? null : new fh(this.firestore, 
        /* converter= */ null, new ht(t));
    }
    withConverter(t) {
        return new wh(this.firestore, t, this._path);
    }
}

function _h(t, e, ...n) {
    if (t = util.getModularInstance(t), nh("collection", "path", e), t instanceof hh) {
        const s = ut.fromString(e, ...n);
        return rh(s), new wh(t, /* converter= */ null, s);
    }
    {
        if (!(t instanceof fh || t instanceof wh)) throw new U(q.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
        const s = t._path.child(ut.fromString(e, ...n));
        return rh(s), new wh(t.firestore, 
        /* converter= */ null, s);
    }
}

// TODO(firestorelite): Consider using ErrorFactory -
// https://github.com/firebase/firebase-js-sdk/blob/0131e1f/packages/util/src/errors.ts#L106
/**
 * Creates and returns a new `Query` instance that includes all documents in the
 * database that are contained in a collection or subcollection with the
 * given `collectionId`.
 *
 * @param firestore - A reference to the root `Firestore` instance.
 * @param collectionId - Identifies the collections to query over. Every
 * collection or subcollection with this ID as the last segment of its path
 * will be included. Cannot contain a slash.
 * @returns The created `Query`.
 */ function mh(t, e) {
    if (t = uh(t, hh), nh("collectionGroup", "collection id", e), e.indexOf("/") >= 0) throw new U(q.INVALID_ARGUMENT, `Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);
    return new dh(t, 
    /* converter= */ null, function(t) {
        return new Un(ut.emptyPath(), t);
    }(e));
}

function gh(t, e, ...n) {
    if (t = util.getModularInstance(t), 
    // We allow omission of 'pathString' but explicitly prohibit passing in both
    // 'undefined' and 'null'.
    1 === arguments.length && (e = tt.A()), nh("doc", "path", e), t instanceof hh) {
        const s = ut.fromString(e, ...n);
        return ih(s), new fh(t, 
        /* converter= */ null, new ht(s));
    }
    {
        if (!(t instanceof fh || t instanceof wh)) throw new U(q.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
        const s = t._path.child(ut.fromString(e, ...n));
        return ih(s), new fh(t.firestore, t instanceof wh ? t.converter : null, new ht(s));
    }
}

/**
 * Returns true if the provided references are equal.
 *
 * @param left - A reference to compare.
 * @param right - A reference to compare.
 * @returns true if the references point to the same location in the same
 * Firestore database.
 */ function yh(t, e) {
    return t = util.getModularInstance(t), e = util.getModularInstance(e), (t instanceof fh || t instanceof wh) && (e instanceof fh || e instanceof wh) && (t.firestore === e.firestore && t.path === e.path && t.converter === e.converter);
}

/**
 * Returns true if the provided queries point to the same collection and apply
 * the same constraints.
 *
 * @param left - A `Query` to compare.
 * @param right - A `Query` to compare.
 * @returns true if the references point to the same location in the same
 * Firestore database.
 */ function ph(t, e) {
    return t = util.getModularInstance(t), e = util.getModularInstance(e), t instanceof dh && e instanceof dh && (t.firestore === e.firestore && Zn(t._query, e._query) && t.converter === e.converter);
}

/**
 * @license
 * Copyright 2020 Google LLC
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
 */ class Ih {
    constructor() {
        // The last promise in the queue.
        this.Gc = Promise.resolve(), 
        // A list of retryable operations. Retryable operations are run in order and
        // retried with backoff.
        this.Qc = [], 
        // Is this AsyncQueue being shut down? Once it is set to true, it will not
        // be changed again.
        this.jc = !1, 
        // Operations scheduled to be queued in the future. Operations are
        // automatically removed after they are run or canceled.
        this.zc = [], 
        // visible for testing
        this.Wc = null, 
        // Flag set while there's an outstanding AsyncQueue operation, used for
        // assertion sanity-checks.
        this.Hc = !1, 
        // Enabled during shutdown on Safari to prevent future access to IndexedDB.
        this.Jc = !1, 
        // List of TimerIds to fast-forward delays for.
        this.Yc = [], 
        // Backoff timer used to schedule retries for retryable operations
        this.qo = new Bu(this, "async_queue_retry" /* TimerId.AsyncQueueRetry */), 
        // Visibility handler that triggers an immediate retry of all retryable
        // operations. Meant to speed up recovery when we regain file system access
        // after page comes into foreground.
        this.Xc = () => {
            const t = Ou();
            t && N("AsyncQueue", "Visibility state changed to " + t.visibilityState), this.qo.Mo();
        };
        const t = Ou();
        t && "function" == typeof t.addEventListener && t.addEventListener("visibilitychange", this.Xc);
    }
    get isShuttingDown() {
        return this.jc;
    }
    /**
     * Adds a new operation to the queue without waiting for it to complete (i.e.
     * we ignore the Promise result).
     */    enqueueAndForget(t) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.enqueue(t);
    }
    enqueueAndForgetEvenWhileRestricted(t) {
        this.Zc(), 
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.ta(t);
    }
    enterRestrictedMode(t) {
        if (!this.jc) {
            this.jc = !0, this.Jc = t || !1;
            const e = Ou();
            e && "function" == typeof e.removeEventListener && e.removeEventListener("visibilitychange", this.Xc);
        }
    }
    enqueue(t) {
        if (this.Zc(), this.jc) 
        // Return a Promise which never resolves.
        return new Promise((() => {}));
        // Create a deferred Promise that we can return to the callee. This
        // allows us to return a "hanging Promise" only to the callee and still
        // advance the queue even when the operation is not run.
                const e = new K;
        return this.ta((() => this.jc && this.Jc ? Promise.resolve() : (t().then(e.resolve, e.reject), 
        e.promise))).then((() => e.promise));
    }
    enqueueRetryable(t) {
        this.enqueueAndForget((() => (this.Qc.push(t), this.ea())));
    }
    /**
     * Runs the next operation from the retryable queue. If the operation fails,
     * reschedules with backoff.
     */    async ea() {
        if (0 !== this.Qc.length) {
            try {
                await this.Qc[0](), this.Qc.shift(), this.qo.reset();
            } catch (t) {
                if (!Dt(t)) throw t;
 // Failure will be handled by AsyncQueue
                                N("AsyncQueue", "Operation failed with retryable error: " + t);
            }
            this.Qc.length > 0 && 
            // If there are additional operations, we re-schedule `retryNextOp()`.
            // This is necessary to run retryable operations that failed during
            // their initial attempt since we don't know whether they are already
            // enqueued. If, for example, `op1`, `op2`, `op3` are enqueued and `op1`
            // needs to  be re-run, we will run `op1`, `op1`, `op2` using the
            // already enqueued calls to `retryNextOp()`. `op3()` will then run in the
            // call scheduled here.
            // Since `backoffAndRun()` cancels an existing backoff and schedules a
            // new backoff on every call, there is only ever a single additional
            // operation in the queue.
            this.qo.No((() => this.ea()));
        }
    }
    ta(t) {
        const e = this.Gc.then((() => (this.Hc = !0, t().catch((t => {
            this.Wc = t, this.Hc = !1;
            const e = 
            /**
 * Chrome includes Error.message in Error.stack. Other browsers do not.
 * This returns expected output of message + stack when available.
 * @param error - Error or FirestoreError
 */
            function(t) {
                let e = t.message || "";
                t.stack && (e = t.stack.includes(t.message) ? t.stack : t.message + "\n" + t.stack);
                return e;
            }
            /**
 * @license
 * Copyright 2017 Google LLC
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
 */ (t);
            // Re-throw the error so that this.tail becomes a rejected Promise and
            // all further attempts to chain (via .then) will just short-circuit
            // and return the rejected Promise.
            throw k("INTERNAL UNHANDLED ERROR: ", e), t;
        })).then((t => (this.Hc = !1, t))))));
        return this.Gc = e, e;
    }
    enqueueAfterDelay(t, e, n) {
        this.Zc(), 
        // Fast-forward delays for timerIds that have been overriden.
        this.Yc.indexOf(t) > -1 && (e = 0);
        const s = Tc.createAndSchedule(this, t, e, n, (t => this.na(t)));
        return this.zc.push(s), s;
    }
    Zc() {
        this.Wc && O();
    }
    verifyOperationInProgress() {}
    /**
     * Waits until all currently queued tasks are finished executing. Delayed
     * operations are not run.
     */    async sa() {
        // Operations in the queue prior to draining may have enqueued additional
        // operations. Keep draining the queue until the tail is no longer advanced,
        // which indicates that no more new operations were enqueued and that all
        // operations were executed.
        let t;
        do {
            t = this.Gc, await t;
        } while (t !== this.Gc);
    }
    /**
     * For Tests: Determine if a delayed operation with a particular TimerId
     * exists.
     */    ia(t) {
        for (const e of this.zc) if (e.timerId === t) return !0;
        return !1;
    }
    /**
     * For Tests: Runs some or all delayed operations early.
     *
     * @param lastTimerId - Delayed operations up to and including this TimerId
     * will be drained. Pass TimerId.All to run all delayed operations.
     * @returns a Promise that resolves once all operations have been run.
     */    ra(t) {
        // Note that draining may generate more delayed ops, so we do that first.
        return this.sa().then((() => {
            // Run ops in the same order they'd run if they ran naturally.
            this.zc.sort(((t, e) => t.targetTimeMs - e.targetTimeMs));
            for (const e of this.zc) if (e.skipDelay(), "all" /* TimerId.All */ !== t && e.timerId === t) break;
            return this.sa();
        }));
    }
    /**
     * For Tests: Skip all subsequent delays for a timer id.
     */    oa(t) {
        this.Yc.push(t);
    }
    /** Called once a DelayedOperation is run or canceled. */    na(t) {
        // NOTE: indexOf / slice are O(n), but delayedOperations is expected to be small.
        const e = this.zc.indexOf(t);
        this.zc.splice(e, 1);
    }
}

function Th(t) {
    /**
 * Returns true if obj is an object and contains at least one of the specified
 * methods.
 */
    return function(t, e) {
        if ("object" != typeof t || null === t) return !1;
        const n = t;
        for (const t of e) if (t in n && "function" == typeof n[t]) return !0;
        return !1;
    }
    /**
 * @license
 * Copyright 2020 Google LLC
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
    /**
 * Represents the task of loading a Firestore bundle. It provides progress of bundle
 * loading, as well as task completion and error events.
 *
 * The API is compatible with `Promise<LoadBundleTaskProgress>`.
 */ (t, [ "next", "error", "complete" ]);
}

class Eh {
    constructor() {
        this._progressObserver = {}, this._taskCompletionResolver = new K, this._lastProgress = {
            taskState: "Running",
            totalBytes: 0,
            totalDocuments: 0,
            bytesLoaded: 0,
            documentsLoaded: 0
        };
    }
    /**
     * Registers functions to listen to bundle loading progress events.
     * @param next - Called when there is a progress update from bundle loading. Typically `next` calls occur
     *   each time a Firestore document is loaded from the bundle.
     * @param error - Called when an error occurs during bundle loading. The task aborts after reporting the
     *   error, and there should be no more updates after this.
     * @param complete - Called when the loading task is complete.
     */    onProgress(t, e, n) {
        this._progressObserver = {
            next: t,
            error: e,
            complete: n
        };
    }
    /**
     * Implements the `Promise<LoadBundleTaskProgress>.catch` interface.
     *
     * @param onRejected - Called when an error occurs during bundle loading.
     */    catch(t) {
        return this._taskCompletionResolver.promise.catch(t);
    }
    /**
     * Implements the `Promise<LoadBundleTaskProgress>.then` interface.
     *
     * @param onFulfilled - Called on the completion of the loading task with a final `LoadBundleTaskProgress` update.
     *   The update will always have its `taskState` set to `"Success"`.
     * @param onRejected - Called when an error occurs during bundle loading.
     */    then(t, e) {
        return this._taskCompletionResolver.promise.then(t, e);
    }
    /**
     * Notifies all observers that bundle loading has completed, with a provided
     * `LoadBundleTaskProgress` object.
     *
     * @private
     */    _completeWith(t) {
        this._updateProgress(t), this._progressObserver.complete && this._progressObserver.complete(), 
        this._taskCompletionResolver.resolve(t);
    }
    /**
     * Notifies all observers that bundle loading has failed, with a provided
     * `Error` as the reason.
     *
     * @private
     */    _failWith(t) {
        this._lastProgress.taskState = "Error", this._progressObserver.next && this._progressObserver.next(this._lastProgress), 
        this._progressObserver.error && this._progressObserver.error(t), this._taskCompletionResolver.reject(t);
    }
    /**
     * Notifies a progress update of loading a bundle.
     * @param progress - The new progress.
     *
     * @private
     */    _updateProgress(t) {
        this._lastProgress = t, this._progressObserver.next && this._progressObserver.next(t);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Constant used to indicate the LRU garbage collection should be disabled.
 * Set this value as the `cacheSizeBytes` on the settings passed to the
 * {@link Firestore} instance.
 */ const Ah = -1;

/**
 * The Cloud Firestore service interface.
 *
 * Do not call this constructor directly. Instead, use {@link (getFirestore:1)}.
 */ class vh extends hh {
    /** @hideconstructor */
    constructor(t, e, n, s) {
        super(t, e, n, s), 
        /**
         * Whether it's a {@link Firestore} or Firestore Lite instance.
         */
        this.type = "firestore", this._queue = new Ih, this._persistenceKey = (null == s ? void 0 : s.name) || "[DEFAULT]";
    }
    _terminate() {
        return this._firestoreClient || 
        // The client must be initialized to ensure that all subsequent API
        // usage throws an exception.
        Vh(this), this._firestoreClient.terminate();
    }
}

/**
 * Initializes a new instance of {@link Firestore} with the provided settings.
 * Can only be called before any other function, including
 * {@link (getFirestore:1)}. If the custom settings are empty, this function is
 * equivalent to calling {@link (getFirestore:1)}.
 *
 * @param app - The {@link @firebase/app#FirebaseApp} with which the {@link Firestore} instance will
 * be associated.
 * @param settings - A settings object to configure the {@link Firestore} instance.
 * @param databaseId - The name of the database.
 * @returns A newly initialized {@link Firestore} instance.
 */ function Rh(t, e, n) {
    n || (n = "(default)");
    const s = app._getProvider(t, "firestore");
    if (s.isInitialized(n)) {
        const t = s.getImmediate({
            identifier: n
        }), i = s.getOptions(n);
        if (util.deepEqual(i, e)) return t;
        throw new U(q.FAILED_PRECONDITION, "initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.");
    }
    if (void 0 !== e.cacheSizeBytes && void 0 !== e.localCache) throw new U(q.INVALID_ARGUMENT, "cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");
    if (void 0 !== e.cacheSizeBytes && -1 !== e.cacheSizeBytes && e.cacheSizeBytes < 1048576) throw new U(q.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
    return s.initialize({
        options: e,
        instanceIdentifier: n
    });
}

function Ph(e, n) {
    const s = "object" == typeof e ? e : app.getApp(), i = "string" == typeof e ? e : n || "(default)", r = app._getProvider(s, "firestore").getImmediate({
        identifier: i
    });
    if (!r._initialized) {
        const t = util.getDefaultEmulatorHostnameAndPort("firestore");
        t && lh(r, ...t);
    }
    return r;
}

/**
 * @internal
 */ function bh(t) {
    return t._firestoreClient || Vh(t), t._firestoreClient.verifyNotTerminated(), t._firestoreClient;
}

function Vh(t) {
    var e, n, s;
    const i = t._freezeSettings(), r = function(t, e, n, s) {
        return new $e(t, e, n, s.host, s.ssl, s.experimentalForceLongPolling, s.experimentalAutoDetectLongPolling, th(s.experimentalLongPollingOptions), s.useFetchStreams);
    }(t._databaseId, (null === (e = t._app) || void 0 === e ? void 0 : e.options.appId) || "", t._persistenceKey, i);
    t._firestoreClient = new xa(t._authCredentials, t._appCheckCredentials, t._queue, r), 
    (null === (n = i.cache) || void 0 === n ? void 0 : n._offlineComponentProvider) && (null === (s = i.cache) || void 0 === s ? void 0 : s._onlineComponentProvider) && (t._firestoreClient._uninitializedComponentsProvider = {
        _offlineKind: i.cache.kind,
        _offline: i.cache._offlineComponentProvider,
        _online: i.cache._onlineComponentProvider
    });
}

/**
 * Attempts to enable persistent storage, if possible.
 *
 * Must be called before any other functions (other than
 * {@link initializeFirestore}, {@link (getFirestore:1)} or
 * {@link clearIndexedDbPersistence}.
 *
 * If this fails, `enableIndexedDbPersistence()` will reject the promise it
 * returns. Note that even after this failure, the {@link Firestore} instance will
 * remain usable, however offline persistence will be disabled.
 *
 * There are several reasons why this can fail, which can be identified by
 * the `code` on the error.
 *
 *   * failed-precondition: The app is already open in another browser tab.
 *   * unimplemented: The browser is incompatible with the offline
 *     persistence implementation.
 *
 * Persistence cannot be used in a Node.js environment.
 *
 * @param firestore - The {@link Firestore} instance to enable persistence for.
 * @param persistenceSettings - Optional settings object to configure
 * persistence.
 * @returns A `Promise` that represents successfully enabling persistent storage.
 * @deprecated This function will be removed in a future major release. Instead, set
 * `FirestoreSettings.cache` to an instance of `IndexedDbLocalCache` to
 * turn on IndexedDb cache. Calling this function when `FirestoreSettings.cache`
 * is already specified will throw an exception.
 */ function Sh(t, e) {
    Bh(t = uh(t, vh));
    const n = bh(t);
    if (n._uninitializedComponentsProvider) throw new U(q.FAILED_PRECONDITION, "SDK cache is already specified.");
    M("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");
    const s = t._freezeSettings(), i = new Pa;
    return Ch(n, i, new va(i, s.cacheSizeBytes, null == e ? void 0 : e.forceOwnership));
}

/**
 * Attempts to enable multi-tab persistent storage, if possible. If enabled
 * across all tabs, all operations share access to local persistence, including
 * shared execution of queries and latency-compensated local document updates
 * across all connected instances.
 *
 * If this fails, `enableMultiTabIndexedDbPersistence()` will reject the promise
 * it returns. Note that even after this failure, the {@link Firestore} instance will
 * remain usable, however offline persistence will be disabled.
 *
 * There are several reasons why this can fail, which can be identified by
 * the `code` on the error.
 *
 *   * failed-precondition: The app is already open in another browser tab and
 *     multi-tab is not enabled.
 *   * unimplemented: The browser is incompatible with the offline
 *     persistence implementation.
 *
 * @param firestore - The {@link Firestore} instance to enable persistence for.
 * @returns A `Promise` that represents successfully enabling persistent
 * storage.
 * @deprecated This function will be removed in a future major release. Instead, set
 * `FirestoreSettings.cache` to an instance of `IndexedDbLocalCache` to
 * turn on indexeddb cache. Calling this function when `FirestoreSettings.cache`
 * is already specified will throw an exception.
 */ function Dh(t) {
    Bh(t = uh(t, vh));
    const e = bh(t);
    if (e._uninitializedComponentsProvider) throw new U(q.FAILED_PRECONDITION, "SDK cache is already specified.");
    M("enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");
    const n = t._freezeSettings(), s = new Pa;
    return Ch(e, s, new Ra(s, n.cacheSizeBytes));
}

/**
 * Registers both the `OfflineComponentProvider` and `OnlineComponentProvider`.
 * If the operation fails with a recoverable error (see
 * `canRecoverFromIndexedDbError()` below), the returned Promise is rejected
 * but the client remains usable.
 */ function Ch(t, e, n) {
    const s = new K;
    return t.asyncQueue.enqueue((async () => {
        try {
            await Na(t, n), await ka(t, e), s.resolve();
        } catch (t) {
            const e = t;
            if (!Ma(e)) throw e;
            M("Error enabling indexeddb cache. Falling back to memory cache: " + e), s.reject(e);
        }
    })).then((() => s.promise));
}

/**
 * Clears the persistent storage. This includes pending writes and cached
 * documents.
 *
 * Must be called while the {@link Firestore} instance is not started (after the app is
 * terminated or when the app is first initialized). On startup, this function
 * must be called before other functions (other than {@link
 * initializeFirestore} or {@link (getFirestore:1)})). If the {@link Firestore}
 * instance is still running, the promise will be rejected with the error code
 * of `failed-precondition`.
 *
 * Note: `clearIndexedDbPersistence()` is primarily intended to help write
 * reliable tests that use Cloud Firestore. It uses an efficient mechanism for
 * dropping existing data but does not attempt to securely overwrite or
 * otherwise make cached data unrecoverable. For applications that are sensitive
 * to the disclosure of cached data in between user sessions, we strongly
 * recommend not enabling persistence at all.
 *
 * @param firestore - The {@link Firestore} instance to clear persistence for.
 * @returns A `Promise` that is resolved when the persistent storage is
 * cleared. Otherwise, the promise is rejected with an error.
 */ function xh(t) {
    if (t._initialized && !t._terminated) throw new U(q.FAILED_PRECONDITION, "Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");
    const e = new K;
    return t._queue.enqueueAndForgetEvenWhileRestricted((async () => {
        try {
            await async function(t) {
                if (!bt.D()) return Promise.resolve();
                const e = t + "main";
                await bt.delete(e);
            }(Zo(t._databaseId, t._persistenceKey)), e.resolve();
        } catch (t) {
            e.reject(t);
        }
    })), e.promise;
}

/**
 * Waits until all currently pending writes for the active user have been
 * acknowledged by the backend.
 *
 * The returned promise resolves immediately if there are no outstanding writes.
 * Otherwise, the promise waits for all previously issued writes (including
 * those written in a previous app session), but it does not wait for writes
 * that were added after the function is called. If you want to wait for
 * additional writes, call `waitForPendingWrites()` again.
 *
 * Any outstanding `waitForPendingWrites()` promises are rejected during user
 * changes.
 *
 * @returns A `Promise` which resolves when all currently pending writes have been
 * acknowledged by the backend.
 */ function Nh(t) {
    return function(t) {
        const e = new K;
        return t.asyncQueue.enqueueAndForget((async () => Zc(await qa(t), e))), e.promise;
    }(bh(t = uh(t, vh)));
}

/**
 * Re-enables use of the network for this {@link Firestore} instance after a prior
 * call to {@link disableNetwork}.
 *
 * @returns A `Promise` that is resolved once the network has been enabled.
 */ function kh(t) {
    return Ga(bh(t = uh(t, vh)));
}

/**
 * Disables network usage for this instance. It can be re-enabled via {@link
 * enableNetwork}. While the network is disabled, any snapshot listeners,
 * `getDoc()` or `getDocs()` calls will return results from cache, and any write
 * operations will be queued until the network is restored.
 *
 * @returns A `Promise` that is resolved once the network has been disabled.
 */ function Mh(t) {
    return Qa(bh(t = uh(t, vh)));
}

/**
 * Terminates the provided {@link Firestore} instance.
 *
 * After calling `terminate()` only the `clearIndexedDbPersistence()` function
 * may be used. Any other function will throw a `FirestoreError`.
 *
 * To restart after termination, create a new instance of FirebaseFirestore with
 * {@link (getFirestore:1)}.
 *
 * Termination does not cancel any pending writes, and any promises that are
 * awaiting a response from the server will not be resolved. If you have
 * persistence enabled, the next time you start this instance, it will resume
 * sending these writes to the server.
 *
 * Note: Under normal circumstances, calling `terminate()` is not required. This
 * function is useful only when you want to force this instance to release all
 * of its resources or in combination with `clearIndexedDbPersistence()` to
 * ensure that all local state is destroyed between test runs.
 *
 * @returns A `Promise` that is resolved when the instance has been successfully
 * terminated.
 */ function $h(t) {
    return app._removeServiceInstance(t.app, "firestore", t._databaseId.database), t._delete();
}

/**
 * Loads a Firestore bundle into the local cache.
 *
 * @param firestore - The {@link Firestore} instance to load bundles for.
 * @param bundleData - An object representing the bundle to be loaded. Valid
 * objects are `ArrayBuffer`, `ReadableStream<Uint8Array>` or `string`.
 *
 * @returns A `LoadBundleTask` object, which notifies callers with progress
 * updates, and completion or error events. It can be used as a
 * `Promise<LoadBundleTaskProgress>`.
 */ function Oh(t, e) {
    const n = bh(t = uh(t, vh)), s = new Eh;
    return Ya(n, t._databaseId, e, s), s;
}

/**
 * Reads a Firestore {@link Query} from local cache, identified by the given
 * name.
 *
 * The named queries are packaged  into bundles on the server side (along
 * with resulting documents), and loaded to local cache using `loadBundle`. Once
 * in local cache, use this method to extract a {@link Query} by name.
 *
 * @param firestore - The {@link Firestore} instance to read the query from.
 * @param name - The name of the query.
 * @returns A `Promise` that is resolved with the Query or `null`.
 */ function Fh(t, e) {
    return Xa(bh(t = uh(t, vh)), e).then((e => e ? new dh(t, null, e.query) : null));
}

function Bh(t) {
    if (t._initialized || t._terminated) throw new U(q.FAILED_PRECONDITION, "Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * Represents an aggregation that can be performed by Firestore.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Lh {
    /**
     * Create a new AggregateField<T>
     * @param _aggregateType Specifies the type of aggregation operation to perform.
     * @param _internalFieldPath Optionally specifies the field that is aggregated.
     * @internal
     */
    constructor(
    // TODO (sum/avg) make aggregateType public when the feature is supported
    t = "count", e) {
        this._aggregateType = t, this._internalFieldPath = e, 
        /** A type string to uniquely identify instances of this class. */
        this.type = "AggregateField";
    }
}

/**
 * The results of executing an aggregation query.
 */ class qh {
    /** @hideconstructor */
    constructor(t, e, n) {
        this._userDataWriter = e, this._data = n, 
        /** A type string to uniquely identify instances of this class. */
        this.type = "AggregateQuerySnapshot", this.query = t;
    }
    /**
     * Returns the results of the aggregations performed over the underlying
     * query.
     *
     * The keys of the returned object will be the same as those of the
     * `AggregateSpec` object specified to the aggregation method, and the values
     * will be the corresponding aggregation result.
     *
     * @returns The results of the aggregations performed over the underlying
     * query.
     */    data() {
        return this._userDataWriter.convertObjectMap(this._data);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * An immutable object representing an array of bytes.
 */ class Uh {
    /** @hideconstructor */
    constructor(t) {
        this._byteString = t;
    }
    /**
     * Creates a new `Bytes` object from the given Base64 string, converting it to
     * bytes.
     *
     * @param base64 - The Base64 string used to create the `Bytes` object.
     */    static fromBase64String(t) {
        try {
            return new Uh(Ve.fromBase64String(t));
        } catch (t) {
            throw new U(q.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + t);
        }
    }
    /**
     * Creates a new `Bytes` object from the given Uint8Array.
     *
     * @param array - The Uint8Array used to create the `Bytes` object.
     */    static fromUint8Array(t) {
        return new Uh(Ve.fromUint8Array(t));
    }
    /**
     * Returns the underlying bytes as a Base64-encoded string.
     *
     * @returns The Base64-encoded string created from the `Bytes` object.
     */    toBase64() {
        return this._byteString.toBase64();
    }
    /**
     * Returns the underlying bytes in a new `Uint8Array`.
     *
     * @returns The Uint8Array created from the `Bytes` object.
     */    toUint8Array() {
        return this._byteString.toUint8Array();
    }
    /**
     * Returns a string representation of the `Bytes` object.
     *
     * @returns A string representation of the `Bytes` object.
     */    toString() {
        return "Bytes(base64: " + this.toBase64() + ")";
    }
    /**
     * Returns true if this `Bytes` object is equal to the provided one.
     *
     * @param other - The `Bytes` object to compare against.
     * @returns true if this `Bytes` object is equal to the provided one.
     */    isEqual(t) {
        return this._byteString.isEqual(t._byteString);
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * A `FieldPath` refers to a field in a document. The path may consist of a
 * single field name (referring to a top-level field in the document), or a
 * list of field names (referring to a nested field in the document).
 *
 * Create a `FieldPath` by providing field names. If more than one field
 * name is provided, the path will point to a nested field in a document.
 */ class Kh {
    /**
     * Creates a `FieldPath` from the provided field names. If more than one field
     * name is provided, the path will point to a nested field in a document.
     *
     * @param fieldNames - A list of field names.
     */
    constructor(...t) {
        for (let e = 0; e < t.length; ++e) if (0 === t[e].length) throw new U(q.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
        this._internalPath = new at(t);
    }
    /**
     * Returns true if this `FieldPath` is equal to the provided one.
     *
     * @param other - The `FieldPath` to compare against.
     * @returns true if this `FieldPath` is equal to the provided one.
     */    isEqual(t) {
        return this._internalPath.isEqual(t._internalPath);
    }
}

/**
 * Returns a special sentinel `FieldPath` to refer to the ID of a document.
 * It can be used in queries to sort or filter by the document ID.
 */ function Gh() {
    return new Kh("__name__");
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Sentinel values that can be used when writing document fields with `set()`
 * or `update()`.
 */ class Qh {
    /**
     * @param _methodName - The public API endpoint that returns this class.
     * @hideconstructor
     */
    constructor(t) {
        this._methodName = t;
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
/**
 * An immutable object representing a geographic location in Firestore. The
 * location is represented as latitude/longitude pair.
 *
 * Latitude values are in the range of [-90, 90].
 * Longitude values are in the range of [-180, 180].
 */ class jh {
    /**
     * Creates a new immutable `GeoPoint` object with the provided latitude and
     * longitude values.
     * @param latitude - The latitude as number between -90 and 90.
     * @param longitude - The longitude as number between -180 and 180.
     */
    constructor(t, e) {
        if (!isFinite(t) || t < -90 || t > 90) throw new U(q.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + t);
        if (!isFinite(e) || e < -180 || e > 180) throw new U(q.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + e);
        this._lat = t, this._long = e;
    }
    /**
     * The latitude of this `GeoPoint` instance.
     */    get latitude() {
        return this._lat;
    }
    /**
     * The longitude of this `GeoPoint` instance.
     */    get longitude() {
        return this._long;
    }
    /**
     * Returns true if this `GeoPoint` is equal to the provided one.
     *
     * @param other - The `GeoPoint` to compare against.
     * @returns true if this `GeoPoint` is equal to the provided one.
     */    isEqual(t) {
        return this._lat === t._lat && this._long === t._long;
    }
    /** Returns a JSON-serializable representation of this GeoPoint. */    toJSON() {
        return {
            latitude: this._lat,
            longitude: this._long
        };
    }
    /**
     * Actually private to JS consumers of our API, so this function is prefixed
     * with an underscore.
     */    _compareTo(t) {
        return et(this._lat, t._lat) || et(this._long, t._long);
    }
}

/**
 * @license
 * Copyright 2017 Google LLC
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
 */ const zh = /^__.*__$/;

/** The result of parsing document data (e.g. for a setData call). */ class Wh {
    constructor(t, e, n) {
        this.data = t, this.fieldMask = e, this.fieldTransforms = n;
    }
    toMutation(t, e) {
        return null !== this.fieldMask ? new zs(t, this.data, this.fieldMask, e, this.fieldTransforms) : new js(t, this.data, e, this.fieldTransforms);
    }
}

/** The result of parsing "update" data (i.e. for an updateData call). */ class Hh {
    constructor(t, 
    // The fieldMask does not include document transforms.
    e, n) {
        this.data = t, this.fieldMask = e, this.fieldTransforms = n;
    }
    toMutation(t, e) {
        return new zs(t, this.data, this.fieldMask, e, this.fieldTransforms);
    }
}

function Jh(t) {
    switch (t) {
      case 0 /* UserDataSource.Set */ :
 // fall through
              case 2 /* UserDataSource.MergeSet */ :
 // fall through
              case 1 /* UserDataSource.Update */ :
        return !0;

      case 3 /* UserDataSource.Argument */ :
      case 4 /* UserDataSource.ArrayArgument */ :
        return !1;

      default:
        throw O();
    }
}

/** A "context" object passed around while parsing user data. */ class Yh {
    /**
     * Initializes a ParseContext with the given source and path.
     *
     * @param settings - The settings for the parser.
     * @param databaseId - The database ID of the Firestore instance.
     * @param serializer - The serializer to use to generate the Value proto.
     * @param ignoreUndefinedProperties - Whether to ignore undefined properties
     * rather than throw.
     * @param fieldTransforms - A mutable list of field transforms encountered
     * while parsing the data.
     * @param fieldMask - A mutable list of field paths encountered while parsing
     * the data.
     *
     * TODO(b/34871131): We don't support array paths right now, so path can be
     * null to indicate the context represents any location within an array (in
     * which case certain features will not work and errors will be somewhat
     * compromised).
     */
    constructor(t, e, n, s, i, r) {
        this.settings = t, this.databaseId = e, this.serializer = n, this.ignoreUndefinedProperties = s, 
        // Minor hack: If fieldTransforms is undefined, we assume this is an
        // external call and we need to validate the entire path.
        void 0 === i && this.ua(), this.fieldTransforms = i || [], this.fieldMask = r || [];
    }
    get path() {
        return this.settings.path;
    }
    get ca() {
        return this.settings.ca;
    }
    /** Returns a new context with the specified settings overwritten. */    aa(t) {
        return new Yh(Object.assign(Object.assign({}, this.settings), t), this.databaseId, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
    }
    ha(t) {
        var e;
        const n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), s = this.aa({
            path: n,
            la: !1
        });
        return s.fa(t), s;
    }
    da(t) {
        var e;
        const n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), s = this.aa({
            path: n,
            la: !1
        });
        return s.ua(), s;
    }
    wa(t) {
        // TODO(b/34871131): We don't support array paths right now; so make path
        // undefined.
        return this.aa({
            path: void 0,
            la: !0
        });
    }
    _a(t) {
        return gl(t, this.settings.methodName, this.settings.ma || !1, this.path, this.settings.ga);
    }
    /** Returns 'true' if 'fieldPath' was traversed when creating this context. */    contains(t) {
        return void 0 !== this.fieldMask.find((e => t.isPrefixOf(e))) || void 0 !== this.fieldTransforms.find((e => t.isPrefixOf(e.field)));
    }
    ua() {
        // TODO(b/34871131): Remove null check once we have proper paths for fields
        // within arrays.
        if (this.path) for (let t = 0; t < this.path.length; t++) this.fa(this.path.get(t));
    }
    fa(t) {
        if (0 === t.length) throw this._a("Document fields must not be empty");
        if (Jh(this.ca) && zh.test(t)) throw this._a('Document fields cannot begin and end with "__"');
    }
}

/**
 * Helper for parsing raw user input (provided via the API) into internal model
 * classes.
 */ class Xh {
    constructor(t, e, n) {
        this.databaseId = t, this.ignoreUndefinedProperties = e, this.serializer = n || Fu(t);
    }
    /** Creates a new top-level parse context. */    ya(t, e, n, s = !1) {
        return new Yh({
            ca: t,
            methodName: e,
            ga: n,
            path: at.emptyPath(),
            la: !1,
            ma: s
        }, this.databaseId, this.serializer, this.ignoreUndefinedProperties);
    }
}

function Zh(t) {
    const e = t._freezeSettings(), n = Fu(t._databaseId);
    return new Xh(t._databaseId, !!e.ignoreUndefinedProperties, n);
}

/** Parse document data from a set() call. */ function tl(t, e, n, s, i, r = {}) {
    const o = t.ya(r.merge || r.mergeFields ? 2 /* UserDataSource.MergeSet */ : 0 /* UserDataSource.Set */ , e, n, i);
    dl("Data must be an object, but it was:", o, s);
    const u = ll(s, o);
    let c, a;
    if (r.merge) c = new Re(o.fieldMask), a = o.fieldTransforms; else if (r.mergeFields) {
        const t = [];
        for (const s of r.mergeFields) {
            const i = wl(e, s, n);
            if (!o.contains(i)) throw new U(q.INVALID_ARGUMENT, `Field '${i}' is specified in your field mask but missing from your input data.`);
            yl(t, i) || t.push(i);
        }
        c = new Re(t), a = o.fieldTransforms.filter((t => c.covers(t.field)));
    } else c = null, a = o.fieldTransforms;
    return new Wh(new un(u), c, a);
}

class el extends Qh {
    _toFieldTransform(t) {
        if (2 /* UserDataSource.MergeSet */ !== t.ca) throw 1 /* UserDataSource.Update */ === t.ca ? t._a(`${this._methodName}() can only appear at the top level of your update data`) : t._a(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);
        // No transform to add for a delete, but we need to add it to our
        // fieldMask so it gets deleted.
        return t.fieldMask.push(t.path), null;
    }
    isEqual(t) {
        return t instanceof el;
    }
}

/**
 * Creates a child context for parsing SerializableFieldValues.
 *
 * This is different than calling `ParseContext.contextWith` because it keeps
 * the fieldTransforms and fieldMask separate.
 *
 * The created context has its `dataSource` set to `UserDataSource.Argument`.
 * Although these values are used with writes, any elements in these FieldValues
 * are not considered writes since they cannot contain any FieldValue sentinels,
 * etc.
 *
 * @param fieldValue - The sentinel FieldValue for which to create a child
 *     context.
 * @param context - The parent context.
 * @param arrayElement - Whether or not the FieldValue has an array.
 */ function nl(t, e, n) {
    return new Yh({
        ca: 3 /* UserDataSource.Argument */ ,
        ga: e.settings.ga,
        methodName: t._methodName,
        la: n
    }, e.databaseId, e.serializer, e.ignoreUndefinedProperties);
}

class sl extends Qh {
    _toFieldTransform(t) {
        return new Ms(t.path, new bs);
    }
    isEqual(t) {
        return t instanceof sl;
    }
}

class il extends Qh {
    constructor(t, e) {
        super(t), this.pa = e;
    }
    _toFieldTransform(t) {
        const e = nl(this, t, 
        /*array=*/ !0), n = this.pa.map((t => hl(t, e))), s = new Vs(n);
        return new Ms(t.path, s);
    }
    isEqual(t) {
        // TODO(mrschmidt): Implement isEquals
        return this === t;
    }
}

class rl extends Qh {
    constructor(t, e) {
        super(t), this.pa = e;
    }
    _toFieldTransform(t) {
        const e = nl(this, t, 
        /*array=*/ !0), n = this.pa.map((t => hl(t, e))), s = new Ds(n);
        return new Ms(t.path, s);
    }
    isEqual(t) {
        // TODO(mrschmidt): Implement isEquals
        return this === t;
    }
}

class ol extends Qh {
    constructor(t, e) {
        super(t), this.Ia = e;
    }
    _toFieldTransform(t) {
        const e = new xs(t.serializer, Es(t.serializer, this.Ia));
        return new Ms(t.path, e);
    }
    isEqual(t) {
        // TODO(mrschmidt): Implement isEquals
        return this === t;
    }
}

/** Parse update data from an update() call. */ function ul(t, e, n, s) {
    const i = t.ya(1 /* UserDataSource.Update */ , e, n);
    dl("Data must be an object, but it was:", i, s);
    const r = [], o = un.empty();
    ge(s, ((t, s) => {
        const u = ml(e, t, n);
        // For Compat types, we have to "extract" the underlying types before
        // performing validation.
                s = util.getModularInstance(s);
        const c = i.da(u);
        if (s instanceof el) 
        // Add it to the field mask, but don't add anything to updateData.
        r.push(u); else {
            const t = hl(s, c);
            null != t && (r.push(u), o.set(u, t));
        }
    }));
    const u = new Re(r);
    return new Hh(o, u, i.fieldTransforms);
}

/** Parse update data from a list of field/value arguments. */ function cl(t, e, n, s, i, r) {
    const o = t.ya(1 /* UserDataSource.Update */ , e, n), u = [ wl(e, s, n) ], c = [ i ];
    if (r.length % 2 != 0) throw new U(q.INVALID_ARGUMENT, `Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);
    for (let t = 0; t < r.length; t += 2) u.push(wl(e, r[t])), c.push(r[t + 1]);
    const a = [], h = un.empty();
    // We iterate in reverse order to pick the last value for a field if the
    // user specified the field multiple times.
    for (let t = u.length - 1; t >= 0; --t) if (!yl(a, u[t])) {
        const e = u[t];
        let n = c[t];
        // For Compat types, we have to "extract" the underlying types before
        // performing validation.
                n = util.getModularInstance(n);
        const s = o.da(e);
        if (n instanceof el) 
        // Add it to the field mask, but don't add anything to updateData.
        a.push(e); else {
            const t = hl(n, s);
            null != t && (a.push(e), h.set(e, t));
        }
    }
    const l = new Re(a);
    return new Hh(h, l, o.fieldTransforms);
}

/**
 * Parse a "query value" (e.g. value in a where filter or a value in a cursor
 * bound).
 *
 * @param allowArrays - Whether the query value is an array that may directly
 * contain additional arrays (e.g. the operand of an `in` query).
 */ function al(t, e, n, s = !1) {
    return hl(n, t.ya(s ? 4 /* UserDataSource.ArrayArgument */ : 3 /* UserDataSource.Argument */ , e));
}

/**
 * Parses user data to Protobuf Values.
 *
 * @param input - Data to be parsed.
 * @param context - A context object representing the current path being parsed,
 * the source of the data being parsed, etc.
 * @returns The parsed value, or null if the value was a FieldValue sentinel
 * that should not be included in the resulting parsed data.
 */ function hl(t, e) {
    if (fl(
    // Unwrap the API type from the Compat SDK. This will return the API type
    // from firestore-exp.
    t = util.getModularInstance(t))) return dl("Unsupported field value:", e, t), ll(t, e);
    if (t instanceof Qh) 
    // FieldValues usually parse into transforms (except deleteField())
    // in which case we do not want to include this field in our parsed data
    // (as doing so will overwrite the field directly prior to the transform
    // trying to transform it). So we don't add this location to
    // context.fieldMask and we return null as our parsing result.
    /**
 * "Parses" the provided FieldValueImpl, adding any necessary transforms to
 * context.fieldTransforms.
 */
    return function(t, e) {
        // Sentinels are only supported with writes, and not within arrays.
        if (!Jh(e.ca)) throw e._a(`${t._methodName}() can only be used with update() and set()`);
        if (!e.path) throw e._a(`${t._methodName}() is not currently supported inside arrays`);
        const n = t._toFieldTransform(e);
        n && e.fieldTransforms.push(n);
    }
    /**
 * Helper to parse a scalar value (i.e. not an Object, Array, or FieldValue)
 *
 * @returns The parsed value
 */ (t, e), null;
    if (void 0 === t && e.ignoreUndefinedProperties) 
    // If the input is undefined it can never participate in the fieldMask, so
    // don't handle this below. If `ignoreUndefinedProperties` is false,
    // `parseScalarValue` will reject an undefined value.
    return null;
    if (
    // If context.path is null we are inside an array and we don't support
    // field mask paths more granular than the top-level array.
    e.path && e.fieldMask.push(e.path), t instanceof Array) {
        // TODO(b/34871131): Include the path containing the array in the error
        // message.
        // In the case of IN queries, the parsed data is an array (representing
        // the set of values to be included for the IN query) that may directly
        // contain additional arrays (each representing an individual field
        // value), so we disable this validation.
        if (e.settings.la && 4 /* UserDataSource.ArrayArgument */ !== e.ca) throw e._a("Nested arrays are not supported");
        return function(t, e) {
            const n = [];
            let s = 0;
            for (const i of t) {
                let t = hl(i, e.wa(s));
                null == t && (
                // Just include nulls in the array for fields being replaced with a
                // sentinel.
                t = {
                    nullValue: "NULL_VALUE"
                }), n.push(t), s++;
            }
            return {
                arrayValue: {
                    values: n
                }
            };
        }(t, e);
    }
    return function(t, e) {
        if (null === (t = util.getModularInstance(t))) return {
            nullValue: "NULL_VALUE"
        };
        if ("number" == typeof t) return Es(e.serializer, t);
        if ("boolean" == typeof t) return {
            booleanValue: t
        };
        if ("string" == typeof t) return {
            stringValue: t
        };
        if (t instanceof Date) {
            const n = it.fromDate(t);
            return {
                timestampValue: Di(e.serializer, n)
            };
        }
        if (t instanceof it) {
            // Firestore backend truncates precision down to microseconds. To ensure
            // offline mode works the same with regards to truncation, perform the
            // truncation immediately without waiting for the backend to do that.
            const n = new it(t.seconds, 1e3 * Math.floor(t.nanoseconds / 1e3));
            return {
                timestampValue: Di(e.serializer, n)
            };
        }
        if (t instanceof jh) return {
            geoPointValue: {
                latitude: t.latitude,
                longitude: t.longitude
            }
        };
        if (t instanceof Uh) return {
            bytesValue: Ci(e.serializer, t._byteString)
        };
        if (t instanceof fh) {
            const n = e.databaseId, s = t.firestore._databaseId;
            if (!s.isEqual(n)) throw e._a(`Document reference is for database ${s.projectId}/${s.database} but should be for database ${n.projectId}/${n.database}`);
            return {
                referenceValue: ki(t.firestore._databaseId || e.databaseId, t._key.path)
            };
        }
        throw e._a(`Unsupported field value: ${oh(t)}`);
    }
    /**
 * Checks whether an object looks like a JSON object that should be converted
 * into a struct. Normal class/prototype instances are considered to look like
 * JSON objects since they should be converted to a struct value. Arrays, Dates,
 * GeoPoints, etc. are not considered to look like JSON objects since they map
 * to specific FieldValue types other than ObjectValue.
 */ (t, e);
}

function ll(t, e) {
    const n = {};
    return ye(t) ? 
    // If we encounter an empty object, we explicitly add it to the update
    // mask to ensure that the server creates a map entry.
    e.path && e.path.length > 0 && e.fieldMask.push(e.path) : ge(t, ((t, s) => {
        const i = hl(s, e.ha(t));
        null != i && (n[t] = i);
    })), {
        mapValue: {
            fields: n
        }
    };
}

function fl(t) {
    return !("object" != typeof t || null === t || t instanceof Array || t instanceof Date || t instanceof it || t instanceof jh || t instanceof Uh || t instanceof fh || t instanceof Qh);
}

function dl(t, e, n) {
    if (!fl(n) || !function(t) {
        return "object" == typeof t && null !== t && (Object.getPrototypeOf(t) === Object.prototype || null === Object.getPrototypeOf(t));
    }(n)) {
        const s = oh(n);
        throw "an object" === s ? e._a(t + " a custom object") : e._a(t + " " + s);
    }
}

/**
 * Helper that calls fromDotSeparatedString() but wraps any error thrown.
 */ function wl(t, e, n) {
    if ((
    // If required, replace the FieldPath Compat class with with the firestore-exp
    // FieldPath.
    e = util.getModularInstance(e)) instanceof Kh) return e._internalPath;
    if ("string" == typeof e) return ml(t, e);
    throw gl("Field path arguments must be of type string or ", t, 
    /* hasConverter= */ !1, 
    /* path= */ void 0, n);
}

/**
 * Matches any characters in a field path string that are reserved.
 */ const _l = new RegExp("[~\\*/\\[\\]]");

/**
 * Wraps fromDotSeparatedString with an error message about the method that
 * was thrown.
 * @param methodName - The publicly visible method name
 * @param path - The dot-separated string form of a field path which will be
 * split on dots.
 * @param targetDoc - The document against which the field path will be
 * evaluated.
 */ function ml(t, e, n) {
    if (e.search(_l) >= 0) throw gl(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`, t, 
    /* hasConverter= */ !1, 
    /* path= */ void 0, n);
    try {
        return new Kh(...e.split("."))._internalPath;
    } catch (s) {
        throw gl(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`, t, 
        /* hasConverter= */ !1, 
        /* path= */ void 0, n);
    }
}

function gl(t, e, n, s, i) {
    const r = s && !s.isEmpty(), o = void 0 !== i;
    let u = `Function ${e}() called with invalid data`;
    n && (u += " (via `toFirestore()`)"), u += ". ";
    let c = "";
    return (r || o) && (c += " (found", r && (c += ` in field ${s}`), o && (c += ` in document ${i}`), 
    c += ")"), new U(q.INVALID_ARGUMENT, u + t + c);
}

/** Checks `haystack` if FieldPath `needle` is present. Runs in O(n). */ function yl(t, e) {
    return t.some((t => t.isEqual(e)));
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * A `DocumentSnapshot` contains data read from a document in your Firestore
 * database. The data can be extracted with `.data()` or `.get(<field>)` to
 * get a specific field.
 *
 * For a `DocumentSnapshot` that points to a non-existing document, any data
 * access will return 'undefined'. You can use the `exists()` method to
 * explicitly verify a document's existence.
 */ class pl {
    // Note: This class is stripped down version of the DocumentSnapshot in
    // the legacy SDK. The changes are:
    // - No support for SnapshotMetadata.
    // - No support for SnapshotOptions.
    /** @hideconstructor protected */
    constructor(t, e, n, s, i) {
        this._firestore = t, this._userDataWriter = e, this._key = n, this._document = s, 
        this._converter = i;
    }
    /** Property of the `DocumentSnapshot` that provides the document's ID. */    get id() {
        return this._key.path.lastSegment();
    }
    /**
     * The `DocumentReference` for the document included in the `DocumentSnapshot`.
     */    get ref() {
        return new fh(this._firestore, this._converter, this._key);
    }
    /**
     * Signals whether or not the document at the snapshot's location exists.
     *
     * @returns true if the document exists.
     */    exists() {
        return null !== this._document;
    }
    /**
     * Retrieves all fields in the document as an `Object`. Returns `undefined` if
     * the document doesn't exist.
     *
     * @returns An `Object` containing all fields in the document or `undefined`
     * if the document doesn't exist.
     */    data() {
        if (this._document) {
            if (this._converter) {
                // We only want to use the converter and create a new DocumentSnapshot
                // if a converter has been provided.
                const t = new Il(this._firestore, this._userDataWriter, this._key, this._document, 
                /* converter= */ null);
                return this._converter.fromFirestore(t);
            }
            return this._userDataWriter.convertValue(this._document.data.value);
        }
    }
    /**
     * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
     * document or field doesn't exist.
     *
     * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
     * field.
     * @returns The data at the specified field location or undefined if no such
     * field exists in the document.
     */
    // We are using `any` here to avoid an explicit cast by our users.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(t) {
        if (this._document) {
            const e = this._document.data.field(Tl("DocumentSnapshot.get", t));
            if (null !== e) return this._userDataWriter.convertValue(e);
        }
    }
}

/**
 * A `QueryDocumentSnapshot` contains data read from a document in your
 * Firestore database as part of a query. The document is guaranteed to exist
 * and its data can be extracted with `.data()` or `.get(<field>)` to get a
 * specific field.
 *
 * A `QueryDocumentSnapshot` offers the same API surface as a
 * `DocumentSnapshot`. Since query results contain only existing documents, the
 * `exists` property will always be true and `data()` will never return
 * 'undefined'.
 */ class Il extends pl {
    /**
     * Retrieves all fields in the document as an `Object`.
     *
     * @override
     * @returns An `Object` containing all fields in the document.
     */
    data() {
        return super.data();
    }
}

/**
 * Helper that calls `fromDotSeparatedString()` but wraps any error thrown.
 */ function Tl(t, e) {
    return "string" == typeof e ? ml(t, e) : e instanceof Kh ? e._internalPath : e._delegate._internalPath;
}

/**
 * @license
 * Copyright 2020 Google LLC
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
 */ function El(t) {
    if ("L" /* LimitType.Last */ === t.limitType && 0 === t.explicitOrderBy.length) throw new U(q.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
}

/**
 * An `AppliableConstraint` is an abstraction of a constraint that can be applied
 * to a Firestore query.
 */ class Al {}

/**
 * A `QueryConstraint` is used to narrow the set of documents returned by a
 * Firestore query. `QueryConstraint`s are created by invoking {@link where},
 * {@link orderBy}, {@link (startAt:1)}, {@link (startAfter:1)}, {@link
 * (endBefore:1)}, {@link (endAt:1)}, {@link limit}, {@link limitToLast} and
 * can then be passed to {@link (query:1)} to create a new query instance that
 * also contains this `QueryConstraint`.
 */ class vl extends Al {}

function Rl(t, e, ...n) {
    let s = [];
    e instanceof Al && s.push(e), s = s.concat(n), function(t) {
        const e = t.filter((t => t instanceof Vl)).length, n = t.filter((t => t instanceof Pl)).length;
        if (e > 1 || e > 0 && n > 0) throw new U(q.INVALID_ARGUMENT, "InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.");
    }
    /**
 * @license
 * Copyright 2020 Google LLC
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
    /**
 * Converts Firestore's internal types to the JavaScript types that we expose
 * to the user.
 *
 * @internal
 */ (s);
    for (const e of s) t = e._apply(t);
    return t;
}

/**
 * A `QueryFieldFilterConstraint` is used to narrow the set of documents returned by
 * a Firestore query by filtering on one or more document fields.
 * `QueryFieldFilterConstraint`s are created by invoking {@link where} and can then
 * be passed to {@link (query:1)} to create a new query instance that also contains
 * this `QueryFieldFilterConstraint`.
 */ class Pl extends vl {
    /**
     * @internal
     */
    constructor(t, e, n) {
        super(), this._field = t, this._op = e, this._value = n, 
        /** The type of this query constraint */
        this.type = "where";
    }
    static _create(t, e, n) {
        return new Pl(t, e, n);
    }
    _apply(t) {
        const e = this._parse(t);
        return Ql(t._query, e), new dh(t.firestore, t.converter, Yn(t._query, e));
    }
    _parse(t) {
        const e = Zh(t.firestore), n = function(t, e, n, s, i, r, o) {
            let u;
            if (i.isKeyField()) {
                if ("array-contains" /* Operator.ARRAY_CONTAINS */ === r || "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ === r) throw new U(q.INVALID_ARGUMENT, `Invalid Query. You can't perform '${r}' queries on documentId().`);
                if ("in" /* Operator.IN */ === r || "not-in" /* Operator.NOT_IN */ === r) {
                    Gl(o, r);
                    const e = [];
                    for (const n of o) e.push(Kl(s, t, n));
                    u = {
                        arrayValue: {
                            values: e
                        }
                    };
                } else u = Kl(s, t, o);
            } else "in" /* Operator.IN */ !== r && "not-in" /* Operator.NOT_IN */ !== r && "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ !== r || Gl(o, r), 
            u = al(n, e, o, 
            /* allowArrays= */ "in" /* Operator.IN */ === r || "not-in" /* Operator.NOT_IN */ === r);
            return mn.create(i, r, u);
        }(t._query, "where", e, t.firestore._databaseId, this._field, this._op, this._value);
        return n;
    }
}

/**
 * Creates a {@link QueryFieldFilterConstraint} that enforces that documents
 * must contain the specified field and that the value should satisfy the
 * relation constraint provided.
 *
 * @param fieldPath - The path to compare
 * @param opStr - The operation string (e.g "&lt;", "&lt;=", "==", "&lt;",
 *   "&lt;=", "!=").
 * @param value - The value for comparison
 * @returns The created {@link QueryFieldFilterConstraint}.
 */ function bl(t, e, n) {
    const s = e, i = Tl("where", t);
    return Pl._create(i, s, n);
}

/**
 * A `QueryCompositeFilterConstraint` is used to narrow the set of documents
 * returned by a Firestore query by performing the logical OR or AND of multiple
 * {@link QueryFieldFilterConstraint}s or {@link QueryCompositeFilterConstraint}s.
 * `QueryCompositeFilterConstraint`s are created by invoking {@link or} or
 * {@link and} and can then be passed to {@link (query:1)} to create a new query
 * instance that also contains the `QueryCompositeFilterConstraint`.
 */ class Vl extends Al {
    /**
     * @internal
     */
    constructor(
    /** The type of this query constraint */
    t, e) {
        super(), this.type = t, this._queryConstraints = e;
    }
    static _create(t, e) {
        return new Vl(t, e);
    }
    _parse(t) {
        const e = this._queryConstraints.map((e => e._parse(t))).filter((t => t.getFilters().length > 0));
        return 1 === e.length ? e[0] : gn.create(e, this._getOperator());
    }
    _apply(t) {
        const e = this._parse(t);
        return 0 === e.getFilters().length ? t : (function(t, e) {
            let n = t;
            const s = e.getFlattenedFilters();
            for (const t of s) Ql(n, t), n = Yn(n, t);
        }
        // Checks if any of the provided filter operators are included in the given list of filters and
        // returns the first one that is, or null if none are.
        (t._query, e), new dh(t.firestore, t.converter, Yn(t._query, e)));
    }
    _getQueryConstraints() {
        return this._queryConstraints;
    }
    _getOperator() {
        return "and" === this.type ? "and" /* CompositeOperator.AND */ : "or" /* CompositeOperator.OR */;
    }
}

/**
 * Creates a new {@link QueryCompositeFilterConstraint} that is a disjunction of
 * the given filter constraints. A disjunction filter includes a document if it
 * satisfies any of the given filters.
 *
 * @param queryConstraints - Optional. The list of
 * {@link QueryFilterConstraint}s to perform a disjunction for. These must be
 * created with calls to {@link where}, {@link or}, or {@link and}.
 * @returns The newly created {@link QueryCompositeFilterConstraint}.
 */ function Sl(...t) {
    // Only support QueryFilterConstraints
    return t.forEach((t => zl("or", t))), Vl._create("or" /* CompositeOperator.OR */ , t);
}

/**
 * Creates a new {@link QueryCompositeFilterConstraint} that is a conjunction of
 * the given filter constraints. A conjunction filter includes a document if it
 * satisfies all of the given filters.
 *
 * @param queryConstraints - Optional. The list of
 * {@link QueryFilterConstraint}s to perform a conjunction for. These must be
 * created with calls to {@link where}, {@link or}, or {@link and}.
 * @returns The newly created {@link QueryCompositeFilterConstraint}.
 */ function Dl(...t) {
    // Only support QueryFilterConstraints
    return t.forEach((t => zl("and", t))), Vl._create("and" /* CompositeOperator.AND */ , t);
}

/**
 * A `QueryOrderByConstraint` is used to sort the set of documents returned by a
 * Firestore query. `QueryOrderByConstraint`s are created by invoking
 * {@link orderBy} and can then be passed to {@link (query:1)} to create a new query
 * instance that also contains this `QueryOrderByConstraint`.
 *
 * Note: Documents that do not contain the orderBy field will not be present in
 * the query result.
 */ class Cl extends vl {
    /**
     * @internal
     */
    constructor(t, e) {
        super(), this._field = t, this._direction = e, 
        /** The type of this query constraint */
        this.type = "orderBy";
    }
    static _create(t, e) {
        return new Cl(t, e);
    }
    _apply(t) {
        const e = function(t, e, n) {
            if (null !== t.startAt) throw new U(q.INVALID_ARGUMENT, "Invalid query. You must not call startAt() or startAfter() before calling orderBy().");
            if (null !== t.endAt) throw new U(q.INVALID_ARGUMENT, "Invalid query. You must not call endAt() or endBefore() before calling orderBy().");
            const s = new dn(e, n);
            return function(t, e) {
                if (null === jn(t)) {
                    // This is the first order by. It must match any inequality.
                    const n = zn(t);
                    null !== n && jl(t, n, e.field);
                }
            }(t, s), s;
        }
        /**
 * Create a `Bound` from a query and a document.
 *
 * Note that the `Bound` will always include the key of the document
 * and so only the provided document will compare equal to the returned
 * position.
 *
 * Will throw if the document does not contain all fields of the order by
 * of the query or if any of the fields in the order by are an uncommitted
 * server timestamp.
 */ (t._query, this._field, this._direction);
        return new dh(t.firestore, t.converter, function(t, e) {
            // TODO(dimond): validate that orderBy does not list the same key twice.
            const n = t.explicitOrderBy.concat([ e ]);
            return new Un(t.path, t.collectionGroup, n, t.filters.slice(), t.limit, t.limitType, t.startAt, t.endAt);
        }(t._query, e));
    }
}

/**
 * Creates a {@link QueryOrderByConstraint} that sorts the query result by the
 * specified field, optionally in descending order instead of ascending.
 *
 * Note: Documents that do not contain the specified field will not be present
 * in the query result.
 *
 * @param fieldPath - The field to sort by.
 * @param directionStr - Optional direction to sort by ('asc' or 'desc'). If
 * not specified, order will be ascending.
 * @returns The created {@link QueryOrderByConstraint}.
 */ function xl(t, e = "asc") {
    const n = e, s = Tl("orderBy", t);
    return Cl._create(s, n);
}

/**
 * A `QueryLimitConstraint` is used to limit the number of documents returned by
 * a Firestore query.
 * `QueryLimitConstraint`s are created by invoking {@link limit} or
 * {@link limitToLast} and can then be passed to {@link (query:1)} to create a new
 * query instance that also contains this `QueryLimitConstraint`.
 */ class Nl extends vl {
    /**
     * @internal
     */
    constructor(
    /** The type of this query constraint */
    t, e, n) {
        super(), this.type = t, this._limit = e, this._limitType = n;
    }
    static _create(t, e, n) {
        return new Nl(t, e, n);
    }
    _apply(t) {
        return new dh(t.firestore, t.converter, Xn(t._query, this._limit, this._limitType));
    }
}

/**
 * Creates a {@link QueryLimitConstraint} that only returns the first matching
 * documents.
 *
 * @param limit - The maximum number of items to return.
 * @returns The created {@link QueryLimitConstraint}.
 */ function kl(t) {
    return ch("limit", t), Nl._create("limit", t, "F" /* LimitType.First */);
}

/**
 * Creates a {@link QueryLimitConstraint} that only returns the last matching
 * documents.
 *
 * You must specify at least one `orderBy` clause for `limitToLast` queries,
 * otherwise an exception will be thrown during execution.
 *
 * @param limit - The maximum number of items to return.
 * @returns The created {@link QueryLimitConstraint}.
 */ function Ml(t) {
    return ch("limitToLast", t), Nl._create("limitToLast", t, "L" /* LimitType.Last */);
}

/**
 * A `QueryStartAtConstraint` is used to exclude documents from the start of a
 * result set returned by a Firestore query.
 * `QueryStartAtConstraint`s are created by invoking {@link (startAt:1)} or
 * {@link (startAfter:1)} and can then be passed to {@link (query:1)} to create a
 * new query instance that also contains this `QueryStartAtConstraint`.
 */ class $l extends vl {
    /**
     * @internal
     */
    constructor(
    /** The type of this query constraint */
    t, e, n) {
        super(), this.type = t, this._docOrFields = e, this._inclusive = n;
    }
    static _create(t, e, n) {
        return new $l(t, e, n);
    }
    _apply(t) {
        const e = Ul(t, this.type, this._docOrFields, this._inclusive);
        return new dh(t.firestore, t.converter, function(t, e) {
            return new Un(t.path, t.collectionGroup, t.explicitOrderBy.slice(), t.filters.slice(), t.limit, t.limitType, e, t.endAt);
        }(t._query, e));
    }
}

function Ol(...t) {
    return $l._create("startAt", t, 
    /*inclusive=*/ !0);
}

function Fl(...t) {
    return $l._create("startAfter", t, 
    /*inclusive=*/ !1);
}

/**
 * A `QueryEndAtConstraint` is used to exclude documents from the end of a
 * result set returned by a Firestore query.
 * `QueryEndAtConstraint`s are created by invoking {@link (endAt:1)} or
 * {@link (endBefore:1)} and can then be passed to {@link (query:1)} to create a new
 * query instance that also contains this `QueryEndAtConstraint`.
 */ class Bl extends vl {
    /**
     * @internal
     */
    constructor(
    /** The type of this query constraint */
    t, e, n) {
        super(), this.type = t, this._docOrFields = e, this._inclusive = n;
    }
    static _create(t, e, n) {
        return new Bl(t, e, n);
    }
    _apply(t) {
        const e = Ul(t, this.type, this._docOrFields, this._inclusive);
        return new dh(t.firestore, t.converter, function(t, e) {
            return new Un(t.path, t.collectionGroup, t.explicitOrderBy.slice(), t.filters.slice(), t.limit, t.limitType, t.startAt, e);
        }(t._query, e));
    }
}

function Ll(...t) {
    return Bl._create("endBefore", t, 
    /*inclusive=*/ !1);
}

function ql(...t) {
    return Bl._create("endAt", t, 
    /*inclusive=*/ !0);
}

/** Helper function to create a bound from a document or fields */ function Ul(t, e, n, s) {
    if (n[0] = util.getModularInstance(n[0]), n[0] instanceof pl) return function(t, e, n, s, i) {
        if (!s) throw new U(q.NOT_FOUND, `Can't use a DocumentSnapshot that doesn't exist for ${n}().`);
        const r = [];
        // Because people expect to continue/end a query at the exact document
        // provided, we need to use the implicit sort order rather than the explicit
        // sort order, because it's guaranteed to contain the document key. That way
        // the position becomes unambiguous and the query continues/ends exactly at
        // the provided document. Without the key (by using the explicit sort
        // orders), multiple documents could match the position, yielding duplicate
        // results.
                for (const n of Hn(t)) if (n.field.isKeyField()) r.push(We(e, s.key)); else {
            const t = s.data.field(n.field);
            if (Ne(t)) throw new U(q.INVALID_ARGUMENT, 'Invalid query. You are trying to start or end a query using a document for which the field "' + n.field + '" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');
            if (null === t) {
                const t = n.field.canonicalString();
                throw new U(q.INVALID_ARGUMENT, `Invalid query. You are trying to start or end a query using a document for which the field '${t}' (used as the orderBy) does not exist.`);
            }
            r.push(t);
        }
        return new hn(r, i);
    }
    /**
 * Converts a list of field values to a `Bound` for the given query.
 */ (t._query, t.firestore._databaseId, e, n[0]._document, s);
    {
        const i = Zh(t.firestore);
        return function(t, e, n, s, i, r) {
            // Use explicit order by's because it has to match the query the user made
            const o = t.explicitOrderBy;
            if (i.length > o.length) throw new U(q.INVALID_ARGUMENT, `Too many arguments provided to ${s}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);
            const u = [];
            for (let r = 0; r < i.length; r++) {
                const c = i[r];
                if (o[r].field.isKeyField()) {
                    if ("string" != typeof c) throw new U(q.INVALID_ARGUMENT, `Invalid query. Expected a string for document ID in ${s}(), but got a ${typeof c}`);
                    if (!Wn(t) && -1 !== c.indexOf("/")) throw new U(q.INVALID_ARGUMENT, `Invalid query. When querying a collection and ordering by documentId(), the value passed to ${s}() must be a plain document ID, but '${c}' contains a slash.`);
                    const n = t.path.child(ut.fromString(c));
                    if (!ht.isDocumentKey(n)) throw new U(q.INVALID_ARGUMENT, `Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${s}() must result in a valid document path, but '${n}' is not because it contains an odd number of segments.`);
                    const i = new ht(n);
                    u.push(We(e, i));
                } else {
                    const t = al(n, s, c);
                    u.push(t);
                }
            }
            return new hn(u, r);
        }
        /**
 * Parses the given `documentIdValue` into a `ReferenceValue`, throwing
 * appropriate errors if the value is anything other than a `DocumentReference`
 * or `string`, or if the string is malformed.
 */ (t._query, t.firestore._databaseId, i, e, n, s);
    }
}

function Kl(t, e, n) {
    if ("string" == typeof (n = util.getModularInstance(n))) {
        if ("" === n) throw new U(q.INVALID_ARGUMENT, "Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");
        if (!Wn(e) && -1 !== n.indexOf("/")) throw new U(q.INVALID_ARGUMENT, `Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);
        const s = e.path.child(ut.fromString(n));
        if (!ht.isDocumentKey(s)) throw new U(q.INVALID_ARGUMENT, `Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${s}' is not because it has an odd number of segments (${s.length}).`);
        return We(t, new ht(s));
    }
    if (n instanceof fh) return We(t, n._key);
    throw new U(q.INVALID_ARGUMENT, `Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${oh(n)}.`);
}

/**
 * Validates that the value passed into a disjunctive filter satisfies all
 * array requirements.
 */ function Gl(t, e) {
    if (!Array.isArray(t) || 0 === t.length) throw new U(q.INVALID_ARGUMENT, `Invalid Query. A non-empty array is required for '${e.toString()}' filters.`);
}

/**
 * Given an operator, returns the set of operators that cannot be used with it.
 *
 * This is not a comprehensive check, and this function should be removed in the
 * long term. Validations should occur in the Firestore backend.
 *
 * Operators in a query must adhere to the following set of rules:
 * 1. Only one inequality per query.
 * 2. `NOT_IN` cannot be used with array, disjunctive, or `NOT_EQUAL` operators.
 */ function Ql(t, e) {
    if (e.isInequality()) {
        const n = zn(t), s = e.field;
        if (null !== n && !n.isEqual(s)) throw new U(q.INVALID_ARGUMENT, `Invalid query. All where filters with an inequality (<, <=, !=, not-in, >, or >=) must be on the same field. But you have inequality filters on '${n.toString()}' and '${s.toString()}'`);
        const i = jn(t);
        null !== i && jl(t, s, i);
    }
    const n = function(t, e) {
        for (const n of t) for (const t of n.getFlattenedFilters()) if (e.indexOf(t.op) >= 0) return t.op;
        return null;
    }(t.filters, function(t) {
        switch (t) {
          case "!=" /* Operator.NOT_EQUAL */ :
            return [ "!=" /* Operator.NOT_EQUAL */ , "not-in" /* Operator.NOT_IN */ ];

          case "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ :
          case "in" /* Operator.IN */ :
            return [ "not-in" /* Operator.NOT_IN */ ];

          case "not-in" /* Operator.NOT_IN */ :
            return [ "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ , "in" /* Operator.IN */ , "not-in" /* Operator.NOT_IN */ , "!=" /* Operator.NOT_EQUAL */ ];

          default:
            return [];
        }
    }(e.op));
    if (null !== n) 
    // Special case when it's a duplicate op to give a slightly clearer error message.
    throw n === e.op ? new U(q.INVALID_ARGUMENT, `Invalid query. You cannot use more than one '${e.op.toString()}' filter.`) : new U(q.INVALID_ARGUMENT, `Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`);
}

function jl(t, e, n) {
    if (!n.isEqual(e)) throw new U(q.INVALID_ARGUMENT, `Invalid query. You have a where filter with an inequality (<, <=, !=, not-in, >, or >=) on field '${e.toString()}' and so you must also use '${e.toString()}' as your first argument to orderBy(), but your first orderBy() is on field '${n.toString()}' instead.`);
}

function zl(t, e) {
    if (!(e instanceof Pl || e instanceof Vl)) throw new U(q.INVALID_ARGUMENT, `Function ${t}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`);
}

class Wl {
    convertValue(t, e = "none") {
        switch (Le(t)) {
          case 0 /* TypeOrder.NullValue */ :
            return null;

          case 1 /* TypeOrder.BooleanValue */ :
            return t.booleanValue;

          case 2 /* TypeOrder.NumberValue */ :
            return Ce(t.integerValue || t.doubleValue);

          case 3 /* TypeOrder.TimestampValue */ :
            return this.convertTimestamp(t.timestampValue);

          case 4 /* TypeOrder.ServerTimestampValue */ :
            return this.convertServerTimestamp(t, e);

          case 5 /* TypeOrder.StringValue */ :
            return t.stringValue;

          case 6 /* TypeOrder.BlobValue */ :
            return this.convertBytes(xe(t.bytesValue));

          case 7 /* TypeOrder.RefValue */ :
            return this.convertReference(t.referenceValue);

          case 8 /* TypeOrder.GeoPointValue */ :
            return this.convertGeoPoint(t.geoPointValue);

          case 9 /* TypeOrder.ArrayValue */ :
            return this.convertArray(t.arrayValue, e);

          case 10 /* TypeOrder.ObjectValue */ :
            return this.convertObject(t.mapValue, e);

          default:
            throw O();
        }
    }
    convertObject(t, e) {
        return this.convertObjectMap(t.fields, e);
    }
    /**
     * @internal
     */    convertObjectMap(t, e = "none") {
        const n = {};
        return ge(t, ((t, s) => {
            n[t] = this.convertValue(s, e);
        })), n;
    }
    convertGeoPoint(t) {
        return new jh(Ce(t.latitude), Ce(t.longitude));
    }
    convertArray(t, e) {
        return (t.values || []).map((t => this.convertValue(t, e)));
    }
    convertServerTimestamp(t, e) {
        switch (e) {
          case "previous":
            const n = ke(t);
            return null == n ? null : this.convertValue(n, e);

          case "estimate":
            return this.convertTimestamp(Me(t));

          default:
            return null;
        }
    }
    convertTimestamp(t) {
        const e = De(t);
        return new it(e.seconds, e.nanos);
    }
    convertDocumentKey(t, e) {
        const n = ut.fromString(t);
        F(ur(n));
        const s = new Oe(n.get(1), n.get(3)), i = new ht(n.popFirst(5));
        return s.isEqual(e) || 
        // TODO(b/64130202): Somehow support foreign references.
        k(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`), 
        i;
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Converts custom model object of type T into `DocumentData` by applying the
 * converter if it exists.
 *
 * This function is used when converting user objects to `DocumentData`
 * because we want to provide the user with a more specific error message if
 * their `set()` or fails due to invalid data originating from a `toFirestore()`
 * call.
 */ function Hl(t, e, n) {
    let s;
    // Cast to `any` in order to satisfy the union type constraint on
    // toFirestore().
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return s = t ? n && (n.merge || n.mergeFields) ? t.toFirestore(e, n) : t.toFirestore(e) : e, 
    s;
}

class Jl extends Wl {
    constructor(t) {
        super(), this.firestore = t;
    }
    convertBytes(t) {
        return new Uh(t);
    }
    convertReference(t) {
        const e = this.convertDocumentKey(t, this.firestore._databaseId);
        return new fh(this.firestore, /* converter= */ null, e);
    }
}

/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * Create an AggregateField object that can be used to compute the sum of
 * a specified field over a range of documents in the result set of a query.
 * @param field Specifies the field to sum across the result set.
 * @internal TODO (sum/avg) remove when public
 */ function Yl(t) {
    return new Lh("sum", wl("sum", t));
}

/**
 * Create an AggregateField object that can be used to compute the average of
 * a specified field over a range of documents in the result set of a query.
 * @param field Specifies the field to average across the result set.
 * @internal TODO (sum/avg) remove when public
 */ function Xl(t) {
    return new Lh("avg", wl("average", t));
}

/**
 * Create an AggregateField object that can be used to compute the count of
 * documents in the result set of a query.
 * @internal TODO (sum/avg) remove when public
 */ function Zl() {
    return new Lh("count");
}

/**
 * Compares two 'AggregateField` instances for equality.
 *
 * @param left Compare this AggregateField to the `right`.
 * @param right Compare this AggregateField to the `left`.
 * @internal TODO (sum/avg) remove when public
 */ function tf(t, e) {
    var n, s;
    return t instanceof Lh && e instanceof Lh && t._aggregateType === e._aggregateType && (null === (n = t._internalFieldPath) || void 0 === n ? void 0 : n.canonicalString()) === (null === (s = e._internalFieldPath) || void 0 === s ? void 0 : s.canonicalString());
}

/**
 * Compares two `AggregateQuerySnapshot` instances for equality.
 *
 * Two `AggregateQuerySnapshot` instances are considered "equal" if they have
 * underlying queries that compare equal, and the same data.
 *
 * @param left - The first `AggregateQuerySnapshot` to compare.
 * @param right - The second `AggregateQuerySnapshot` to compare.
 *
 * @returns `true` if the objects are "equal", as defined above, or `false`
 * otherwise.
 */ function ef(t, e) {
    return ph(t.query, e.query) && util.deepEqual(t.data(), e.data());
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Metadata about a snapshot, describing the state of the snapshot.
 */ class nf {
    /** @hideconstructor */
    constructor(t, e) {
        this.hasPendingWrites = t, this.fromCache = e;
    }
    /**
     * Returns true if this `SnapshotMetadata` is equal to the provided one.
     *
     * @param other - The `SnapshotMetadata` to compare against.
     * @returns true if this `SnapshotMetadata` is equal to the provided one.
     */    isEqual(t) {
        return this.hasPendingWrites === t.hasPendingWrites && this.fromCache === t.fromCache;
    }
}

/**
 * A `DocumentSnapshot` contains data read from a document in your Firestore
 * database. The data can be extracted with `.data()` or `.get(<field>)` to
 * get a specific field.
 *
 * For a `DocumentSnapshot` that points to a non-existing document, any data
 * access will return 'undefined'. You can use the `exists()` method to
 * explicitly verify a document's existence.
 */ class sf extends pl {
    /** @hideconstructor protected */
    constructor(t, e, n, s, i, r) {
        super(t, e, n, s, r), this._firestore = t, this._firestoreImpl = t, this.metadata = i;
    }
    /**
     * Returns whether or not the data exists. True if the document exists.
     */    exists() {
        return super.exists();
    }
    /**
     * Retrieves all fields in the document as an `Object`. Returns `undefined` if
     * the document doesn't exist.
     *
     * By default, `serverTimestamp()` values that have not yet been
     * set to their final value will be returned as `null`. You can override
     * this by passing an options object.
     *
     * @param options - An options object to configure how data is retrieved from
     * the snapshot (for example the desired behavior for server timestamps that
     * have not yet been set to their final value).
     * @returns An `Object` containing all fields in the document or `undefined` if
     * the document doesn't exist.
     */    data(t = {}) {
        if (this._document) {
            if (this._converter) {
                // We only want to use the converter and create a new DocumentSnapshot
                // if a converter has been provided.
                const e = new rf(this._firestore, this._userDataWriter, this._key, this._document, this.metadata, 
                /* converter= */ null);
                return this._converter.fromFirestore(e, t);
            }
            return this._userDataWriter.convertValue(this._document.data.value, t.serverTimestamps);
        }
    }
    /**
     * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
     * document or field doesn't exist.
     *
     * By default, a `serverTimestamp()` that has not yet been set to
     * its final value will be returned as `null`. You can override this by
     * passing an options object.
     *
     * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
     * field.
     * @param options - An options object to configure how the field is retrieved
     * from the snapshot (for example the desired behavior for server timestamps
     * that have not yet been set to their final value).
     * @returns The data at the specified field location or undefined if no such
     * field exists in the document.
     */
    // We are using `any` here to avoid an explicit cast by our users.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(t, e = {}) {
        if (this._document) {
            const n = this._document.data.field(Tl("DocumentSnapshot.get", t));
            if (null !== n) return this._userDataWriter.convertValue(n, e.serverTimestamps);
        }
    }
}

/**
 * A `QueryDocumentSnapshot` contains data read from a document in your
 * Firestore database as part of a query. The document is guaranteed to exist
 * and its data can be extracted with `.data()` or `.get(<field>)` to get a
 * specific field.
 *
 * A `QueryDocumentSnapshot` offers the same API surface as a
 * `DocumentSnapshot`. Since query results contain only existing documents, the
 * `exists` property will always be true and `data()` will never return
 * 'undefined'.
 */ class rf extends sf {
    /**
     * Retrieves all fields in the document as an `Object`.
     *
     * By default, `serverTimestamp()` values that have not yet been
     * set to their final value will be returned as `null`. You can override
     * this by passing an options object.
     *
     * @override
     * @param options - An options object to configure how data is retrieved from
     * the snapshot (for example the desired behavior for server timestamps that
     * have not yet been set to their final value).
     * @returns An `Object` containing all fields in the document.
     */
    data(t = {}) {
        return super.data(t);
    }
}

/**
 * A `QuerySnapshot` contains zero or more `DocumentSnapshot` objects
 * representing the results of a query. The documents can be accessed as an
 * array via the `docs` property or enumerated using the `forEach` method. The
 * number of documents can be determined via the `empty` and `size`
 * properties.
 */ class of {
    /** @hideconstructor */
    constructor(t, e, n, s) {
        this._firestore = t, this._userDataWriter = e, this._snapshot = s, this.metadata = new nf(s.hasPendingWrites, s.fromCache), 
        this.query = n;
    }
    /** An array of all the documents in the `QuerySnapshot`. */    get docs() {
        const t = [];
        return this.forEach((e => t.push(e))), t;
    }
    /** The number of documents in the `QuerySnapshot`. */    get size() {
        return this._snapshot.docs.size;
    }
    /** True if there are no documents in the `QuerySnapshot`. */    get empty() {
        return 0 === this.size;
    }
    /**
     * Enumerates all of the documents in the `QuerySnapshot`.
     *
     * @param callback - A callback to be called with a `QueryDocumentSnapshot` for
     * each document in the snapshot.
     * @param thisArg - The `this` binding for the callback.
     */    forEach(t, e) {
        this._snapshot.docs.forEach((n => {
            t.call(e, new rf(this._firestore, this._userDataWriter, n.key, n, new nf(this._snapshot.mutatedKeys.has(n.key), this._snapshot.fromCache), this.query.converter));
        }));
    }
    /**
     * Returns an array of the documents changes since the last snapshot. If this
     * is the first snapshot, all documents will be in the list as 'added'
     * changes.
     *
     * @param options - `SnapshotListenOptions` that control whether metadata-only
     * changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger
     * snapshot events.
     */    docChanges(t = {}) {
        const e = !!t.includeMetadataChanges;
        if (e && this._snapshot.excludesMetadataChanges) throw new U(q.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
        return this._cachedChanges && this._cachedChangesIncludeMetadataChanges === e || (this._cachedChanges = 
        /** Calculates the array of `DocumentChange`s for a given `ViewSnapshot`. */
        function(t, e) {
            if (t._snapshot.oldDocs.isEmpty()) {
                let e = 0;
                return t._snapshot.docChanges.map((n => {
                    const s = new rf(t._firestore, t._userDataWriter, n.doc.key, n.doc, new nf(t._snapshot.mutatedKeys.has(n.doc.key), t._snapshot.fromCache), t.query.converter);
                    return n.doc, {
                        type: "added",
                        doc: s,
                        oldIndex: -1,
                        newIndex: e++
                    };
                }));
            }
            {
                // A `DocumentSet` that is updated incrementally as changes are applied to use
                // to lookup the index of a document.
                let n = t._snapshot.oldDocs;
                return t._snapshot.docChanges.filter((t => e || 3 /* ChangeType.Metadata */ !== t.type)).map((e => {
                    const s = new rf(t._firestore, t._userDataWriter, e.doc.key, e.doc, new nf(t._snapshot.mutatedKeys.has(e.doc.key), t._snapshot.fromCache), t.query.converter);
                    let i = -1, r = -1;
                    return 0 /* ChangeType.Added */ !== e.type && (i = n.indexOf(e.doc.key), n = n.delete(e.doc.key)), 
                    1 /* ChangeType.Removed */ !== e.type && (n = n.add(e.doc), r = n.indexOf(e.doc.key)), 
                    {
                        type: uf(e.type),
                        doc: s,
                        oldIndex: i,
                        newIndex: r
                    };
                }));
            }
        }(this, e), this._cachedChangesIncludeMetadataChanges = e), this._cachedChanges;
    }
}

function uf(t) {
    switch (t) {
      case 0 /* ChangeType.Added */ :
        return "added";

      case 2 /* ChangeType.Modified */ :
      case 3 /* ChangeType.Metadata */ :
        return "modified";

      case 1 /* ChangeType.Removed */ :
        return "removed";

      default:
        return O();
    }
}

// TODO(firestoreexp): Add tests for snapshotEqual with different snapshot
// metadata
/**
 * Returns true if the provided snapshots are equal.
 *
 * @param left - A snapshot to compare.
 * @param right - A snapshot to compare.
 * @returns true if the snapshots are equal.
 */ function cf(t, e) {
    return t instanceof sf && e instanceof sf ? t._firestore === e._firestore && t._key.isEqual(e._key) && (null === t._document ? null === e._document : t._document.isEqual(e._document)) && t._converter === e._converter : t instanceof of && e instanceof of && (t._firestore === e._firestore && ph(t.query, e.query) && t.metadata.isEqual(e.metadata) && t._snapshot.isEqual(e._snapshot));
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Reads the document referred to by this `DocumentReference`.
 *
 * Note: `getDoc()` attempts to provide up-to-date data when possible by waiting
 * for data from the server, but it may return cached data or fail if you are
 * offline and the server cannot be reached. To specify this behavior, invoke
 * {@link getDocFromCache} or {@link getDocFromServer}.
 *
 * @param reference - The reference of the document to fetch.
 * @returns A Promise resolved with a `DocumentSnapshot` containing the
 * current document contents.
 */ function af(t) {
    t = uh(t, fh);
    const e = uh(t.firestore, vh);
    return za(bh(e), t._key).then((n => Af(e, t, n)));
}

class hf extends Wl {
    constructor(t) {
        super(), this.firestore = t;
    }
    convertBytes(t) {
        return new Uh(t);
    }
    convertReference(t) {
        const e = this.convertDocumentKey(t, this.firestore._databaseId);
        return new fh(this.firestore, /* converter= */ null, e);
    }
}

/**
 * Reads the document referred to by this `DocumentReference` from cache.
 * Returns an error if the document is not currently cached.
 *
 * @returns A `Promise` resolved with a `DocumentSnapshot` containing the
 * current document contents.
 */ function lf(t) {
    t = uh(t, fh);
    const e = uh(t.firestore, vh), n = bh(e), s = new hf(e);
    return ja(n, t._key).then((n => new sf(e, s, t._key, n, new nf(null !== n && n.hasLocalMutations, 
    /* fromCache= */ !0), t.converter)));
}

/**
 * Reads the document referred to by this `DocumentReference` from the server.
 * Returns an error if the network is not available.
 *
 * @returns A `Promise` resolved with a `DocumentSnapshot` containing the
 * current document contents.
 */ function ff(t) {
    t = uh(t, fh);
    const e = uh(t.firestore, vh);
    return za(bh(e), t._key, {
        source: "server"
    }).then((n => Af(e, t, n)));
}

/**
 * Executes the query and returns the results as a `QuerySnapshot`.
 *
 * Note: `getDocs()` attempts to provide up-to-date data when possible by
 * waiting for data from the server, but it may return cached data or fail if
 * you are offline and the server cannot be reached. To specify this behavior,
 * invoke {@link getDocsFromCache} or {@link getDocsFromServer}.
 *
 * @returns A `Promise` that will be resolved with the results of the query.
 */ function df(t) {
    t = uh(t, dh);
    const e = uh(t.firestore, vh), n = bh(e), s = new hf(e);
    return El(t._query), Ha(n, t._query).then((n => new of(e, s, t, n)));
}

/**
 * Executes the query and returns the results as a `QuerySnapshot` from cache.
 * Returns an empty result set if no documents matching the query are currently
 * cached.
 *
 * @returns A `Promise` that will be resolved with the results of the query.
 */ function wf(t) {
    t = uh(t, dh);
    const e = uh(t.firestore, vh), n = bh(e), s = new hf(e);
    return Wa(n, t._query).then((n => new of(e, s, t, n)));
}

/**
 * Executes the query and returns the results as a `QuerySnapshot` from the
 * server. Returns an error if the network is not available.
 *
 * @returns A `Promise` that will be resolved with the results of the query.
 */ function _f(t) {
    t = uh(t, dh);
    const e = uh(t.firestore, vh), n = bh(e), s = new hf(e);
    return Ha(n, t._query, {
        source: "server"
    }).then((n => new of(e, s, t, n)));
}

function mf(t, e, n) {
    t = uh(t, fh);
    const s = uh(t.firestore, vh), i = Hl(t.converter, e, n);
    return Ef(s, [ tl(Zh(s), "setDoc", t._key, i, null !== t.converter, n).toMutation(t._key, Fs.none()) ]);
}

function gf(t, e, n, ...s) {
    t = uh(t, fh);
    const i = uh(t.firestore, vh), r = Zh(i);
    let o;
    o = "string" == typeof (
    // For Compat types, we have to "extract" the underlying types before
    // performing validation.
    e = util.getModularInstance(e)) || e instanceof Kh ? cl(r, "updateDoc", t._key, e, n, s) : ul(r, "updateDoc", t._key, e);
    return Ef(i, [ o.toMutation(t._key, Fs.exists(!0)) ]);
}

/**
 * Deletes the document referred to by the specified `DocumentReference`.
 *
 * @param reference - A reference to the document to delete.
 * @returns A Promise resolved once the document has been successfully
 * deleted from the backend (note that it won't resolve while you're offline).
 */ function yf(t) {
    return Ef(uh(t.firestore, vh), [ new Ys(t._key, Fs.none()) ]);
}

/**
 * Add a new document to specified `CollectionReference` with the given data,
 * assigning it a document ID automatically.
 *
 * @param reference - A reference to the collection to add this document to.
 * @param data - An Object containing the data for the new document.
 * @returns A `Promise` resolved with a `DocumentReference` pointing to the
 * newly created document after it has been written to the backend (Note that it
 * won't resolve while you're offline).
 */ function pf(t, e) {
    const n = uh(t.firestore, vh), s = gh(t), i = Hl(t.converter, e);
    return Ef(n, [ tl(Zh(t.firestore), "addDoc", s._key, i, null !== t.converter, {}).toMutation(s._key, Fs.exists(!1)) ]).then((() => s));
}

function If(t, ...e) {
    var n, s, i;
    t = util.getModularInstance(t);
    let r = {
        includeMetadataChanges: !1
    }, o = 0;
    "object" != typeof e[o] || Th(e[o]) || (r = e[o], o++);
    const u = {
        includeMetadataChanges: r.includeMetadataChanges
    };
    if (Th(e[o])) {
        const t = e[o];
        e[o] = null === (n = t.next) || void 0 === n ? void 0 : n.bind(t), e[o + 1] = null === (s = t.error) || void 0 === s ? void 0 : s.bind(t), 
        e[o + 2] = null === (i = t.complete) || void 0 === i ? void 0 : i.bind(t);
    }
    let c, a, h;
    if (t instanceof fh) a = uh(t.firestore, vh), h = Gn(t._key.path), c = {
        next: n => {
            e[o] && e[o](Af(a, t, n));
        },
        error: e[o + 1],
        complete: e[o + 2]
    }; else {
        const n = uh(t, dh);
        a = uh(n.firestore, vh), h = n._query;
        const s = new hf(a);
        c = {
            next: t => {
                e[o] && e[o](new of(a, s, n, t));
            },
            error: e[o + 1],
            complete: e[o + 2]
        }, El(t._query);
    }
    return function(t, e, n, s) {
        const i = new Va(s), r = new Nc(e, i, n);
        return t.asyncQueue.enqueueAndForget((async () => Vc(await Ka(t), r))), () => {
            i.Dc(), t.asyncQueue.enqueueAndForget((async () => Sc(await Ka(t), r)));
        };
    }(bh(a), h, u, c);
}

function Tf(t, e) {
    return Ja(bh(t = uh(t, vh)), Th(e) ? e : {
        next: e
    });
}

/**
 * Locally writes `mutations` on the async queue.
 * @internal
 */ function Ef(t, e) {
    return function(t, e) {
        const n = new K;
        return t.asyncQueue.enqueueAndForget((async () => zc(await qa(t), e, n))), n.promise;
    }(bh(t), e);
}

/**
 * Converts a {@link ViewSnapshot} that contains the single document specified by `ref`
 * to a {@link DocumentSnapshot}.
 */ function Af(t, e, n) {
    const s = n.docs.get(e._key), i = new hf(t);
    return new sf(t, i, e._key, s, new nf(n.hasPendingWrites, n.fromCache), e.converter);
}

/**
 * @license
 * Copyright 2022 Google LLC
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
/**
 * Calculates the number of documents in the result set of the given query,
 * without actually downloading the documents.
 *
 * Using this function to count the documents is efficient because only the
 * final count, not the documents' data, is downloaded. This function can even
 * count the documents if the result set would be prohibitively large to
 * download entirely (e.g. thousands of documents).
 *
 * The result received from the server is presented, unaltered, without
 * considering any local state. That is, documents in the local cache are not
 * taken into consideration, neither are local modifications not yet
 * synchronized with the server. Previously-downloaded results, if any, are not
 * used: every request using this source necessarily involves a round trip to
 * the server.
 *
 * @param query - The query whose result set size to calculate.
 * @returns A Promise that will be resolved with the count; the count can be
 * retrieved from `snapshot.data().count`, where `snapshot` is the
 * `AggregateQuerySnapshot` to which the returned Promise resolves.
 */ function vf(t) {
    return Rf(t, {
        count: Zl()
    });
}

/**
 * Calculates the specified aggregations over the documents in the result
 * set of the given query, without actually downloading the documents.
 *
 * Using this function to perform aggregations is efficient because only the
 * final aggregation values, not the documents' data, is downloaded. This
 * function can even perform aggregations of the documents if the result set
 * would be prohibitively large to download entirely (e.g. thousands of documents).
 *
 * The result received from the server is presented, unaltered, without
 * considering any local state. That is, documents in the local cache are not
 * taken into consideration, neither are local modifications not yet
 * synchronized with the server. Previously-downloaded results, if any, are not
 * used: every request using this source necessarily involves a round trip to
 * the server.
 *
 * @param query The query whose result set to aggregate over.
 * @param aggregateSpec An `AggregateSpec` object that specifies the aggregates
 * to perform over the result set. The AggregateSpec specifies aliases for each
 * aggregate, which can be used to retrieve the aggregate result.
 * @example
 * ```typescript
 * const aggregateSnapshot = await getAggregateFromServer(query, {
 *   countOfDocs: count(),
 *   totalHours: sum('hours'),
 *   averageScore: average('score')
 * });
 *
 * const countOfDocs: number = aggregateSnapshot.data().countOfDocs;
 * const totalHours: number = aggregateSnapshot.data().totalHours;
 * const averageScore: number | null = aggregateSnapshot.data().averageScore;
 * ```
 * @internal TODO (sum/avg) remove when public
 */ function Rf(t, e) {
    const n = uh(t.firestore, vh), s = bh(n), i = function(t, e) {
        const n = [];
        for (const s in t) Object.prototype.hasOwnProperty.call(t, s) && n.push(e(t[s], s, t));
        return n;
    }(e, ((t, e) => new ni(e, t._aggregateType, t._internalFieldPath)));
    // Run the aggregation and convert the results
    return function(t, e, n) {
        const s = new K;
        return t.asyncQueue.enqueueAndForget((async () => {
            // TODO (sum/avg) should we update this to use the event manager?
            // Implement and call executeAggregateQueryViaSnapshotListener, similar
            // to the implementation in firestoreClientGetDocumentsViaSnapshotListener
            // above
            try {
                // TODO(b/277628384): check `canUseNetwork()` and handle multi-tab.
                const i = await Ua(t);
                s.resolve(Gu(i, e, n));
            } catch (t) {
                s.reject(t);
            }
        })), s.promise;
    }(s, t._query, i).then((e => 
    /**
 * Converts the core aggregration result to an `AggregateQuerySnapshot`
 * that can be returned to the consumer.
 * @param query
 * @param aggregateResult Core aggregation result
 * @internal
 */
    function(t, e, n) {
        const s = new hf(t);
        return new qh(e, s, n);
    }
    /**
 * @license
 * Copyright 2023 Google LLC
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
 */ (n, t, e)));
}

class Pf {
    constructor(t) {
        this.kind = "memory", this._onlineComponentProvider = new Pa, (null == t ? void 0 : t.garbageCollector) ? this._offlineComponentProvider = t.garbageCollector._offlineComponentProvider : this._offlineComponentProvider = new Ea;
    }
    toJSON() {
        return {
            kind: this.kind
        };
    }
}

class bf {
    constructor(t) {
        let e;
        this.kind = "persistent", (null == t ? void 0 : t.tabManager) ? (t.tabManager._initialize(t), 
        e = t.tabManager) : (e = $f(void 0), e._initialize(t)), this._onlineComponentProvider = e._onlineComponentProvider, 
        this._offlineComponentProvider = e._offlineComponentProvider;
    }
    toJSON() {
        return {
            kind: this.kind
        };
    }
}

class Vf {
    constructor() {
        this.kind = "memoryEager", this._offlineComponentProvider = new Ea;
    }
    toJSON() {
        return {
            kind: this.kind
        };
    }
}

class Sf {
    constructor(t) {
        this.kind = "memoryLru", this._offlineComponentProvider = new Aa(t);
    }
    toJSON() {
        return {
            kind: this.kind
        };
    }
}

/**
 * Creates an instance of `MemoryEagerGarbageCollector`. This is also the
 * default garbage collector unless it is explicitly specified otherwise.
 */ function Df() {
    return new Vf;
}

/**
 * Creates an instance of `MemoryLruGarbageCollector`.
 *
 * A target size can be specified as part of the setting parameter. The
 * collector will start deleting documents once the cache size exceeds
 * the given size. The default cache size is 40MB (40 * 1024 * 1024 bytes).
 */ function Cf(t) {
    return new Sf(null == t ? void 0 : t.cacheSizeBytes);
}

/**
 * Creates an instance of `MemoryLocalCache`. The instance can be set to
 * `FirestoreSettings.cache` to tell the SDK which cache layer to use.
 */ function xf(t) {
    return new Pf(t);
}

/**
 * Creates an instance of `PersistentLocalCache`. The instance can be set to
 * `FirestoreSettings.cache` to tell the SDK which cache layer to use.
 *
 * Persistent cache cannot be used in a Node.js environment.
 */ function Nf(t) {
    return new bf(t);
}

class kf {
    constructor(t) {
        this.forceOwnership = t, this.kind = "persistentSingleTab";
    }
    toJSON() {
        return {
            kind: this.kind
        };
    }
    /**
     * @internal
     */    _initialize(t) {
        this._onlineComponentProvider = new Pa, this._offlineComponentProvider = new va(this._onlineComponentProvider, null == t ? void 0 : t.cacheSizeBytes, this.forceOwnership);
    }
}

class Mf {
    constructor() {
        this.kind = "PersistentMultipleTab";
    }
    toJSON() {
        return {
            kind: this.kind
        };
    }
    /**
     * @internal
     */    _initialize(t) {
        this._onlineComponentProvider = new Pa, this._offlineComponentProvider = new Ra(this._onlineComponentProvider, null == t ? void 0 : t.cacheSizeBytes);
    }
}

/**
 * Creates an instance of `PersistentSingleTabManager`.
 *
 * @param settings Configures the created tab manager.
 */ function $f(t) {
    return new kf(null == t ? void 0 : t.forceOwnership);
}

/**
 * Creates an instance of `PersistentMultipleTabManager`.
 */ function Of() {
    return new Mf;
}

/**
 * @license
 * Copyright 2022 Google LLC
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
 */ const Ff = {
    maxAttempts: 5
};

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * A write batch, used to perform multiple writes as a single atomic unit.
 *
 * A `WriteBatch` object can be acquired by calling {@link writeBatch}. It
 * provides methods for adding writes to the write batch. None of the writes
 * will be committed (or visible locally) until {@link WriteBatch.commit} is
 * called.
 */
class Bf {
    /** @hideconstructor */
    constructor(t, e) {
        this._firestore = t, this._commitHandler = e, this._mutations = [], this._committed = !1, 
        this._dataReader = Zh(t);
    }
    set(t, e, n) {
        this._verifyNotCommitted();
        const s = Lf(t, this._firestore), i = Hl(s.converter, e, n), r = tl(this._dataReader, "WriteBatch.set", s._key, i, null !== s.converter, n);
        return this._mutations.push(r.toMutation(s._key, Fs.none())), this;
    }
    update(t, e, n, ...s) {
        this._verifyNotCommitted();
        const i = Lf(t, this._firestore);
        // For Compat types, we have to "extract" the underlying types before
        // performing validation.
                let r;
        return r = "string" == typeof (e = util.getModularInstance(e)) || e instanceof Kh ? cl(this._dataReader, "WriteBatch.update", i._key, e, n, s) : ul(this._dataReader, "WriteBatch.update", i._key, e), 
        this._mutations.push(r.toMutation(i._key, Fs.exists(!0))), this;
    }
    /**
     * Deletes the document referred to by the provided {@link DocumentReference}.
     *
     * @param documentRef - A reference to the document to be deleted.
     * @returns This `WriteBatch` instance. Used for chaining method calls.
     */    delete(t) {
        this._verifyNotCommitted();
        const e = Lf(t, this._firestore);
        return this._mutations = this._mutations.concat(new Ys(e._key, Fs.none())), this;
    }
    /**
     * Commits all of the writes in this write batch as a single atomic unit.
     *
     * The result of these writes will only be reflected in document reads that
     * occur after the returned promise resolves. If the client is offline, the
     * write fails. If you would like to see local modifications or buffer writes
     * until the client is online, use the full Firestore SDK.
     *
     * @returns A `Promise` resolved once all of the writes in the batch have been
     * successfully written to the backend as an atomic unit (note that it won't
     * resolve while you're offline).
     */    commit() {
        return this._verifyNotCommitted(), this._committed = !0, this._mutations.length > 0 ? this._commitHandler(this._mutations) : Promise.resolve();
    }
    _verifyNotCommitted() {
        if (this._committed) throw new U(q.FAILED_PRECONDITION, "A write batch can no longer be used after commit() has been called.");
    }
}

function Lf(t, e) {
    if ((t = util.getModularInstance(t)).firestore !== e) throw new U(q.INVALID_ARGUMENT, "Provided document reference is from a different Firestore instance.");
    return t;
}

/**
 * @license
 * Copyright 2020 Google LLC
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
// TODO(mrschmidt) Consider using `BaseTransaction` as the base class in the
// legacy SDK.
/**
 * A reference to a transaction.
 *
 * The `Transaction` object passed to a transaction's `updateFunction` provides
 * the methods to read and write data within the transaction context. See
 * {@link runTransaction}.
 */
/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * A reference to a transaction.
 *
 * The `Transaction` object passed to a transaction's `updateFunction` provides
 * the methods to read and write data within the transaction context. See
 * {@link runTransaction}.
 */
class qf extends class {
    /** @hideconstructor */
    constructor(t, e) {
        this._firestore = t, this._transaction = e, this._dataReader = Zh(t);
    }
    /**
     * Reads the document referenced by the provided {@link DocumentReference}.
     *
     * @param documentRef - A reference to the document to be read.
     * @returns A `DocumentSnapshot` with the read data.
     */    get(t) {
        const e = Lf(t, this._firestore), n = new Jl(this._firestore);
        return this._transaction.lookup([ e._key ]).then((t => {
            if (!t || 1 !== t.length) return O();
            const s = t[0];
            if (s.isFoundDocument()) return new pl(this._firestore, n, s.key, s, e.converter);
            if (s.isNoDocument()) return new pl(this._firestore, n, e._key, null, e.converter);
            throw O();
        }));
    }
    set(t, e, n) {
        const s = Lf(t, this._firestore), i = Hl(s.converter, e, n), r = tl(this._dataReader, "Transaction.set", s._key, i, null !== s.converter, n);
        return this._transaction.set(s._key, r), this;
    }
    update(t, e, n, ...s) {
        const i = Lf(t, this._firestore);
        // For Compat types, we have to "extract" the underlying types before
        // performing validation.
                let r;
        return r = "string" == typeof (e = util.getModularInstance(e)) || e instanceof Kh ? cl(this._dataReader, "Transaction.update", i._key, e, n, s) : ul(this._dataReader, "Transaction.update", i._key, e), 
        this._transaction.update(i._key, r), this;
    }
    /**
     * Deletes the document referred to by the provided {@link DocumentReference}.
     *
     * @param documentRef - A reference to the document to be deleted.
     * @returns This `Transaction` instance. Used for chaining method calls.
     */    delete(t) {
        const e = Lf(t, this._firestore);
        return this._transaction.delete(e._key), this;
    }
} {
    // This class implements the same logic as the Transaction API in the Lite SDK
    // but is subclassed in order to return its own DocumentSnapshot types.
    /** @hideconstructor */
    constructor(t, e) {
        super(t, e), this._firestore = t;
    }
    /**
     * Reads the document referenced by the provided {@link DocumentReference}.
     *
     * @param documentRef - A reference to the document to be read.
     * @returns A `DocumentSnapshot` with the read data.
     */    get(t) {
        const e = Lf(t, this._firestore), n = new hf(this._firestore);
        return super.get(t).then((t => new sf(this._firestore, n, e._key, t._document, new nf(
        /* hasPendingWrites= */ !1, 
        /* fromCache= */ !1), e.converter)));
    }
}

/**
 * Executes the given `updateFunction` and then attempts to commit the changes
 * applied within the transaction. If any document read within the transaction
 * has changed, Cloud Firestore retries the `updateFunction`. If it fails to
 * commit after 5 attempts, the transaction fails.
 *
 * The maximum number of writes allowed in a single transaction is 500.
 *
 * @param firestore - A reference to the Firestore database to run this
 * transaction against.
 * @param updateFunction - The function to execute within the transaction
 * context.
 * @param options - An options object to configure maximum number of attempts to
 * commit.
 * @returns If the transaction completed successfully or was explicitly aborted
 * (the `updateFunction` returned a failed promise), the promise returned by the
 * `updateFunction `is returned here. Otherwise, if the transaction failed, a
 * rejected promise with the corresponding failure error is returned.
 */ function Uf(t, e, n) {
    t = uh(t, vh);
    const s = Object.assign(Object.assign({}, Ff), n);
    !function(t) {
        if (t.maxAttempts < 1) throw new U(q.INVALID_ARGUMENT, "Max attempts must be at least 1");
    }(s);
    return function(t, e, n) {
        const s = new K;
        return t.asyncQueue.enqueueAndForget((async () => {
            const i = await Ua(t);
            new Ca(t.asyncQueue, i, n, e, s).run();
        })), s.promise;
    }(bh(t), (n => e(new qf(t, n))), s);
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Returns a sentinel for use with {@link @firebase/firestore/lite#(updateDoc:1)} or
 * {@link @firebase/firestore/lite#(setDoc:1)} with `{merge: true}` to mark a field for deletion.
 */ function Kf() {
    return new el("deleteField");
}

/**
 * Returns a sentinel used with {@link @firebase/firestore/lite#(setDoc:1)} or {@link @firebase/firestore/lite#(updateDoc:1)} to
 * include a server-generated timestamp in the written data.
 */ function Gf() {
    return new sl("serverTimestamp");
}

/**
 * Returns a special value that can be used with {@link @firebase/firestore/lite#(setDoc:1)} or {@link
 * @firebase/firestore/lite#(updateDoc:1)} that tells the server to union the given elements with any array
 * value that already exists on the server. Each specified element that doesn't
 * already exist in the array will be added to the end. If the field being
 * modified is not already an array it will be overwritten with an array
 * containing exactly the specified elements.
 *
 * @param elements - The elements to union into the array.
 * @returns The `FieldValue` sentinel for use in a call to `setDoc()` or
 * `updateDoc()`.
 */ function Qf(...t) {
    // NOTE: We don't actually parse the data until it's used in set() or
    // update() since we'd need the Firestore instance to do this.
    return new il("arrayUnion", t);
}

/**
 * Returns a special value that can be used with {@link (setDoc:1)} or {@link
 * updateDoc:1} that tells the server to remove the given elements from any
 * array value that already exists on the server. All instances of each element
 * specified will be removed from the array. If the field being modified is not
 * already an array it will be overwritten with an empty array.
 *
 * @param elements - The elements to remove from the array.
 * @returns The `FieldValue` sentinel for use in a call to `setDoc()` or
 * `updateDoc()`
 */ function jf(...t) {
    // NOTE: We don't actually parse the data until it's used in set() or
    // update() since we'd need the Firestore instance to do this.
    return new rl("arrayRemove", t);
}

/**
 * Returns a special value that can be used with {@link @firebase/firestore/lite#(setDoc:1)} or {@link
 * @firebase/firestore/lite#(updateDoc:1)} that tells the server to increment the field's current value by
 * the given value.
 *
 * If either the operand or the current field value uses floating point
 * precision, all arithmetic follows IEEE 754 semantics. If both values are
 * integers, values outside of JavaScript's safe number range
 * (`Number.MIN_SAFE_INTEGER` to `Number.MAX_SAFE_INTEGER`) are also subject to
 * precision loss. Furthermore, once processed by the Firestore backend, all
 * integer operations are capped between -2^63 and 2^63-1.
 *
 * If the current field value is not of type `number`, or if the field does not
 * yet exist, the transformation sets the field to the given value.
 *
 * @param n - The value to increment by.
 * @returns The `FieldValue` sentinel for use in a call to `setDoc()` or
 * `updateDoc()`
 */ function zf(t) {
    return new ol("increment", t);
}

/**
 * @license
 * Copyright 2020 Google LLC
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
/**
 * Creates a write batch, used for performing multiple writes as a single
 * atomic operation. The maximum number of writes allowed in a single {@link WriteBatch}
 * is 500.
 *
 * Unlike transactions, write batches are persisted offline and therefore are
 * preferable when you don't need to condition your writes on read data.
 *
 * @returns A {@link WriteBatch} that can be used to atomically execute multiple
 * writes.
 */ function Wf(t) {
    return bh(t = uh(t, vh)), new Bf(t, (e => Ef(t, e)));
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
 */ function Hf(t, e) {
    var n;
    const s = bh(t = uh(t, vh));
    if (!s._uninitializedComponentsProvider || "memory" === (null === (n = s._uninitializedComponentsProvider) || void 0 === n ? void 0 : n._offlineKind)) 
    // PORTING NOTE: We don't return an error if the user has not enabled
    // persistence since `enableIndexeddbPersistence()` can fail on the Web.
    return M("Cannot enable indexes when persistence is disabled"), Promise.resolve();
    const i = function(t) {
        const e = "string" == typeof t ? function(t) {
            try {
                return JSON.parse(t);
            } catch (t) {
                throw new U(q.INVALID_ARGUMENT, "Failed to parse JSON: " + (null == t ? void 0 : t.message));
            }
        }(t) : t, n = [];
        if (Array.isArray(e.indexes)) for (const t of e.indexes) {
            const e = Jf(t, "collectionGroup"), s = [];
            if (Array.isArray(t.fields)) for (const e of t.fields) {
                const t = ml("setIndexConfiguration", Jf(e, "fieldPath"));
                "CONTAINS" === e.arrayConfig ? s.push(new _t(t, 2 /* IndexKind.CONTAINS */)) : "ASCENDING" === e.order ? s.push(new _t(t, 0 /* IndexKind.ASCENDING */)) : "DESCENDING" === e.order && s.push(new _t(t, 1 /* IndexKind.DESCENDING */));
            }
            n.push(new lt(lt.UNKNOWN_ID, e, s, gt.empty()));
        }
        return n;
    }(e);
    return Za(s, i);
}

function Jf(t, e) {
    if ("string" != typeof t[e]) throw new U(q.INVALID_ARGUMENT, "Missing string value for: " + e);
    return t[e];
}

/**
 * Cloud Firestore
 *
 * @packageDocumentation
 */ !function(t, e = !0) {
    !function(t) {
        S = t;
    }(app.SDK_VERSION), app._registerComponent(new component.Component("firestore", ((t, {instanceIdentifier: n, options: s}) => {
        const i = t.getProvider("app").getImmediate(), r = new vh(new z(t.getProvider("auth-internal")), new Y(t.getProvider("app-check-internal")), function(t, e) {
            if (!Object.prototype.hasOwnProperty.apply(t.options, [ "projectId" ])) throw new U(q.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
            return new Oe(t.options.projectId, e);
        }(i, n), i);
        return s = Object.assign({
            useFetchStreams: e
        }, s), r._setSettings(s), r;
    }), "PUBLIC").setMultipleInstances(!0)), app.registerVersion(b, "3.13.0", t), 
    // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
    app.registerVersion(b, "3.13.0", "cjs2017");
}();

exports.AbstractUserDataWriter = Wl;
exports.AggregateField = Lh;
exports.AggregateQuerySnapshot = qh;
exports.Bytes = Uh;
exports.CACHE_SIZE_UNLIMITED = Ah;
exports.CollectionReference = wh;
exports.DocumentReference = fh;
exports.DocumentSnapshot = sf;
exports.FieldPath = Kh;
exports.FieldValue = Qh;
exports.Firestore = vh;
exports.FirestoreError = U;
exports.GeoPoint = jh;
exports.LoadBundleTask = Eh;
exports.Query = dh;
exports.QueryCompositeFilterConstraint = Vl;
exports.QueryConstraint = vl;
exports.QueryDocumentSnapshot = rf;
exports.QueryEndAtConstraint = Bl;
exports.QueryFieldFilterConstraint = Pl;
exports.QueryLimitConstraint = Nl;
exports.QueryOrderByConstraint = Cl;
exports.QuerySnapshot = of;
exports.QueryStartAtConstraint = $l;
exports.SnapshotMetadata = nf;
exports.Timestamp = it;
exports.Transaction = qf;
exports.WriteBatch = Bf;
exports._DatabaseId = Oe;
exports._DocumentKey = ht;
exports._EmptyAppCheckTokenProvider = X;
exports._EmptyAuthCredentialsProvider = Q;
exports._FieldPath = at;
exports._TestingHooks = ci;
exports._cast = uh;
exports._debugAssert = B;
exports._isBase64Available = be;
exports._logWarn = M;
exports._validateIsNotUsedTogether = sh;
exports.addDoc = pf;
exports.aggregateFieldEqual = tf;
exports.aggregateQuerySnapshotEqual = ef;
exports.and = Dl;
exports.arrayRemove = jf;
exports.arrayUnion = Qf;
exports.average = Xl;
exports.clearIndexedDbPersistence = xh;
exports.collection = _h;
exports.collectionGroup = mh;
exports.connectFirestoreEmulator = lh;
exports.count = Zl;
exports.deleteDoc = yf;
exports.deleteField = Kf;
exports.disableNetwork = Mh;
exports.doc = gh;
exports.documentId = Gh;
exports.enableIndexedDbPersistence = Sh;
exports.enableMultiTabIndexedDbPersistence = Dh;
exports.enableNetwork = kh;
exports.endAt = ql;
exports.endBefore = Ll;
exports.ensureFirestoreConfigured = bh;
exports.executeWrite = Ef;
exports.getAggregateFromServer = Rf;
exports.getCountFromServer = vf;
exports.getDoc = af;
exports.getDocFromCache = lf;
exports.getDocFromServer = ff;
exports.getDocs = df;
exports.getDocsFromCache = wf;
exports.getDocsFromServer = _f;
exports.getFirestore = Ph;
exports.increment = zf;
exports.initializeFirestore = Rh;
exports.limit = kl;
exports.limitToLast = Ml;
exports.loadBundle = Oh;
exports.memoryEagerGarbageCollector = Df;
exports.memoryLocalCache = xf;
exports.memoryLruGarbageCollector = Cf;
exports.namedQuery = Fh;
exports.onSnapshot = If;
exports.onSnapshotsInSync = Tf;
exports.or = Sl;
exports.orderBy = xl;
exports.persistentLocalCache = Nf;
exports.persistentMultipleTabManager = Of;
exports.persistentSingleTabManager = $f;
exports.query = Rl;
exports.queryEqual = ph;
exports.refEqual = yh;
exports.runTransaction = Uf;
exports.serverTimestamp = Gf;
exports.setDoc = mf;
exports.setIndexConfiguration = Hf;
exports.setLogLevel = x;
exports.snapshotEqual = cf;
exports.startAfter = Fl;
exports.startAt = Ol;
exports.sum = Yl;
exports.terminate = $h;
exports.updateDoc = gf;
exports.waitForPendingWrites = Nh;
exports.where = bl;
exports.writeBatch = Wf;
//# sourceMappingURL=index.cjs.js.map
