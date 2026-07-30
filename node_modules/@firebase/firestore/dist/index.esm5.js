import { __extends as t, __awaiter as e, __generator as n, __spreadArray as r } from "tslib";

import { SDK_VERSION as i, _registerComponent as o, registerVersion as u, _getProvider, getApp as a, _removeServiceInstance as s } from "@firebase/app";

import { Component as c } from "@firebase/component";

import { Logger as l, LogLevel as h } from "@firebase/logger";

import { FirebaseError as f, getUA as d, isSafari as p, getModularInstance as v, isIndexedDBAvailable as m, createMockUserToken as y, deepEqual as g, getDefaultEmulatorHostnameAndPort as w } from "@firebase/util";

import { Integer as b, XhrIo as I, EventType as E, ErrorCode as T, createWebChannelTransport as S, getStatEventTarget as _, FetchXmlHttpFactory as D, WebChannel as C, Event as x, Stat as N, Md5 as A } from "@firebase/webchannel-wrapper";

var k = "@firebase/firestore", O = /** @class */ function() {
    function t(t) {
        this.uid = t;
    }
    return t.prototype.isAuthenticated = function() {
        return null != this.uid;
    }, 
    /**
     * Returns a key representing this user, suitable for inclusion in a
     * dictionary.
     */
    t.prototype.toKey = function() {
        return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
    }, t.prototype.isEqual = function(t) {
        return t.uid === this.uid;
    }, t;
}();

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
/** A user with a null UID. */ O.UNAUTHENTICATED = new O(null), 
// TODO(mikelehen): Look into getting a proper uid-equivalent for
// non-FirebaseAuth providers.
O.GOOGLE_CREDENTIALS = new O("google-credentials-uid"), O.FIRST_PARTY = new O("first-party-uid"), 
O.MOCK_USER = new O("mock-user");

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
var F = "9.23.0", P = new l("@firebase/firestore");

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
// Helper methods are needed because variables can't be exported as read/write
function R() {
    return P.logLevel;
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
 */ function V(t) {
    P.setLogLevel(t);
}

function M(t) {
    for (var e = [], n = 1; n < arguments.length; n++) e[n - 1] = arguments[n];
    if (P.logLevel <= h.DEBUG) {
        var i = e.map(B);
        P.debug.apply(P, r([ "Firestore (".concat(F, "): ").concat(t) ], i, !1));
    }
}

function L(t) {
    for (var e = [], n = 1; n < arguments.length; n++) e[n - 1] = arguments[n];
    if (P.logLevel <= h.ERROR) {
        var i = e.map(B);
        P.error.apply(P, r([ "Firestore (".concat(F, "): ").concat(t) ], i, !1));
    }
}

/**
 * @internal
 */ function q(t) {
    for (var e = [], n = 1; n < arguments.length; n++) e[n - 1] = arguments[n];
    if (P.logLevel <= h.WARN) {
        var i = e.map(B);
        P.warn.apply(P, r([ "Firestore (".concat(F, "): ").concat(t) ], i, !1));
    }
}

/**
 * Converts an additional log parameter to a string representation.
 */ function B(t) {
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
    /** Formats an object as a JSON string, suitable for logging. */    var e;
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
 */ function U(t) {
    void 0 === t && (t = "Unexpected state");
    // Log the failure in addition to throw an exception, just in case the
    // exception is swallowed.
        var e = "FIRESTORE (".concat(F, ") INTERNAL ASSERTION FAILED: ") + t;
    // NOTE: We don't use FirestoreError here because these are internal failures
    // that cannot be handled by the user. (Also it would create a circular
    // dependency between the error and assert modules which doesn't work.)
        throw L(e), new Error(e)
    /**
 * Fails if the given assertion condition is false, throwing an Error with the
 * given message if it did.
 *
 * Messages are stripped in production builds.
 */;
}

function z(t, e) {
    t || U();
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
 */ function G(t, e) {
    t || U();
}

/**
 * Casts `obj` to `T`. In non-production builds, verifies that `obj` is an
 * instance of `T` before casting.
 */ function j(t, 
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
 */ var K = {
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
}, Q = /** @class */ function(e) {
    /** @hideconstructor */
    function n(
    /**
     * The backend error code associated with this error.
     */
    t, 
    /**
     * A custom error description.
     */
    n) {
        var r = this;
        return (r = e.call(this, t, n) || this).code = t, r.message = n, 
        // HACK: We write a toString property directly because Error is not a real
        // class and so inheritance does not work correctly. We could alternatively
        // do the same "back-door inheritance" trick that FirebaseError does.
        r.toString = function() {
            return "".concat(r.name, ": [code=").concat(r.code, "]: ").concat(r.message);
        }, r;
    }
    return t(n, e), n;
}(f), W = function() {
    var t = this;
    this.promise = new Promise((function(e, n) {
        t.resolve = e, t.reject = n;
    }));
}, H = function(t, e) {
    this.user = e, this.type = "OAuth", this.headers = new Map, this.headers.set("Authorization", "Bearer ".concat(t));
}, Y = /** @class */ function() {
    function t() {}
    return t.prototype.getToken = function() {
        return Promise.resolve(null);
    }, t.prototype.invalidateToken = function() {}, t.prototype.start = function(t, e) {
        // Fire with initial user.
        t.enqueueRetryable((function() {
            return e(O.UNAUTHENTICATED);
        }));
    }, t.prototype.shutdown = function() {}, t;
}(), X = /** @class */ function() {
    function t(t) {
        this.token = t, 
        /**
             * Stores the listener registered with setChangeListener()
             * This isn't actually necessary since the UID never changes, but we use this
             * to verify the listen contract is adhered to in tests.
             */
        this.changeListener = null;
    }
    return t.prototype.getToken = function() {
        return Promise.resolve(this.token);
    }, t.prototype.invalidateToken = function() {}, t.prototype.start = function(t, e) {
        var n = this;
        this.changeListener = e, 
        // Fire with initial user.
        t.enqueueRetryable((function() {
            return e(n.token.user);
        }));
    }, t.prototype.shutdown = function() {
        this.changeListener = null;
    }, t;
}(), J = /** @class */ function() {
    function t(t) {
        this.t = t, 
        /** Tracks the current User. */
        this.currentUser = O.UNAUTHENTICATED, 
        /**
             * Counter used to detect if the token changed while a getToken request was
             * outstanding.
             */
        this.i = 0, this.forceRefresh = !1, this.auth = null;
    }
    return t.prototype.start = function(t, r) {
        var i = this, o = this.i, u = function(t) {
            return i.i !== o ? (o = i.i, r(t)) : Promise.resolve();
        }, a = new W;
        this.o = function() {
            i.i++, i.currentUser = i.u(), a.resolve(), a = new W, t.enqueueRetryable((function() {
                return u(i.currentUser);
            }));
        };
        var s = function() {
            var r = a;
            t.enqueueRetryable((function() {
                return e(i, void 0, void 0, (function() {
                    return n(this, (function(t) {
                        switch (t.label) {
                          case 0:
                            return [ 4 /*yield*/ , r.promise ];

                          case 1:
                            return t.sent(), [ 4 /*yield*/ , u(this.currentUser) ];

                          case 2:
                            return t.sent(), [ 2 /*return*/ ];
                        }
                    }));
                }));
            }));
        }, c = function(t) {
            M("FirebaseAuthCredentialsProvider", "Auth detected"), i.auth = t, i.auth.addAuthTokenListener(i.o), 
            s();
        };
        this.t.onInit((function(t) {
            return c(t);
        })), 
        // Our users can initialize Auth right after Firestore, so we give it
        // a chance to register itself with the component framework before we
        // determine whether to start up in unauthenticated mode.
        setTimeout((function() {
            if (!i.auth) {
                var t = i.t.getImmediate({
                    optional: !0
                });
                t ? c(t) : (
                // If auth is still not available, proceed with `null` user
                M("FirebaseAuthCredentialsProvider", "Auth not yet detected"), a.resolve(), a = new W);
            }
        }), 0), s();
    }, t.prototype.getToken = function() {
        var t = this, e = this.i, n = this.forceRefresh;
        // Take note of the current value of the tokenCounter so that this method
        // can fail (with an ABORTED error) if there is a token change while the
        // request is outstanding.
                return this.forceRefresh = !1, this.auth ? this.auth.getToken(n).then((function(n) {
            // Cancel the request since the token changed while the request was
            // outstanding so the response is potentially for a previous user (which
            // user, we can't be sure).
            return t.i !== e ? (M("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), 
            t.getToken()) : n ? (z("string" == typeof n.accessToken), new H(n.accessToken, t.currentUser)) : null;
        })) : Promise.resolve(null);
    }, t.prototype.invalidateToken = function() {
        this.forceRefresh = !0;
    }, t.prototype.shutdown = function() {
        this.auth && this.auth.removeAuthTokenListener(this.o);
    }, 
    // Auth.getUid() can return null even with a user logged in. It is because
    // getUid() is synchronous, but the auth code populating Uid is asynchronous.
    // This method should only be called in the AuthTokenListener callback
    // to guarantee to get the actual user.
    t.prototype.u = function() {
        var t = this.auth && this.auth.getUid();
        return z(null === t || "string" == typeof t), new O(t);
    }, t;
}(), Z = /** @class */ function() {
    function t(t, e, n) {
        this.h = t, this.l = e, this.m = n, this.type = "FirstParty", this.user = O.FIRST_PARTY, 
        this.g = new Map
        /**
     * Gets an authorization token, using a provided factory function, or return
     * null.
     */;
    }
    return t.prototype.p = function() {
        return this.m ? this.m() : null;
    }, Object.defineProperty(t.prototype, "headers", {
        get: function() {
            this.g.set("X-Goog-AuthUser", this.h);
            // Use array notation to prevent minification
            var t = this.p();
            return t && this.g.set("Authorization", t), this.l && this.g.set("X-Goog-Iam-Authorization-Token", this.l), 
            this.g;
        },
        enumerable: !1,
        configurable: !0
    }), t;
}(), $ = /** @class */ function() {
    function t(t, e, n) {
        this.h = t, this.l = e, this.m = n;
    }
    return t.prototype.getToken = function() {
        return Promise.resolve(new Z(this.h, this.l, this.m));
    }, t.prototype.start = function(t, e) {
        // Fire with initial uid.
        t.enqueueRetryable((function() {
            return e(O.FIRST_PARTY);
        }));
    }, t.prototype.shutdown = function() {}, t.prototype.invalidateToken = function() {}, 
    t;
}(), tt = function(t) {
    this.value = t, this.type = "AppCheck", this.headers = new Map, t && t.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
}, et = /** @class */ function() {
    function t(t) {
        this.I = t, this.forceRefresh = !1, this.appCheck = null, this.T = null;
    }
    return t.prototype.start = function(t, e) {
        var n = this, r = function(t) {
            null != t.error && M("FirebaseAppCheckTokenProvider", "Error getting App Check token; using placeholder token instead. Error: ".concat(t.error.message));
            var r = t.token !== n.T;
            return n.T = t.token, M("FirebaseAppCheckTokenProvider", "Received ".concat(r ? "new" : "existing", " token.")), 
            r ? e(t.token) : Promise.resolve();
        };
        this.o = function(e) {
            t.enqueueRetryable((function() {
                return r(e);
            }));
        };
        var i = function(t) {
            M("FirebaseAppCheckTokenProvider", "AppCheck detected"), n.appCheck = t, n.appCheck.addTokenListener(n.o);
        };
        this.I.onInit((function(t) {
            return i(t);
        })), 
        // Our users can initialize AppCheck after Firestore, so we give it
        // a chance to register itself with the component framework.
        setTimeout((function() {
            if (!n.appCheck) {
                var t = n.I.getImmediate({
                    optional: !0
                });
                t ? i(t) : 
                // If AppCheck is still not available, proceed without it.
                M("FirebaseAppCheckTokenProvider", "AppCheck not yet detected");
            }
        }), 0);
    }, t.prototype.getToken = function() {
        var t = this, e = this.forceRefresh;
        return this.forceRefresh = !1, this.appCheck ? this.appCheck.getToken(e).then((function(e) {
            return e ? (z("string" == typeof e.token), t.T = e.token, new tt(e.token)) : null;
        })) : Promise.resolve(null);
    }, t.prototype.invalidateToken = function() {
        this.forceRefresh = !0;
    }, t.prototype.shutdown = function() {
        this.appCheck && this.appCheck.removeTokenListener(this.o);
    }, t;
}(), nt = /** @class */ function() {
    function t() {}
    return t.prototype.getToken = function() {
        return Promise.resolve(new tt(""));
    }, t.prototype.invalidateToken = function() {}, t.prototype.start = function(t, e) {}, 
    t.prototype.shutdown = function() {}, t;
}();

/** An error returned by a Firestore operation. */
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
function rt(t) {
    // Polyfills for IE and WebWorker by using `self` and `msCrypto` when `crypto` is not available.
    var e = 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "undefined" != typeof self && (self.crypto || self.msCrypto), n = new Uint8Array(t);
    if (e && "function" == typeof e.getRandomValues) e.getRandomValues(n); else 
    // Falls back to Math.random
    for (var r = 0; r < t; r++) n[r] = Math.floor(256 * Math.random());
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
 */ var it = /** @class */ function() {
    function t() {}
    return t.A = function() {
        for (
        // Alphanumeric characters
        var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", e = Math.floor(256 / t.length) * t.length, n = ""
        // The largest byte value that is a multiple of `char.length`.
        ; n.length < 20; ) for (var r = rt(40), i = 0; i < r.length; ++i) 
        // Only accept values that are [0, maxMultiple), this ensures they can
        // be evenly mapped to indices of `chars` via a modulo operation.
        n.length < 20 && r[i] < e && (n += t.charAt(r[i] % t.length));
        return n;
    }, t;
}();

function ot(t, e) {
    return t < e ? -1 : t > e ? 1 : 0;
}

/** Helper to compare arrays using isEqual(). */ function ut(t, e, n) {
    return t.length === e.length && t.every((function(t, r) {
        return n(t, e[r]);
    }));
}

/**
 * Returns the immediate lexicographically-following string. This is useful to
 * construct an inclusive range for indexeddb iterators.
 */ function at(t) {
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
 */ var st = /** @class */ function() {
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
    function t(
    /**
     * The number of seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z.
     */
    t, 
    /**
     * The fractions of a second at nanosecond resolution.*
     */
    e) {
        if (this.seconds = t, this.nanoseconds = e, e < 0) throw new Q(K.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
        if (e >= 1e9) throw new Q(K.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
        if (t < -62135596800) throw new Q(K.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
        // This will break in the year 10,000.
                if (t >= 253402300800) throw new Q(K.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
    }
    /**
     * Creates a new timestamp with the current date, with millisecond precision.
     *
     * @returns a new timestamp representing the current date.
     */    return t.now = function() {
        return t.fromMillis(Date.now());
    }, 
    /**
     * Creates a new timestamp from the given date.
     *
     * @param date - The date to initialize the `Timestamp` from.
     * @returns A new `Timestamp` representing the same point in time as the given
     *     date.
     */
    t.fromDate = function(e) {
        return t.fromMillis(e.getTime());
    }, 
    /**
     * Creates a new timestamp from the given number of milliseconds.
     *
     * @param milliseconds - Number of milliseconds since Unix epoch
     *     1970-01-01T00:00:00Z.
     * @returns A new `Timestamp` representing the same point in time as the given
     *     number of milliseconds.
     */
    t.fromMillis = function(e) {
        var n = Math.floor(e / 1e3);
        return new t(n, Math.floor(1e6 * (e - 1e3 * n)));
    }, 
    /**
     * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
     * causes a loss of precision since `Date` objects only support millisecond
     * precision.
     *
     * @returns JavaScript `Date` object representing the same point in time as
     *     this `Timestamp`, with millisecond precision.
     */
    t.prototype.toDate = function() {
        return new Date(this.toMillis());
    }, 
    /**
     * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
     * epoch). This operation causes a loss of precision.
     *
     * @returns The point in time corresponding to this timestamp, represented as
     *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
     */
    t.prototype.toMillis = function() {
        return 1e3 * this.seconds + this.nanoseconds / 1e6;
    }, t.prototype._compareTo = function(t) {
        return this.seconds === t.seconds ? ot(this.nanoseconds, t.nanoseconds) : ot(this.seconds, t.seconds);
    }, 
    /**
     * Returns true if this `Timestamp` is equal to the provided one.
     *
     * @param other - The `Timestamp` to compare against.
     * @returns true if this `Timestamp` is equal to the provided one.
     */
    t.prototype.isEqual = function(t) {
        return t.seconds === this.seconds && t.nanoseconds === this.nanoseconds;
    }, 
    /** Returns a textual representation of this `Timestamp`. */ t.prototype.toString = function() {
        return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
    }, 
    /** Returns a JSON-serializable representation of this `Timestamp`. */ t.prototype.toJSON = function() {
        return {
            seconds: this.seconds,
            nanoseconds: this.nanoseconds
        };
    }, 
    /**
     * Converts this object to a primitive string, which allows `Timestamp` objects
     * to be compared using the `>`, `<=`, `>=` and `>` operators.
     */
    t.prototype.valueOf = function() {
        // This method returns a string of the form <seconds>.<nanoseconds> where
        // <seconds> is translated to have a non-negative value and both <seconds>
        // and <nanoseconds> are left-padded with zeroes to be a consistent length.
        // Strings with this format then have a lexiographical ordering that matches
        // the expected ordering. The <seconds> translation is done to avoid having
        // a leading negative sign (i.e. a leading '-' character) in its string
        // representation, which would affect its lexiographical ordering.
        var t = this.seconds - -62135596800;
        // Note: Up to 12 decimal digits are required to represent all valid
        // 'seconds' values.
                return String(t).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
    }, t;
}(), ct = /** @class */ function() {
    function t(t) {
        this.timestamp = t;
    }
    return t.fromTimestamp = function(e) {
        return new t(e);
    }, t.min = function() {
        return new t(new st(0, 0));
    }, t.max = function() {
        return new t(new st(253402300799, 999999999));
    }, t.prototype.compareTo = function(t) {
        return this.timestamp._compareTo(t.timestamp);
    }, t.prototype.isEqual = function(t) {
        return this.timestamp.isEqual(t.timestamp);
    }, 
    /** Returns a number representation of the version for use in spec tests. */ t.prototype.toMicroseconds = function() {
        // Convert to microseconds.
        return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
    }, t.prototype.toString = function() {
        return "SnapshotVersion(" + this.timestamp.toString() + ")";
    }, t.prototype.toTimestamp = function() {
        return this.timestamp;
    }, t;
}(), lt = /** @class */ function() {
    function t(t, e, n) {
        void 0 === e ? e = 0 : e > t.length && U(), void 0 === n ? n = t.length - e : n > t.length - e && U(), 
        this.segments = t, this.offset = e, this.len = n;
    }
    return Object.defineProperty(t.prototype, "length", {
        get: function() {
            return this.len;
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.isEqual = function(e) {
        return 0 === t.comparator(this, e);
    }, t.prototype.child = function(e) {
        var n = this.segments.slice(this.offset, this.limit());
        return e instanceof t ? e.forEach((function(t) {
            n.push(t);
        })) : n.push(e), this.construct(n);
    }, 
    /** The index of one past the last segment of the path. */ t.prototype.limit = function() {
        return this.offset + this.length;
    }, t.prototype.popFirst = function(t) {
        return t = void 0 === t ? 1 : t, this.construct(this.segments, this.offset + t, this.length - t);
    }, t.prototype.popLast = function() {
        return this.construct(this.segments, this.offset, this.length - 1);
    }, t.prototype.firstSegment = function() {
        return this.segments[this.offset];
    }, t.prototype.lastSegment = function() {
        return this.get(this.length - 1);
    }, t.prototype.get = function(t) {
        return this.segments[this.offset + t];
    }, t.prototype.isEmpty = function() {
        return 0 === this.length;
    }, t.prototype.isPrefixOf = function(t) {
        if (t.length < this.length) return !1;
        for (var e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return !1;
        return !0;
    }, t.prototype.isImmediateParentOf = function(t) {
        if (this.length + 1 !== t.length) return !1;
        for (var e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return !1;
        return !0;
    }, t.prototype.forEach = function(t) {
        for (var e = this.offset, n = this.limit(); e < n; e++) t(this.segments[e]);
    }, t.prototype.toArray = function() {
        return this.segments.slice(this.offset, this.limit());
    }, t.comparator = function(t, e) {
        for (var n = Math.min(t.length, e.length), r = 0; r < n; r++) {
            var i = t.get(r), o = e.get(r);
            if (i < o) return -1;
            if (i > o) return 1;
        }
        return t.length < e.length ? -1 : t.length > e.length ? 1 : 0;
    }, t;
}(), ht = /** @class */ function(e) {
    function n() {
        return null !== e && e.apply(this, arguments) || this;
    }
    return t(n, e), n.prototype.construct = function(t, e, r) {
        return new n(t, e, r);
    }, n.prototype.canonicalString = function() {
        // NOTE: The client is ignorant of any path segments containing escape
        // sequences (e.g. __id123__) and just passes them through raw (they exist
        // for legacy reasons and should not be used frequently).
        return this.toArray().join("/");
    }, n.prototype.toString = function() {
        return this.canonicalString();
    }, 
    /**
     * Creates a resource path from the given slash-delimited string. If multiple
     * arguments are provided, all components are combined. Leading and trailing
     * slashes from all components are ignored.
     */
    n.fromString = function() {
        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
        // NOTE: The client is ignorant of any path segments containing escape
        // sequences (e.g. __id123__) and just passes them through raw (they exist
        // for legacy reasons and should not be used frequently).
                for (var r = [], i = 0, o = t; i < o.length; i++) {
            var u = o[i];
            if (u.indexOf("//") >= 0) throw new Q(K.INVALID_ARGUMENT, "Invalid segment (".concat(u, "). Paths must not contain // in them."));
            // Strip leading and traling slashed.
                        r.push.apply(r, u.split("/").filter((function(t) {
                return t.length > 0;
            })));
        }
        return new n(r);
    }, n.emptyPath = function() {
        return new n([]);
    }, n;
}(lt), ft = /^[_a-zA-Z][_a-zA-Z0-9]*$/, dt = /** @class */ function(e) {
    function n() {
        return null !== e && e.apply(this, arguments) || this;
    }
    return t(n, e), n.prototype.construct = function(t, e, r) {
        return new n(t, e, r);
    }, 
    /**
     * Returns true if the string could be used as a segment in a field path
     * without escaping.
     */
    n.isValidIdentifier = function(t) {
        return ft.test(t);
    }, n.prototype.canonicalString = function() {
        return this.toArray().map((function(t) {
            return t = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), n.isValidIdentifier(t) || (t = "`" + t + "`"), 
            t;
        })).join(".");
    }, n.prototype.toString = function() {
        return this.canonicalString();
    }, 
    /**
     * Returns true if this field references the key of a document.
     */
    n.prototype.isKeyField = function() {
        return 1 === this.length && "__name__" === this.get(0);
    }, 
    /**
     * The field designating the key of a document.
     */
    n.keyField = function() {
        return new n([ "__name__" ]);
    }, 
    /**
     * Parses a field string from the given server-formatted string.
     *
     * - Splitting the empty string is not allowed (for now at least).
     * - Empty segments within the string (e.g. if there are two consecutive
     *   separators) are not allowed.
     *
     * TODO(b/37244157): we should make this more strict. Right now, it allows
     * non-identifier path components, even if they aren't escaped.
     */
    n.fromServerFormat = function(t) {
        for (var e = [], r = "", i = 0, o = function() {
            if (0 === r.length) throw new Q(K.INVALID_ARGUMENT, "Invalid field path (".concat(t, "). Paths must not be empty, begin with '.', end with '.', or contain '..'"));
            e.push(r), r = "";
        }, u = !1; i < t.length; ) {
            var a = t[i];
            if ("\\" === a) {
                if (i + 1 === t.length) throw new Q(K.INVALID_ARGUMENT, "Path has trailing escape character: " + t);
                var s = t[i + 1];
                if ("\\" !== s && "." !== s && "`" !== s) throw new Q(K.INVALID_ARGUMENT, "Path has invalid escape sequence: " + t);
                r += s, i += 2;
            } else "`" === a ? (u = !u, i++) : "." !== a || u ? (r += a, i++) : (o(), i++);
        }
        if (o(), u) throw new Q(K.INVALID_ARGUMENT, "Unterminated ` in path: " + t);
        return new n(e);
    }, n.emptyPath = function() {
        return new n([]);
    }, n;
}(lt), pt = /** @class */ function() {
    function t(t) {
        this.path = t;
    }
    return t.fromPath = function(e) {
        return new t(ht.fromString(e));
    }, t.fromName = function(e) {
        return new t(ht.fromString(e).popFirst(5));
    }, t.empty = function() {
        return new t(ht.emptyPath());
    }, Object.defineProperty(t.prototype, "collectionGroup", {
        get: function() {
            return this.path.popLast().lastSegment();
        },
        enumerable: !1,
        configurable: !0
    }), 
    /** Returns true if the document is in the specified collectionId. */ t.prototype.hasCollectionId = function(t) {
        return this.path.length >= 2 && this.path.get(this.path.length - 2) === t;
    }, 
    /** Returns the collection group (i.e. the name of the parent collection) for this key. */ t.prototype.getCollectionGroup = function() {
        return this.path.get(this.path.length - 2);
    }, 
    /** Returns the fully qualified path to the parent collection. */ t.prototype.getCollectionPath = function() {
        return this.path.popLast();
    }, t.prototype.isEqual = function(t) {
        return null !== t && 0 === ht.comparator(this.path, t.path);
    }, t.prototype.toString = function() {
        return this.path.toString();
    }, t.comparator = function(t, e) {
        return ht.comparator(t.path, e.path);
    }, t.isDocumentKey = function(t) {
        return t.length % 2 == 0;
    }, 
    /**
     * Creates and returns a new document key with the given segments.
     *
     * @param segments - The segments of the path to the document
     * @returns A new instance of DocumentKey
     */
    t.fromSegments = function(e) {
        return new t(new ht(e.slice()));
    }, t;
}(), vt = function(
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
r) {
    this.indexId = t, this.collectionGroup = e, this.fields = n, this.indexState = r;
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
 * A version of a document in Firestore. This corresponds to the version
 * timestamp, such as update_time or read_time.
 */
/** An ID for an index that has not yet been added to persistence.  */
/** Returns the ArrayContains/ArrayContainsAny segment for this index. */
function mt(t) {
    return t.fields.find((function(t) {
        return 2 /* IndexKind.CONTAINS */ === t.kind;
    }));
}

/** Returns all directional (ascending/descending) segments for this index. */ function yt(t) {
    return t.fields.filter((function(t) {
        return 2 /* IndexKind.CONTAINS */ !== t.kind;
    }));
}

/**
 * Returns the order of the document key component for the given index.
 *
 * PORTING NOTE: This is only used in the Web IndexedDb implementation.
 */
/**
 * Compares indexes by collection group and segments. Ignores update time and
 * index ID.
 */ function gt(t, e) {
    var n = ot(t.collectionGroup, e.collectionGroup);
    if (0 !== n) return n;
    for (var r = 0; r < Math.min(t.fields.length, e.fields.length); ++r) if (0 !== (n = bt(t.fields[r], e.fields[r]))) return n;
    return ot(t.fields.length, e.fields.length);
}

/** Returns a debug representation of the field index */ vt.UNKNOWN_ID = -1;

/** An index component consisting of field path and index type.  */
var wt = function(
/** The field path of the component. */
t, 
/** The fields sorting order. */
e) {
    this.fieldPath = t, this.kind = e;
};

function bt(t, e) {
    var n = dt.comparator(t.fieldPath, e.fieldPath);
    return 0 !== n ? n : ot(t.kind, e.kind);
}

/**
 * Stores the "high water mark" that indicates how updated the Index is for the
 * current user.
 */ var It = /** @class */ function() {
    function t(
    /**
     * Indicates when the index was last updated (relative to other indexes).
     */
    t, 
    /** The the latest indexed read time, document and batch id. */
    e) {
        this.sequenceNumber = t, this.offset = e
        /** The state of an index that has not yet been backfilled. */;
    }
    return t.empty = function() {
        return new t(0, St.min());
    }, t;
}();

/**
 * Creates an offset that matches all documents with a read time higher than
 * `readTime`.
 */ function Et(t, e) {
    // We want to create an offset that matches all documents with a read time
    // greater than the provided read time. To do so, we technically need to
    // create an offset for `(readTime, MAX_DOCUMENT_KEY)`. While we could use
    // Unicode codepoints to generate MAX_DOCUMENT_KEY, it is much easier to use
    // `(readTime + 1, DocumentKey.empty())` since `> DocumentKey.empty()` matches
    // all valid document IDs.
    var n = t.toTimestamp().seconds, r = t.toTimestamp().nanoseconds + 1, i = ct.fromTimestamp(1e9 === r ? new st(n + 1, 0) : new st(n, r));
    return new St(i, pt.empty(), e);
}

/** Creates a new offset based on the provided document. */ function Tt(t) {
    return new St(t.readTime, t.key, -1);
}

/**
 * Stores the latest read time, document and batch ID that were processed for an
 * index.
 */ var St = /** @class */ function() {
    function t(
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
        this.readTime = t, this.documentKey = e, this.largestBatchId = n
        /** Returns an offset that sorts before all regular offsets. */;
    }
    return t.min = function() {
        return new t(ct.min(), pt.empty(), -1);
    }, 
    /** Returns an offset that sorts after all regular offsets. */ t.max = function() {
        return new t(ct.max(), pt.empty(), -1);
    }, t;
}();

function _t(t, e) {
    var n = t.readTime.compareTo(e.readTime);
    return 0 !== n ? n : 0 !== (n = pt.comparator(t.documentKey, e.documentKey)) ? n : ot(t.largestBatchId, e.largestBatchId);
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
 */ var Dt = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.", Ct = /** @class */ function() {
    function t() {
        this.onCommittedListeners = [];
    }
    return t.prototype.addOnCommittedListener = function(t) {
        this.onCommittedListeners.push(t);
    }, t.prototype.raiseOnCommittedEvent = function() {
        this.onCommittedListeners.forEach((function(t) {
            return t();
        }));
    }, t;
}();

/**
 * A base class representing a persistence transaction, encapsulating both the
 * transaction's sequence numbers as well as a list of onCommitted listeners.
 *
 * When you call Persistence.runTransaction(), it will create a transaction and
 * pass it to your callback. You then pass it to any method that operates
 * on persistence.
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
 * Verifies the error thrown by a LocalStore operation. If a LocalStore
 * operation fails because the primary lease has been taken by another client,
 * we ignore the error (the persistence layer will immediately call
 * `applyPrimaryLease` to propagate the primary state change). All other errors
 * are re-thrown.
 *
 * @param err - An error returned by a LocalStore operation.
 * @returns A Promise that resolves after we recovered, or the original error.
 */
function xt(t) {
    return e(this, void 0, void 0, (function() {
        return n(this, (function(e) {
            if (t.code !== K.FAILED_PRECONDITION || t.message !== Dt) throw t;
            return M("LocalStore", "Unexpectedly lost primary lease"), [ 2 /*return*/ ];
        }));
    }));
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
 */ var Nt = /** @class */ function() {
    function t(t) {
        var e = this;
        // NOTE: next/catchCallback will always point to our own wrapper functions,
        // not the user's raw next() or catch() callbacks.
                this.nextCallback = null, this.catchCallback = null, 
        // When the operation resolves, we'll set result or error and mark isDone.
        this.result = void 0, this.error = void 0, this.isDone = !1, 
        // Set to true when .then() or .catch() are called and prevents additional
        // chaining.
        this.callbackAttached = !1, t((function(t) {
            e.isDone = !0, e.result = t, e.nextCallback && 
            // value should be defined unless T is Void, but we can't express
            // that in the type system.
            e.nextCallback(t);
        }), (function(t) {
            e.isDone = !0, e.error = t, e.catchCallback && e.catchCallback(t);
        }));
    }
    return t.prototype.catch = function(t) {
        return this.next(void 0, t);
    }, t.prototype.next = function(e, n) {
        var r = this;
        return this.callbackAttached && U(), this.callbackAttached = !0, this.isDone ? this.error ? this.wrapFailure(n, this.error) : this.wrapSuccess(e, this.result) : new t((function(t, i) {
            r.nextCallback = function(n) {
                r.wrapSuccess(e, n).next(t, i);
            }, r.catchCallback = function(e) {
                r.wrapFailure(n, e).next(t, i);
            };
        }));
    }, t.prototype.toPromise = function() {
        var t = this;
        return new Promise((function(e, n) {
            t.next(e, n);
        }));
    }, t.prototype.wrapUserFunction = function(e) {
        try {
            var n = e();
            return n instanceof t ? n : t.resolve(n);
        } catch (e) {
            return t.reject(e);
        }
    }, t.prototype.wrapSuccess = function(e, n) {
        return e ? this.wrapUserFunction((function() {
            return e(n);
        })) : t.resolve(n);
    }, t.prototype.wrapFailure = function(e, n) {
        return e ? this.wrapUserFunction((function() {
            return e(n);
        })) : t.reject(n);
    }, t.resolve = function(e) {
        return new t((function(t, n) {
            t(e);
        }));
    }, t.reject = function(e) {
        return new t((function(t, n) {
            n(e);
        }));
    }, t.waitFor = function(
    // Accept all Promise types in waitFor().
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    e) {
        return new t((function(t, n) {
            var r = 0, i = 0, o = !1;
            e.forEach((function(e) {
                ++r, e.next((function() {
                    ++i, o && i === r && t();
                }), (function(t) {
                    return n(t);
                }));
            })), o = !0, i === r && t();
        }));
    }, 
    /**
     * Given an array of predicate functions that asynchronously evaluate to a
     * boolean, implements a short-circuiting `or` between the results. Predicates
     * will be evaluated until one of them returns `true`, then stop. The final
     * result will be whether any of them returned `true`.
     */
    t.or = function(e) {
        for (var n = t.resolve(!1), r = function(e) {
            n = n.next((function(n) {
                return n ? t.resolve(n) : e();
            }));
        }, i = 0, o = e; i < o.length; i++) {
            r(o[i]);
        }
        return n;
    }, t.forEach = function(t, e) {
        var n = this, r = [];
        return t.forEach((function(t, i) {
            r.push(e.call(n, t, i));
        })), this.waitFor(r);
    }, 
    /**
     * Concurrently map all array elements through asynchronous function.
     */
    t.mapArray = function(e, n) {
        return new t((function(t, r) {
            for (var i = e.length, o = new Array(i), u = 0, a = function(a) {
                var s = a;
                n(e[s]).next((function(e) {
                    o[s] = e, ++u === i && t(o);
                }), (function(t) {
                    return r(t);
                }));
            }, s = 0; s < i; s++) a(s);
        }));
    }, 
    /**
     * An alternative to recursive PersistencePromise calls, that avoids
     * potential memory problems from unbounded chains of promises.
     *
     * The `action` will be called repeatedly while `condition` is true.
     */
    t.doWhile = function(e, n) {
        return new t((function(t, r) {
            var i = function() {
                !0 === e() ? n().next((function() {
                    i();
                }), r) : t();
            };
            i();
        }));
    }, t;
}(), At = /** @class */ function() {
    function t(t, e) {
        var n = this;
        this.action = t, this.transaction = e, this.aborted = !1, 
        /**
             * A `Promise` that resolves with the result of the IndexedDb transaction.
             */
        this.v = new W, this.transaction.oncomplete = function() {
            n.v.resolve();
        }, this.transaction.onabort = function() {
            e.error ? n.v.reject(new Ft(t, e.error)) : n.v.resolve();
        }, this.transaction.onerror = function(e) {
            var r = Lt(e.target.error);
            n.v.reject(new Ft(t, r));
        };
    }
    return t.open = function(e, n, r, i) {
        try {
            return new t(n, e.transaction(i, r));
        } catch (e) {
            throw new Ft(n, e);
        }
    }, Object.defineProperty(t.prototype, "R", {
        get: function() {
            return this.v.promise;
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.abort = function(t) {
        t && this.v.reject(t), this.aborted || (M("SimpleDb", "Aborting transaction:", t ? t.message : "Client-initiated abort"), 
        this.aborted = !0, this.transaction.abort());
    }, t.prototype.P = function() {
        // If the browser supports V3 IndexedDB, we invoke commit() explicitly to
        // speed up index DB processing if the event loop remains blocks.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var t = this.transaction;
        this.aborted || "function" != typeof t.commit || t.commit();
    }, 
    /**
     * Returns a SimpleDbStore<KeyType, ValueType> for the specified store. All
     * operations performed on the SimpleDbStore happen within the context of this
     * transaction and it cannot be used anymore once the transaction is
     * completed.
     *
     * Note that we can't actually enforce that the KeyType and ValueType are
     * correct, but they allow type safety through the rest of the consuming code.
     */
    t.prototype.store = function(t) {
        var e = this.transaction.objectStore(t);
        return new Rt(e);
    }, t;
}(), kt = /** @class */ function() {
    /*
     * Creates a new SimpleDb wrapper for IndexedDb database `name`.
     *
     * Note that `version` must not be a downgrade. IndexedDB does not support
     * downgrading the schema version. We currently do not support any way to do
     * versioning outside of IndexedDB's versioning mechanism, as only
     * version-upgrade transactions are allowed to do things like create
     * objectstores.
     */
    function t(e, n, r) {
        this.name = e, this.version = n, this.V = r, 
        // NOTE: According to https://bugs.webkit.org/show_bug.cgi?id=197050, the
        // bug we're checking for should exist in iOS >= 12.2 and < 13, but for
        // whatever reason it's much harder to hit after 12.2 so we only proactively
        // log on 12.2.
        12.2 === t.S(d()) && L("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.");
    }
    /** Deletes the specified database. */    return t.delete = function(t) {
        return M("SimpleDb", "Removing database:", t), Vt(window.indexedDB.deleteDatabase(t)).toPromise();
    }, 
    /** Returns true if IndexedDB is available in the current environment. */ t.D = function() {
        if (!m()) return !1;
        if (t.C()) return !0;
        // We extensively use indexed array values and compound keys,
        // which IE and Edge do not support. However, they still have indexedDB
        // defined on the window, so we need to check for them here and make sure
        // to return that persistence is not enabled for those browsers.
        // For tracking support of this feature, see here:
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/status/indexeddbarraysandmultientrysupport/
        // Check the UA string to find out the browser.
                var e = d(), n = t.S(e), r = 0 < n && n < 10, i = t.N(e), o = 0 < i && i < 4.5;
        // IE 10
        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
        // IE 11
        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
        // Edge
        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML,
        // like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
        // iOS Safari: Disable for users running iOS version < 10.
                return !(e.indexOf("MSIE ") > 0 || e.indexOf("Trident/") > 0 || e.indexOf("Edge/") > 0 || r || o);
    }, 
    /**
     * Returns true if the backing IndexedDB store is the Node IndexedDBShim
     * (see https://github.com/axemclion/IndexedDBShim).
     */
    t.C = function() {
        var t;
        return "undefined" != typeof process && "YES" === (null === (t = process.env) || void 0 === t ? void 0 : t.k);
    }, 
    /** Helper to get a typed SimpleDbStore from a transaction. */ t.M = function(t, e) {
        return t.store(e);
    }, 
    // visible for testing
    /** Parse User Agent to determine iOS version. Returns -1 if not found. */
    t.S = function(t) {
        var e = t.match(/i(?:phone|pad|pod) os ([\d_]+)/i), n = e ? e[1].split("_").slice(0, 2).join(".") : "-1";
        return Number(n);
    }, 
    // visible for testing
    /** Parse User Agent to determine Android version. Returns -1 if not found. */
    t.N = function(t) {
        var e = t.match(/Android ([\d.]+)/i), n = e ? e[1].split(".").slice(0, 2).join(".") : "-1";
        return Number(n);
    }, 
    /**
     * Opens the specified database, creating or upgrading it if necessary.
     */
    t.prototype.$ = function(t) {
        return e(this, void 0, void 0, (function() {
            var e, r = this;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return this.db ? [ 3 /*break*/ , 2 ] : (M("SimpleDb", "Opening database:", this.name), 
                    e = this, [ 4 /*yield*/ , new Promise((function(e, n) {
                        // TODO(mikelehen): Investigate browser compatibility.
                        // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
                        // suggests IE9 and older WebKit browsers handle upgrade
                        // differently. They expect setVersion, as described here:
                        // https://developer.mozilla.org/en-US/docs/Web/API/IDBVersionChangeRequest/setVersion
                        var i = indexedDB.open(r.name, r.version);
                        i.onsuccess = function(t) {
                            var n = t.target.result;
                            e(n);
                        }, i.onblocked = function() {
                            n(new Ft(t, "Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."));
                        }, i.onerror = function(e) {
                            var r = e.target.error;
                            "VersionError" === r.name ? n(new Q(K.FAILED_PRECONDITION, "A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")) : "InvalidStateError" === r.name ? n(new Q(K.FAILED_PRECONDITION, "Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: " + r)) : n(new Ft(t, r));
                        }, i.onupgradeneeded = function(t) {
                            M("SimpleDb", 'Database "' + r.name + '" requires upgrade from version:', t.oldVersion);
                            var e = t.target.result;
                            r.V.O(e, i.transaction, t.oldVersion, r.version).next((function() {
                                M("SimpleDb", "Database upgrade to version " + r.version + " complete");
                            }));
                        };
                    })) ]);

                  case 1:
                    e.db = n.sent(), n.label = 2;

                  case 2:
                    return [ 2 /*return*/ , (this.F && (this.db.onversionchange = function(t) {
                        return r.F(t);
                    }), this.db) ];
                }
            }));
        }));
    }, t.prototype.B = function(t) {
        this.F = t, this.db && (this.db.onversionchange = function(e) {
            return t(e);
        });
    }, t.prototype.runTransaction = function(t, r, i, o) {
        return e(this, void 0, void 0, (function() {
            var e, u, a, s, c;
            return n(this, (function(l) {
                switch (l.label) {
                  case 0:
                    e = "readonly" === r, u = 0, a = function() {
                        var r, a, c, l, h, f;
                        return n(this, (function(n) {
                            switch (n.label) {
                              case 0:
                                ++u, n.label = 1;

                              case 1:
                                return n.trys.push([ 1, 4, , 5 ]), [ 4 /*yield*/ , s.$(t) ];

                              case 2:
                                // Wait for the transaction to complete (i.e. IndexedDb's onsuccess event to
                                // fire), but still return the original transactionFnResult back to the
                                // caller.
                                return s.db = n.sent(), r = At.open(s.db, t, e ? "readonly" : "readwrite", i), a = o(r).next((function(t) {
                                    return r.P(), t;
                                })).catch((function(t) {
                                    // Abort the transaction if there was an error.
                                    return r.abort(t), Nt.reject(t);
                                })).toPromise(), c = {}, a.catch((function() {})), [ 4 /*yield*/ , r.R ];

                              case 3:
                                return [ 2 /*return*/ , (c.value = (
                                // Wait for the transaction to complete (i.e. IndexedDb's onsuccess event to
                                // fire), but still return the original transactionFnResult back to the
                                // caller.
                                n.sent(), a), c) ];

                              case 4:
                                // TODO(schmidt-sebastian): We could probably be smarter about this and
                                // not retry exceptions that are likely unrecoverable (such as quota
                                // exceeded errors).
                                // Note: We cannot use an instanceof check for FirestoreException, since the
                                // exception is wrapped in a generic error by our async/await handling.
                                return l = n.sent(), f = "FirebaseError" !== (h = l).name && u < 3, M("SimpleDb", "Transaction failed with error:", h.message, "Retrying:", f), 
                                s.close(), f ? [ 3 /*break*/ , 5 ] : [ 2 /*return*/ , {
                                    value: Promise.reject(h)
                                } ];

                              case 5:
                                return [ 2 /*return*/ ];
                            }
                        }));
                    }, s = this, l.label = 1;

                  case 1:
                    return [ 5 /*yield**/ , a() ];

                  case 2:
                    if ("object" == typeof (c = l.sent())) return [ 2 /*return*/ , c.value ];
                    l.label = 3;

                  case 3:
                    return [ 3 /*break*/ , 1 ];

                  case 4:
                    return [ 2 /*return*/ ];
                }
            }));
        }));
    }, t.prototype.close = function() {
        this.db && this.db.close(), this.db = void 0;
    }, t;
}(), Ot = /** @class */ function() {
    function t(t) {
        this.L = t, this.q = !1, this.U = null;
    }
    return Object.defineProperty(t.prototype, "isDone", {
        get: function() {
            return this.q;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "K", {
        get: function() {
            return this.U;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "cursor", {
        set: function(t) {
            this.L = t;
        },
        enumerable: !1,
        configurable: !0
    }), 
    /**
     * This function can be called to stop iteration at any point.
     */
    t.prototype.done = function() {
        this.q = !0;
    }, 
    /**
     * This function can be called to skip to that next key, which could be
     * an index or a primary key.
     */
    t.prototype.G = function(t) {
        this.U = t;
    }, 
    /**
     * Delete the current cursor value from the object store.
     *
     * NOTE: You CANNOT do this with a keysOnly query.
     */
    t.prototype.delete = function() {
        return Vt(this.L.delete());
    }, t;
}(), Ft = /** @class */ function(e) {
    function n(t, n) {
        var r = this;
        return (r = e.call(this, K.UNAVAILABLE, "IndexedDB transaction '".concat(t, "' failed: ").concat(n)) || this).name = "IndexedDbTransactionError", 
        r;
    }
    return t(n, e), n;
}(Q);

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
/** Verifies whether `e` is an IndexedDbTransactionError. */ function Pt(t) {
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
 */ var Rt = /** @class */ function() {
    function t(t) {
        this.store = t;
    }
    return t.prototype.put = function(t, e) {
        var n;
        return void 0 !== e ? (M("SimpleDb", "PUT", this.store.name, t, e), n = this.store.put(e, t)) : (M("SimpleDb", "PUT", this.store.name, "<auto-key>", t), 
        n = this.store.put(t)), Vt(n);
    }, 
    /**
     * Adds a new value into an Object Store and returns the new key. Similar to
     * IndexedDb's `add()`, this method will fail on primary key collisions.
     *
     * @param value - The object to write.
     * @returns The key of the value to add.
     */
    t.prototype.add = function(t) {
        return M("SimpleDb", "ADD", this.store.name, t, t), Vt(this.store.add(t));
    }, 
    /**
     * Gets the object with the specified key from the specified store, or null
     * if no object exists with the specified key.
     *
     * @key The key of the object to get.
     * @returns The object with the specified key or null if no object exists.
     */
    t.prototype.get = function(t) {
        var e = this;
        // We're doing an unsafe cast to ValueType.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return Vt(this.store.get(t)).next((function(n) {
            // Normalize nonexistence to null.
            return void 0 === n && (n = null), M("SimpleDb", "GET", e.store.name, t, n), n;
        }));
    }, t.prototype.delete = function(t) {
        return M("SimpleDb", "DELETE", this.store.name, t), Vt(this.store.delete(t));
    }, 
    /**
     * If we ever need more of the count variants, we can add overloads. For now,
     * all we need is to count everything in a store.
     *
     * Returns the number of rows in the store.
     */
    t.prototype.count = function() {
        return M("SimpleDb", "COUNT", this.store.name), Vt(this.store.count());
    }, t.prototype.j = function(t, e) {
        var n = this.options(t, e);
        // Use `getAll()` if the browser supports IndexedDB v3, as it is roughly
        // 20% faster. Unfortunately, getAll() does not support custom indices.
                if (n.index || "function" != typeof this.store.getAll) {
            var r = this.cursor(n), i = [];
            return this.W(r, (function(t, e) {
                i.push(e);
            })).next((function() {
                return i;
            }));
        }
        var o = this.store.getAll(n.range);
        return new Nt((function(t, e) {
            o.onerror = function(t) {
                e(t.target.error);
            }, o.onsuccess = function(e) {
                t(e.target.result);
            };
        }));
    }, 
    /**
     * Loads the first `count` elements from the provided index range. Loads all
     * elements if no limit is provided.
     */
    t.prototype.H = function(t, e) {
        var n = this.store.getAll(t, null === e ? void 0 : e);
        return new Nt((function(t, e) {
            n.onerror = function(t) {
                e(t.target.error);
            }, n.onsuccess = function(e) {
                t(e.target.result);
            };
        }));
    }, t.prototype.J = function(t, e) {
        M("SimpleDb", "DELETE ALL", this.store.name);
        var n = this.options(t, e);
        n.Y = !1;
        var r = this.cursor(n);
        return this.W(r, (function(t, e, n) {
            return n.delete();
        }));
    }, t.prototype.X = function(t, e) {
        var n;
        e ? n = t : (n = {}, e = t);
        var r = this.cursor(n);
        return this.W(r, e);
    }, 
    /**
     * Iterates over a store, but waits for the given callback to complete for
     * each entry before iterating the next entry. This allows the callback to do
     * asynchronous work to determine if this iteration should continue.
     *
     * The provided callback should return `true` to continue iteration, and
     * `false` otherwise.
     */
    t.prototype.Z = function(t) {
        var e = this.cursor({});
        return new Nt((function(n, r) {
            e.onerror = function(t) {
                var e = Lt(t.target.error);
                r(e);
            }, e.onsuccess = function(e) {
                var r = e.target.result;
                r ? t(r.primaryKey, r.value).next((function(t) {
                    t ? r.continue() : n();
                })) : n();
            };
        }));
    }, t.prototype.W = function(t, e) {
        var n = [];
        return new Nt((function(r, i) {
            t.onerror = function(t) {
                i(t.target.error);
            }, t.onsuccess = function(t) {
                var i = t.target.result;
                if (i) {
                    var o = new Ot(i), u = e(i.primaryKey, i.value, o);
                    if (u instanceof Nt) {
                        var a = u.catch((function(t) {
                            return o.done(), Nt.reject(t);
                        }));
                        n.push(a);
                    }
                    o.isDone ? r() : null === o.K ? i.continue() : i.continue(o.K);
                } else r();
            };
        })).next((function() {
            return Nt.waitFor(n);
        }));
    }, t.prototype.options = function(t, e) {
        var n;
        return void 0 !== t && ("string" == typeof t ? n = t : e = t), {
            index: n,
            range: e
        };
    }, t.prototype.cursor = function(t) {
        var e = "next";
        if (t.reverse && (e = "prev"), t.index) {
            var n = this.store.index(t.index);
            return t.Y ? n.openKeyCursor(t.range, e) : n.openCursor(t.range, e);
        }
        return this.store.openCursor(t.range, e);
    }, t;
}();

/**
 * Wraps an IDBRequest in a PersistencePromise, using the onsuccess / onerror
 * handlers to resolve / reject the PersistencePromise as appropriate.
 */ function Vt(t) {
    return new Nt((function(e, n) {
        t.onsuccess = function(t) {
            var n = t.target.result;
            e(n);
        }, t.onerror = function(t) {
            var e = Lt(t.target.error);
            n(e);
        };
    }));
}

// Guard so we only report the error once.
var Mt = !1;

function Lt(t) {
    var e = kt.S(d());
    if (e >= 12.2 && e < 13) {
        var n = "An internal error was encountered in the Indexed Database server";
        if (t.message.indexOf(n) >= 0) {
            // Wrap error in a more descriptive one.
            var r = new Q("internal", "IOS_INDEXEDDB_BUG1: IndexedDb has thrown '".concat(n, "'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround."));
            return Mt || (Mt = !0, 
            // Throw a global exception outside of this promise chain, for the user to
            // potentially catch.
            setTimeout((function() {
                throw r;
            }), 0)), r;
        }
    }
    return t;
}

/** This class is responsible for the scheduling of Index Backfiller. */ var qt = /** @class */ function() {
    function t(t, e) {
        this.asyncQueue = t, this.tt = e, this.task = null;
    }
    return t.prototype.start = function() {
        this.et(15e3);
    }, t.prototype.stop = function() {
        this.task && (this.task.cancel(), this.task = null);
    }, Object.defineProperty(t.prototype, "started", {
        get: function() {
            return null !== this.task;
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.et = function(t) {
        var r = this;
        M("IndexBackiller", "Scheduled in ".concat(t, "ms")), this.task = this.asyncQueue.enqueueAfterDelay("index_backfill" /* TimerId.IndexBackfill */ , t, (function() {
            return e(r, void 0, void 0, (function() {
                var t, e, r, i;
                return n(this, (function(n) {
                    switch (n.label) {
                      case 0:
                        this.task = null, n.label = 1;

                      case 1:
                        return n.trys.push([ 1, 3, , 7 ]), t = M, e = [ "IndexBackiller" ], r = "Documents written: ".concat, 
                        [ 4 /*yield*/ , this.tt.nt() ];

                      case 2:
                        return t.apply(void 0, e.concat([ r.apply("Documents written: ", [ n.sent() ]) ])), 
                        [ 3 /*break*/ , 7 ];

                      case 3:
                        return Pt(i = n.sent()) ? (M("IndexBackiller", "Ignoring IndexedDB error during index backfill: ", i), 
                        [ 3 /*break*/ , 6 ]) : [ 3 /*break*/ , 4 ];

                      case 4:
                        return [ 4 /*yield*/ , xt(i) ];

                      case 5:
                        n.sent(), n.label = 6;

                      case 6:
                        return [ 3 /*break*/ , 7 ];

                      case 7:
                        return [ 4 /*yield*/ , this.et(6e4) ];

                      case 8:
                        return n.sent(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }));
    }, t;
}(), Bt = /** @class */ function() {
    function t(
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
    return t.prototype.nt = function(t) {
        return void 0 === t && (t = 50), e(this, void 0, void 0, (function() {
            var e = this;
            return n(this, (function(n) {
                return [ 2 /*return*/ , this.persistence.runTransaction("Backfill Indexes", "readwrite-primary", (function(n) {
                    return e.st(n, t);
                })) ];
            }));
        }));
    }, 
    /** Writes index entries until the cap is reached. Returns the number of documents processed. */ t.prototype.st = function(t, e) {
        var n = this, r = new Set, i = e, o = !0;
        return Nt.doWhile((function() {
            return !0 === o && i > 0;
        }), (function() {
            return n.localStore.indexManager.getNextCollectionGroupToUpdate(t).next((function(e) {
                if (null !== e && !r.has(e)) return M("IndexBackiller", "Processing collection: ".concat(e)), 
                n.it(t, e, i).next((function(t) {
                    i -= t, r.add(e);
                }));
                o = !1;
            }));
        })).next((function() {
            return e - i;
        }));
    }, 
    /**
     * Writes entries for the provided collection group. Returns the number of documents processed.
     */
    t.prototype.it = function(t, e, n) {
        var r = this;
        // Use the earliest offset of all field indexes to query the local cache.
                return this.localStore.indexManager.getMinOffsetFromCollectionGroup(t, e).next((function(i) {
            return r.localStore.localDocuments.getNextDocuments(t, e, i, n).next((function(n) {
                var o = n.changes;
                return r.localStore.indexManager.updateIndexEntries(t, o).next((function() {
                    return r.rt(i, n);
                })).next((function(n) {
                    return M("IndexBackiller", "Updating offset: ".concat(n)), r.localStore.indexManager.updateCollectionGroup(t, e, n);
                })).next((function() {
                    return o.size;
                }));
            }));
        }));
    }, 
    /** Returns the next offset based on the provided documents. */ t.prototype.rt = function(t, e) {
        var n = t;
        return e.changes.forEach((function(t, e) {
            var r = Tt(e);
            _t(r, n) > 0 && (n = r);
        })), new St(n.readTime, n.documentKey, Math.max(e.batchId, t.largestBatchId));
    }, t;
}(), Ut = /** @class */ function() {
    function t(t, e) {
        var n = this;
        this.previousValue = t, e && (e.sequenceNumberHandler = function(t) {
            return n.ot(t);
        }, this.ut = function(t) {
            return e.writeSequenceNumber(t);
        });
    }
    return t.prototype.ot = function(t) {
        return this.previousValue = Math.max(t, this.previousValue), this.previousValue;
    }, t.prototype.next = function() {
        var t = ++this.previousValue;
        return this.ut && this.ut(t), t;
    }, t;
}();

/** Implements the steps for backfilling indexes. */
/**
 * Returns whether a variable is either undefined or null.
 */
function zt(t) {
    return null == t;
}

/** Returns whether the value represents -0. */ function Gt(t) {
    // Detect if the value is -0.0. Based on polyfill from
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
    return 0 === t && 1 / t == -1 / 0;
}

/**
 * Returns whether a value is an integer and in the safe integer range
 * @param value - The value to test for being an integer and in the safe range
 */ function jt(t) {
    return "number" == typeof t && Number.isInteger(t) && !Gt(t) && t <= Number.MAX_SAFE_INTEGER && t >= Number.MIN_SAFE_INTEGER;
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
 */ function Kt(t) {
    for (var e = "", n = 0; n < t.length; n++) e.length > 0 && (e = Wt(e)), e = Qt(t.get(n), e);
    return Wt(e);
}

/** Encodes a single segment of a resource path into the given result */ function Qt(t, e) {
    for (var n = e, r = t.length, i = 0; i < r; i++) {
        var o = t.charAt(i);
        switch (o) {
          case "\0":
            n += "";
            break;

          case "":
            n += "";
            break;

          default:
            n += o;
        }
    }
    return n;
}

/** Encodes a path separator into the given result */ function Wt(t) {
    return t + "";
}

/**
 * Decodes the given IndexedDb-compatible string form of a resource path into
 * a ResourcePath instance. Note that this method is not suitable for use with
 * decoding resource names from the server; those are One Platform format
 * strings.
 */ function Ht(t) {
    // Event the empty path must encode as a path of at least length 2. A path
    // with exactly 2 must be the empty path.
    var e = t.length;
    if (z(e >= 2), 2 === e) return z("" === t.charAt(0) && "" === t.charAt(1)), ht.emptyPath();
    // Escape characters cannot exist past the second-to-last position in the
    // source value.
        for (var n = e - 2, r = [], i = "", o = 0; o < e; ) {
        // The last two characters of a valid encoded path must be a separator, so
        // there must be an end to this segment.
        var u = t.indexOf("", o);
        switch ((u < 0 || u > n) && U(), t.charAt(u + 1)) {
          case "":
            var a = t.substring(o, u), s = void 0;
            0 === i.length ? 
            // Avoid copying for the common case of a segment that excludes \0
            // and \001
            s = a : (s = i += a, i = ""), r.push(s);
            break;

          case "":
            i += t.substring(o, u), i += "\0";
            break;

          case "":
            // The escape character can be used in the output to encode itself.
            i += t.substring(o, u + 1);
            break;

          default:
            U();
        }
        o = u + 2;
    }
    return new ht(r);
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
 */ Ut.ct = -1;

var Yt = [ "userId", "batchId" ];

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
 */ function Xt(t, e) {
    return [ t, Kt(e) ];
}

/**
 * Creates a full index key of [userId, encodedPath, batchId] for inserting
 * and deleting into the DbDocumentMutations index.
 */ function Jt(t, e, n) {
    return [ t, Kt(e), n ];
}

/**
 * Because we store all the useful information for this store in the key,
 * there is no useful information to store as the value. The raw (unencoded)
 * path cannot be stored because IndexedDb doesn't store prototype
 * information.
 */ var Zt = {}, $t = [ "prefixPath", "collectionGroup", "readTime", "documentId" ], te = [ "prefixPath", "collectionGroup", "documentId" ], ee = [ "collectionGroup", "readTime", "prefixPath", "documentId" ], ne = [ "canonicalId", "targetId" ], re = [ "targetId", "path" ], ie = [ "path", "targetId" ], oe = [ "collectionId", "parent" ], ue = [ "indexId", "uid" ], ae = [ "uid", "sequenceNumber" ], se = [ "indexId", "uid", "arrayValue", "directionalValue", "orderedDocumentKey", "documentKey" ], ce = [ "indexId", "uid", "orderedDocumentKey" ], le = [ "userId", "collectionPath", "documentId" ], he = [ "userId", "collectionPath", "largestBatchId" ], fe = [ "userId", "collectionGroup", "largestBatchId" ], de = r(r([], r(r([], r(r([], r(r([], [ "mutationQueues", "mutations", "documentMutations", "remoteDocuments", "targets", "owner", "targetGlobal", "targetDocuments" ], !1), [ "clientMetadata" ], !1), !0), [ "remoteDocumentGlobal" ], !1), !0), [ "collectionParents" ], !1), !0), [ "bundles", "namedQueries" ], !1), pe = r(r([], de, !0), [ "documentOverlays" ], !1), ve = [ "mutationQueues", "mutations", "documentMutations", "remoteDocumentsV14", "targets", "owner", "targetGlobal", "targetDocuments", "clientMetadata", "remoteDocumentGlobal", "collectionParents", "bundles", "namedQueries", "documentOverlays" ], me = ve, ye = r(r([], me, !0), [ "indexConfiguration", "indexState", "indexEntries" ], !1), ge = /** @class */ function(e) {
    function n(t, n) {
        var r = this;
        return (r = e.call(this) || this).ht = t, r.currentSequenceNumber = n, r;
    }
    return t(n, e), n;
}(Ct);

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
 */ function we(t, e) {
    var n = j(t);
    return kt.M(n.ht, e);
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
 */ function be(t) {
    var e = 0;
    for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && e++;
    return e;
}

function Ie(t, e) {
    for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && e(n, t[n]);
}

function Ee(t) {
    for (var e in t) if (Object.prototype.hasOwnProperty.call(t, e)) return !1;
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
var Te = /** @class */ function() {
    function t(t, e) {
        this.comparator = t, this.root = e || _e.EMPTY;
    }
    // Returns a copy of the map, with the specified key/value added or replaced.
        return t.prototype.insert = function(e, n) {
        return new t(this.comparator, this.root.insert(e, n, this.comparator).copy(null, null, _e.BLACK, null, null));
    }, 
    // Returns a copy of the map, with the specified key removed.
    t.prototype.remove = function(e) {
        return new t(this.comparator, this.root.remove(e, this.comparator).copy(null, null, _e.BLACK, null, null));
    }, 
    // Returns the value of the node with the given key, or null.
    t.prototype.get = function(t) {
        for (var e = this.root; !e.isEmpty(); ) {
            var n = this.comparator(t, e.key);
            if (0 === n) return e.value;
            n < 0 ? e = e.left : n > 0 && (e = e.right);
        }
        return null;
    }, 
    // Returns the index of the element in this sorted map, or -1 if it doesn't
    // exist.
    t.prototype.indexOf = function(t) {
        for (
        // Number of nodes that were pruned when descending right
        var e = 0, n = this.root; !n.isEmpty(); ) {
            var r = this.comparator(t, n.key);
            if (0 === r) return e + n.left.size;
            r < 0 ? n = n.left : (
            // Count all nodes left of the node plus the node itself
            e += n.left.size + 1, n = n.right);
        }
        // Node not found
                return -1;
    }, t.prototype.isEmpty = function() {
        return this.root.isEmpty();
    }, Object.defineProperty(t.prototype, "size", {
        // Returns the total number of nodes in the map.
        get: function() {
            return this.root.size;
        },
        enumerable: !1,
        configurable: !0
    }), 
    // Returns the minimum key in the map.
    t.prototype.minKey = function() {
        return this.root.minKey();
    }, 
    // Returns the maximum key in the map.
    t.prototype.maxKey = function() {
        return this.root.maxKey();
    }, 
    // Traverses the map in key order and calls the specified action function
    // for each key/value pair. If action returns true, traversal is aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    t.prototype.inorderTraversal = function(t) {
        return this.root.inorderTraversal(t);
    }, t.prototype.forEach = function(t) {
        this.inorderTraversal((function(e, n) {
            return t(e, n), !1;
        }));
    }, t.prototype.toString = function() {
        var t = [];
        return this.inorderTraversal((function(e, n) {
            return t.push("".concat(e, ":").concat(n)), !1;
        })), "{".concat(t.join(", "), "}");
    }, 
    // Traverses the map in reverse key order and calls the specified action
    // function for each key/value pair. If action returns true, traversal is
    // aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    t.prototype.reverseTraversal = function(t) {
        return this.root.reverseTraversal(t);
    }, 
    // Returns an iterator over the SortedMap.
    t.prototype.getIterator = function() {
        return new Se(this.root, null, this.comparator, !1);
    }, t.prototype.getIteratorFrom = function(t) {
        return new Se(this.root, t, this.comparator, !1);
    }, t.prototype.getReverseIterator = function() {
        return new Se(this.root, null, this.comparator, !0);
    }, t.prototype.getReverseIteratorFrom = function(t) {
        return new Se(this.root, t, this.comparator, !0);
    }, t;
}(), Se = /** @class */ function() {
    function t(t, e, n, r) {
        this.isReverse = r, this.nodeStack = [];
        for (var i = 1; !t.isEmpty(); ) if (i = e ? n(t.key, e) : 1, 
        // flip the comparison if we're going in reverse
        e && r && (i *= -1), i < 0) 
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
    return t.prototype.getNext = function() {
        var t = this.nodeStack.pop(), e = {
            key: t.key,
            value: t.value
        };
        if (this.isReverse) for (t = t.left; !t.isEmpty(); ) this.nodeStack.push(t), t = t.right; else for (t = t.right; !t.isEmpty(); ) this.nodeStack.push(t), 
        t = t.left;
        return e;
    }, t.prototype.hasNext = function() {
        return this.nodeStack.length > 0;
    }, t.prototype.peek = function() {
        if (0 === this.nodeStack.length) return null;
        var t = this.nodeStack[this.nodeStack.length - 1];
        return {
            key: t.key,
            value: t.value
        };
    }, t;
}(), _e = /** @class */ function() {
    function t(e, n, r, i, o) {
        this.key = e, this.value = n, this.color = null != r ? r : t.RED, this.left = null != i ? i : t.EMPTY, 
        this.right = null != o ? o : t.EMPTY, this.size = this.left.size + 1 + this.right.size;
    }
    // Returns a copy of the current node, optionally replacing pieces of it.
        return t.prototype.copy = function(e, n, r, i, o) {
        return new t(null != e ? e : this.key, null != n ? n : this.value, null != r ? r : this.color, null != i ? i : this.left, null != o ? o : this.right);
    }, t.prototype.isEmpty = function() {
        return !1;
    }, 
    // Traverses the tree in key order and calls the specified action function
    // for each node. If action returns true, traversal is aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    t.prototype.inorderTraversal = function(t) {
        return this.left.inorderTraversal(t) || t(this.key, this.value) || this.right.inorderTraversal(t);
    }, 
    // Traverses the tree in reverse key order and calls the specified action
    // function for each node. If action returns true, traversal is aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    t.prototype.reverseTraversal = function(t) {
        return this.right.reverseTraversal(t) || t(this.key, this.value) || this.left.reverseTraversal(t);
    }, 
    // Returns the minimum node in the tree.
    t.prototype.min = function() {
        return this.left.isEmpty() ? this : this.left.min();
    }, 
    // Returns the maximum key in the tree.
    t.prototype.minKey = function() {
        return this.min().key;
    }, 
    // Returns the maximum key in the tree.
    t.prototype.maxKey = function() {
        return this.right.isEmpty() ? this.key : this.right.maxKey();
    }, 
    // Returns new tree, with the key/value added.
    t.prototype.insert = function(t, e, n) {
        var r = this, i = n(t, r.key);
        return (r = i < 0 ? r.copy(null, null, null, r.left.insert(t, e, n), null) : 0 === i ? r.copy(null, e, null, null, null) : r.copy(null, null, null, null, r.right.insert(t, e, n))).fixUp();
    }, t.prototype.removeMin = function() {
        if (this.left.isEmpty()) return t.EMPTY;
        var e = this;
        return e.left.isRed() || e.left.left.isRed() || (e = e.moveRedLeft()), (e = e.copy(null, null, null, e.left.removeMin(), null)).fixUp();
    }, 
    // Returns new tree, with the specified item removed.
    t.prototype.remove = function(e, n) {
        var r, i = this;
        if (n(e, i.key) < 0) i.left.isEmpty() || i.left.isRed() || i.left.left.isRed() || (i = i.moveRedLeft()), 
        i = i.copy(null, null, null, i.left.remove(e, n), null); else {
            if (i.left.isRed() && (i = i.rotateRight()), i.right.isEmpty() || i.right.isRed() || i.right.left.isRed() || (i = i.moveRedRight()), 
            0 === n(e, i.key)) {
                if (i.right.isEmpty()) return t.EMPTY;
                r = i.right.min(), i = i.copy(r.key, r.value, null, null, i.right.removeMin());
            }
            i = i.copy(null, null, null, null, i.right.remove(e, n));
        }
        return i.fixUp();
    }, t.prototype.isRed = function() {
        return this.color;
    }, 
    // Returns new tree after performing any needed rotations.
    t.prototype.fixUp = function() {
        var t = this;
        return t.right.isRed() && !t.left.isRed() && (t = t.rotateLeft()), t.left.isRed() && t.left.left.isRed() && (t = t.rotateRight()), 
        t.left.isRed() && t.right.isRed() && (t = t.colorFlip()), t;
    }, t.prototype.moveRedLeft = function() {
        var t = this.colorFlip();
        return t.right.left.isRed() && (t = (t = (t = t.copy(null, null, null, null, t.right.rotateRight())).rotateLeft()).colorFlip()), 
        t;
    }, t.prototype.moveRedRight = function() {
        var t = this.colorFlip();
        return t.left.left.isRed() && (t = (t = t.rotateRight()).colorFlip()), t;
    }, t.prototype.rotateLeft = function() {
        var e = this.copy(null, null, t.RED, null, this.right.left);
        return this.right.copy(null, null, this.color, e, null);
    }, t.prototype.rotateRight = function() {
        var e = this.copy(null, null, t.RED, this.left.right, null);
        return this.left.copy(null, null, this.color, null, e);
    }, t.prototype.colorFlip = function() {
        var t = this.left.copy(null, null, !this.left.color, null, null), e = this.right.copy(null, null, !this.right.color, null, null);
        return this.copy(null, null, !this.color, t, e);
    }, 
    // For testing.
    t.prototype.checkMaxDepth = function() {
        var t = this.check();
        return Math.pow(2, t) <= this.size + 1;
    }, 
    // In a balanced RB tree, the black-depth (number of black nodes) from root to
    // leaves is equal on both sides.  This function verifies that or asserts.
    t.prototype.check = function() {
        if (this.isRed() && this.left.isRed()) throw U();
        if (this.right.isRed()) throw U();
        var t = this.left.check();
        if (t !== this.right.check()) throw U();
        return t + (this.isRed() ? 0 : 1);
    }, t;
}();

// end SortedMap
// An iterator over an LLRBNode.
// end LLRBNode
// Empty node is shared between all LLRB trees.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
_e.EMPTY = null, _e.RED = !0, _e.BLACK = !1, 
// end LLRBEmptyNode
_e.EMPTY = new (/** @class */ function() {
    function t() {
        this.size = 0;
    }
    return Object.defineProperty(t.prototype, "key", {
        get: function() {
            throw U();
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "value", {
        get: function() {
            throw U();
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "color", {
        get: function() {
            throw U();
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "left", {
        get: function() {
            throw U();
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "right", {
        get: function() {
            throw U();
        },
        enumerable: !1,
        configurable: !0
    }), 
    // Returns a copy of the current node.
    t.prototype.copy = function(t, e, n, r, i) {
        return this;
    }, 
    // Returns a copy of the tree, with the specified key/value added.
    t.prototype.insert = function(t, e, n) {
        return new _e(t, e);
    }, 
    // Returns a copy of the tree, with the specified key removed.
    t.prototype.remove = function(t, e) {
        return this;
    }, t.prototype.isEmpty = function() {
        return !0;
    }, t.prototype.inorderTraversal = function(t) {
        return !1;
    }, t.prototype.reverseTraversal = function(t) {
        return !1;
    }, t.prototype.minKey = function() {
        return null;
    }, t.prototype.maxKey = function() {
        return null;
    }, t.prototype.isRed = function() {
        return !1;
    }, 
    // For testing.
    t.prototype.checkMaxDepth = function() {
        return !0;
    }, t.prototype.check = function() {
        return 0;
    }, t;
}());

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
var De = /** @class */ function() {
    function t(t) {
        this.comparator = t, this.data = new Te(this.comparator);
    }
    return t.prototype.has = function(t) {
        return null !== this.data.get(t);
    }, t.prototype.first = function() {
        return this.data.minKey();
    }, t.prototype.last = function() {
        return this.data.maxKey();
    }, Object.defineProperty(t.prototype, "size", {
        get: function() {
            return this.data.size;
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.indexOf = function(t) {
        return this.data.indexOf(t);
    }, 
    /** Iterates elements in order defined by "comparator" */ t.prototype.forEach = function(t) {
        this.data.inorderTraversal((function(e, n) {
            return t(e), !1;
        }));
    }, 
    /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */ t.prototype.forEachInRange = function(t, e) {
        for (var n = this.data.getIteratorFrom(t[0]); n.hasNext(); ) {
            var r = n.getNext();
            if (this.comparator(r.key, t[1]) >= 0) return;
            e(r.key);
        }
    }, 
    /**
     * Iterates over `elem`s such that: start &lt;= elem until false is returned.
     */
    t.prototype.forEachWhile = function(t, e) {
        var n;
        for (n = void 0 !== e ? this.data.getIteratorFrom(e) : this.data.getIterator(); n.hasNext(); ) if (!t(n.getNext().key)) return;
    }, 
    /** Finds the least element greater than or equal to `elem`. */ t.prototype.firstAfterOrEqual = function(t) {
        var e = this.data.getIteratorFrom(t);
        return e.hasNext() ? e.getNext().key : null;
    }, t.prototype.getIterator = function() {
        return new Ce(this.data.getIterator());
    }, t.prototype.getIteratorFrom = function(t) {
        return new Ce(this.data.getIteratorFrom(t));
    }, 
    /** Inserts or updates an element */ t.prototype.add = function(t) {
        return this.copy(this.data.remove(t).insert(t, !0));
    }, 
    /** Deletes an element */ t.prototype.delete = function(t) {
        return this.has(t) ? this.copy(this.data.remove(t)) : this;
    }, t.prototype.isEmpty = function() {
        return this.data.isEmpty();
    }, t.prototype.unionWith = function(t) {
        var e = this;
        // Make sure `result` always refers to the larger one of the two sets.
                return e.size < t.size && (e = t, t = this), t.forEach((function(t) {
            e = e.add(t);
        })), e;
    }, t.prototype.isEqual = function(e) {
        if (!(e instanceof t)) return !1;
        if (this.size !== e.size) return !1;
        for (var n = this.data.getIterator(), r = e.data.getIterator(); n.hasNext(); ) {
            var i = n.getNext().key, o = r.getNext().key;
            if (0 !== this.comparator(i, o)) return !1;
        }
        return !0;
    }, t.prototype.toArray = function() {
        var t = [];
        return this.forEach((function(e) {
            t.push(e);
        })), t;
    }, t.prototype.toString = function() {
        var t = [];
        return this.forEach((function(e) {
            return t.push(e);
        })), "SortedSet(" + t.toString() + ")";
    }, t.prototype.copy = function(e) {
        var n = new t(this.comparator);
        return n.data = e, n;
    }, t;
}(), Ce = /** @class */ function() {
    function t(t) {
        this.iter = t;
    }
    return t.prototype.getNext = function() {
        return this.iter.getNext().key;
    }, t.prototype.hasNext = function() {
        return this.iter.hasNext();
    }, t;
}();

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
function xe(t) {
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
 */ var Ne = /** @class */ function() {
    function t(t) {
        this.fields = t, 
        // TODO(dimond): validation of FieldMask
        // Sort the field mask to support `FieldMask.isEqual()` and assert below.
        t.sort(dt.comparator);
    }
    return t.empty = function() {
        return new t([]);
    }, 
    /**
     * Returns a new FieldMask object that is the result of adding all the given
     * fields paths to this field mask.
     */
    t.prototype.unionWith = function(e) {
        for (var n = new De(dt.comparator), r = 0, i = this.fields; r < i.length; r++) {
            var o = i[r];
            n = n.add(o);
        }
        for (var u = 0, a = e; u < a.length; u++) {
            var s = a[u];
            n = n.add(s);
        }
        return new t(n.toArray());
    }, 
    /**
     * Verifies that `fieldPath` is included by at least one field in this field
     * mask.
     *
     * This is an O(n) operation, where `n` is the size of the field mask.
     */
    t.prototype.covers = function(t) {
        for (var e = 0, n = this.fields; e < n.length; e++) {
            if (n[e].isPrefixOf(t)) return !0;
        }
        return !1;
    }, t.prototype.isEqual = function(t) {
        return ut(this.fields, t.fields, (function(t, e) {
            return t.isEqual(e);
        }));
    }, t;
}(), Ae = /** @class */ function(e) {
    function n() {
        var t = this;
        return (t = e.apply(this, arguments) || this).name = "Base64DecodeError", t;
    }
    return t(n, e), n;
}(Error);

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
/** Converts a Base64 encoded string to a binary string. */
/** True if and only if the Base64 conversion functions are available. */
function ke() {
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
 */ var Oe = /** @class */ function() {
    function t(t) {
        this.binaryString = t;
    }
    return t.fromBase64String = function(e) {
        var n = function(t) {
            try {
                return atob(t);
            } catch (t) {
                // Check that `DOMException` is defined before using it to avoid
                // "ReferenceError: Property 'DOMException' doesn't exist" in react-native.
                // (https://github.com/firebase/firebase-js-sdk/issues/7115)
                throw "undefined" != typeof DOMException && t instanceof DOMException ? new Ae("Invalid base64 string: " + t) : t;
            }
        }(e);
        return new t(n);
    }, t.fromUint8Array = function(e) {
        // TODO(indexing); Remove the copy of the byte string here as this method
        // is frequently called during indexing.
        var n = 
        /**
 * Helper function to convert an Uint8array to a binary string.
 */
        function(t) {
            for (var e = "", n = 0; n < t.length; ++n) e += String.fromCharCode(t[n]);
            return e;
        }(e);
        return new t(n);
    }, t.prototype[Symbol.iterator] = function() {
        var t = this, e = 0;
        return {
            next: function() {
                return e < t.binaryString.length ? {
                    value: t.binaryString.charCodeAt(e++),
                    done: !1
                } : {
                    value: void 0,
                    done: !0
                };
            }
        };
    }, t.prototype.toBase64 = function() {
        return t = this.binaryString, btoa(t);
        var t;
    }, t.prototype.toUint8Array = function() {
        return function(t) {
            for (var e = new Uint8Array(t.length), n = 0; n < t.length; n++) e[n] = t.charCodeAt(n);
            return e;
        }(this.binaryString);
    }, t.prototype.approximateByteSize = function() {
        return 2 * this.binaryString.length;
    }, t.prototype.compareTo = function(t) {
        return ot(this.binaryString, t.binaryString);
    }, t.prototype.isEqual = function(t) {
        return this.binaryString === t.binaryString;
    }, t;
}();

Oe.EMPTY_BYTE_STRING = new Oe("");

var Fe = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);

/**
 * Converts the possible Proto values for a timestamp value into a "seconds and
 * nanos" representation.
 */ function Pe(t) {
    // The json interface (for the browser) will return an iso timestamp string,
    // while the proto js library (for node) will return a
    // google.protobuf.Timestamp instance.
    if (z(!!t), "string" == typeof t) {
        // The date string can have higher precision (nanos) than the Date class
        // (millis), so we do some custom parsing here.
        // Parse the nanos right out of the string.
        var e = 0, n = Fe.exec(t);
        if (z(!!n), n[1]) {
            // Pad the fraction out to 9 digits (nanos).
            var r = n[1];
            r = (r + "000000000").substr(0, 9), e = Number(r);
        }
        // Parse the date to get the seconds.
                var i = new Date(t);
        return {
            seconds: Math.floor(i.getTime() / 1e3),
            nanos: e
        };
    }
    return {
        seconds: Re(t.seconds),
        nanos: Re(t.nanos)
    };
}

/**
 * Converts the possible Proto types for numbers into a JavaScript number.
 * Returns 0 if the value is not numeric.
 */ function Re(t) {
    // TODO(bjornick): Handle int64 greater than 53 bits.
    return "number" == typeof t ? t : "string" == typeof t ? Number(t) : 0;
}

/** Converts the possible Proto types for Blobs into a ByteString. */ function Ve(t) {
    return "string" == typeof t ? Oe.fromBase64String(t) : Oe.fromUint8Array(t);
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
 */ function Me(t) {
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
 */ function Le(t) {
    var e = t.mapValue.fields.__previous_value__;
    return Me(e) ? Le(e) : e;
}

/**
 * Returns the local time at which this timestamp was first set.
 */ function qe(t) {
    var e = Pe(t.mapValue.fields.__local_write_time__.timestampValue);
    return new st(e.seconds, e.nanos);
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
 */ var Be = 
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
function(t, e, n, r, i, o, u, a, s) {
    this.databaseId = t, this.appId = e, this.persistenceKey = n, this.host = r, this.ssl = i, 
    this.forceLongPolling = o, this.autoDetectLongPolling = u, this.longPollingOptions = a, 
    this.useFetchStreams = s;
}, Ue = /** @class */ function() {
    function t(t, e) {
        this.projectId = t, this.database = e || "(default)";
    }
    return t.empty = function() {
        return new t("", "");
    }, Object.defineProperty(t.prototype, "isDefaultDatabase", {
        get: function() {
            return "(default)" === this.database;
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.isEqual = function(e) {
        return e instanceof t && e.projectId === this.projectId && e.database === this.database;
    }, t;
}(), ze = {
    mapValue: {
        fields: {
            __type__: {
                stringValue: "__max__"
            }
        }
    }
}, Ge = {
    nullValue: "NULL_VALUE"
};

/** The default database name for a project. */
/**
 * Represents the database ID a Firestore client is associated with.
 * @internal
 */
/** Extracts the backend's type order for the provided value. */
function je(t) {
    return "nullValue" in t ? 0 /* TypeOrder.NullValue */ : "booleanValue" in t ? 1 /* TypeOrder.BooleanValue */ : "integerValue" in t || "doubleValue" in t ? 2 /* TypeOrder.NumberValue */ : "timestampValue" in t ? 3 /* TypeOrder.TimestampValue */ : "stringValue" in t ? 5 /* TypeOrder.StringValue */ : "bytesValue" in t ? 6 /* TypeOrder.BlobValue */ : "referenceValue" in t ? 7 /* TypeOrder.RefValue */ : "geoPointValue" in t ? 8 /* TypeOrder.GeoPointValue */ : "arrayValue" in t ? 9 /* TypeOrder.ArrayValue */ : "mapValue" in t ? Me(t) ? 4 /* TypeOrder.ServerTimestampValue */ : un(t) ? 9007199254740991 /* TypeOrder.MaxValue */ : 10 /* TypeOrder.ObjectValue */ : U();
}

/** Tests `left` and `right` for equality based on the backend semantics. */ function Ke(t, e) {
    if (t === e) return !0;
    var n = je(t);
    if (n !== je(e)) return !1;
    switch (n) {
      case 0 /* TypeOrder.NullValue */ :
      case 9007199254740991 /* TypeOrder.MaxValue */ :
        return !0;

      case 1 /* TypeOrder.BooleanValue */ :
        return t.booleanValue === e.booleanValue;

      case 4 /* TypeOrder.ServerTimestampValue */ :
        return qe(t).isEqual(qe(e));

      case 3 /* TypeOrder.TimestampValue */ :
        return function(t, e) {
            if ("string" == typeof t.timestampValue && "string" == typeof e.timestampValue && t.timestampValue.length === e.timestampValue.length) 
            // Use string equality for ISO 8601 timestamps
            return t.timestampValue === e.timestampValue;
            var n = Pe(t.timestampValue), r = Pe(e.timestampValue);
            return n.seconds === r.seconds && n.nanos === r.nanos;
        }(t, e);

      case 5 /* TypeOrder.StringValue */ :
        return t.stringValue === e.stringValue;

      case 6 /* TypeOrder.BlobValue */ :
        return function(t, e) {
            return Ve(t.bytesValue).isEqual(Ve(e.bytesValue));
        }(t, e);

      case 7 /* TypeOrder.RefValue */ :
        return t.referenceValue === e.referenceValue;

      case 8 /* TypeOrder.GeoPointValue */ :
        return function(t, e) {
            return Re(t.geoPointValue.latitude) === Re(e.geoPointValue.latitude) && Re(t.geoPointValue.longitude) === Re(e.geoPointValue.longitude);
        }(t, e);

      case 2 /* TypeOrder.NumberValue */ :
        return function(t, e) {
            if ("integerValue" in t && "integerValue" in e) return Re(t.integerValue) === Re(e.integerValue);
            if ("doubleValue" in t && "doubleValue" in e) {
                var n = Re(t.doubleValue), r = Re(e.doubleValue);
                return n === r ? Gt(n) === Gt(r) : isNaN(n) && isNaN(r);
            }
            return !1;
        }(t, e);

      case 9 /* TypeOrder.ArrayValue */ :
        return ut(t.arrayValue.values || [], e.arrayValue.values || [], Ke);

      case 10 /* TypeOrder.ObjectValue */ :
        return function(t, e) {
            var n = t.mapValue.fields || {}, r = e.mapValue.fields || {};
            if (be(n) !== be(r)) return !1;
            for (var i in n) if (n.hasOwnProperty(i) && (void 0 === r[i] || !Ke(n[i], r[i]))) return !1;
            return !0;
        }(t, e);

      default:
        return U();
    }
}

function Qe(t, e) {
    return void 0 !== (t.values || []).find((function(t) {
        return Ke(t, e);
    }));
}

function We(t, e) {
    if (t === e) return 0;
    var n = je(t), r = je(e);
    if (n !== r) return ot(n, r);
    switch (n) {
      case 0 /* TypeOrder.NullValue */ :
      case 9007199254740991 /* TypeOrder.MaxValue */ :
        return 0;

      case 1 /* TypeOrder.BooleanValue */ :
        return ot(t.booleanValue, e.booleanValue);

      case 2 /* TypeOrder.NumberValue */ :
        return function(t, e) {
            var n = Re(t.integerValue || t.doubleValue), r = Re(e.integerValue || e.doubleValue);
            return n < r ? -1 : n > r ? 1 : n === r ? 0 : 
            // one or both are NaN.
            isNaN(n) ? isNaN(r) ? 0 : -1 : 1;
        }(t, e);

      case 3 /* TypeOrder.TimestampValue */ :
        return He(t.timestampValue, e.timestampValue);

      case 4 /* TypeOrder.ServerTimestampValue */ :
        return He(qe(t), qe(e));

      case 5 /* TypeOrder.StringValue */ :
        return ot(t.stringValue, e.stringValue);

      case 6 /* TypeOrder.BlobValue */ :
        return function(t, e) {
            var n = Ve(t), r = Ve(e);
            return n.compareTo(r);
        }(t.bytesValue, e.bytesValue);

      case 7 /* TypeOrder.RefValue */ :
        return function(t, e) {
            for (var n = t.split("/"), r = e.split("/"), i = 0; i < n.length && i < r.length; i++) {
                var o = ot(n[i], r[i]);
                if (0 !== o) return o;
            }
            return ot(n.length, r.length);
        }(t.referenceValue, e.referenceValue);

      case 8 /* TypeOrder.GeoPointValue */ :
        return function(t, e) {
            var n = ot(Re(t.latitude), Re(e.latitude));
            return 0 !== n ? n : ot(Re(t.longitude), Re(e.longitude));
        }(t.geoPointValue, e.geoPointValue);

      case 9 /* TypeOrder.ArrayValue */ :
        return function(t, e) {
            for (var n = t.values || [], r = e.values || [], i = 0; i < n.length && i < r.length; ++i) {
                var o = We(n[i], r[i]);
                if (o) return o;
            }
            return ot(n.length, r.length);
        }(t.arrayValue, e.arrayValue);

      case 10 /* TypeOrder.ObjectValue */ :
        return function(t, e) {
            if (t === ze.mapValue && e === ze.mapValue) return 0;
            if (t === ze.mapValue) return 1;
            if (e === ze.mapValue) return -1;
            var n = t.fields || {}, r = Object.keys(n), i = e.fields || {}, o = Object.keys(i);
            // Even though MapValues are likely sorted correctly based on their insertion
            // order (e.g. when received from the backend), local modifications can bring
            // elements out of order. We need to re-sort the elements to ensure that
            // canonical IDs are independent of insertion order.
                        r.sort(), o.sort();
            for (var u = 0; u < r.length && u < o.length; ++u) {
                var a = ot(r[u], o[u]);
                if (0 !== a) return a;
                var s = We(n[r[u]], i[o[u]]);
                if (0 !== s) return s;
            }
            return ot(r.length, o.length);
        }(t.mapValue, e.mapValue);

      default:
        throw U();
    }
}

function He(t, e) {
    if ("string" == typeof t && "string" == typeof e && t.length === e.length) return ot(t, e);
    var n = Pe(t), r = Pe(e), i = ot(n.seconds, r.seconds);
    return 0 !== i ? i : ot(n.nanos, r.nanos);
}

function Ye(t) {
    return Xe(t);
}

function Xe(t) {
    return "nullValue" in t ? "null" : "booleanValue" in t ? "" + t.booleanValue : "integerValue" in t ? "" + t.integerValue : "doubleValue" in t ? "" + t.doubleValue : "timestampValue" in t ? function(t) {
        var e = Pe(t);
        return "time(".concat(e.seconds, ",").concat(e.nanos, ")");
    }(t.timestampValue) : "stringValue" in t ? t.stringValue : "bytesValue" in t ? Ve(t.bytesValue).toBase64() : "referenceValue" in t ? (n = t.referenceValue, 
    pt.fromName(n).toString()) : "geoPointValue" in t ? "geo(".concat((e = t.geoPointValue).latitude, ",").concat(e.longitude, ")") : "arrayValue" in t ? function(t) {
        for (var e = "[", n = !0, r = 0, i = t.values || []; r < i.length; r++) {
            n ? n = !1 : e += ",", e += Xe(i[r]);
        }
        return e + "]";
    }(t.arrayValue) : "mapValue" in t ? function(t) {
        for (
        // Iteration order in JavaScript is not guaranteed. To ensure that we generate
        // matching canonical IDs for identical maps, we need to sort the keys.
        var e = "{", n = !0, r = 0, i = Object.keys(t.fields || {}).sort(); r < i.length; r++) {
            var o = i[r];
            n ? n = !1 : e += ",", e += "".concat(o, ":").concat(Xe(t.fields[o]));
        }
        return e + "}";
    }(t.mapValue) : U();
    var e, n;
}

function Je(t) {
    switch (je(t)) {
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
        var e = Le(t);
        return e ? 16 + Je(e) : 16;

      case 5 /* TypeOrder.StringValue */ :
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures:
        // "JavaScript's String type is [...] a set of elements of 16-bit unsigned
        // integer values"
        return 2 * t.stringValue.length;

      case 6 /* TypeOrder.BlobValue */ :
        return Ve(t.bytesValue).approximateByteSize();

      case 7 /* TypeOrder.RefValue */ :
        return t.referenceValue.length;

      case 9 /* TypeOrder.ArrayValue */ :
        return (t.arrayValue.values || []).reduce((function(t, e) {
            return t + Je(e);
        }), 0);

      case 10 /* TypeOrder.ObjectValue */ :
        return function(t) {
            var e = 0;
            return Ie(t.fields, (function(t, n) {
                e += t.length + Je(n);
            })), e;
        }(t.mapValue);

      default:
        throw U();
    }
}

/** Returns a reference value for the provided database and key. */ function Ze(t, e) {
    return {
        referenceValue: "projects/".concat(t.projectId, "/databases/").concat(t.database, "/documents/").concat(e.path.canonicalString())
    };
}

/** Returns true if `value` is an IntegerValue . */ function $e(t) {
    return !!t && "integerValue" in t;
}

/** Returns true if `value` is a DoubleValue. */
/** Returns true if `value` is an ArrayValue. */ function tn(t) {
    return !!t && "arrayValue" in t;
}

/** Returns true if `value` is a NullValue. */ function en(t) {
    return !!t && "nullValue" in t;
}

/** Returns true if `value` is NaN. */ function nn(t) {
    return !!t && "doubleValue" in t && isNaN(Number(t.doubleValue));
}

/** Returns true if `value` is a MapValue. */ function rn(t) {
    return !!t && "mapValue" in t;
}

/** Creates a deep copy of `source`. */ function on(t) {
    if (t.geoPointValue) return {
        geoPointValue: Object.assign({}, t.geoPointValue)
    };
    if (t.timestampValue && "object" == typeof t.timestampValue) return {
        timestampValue: Object.assign({}, t.timestampValue)
    };
    if (t.mapValue) {
        var e = {
            mapValue: {
                fields: {}
            }
        };
        return Ie(t.mapValue.fields, (function(t, n) {
            return e.mapValue.fields[t] = on(n);
        })), e;
    }
    if (t.arrayValue) {
        for (var n = {
            arrayValue: {
                values: []
            }
        }, r = 0; r < (t.arrayValue.values || []).length; ++r) n.arrayValue.values[r] = on(t.arrayValue.values[r]);
        return n;
    }
    return Object.assign({}, t);
}

/** Returns true if the Value represents the canonical {@link #MAX_VALUE} . */ function un(t) {
    return "__max__" === (((t.mapValue || {}).fields || {}).__type__ || {}).stringValue;
}

/** Returns the lowest value for the given value type (inclusive). */ function an(t) {
    return "nullValue" in t ? Ge : "booleanValue" in t ? {
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
    } : "referenceValue" in t ? Ze(Ue.empty(), pt.empty()) : "geoPointValue" in t ? {
        geoPointValue: {
            latitude: -90,
            longitude: -180
        }
    } : "arrayValue" in t ? {
        arrayValue: {}
    } : "mapValue" in t ? {
        mapValue: {}
    } : U();
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
    } : "bytesValue" in t ? Ze(Ue.empty(), pt.empty()) : "referenceValue" in t ? {
        geoPointValue: {
            latitude: -90,
            longitude: -180
        }
    } : "geoPointValue" in t ? {
        arrayValue: {}
    } : "arrayValue" in t ? {
        mapValue: {}
    } : "mapValue" in t ? ze : U();
}

function cn(t, e) {
    var n = We(t.value, e.value);
    return 0 !== n ? n : t.inclusive && !e.inclusive ? -1 : !t.inclusive && e.inclusive ? 1 : 0;
}

function ln(t, e) {
    var n = We(t.value, e.value);
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
 */ var hn = /** @class */ function() {
    function t(t) {
        this.value = t;
    }
    return t.empty = function() {
        return new t({
            mapValue: {}
        });
    }, 
    /**
     * Returns the value at the given path or null.
     *
     * @param path - the path to search
     * @returns The value at the path or null if the path is not set.
     */
    t.prototype.field = function(t) {
        if (t.isEmpty()) return this.value;
        for (var e = this.value, n = 0; n < t.length - 1; ++n) if (!rn(e = (e.mapValue.fields || {})[t.get(n)])) return null;
        return (e = (e.mapValue.fields || {})[t.lastSegment()]) || null;
    }, 
    /**
     * Sets the field to the provided value.
     *
     * @param path - The field path to set.
     * @param value - The value to set.
     */
    t.prototype.set = function(t, e) {
        this.getFieldsMap(t.popLast())[t.lastSegment()] = on(e);
    }, 
    /**
     * Sets the provided fields to the provided values.
     *
     * @param data - A map of fields to values (or null for deletes).
     */
    t.prototype.setAll = function(t) {
        var e = this, n = dt.emptyPath(), r = {}, i = [];
        t.forEach((function(t, o) {
            if (!n.isImmediateParentOf(o)) {
                // Insert the accumulated changes at this parent location
                var u = e.getFieldsMap(n);
                e.applyChanges(u, r, i), r = {}, i = [], n = o.popLast();
            }
            t ? r[o.lastSegment()] = on(t) : i.push(o.lastSegment());
        }));
        var o = this.getFieldsMap(n);
        this.applyChanges(o, r, i);
    }, 
    /**
     * Removes the field at the specified path. If there is no field at the
     * specified path, nothing is changed.
     *
     * @param path - The field path to remove.
     */
    t.prototype.delete = function(t) {
        var e = this.field(t.popLast());
        rn(e) && e.mapValue.fields && delete e.mapValue.fields[t.lastSegment()];
    }, t.prototype.isEqual = function(t) {
        return Ke(this.value, t.value);
    }, 
    /**
     * Returns the map that contains the leaf element of `path`. If the parent
     * entry does not yet exist, or if it is not a map, a new map will be created.
     */
    t.prototype.getFieldsMap = function(t) {
        var e = this.value;
        e.mapValue.fields || (e.mapValue = {
            fields: {}
        });
        for (var n = 0; n < t.length; ++n) {
            var r = e.mapValue.fields[t.get(n)];
            rn(r) && r.mapValue.fields || (r = {
                mapValue: {
                    fields: {}
                }
            }, e.mapValue.fields[t.get(n)] = r), e = r;
        }
        return e.mapValue.fields;
    }, 
    /**
     * Modifies `fieldsMap` by adding, replacing or deleting the specified
     * entries.
     */
    t.prototype.applyChanges = function(t, e, n) {
        Ie(e, (function(e, n) {
            return t[e] = n;
        }));
        for (var r = 0, i = n; r < i.length; r++) {
            var o = i[r];
            delete t[o];
        }
    }, t.prototype.clone = function() {
        return new t(on(this.value));
    }, t;
}();

/**
 * Returns a FieldMask built from all fields in a MapValue.
 */ function fn(t) {
    var e = [];
    return Ie(t.fields, (function(t, n) {
        var r = new dt([ t ]);
        if (rn(n)) {
            var i = fn(n.mapValue).fields;
            if (0 === i.length) 
            // Preserve the empty map by adding it to the FieldMask.
            e.push(r); else 
            // For nested and non-empty ObjectValues, add the FieldPath of the
            // leaf nodes.
            for (var o = 0, u = i; o < u.length; o++) {
                var a = u[o];
                e.push(r.child(a));
            }
        } else 
        // For nested and non-empty ObjectValues, add the FieldPath of the leaf
        // nodes.
        e.push(r);
    })), new Ne(e)
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
 */;
}

var dn = /** @class */ function() {
    function t(t, e, n, r, i, o, u) {
        this.key = t, this.documentType = e, this.version = n, this.readTime = r, this.createTime = i, 
        this.data = o, this.documentState = u
        /**
     * Creates a document with no known version or data, but which can serve as
     * base document for mutations.
     */;
    }
    return t.newInvalidDocument = function(e) {
        return new t(e, 0 /* DocumentType.INVALID */ , 
        /* version */ ct.min(), 
        /* readTime */ ct.min(), 
        /* createTime */ ct.min(), hn.empty(), 0 /* DocumentState.SYNCED */);
    }, 
    /**
     * Creates a new document that is known to exist with the given data at the
     * given version.
     */
    t.newFoundDocument = function(e, n, r, i) {
        return new t(e, 1 /* DocumentType.FOUND_DOCUMENT */ , 
        /* version */ n, 
        /* readTime */ ct.min(), 
        /* createTime */ r, i, 0 /* DocumentState.SYNCED */);
    }, 
    /** Creates a new document that is known to not exist at the given version. */ t.newNoDocument = function(e, n) {
        return new t(e, 2 /* DocumentType.NO_DOCUMENT */ , 
        /* version */ n, 
        /* readTime */ ct.min(), 
        /* createTime */ ct.min(), hn.empty(), 0 /* DocumentState.SYNCED */);
    }, 
    /**
     * Creates a new document that is known to exist at the given version but
     * whose data is not known (e.g. a document that was updated without a known
     * base document).
     */
    t.newUnknownDocument = function(e, n) {
        return new t(e, 3 /* DocumentType.UNKNOWN_DOCUMENT */ , 
        /* version */ n, 
        /* readTime */ ct.min(), 
        /* createTime */ ct.min(), hn.empty(), 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */);
    }, 
    /**
     * Changes the document type to indicate that it exists and that its version
     * and data are known.
     */
    t.prototype.convertToFoundDocument = function(t, e) {
        // If a document is switching state from being an invalid or deleted
        // document to a valid (FOUND_DOCUMENT) document, either due to receiving an
        // update from Watch or due to applying a local set mutation on top
        // of a deleted document, our best guess about its createTime would be the
        // version at which the document transitioned to a FOUND_DOCUMENT.
        return !this.createTime.isEqual(ct.min()) || 2 /* DocumentType.NO_DOCUMENT */ !== this.documentType && 0 /* DocumentType.INVALID */ !== this.documentType || (this.createTime = t), 
        this.version = t, this.documentType = 1 /* DocumentType.FOUND_DOCUMENT */ , this.data = e, 
        this.documentState = 0 /* DocumentState.SYNCED */ , this;
    }, 
    /**
     * Changes the document type to indicate that it doesn't exist at the given
     * version.
     */
    t.prototype.convertToNoDocument = function(t) {
        return this.version = t, this.documentType = 2 /* DocumentType.NO_DOCUMENT */ , 
        this.data = hn.empty(), this.documentState = 0 /* DocumentState.SYNCED */ , this;
    }, 
    /**
     * Changes the document type to indicate that it exists at a given version but
     * that its data is not known (e.g. a document that was updated without a known
     * base document).
     */
    t.prototype.convertToUnknownDocument = function(t) {
        return this.version = t, this.documentType = 3 /* DocumentType.UNKNOWN_DOCUMENT */ , 
        this.data = hn.empty(), this.documentState = 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */ , 
        this;
    }, t.prototype.setHasCommittedMutations = function() {
        return this.documentState = 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */ , this;
    }, t.prototype.setHasLocalMutations = function() {
        return this.documentState = 1 /* DocumentState.HAS_LOCAL_MUTATIONS */ , this.version = ct.min(), 
        this;
    }, t.prototype.setReadTime = function(t) {
        return this.readTime = t, this;
    }, Object.defineProperty(t.prototype, "hasLocalMutations", {
        get: function() {
            return 1 /* DocumentState.HAS_LOCAL_MUTATIONS */ === this.documentState;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "hasCommittedMutations", {
        get: function() {
            return 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */ === this.documentState;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "hasPendingWrites", {
        get: function() {
            return this.hasLocalMutations || this.hasCommittedMutations;
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.isValidDocument = function() {
        return 0 /* DocumentType.INVALID */ !== this.documentType;
    }, t.prototype.isFoundDocument = function() {
        return 1 /* DocumentType.FOUND_DOCUMENT */ === this.documentType;
    }, t.prototype.isNoDocument = function() {
        return 2 /* DocumentType.NO_DOCUMENT */ === this.documentType;
    }, t.prototype.isUnknownDocument = function() {
        return 3 /* DocumentType.UNKNOWN_DOCUMENT */ === this.documentType;
    }, t.prototype.isEqual = function(e) {
        return e instanceof t && this.key.isEqual(e.key) && this.version.isEqual(e.version) && this.documentType === e.documentType && this.documentState === e.documentState && this.data.isEqual(e.data);
    }, t.prototype.mutableCopy = function() {
        return new t(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
    }, t.prototype.toString = function() {
        return "Document(".concat(this.key, ", ").concat(this.version, ", ").concat(JSON.stringify(this.data.value), ", {createTime: ").concat(this.createTime, "}), {documentType: ").concat(this.documentType, "}), {documentState: ").concat(this.documentState, "})");
    }, t;
}(), pn = function(t, e) {
    this.position = t, this.inclusive = e;
};

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
 */ function vn(t, e, n) {
    for (var r = 0, i = 0; i < t.position.length; i++) {
        var o = e[i], u = t.position[i];
        if (r = o.field.isKeyField() ? pt.comparator(pt.fromName(u.referenceValue), n.key) : We(u, n.data.field(o.field)), 
        "desc" /* Direction.DESCENDING */ === o.dir && (r *= -1), 0 !== r) break;
    }
    return r;
}

/**
 * Returns true if a document sorts after a bound using the provided sort
 * order.
 */ function mn(t, e) {
    if (null === t) return null === e;
    if (null === e) return !1;
    if (t.inclusive !== e.inclusive || t.position.length !== e.position.length) return !1;
    for (var n = 0; n < t.position.length; n++) if (!Ke(t.position[n], e.position[n])) return !1;
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
 */ var yn = function(t, e /* Direction.ASCENDING */) {
    void 0 === e && (e = "asc"), this.field = t, this.dir = e;
};

function gn(t, e) {
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
 */ var wn = function() {}, bn = /** @class */ function(e) {
    function n(t, n, r) {
        var i = this;
        return (i = e.call(this) || this).field = t, i.op = n, i.value = r, i;
    }
    /**
     * Creates a filter based on the provided arguments.
     */    return t(n, e), n.create = function(t, e, r) {
        return t.isKeyField() ? "in" /* Operator.IN */ === e || "not-in" /* Operator.NOT_IN */ === e ? this.createKeyFieldInFilter(t, e, r) : new An(t, e, r) : "array-contains" /* Operator.ARRAY_CONTAINS */ === e ? new Pn(t, r) : "in" /* Operator.IN */ === e ? new Rn(t, r) : "not-in" /* Operator.NOT_IN */ === e ? new Vn(t, r) : "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ === e ? new Mn(t, r) : new n(t, e, r);
    }, n.createKeyFieldInFilter = function(t, e, n) {
        return "in" /* Operator.IN */ === e ? new kn(t, n) : new On(t, n);
    }, n.prototype.matches = function(t) {
        var e = t.data.field(this.field);
        // Types do not have to match in NOT_EQUAL filters.
                return "!=" /* Operator.NOT_EQUAL */ === this.op ? null !== e && this.matchesComparison(We(e, this.value)) : null !== e && je(this.value) === je(e) && this.matchesComparison(We(e, this.value));
        // Only compare types with matching backend order (such as double and int).
        }, n.prototype.matchesComparison = function(t) {
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
            return U();
        }
    }, n.prototype.isInequality = function() {
        return [ "<" /* Operator.LESS_THAN */ , "<=" /* Operator.LESS_THAN_OR_EQUAL */ , ">" /* Operator.GREATER_THAN */ , ">=" /* Operator.GREATER_THAN_OR_EQUAL */ , "!=" /* Operator.NOT_EQUAL */ , "not-in" /* Operator.NOT_IN */ ].indexOf(this.op) >= 0;
    }, n.prototype.getFlattenedFilters = function() {
        return [ this ];
    }, n.prototype.getFilters = function() {
        return [ this ];
    }, n.prototype.getFirstInequalityField = function() {
        return this.isInequality() ? this.field : null;
    }, n;
}(wn), In = /** @class */ function(e) {
    function n(t, n) {
        var r = this;
        return (r = e.call(this) || this).filters = t, r.op = n, r.lt = null, r;
    }
    /**
     * Creates a filter based on the provided arguments.
     */    return t(n, e), n.create = function(t, e) {
        return new n(t, e);
    }, n.prototype.matches = function(t) {
        return En(this) ? void 0 === this.filters.find((function(e) {
            return !e.matches(t);
        })) : void 0 !== this.filters.find((function(e) {
            return e.matches(t);
        }));
    }, n.prototype.getFlattenedFilters = function() {
        return null !== this.lt || (this.lt = this.filters.reduce((function(t, e) {
            return t.concat(e.getFlattenedFilters());
        }), [])), this.lt;
    }, 
    // Returns a mutable copy of `this.filters`
    n.prototype.getFilters = function() {
        return Object.assign([], this.filters);
    }, n.prototype.getFirstInequalityField = function() {
        var t = this.ft((function(t) {
            return t.isInequality();
        }));
        return null !== t ? t.field : null;
    }, 
    // Performs a depth-first search to find and return the first FieldFilter in the composite filter
    // that satisfies the predicate. Returns `null` if none of the FieldFilters satisfy the
    // predicate.
    n.prototype.ft = function(t) {
        for (var e = 0, n = this.getFlattenedFilters(); e < n.length; e++) {
            var r = n[e];
            if (t(r)) return r;
        }
        return null;
    }, n;
}(wn);

function En(t) {
    return "and" /* CompositeOperator.AND */ === t.op;
}

function Tn(t) {
    return "or" /* CompositeOperator.OR */ === t.op;
}

/**
 * Returns true if this filter is a conjunction of field filters only. Returns false otherwise.
 */ function Sn(t) {
    return _n(t) && En(t);
}

/**
 * Returns true if this filter does not contain any composite filters. Returns false otherwise.
 */ function _n(t) {
    for (var e = 0, n = t.filters; e < n.length; e++) {
        if (n[e] instanceof In) return !1;
    }
    return !0;
}

function Dn(t) {
    if (t instanceof bn) 
    // TODO(b/29183165): Technically, this won't be unique if two values have
    // the same description, such as the int 3 and the string "3". So we should
    // add the types in here somehow, too.
    return t.field.canonicalString() + t.op.toString() + Ye(t.value);
    if (Sn(t)) 
    // Older SDK versions use an implicit AND operation between their filters.
    // In the new SDK versions, the developer may use an explicit AND filter.
    // To stay consistent with the old usages, we add a special case to ensure
    // the canonical ID for these two are the same. For example:
    // `col.whereEquals("a", 1).whereEquals("b", 2)` should have the same
    // canonical ID as `col.where(and(equals("a",1), equals("b",2)))`.
    return t.filters.map((function(t) {
        return Dn(t);
    })).join(",");
    // filter instanceof CompositeFilter
    var e = t.filters.map((function(t) {
        return Dn(t);
    })).join(",");
    return "".concat(t.op, "(").concat(e, ")");
}

function Cn(t, e) {
    return t instanceof bn ? function(t, e) {
        return e instanceof bn && t.op === e.op && t.field.isEqual(e.field) && Ke(t.value, e.value);
    }(t, e) : t instanceof In ? function(t, e) {
        return e instanceof In && t.op === e.op && t.filters.length === e.filters.length && t.filters.reduce((function(t, n, r) {
            return t && Cn(n, e.filters[r]);
        }), !0);
    }(t, e) : void U();
}

function xn(t, e) {
    var n = t.filters.concat(e);
    return In.create(n, t.op);
}

/** Returns a debug description for `filter`. */ function Nn(t) {
    return t instanceof bn ? function(t) {
        return "".concat(t.field.canonicalString(), " ").concat(t.op, " ").concat(Ye(t.value));
    }(t) : t instanceof In ? function(t) {
        return t.op.toString() + " {" + t.getFilters().map(Nn).join(" ,") + "}";
    }(t) : "Filter";
}

var An = /** @class */ function(e) {
    function n(t, n, r) {
        var i = this;
        return (i = e.call(this, t, n, r) || this).key = pt.fromName(r.referenceValue), 
        i;
    }
    return t(n, e), n.prototype.matches = function(t) {
        var e = pt.comparator(t.key, this.key);
        return this.matchesComparison(e);
    }, n;
}(bn), kn = /** @class */ function(e) {
    function n(t, n) {
        var r = this;
        return (r = e.call(this, t, "in" /* Operator.IN */ , n) || this).keys = Fn("in" /* Operator.IN */ , n), 
        r;
    }
    return t(n, e), n.prototype.matches = function(t) {
        return this.keys.some((function(e) {
            return e.isEqual(t.key);
        }));
    }, n;
}(bn), On = /** @class */ function(e) {
    function n(t, n) {
        var r = this;
        return (r = e.call(this, t, "not-in" /* Operator.NOT_IN */ , n) || this).keys = Fn("not-in" /* Operator.NOT_IN */ , n), 
        r;
    }
    return t(n, e), n.prototype.matches = function(t) {
        return !this.keys.some((function(e) {
            return e.isEqual(t.key);
        }));
    }, n;
}(bn);

/** Filter that matches on key fields within an array. */ function Fn(t, e) {
    var n;
    return ((null === (n = e.arrayValue) || void 0 === n ? void 0 : n.values) || []).map((function(t) {
        return pt.fromName(t.referenceValue);
    }));
}

/** A Filter that implements the array-contains operator. */ var Pn = /** @class */ function(e) {
    function n(t, n) {
        return e.call(this, t, "array-contains" /* Operator.ARRAY_CONTAINS */ , n) || this;
    }
    return t(n, e), n.prototype.matches = function(t) {
        var e = t.data.field(this.field);
        return tn(e) && Qe(e.arrayValue, this.value);
    }, n;
}(bn), Rn = /** @class */ function(e) {
    function n(t, n) {
        return e.call(this, t, "in" /* Operator.IN */ , n) || this;
    }
    return t(n, e), n.prototype.matches = function(t) {
        var e = t.data.field(this.field);
        return null !== e && Qe(this.value.arrayValue, e);
    }, n;
}(bn), Vn = /** @class */ function(e) {
    function n(t, n) {
        return e.call(this, t, "not-in" /* Operator.NOT_IN */ , n) || this;
    }
    return t(n, e), n.prototype.matches = function(t) {
        if (Qe(this.value.arrayValue, {
            nullValue: "NULL_VALUE"
        })) return !1;
        var e = t.data.field(this.field);
        return null !== e && !Qe(this.value.arrayValue, e);
    }, n;
}(bn), Mn = /** @class */ function(e) {
    function n(t, n) {
        return e.call(this, t, "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ , n) || this;
    }
    return t(n, e), n.prototype.matches = function(t) {
        var e = this, n = t.data.field(this.field);
        return !(!tn(n) || !n.arrayValue.values) && n.arrayValue.values.some((function(t) {
            return Qe(e.value.arrayValue, t);
        }));
    }, n;
}(bn), Ln = function(t, e, n, r, i, o, u) {
    void 0 === e && (e = null), void 0 === n && (n = []), void 0 === r && (r = []), 
    void 0 === i && (i = null), void 0 === o && (o = null), void 0 === u && (u = null), 
    this.path = t, this.collectionGroup = e, this.orderBy = n, this.filters = r, this.limit = i, 
    this.startAt = o, this.endAt = u, this.dt = null;
};

/** A Filter that implements the IN operator. */
/**
 * Initializes a Target with a path and optional additional query constraints.
 * Path must currently be empty if this is a collection group query.
 *
 * NOTE: you should always construct `Target` from `Query.toTarget` instead of
 * using this factory method, because `Query` provides an implicit `orderBy`
 * property.
 */
function qn(t, e, n, r, i, o, u) {
    return void 0 === e && (e = null), void 0 === n && (n = []), void 0 === r && (r = []), 
    void 0 === i && (i = null), void 0 === o && (o = null), void 0 === u && (u = null), 
    new Ln(t, e, n, r, i, o, u);
}

function Bn(t) {
    var e = j(t);
    if (null === e.dt) {
        var n = e.path.canonicalString();
        null !== e.collectionGroup && (n += "|cg:" + e.collectionGroup), n += "|f:", n += e.filters.map((function(t) {
            return Dn(t);
        })).join(","), n += "|ob:", n += e.orderBy.map((function(t) {
            return function(t) {
                // TODO(b/29183165): Make this collision robust.
                return t.field.canonicalString() + t.dir;
            }(t);
        })).join(","), zt(e.limit) || (n += "|l:", n += e.limit), e.startAt && (n += "|lb:", 
        n += e.startAt.inclusive ? "b:" : "a:", n += e.startAt.position.map((function(t) {
            return Ye(t);
        })).join(",")), e.endAt && (n += "|ub:", n += e.endAt.inclusive ? "a:" : "b:", n += e.endAt.position.map((function(t) {
            return Ye(t);
        })).join(",")), e.dt = n;
    }
    return e.dt;
}

function Un(t, e) {
    if (t.limit !== e.limit) return !1;
    if (t.orderBy.length !== e.orderBy.length) return !1;
    for (var n = 0; n < t.orderBy.length; n++) if (!gn(t.orderBy[n], e.orderBy[n])) return !1;
    if (t.filters.length !== e.filters.length) return !1;
    for (var r = 0; r < t.filters.length; r++) if (!Cn(t.filters[r], e.filters[r])) return !1;
    return t.collectionGroup === e.collectionGroup && !!t.path.isEqual(e.path) && !!mn(t.startAt, e.startAt) && mn(t.endAt, e.endAt);
}

function zn(t) {
    return pt.isDocumentKey(t.path) && null === t.collectionGroup && 0 === t.filters.length;
}

/** Returns the field filters that target the given field path. */ function Gn(t, e) {
    return t.filters.filter((function(t) {
        return t instanceof bn && t.field.isEqual(e);
    }));
}

/**
 * Returns the values that are used in ARRAY_CONTAINS or ARRAY_CONTAINS_ANY
 * filters. Returns `null` if there are no such filters.
 */
/**
 * Returns the value to use as the lower bound for ascending index segment at
 * the provided `fieldPath` (or the upper bound for an descending segment).
 */ function jn(t, e, n) {
    // Process all filters to find a value for the current field segment
    for (var r = Ge, i = !0, o = 0, u = Gn(t, e); o < u.length; o++) {
        var a = u[o], s = Ge, c = !0;
        switch (a.op) {
          case "<" /* Operator.LESS_THAN */ :
          case "<=" /* Operator.LESS_THAN_OR_EQUAL */ :
            s = an(a.value);
            break;

          case "==" /* Operator.EQUAL */ :
          case "in" /* Operator.IN */ :
          case ">=" /* Operator.GREATER_THAN_OR_EQUAL */ :
            s = a.value;
            break;

          case ">" /* Operator.GREATER_THAN */ :
            s = a.value, c = !1;
            break;

          case "!=" /* Operator.NOT_EQUAL */ :
          case "not-in" /* Operator.NOT_IN */ :
            s = Ge;
            // Remaining filters cannot be used as lower bounds.
                }
        cn({
            value: r,
            inclusive: i
        }, {
            value: s,
            inclusive: c
        }) < 0 && (r = s, i = c);
    }
    // If there is an additional bound, compare the values against the existing
    // range to see if we can narrow the scope.
        if (null !== n) for (var l = 0; l < t.orderBy.length; ++l) if (t.orderBy[l].field.isEqual(e)) {
        var h = n.position[l];
        cn({
            value: r,
            inclusive: i
        }, {
            value: h,
            inclusive: n.inclusive
        }) < 0 && (r = h, i = n.inclusive);
        break;
    }
    return {
        value: r,
        inclusive: i
    };
}

/**
 * Returns the value to use as the upper bound for ascending index segment at
 * the provided `fieldPath` (or the lower bound for a descending segment).
 */ function Kn(t, e, n) {
    // Process all filters to find a value for the current field segment
    for (var r = ze, i = !0, o = 0, u = Gn(t, e); o < u.length; o++) {
        var a = u[o], s = ze, c = !0;
        switch (a.op) {
          case ">=" /* Operator.GREATER_THAN_OR_EQUAL */ :
          case ">" /* Operator.GREATER_THAN */ :
            s = sn(a.value), c = !1;
            break;

          case "==" /* Operator.EQUAL */ :
          case "in" /* Operator.IN */ :
          case "<=" /* Operator.LESS_THAN_OR_EQUAL */ :
            s = a.value;
            break;

          case "<" /* Operator.LESS_THAN */ :
            s = a.value, c = !1;
            break;

          case "!=" /* Operator.NOT_EQUAL */ :
          case "not-in" /* Operator.NOT_IN */ :
            s = ze;
            // Remaining filters cannot be used as upper bounds.
                }
        ln({
            value: r,
            inclusive: i
        }, {
            value: s,
            inclusive: c
        }) > 0 && (r = s, i = c);
    }
    // If there is an additional bound, compare the values against the existing
    // range to see if we can narrow the scope.
        if (null !== n) for (var l = 0; l < t.orderBy.length; ++l) if (t.orderBy[l].field.isEqual(e)) {
        var h = n.position[l];
        ln({
            value: r,
            inclusive: i
        }, {
            value: h,
            inclusive: n.inclusive
        }) > 0 && (r = h, i = n.inclusive);
        break;
    }
    return {
        value: r,
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
 */ var Qn = 
/**
     * Initializes a Query with a path and optional additional query constraints.
     * Path must currently be empty if this is a collection group query.
     */
function(t, e, n, r, i, o /* LimitType.First */ , u, a) {
    void 0 === e && (e = null), void 0 === n && (n = []), void 0 === r && (r = []), 
    void 0 === i && (i = null), void 0 === o && (o = "F"), void 0 === u && (u = null), 
    void 0 === a && (a = null), this.path = t, this.collectionGroup = e, this.explicitOrderBy = n, 
    this.filters = r, this.limit = i, this.limitType = o, this.startAt = u, this.endAt = a, 
    this.wt = null, 
    // The corresponding `Target` of this `Query` instance.
    this._t = null, this.startAt, this.endAt;
};

/** Creates a new Query instance with the options provided. */ function Wn(t, e, n, r, i, o, u, a) {
    return new Qn(t, e, n, r, i, o, u, a);
}

/** Creates a new Query for a query that matches all documents at `path` */ function Hn(t) {
    return new Qn(t);
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
 */ function Yn(t) {
    return 0 === t.filters.length && null === t.limit && null == t.startAt && null == t.endAt && (0 === t.explicitOrderBy.length || 1 === t.explicitOrderBy.length && t.explicitOrderBy[0].field.isKeyField());
}

function Xn(t) {
    return t.explicitOrderBy.length > 0 ? t.explicitOrderBy[0].field : null;
}

function Jn(t) {
    for (var e = 0, n = t.filters; e < n.length; e++) {
        var r = n[e].getFirstInequalityField();
        if (null !== r) return r;
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
 */ function Zn(t) {
    return null !== t.collectionGroup;
}

/**
 * Returns the implicit order by constraint that is used to execute the Query,
 * which can be different from the order by constraints the user provided (e.g.
 * the SDK and backend always orders by `__name__`).
 */ function $n(t) {
    var e = j(t);
    if (null === e.wt) {
        e.wt = [];
        var n = Jn(e), r = Xn(e);
        if (null !== n && null === r) 
        // In order to implicitly add key ordering, we must also add the
        // inequality filter field for it to be a valid query.
        // Note that the default inequality field and key ordering is ascending.
        n.isKeyField() || e.wt.push(new yn(n)), e.wt.push(new yn(dt.keyField(), "asc" /* Direction.ASCENDING */)); else {
            for (var i = !1, o = 0, u = e.explicitOrderBy; o < u.length; o++) {
                var a = u[o];
                e.wt.push(a), a.field.isKeyField() && (i = !0);
            }
            if (!i) {
                // The order of the implicit key ordering always matches the last
                // explicit order by
                var s = e.explicitOrderBy.length > 0 ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir : "asc" /* Direction.ASCENDING */;
                e.wt.push(new yn(dt.keyField(), s));
            }
        }
    }
    return e.wt;
}

/**
 * Converts this `Query` instance to it's corresponding `Target` representation.
 */ function tr(t) {
    var e = j(t);
    if (!e._t) if ("F" /* LimitType.First */ === e.limitType) e._t = qn(e.path, e.collectionGroup, $n(e), e.filters, e.limit, e.startAt, e.endAt); else {
        for (
        // Flip the orderBy directions since we want the last results
        var n = [], r = 0, i = $n(e); r < i.length; r++) {
            var o = i[r], u = "desc" /* Direction.DESCENDING */ === o.dir ? "asc" /* Direction.ASCENDING */ : "desc" /* Direction.DESCENDING */;
            n.push(new yn(o.field, u));
        }
        // We need to swap the cursors to match the now-flipped query ordering.
                var a = e.endAt ? new pn(e.endAt.position, e.endAt.inclusive) : null, s = e.startAt ? new pn(e.startAt.position, e.startAt.inclusive) : null;
        // Now return as a LimitType.First query.
                e._t = qn(e.path, e.collectionGroup, n, e.filters, e.limit, a, s);
    }
    return e._t;
}

function er(t, e) {
    e.getFirstInequalityField(), Jn(t);
    var n = t.filters.concat([ e ]);
    return new Qn(t.path, t.collectionGroup, t.explicitOrderBy.slice(), n, t.limit, t.limitType, t.startAt, t.endAt);
}

function nr(t, e, n) {
    return new Qn(t.path, t.collectionGroup, t.explicitOrderBy.slice(), t.filters.slice(), e, n, t.startAt, t.endAt);
}

function rr(t, e) {
    return Un(tr(t), tr(e)) && t.limitType === e.limitType;
}

// TODO(b/29183165): This is used to get a unique string from a query to, for
// example, use as a dictionary key, but the implementation is subject to
// collisions. Make it collision-free.
function ir(t) {
    return "".concat(Bn(tr(t)), "|lt:").concat(t.limitType);
}

function or(t) {
    return "Query(target=".concat(function(t) {
        var e = t.path.canonicalString();
        return null !== t.collectionGroup && (e += " collectionGroup=" + t.collectionGroup), 
        t.filters.length > 0 && (e += ", filters: [".concat(t.filters.map((function(t) {
            return Nn(t);
        })).join(", "), "]")), zt(t.limit) || (e += ", limit: " + t.limit), t.orderBy.length > 0 && (e += ", orderBy: [".concat(t.orderBy.map((function(t) {
            return function(t) {
                return "".concat(t.field.canonicalString(), " (").concat(t.dir, ")");
            }(t);
        })).join(", "), "]")), t.startAt && (e += ", startAt: ", e += t.startAt.inclusive ? "b:" : "a:", 
        e += t.startAt.position.map((function(t) {
            return Ye(t);
        })).join(",")), t.endAt && (e += ", endAt: ", e += t.endAt.inclusive ? "a:" : "b:", 
        e += t.endAt.position.map((function(t) {
            return Ye(t);
        })).join(",")), "Target(".concat(e, ")");
    }(tr(t)), "; limitType=").concat(t.limitType, ")");
}

/** Returns whether `doc` matches the constraints of `query`. */ function ur(t, e) {
    return e.isFoundDocument() && function(t, e) {
        var n = e.key.path;
        return null !== t.collectionGroup ? e.key.hasCollectionId(t.collectionGroup) && t.path.isPrefixOf(n) : pt.isDocumentKey(t.path) ? t.path.isEqual(n) : t.path.isImmediateParentOf(n);
    }(t, e) && function(t, e) {
        // We must use `queryOrderBy()` to get the list of all orderBys (both implicit and explicit).
        // Note that for OR queries, orderBy applies to all disjunction terms and implicit orderBys must
        // be taken into account. For example, the query "a > 1 || b==1" has an implicit "orderBy a" due
        // to the inequality, and is evaluated as "a > 1 orderBy a || b==1 orderBy a".
        // A document with content of {b:1} matches the filters, but does not match the orderBy because
        // it's missing the field 'a'.
        for (var n = 0, r = $n(t); n < r.length; n++) {
            var i = r[n];
            // order by key always matches
                        if (!i.field.isKeyField() && null === e.data.field(i.field)) return !1;
        }
        return !0;
    }(t, e) && function(t, e) {
        for (var n = 0, r = t.filters; n < r.length; n++) {
            if (!r[n].matches(e)) return !1;
        }
        return !0;
    }(t, e) && function(t, e) {
        return !(t.startAt && 
        /**
 * Returns true if a document sorts before a bound using the provided sort
 * order.
 */
        !function(t, e, n) {
            var r = vn(t, e, n);
            return t.inclusive ? r <= 0 : r < 0;
        }(t.startAt, $n(t), e)) && !(t.endAt && !function(t, e, n) {
            var r = vn(t, e, n);
            return t.inclusive ? r >= 0 : r > 0;
        }(t.endAt, $n(t), e));
    }(t, e);
}

function ar(t) {
    return t.collectionGroup || (t.path.length % 2 == 1 ? t.path.lastSegment() : t.path.get(t.path.length - 2));
}

/**
 * Returns a new comparator function that can be used to compare two documents
 * based on the Query's ordering constraint.
 */ function sr(t) {
    return function(e, n) {
        for (var r = !1, i = 0, o = $n(t); i < o.length; i++) {
            var u = o[i], a = cr(u, e, n);
            if (0 !== a) return a;
            r = r || u.field.isKeyField();
        }
        return 0;
    };
}

function cr(t, e, n) {
    var r = t.field.isKeyField() ? pt.comparator(e.key, n.key) : function(t, e, n) {
        var r = e.data.field(t), i = n.data.field(t);
        return null !== r && null !== i ? We(r, i) : U();
    }(t.field, e, n);
    switch (t.dir) {
      case "asc" /* Direction.ASCENDING */ :
        return r;

      case "desc" /* Direction.DESCENDING */ :
        return -1 * r;

      default:
        return U();
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
 */ var lr = /** @class */ function() {
    function t(t, e) {
        this.mapKeyFn = t, this.equalsFn = e, 
        /**
             * The inner map for a key/value pair. Due to the possibility of collisions we
             * keep a list of entries that we do a linear search through to find an actual
             * match. Note that collisions should be rare, so we still expect near
             * constant time lookups in practice.
             */
        this.inner = {}, 
        /** The number of entries stored in the map */
        this.innerSize = 0
        /** Get a value for this key, or undefined if it does not exist. */;
    }
    return t.prototype.get = function(t) {
        var e = this.mapKeyFn(t), n = this.inner[e];
        if (void 0 !== n) for (var r = 0, i = n; r < i.length; r++) {
            var o = i[r], u = o[0], a = o[1];
            if (this.equalsFn(u, t)) return a;
        }
    }, t.prototype.has = function(t) {
        return void 0 !== this.get(t);
    }, 
    /** Put this key and value in the map. */ t.prototype.set = function(t, e) {
        var n = this.mapKeyFn(t), r = this.inner[n];
        if (void 0 === r) return this.inner[n] = [ [ t, e ] ], void this.innerSize++;
        for (var i = 0; i < r.length; i++) if (this.equalsFn(r[i][0], t)) 
        // This is updating an existing entry and does not increase `innerSize`.
        return void (r[i] = [ t, e ]);
        r.push([ t, e ]), this.innerSize++;
    }, 
    /**
     * Remove this key from the map. Returns a boolean if anything was deleted.
     */
    t.prototype.delete = function(t) {
        var e = this.mapKeyFn(t), n = this.inner[e];
        if (void 0 === n) return !1;
        for (var r = 0; r < n.length; r++) if (this.equalsFn(n[r][0], t)) return 1 === n.length ? delete this.inner[e] : n.splice(r, 1), 
        this.innerSize--, !0;
        return !1;
    }, t.prototype.forEach = function(t) {
        Ie(this.inner, (function(e, n) {
            for (var r = 0, i = n; r < i.length; r++) {
                var o = i[r], u = o[0], a = o[1];
                t(u, a);
            }
        }));
    }, t.prototype.isEmpty = function() {
        return Ee(this.inner);
    }, t.prototype.size = function() {
        return this.innerSize;
    }, t;
}(), hr = new Te(pt.comparator);

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
 */ function fr() {
    return hr;
}

var dr = new Te(pt.comparator);

function pr() {
    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
    for (var n = dr, r = 0, i = t; r < i.length; r++) {
        var o = i[r];
        n = n.insert(o.key, o);
    }
    return n;
}

function vr(t) {
    var e = dr;
    return t.forEach((function(t, n) {
        return e = e.insert(t, n.overlayedDocument);
    })), e;
}

function mr() {
    return gr();
}

function yr() {
    return gr();
}

function gr() {
    return new lr((function(t) {
        return t.toString();
    }), (function(t, e) {
        return t.isEqual(e);
    }));
}

var wr = new Te(pt.comparator), br = new De(pt.comparator);

function Ir() {
    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
    for (var n = br, r = 0, i = t; r < i.length; r++) {
        var o = i[r];
        n = n.add(o);
    }
    return n;
}

var Er = new De(ot);

function Tr() {
    return Er;
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
 */ function Sr(t, e) {
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
        doubleValue: Gt(e) ? "-0" : e
    };
}

/**
 * Returns an IntegerValue for `value`.
 */ function _r(t) {
    return {
        integerValue: "" + t
    };
}

/**
 * Returns a value for a number that's appropriate to put into a proto.
 * The return value is an IntegerValue if it can safely represent the value,
 * otherwise a DoubleValue is returned.
 */ function Dr(t, e) {
    return jt(e) ? _r(e) : Sr(t, e);
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
/** Used to represent a field transform on a mutation. */ var Cr = function() {
    // Make sure that the structural type of `TransformOperation` is unique.
    // See https://github.com/microsoft/TypeScript/issues/5451
    this._ = void 0;
};

/**
 * Computes the local transform result against the provided `previousValue`,
 * optionally using the provided localWriteTime.
 */ function xr(t, e, n) {
    return t instanceof kr ? function(t, e) {
        var n = {
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
                return e && Me(e) && (e = Le(e)), e && (n.fields.__previous_value__ = e), 
        {
            mapValue: n
        };
    }(n, e) : t instanceof Or ? Fr(t, e) : t instanceof Pr ? Rr(t, e) : function(t, e) {
        // PORTING NOTE: Since JavaScript's integer arithmetic is limited to 53 bit
        // precision and resolves overflows by reducing precision, we do not
        // manually cap overflows at 2^63.
        var n = Ar(t, e), r = Mr(n) + Mr(t.gt);
        return $e(n) && $e(t.gt) ? _r(r) : Sr(t.serializer, r);
    }(t, e);
}

/**
 * Computes a final transform result after the transform has been acknowledged
 * by the server, potentially using the server-provided transformResult.
 */ function Nr(t, e, n) {
    // The server just sends null as the transform result for array operations,
    // so we have to calculate a result the same as we do for local
    // applications.
    return t instanceof Or ? Fr(t, e) : t instanceof Pr ? Rr(t, e) : n;
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
 */ function Ar(t, e) {
    return t instanceof Vr ? $e(n = e) || function(t) {
        return !!t && "doubleValue" in t;
    }(n) ? e : {
        integerValue: 0
    } : null;
    var n;
}

/** Transforms a value into a server-generated timestamp. */ var kr = /** @class */ function(e) {
    function n() {
        return null !== e && e.apply(this, arguments) || this;
    }
    return t(n, e), n;
}(Cr), Or = /** @class */ function(e) {
    function n(t) {
        var n = this;
        return (n = e.call(this) || this).elements = t, n;
    }
    return t(n, e), n;
}(Cr);

/** Transforms an array value via a union operation. */ function Fr(t, e) {
    for (var n = Lr(e), r = function(t) {
        n.some((function(e) {
            return Ke(e, t);
        })) || n.push(t);
    }, i = 0, o = t.elements; i < o.length; i++) {
        r(o[i]);
    }
    return {
        arrayValue: {
            values: n
        }
    };
}

/** Transforms an array value via a remove operation. */ var Pr = /** @class */ function(e) {
    function n(t) {
        var n = this;
        return (n = e.call(this) || this).elements = t, n;
    }
    return t(n, e), n;
}(Cr);

function Rr(t, e) {
    for (var n = Lr(e), r = function(t) {
        n = n.filter((function(e) {
            return !Ke(e, t);
        }));
    }, i = 0, o = t.elements; i < o.length; i++) {
        r(o[i]);
    }
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
 */ var Vr = /** @class */ function(e) {
    function n(t, n) {
        var r = this;
        return (r = e.call(this) || this).serializer = t, r.gt = n, r;
    }
    return t(n, e), n;
}(Cr);

function Mr(t) {
    return Re(t.integerValue || t.doubleValue);
}

function Lr(t) {
    return tn(t) && t.arrayValue.values ? t.arrayValue.values.slice() : [];
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
/** A field path and the TransformOperation to perform upon it. */ var qr = function(t, e) {
    this.field = t, this.transform = e;
};

/** The result of successfully applying a mutation to the backend. */
var Br = function(
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
}, Ur = /** @class */ function() {
    function t(t, e) {
        this.updateTime = t, this.exists = e
        /** Creates a new empty Precondition. */;
    }
    return t.none = function() {
        return new t;
    }, 
    /** Creates a new Precondition with an exists flag. */ t.exists = function(e) {
        return new t(void 0, e);
    }, 
    /** Creates a new Precondition based on a version a document exists at. */ t.updateTime = function(e) {
        return new t(e);
    }, Object.defineProperty(t.prototype, "isNone", {
        /** Returns whether this Precondition is empty. */ get: function() {
            return void 0 === this.updateTime && void 0 === this.exists;
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.isEqual = function(t) {
        return this.exists === t.exists && (this.updateTime ? !!t.updateTime && this.updateTime.isEqual(t.updateTime) : !t.updateTime);
    }, t;
}();

/**
 * Encodes a precondition for a mutation. This follows the model that the
 * backend accepts with the special case of an explicit "empty" precondition
 * (meaning no precondition).
 */
/** Returns true if the preconditions is valid for the given document. */ function zr(t, e) {
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
 */ var Gr = function() {};

/**
 * A utility method to calculate a `Mutation` representing the overlay from the
 * final state of the document, and a `FieldMask` representing the fields that
 * are mutated by the local mutations.
 */ function jr(t, e) {
    if (!t.hasLocalMutations || e && 0 === e.fields.length) return null;
    // mask is null when sets or deletes are applied to the current document.
        if (null === e) return t.isNoDocument() ? new ni(t.key, Ur.none()) : new Yr(t.key, t.data, Ur.none());
    for (var n = t.data, r = hn.empty(), i = new De(dt.comparator), o = 0, u = e.fields; o < u.length; o++) {
        var a = u[o];
        if (!i.has(a)) {
            var s = n.field(a);
            // If we are deleting a nested field, we take the immediate parent as
            // the mask used to construct the resulting mutation.
            // Justification: Nested fields can create parent fields implicitly. If
            // only a leaf entry is deleted in later mutations, the parent field
            // should still remain, but we may have lost this information.
            // Consider mutation (foo.bar 1), then mutation (foo.bar delete()).
            // This leaves the final result (foo, {}). Despite the fact that `doc`
            // has the correct result, `foo` is not in `mask`, and the resulting
            // mutation would miss `foo`.
                        null === s && a.length > 1 && (a = a.popLast(), s = n.field(a)), null === s ? r.delete(a) : r.set(a, s), 
            i = i.add(a);
        }
    }
    return new Xr(t.key, r, new Ne(i.toArray()), Ur.none());
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
 */ function Kr(t, e, n) {
    t instanceof Yr ? function(t, e, n) {
        // Unlike setMutationApplyToLocalView, if we're applying a mutation to a
        // remote document the server has accepted the mutation so the precondition
        // must have held.
        var r = t.value.clone(), i = Zr(t.fieldTransforms, e, n.transformResults);
        r.setAll(i), e.convertToFoundDocument(n.version, r).setHasCommittedMutations();
    }(t, e, n) : t instanceof Xr ? function(t, e, n) {
        if (zr(t.precondition, e)) {
            var r = Zr(t.fieldTransforms, e, n.transformResults), i = e.data;
            i.setAll(Jr(t)), i.setAll(r), e.convertToFoundDocument(n.version, i).setHasCommittedMutations();
        } else e.convertToUnknownDocument(n.version);
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
 */ function Qr(t, e, n, r) {
    return t instanceof Yr ? function(t, e, n, r) {
        if (!zr(t.precondition, e)) 
        // The mutation failed to apply (e.g. a document ID created with add()
        // caused a name collision).
        return n;
        var i = t.value.clone(), o = $r(t.fieldTransforms, r, e);
        return i.setAll(o), e.convertToFoundDocument(e.version, i).setHasLocalMutations(), 
        null;
        // SetMutation overwrites all fields.
        }(t, e, n, r) : t instanceof Xr ? function(t, e, n, r) {
        if (!zr(t.precondition, e)) return n;
        var i = $r(t.fieldTransforms, r, e), o = e.data;
        return o.setAll(Jr(t)), o.setAll(i), e.convertToFoundDocument(e.version, o).setHasLocalMutations(), 
        null === n ? null : n.unionWith(t.fieldMask.fields).unionWith(t.fieldTransforms.map((function(t) {
            return t.field;
        })));
    }(t, e, n, r) : function(t, e, n) {
        return zr(t.precondition, e) ? (e.convertToNoDocument(e.version).setHasLocalMutations(), 
        null) : n;
    }(t, e, n);
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
 */ function Wr(t, e) {
    for (var n = null, r = 0, i = t.fieldTransforms; r < i.length; r++) {
        var o = i[r], u = e.data.field(o.field), a = Ar(o.transform, u || null);
        null != a && (null === n && (n = hn.empty()), n.set(o.field, a));
    }
    return n || null;
}

function Hr(t, e) {
    return t.type === e.type && !!t.key.isEqual(e.key) && !!t.precondition.isEqual(e.precondition) && !!function(t, e) {
        return void 0 === t && void 0 === e || !(!t || !e) && ut(t, e, (function(t, e) {
            return function(t, e) {
                return t.field.isEqual(e.field) && function(t, e) {
                    return t instanceof Or && e instanceof Or || t instanceof Pr && e instanceof Pr ? ut(t.elements, e.elements, Ke) : t instanceof Vr && e instanceof Vr ? Ke(t.gt, e.gt) : t instanceof kr && e instanceof kr;
                }(t.transform, e.transform);
            }(t, e);
        }));
    }(t.fieldTransforms, e.fieldTransforms) && (0 /* MutationType.Set */ === t.type ? t.value.isEqual(e.value) : 1 /* MutationType.Patch */ !== t.type || t.data.isEqual(e.data) && t.fieldMask.isEqual(e.fieldMask));
}

/**
 * A mutation that creates or replaces the document at the given key with the
 * object value contents.
 */ var Yr = /** @class */ function(e) {
    function n(t, n, r, i) {
        void 0 === i && (i = []);
        var o = this;
        return (o = e.call(this) || this).key = t, o.value = n, o.precondition = r, o.fieldTransforms = i, 
        o.type = 0 /* MutationType.Set */ , o;
    }
    return t(n, e), n.prototype.getFieldMask = function() {
        return null;
    }, n;
}(Gr), Xr = /** @class */ function(e) {
    function n(t, n, r, i, o) {
        void 0 === o && (o = []);
        var u = this;
        return (u = e.call(this) || this).key = t, u.data = n, u.fieldMask = r, u.precondition = i, 
        u.fieldTransforms = o, u.type = 1 /* MutationType.Patch */ , u;
    }
    return t(n, e), n.prototype.getFieldMask = function() {
        return this.fieldMask;
    }, n;
}(Gr);

function Jr(t) {
    var e = new Map;
    return t.fieldMask.fields.forEach((function(n) {
        if (!n.isEmpty()) {
            var r = t.data.field(n);
            e.set(n, r);
        }
    })), e
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
 */;
}

function Zr(t, e, n) {
    var r = new Map;
    z(t.length === n.length);
    for (var i = 0; i < n.length; i++) {
        var o = t[i], u = o.transform, a = e.data.field(o.field);
        r.set(o.field, Nr(u, a, n[i]));
    }
    return r;
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
 */ function $r(t, e, n) {
    for (var r = new Map, i = 0, o = t; i < o.length; i++) {
        var u = o[i], a = u.transform, s = n.data.field(u.field);
        r.set(u.field, xr(a, s, e));
    }
    return r;
}

/** A mutation that deletes the document at the given key. */ var ti, ei, ni = /** @class */ function(e) {
    function n(t, n) {
        var r = this;
        return (r = e.call(this) || this).key = t, r.precondition = n, r.type = 2 /* MutationType.Delete */ , 
        r.fieldTransforms = [], r;
    }
    return t(n, e), n.prototype.getFieldMask = function() {
        return null;
    }, n;
}(Gr), ri = /** @class */ function(e) {
    function n(t, n) {
        var r = this;
        return (r = e.call(this) || this).key = t, r.precondition = n, r.type = 3 /* MutationType.Verify */ , 
        r.fieldTransforms = [], r;
    }
    return t(n, e), n.prototype.getFieldMask = function() {
        return null;
    }, n;
}(Gr), ii = /** @class */ function() {
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
    function t(t, e, n, r) {
        this.batchId = t, this.localWriteTime = e, this.baseMutations = n, this.mutations = r
        /**
     * Applies all the mutations in this MutationBatch to the specified document
     * to compute the state of the remote document
     *
     * @param document - The document to apply mutations to.
     * @param batchResult - The result of applying the MutationBatch to the
     * backend.
     */;
    }
    return t.prototype.applyToRemoteDocument = function(t, e) {
        for (var n = e.mutationResults, r = 0; r < this.mutations.length; r++) {
            var i = this.mutations[r];
            i.key.isEqual(t.key) && Kr(i, t, n[r]);
        }
    }, 
    /**
     * Computes the local view of a document given all the mutations in this
     * batch.
     *
     * @param document - The document to apply mutations to.
     * @param mutatedFields - Fields that have been updated before applying this mutation batch.
     * @returns A `FieldMask` representing all the fields that are mutated.
     */
    t.prototype.applyToLocalView = function(t, e) {
        // First, apply the base state. This allows us to apply non-idempotent
        // transform against a consistent set of values.
        for (var n = 0, r = this.baseMutations; n < r.length; n++) {
            var i = r[n];
            i.key.isEqual(t.key) && (e = Qr(i, t, e, this.localWriteTime));
        }
        // Second, apply all user-provided mutations.
                for (var o = 0, u = this.mutations; o < u.length; o++) {
            var a = u[o];
            a.key.isEqual(t.key) && (e = Qr(a, t, e, this.localWriteTime));
        }
        return e;
    }, 
    /**
     * Computes the local view for all provided documents given the mutations in
     * this batch. Returns a `DocumentKey` to `Mutation` map which can be used to
     * replace all the mutation applications.
     */
    t.prototype.applyToLocalDocumentSet = function(t, e) {
        var n = this, r = yr();
        // TODO(mrschmidt): This implementation is O(n^2). If we apply the mutations
        // directly (as done in `applyToLocalView()`), we can reduce the complexity
        // to O(n).
                return this.mutations.forEach((function(i) {
            var o = t.get(i.key), u = o.overlayedDocument, a = n.applyToLocalView(u, o.mutatedFields), s = jr(u, 
            // Set mutatedFields to null if the document is only from local mutations.
            // This creates a Set or Delete mutation, instead of trying to create a
            // patch mutation as the overlay.
            a = e.has(i.key) ? null : a);
            // TODO(mutabledocuments): This method should take a MutableDocumentMap
            // and we should remove this cast.
                        null !== s && r.set(i.key, s), u.isValidDocument() || u.convertToNoDocument(ct.min());
        })), r;
    }, t.prototype.keys = function() {
        return this.mutations.reduce((function(t, e) {
            return t.add(e.key);
        }), Ir());
    }, t.prototype.isEqual = function(t) {
        return this.batchId === t.batchId && ut(this.mutations, t.mutations, (function(t, e) {
            return Hr(t, e);
        })) && ut(this.baseMutations, t.baseMutations, (function(t, e) {
            return Hr(t, e);
        }));
    }, t;
}(), oi = /** @class */ function() {
    function t(t, e, n, 
    /**
     * A pre-computed mapping from each mutated document to the resulting
     * version.
     */
    r) {
        this.batch = t, this.commitVersion = e, this.mutationResults = n, this.docVersions = r
        /**
     * Creates a new MutationBatchResult for the given batch and results. There
     * must be one result for each mutation in the batch. This static factory
     * caches a document=&gt;version mapping (docVersions).
     */;
    }
    return t.from = function(e, n, r) {
        z(e.mutations.length === r.length);
        for (var i = wr, o = e.mutations, u = 0; u < o.length; u++) i = i.insert(o[u].key, r[u].version);
        return new t(e, n, r, i);
    }, t;
}(), ui = /** @class */ function() {
    function t(t, e) {
        this.largestBatchId = t, this.mutation = e;
    }
    return t.prototype.getKey = function() {
        return this.mutation.key;
    }, t.prototype.isEqual = function(t) {
        return null !== t && this.mutation === t.mutation;
    }, t.prototype.toString = function() {
        return "Overlay{\n      largestBatchId: ".concat(this.largestBatchId, ",\n      mutation: ").concat(this.mutation.toString(), "\n    }");
    }, t;
}(), ai = function(t, e, n) {
    this.alias = t, this.yt = e, this.fieldPath = n;
}, si = function(t, e) {
    this.count = t, this.unchangedNames = e;
};

/**
 * Determines whether an error code represents a permanent error when received
 * in response to a non-write operation.
 *
 * See isPermanentWriteError for classifying write errors.
 */
function ci(t) {
    switch (t) {
      default:
        return U();

      case K.CANCELLED:
      case K.UNKNOWN:
      case K.DEADLINE_EXCEEDED:
      case K.RESOURCE_EXHAUSTED:
      case K.INTERNAL:
      case K.UNAVAILABLE:
 // Unauthenticated means something went wrong with our token and we need
        // to retry with new credentials which will happen automatically.
              case K.UNAUTHENTICATED:
        return !1;

      case K.INVALID_ARGUMENT:
      case K.NOT_FOUND:
      case K.ALREADY_EXISTS:
      case K.PERMISSION_DENIED:
      case K.FAILED_PRECONDITION:
 // Aborted might be retried in some scenarios, but that is dependant on
        // the context and should handled individually by the calling code.
        // See https://cloud.google.com/apis/design/errors.
              case K.ABORTED:
      case K.OUT_OF_RANGE:
      case K.UNIMPLEMENTED:
      case K.DATA_LOSS:
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
 */ function li(t) {
    if (void 0 === t) 
    // This shouldn't normally happen, but in certain error cases (like trying
    // to send invalid proto messages) we may get an error with no GRPC code.
    return L("GRPC error has no .code"), K.UNKNOWN;
    switch (t) {
      case ti.OK:
        return K.OK;

      case ti.CANCELLED:
        return K.CANCELLED;

      case ti.UNKNOWN:
        return K.UNKNOWN;

      case ti.DEADLINE_EXCEEDED:
        return K.DEADLINE_EXCEEDED;

      case ti.RESOURCE_EXHAUSTED:
        return K.RESOURCE_EXHAUSTED;

      case ti.INTERNAL:
        return K.INTERNAL;

      case ti.UNAVAILABLE:
        return K.UNAVAILABLE;

      case ti.UNAUTHENTICATED:
        return K.UNAUTHENTICATED;

      case ti.INVALID_ARGUMENT:
        return K.INVALID_ARGUMENT;

      case ti.NOT_FOUND:
        return K.NOT_FOUND;

      case ti.ALREADY_EXISTS:
        return K.ALREADY_EXISTS;

      case ti.PERMISSION_DENIED:
        return K.PERMISSION_DENIED;

      case ti.FAILED_PRECONDITION:
        return K.FAILED_PRECONDITION;

      case ti.ABORTED:
        return K.ABORTED;

      case ti.OUT_OF_RANGE:
        return K.OUT_OF_RANGE;

      case ti.UNIMPLEMENTED:
        return K.UNIMPLEMENTED;

      case ti.DATA_LOSS:
        return K.DATA_LOSS;

      default:
        return U();
    }
}

/**
 * Converts an HTTP response's error status to the equivalent error code.
 *
 * @param status - An HTTP error response status ("FAILED_PRECONDITION",
 * "UNKNOWN", etc.)
 * @returns The equivalent Code. Non-matching responses are mapped to
 *     Code.UNKNOWN.
 */ (ei = ti || (ti = {}))[ei.OK = 0] = "OK", ei[ei.CANCELLED = 1] = "CANCELLED", 
ei[ei.UNKNOWN = 2] = "UNKNOWN", ei[ei.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", 
ei[ei.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", ei[ei.NOT_FOUND = 5] = "NOT_FOUND", 
ei[ei.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", ei[ei.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", 
ei[ei.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", ei[ei.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", 
ei[ei.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", ei[ei.ABORTED = 10] = "ABORTED", 
ei[ei.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", ei[ei.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", 
ei[ei.INTERNAL = 13] = "INTERNAL", ei[ei.UNAVAILABLE = 14] = "UNAVAILABLE", ei[ei.DATA_LOSS = 15] = "DATA_LOSS";

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
var hi = /** @class */ function() {
    function t() {
        this.onExistenceFilterMismatchCallbacks = new Map;
    }
    return Object.defineProperty(t, "instance", {
        /**
         * Returns the singleton instance of this class, or null if it has not been
         * initialized.
         */
        get: function() {
            return fi;
        },
        enumerable: !1,
        configurable: !0
    }), 
    /**
     * Returns the singleton instance of this class, creating it if is has never
     * been created before.
     */
    t.getOrCreateInstance = function() {
        return null === fi && (fi = new t), fi;
    }, 
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
     */
    t.prototype.onExistenceFilterMismatch = function(t) {
        var e = this, n = Symbol();
        return this.onExistenceFilterMismatchCallbacks.set(n, t), function() {
            return e.onExistenceFilterMismatchCallbacks.delete(n);
        };
    }, 
    /**
     * Invokes all currently-registered `onExistenceFilterMismatch` callbacks.
     * @param info Information about the existence filter mismatch.
     */
    t.prototype.notifyOnExistenceFilterMismatch = function(t) {
        this.onExistenceFilterMismatchCallbacks.forEach((function(e) {
            return e(t);
        }));
    }, t;
}(), fi = null;

/** The global singleton instance of `TestingHooks`. */
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
 */
function di() {
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
 */ var pi = new b([ 4294967295, 4294967295 ], 0);

// Hash a string using md5 hashing algorithm.
function vi(t) {
    var e = di().encode(t), n = new A;
    return n.update(e), new Uint8Array(n.digest());
}

// Interpret the 16 bytes array as two 64-bit unsigned integers, encoded using
// 2’s complement using little endian.
function mi(t) {
    var e = new DataView(t.buffer), n = e.getUint32(0, /* littleEndian= */ !0), r = e.getUint32(4, /* littleEndian= */ !0), i = e.getUint32(8, /* littleEndian= */ !0), o = e.getUint32(12, /* littleEndian= */ !0);
    return [ new b([ n, r ], 0), new b([ i, o ], 0) ];
}

var yi = /** @class */ function() {
    function t(t, e, n) {
        if (this.bitmap = t, this.padding = e, this.hashCount = n, e < 0 || e >= 8) throw new gi("Invalid padding: ".concat(e));
        if (n < 0) throw new gi("Invalid hash count: ".concat(n));
        if (t.length > 0 && 0 === this.hashCount) 
        // Only empty bloom filter can have 0 hash count.
        throw new gi("Invalid hash count: ".concat(n));
        if (0 === t.length && 0 !== e) 
        // Empty bloom filter should have 0 padding.
        throw new gi("Invalid padding when bitmap length is 0: ".concat(e));
        this.It = 8 * t.length - e, 
        // Set the bit count in Integer to avoid repetition in mightContain().
        this.Tt = b.fromNumber(this.It);
    }
    // Calculate the ith hash value based on the hashed 64bit integers,
    // and calculate its corresponding bit index in the bitmap to be checked.
        return t.prototype.Et = function(t, e, n) {
        // Calculate hashed value h(i) = h1 + (i * h2).
        var r = t.add(e.multiply(b.fromNumber(n)));
        // Wrap if hash value overflow 64bit.
                return 1 === r.compare(pi) && (r = new b([ r.getBits(0), r.getBits(1) ], 0)), 
        r.modulo(this.Tt).toNumber();
    }, 
    // Return whether the bit on the given index in the bitmap is set to 1.
    t.prototype.At = function(t) {
        return 0 != (this.bitmap[Math.floor(t / 8)] & 1 << t % 8);
    }, t.prototype.vt = function(t) {
        // Empty bitmap should always return false on membership check.
        if (0 === this.It) return !1;
        for (var e = mi(vi(t)), n = e[0], r = e[1], i = 0; i < this.hashCount; i++) {
            var o = this.Et(n, r, i);
            if (!this.At(o)) return !1;
        }
        return !0;
    }, 
    /** Create bloom filter for testing purposes only. */ t.create = function(e, n, r) {
        var i = e % 8 == 0 ? 0 : 8 - e % 8, o = new t(new Uint8Array(Math.ceil(e / 8)), i, n);
        return r.forEach((function(t) {
            return o.insert(t);
        })), o;
    }, t.prototype.insert = function(t) {
        if (0 !== this.It) for (var e = mi(vi(t)), n = e[0], r = e[1], i = 0; i < this.hashCount; i++) {
            var o = this.Et(n, r, i);
            this.Rt(o);
        }
    }, t.prototype.Rt = function(t) {
        var e = Math.floor(t / 8), n = t % 8;
        this.bitmap[e] |= 1 << n;
    }, t;
}(), gi = /** @class */ function(e) {
    function n() {
        var t = this;
        return (t = e.apply(this, arguments) || this).name = "BloomFilterError", t;
    }
    return t(n, e), n;
}(Error), wi = /** @class */ function() {
    function t(
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
    r, 
    /**
     * A set of which document updates are due only to limbo resolution targets.
     */
    i) {
        this.snapshotVersion = t, this.targetChanges = e, this.targetMismatches = n, this.documentUpdates = r, 
        this.resolvedLimboDocuments = i;
    }
    /**
     * HACK: Views require RemoteEvents in order to determine whether the view is
     * CURRENT, but secondary tabs don't receive remote events. So this method is
     * used to create a synthesized RemoteEvent that can be used to apply a
     * CURRENT status change to a View, for queries executed in a different tab.
     */
    // PORTING NOTE: Multi-tab only
        return t.createSynthesizedRemoteEventForCurrentChange = function(e, n, r) {
        var i = new Map;
        return i.set(e, bi.createSynthesizedTargetChangeForCurrentChange(e, n, r)), new t(ct.min(), i, new Te(ot), fr(), Ir());
    }, t;
}(), bi = /** @class */ function() {
    function t(
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
    r, 
    /**
     * The set of documents that were removed from this target as part of this
     * remote event.
     */
    i) {
        this.resumeToken = t, this.current = e, this.addedDocuments = n, this.modifiedDocuments = r, 
        this.removedDocuments = i
        /**
     * This method is used to create a synthesized TargetChanges that can be used to
     * apply a CURRENT status change to a View (for queries executed in a different
     * tab) or for new queries (to raise snapshots with correct CURRENT status).
     */;
    }
    return t.createSynthesizedTargetChangeForCurrentChange = function(e, n, r) {
        return new t(r, n, Ir(), Ir(), Ir());
    }, t;
}(), Ii = function(
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
r) {
    this.Pt = t, this.removedTargetIds = e, this.key = n, this.bt = r;
}, Ei = function(t, e) {
    this.targetId = t, this.Vt = e;
}, Ti = function(
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
n
/** An RPC error indicating why the watch failed. */ , r) {
    void 0 === n && (n = Oe.EMPTY_BYTE_STRING), void 0 === r && (r = null), this.state = t, 
    this.targetIds = e, this.resumeToken = n, this.cause = r;
}, Si = /** @class */ function() {
    function t() {
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
        this.Dt = Ci(), 
        /** See public getters for explanations of these fields. */
        this.Ct = Oe.EMPTY_BYTE_STRING, this.xt = !1, 
        /**
             * Whether this target state should be included in the next snapshot. We
             * initialize to true so that newly-added targets are included in the next
             * RemoteEvent.
             */
        this.Nt = !0;
    }
    return Object.defineProperty(t.prototype, "current", {
        /**
         * Whether this target has been marked 'current'.
         *
         * 'Current' has special meaning in the RPC protocol: It implies that the
         * Watch backend has sent us all changes up to the point at which the target
         * was added and that the target is consistent with the rest of the watch
         * stream.
         */
        get: function() {
            return this.xt;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "resumeToken", {
        /** The last resume token sent to us for this target. */ get: function() {
            return this.Ct;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "kt", {
        /** Whether this target has pending target adds or target removes. */ get: function() {
            return 0 !== this.St;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "Mt", {
        /** Whether we have modified any state that should trigger a snapshot. */ get: function() {
            return this.Nt;
        },
        enumerable: !1,
        configurable: !0
    }), 
    /**
     * Applies the resume token to the TargetChange, but only when it has a new
     * value. Empty resumeTokens are discarded.
     */
    t.prototype.$t = function(t) {
        t.approximateByteSize() > 0 && (this.Nt = !0, this.Ct = t);
    }, 
    /**
     * Creates a target change from the current set of changes.
     *
     * To reset the document changes after raising this snapshot, call
     * `clearPendingChanges()`.
     */
    t.prototype.Ot = function() {
        var t = Ir(), e = Ir(), n = Ir();
        return this.Dt.forEach((function(r, i) {
            switch (i) {
              case 0 /* ChangeType.Added */ :
                t = t.add(r);
                break;

              case 2 /* ChangeType.Modified */ :
                e = e.add(r);
                break;

              case 1 /* ChangeType.Removed */ :
                n = n.add(r);
                break;

              default:
                U();
            }
        })), new bi(this.Ct, this.xt, t, e, n);
    }, 
    /**
     * Resets the document changes and sets `hasPendingChanges` to false.
     */
    t.prototype.Ft = function() {
        this.Nt = !1, this.Dt = Ci();
    }, t.prototype.Bt = function(t, e) {
        this.Nt = !0, this.Dt = this.Dt.insert(t, e);
    }, t.prototype.Lt = function(t) {
        this.Nt = !0, this.Dt = this.Dt.remove(t);
    }, t.prototype.qt = function() {
        this.St += 1;
    }, t.prototype.Ut = function() {
        this.St -= 1;
    }, t.prototype.Kt = function() {
        this.Nt = !0, this.xt = !0;
    }, t;
}(), _i = /** @class */ function() {
    function t(t) {
        this.Gt = t, 
        /** The internal state of all tracked targets. */
        this.Qt = new Map, 
        /** Keeps track of the documents to update since the last raised snapshot. */
        this.jt = fr(), 
        /** A mapping of document keys to their set of target IDs. */
        this.zt = Di(), 
        /**
             * A map of targets with existence filter mismatches. These targets are
             * known to be inconsistent and their listens needs to be re-established by
             * RemoteStore.
             */
        this.Wt = new Te(ot)
        /**
     * Processes and adds the DocumentWatchChange to the current set of changes.
     */;
    }
    return t.prototype.Ht = function(t) {
        for (var e = 0, n = t.Pt; e < n.length; e++) {
            var r = n[e];
            t.bt && t.bt.isFoundDocument() ? this.Jt(r, t.bt) : this.Yt(r, t.key, t.bt);
        }
        for (var i = 0, o = t.removedTargetIds; i < o.length; i++) {
            var u = o[i];
            this.Yt(u, t.key, t.bt);
        }
    }, 
    /** Processes and adds the WatchTargetChange to the current set of changes. */ t.prototype.Xt = function(t) {
        var e = this;
        this.forEachTarget(t, (function(n) {
            var r = e.Zt(n);
            switch (t.state) {
              case 0 /* WatchTargetChangeState.NoChange */ :
                e.te(n) && r.$t(t.resumeToken);
                break;

              case 1 /* WatchTargetChangeState.Added */ :
                // We need to decrement the number of pending acks needed from watch
                // for this targetId.
                r.Ut(), r.kt || 
                // We have a freshly added target, so we need to reset any state
                // that we had previously. This can happen e.g. when remove and add
                // back a target for existence filter mismatches.
                r.Ft(), r.$t(t.resumeToken);
                break;

              case 2 /* WatchTargetChangeState.Removed */ :
                // We need to keep track of removed targets to we can post-filter and
                // remove any target changes.
                // We need to decrement the number of pending acks needed from watch
                // for this targetId.
                r.Ut(), r.kt || e.removeTarget(n);
                break;

              case 3 /* WatchTargetChangeState.Current */ :
                e.te(n) && (r.Kt(), r.$t(t.resumeToken));
                break;

              case 4 /* WatchTargetChangeState.Reset */ :
                e.te(n) && (
                // Reset the target and synthesizes removes for all existing
                // documents. The backend will re-add any documents that still
                // match the target before it sends the next global snapshot.
                e.ee(n), r.$t(t.resumeToken));
                break;

              default:
                U();
            }
        }));
    }, 
    /**
     * Iterates over all targetIds that the watch change applies to: either the
     * targetIds explicitly listed in the change or the targetIds of all currently
     * active targets.
     */
    t.prototype.forEachTarget = function(t, e) {
        var n = this;
        t.targetIds.length > 0 ? t.targetIds.forEach(e) : this.Qt.forEach((function(t, r) {
            n.te(r) && e(r);
        }));
    }, 
    /**
     * Handles existence filters and synthesizes deletes for filter mismatches.
     * Targets that are invalidated by filter mismatches are added to
     * `pendingTargetResets`.
     */
    t.prototype.ne = function(t) {
        var e, n = t.targetId, r = t.Vt.count, i = this.se(n);
        if (i) {
            var o = i.target;
            if (zn(o)) if (0 === r) {
                // The existence filter told us the document does not exist. We deduce
                // that this document does not exist and apply a deleted document to
                // our updates. Without applying this deleted document there might be
                // another query that will raise this document as part of a snapshot
                // until it is resolved, essentially exposing inconsistency between
                // queries.
                var u = new pt(o.path);
                this.Yt(n, u, dn.newNoDocument(u, ct.min()));
            } else z(1 === r); else {
                var a = this.ie(n);
                // Existence filter mismatch. Mark the documents as being in limbo, and
                // raise a snapshot with `isFromCache:true`.
                                if (a !== r) {
                    // Apply bloom filter to identify and mark removed documents.
                    var s = this.re(t, a);
                    if (0 /* BloomFilterApplicationStatus.Success */ !== s) {
                        // If bloom filter application fails, we reset the mapping and
                        // trigger re-run of the query.
                        this.ee(n);
                        var c = 2 /* BloomFilterApplicationStatus.FalsePositive */ === s ? "TargetPurposeExistenceFilterMismatchBloom" /* TargetPurpose.ExistenceFilterMismatchBloom */ : "TargetPurposeExistenceFilterMismatch" /* TargetPurpose.ExistenceFilterMismatch */;
                        this.Wt = this.Wt.insert(n, c);
                    }
                    null === (e = hi.instance) || void 0 === e || e.notifyOnExistenceFilterMismatch(function(t, e, n) {
                        var r, i, o, u, a, s, c = {
                            localCacheCount: e,
                            existenceFilterCount: n.count
                        }, l = n.unchangedNames;
                        return l && (c.bloomFilter = {
                            applied: 0 /* BloomFilterApplicationStatus.Success */ === t,
                            hashCount: null !== (r = null == l ? void 0 : l.hashCount) && void 0 !== r ? r : 0,
                            bitmapLength: null !== (u = null === (o = null === (i = null == l ? void 0 : l.bits) || void 0 === i ? void 0 : i.bitmap) || void 0 === o ? void 0 : o.length) && void 0 !== u ? u : 0,
                            padding: null !== (s = null === (a = null == l ? void 0 : l.bits) || void 0 === a ? void 0 : a.padding) && void 0 !== s ? s : 0
                        }), c;
                    }(s, a, t.Vt));
                }
            }
        }
    }, 
    /**
     * Apply bloom filter to remove the deleted documents, and return the
     * application status.
     */
    t.prototype.re = function(t, e) {
        var n = t.Vt, r = n.unchangedNames, i = n.count;
        if (!r || !r.bits) return 1 /* BloomFilterApplicationStatus.Skipped */;
        var o, u, a = r.bits, s = a.bitmap, c = void 0 === s ? "" : s, l = a.padding, h = void 0 === l ? 0 : l, f = r.hashCount, d = void 0 === f ? 0 : f;
        try {
            o = Ve(c).toUint8Array();
        } catch (t) {
            if (t instanceof Ae) return q("Decoding the base64 bloom filter in existence filter failed (" + t.message + "); ignoring the bloom filter and falling back to full re-query."), 
            1 /* BloomFilterApplicationStatus.Skipped */;
            throw t;
        }
        try {
            // BloomFilter throws error if the inputs are invalid.
            u = new yi(o, h, d);
        } catch (t) {
            return q(t instanceof gi ? "BloomFilter error: " : "Applying bloom filter failed: ", t), 
            1 /* BloomFilterApplicationStatus.Skipped */;
        }
        return 0 === u.It ? 1 /* BloomFilterApplicationStatus.Skipped */ : i !== e - this.oe(t.targetId, u) ? 2 /* BloomFilterApplicationStatus.FalsePositive */ : 0 /* BloomFilterApplicationStatus.Success */;
    }, 
    /**
     * Filter out removed documents based on bloom filter membership result and
     * return number of documents removed.
     */
    t.prototype.oe = function(t, e) {
        var n = this, r = this.Gt.getRemoteKeysForTarget(t), i = 0;
        return r.forEach((function(r) {
            var o = n.Gt.ue(), u = "projects/".concat(o.projectId, "/databases/").concat(o.database, "/documents/").concat(r.path.canonicalString());
            e.vt(u) || (n.Yt(t, r, /*updatedDocument=*/ null), i++);
        })), i;
    }, 
    /**
     * Converts the currently accumulated state into a remote event at the
     * provided snapshot version. Resets the accumulated changes before returning.
     */
    t.prototype.ce = function(t) {
        var e = this, n = new Map;
        this.Qt.forEach((function(r, i) {
            var o = e.se(i);
            if (o) {
                if (r.current && zn(o.target)) {
                    // Document queries for document that don't exist can produce an empty
                    // result set. To update our local cache, we synthesize a document
                    // delete if we have not previously received the document. This
                    // resolves the limbo state of the document, removing it from
                    // limboDocumentRefs.
                    // TODO(dimond): Ideally we would have an explicit lookup target
                    // instead resulting in an explicit delete message and we could
                    // remove this special logic.
                    var u = new pt(o.target.path);
                    null !== e.jt.get(u) || e.ae(i, u) || e.Yt(i, u, dn.newNoDocument(u, t));
                }
                r.Mt && (n.set(i, r.Ot()), r.Ft());
            }
        }));
        var r = Ir();
        // We extract the set of limbo-only document updates as the GC logic
        // special-cases documents that do not appear in the target cache.
        // TODO(gsoltis): Expand on this comment once GC is available in the JS
        // client.
                this.zt.forEach((function(t, n) {
            var i = !0;
            n.forEachWhile((function(t) {
                var n = e.se(t);
                return !n || "TargetPurposeLimboResolution" /* TargetPurpose.LimboResolution */ === n.purpose || (i = !1, 
                !1);
            })), i && (r = r.add(t));
        })), this.jt.forEach((function(e, n) {
            return n.setReadTime(t);
        }));
        var i = new wi(t, n, this.Wt, this.jt, r);
        return this.jt = fr(), this.zt = Di(), this.Wt = new Te(ot), i;
    }, 
    /**
     * Adds the provided document to the internal list of document updates and
     * its document key to the given target's mapping.
     */
    // Visible for testing.
    t.prototype.Jt = function(t, e) {
        if (this.te(t)) {
            var n = this.ae(t, e.key) ? 2 /* ChangeType.Modified */ : 0 /* ChangeType.Added */;
            this.Zt(t).Bt(e.key, n), this.jt = this.jt.insert(e.key, e), this.zt = this.zt.insert(e.key, this.he(e.key).add(t));
        }
    }, 
    /**
     * Removes the provided document from the target mapping. If the
     * document no longer matches the target, but the document's state is still
     * known (e.g. we know that the document was deleted or we received the change
     * that caused the filter mismatch), the new document can be provided
     * to update the remote document cache.
     */
    // Visible for testing.
    t.prototype.Yt = function(t, e, n) {
        if (this.te(t)) {
            var r = this.Zt(t);
            this.ae(t, e) ? r.Bt(e, 1 /* ChangeType.Removed */) : 
            // The document may have entered and left the target before we raised a
            // snapshot, so we can just ignore the change.
            r.Lt(e), this.zt = this.zt.insert(e, this.he(e).delete(t)), n && (this.jt = this.jt.insert(e, n));
        }
    }, t.prototype.removeTarget = function(t) {
        this.Qt.delete(t);
    }, 
    /**
     * Returns the current count of documents in the target. This includes both
     * the number of documents that the LocalStore considers to be part of the
     * target as well as any accumulated changes.
     */
    t.prototype.ie = function(t) {
        var e = this.Zt(t).Ot();
        return this.Gt.getRemoteKeysForTarget(t).size + e.addedDocuments.size - e.removedDocuments.size;
    }, 
    /**
     * Increment the number of acks needed from watch before we can consider the
     * server to be 'in-sync' with the client's active targets.
     */
    t.prototype.qt = function(t) {
        this.Zt(t).qt();
    }, t.prototype.Zt = function(t) {
        var e = this.Qt.get(t);
        return e || (e = new Si, this.Qt.set(t, e)), e;
    }, t.prototype.he = function(t) {
        var e = this.zt.get(t);
        return e || (e = new De(ot), this.zt = this.zt.insert(t, e)), e;
    }, 
    /**
     * Verifies that the user is still interested in this target (by calling
     * `getTargetDataForTarget()`) and that we are not waiting for pending ADDs
     * from watch.
     */
    t.prototype.te = function(t) {
        var e = null !== this.se(t);
        return e || M("WatchChangeAggregator", "Detected inactive target", t), e;
    }, 
    /**
     * Returns the TargetData for an active target (i.e. a target that the user
     * is still interested in that has no outstanding target change requests).
     */
    t.prototype.se = function(t) {
        var e = this.Qt.get(t);
        return e && e.kt ? null : this.Gt.le(t);
    }, 
    /**
     * Resets the state of a Watch target to its initial state (e.g. sets
     * 'current' to false, clears the resume token and removes its target mapping
     * from all documents).
     */
    t.prototype.ee = function(t) {
        var e = this;
        this.Qt.set(t, new Si), this.Gt.getRemoteKeysForTarget(t).forEach((function(n) {
            e.Yt(t, n, /*updatedDocument=*/ null);
        }));
    }, 
    /**
     * Returns whether the LocalStore considers the document to be part of the
     * specified target.
     */
    t.prototype.ae = function(t, e) {
        return this.Gt.getRemoteKeysForTarget(t).has(e);
    }, t;
}();

function Di() {
    return new Te(pt.comparator);
}

function Ci() {
    return new Te(pt.comparator);
}

var xi = {
    asc: "ASCENDING",
    desc: "DESCENDING"
}, Ni = {
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
}, Ai = {
    and: "AND",
    or: "OR"
}, ki = function(t, e) {
    this.databaseId = t, this.useProto3Json = e;
};

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
/**
 * Returns a value for a number (or null) that's appropriate to put into
 * a google.protobuf.Int32Value proto.
 * DO NOT USE THIS FOR ANYTHING ELSE.
 * This method cheats. It's typed as returning "number" because that's what
 * our generated proto interfaces say Int32Value must be. But GRPC actually
 * expects a { value: <number> } struct.
 */
function Oi(t, e) {
    return t.useProto3Json || zt(e) ? e : {
        value: e
    };
}

/**
 * Returns a number (or null) from a google.protobuf.Int32Value proto.
 */
/**
 * Returns a value for a Date that's appropriate to put into a proto.
 */ function Fi(t, e) {
    return t.useProto3Json ? "".concat(new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", ""), ".").concat(("000000000" + e.nanoseconds).slice(-9), "Z") : {
        seconds: "" + e.seconds,
        nanos: e.nanoseconds
    };
}

/**
 * Returns a value for bytes that's appropriate to put in a proto.
 *
 * Visible for testing.
 */ function Pi(t, e) {
    return t.useProto3Json ? e.toBase64() : e.toUint8Array();
}

/**
 * Returns a ByteString based on the proto string value.
 */ function Ri(t, e) {
    return Fi(t, e.toTimestamp());
}

function Vi(t) {
    return z(!!t), ct.fromTimestamp(function(t) {
        var e = Pe(t);
        return new st(e.seconds, e.nanos);
    }(t));
}

function Mi(t, e) {
    return function(t) {
        return new ht([ "projects", t.projectId, "databases", t.database ]);
    }(t).child("documents").child(e).canonicalString();
}

function Li(t) {
    var e = ht.fromString(t);
    return z(uo(e)), e;
}

function qi(t, e) {
    return Mi(t.databaseId, e.path);
}

function Bi(t, e) {
    var n = Li(e);
    if (n.get(1) !== t.databaseId.projectId) throw new Q(K.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + n.get(1) + " vs " + t.databaseId.projectId);
    if (n.get(3) !== t.databaseId.database) throw new Q(K.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + n.get(3) + " vs " + t.databaseId.database);
    return new pt(ji(n));
}

function Ui(t, e) {
    return Mi(t.databaseId, e);
}

function zi(t) {
    var e = Li(t);
    // In v1beta1 queries for collections at the root did not have a trailing
    // "/documents". In v1 all resource paths contain "/documents". Preserve the
    // ability to read the v1beta1 form for compatibility with queries persisted
    // in the local target cache.
        return 4 === e.length ? ht.emptyPath() : ji(e);
}

function Gi(t) {
    return new ht([ "projects", t.databaseId.projectId, "databases", t.databaseId.database ]).canonicalString();
}

function ji(t) {
    return z(t.length > 4 && "documents" === t.get(4)), t.popFirst(5)
    /** Creates a Document proto from key and fields (but no create/update time) */;
}

function Ki(t, e, n) {
    return {
        name: qi(t, e),
        fields: n.value.mapValue.fields
    };
}

function Qi(t, e, n) {
    var r = Bi(t, e.name), i = Vi(e.updateTime), o = e.createTime ? Vi(e.createTime) : ct.min(), u = new hn({
        mapValue: {
            fields: e.fields
        }
    }), a = dn.newFoundDocument(r, i, o, u);
    return n && a.setHasCommittedMutations(), n ? a.setHasCommittedMutations() : a;
}

function Wi(t, e) {
    var n;
    if (e instanceof Yr) n = {
        update: Ki(t, e.key, e.value)
    }; else if (e instanceof ni) n = {
        delete: qi(t, e.key)
    }; else if (e instanceof Xr) n = {
        update: Ki(t, e.key, e.data),
        updateMask: oo(e.fieldMask)
    }; else {
        if (!(e instanceof ri)) return U();
        n = {
            verify: qi(t, e.key)
        };
    }
    return e.fieldTransforms.length > 0 && (n.updateTransforms = e.fieldTransforms.map((function(t) {
        return function(t, e) {
            var n = e.transform;
            if (n instanceof kr) return {
                fieldPath: e.field.canonicalString(),
                setToServerValue: "REQUEST_TIME"
            };
            if (n instanceof Or) return {
                fieldPath: e.field.canonicalString(),
                appendMissingElements: {
                    values: n.elements
                }
            };
            if (n instanceof Pr) return {
                fieldPath: e.field.canonicalString(),
                removeAllFromArray: {
                    values: n.elements
                }
            };
            if (n instanceof Vr) return {
                fieldPath: e.field.canonicalString(),
                increment: n.gt
            };
            throw U();
        }(0, t);
    }))), e.precondition.isNone || (n.currentDocument = function(t, e) {
        return void 0 !== e.updateTime ? {
            updateTime: Ri(t, e.updateTime)
        } : void 0 !== e.exists ? {
            exists: e.exists
        } : U();
    }(t, e.precondition)), n;
}

function Hi(t, e) {
    var n = e.currentDocument ? function(t) {
        return void 0 !== t.updateTime ? Ur.updateTime(Vi(t.updateTime)) : void 0 !== t.exists ? Ur.exists(t.exists) : Ur.none();
    }(e.currentDocument) : Ur.none(), r = e.updateTransforms ? e.updateTransforms.map((function(e) {
        return function(t, e) {
            var n = null;
            if ("setToServerValue" in e) z("REQUEST_TIME" === e.setToServerValue), n = new kr; else if ("appendMissingElements" in e) {
                var r = e.appendMissingElements.values || [];
                n = new Or(r);
            } else if ("removeAllFromArray" in e) {
                var i = e.removeAllFromArray.values || [];
                n = new Pr(i);
            } else "increment" in e ? n = new Vr(t, e.increment) : U();
            var o = dt.fromServerFormat(e.fieldPath);
            return new qr(o, n);
        }(t, e);
    })) : [];
    if (e.update) {
        e.update.name;
        var i = Bi(t, e.update.name), o = new hn({
            mapValue: {
                fields: e.update.fields
            }
        });
        if (e.updateMask) {
            var u = function(t) {
                var e = t.fieldPaths || [];
                return new Ne(e.map((function(t) {
                    return dt.fromServerFormat(t);
                })));
            }(e.updateMask);
            return new Xr(i, o, u, n, r);
        }
        return new Yr(i, o, n, r);
    }
    if (e.delete) {
        var a = Bi(t, e.delete);
        return new ni(a, n);
    }
    if (e.verify) {
        var s = Bi(t, e.verify);
        return new ri(s, n);
    }
    return U();
}

function Yi(t, e) {
    return {
        documents: [ Ui(t, e.path) ]
    };
}

function Xi(t, e) {
    // Dissect the path into parent, collectionId, and optional key filter.
    var n = {
        structuredQuery: {}
    }, r = e.path;
    null !== e.collectionGroup ? (n.parent = Ui(t, r), n.structuredQuery.from = [ {
        collectionId: e.collectionGroup,
        allDescendants: !0
    } ]) : (n.parent = Ui(t, r.popLast()), n.structuredQuery.from = [ {
        collectionId: r.lastSegment()
    } ]);
    var i = function(t) {
        if (0 !== t.length) return io(In.create(t, "and" /* CompositeOperator.AND */));
    }(e.filters);
    i && (n.structuredQuery.where = i);
    var o = function(t) {
        if (0 !== t.length) return t.map((function(t) {
            // visible for testing
            return function(t) {
                return {
                    field: no(t.field),
                    direction: $i(t.dir)
                };
            }(t);
        }));
    }(e.orderBy);
    o && (n.structuredQuery.orderBy = o);
    var u, a = Oi(t, e.limit);
    return null !== a && (n.structuredQuery.limit = a), e.startAt && (n.structuredQuery.startAt = {
        before: (u = e.startAt).inclusive,
        values: u.position
    }), e.endAt && (n.structuredQuery.endAt = function(t) {
        return {
            before: !t.inclusive,
            values: t.position
        };
    }(e.endAt)), n;
}

function Ji(t) {
    var e = zi(t.parent), n = t.structuredQuery, r = n.from ? n.from.length : 0, i = null;
    if (r > 0) {
        z(1 === r);
        var o = n.from[0];
        o.allDescendants ? i = o.collectionId : e = e.child(o.collectionId);
    }
    var u = [];
    n.where && (u = function(t) {
        var e = Zi(t);
        return e instanceof In && Sn(e) ? e.getFilters() : [ e ];
    }(n.where));
    var a = [];
    n.orderBy && (a = n.orderBy.map((function(t) {
        return function(t) {
            return new yn(ro(t.field), 
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
            }(t.direction));
        }(t);
    })));
    var s = null;
    n.limit && (s = function(t) {
        var e;
        return zt(e = "object" == typeof t ? t.value : t) ? null : e;
    }(n.limit));
    var c = null;
    n.startAt && (c = function(t) {
        var e = !!t.before, n = t.values || [];
        return new pn(n, e);
    }(n.startAt));
    var l = null;
    return n.endAt && (l = function(t) {
        var e = !t.before, n = t.values || [];
        return new pn(n, e);
    }(n.endAt)), Wn(e, i, a, u, s, "F" /* LimitType.First */ , c, l);
}

function Zi(t) {
    return void 0 !== t.unaryFilter ? function(t) {
        switch (t.unaryFilter.op) {
          case "IS_NAN":
            var e = ro(t.unaryFilter.field);
            return bn.create(e, "==" /* Operator.EQUAL */ , {
                doubleValue: NaN
            });

          case "IS_NULL":
            var n = ro(t.unaryFilter.field);
            return bn.create(n, "==" /* Operator.EQUAL */ , {
                nullValue: "NULL_VALUE"
            });

          case "IS_NOT_NAN":
            var r = ro(t.unaryFilter.field);
            return bn.create(r, "!=" /* Operator.NOT_EQUAL */ , {
                doubleValue: NaN
            });

          case "IS_NOT_NULL":
            var i = ro(t.unaryFilter.field);
            return bn.create(i, "!=" /* Operator.NOT_EQUAL */ , {
                nullValue: "NULL_VALUE"
            });

          default:
            return U();
        }
    }(t) : void 0 !== t.fieldFilter ? function(t) {
        return bn.create(ro(t.fieldFilter.field), function(t) {
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
                return U();
            }
        }(t.fieldFilter.op), t.fieldFilter.value);
    }(t) : void 0 !== t.compositeFilter ? function(t) {
        return In.create(t.compositeFilter.filters.map((function(t) {
            return Zi(t);
        })), function(t) {
            switch (t) {
              case "AND":
                return "and" /* CompositeOperator.AND */;

              case "OR":
                return "or" /* CompositeOperator.OR */;

              default:
                return U();
            }
        }(t.compositeFilter.op));
    }(t) : U();
}

function $i(t) {
    return xi[t];
}

function to(t) {
    return Ni[t];
}

function eo(t) {
    return Ai[t];
}

function no(t) {
    return {
        fieldPath: t.canonicalString()
    };
}

function ro(t) {
    return dt.fromServerFormat(t.fieldPath);
}

function io(t) {
    return t instanceof bn ? function(t) {
        if ("==" /* Operator.EQUAL */ === t.op) {
            if (nn(t.value)) return {
                unaryFilter: {
                    field: no(t.field),
                    op: "IS_NAN"
                }
            };
            if (en(t.value)) return {
                unaryFilter: {
                    field: no(t.field),
                    op: "IS_NULL"
                }
            };
        } else if ("!=" /* Operator.NOT_EQUAL */ === t.op) {
            if (nn(t.value)) return {
                unaryFilter: {
                    field: no(t.field),
                    op: "IS_NOT_NAN"
                }
            };
            if (en(t.value)) return {
                unaryFilter: {
                    field: no(t.field),
                    op: "IS_NOT_NULL"
                }
            };
        }
        return {
            fieldFilter: {
                field: no(t.field),
                op: to(t.op),
                value: t.value
            }
        };
    }(t) : t instanceof In ? function(t) {
        var e = t.getFilters().map((function(t) {
            return io(t);
        }));
        return 1 === e.length ? e[0] : {
            compositeFilter: {
                op: eo(t.op),
                filters: e
            }
        };
    }(t) : U();
}

function oo(t) {
    var e = [];
    return t.fields.forEach((function(t) {
        return e.push(t.canonicalString());
    })), {
        fieldPaths: e
    };
}

function uo(t) {
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
 */ var ao = /** @class */ function() {
    function t(
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
    r, 
    /** The latest snapshot version seen for this target. */
    i
    /**
     * The maximum snapshot version at which the associated view
     * contained no limbo documents.
     */ , o
    /**
     * An opaque, server-assigned token that allows watching a target to be
     * resumed after disconnecting without retransmitting all the data that
     * matches the target. The resume token essentially identifies a point in
     * time from which the server should resume sending results.
     */ , u
    /**
     * The number of documents that last matched the query at the resume token or
     * read time. Documents are counted only when making a listen request with
     * resume token or read time, otherwise, keep it null.
     */ , a) {
        void 0 === i && (i = ct.min()), void 0 === o && (o = ct.min()), void 0 === u && (u = Oe.EMPTY_BYTE_STRING), 
        void 0 === a && (a = null), this.target = t, this.targetId = e, this.purpose = n, 
        this.sequenceNumber = r, this.snapshotVersion = i, this.lastLimboFreeSnapshotVersion = o, 
        this.resumeToken = u, this.expectedCount = a;
    }
    /** Creates a new target data instance with an updated sequence number. */    return t.prototype.withSequenceNumber = function(e) {
        return new t(this.target, this.targetId, this.purpose, e, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, this.expectedCount);
    }, 
    /**
     * Creates a new target data instance with an updated resume token and
     * snapshot version.
     */
    t.prototype.withResumeToken = function(e, n) {
        return new t(this.target, this.targetId, this.purpose, this.sequenceNumber, n, this.lastLimboFreeSnapshotVersion, e, 
        /* expectedCount= */ null);
    }, 
    /**
     * Creates a new target data instance with an updated expected count.
     */
    t.prototype.withExpectedCount = function(e) {
        return new t(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, e);
    }, 
    /**
     * Creates a new target data instance with an updated last limbo free
     * snapshot version number.
     */
    t.prototype.withLastLimboFreeSnapshotVersion = function(e) {
        return new t(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, e, this.resumeToken, this.expectedCount);
    }, t;
}(), so = function(t) {
    this.fe = t;
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
/** Serializer for values stored in the LocalStore. */
/** Encodes a document for storage locally. */ function co(t, e) {
    var n = e.key, r = {
        prefixPath: n.getCollectionPath().popLast().toArray(),
        collectionGroup: n.collectionGroup,
        documentId: n.path.lastSegment(),
        readTime: lo(e.readTime),
        hasCommittedMutations: e.hasCommittedMutations
    };
    if (e.isFoundDocument()) r.document = function(t, e) {
        return {
            name: qi(t, e.key),
            fields: e.data.value.mapValue.fields,
            updateTime: Fi(t, e.version.toTimestamp()),
            createTime: Fi(t, e.createTime.toTimestamp())
        };
    }(t.fe, e); else if (e.isNoDocument()) r.noDocument = {
        path: n.path.toArray(),
        readTime: ho(e.version)
    }; else {
        if (!e.isUnknownDocument()) return U();
        r.unknownDocument = {
            path: n.path.toArray(),
            version: ho(e.version)
        };
    }
    return r;
}

function lo(t) {
    var e = t.toTimestamp();
    return [ e.seconds, e.nanoseconds ];
}

function ho(t) {
    var e = t.toTimestamp();
    return {
        seconds: e.seconds,
        nanoseconds: e.nanoseconds
    };
}

function fo(t) {
    var e = new st(t.seconds, t.nanoseconds);
    return ct.fromTimestamp(e);
}

/** Encodes a batch of mutations into a DbMutationBatch for local storage. */
/** Decodes a DbMutationBatch into a MutationBatch */ function po(t, e) {
    // Squash old transform mutations into existing patch or set mutations.
    // The replacement of representing `transforms` with `update_transforms`
    // on the SDK means that old `transform` mutations stored in IndexedDB need
    // to be updated to `update_transforms`.
    // TODO(b/174608374): Remove this code once we perform a schema migration.
    for (var n = (e.baseMutations || []).map((function(e) {
        return Hi(t.fe, e);
    })), r = 0; r < e.mutations.length - 1; ++r) {
        var i = e.mutations[r];
        if (r + 1 < e.mutations.length && void 0 !== e.mutations[r + 1].transform) {
            var o = e.mutations[r + 1];
            i.updateTransforms = o.transform.fieldTransforms, e.mutations.splice(r + 1, 1), 
            ++r;
        }
    }
    var u = e.mutations.map((function(e) {
        return Hi(t.fe, e);
    })), a = st.fromMillis(e.localWriteTimeMs);
    return new ii(e.batchId, a, n, u);
}

/** Decodes a DbTarget into TargetData */ function vo(t) {
    var e, n, r = fo(t.readTime), i = void 0 !== t.lastLimboFreeSnapshotVersion ? fo(t.lastLimboFreeSnapshotVersion) : ct.min();
    return void 0 !== t.query.documents ? (z(1 === (n = t.query).documents.length), 
    e = tr(Hn(zi(n.documents[0])))) : e = function(t) {
        return tr(Ji(t));
    }(t.query), new ao(e, t.targetId, "TargetPurposeListen" /* TargetPurpose.Listen */ , t.lastListenSequenceNumber, r, i, Oe.fromBase64String(t.resumeToken))
    /** Encodes TargetData into a DbTarget for storage locally. */;
}

function mo(t, e) {
    var n, r = ho(e.snapshotVersion), i = ho(e.lastLimboFreeSnapshotVersion);
    n = zn(e.target) ? Yi(t.fe, e.target) : Xi(t.fe, e.target);
    // We can't store the resumeToken as a ByteString in IndexedDb, so we
    // convert it to a base64 string for storage.
    var o = e.resumeToken.toBase64();
    // lastListenSequenceNumber is always 0 until we do real GC.
        return {
        targetId: e.targetId,
        canonicalId: Bn(e.target),
        readTime: r,
        resumeToken: o,
        lastListenSequenceNumber: e.sequenceNumber,
        lastLimboFreeSnapshotVersion: i,
        query: n
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
 */ function yo(t) {
    var e = Ji({
        parent: t.parent,
        structuredQuery: t.structuredQuery
    });
    return "LAST" === t.limitType ? nr(e, e.limit, "L" /* LimitType.Last */) : e;
}

/** Encodes a NamedQuery proto object to a NamedQuery model object. */
/** Encodes a DbDocumentOverlay object to an Overlay model object. */ function go(t, e) {
    return new ui(e.largestBatchId, Hi(t.fe, e.overlayMutation));
}

/** Decodes an Overlay model object into a DbDocumentOverlay object. */
/**
 * Returns the DbDocumentOverlayKey corresponding to the given user and
 * document key.
 */ function wo(t, e) {
    var n = e.path.lastSegment();
    return [ t, Kt(e.path.popLast()), n ];
}

function bo(t, e, n, r) {
    return {
        indexId: t,
        uid: e.uid || "",
        sequenceNumber: n,
        readTime: ho(r.readTime),
        documentKey: Kt(r.documentKey.path),
        largestBatchId: r.largestBatchId
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
 */ var Io = /** @class */ function() {
    function t() {}
    return t.prototype.getBundleMetadata = function(t, e) {
        return Eo(t).get(e).next((function(t) {
            if (t) return {
                id: (e = t).bundleId,
                createTime: fo(e.createTime),
                version: e.version
            };
            /** Encodes a DbBundle to a BundleMetadata object. */            var e;
            /** Encodes a BundleMetadata to a DbBundle. */        }));
    }, t.prototype.saveBundleMetadata = function(t, e) {
        return Eo(t).put({
            bundleId: (n = e).id,
            createTime: ho(Vi(n.createTime)),
            version: n.version
        });
        var n;
        /** Encodes a DbNamedQuery to a NamedQuery. */    }, t.prototype.getNamedQuery = function(t, e) {
        return To(t).get(e).next((function(t) {
            if (t) return {
                name: (e = t).name,
                query: yo(e.bundledQuery),
                readTime: fo(e.readTime)
            };
            var e;
            /** Encodes a NamedQuery from a bundle proto to a DbNamedQuery. */        }));
    }, t.prototype.saveNamedQuery = function(t, e) {
        return To(t).put(function(t) {
            return {
                name: t.name,
                readTime: ho(Vi(t.readTime)),
                bundledQuery: t.bundledQuery
            };
        }(e));
    }, t;
}();

/**
 * Helper to get a typed SimpleDbStore for the bundles object store.
 */ function Eo(t) {
    return we(t, "bundles");
}

/**
 * Helper to get a typed SimpleDbStore for the namedQueries object store.
 */ function To(t) {
    return we(t, "namedQueries");
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
 */ var So = /** @class */ function() {
    /**
     * @param serializer - The document serializer.
     * @param userId - The userId for which we are accessing overlays.
     */
    function t(t, e) {
        this.serializer = t, this.userId = e;
    }
    return t.de = function(e, n) {
        return new t(e, n.uid || "");
    }, t.prototype.getOverlay = function(t, e) {
        var n = this;
        return _o(t).get(wo(this.userId, e)).next((function(t) {
            return t ? go(n.serializer, t) : null;
        }));
    }, t.prototype.getOverlays = function(t, e) {
        var n = this, r = mr();
        return Nt.forEach(e, (function(e) {
            return n.getOverlay(t, e).next((function(t) {
                null !== t && r.set(e, t);
            }));
        })).next((function() {
            return r;
        }));
    }, t.prototype.saveOverlays = function(t, e, n) {
        var r = this, i = [];
        return n.forEach((function(n, o) {
            var u = new ui(e, o);
            i.push(r.we(t, u));
        })), Nt.waitFor(i);
    }, t.prototype.removeOverlaysForBatchId = function(t, e, n) {
        var r = this, i = new Set;
        // Get the set of unique collection paths.
        e.forEach((function(t) {
            return i.add(Kt(t.getCollectionPath()));
        }));
        var o = [];
        return i.forEach((function(e) {
            var i = IDBKeyRange.bound([ r.userId, e, n ], [ r.userId, e, n + 1 ], 
            /*lowerOpen=*/ !1, 
            /*upperOpen=*/ !0);
            o.push(_o(t).J("collectionPathOverlayIndex", i));
        })), Nt.waitFor(o);
    }, t.prototype.getOverlaysForCollection = function(t, e, n) {
        var r = this, i = mr(), o = Kt(e), u = IDBKeyRange.bound([ this.userId, o, n ], [ this.userId, o, Number.POSITIVE_INFINITY ], 
        /*lowerOpen=*/ !0);
        return _o(t).j("collectionPathOverlayIndex", u).next((function(t) {
            for (var e = 0, n = t; e < n.length; e++) {
                var o = n[e], u = go(r.serializer, o);
                i.set(u.getKey(), u);
            }
            return i;
        }));
    }, t.prototype.getOverlaysForCollectionGroup = function(t, e, n, r) {
        var i, o = this, u = mr(), a = IDBKeyRange.bound([ this.userId, e, n ], [ this.userId, e, Number.POSITIVE_INFINITY ], 
        /*lowerOpen=*/ !0);
        return _o(t).X({
            index: "collectionGroupOverlayIndex",
            range: a
        }, (function(t, e, n) {
            // We do not want to return partial batch overlays, even if the size
            // of the result set exceeds the given `count` argument. Therefore, we
            // continue to aggregate results even after the result size exceeds
            // `count` if there are more overlays from the `currentBatchId`.
            var a = go(o.serializer, e);
            u.size() < r || a.largestBatchId === i ? (u.set(a.getKey(), a), i = a.largestBatchId) : n.done();
        })).next((function() {
            return u;
        }));
    }, t.prototype.we = function(t, e) {
        return _o(t).put(function(t, e, n) {
            var r = wo(e, n.mutation.key);
            return r[0], {
                userId: e,
                collectionPath: r[1],
                documentId: r[2],
                collectionGroup: n.mutation.key.getCollectionGroup(),
                largestBatchId: n.largestBatchId,
                overlayMutation: Wi(t.fe, n.mutation)
            };
        }(this.serializer, this.userId, e));
    }, t;
}();

/**
 * Helper to get a typed SimpleDbStore for the document overlay object store.
 */ function _o(t) {
    return we(t, "documentOverlays");
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
/** Firestore index value writer.  */ var Do = /** @class */ function() {
    function t() {}
    // The write methods below short-circuit writing terminators for values
    // containing a (terminating) truncated value.
    // As an example, consider the resulting encoding for:
    // ["bar", [2, "foo"]] -> (STRING, "bar", TERM, ARRAY, NUMBER, 2, STRING, "foo", TERM, TERM, TERM)
    // ["bar", [2, truncated("foo")]] -> (STRING, "bar", TERM, ARRAY, NUMBER, 2, STRING, "foo", TRUNC)
    // ["bar", truncated(["foo"])] -> (STRING, "bar", TERM, ARRAY. STRING, "foo", TERM, TRUNC)
    /** Writes an index value.  */    return t.prototype._e = function(t, e) {
        this.me(t, e), 
        // Write separator to split index values
        // (see go/firestore-storage-format#encodings).
        e.ge();
    }, t.prototype.me = function(t, e) {
        if ("nullValue" in t) this.ye(e, 5); else if ("booleanValue" in t) this.ye(e, 10), 
        e.pe(t.booleanValue ? 1 : 0); else if ("integerValue" in t) this.ye(e, 15), e.pe(Re(t.integerValue)); else if ("doubleValue" in t) {
            var n = Re(t.doubleValue);
            isNaN(n) ? this.ye(e, 13) : (this.ye(e, 15), Gt(n) ? 
            // -0.0, 0 and 0.0 are all considered the same
            e.pe(0) : e.pe(n));
        } else if ("timestampValue" in t) {
            var r = t.timestampValue;
            this.ye(e, 20), "string" == typeof r ? e.Ie(r) : (e.Ie("".concat(r.seconds || "")), 
            e.pe(r.nanos || 0));
        } else if ("stringValue" in t) this.Te(t.stringValue, e), this.Ee(e); else if ("bytesValue" in t) this.ye(e, 30), 
        e.Ae(Ve(t.bytesValue)), this.Ee(e); else if ("referenceValue" in t) this.ve(t.referenceValue, e); else if ("geoPointValue" in t) {
            var i = t.geoPointValue;
            this.ye(e, 45), e.pe(i.latitude || 0), e.pe(i.longitude || 0);
        } else "mapValue" in t ? un(t) ? this.ye(e, Number.MAX_SAFE_INTEGER) : (this.Re(t.mapValue, e), 
        this.Ee(e)) : "arrayValue" in t ? (this.Pe(t.arrayValue, e), this.Ee(e)) : U();
    }, t.prototype.Te = function(t, e) {
        this.ye(e, 25), this.be(t, e);
    }, t.prototype.be = function(t, e) {
        e.Ie(t);
    }, t.prototype.Re = function(t, e) {
        var n = t.fields || {};
        this.ye(e, 55);
        for (var r = 0, i = Object.keys(n); r < i.length; r++) {
            var o = i[r];
            this.Te(o, e), this.me(n[o], e);
        }
    }, t.prototype.Pe = function(t, e) {
        var n = t.values || [];
        this.ye(e, 50);
        for (var r = 0, i = n; r < i.length; r++) {
            var o = i[r];
            this.me(o, e);
        }
    }, t.prototype.ve = function(t, e) {
        var n = this;
        this.ye(e, 37), pt.fromName(t).path.forEach((function(t) {
            n.ye(e, 60), n.be(t, e);
        }));
    }, t.prototype.ye = function(t, e) {
        t.pe(e);
    }, t.prototype.Ee = function(t) {
        // While the SDK does not implement truncation, the truncation marker is
        // used to terminate all variable length values (which are strings, bytes,
        // references, arrays and maps).
        t.pe(2);
    }, t;
}();

/**
 * Counts the number of zeros in a byte.
 *
 * Visible for testing.
 */
function Co(t) {
    if (0 === t) return 8;
    var e = 0;
    return t >> 4 == 0 && (
    // Test if the first four bits are zero.
    e += 4, t <<= 4), t >> 6 == 0 && (
    // Test if the first two (or next two) bits are zero.
    e += 2, t <<= 2), t >> 7 == 0 && (
    // Test if the remaining bit is zero.
    e += 1), e
    /** Counts the number of leading zeros in the given byte array. */
    /**
 * Returns the number of bytes required to store "value". Leading zero bytes
 * are skipped.
 */;
}

function xo(t) {
    // This is just the number of bytes for the unsigned representation of the number.
    var e = 64 - function(t) {
        for (var e = 0, n = 0; n < 8; ++n) {
            var r = Co(255 & t[n]);
            if (e += r, 8 !== r) break;
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
 */ Do.Ve = new Do;

var No = /** @class */ function() {
    function t() {
        this.buffer = new Uint8Array(1024), this.position = 0;
    }
    return t.prototype.Se = function(t) {
        for (var e = t[Symbol.iterator](), n = e.next(); !n.done; ) this.De(n.value), n = e.next();
        this.Ce();
    }, t.prototype.xe = function(t) {
        for (var e = t[Symbol.iterator](), n = e.next(); !n.done; ) this.Ne(n.value), n = e.next();
        this.ke();
    }, 
    /** Writes utf8 bytes into this byte sequence, ascending. */ t.prototype.Me = function(t) {
        for (var e = 0, n = t; e < n.length; e++) {
            var r = n[e], i = r.charCodeAt(0);
            if (i < 128) this.De(i); else if (i < 2048) this.De(960 | i >>> 6), this.De(128 | 63 & i); else if (r < "\ud800" || "\udbff" < r) this.De(480 | i >>> 12), 
            this.De(128 | 63 & i >>> 6), this.De(128 | 63 & i); else {
                var o = r.codePointAt(0);
                this.De(240 | o >>> 18), this.De(128 | 63 & o >>> 12), this.De(128 | 63 & o >>> 6), 
                this.De(128 | 63 & o);
            }
        }
        this.Ce();
    }, 
    /** Writes utf8 bytes into this byte sequence, descending */ t.prototype.$e = function(t) {
        for (var e = 0, n = t; e < n.length; e++) {
            var r = n[e], i = r.charCodeAt(0);
            if (i < 128) this.Ne(i); else if (i < 2048) this.Ne(960 | i >>> 6), this.Ne(128 | 63 & i); else if (r < "\ud800" || "\udbff" < r) this.Ne(480 | i >>> 12), 
            this.Ne(128 | 63 & i >>> 6), this.Ne(128 | 63 & i); else {
                var o = r.codePointAt(0);
                this.Ne(240 | o >>> 18), this.Ne(128 | 63 & o >>> 12), this.Ne(128 | 63 & o >>> 6), 
                this.Ne(128 | 63 & o);
            }
        }
        this.ke();
    }, t.prototype.Oe = function(t) {
        // Values are encoded with a single byte length prefix, followed by the
        // actual value in big-endian format with leading 0 bytes dropped.
        var e = this.Fe(t), n = xo(e);
        this.Be(1 + n), this.buffer[this.position++] = 255 & n;
        // Write the length
        for (var r = e.length - n; r < e.length; ++r) this.buffer[this.position++] = 255 & e[r];
    }, t.prototype.Le = function(t) {
        // Values are encoded with a single byte length prefix, followed by the
        // inverted value in big-endian format with leading 0 bytes dropped.
        var e = this.Fe(t), n = xo(e);
        this.Be(1 + n), this.buffer[this.position++] = ~(255 & n);
        // Write the length
        for (var r = e.length - n; r < e.length; ++r) this.buffer[this.position++] = ~(255 & e[r]);
    }, 
    /**
     * Writes the "infinity" byte sequence that sorts after all other byte
     * sequences written in ascending order.
     */
    t.prototype.qe = function() {
        this.Ue(255), this.Ue(255);
    }, 
    /**
     * Writes the "infinity" byte sequence that sorts before all other byte
     * sequences written in descending order.
     */
    t.prototype.Ke = function() {
        this.Ge(255), this.Ge(255);
    }, 
    /**
     * Resets the buffer such that it is the same as when it was newly
     * constructed.
     */
    t.prototype.reset = function() {
        this.position = 0;
    }, t.prototype.seed = function(t) {
        this.Be(t.length), this.buffer.set(t, this.position), this.position += t.length;
    }, 
    /** Makes a copy of the encoded bytes in this buffer.  */ t.prototype.Qe = function() {
        return this.buffer.slice(0, this.position);
    }, 
    /**
     * Encodes `val` into an encoding so that the order matches the IEEE 754
     * floating-point comparison results with the following exceptions:
     *   -0.0 < 0.0
     *   all non-NaN < NaN
     *   NaN = NaN
     */
    t.prototype.Fe = function(t) {
        var e = 
        /** Converts a JavaScript number to a byte array (using big endian encoding). */
        function(t) {
            var e = new DataView(new ArrayBuffer(8));
            return e.setFloat64(0, t, /* littleEndian= */ !1), new Uint8Array(e.buffer);
        }(t), n = 0 != (128 & e[0]);
        // Check if the first bit is set. We use a bit mask since value[0] is
        // encoded as a number from 0 to 255.
        // Revert the two complement to get natural ordering
                e[0] ^= n ? 255 : 128;
        for (var r = 1; r < e.length; ++r) e[r] ^= n ? 255 : 0;
        return e;
    }, 
    /** Writes a single byte ascending to the buffer. */ t.prototype.De = function(t) {
        var e = 255 & t;
        0 === e ? (this.Ue(0), this.Ue(255)) : 255 === e ? (this.Ue(255), this.Ue(0)) : this.Ue(e);
    }, 
    /** Writes a single byte descending to the buffer.  */ t.prototype.Ne = function(t) {
        var e = 255 & t;
        0 === e ? (this.Ge(0), this.Ge(255)) : 255 === e ? (this.Ge(255), this.Ge(0)) : this.Ge(t);
    }, t.prototype.Ce = function() {
        this.Ue(0), this.Ue(1);
    }, t.prototype.ke = function() {
        this.Ge(0), this.Ge(1);
    }, t.prototype.Ue = function(t) {
        this.Be(1), this.buffer[this.position++] = t;
    }, t.prototype.Ge = function(t) {
        this.Be(1), this.buffer[this.position++] = ~t;
    }, t.prototype.Be = function(t) {
        var e = t + this.position;
        if (!(e <= this.buffer.length)) {
            // Try doubling.
            var n = 2 * this.buffer.length;
            // Still not big enough? Just allocate the right size.
                        n < e && (n = e);
            // Create the new buffer.
            var r = new Uint8Array(n);
            r.set(this.buffer), // copy old data
            this.buffer = r;
        }
    }, t;
}(), Ao = /** @class */ function() {
    function t(t) {
        this.je = t;
    }
    return t.prototype.Ae = function(t) {
        this.je.Se(t);
    }, t.prototype.Ie = function(t) {
        this.je.Me(t);
    }, t.prototype.pe = function(t) {
        this.je.Oe(t);
    }, t.prototype.ge = function() {
        this.je.qe();
    }, t;
}(), ko = /** @class */ function() {
    function t(t) {
        this.je = t;
    }
    return t.prototype.Ae = function(t) {
        this.je.xe(t);
    }, t.prototype.Ie = function(t) {
        this.je.$e(t);
    }, t.prototype.pe = function(t) {
        this.je.Le(t);
    }, t.prototype.ge = function() {
        this.je.Ke();
    }, t;
}(), Oo = /** @class */ function() {
    function t() {
        this.je = new No, this.ze = new Ao(this.je), this.We = new ko(this.je);
    }
    return t.prototype.seed = function(t) {
        this.je.seed(t);
    }, t.prototype.He = function(t) {
        return 0 /* IndexKind.ASCENDING */ === t ? this.ze : this.We;
    }, t.prototype.Qe = function() {
        return this.je.Qe();
    }, t.prototype.reset = function() {
        this.je.reset();
    }, t;
}(), Fo = /** @class */ function() {
    function t(t, e, n, r) {
        this.indexId = t, this.documentKey = e, this.arrayValue = n, this.directionalValue = r
        /**
     * Returns an IndexEntry entry that sorts immediately after the current
     * directional value.
     */;
    }
    return t.prototype.Je = function() {
        var e = this.directionalValue.length, n = 0 === e || 255 === this.directionalValue[e - 1] ? e + 1 : e, r = new Uint8Array(n);
        return r.set(this.directionalValue, 0), n !== e ? r.set([ 0 ], this.directionalValue.length) : ++r[r.length - 1], 
        new t(this.indexId, this.documentKey, this.arrayValue, r);
    }, t;
}();

function Po(t, e) {
    var n = t.indexId - e.indexId;
    return 0 !== n ? n : 0 !== (n = Ro(t.arrayValue, e.arrayValue)) ? n : 0 !== (n = Ro(t.directionalValue, e.directionalValue)) ? n : pt.comparator(t.documentKey, e.documentKey);
}

function Ro(t, e) {
    for (var n = 0; n < t.length && n < e.length; ++n) {
        var r = t[n] - e[n];
        if (0 !== r) return r;
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
 */ var Vo = /** @class */ function() {
    function t(t) {
        this.collectionId = null != t.collectionGroup ? t.collectionGroup : t.path.lastSegment(), 
        this.Ye = t.orderBy, this.Xe = [];
        for (var e = 0, n = t.filters; e < n.length; e++) {
            var r = n[e];
            r.isInequality() ? this.Ze = r : this.Xe.push(r);
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
     */    return t.prototype.tn = function(t) {
        z(t.collectionGroup === this.collectionId);
        // If there is an array element, find a matching filter.
        var e = mt(t);
        if (void 0 !== e && !this.en(e)) return !1;
        // Process all equalities first. Equalities can appear out of order.
        for (var n = yt(t), r = new Set, i = 0, o = 0; i < n.length && this.en(n[i]); ++i) r = r.add(n[i].fieldPath.canonicalString());
        // If we already have processed all segments, all segments are used to serve
        // the equality filters and we do not need to map any segments to the
        // target's inequality and orderBy clauses.
                if (i === n.length) return !0;
        if (void 0 !== this.Ze) {
            // If there is an inequality filter and the field was not in one of the
            // equality filters above, the next segment must match both the filter
            // and the first orderBy clause.
            if (!r.has(this.Ze.field.canonicalString())) {
                var u = n[i];
                if (!this.nn(this.Ze, u) || !this.sn(this.Ye[o++], u)) return !1;
            }
            ++i;
        }
        // All remaining segments need to represent the prefix of the target's
        // orderBy.
                for (;i < n.length; ++i) {
            var a = n[i];
            if (o >= this.Ye.length || !this.sn(this.Ye[o++], a)) return !1;
        }
        return !0;
    }, t.prototype.en = function(t) {
        for (var e = 0, n = this.Xe; e < n.length; e++) {
            var r = n[e];
            if (this.nn(r, t)) return !0;
        }
        return !1;
    }, t.prototype.nn = function(t, e) {
        if (void 0 === t || !t.field.isEqual(e.fieldPath)) return !1;
        var n = "array-contains" /* Operator.ARRAY_CONTAINS */ === t.op || "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ === t.op;
        return 2 /* IndexKind.CONTAINS */ === e.kind === n;
    }, t.prototype.sn = function(t, e) {
        return !!t.field.isEqual(e.fieldPath) && (0 /* IndexKind.ASCENDING */ === e.kind && "asc" /* Direction.ASCENDING */ === t.dir || 1 /* IndexKind.DESCENDING */ === e.kind && "desc" /* Direction.DESCENDING */ === t.dir);
    }, t;
}();

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
 */ function Mo(t) {
    var e, n;
    if (z(t instanceof bn || t instanceof In), t instanceof bn) {
        if (t instanceof Rn) {
            var r = (null === (n = null === (e = t.value.arrayValue) || void 0 === e ? void 0 : e.values) || void 0 === n ? void 0 : n.map((function(e) {
                return bn.create(t.field, "==" /* Operator.EQUAL */ , e);
            }))) || [];
            return In.create(r, "or" /* CompositeOperator.OR */);
        }
        // We have reached other kinds of field filters.
                return t;
    }
    // We have a composite filter.
        var i = t.filters.map((function(t) {
        return Mo(t);
    }));
    return In.create(i, t.op);
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
 */ function Lo(t) {
    if (0 === t.getFilters().length) return [];
    var e = zo(Mo(t));
    return z(Uo(e)), qo(e) || Bo(e) ? [ e ] : e.getFilters()
    /** Returns true if the given filter is a single field filter. e.g. (a == 10). */;
}

function qo(t) {
    return t instanceof bn;
}

/**
 * Returns true if the given filter is the conjunction of one or more field filters. e.g. (a == 10
 * && b == 20)
 */ function Bo(t) {
    return t instanceof In && Sn(t);
}

/**
 * Returns whether or not the given filter is in disjunctive normal form (DNF).
 *
 * <p>In boolean logic, a disjunctive normal form (DNF) is a canonical normal form of a logical
 * formula consisting of a disjunction of conjunctions; it can also be described as an OR of ANDs.
 *
 * <p>For more info, visit: https://en.wikipedia.org/wiki/Disjunctive_normal_form
 */ function Uo(t) {
    return qo(t) || Bo(t) || 
    /**
     * Returns true if the given filter is the disjunction of one or more "flat conjunctions" and
     * field filters. e.g. (a == 10) || (b==20 && c==30)
     */
    function(t) {
        if (t instanceof In && Tn(t)) {
            for (var e = 0, n = t.getFilters(); e < n.length; e++) {
                var r = n[e];
                if (!qo(r) && !Bo(r)) return !1;
            }
            return !0;
        }
        return !1;
    }(t);
}

function zo(t) {
    if (z(t instanceof bn || t instanceof In), t instanceof bn) return t;
    if (1 === t.filters.length) return zo(t.filters[0]);
    // Compute DNF for each of the subfilters first
        var e = t.filters.map((function(t) {
        return zo(t);
    })), n = In.create(e, t.op);
    return Uo(n = Ko(n)) ? n : (z(n instanceof In), z(En(n)), z(n.filters.length > 1), 
    n.filters.reduce((function(t, e) {
        return Go(t, e);
    })));
}

function Go(t, e) {
    var n;
    return z(t instanceof bn || t instanceof In), z(e instanceof bn || e instanceof In), 
    // FieldFilter FieldFilter
    n = t instanceof bn ? e instanceof bn ? function(t, e) {
        // Conjunction distribution for two field filters is the conjunction of them.
        return In.create([ t, e ], "and" /* CompositeOperator.AND */);
    }(t, e) : jo(t, e) : e instanceof bn ? jo(e, t) : function(t, e) {
        // There are four cases:
        // (A & B) & (C & D) --> (A & B & C & D)
        // (A & B) & (C | D) --> (A & B & C) | (A & B & D)
        // (A | B) & (C & D) --> (C & D & A) | (C & D & B)
        // (A | B) & (C | D) --> (A & C) | (A & D) | (B & C) | (B & D)
        // Case 1 is a merge.
        if (z(t.filters.length > 0 && e.filters.length > 0), En(t) && En(e)) return xn(t, e.getFilters());
        // Case 2,3,4 all have at least one side (lhs or rhs) that is a disjunction. In all three cases
        // we should take each element of the disjunction and distribute it over the other side, and
        // return the disjunction of the distribution results.
                var n = Tn(t) ? t : e, r = Tn(t) ? e : t, i = n.filters.map((function(t) {
            return Go(t, r);
        }));
        return In.create(i, "or" /* CompositeOperator.OR */);
    }(t, e), Ko(n);
}

function jo(t, e) {
    // There are two cases:
    // A & (B & C) --> (A & B & C)
    // A & (B | C) --> (A & B) | (A & C)
    if (En(e)) 
    // Case 1
    return xn(e, t.getFilters());
    // Case 2
    var n = e.filters.map((function(e) {
        return Go(t, e);
    }));
    return In.create(n, "or" /* CompositeOperator.OR */);
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
 */ function Ko(t) {
    if (z(t instanceof bn || t instanceof In), t instanceof bn) return t;
    var e = t.getFilters();
    // If the composite filter only contains 1 filter, apply associativity to it.
        if (1 === e.length) return Ko(e[0]);
    // Associativity applied to a flat composite filter results is itself.
        if (_n(t)) return t;
    // First apply associativity to all subfilters. This will in turn recursively apply
    // associativity to all nested composite filters and field filters.
        var n = e.map((function(t) {
        return Ko(t);
    })), r = [];
    // For composite subfilters that perform the same kind of logical operation as `compositeFilter`
    // take out their filters and add them to `compositeFilter`. For example:
    // compositeFilter = (A | (B | C | D))
    // compositeSubfilter = (B | C | D)
    // Result: (A | B | C | D)
    // Note that the `compositeSubfilter` has been eliminated, and its filters (B, C, D) have been
    // added to the top-level "compositeFilter".
        return n.forEach((function(e) {
        e instanceof bn ? r.push(e) : e instanceof In && (e.op === t.op ? 
        // compositeFilter: (A | (B | C))
        // compositeSubfilter: (B | C)
        // Result: (A | B | C)
        r.push.apply(
        // compositeFilter: (A | (B | C))
        // compositeSubfilter: (B | C)
        // Result: (A | B | C)
        r, e.filters) : 
        // compositeFilter: (A | (B & C))
        // compositeSubfilter: (B & C)
        // Result: (A | (B & C))
        r.push(e));
    })), 1 === r.length ? r[0] : In.create(r, t.op)
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
 */;
}

var Qo = /** @class */ function() {
    function t() {
        this.rn = new Wo;
    }
    return t.prototype.addToCollectionParentIndex = function(t, e) {
        return this.rn.add(e), Nt.resolve();
    }, t.prototype.getCollectionParents = function(t, e) {
        return Nt.resolve(this.rn.getEntries(e));
    }, t.prototype.addFieldIndex = function(t, e) {
        // Field indices are not supported with memory persistence.
        return Nt.resolve();
    }, t.prototype.deleteFieldIndex = function(t, e) {
        // Field indices are not supported with memory persistence.
        return Nt.resolve();
    }, t.prototype.getDocumentsMatchingTarget = function(t, e) {
        // Field indices are not supported with memory persistence.
        return Nt.resolve(null);
    }, t.prototype.getIndexType = function(t, e) {
        // Field indices are not supported with memory persistence.
        return Nt.resolve(0 /* IndexType.NONE */);
    }, t.prototype.getFieldIndexes = function(t, e) {
        // Field indices are not supported with memory persistence.
        return Nt.resolve([]);
    }, t.prototype.getNextCollectionGroupToUpdate = function(t) {
        // Field indices are not supported with memory persistence.
        return Nt.resolve(null);
    }, t.prototype.getMinOffset = function(t, e) {
        return Nt.resolve(St.min());
    }, t.prototype.getMinOffsetFromCollectionGroup = function(t, e) {
        return Nt.resolve(St.min());
    }, t.prototype.updateCollectionGroup = function(t, e, n) {
        // Field indices are not supported with memory persistence.
        return Nt.resolve();
    }, t.prototype.updateIndexEntries = function(t, e) {
        // Field indices are not supported with memory persistence.
        return Nt.resolve();
    }, t;
}(), Wo = /** @class */ function() {
    function t() {
        this.index = {};
    }
    // Returns false if the entry already existed.
        return t.prototype.add = function(t) {
        var e = t.lastSegment(), n = t.popLast(), r = this.index[e] || new De(ht.comparator), i = !r.has(n);
        return this.index[e] = r.add(n), i;
    }, t.prototype.has = function(t) {
        var e = t.lastSegment(), n = t.popLast(), r = this.index[e];
        return r && r.has(n);
    }, t.prototype.getEntries = function(t) {
        return (this.index[t] || new De(ht.comparator)).toArray();
    }, t;
}(), Ho = new Uint8Array(0), Yo = /** @class */ function() {
    function t(t, e) {
        this.user = t, this.databaseId = e, 
        /**
             * An in-memory copy of the index entries we've already written since the SDK
             * launched. Used to avoid re-writing the same entry repeatedly.
             *
             * This is *NOT* a complete cache of what's in persistence and so can never be
             * used to satisfy reads.
             */
        this.on = new Wo, 
        /**
             * Maps from a target to its equivalent list of sub-targets. Each sub-target
             * contains only one term from the target's disjunctive normal form (DNF).
             */
        this.un = new lr((function(t) {
            return Bn(t);
        }), (function(t, e) {
            return Un(t, e);
        })), this.uid = t.uid || ""
        /**
     * Adds a new entry to the collection parent index.
     *
     * Repeated calls for the same collectionPath should be avoided within a
     * transaction as IndexedDbIndexManager only caches writes once a transaction
     * has been committed.
     */;
    }
    return t.prototype.addToCollectionParentIndex = function(t, e) {
        var n = this;
        if (!this.on.has(e)) {
            var r = e.lastSegment(), i = e.popLast();
            t.addOnCommittedListener((function() {
                // Add the collection to the in memory cache only if the transaction was
                // successfully committed.
                n.on.add(e);
            }));
            var o = {
                collectionId: r,
                parent: Kt(i)
            };
            return Xo(t).put(o);
        }
        return Nt.resolve();
    }, t.prototype.getCollectionParents = function(t, e) {
        var n = [], r = IDBKeyRange.bound([ e, "" ], [ at(e), "" ], 
        /*lowerOpen=*/ !1, 
        /*upperOpen=*/ !0);
        return Xo(t).j(r).next((function(t) {
            for (var r = 0, i = t; r < i.length; r++) {
                var o = i[r];
                // This collectionId guard shouldn't be necessary (and isn't as long
                // as we're running in a real browser), but there's a bug in
                // indexeddbshim that breaks our range in our tests running in node:
                // https://github.com/axemclion/IndexedDBShim/issues/334
                                if (o.collectionId !== e) break;
                n.push(Ht(o.parent));
            }
            return n;
        }));
    }, t.prototype.addFieldIndex = function(t, e) {
        var n = this, r = Zo(t), i = function(t) {
            return {
                indexId: t.indexId,
                collectionGroup: t.collectionGroup,
                fields: t.fields.map((function(t) {
                    return [ t.fieldPath.canonicalString(), t.kind ];
                }))
            };
        }(e);
        // TODO(indexing): Verify that the auto-incrementing index ID works in
        // Safari & Firefox.
                delete i.indexId;
        // `indexId` is auto-populated by IndexedDb
        var o = r.add(i);
        if (e.indexState) {
            var u = $o(t);
            return o.next((function(t) {
                u.put(bo(t, n.user, e.indexState.sequenceNumber, e.indexState.offset));
            }));
        }
        return o.next();
    }, t.prototype.deleteFieldIndex = function(t, e) {
        var n = Zo(t), r = $o(t), i = Jo(t);
        return n.delete(e.indexId).next((function() {
            return r.delete(IDBKeyRange.bound([ e.indexId ], [ e.indexId + 1 ], 
            /*lowerOpen=*/ !1, 
            /*upperOpen=*/ !0));
        })).next((function() {
            return i.delete(IDBKeyRange.bound([ e.indexId ], [ e.indexId + 1 ], 
            /*lowerOpen=*/ !1, 
            /*upperOpen=*/ !0));
        }));
    }, t.prototype.getDocumentsMatchingTarget = function(t, e) {
        var n = this, r = Jo(t), i = !0, o = new Map;
        return Nt.forEach(this.cn(e), (function(e) {
            return n.an(t, e).next((function(t) {
                i && (i = !!t), o.set(e, t);
            }));
        })).next((function() {
            if (i) {
                var t = Ir(), u = [];
                return Nt.forEach(o, (function(i, o) {
                    var a;
                    M("IndexedDbIndexManager", "Using index ".concat((a = i, "id=".concat(a.indexId, "|cg=").concat(a.collectionGroup, "|f=").concat(a.fields.map((function(t) {
                        return "".concat(t.fieldPath, ":").concat(t.kind);
                    })).join(","))), " to execute ").concat(Bn(e)));
                    var s = function(t, e) {
                        var n = mt(e);
                        if (void 0 === n) return null;
                        for (var r = 0, i = Gn(t, n.fieldPath); r < i.length; r++) {
                            var o = i[r];
                            switch (o.op) {
                              case "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ :
                                return o.value.arrayValue.values || [];

                              case "array-contains" /* Operator.ARRAY_CONTAINS */ :
                                return [ o.value ];
                                // Remaining filters are not array filters.
                                                        }
                        }
                        return null;
                    }(o, i), c = function(t, e) {
                        for (var n = new Map, r = 0, i = yt(e); r < i.length; r++) for (var o = i[r], u = 0, a = Gn(t, o.fieldPath); u < a.length; u++) {
                            var s = a[u];
                            switch (s.op) {
                              case "==" /* Operator.EQUAL */ :
                              case "in" /* Operator.IN */ :
                                // Encode equality prefix, which is encoded in the index value before
                                // the inequality (e.g. `a == 'a' && b != 'b'` is encoded to
                                // `value != 'ab'`).
                                n.set(o.fieldPath.canonicalString(), s.value);
                                break;

                              case "not-in" /* Operator.NOT_IN */ :
                              case "!=" /* Operator.NOT_EQUAL */ :
                                // NotIn/NotEqual is always a suffix. There cannot be any remaining
                                // segments and hence we can return early here.
                                return n.set(o.fieldPath.canonicalString(), s.value), Array.from(n.values());
                                // Remaining filters cannot be used as notIn bounds.
                                                        }
                        }
                        return null;
                    }(o, i), l = function(t, e) {
                        // For each segment, retrieve a lower bound if there is a suitable filter or
                        // startAt.
                        for (var n = [], r = !0, i = 0, o = yt(e); i < o.length; i++) {
                            var u = o[i], a = 0 /* IndexKind.ASCENDING */ === u.kind ? jn(t, u.fieldPath, t.startAt) : Kn(t, u.fieldPath, t.startAt);
                            n.push(a.value), r && (r = a.inclusive);
                        }
                        return new pn(n, r);
                    }(o, i), h = function(t, e) {
                        // For each segment, retrieve an upper bound if there is a suitable filter or
                        // endAt.
                        for (var n = [], r = !0, i = 0, o = yt(e); i < o.length; i++) {
                            var u = o[i], a = 0 /* IndexKind.ASCENDING */ === u.kind ? Kn(t, u.fieldPath, t.endAt) : jn(t, u.fieldPath, t.endAt);
                            n.push(a.value), r && (r = a.inclusive);
                        }
                        return new pn(n, r);
                    }(o, i), f = n.hn(i, o, l), d = n.hn(i, o, h), p = n.ln(i, o, c), v = n.fn(i.indexId, s, f, l.inclusive, d, h.inclusive, p);
                    return Nt.forEach(v, (function(n) {
                        return r.H(n, e.limit).next((function(e) {
                            e.forEach((function(e) {
                                var n = pt.fromSegments(e.documentKey);
                                t.has(n) || (t = t.add(n), u.push(n));
                            }));
                        }));
                    }));
                })).next((function() {
                    return u;
                }));
            }
            return Nt.resolve(null);
        }));
    }, t.prototype.cn = function(t) {
        var e = this.un.get(t);
        return e || (e = 0 === t.filters.length ? [ t ] : Lo(In.create(t.filters, "and" /* CompositeOperator.AND */)).map((function(e) {
            return qn(t.path, t.collectionGroup, t.orderBy, e.getFilters(), t.limit, t.startAt, t.endAt);
        })), this.un.set(t, e), e);
    }, 
    /**
     * Constructs a key range query on `DbIndexEntryStore` that unions all
     * bounds.
     */
    t.prototype.fn = function(t, e, n, r, i, o, u) {
        for (var a = this, s = (null != e ? e.length : 1) * Math.max(n.length, i.length), c = s / (null != e ? e.length : 1), l = [], h = function(s) {
            var h = e ? f.dn(e[s / c]) : Ho, d = f.wn(t, h, n[s % c], r), p = f._n(t, h, i[s % c], o), v = u.map((function(e) {
                return a.wn(t, h, e, 
                /* inclusive= */ !0);
            }));
            l.push.apply(l, f.createRange(d, p, v));
        }, f = this, d = 0
        // The number of total index scans we union together. This is similar to a
        // distributed normal form, but adapted for array values. We create a single
        // index range per value in an ARRAY_CONTAINS or ARRAY_CONTAINS_ANY filter
        // combined with the values from the query bounds.
        ; d < s; ++d) h(d);
        return l;
    }, 
    /** Generates the lower bound for `arrayValue` and `directionalValue`. */ t.prototype.wn = function(t, e, n, r) {
        var i = new Fo(t, pt.empty(), e, n);
        return r ? i : i.Je();
    }, 
    /** Generates the upper bound for `arrayValue` and `directionalValue`. */ t.prototype._n = function(t, e, n, r) {
        var i = new Fo(t, pt.empty(), e, n);
        return r ? i.Je() : i;
    }, t.prototype.an = function(t, e) {
        var n = new Vo(e), r = null != e.collectionGroup ? e.collectionGroup : e.path.lastSegment();
        return this.getFieldIndexes(t, r).next((function(t) {
            for (
            // Return the index with the most number of segments.
            var e = null, r = 0, i = t; r < i.length; r++) {
                var o = i[r];
                n.tn(o) && (!e || o.fields.length > e.fields.length) && (e = o);
            }
            return e;
        }));
    }, t.prototype.getIndexType = function(t, e) {
        var n = this, r = 2 /* IndexType.FULL */ , i = this.cn(e);
        return Nt.forEach(i, (function(e) {
            return n.an(t, e).next((function(t) {
                t ? 0 /* IndexType.NONE */ !== r && t.fields.length < function(t) {
                    for (var e = new De(dt.comparator), n = !1, r = 0, i = t.filters; r < i.length; r++) for (var o = 0, u = i[r].getFlattenedFilters(); o < u.length; o++) {
                        var a = u[o];
                        // __name__ is not an explicit segment of any index, so we don't need to
                        // count it.
                                                a.field.isKeyField() || (
                        // ARRAY_CONTAINS or ARRAY_CONTAINS_ANY filters must be counted separately.
                        // For instance, it is possible to have an index for "a ARRAY a ASC". Even
                        // though these are on the same field, they should be counted as two
                        // separate segments in an index.
                        "array-contains" /* Operator.ARRAY_CONTAINS */ === a.op || "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ === a.op ? n = !0 : e = e.add(a.field));
                    }
                    for (var s = 0, c = t.orderBy; s < c.length; s++) {
                        var l = c[s];
                        // __name__ is not an explicit segment of any index, so we don't need to
                        // count it.
                                                l.field.isKeyField() || (e = e.add(l.field));
                    }
                    return e.size + (n ? 1 : 0);
                }(e) && (r = 1 /* IndexType.PARTIAL */) : r = 0 /* IndexType.NONE */;
            }));
        })).next((function() {
            // OR queries have more than one sub-target (one sub-target per DNF term). We currently consider
            // OR queries that have a `limit` to have a partial index. For such queries we perform sorting
            // and apply the limit in memory as a post-processing step.
            return function(t) {
                return null !== t.limit;
            }(e) && i.length > 1 && 2 /* IndexType.FULL */ === r ? 1 /* IndexType.PARTIAL */ : r;
        }));
    }, 
    /**
     * Returns the byte encoded form of the directional values in the field index.
     * Returns `null` if the document does not have all fields specified in the
     * index.
     */
    t.prototype.mn = function(t, e) {
        for (var n = new Oo, r = 0, i = yt(t); r < i.length; r++) {
            var o = i[r], u = e.data.field(o.fieldPath);
            if (null == u) return null;
            var a = n.He(o.kind);
            Do.Ve._e(u, a);
        }
        return n.Qe();
    }, 
    /** Encodes a single value to the ascending index format. */ t.prototype.dn = function(t) {
        var e = new Oo;
        return Do.Ve._e(t, e.He(0 /* IndexKind.ASCENDING */)), e.Qe();
    }, 
    /**
     * Returns an encoded form of the document key that sorts based on the key
     * ordering of the field index.
     */
    t.prototype.gn = function(t, e) {
        var n = new Oo;
        return Do.Ve._e(Ze(this.databaseId, e), n.He(function(t) {
            var e = yt(t);
            return 0 === e.length ? 0 /* IndexKind.ASCENDING */ : e[e.length - 1].kind;
        }(t))), n.Qe();
    }, 
    /**
     * Encodes the given field values according to the specification in `target`.
     * For IN queries, a list of possible values is returned.
     */
    t.prototype.ln = function(t, e, n) {
        if (null === n) return [];
        var r = [];
        r.push(new Oo);
        for (var i = 0, o = 0, u = yt(t); o < u.length; o++) for (var a = u[o], s = n[i++], c = 0, l = r; c < l.length; c++) {
            var h = l[c];
            if (this.yn(e, a.fieldPath) && tn(s)) r = this.pn(r, a, s); else {
                var f = h.He(a.kind);
                Do.Ve._e(s, f);
            }
        }
        return this.In(r);
    }, 
    /**
     * Encodes the given bounds according to the specification in `target`. For IN
     * queries, a list of possible values is returned.
     */
    t.prototype.hn = function(t, e, n) {
        return this.ln(t, e, n.position);
    }, 
    /** Returns the byte representation for the provided encoders. */ t.prototype.In = function(t) {
        for (var e = [], n = 0; n < t.length; ++n) e[n] = t[n].Qe();
        return e;
    }, 
    /**
     * Creates a separate encoder for each element of an array.
     *
     * The method appends each value to all existing encoders (e.g. filter("a",
     * "==", "a1").filter("b", "in", ["b1", "b2"]) becomes ["a1,b1", "a1,b2"]). A
     * list of new encoders is returned.
     */
    t.prototype.pn = function(t, e, n) {
        for (var i = r([], t, !0), o = [], u = 0, a = n.arrayValue.values || []; u < a.length; u++) for (var s = a[u], c = 0, l = i; c < l.length; c++) {
            var h = l[c], f = new Oo;
            f.seed(h.Qe()), Do.Ve._e(s, f.He(e.kind)), o.push(f);
        }
        return o;
    }, t.prototype.yn = function(t, e) {
        return !!t.filters.find((function(t) {
            return t instanceof bn && t.field.isEqual(e) && ("in" /* Operator.IN */ === t.op || "not-in" /* Operator.NOT_IN */ === t.op);
        }));
    }, t.prototype.getFieldIndexes = function(t, e) {
        var n = this, r = Zo(t), i = $o(t);
        return (e ? r.j("collectionGroupIndex", IDBKeyRange.bound(e, e)) : r.j()).next((function(t) {
            var e = [];
            return Nt.forEach(t, (function(t) {
                return i.get([ t.indexId, n.uid ]).next((function(n) {
                    e.push(function(t, e) {
                        var n = e ? new It(e.sequenceNumber, new St(fo(e.readTime), new pt(Ht(e.documentKey)), e.largestBatchId)) : It.empty(), r = t.fields.map((function(t) {
                            var e = t[0], n = t[1];
                            return new wt(dt.fromServerFormat(e), n);
                        }));
                        return new vt(t.indexId, t.collectionGroup, r, n);
                    }(t, n));
                }));
            })).next((function() {
                return e;
            }));
        }));
    }, t.prototype.getNextCollectionGroupToUpdate = function(t) {
        return this.getFieldIndexes(t).next((function(t) {
            return 0 === t.length ? null : (t.sort((function(t, e) {
                var n = t.indexState.sequenceNumber - e.indexState.sequenceNumber;
                return 0 !== n ? n : ot(t.collectionGroup, e.collectionGroup);
            })), t[0].collectionGroup);
        }));
    }, t.prototype.updateCollectionGroup = function(t, e, n) {
        var r = this, i = Zo(t), o = $o(t);
        return this.Tn(t).next((function(t) {
            return i.j("collectionGroupIndex", IDBKeyRange.bound(e, e)).next((function(e) {
                return Nt.forEach(e, (function(e) {
                    return o.put(bo(e.indexId, r.user, t, n));
                }));
            }));
        }));
    }, t.prototype.updateIndexEntries = function(t, e) {
        var n = this, r = new Map;
        // Porting Note: `getFieldIndexes()` on Web does not cache index lookups as
        // it could be used across different IndexedDB transactions. As any cached
        // data might be invalidated by other multi-tab clients, we can only trust
        // data within a single IndexedDB transaction. We therefore add a cache
        // here.
                return Nt.forEach(e, (function(e, i) {
            var o = r.get(e.collectionGroup);
            return (o ? Nt.resolve(o) : n.getFieldIndexes(t, e.collectionGroup)).next((function(o) {
                return r.set(e.collectionGroup, o), Nt.forEach(o, (function(r) {
                    return n.En(t, e, r).next((function(e) {
                        var o = n.An(i, r);
                        return e.isEqual(o) ? Nt.resolve() : n.vn(t, i, r, e, o);
                    }));
                }));
            }));
        }));
    }, t.prototype.Rn = function(t, e, n, r) {
        return Jo(t).put({
            indexId: r.indexId,
            uid: this.uid,
            arrayValue: r.arrayValue,
            directionalValue: r.directionalValue,
            orderedDocumentKey: this.gn(n, e.key),
            documentKey: e.key.path.toArray()
        });
    }, t.prototype.Pn = function(t, e, n, r) {
        return Jo(t).delete([ r.indexId, this.uid, r.arrayValue, r.directionalValue, this.gn(n, e.key), e.key.path.toArray() ]);
    }, t.prototype.En = function(t, e, n) {
        var r = Jo(t), i = new De(Po);
        return r.X({
            index: "documentKeyIndex",
            range: IDBKeyRange.only([ n.indexId, this.uid, this.gn(n, e) ])
        }, (function(t, r) {
            i = i.add(new Fo(n.indexId, e, r.arrayValue, r.directionalValue));
        })).next((function() {
            return i;
        }));
    }, 
    /** Creates the index entries for the given document. */ t.prototype.An = function(t, e) {
        var n = new De(Po), r = this.mn(e, t);
        if (null == r) return n;
        var i = mt(e);
        if (null != i) {
            var o = t.data.field(i.fieldPath);
            if (tn(o)) for (var u = 0, a = o.arrayValue.values || []; u < a.length; u++) {
                var s = a[u];
                n = n.add(new Fo(e.indexId, t.key, this.dn(s), r));
            }
        } else n = n.add(new Fo(e.indexId, t.key, Ho, r));
        return n;
    }, 
    /**
     * Updates the index entries for the provided document by deleting entries
     * that are no longer referenced in `newEntries` and adding all newly added
     * entries.
     */
    t.prototype.vn = function(t, e, n, r, i) {
        var o = this;
        M("IndexedDbIndexManager", "Updating index entries for document '%s'", e.key);
        var u = [];
        return function(t, e, n, r, i) {
            // Walk through the two sets at the same time, using the ordering defined by
            // `comparator`.
            for (var o = t.getIterator(), u = e.getIterator(), a = xe(o), s = xe(u); a || s; ) {
                var c = !1, l = !1;
                if (a && s) {
                    var h = n(a, s);
                    h < 0 ? 
                    // The element was removed if the next element in our ordered
                    // walkthrough is only in `before`.
                    l = !0 : h > 0 && (
                    // The element was added if the next element in our ordered walkthrough
                    // is only in `after`.
                    c = !0);
                } else null != a ? l = !0 : c = !0;
                c ? (r(s), s = xe(u)) : l ? (i(a), a = xe(o)) : (a = xe(o), s = xe(u));
            }
        }(r, i, Po, (
        /* onAdd= */ function(r) {
            u.push(o.Rn(t, e, n, r));
        }), (
        /* onRemove= */ function(r) {
            u.push(o.Pn(t, e, n, r));
        })), Nt.waitFor(u);
    }, t.prototype.Tn = function(t) {
        var e = 1;
        return $o(t).X({
            index: "sequenceNumberIndex",
            reverse: !0,
            range: IDBKeyRange.upperBound([ this.uid, Number.MAX_SAFE_INTEGER ])
        }, (function(t, n, r) {
            r.done(), e = n.sequenceNumber + 1;
        })).next((function() {
            return e;
        }));
    }, 
    /**
     * Returns a new set of IDB ranges that splits the existing range and excludes
     * any values that match the `notInValue` from these ranges. As an example,
     * '[foo > 2 && foo != 3]` becomes  `[foo > 2 && < 3, foo > 3]`.
     */
    t.prototype.createRange = function(t, e, n) {
        // The notIn values need to be sorted and unique so that we can return a
        // sorted set of non-overlapping ranges.
        n = n.sort((function(t, e) {
            return Po(t, e);
        })).filter((function(t, e, n) {
            return !e || 0 !== Po(t, n[e - 1]);
        }));
        var r = [];
        r.push(t);
        for (var i = 0, o = n; i < o.length; i++) {
            var u = o[i], a = Po(u, t), s = Po(u, e);
            if (0 === a) 
            // `notInValue` is the lower bound. We therefore need to raise the bound
            // to the next value.
            r[0] = t.Je(); else if (a > 0 && s < 0) 
            // `notInValue` is in the middle of the range
            r.push(u), r.push(u.Je()); else if (s > 0) 
            // `notInValue` (and all following values) are out of the range
            break;
        }
        r.push(e);
        for (var c = [], l = 0; l < r.length; l += 2) {
            // If we encounter two bounds that will create an unmatchable key range,
            // then we return an empty set of key ranges.
            if (this.bn(r[l], r[l + 1])) return [];
            var h = [ r[l].indexId, this.uid, r[l].arrayValue, r[l].directionalValue, Ho, [] ], f = [ r[l + 1].indexId, this.uid, r[l + 1].arrayValue, r[l + 1].directionalValue, Ho, [] ];
            c.push(IDBKeyRange.bound(h, f));
        }
        return c;
    }, t.prototype.bn = function(t, e) {
        // If lower bound is greater than the upper bound, then the key
        // range can never be matched.
        return Po(t, e) > 0;
    }, t.prototype.getMinOffsetFromCollectionGroup = function(t, e) {
        return this.getFieldIndexes(t, e).next(tu);
    }, t.prototype.getMinOffset = function(t, e) {
        var n = this;
        return Nt.mapArray(this.cn(e), (function(e) {
            return n.an(t, e).next((function(t) {
                return t || U();
            }));
        })).next(tu);
    }, t;
}();

/**
 * Internal implementation of the collection-parent index exposed by MemoryIndexManager.
 * Also used for in-memory caching by IndexedDbIndexManager and initial index population
 * in indexeddb_schema.ts
 */
/**
 * Helper to get a typed SimpleDbStore for the collectionParents
 * document store.
 */
function Xo(t) {
    return we(t, "collectionParents");
}

/**
 * Helper to get a typed SimpleDbStore for the index entry object store.
 */ function Jo(t) {
    return we(t, "indexEntries");
}

/**
 * Helper to get a typed SimpleDbStore for the index configuration object store.
 */ function Zo(t) {
    return we(t, "indexConfiguration");
}

/**
 * Helper to get a typed SimpleDbStore for the index state object store.
 */ function $o(t) {
    return we(t, "indexState");
}

function tu(t) {
    z(0 !== t.length);
    for (var e = t[0].indexState.offset, n = e.largestBatchId, r = 1; r < t.length; r++) {
        var i = t[r].indexState.offset;
        _t(i, e) < 0 && (e = i), n < i.largestBatchId && (n = i.largestBatchId);
    }
    return new St(e.readTime, e.documentKey, n);
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
 */ var eu = {
    didRun: !1,
    sequenceNumbersCollected: 0,
    targetsRemoved: 0,
    documentsRemoved: 0
}, nu = /** @class */ function() {
    function t(
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
    return t.withCacheSize = function(e) {
        return new t(e, t.DEFAULT_COLLECTION_PERCENTILE, t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT);
    }, t;
}();

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
function ru(t, e, n) {
    var r = t.store("mutations"), i = t.store("documentMutations"), o = [], u = IDBKeyRange.only(n.batchId), a = 0, s = r.X({
        range: u
    }, (function(t, e, n) {
        return a++, n.delete();
    }));
    o.push(s.next((function() {
        z(1 === a);
    })));
    for (var c = [], l = 0, h = n.mutations; l < h.length; l++) {
        var f = h[l], d = Jt(e, f.key.path, n.batchId);
        o.push(i.delete(d)), c.push(f.key);
    }
    return Nt.waitFor(o).next((function() {
        return c;
    }));
}

/**
 * Returns an approximate size for the given document.
 */ function iu(t) {
    if (!t) return 0;
    var e;
    if (t.document) e = t.document; else if (t.unknownDocument) e = t.unknownDocument; else {
        if (!t.noDocument) throw U();
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
/** A mutation queue for a specific user, backed by IndexedDB. */ nu.DEFAULT_COLLECTION_PERCENTILE = 10, 
nu.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT = 1e3, nu.DEFAULT = new nu(41943040, nu.DEFAULT_COLLECTION_PERCENTILE, nu.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT), 
nu.DISABLED = new nu(-1, 0, 0);

var ou = /** @class */ function() {
    function t(
    /**
     * The normalized userId (e.g. null UID => "" userId) used to store /
     * retrieve mutations.
     */
    t, e, n, r) {
        this.userId = t, this.serializer = e, this.indexManager = n, this.referenceDelegate = r, 
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
        this.Vn = {}
        /**
     * Creates a new mutation queue for the given user.
     * @param user - The user for which to create a mutation queue.
     * @param serializer - The serializer to use when persisting to IndexedDb.
     */;
    }
    return t.de = function(e, n, r, i) {
        // TODO(mcg): Figure out what constraints there are on userIDs
        // In particular, are there any reserved characters? are empty ids allowed?
        // For the moment store these together in the same mutations table assuming
        // that empty userIDs aren't allowed.
        return z("" !== e.uid), new t(e.isAuthenticated() ? e.uid : "", n, r, i);
    }, t.prototype.checkEmpty = function(t) {
        var e = !0, n = IDBKeyRange.bound([ this.userId, Number.NEGATIVE_INFINITY ], [ this.userId, Number.POSITIVE_INFINITY ]);
        return au(t).X({
            index: "userMutationsIndex",
            range: n
        }, (function(t, n, r) {
            e = !1, r.done();
        })).next((function() {
            return e;
        }));
    }, t.prototype.addMutationBatch = function(t, e, n, r) {
        var i = this, o = su(t), u = au(t);
        // The IndexedDb implementation in Chrome (and Firefox) does not handle
        // compound indices that include auto-generated keys correctly. To ensure
        // that the index entry is added correctly in all browsers, we perform two
        // writes: The first write is used to retrieve the next auto-generated Batch
        // ID, and the second write populates the index and stores the actual
        // mutation batch.
        // See: https://bugs.chromium.org/p/chromium/issues/detail?id=701972
        // We write an empty object to obtain key
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return u.add({}).next((function(a) {
            z("number" == typeof a);
            for (var s = new ii(a, e, n, r), c = function(t, e, n) {
                var r = n.baseMutations.map((function(e) {
                    return Wi(t.fe, e);
                })), i = n.mutations.map((function(e) {
                    return Wi(t.fe, e);
                }));
                return {
                    userId: e,
                    batchId: n.batchId,
                    localWriteTimeMs: n.localWriteTime.toMillis(),
                    baseMutations: r,
                    mutations: i
                };
            }(i.serializer, i.userId, s), l = [], h = new De((function(t, e) {
                return ot(t.canonicalString(), e.canonicalString());
            })), f = 0, d = r; f < d.length; f++) {
                var p = d[f], v = Jt(i.userId, p.key.path, a);
                h = h.add(p.key.path.popLast()), l.push(u.put(c)), l.push(o.put(v, Zt));
            }
            return h.forEach((function(e) {
                l.push(i.indexManager.addToCollectionParentIndex(t, e));
            })), t.addOnCommittedListener((function() {
                i.Vn[a] = s.keys();
            })), Nt.waitFor(l).next((function() {
                return s;
            }));
        }));
    }, t.prototype.lookupMutationBatch = function(t, e) {
        var n = this;
        return au(t).get(e).next((function(t) {
            return t ? (z(t.userId === n.userId), po(n.serializer, t)) : null;
        }));
    }, 
    /**
     * Returns the document keys for the mutation batch with the given batchId.
     * For primary clients, this method returns `null` after
     * `removeMutationBatches()` has been called. Secondary clients return a
     * cached result until `removeCachedMutationKeys()` is invoked.
     */
    // PORTING NOTE: Multi-tab only.
    t.prototype.Sn = function(t, e) {
        var n = this;
        return this.Vn[e] ? Nt.resolve(this.Vn[e]) : this.lookupMutationBatch(t, e).next((function(t) {
            if (t) {
                var r = t.keys();
                return n.Vn[e] = r, r;
            }
            return null;
        }));
    }, t.prototype.getNextMutationBatchAfterBatchId = function(t, e) {
        var n = this, r = e + 1, i = IDBKeyRange.lowerBound([ this.userId, r ]), o = null;
        return au(t).X({
            index: "userMutationsIndex",
            range: i
        }, (function(t, e, i) {
            e.userId === n.userId && (z(e.batchId >= r), o = po(n.serializer, e)), i.done();
        })).next((function() {
            return o;
        }));
    }, t.prototype.getHighestUnacknowledgedBatchId = function(t) {
        var e = IDBKeyRange.upperBound([ this.userId, Number.POSITIVE_INFINITY ]), n = -1;
        return au(t).X({
            index: "userMutationsIndex",
            range: e,
            reverse: !0
        }, (function(t, e, r) {
            n = e.batchId, r.done();
        })).next((function() {
            return n;
        }));
    }, t.prototype.getAllMutationBatches = function(t) {
        var e = this, n = IDBKeyRange.bound([ this.userId, -1 ], [ this.userId, Number.POSITIVE_INFINITY ]);
        return au(t).j("userMutationsIndex", n).next((function(t) {
            return t.map((function(t) {
                return po(e.serializer, t);
            }));
        }));
    }, t.prototype.getAllMutationBatchesAffectingDocumentKey = function(t, e) {
        var n = this, r = Xt(this.userId, e.path), i = IDBKeyRange.lowerBound(r), o = [];
        // Scan the document-mutation index starting with a prefix starting with
        // the given documentKey.
                return su(t).X({
            range: i
        }, (function(r, i, u) {
            var a = r[0], s = r[1], c = r[2], l = Ht(s);
            // Only consider rows matching exactly the specific key of
            // interest. Note that because we order by path first, and we
            // order terminators before path separators, we'll encounter all
            // the index rows for documentKey contiguously. In particular, all
            // the rows for documentKey will occur before any rows for
            // documents nested in a subcollection beneath documentKey so we
            // can stop as soon as we hit any such row.
                        if (a === n.userId && e.path.isEqual(l)) 
            // Look up the mutation batch in the store.
            return au(t).get(c).next((function(t) {
                if (!t) throw U();
                z(t.userId === n.userId), o.push(po(n.serializer, t));
            }));
            u.done();
        })).next((function() {
            return o;
        }));
    }, t.prototype.getAllMutationBatchesAffectingDocumentKeys = function(t, e) {
        var n = this, r = new De(ot), i = [];
        return e.forEach((function(e) {
            var o = Xt(n.userId, e.path), u = IDBKeyRange.lowerBound(o), a = su(t).X({
                range: u
            }, (function(t, i, o) {
                var u = t[0], a = t[1], s = t[2], c = Ht(a);
                // Only consider rows matching exactly the specific key of
                // interest. Note that because we order by path first, and we
                // order terminators before path separators, we'll encounter all
                // the index rows for documentKey contiguously. In particular, all
                // the rows for documentKey will occur before any rows for
                // documents nested in a subcollection beneath documentKey so we
                // can stop as soon as we hit any such row.
                                u === n.userId && e.path.isEqual(c) ? r = r.add(s) : o.done();
            }));
            i.push(a);
        })), Nt.waitFor(i).next((function() {
            return n.Dn(t, r);
        }));
    }, t.prototype.getAllMutationBatchesAffectingQuery = function(t, e) {
        var n = this, r = e.path, i = r.length + 1, o = Xt(this.userId, r), u = IDBKeyRange.lowerBound(o), a = new De(ot);
        return su(t).X({
            range: u
        }, (function(t, e, o) {
            var u = t[0], s = t[1], c = t[2], l = Ht(s);
            u === n.userId && r.isPrefixOf(l) ? 
            // Rows with document keys more than one segment longer than the
            // query path can't be matches. For example, a query on 'rooms'
            // can't match the document /rooms/abc/messages/xyx.
            // TODO(mcg): we'll need a different scanner when we implement
            // ancestor queries.
            l.length === i && (a = a.add(c)) : o.done();
        })).next((function() {
            return n.Dn(t, a);
        }));
    }, t.prototype.Dn = function(t, e) {
        var n = this, r = [], i = [];
        // TODO(rockwood): Implement this using iterate.
        return e.forEach((function(e) {
            i.push(au(t).get(e).next((function(t) {
                if (null === t) throw U();
                z(t.userId === n.userId), r.push(po(n.serializer, t));
            })));
        })), Nt.waitFor(i).next((function() {
            return r;
        }));
    }, t.prototype.removeMutationBatch = function(t, e) {
        var n = this;
        return ru(t.ht, this.userId, e).next((function(r) {
            return t.addOnCommittedListener((function() {
                n.Cn(e.batchId);
            })), Nt.forEach(r, (function(e) {
                return n.referenceDelegate.markPotentiallyOrphaned(t, e);
            }));
        }));
    }, 
    /**
     * Clears the cached keys for a mutation batch. This method should be
     * called by secondary clients after they process mutation updates.
     *
     * Note that this method does not have to be called from primary clients as
     * the corresponding cache entries are cleared when an acknowledged or
     * rejected batch is removed from the mutation queue.
     */
    // PORTING NOTE: Multi-tab only
    t.prototype.Cn = function(t) {
        delete this.Vn[t];
    }, t.prototype.performConsistencyCheck = function(t) {
        var e = this;
        return this.checkEmpty(t).next((function(n) {
            if (!n) return Nt.resolve();
            // Verify that there are no entries in the documentMutations index if
            // the queue is empty.
                        var r = IDBKeyRange.lowerBound([ e.userId ]), i = [];
            return su(t).X({
                range: r
            }, (function(t, n, r) {
                if (t[0] === e.userId) {
                    var o = Ht(t[1]);
                    i.push(o);
                } else r.done();
            })).next((function() {
                z(0 === i.length);
            }));
        }));
    }, t.prototype.containsKey = function(t, e) {
        return uu(t, this.userId, e);
    }, 
    // PORTING NOTE: Multi-tab only (state is held in memory in other clients).
    /** Returns the mutation queue's metadata from IndexedDb. */
    t.prototype.xn = function(t) {
        var e = this;
        return cu(t).get(this.userId).next((function(t) {
            return t || {
                userId: e.userId,
                lastAcknowledgedBatchId: -1,
                lastStreamToken: ""
            };
        }));
    }, t;
}();

/**
 * @returns true if the mutation queue for the given user contains a pending
 *         mutation for the given key.
 */ function uu(t, e, n) {
    var r = Xt(e, n.path), i = r[1], o = IDBKeyRange.lowerBound(r), u = !1;
    return su(t).X({
        range: o,
        Y: !0
    }, (function(t, n, r) {
        var o = t[0], a = t[1];
 /*batchID*/        t[2], o === e && a === i && (u = !0), 
        r.done();
    })).next((function() {
        return u;
    }));
}

/** Returns true if any mutation queue contains the given document. */
/**
 * Helper to get a typed SimpleDbStore for the mutations object store.
 */ function au(t) {
    return we(t, "mutations");
}

/**
 * Helper to get a typed SimpleDbStore for the mutationQueues object store.
 */ function su(t) {
    return we(t, "documentMutations");
}

/**
 * Helper to get a typed SimpleDbStore for the mutationQueues object store.
 */ function cu(t) {
    return we(t, "mutationQueues");
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
 */ var lu = /** @class */ function() {
    function t(t) {
        this.Nn = t;
    }
    return t.prototype.next = function() {
        return this.Nn += 2, this.Nn;
    }, t.kn = function() {
        // The target cache generator must return '2' in its first call to `next()`
        // as there is no differentiation in the protocol layer between an unset
        // number and the number '0'. If we were to sent a target with target ID
        // '0', the backend would consider it unset and replace it with its own ID.
        return new t(0);
    }, t.Mn = function() {
        // Sync engine assigns target IDs for limbo document detection.
        return new t(-1);
    }, t;
}(), hu = /** @class */ function() {
    function t(t, e) {
        this.referenceDelegate = t, this.serializer = e;
    }
    // PORTING NOTE: We don't cache global metadata for the target cache, since
    // some of it (in particular `highestTargetId`) can be modified by secondary
    // tabs. We could perhaps be more granular (and e.g. still cache
    // `lastRemoteSnapshotVersion` in memory) but for simplicity we currently go
    // to IndexedDb whenever we need to read metadata. We can revisit if it turns
    // out to have a meaningful performance impact.
        return t.prototype.allocateTargetId = function(t) {
        var e = this;
        return this.$n(t).next((function(n) {
            var r = new lu(n.highestTargetId);
            return n.highestTargetId = r.next(), e.On(t, n).next((function() {
                return n.highestTargetId;
            }));
        }));
    }, t.prototype.getLastRemoteSnapshotVersion = function(t) {
        return this.$n(t).next((function(t) {
            return ct.fromTimestamp(new st(t.lastRemoteSnapshotVersion.seconds, t.lastRemoteSnapshotVersion.nanoseconds));
        }));
    }, t.prototype.getHighestSequenceNumber = function(t) {
        return this.$n(t).next((function(t) {
            return t.highestListenSequenceNumber;
        }));
    }, t.prototype.setTargetsMetadata = function(t, e, n) {
        var r = this;
        return this.$n(t).next((function(i) {
            return i.highestListenSequenceNumber = e, n && (i.lastRemoteSnapshotVersion = n.toTimestamp()), 
            e > i.highestListenSequenceNumber && (i.highestListenSequenceNumber = e), r.On(t, i);
        }));
    }, t.prototype.addTargetData = function(t, e) {
        var n = this;
        return this.Fn(t, e).next((function() {
            return n.$n(t).next((function(r) {
                return r.targetCount += 1, n.Bn(e, r), n.On(t, r);
            }));
        }));
    }, t.prototype.updateTargetData = function(t, e) {
        return this.Fn(t, e);
    }, t.prototype.removeTargetData = function(t, e) {
        var n = this;
        return this.removeMatchingKeysForTargetId(t, e.targetId).next((function() {
            return fu(t).delete(e.targetId);
        })).next((function() {
            return n.$n(t);
        })).next((function(e) {
            return z(e.targetCount > 0), e.targetCount -= 1, n.On(t, e);
        }));
    }, 
    /**
     * Drops any targets with sequence number less than or equal to the upper bound, excepting those
     * present in `activeTargetIds`. Document associations for the removed targets are also removed.
     * Returns the number of targets removed.
     */
    t.prototype.removeTargets = function(t, e, n) {
        var r = this, i = 0, o = [];
        return fu(t).X((function(u, a) {
            var s = vo(a);
            s.sequenceNumber <= e && null === n.get(s.targetId) && (i++, o.push(r.removeTargetData(t, s)));
        })).next((function() {
            return Nt.waitFor(o);
        })).next((function() {
            return i;
        }));
    }, 
    /**
     * Call provided function with each `TargetData` that we have cached.
     */
    t.prototype.forEachTarget = function(t, e) {
        return fu(t).X((function(t, n) {
            var r = vo(n);
            e(r);
        }));
    }, t.prototype.$n = function(t) {
        return du(t).get("targetGlobalKey").next((function(t) {
            return z(null !== t), t;
        }));
    }, t.prototype.On = function(t, e) {
        return du(t).put("targetGlobalKey", e);
    }, t.prototype.Fn = function(t, e) {
        return fu(t).put(mo(this.serializer, e));
    }, 
    /**
     * In-place updates the provided metadata to account for values in the given
     * TargetData. Saving is done separately. Returns true if there were any
     * changes to the metadata.
     */
    t.prototype.Bn = function(t, e) {
        var n = !1;
        return t.targetId > e.highestTargetId && (e.highestTargetId = t.targetId, n = !0), 
        t.sequenceNumber > e.highestListenSequenceNumber && (e.highestListenSequenceNumber = t.sequenceNumber, 
        n = !0), n;
    }, t.prototype.getTargetCount = function(t) {
        return this.$n(t).next((function(t) {
            return t.targetCount;
        }));
    }, t.prototype.getTargetData = function(t, e) {
        // Iterating by the canonicalId may yield more than one result because
        // canonicalId values are not required to be unique per target. This query
        // depends on the queryTargets index to be efficient.
        var n = Bn(e), r = IDBKeyRange.bound([ n, Number.NEGATIVE_INFINITY ], [ n, Number.POSITIVE_INFINITY ]), i = null;
        return fu(t).X({
            range: r,
            index: "queryTargetsIndex"
        }, (function(t, n, r) {
            var o = vo(n);
            // After finding a potential match, check that the target is
            // actually equal to the requested target.
                        Un(e, o.target) && (i = o, r.done());
        })).next((function() {
            return i;
        }));
    }, t.prototype.addMatchingKeys = function(t, e, n) {
        var r = this, i = [], o = pu(t);
        // PORTING NOTE: The reverse index (documentsTargets) is maintained by
        // IndexedDb.
                return e.forEach((function(e) {
            var u = Kt(e.path);
            i.push(o.put({
                targetId: n,
                path: u
            })), i.push(r.referenceDelegate.addReference(t, n, e));
        })), Nt.waitFor(i);
    }, t.prototype.removeMatchingKeys = function(t, e, n) {
        var r = this, i = pu(t);
        // PORTING NOTE: The reverse index (documentsTargets) is maintained by
        // IndexedDb.
                return Nt.forEach(e, (function(e) {
            var o = Kt(e.path);
            return Nt.waitFor([ i.delete([ n, o ]), r.referenceDelegate.removeReference(t, n, e) ]);
        }));
    }, t.prototype.removeMatchingKeysForTargetId = function(t, e) {
        var n = pu(t), r = IDBKeyRange.bound([ e ], [ e + 1 ], 
        /*lowerOpen=*/ !1, 
        /*upperOpen=*/ !0);
        return n.delete(r);
    }, t.prototype.getMatchingKeysForTargetId = function(t, e) {
        var n = IDBKeyRange.bound([ e ], [ e + 1 ], 
        /*lowerOpen=*/ !1, 
        /*upperOpen=*/ !0), r = pu(t), i = Ir();
        return r.X({
            range: n,
            Y: !0
        }, (function(t, e, n) {
            var r = Ht(t[1]), o = new pt(r);
            i = i.add(o);
        })).next((function() {
            return i;
        }));
    }, t.prototype.containsKey = function(t, e) {
        var n = Kt(e.path), r = IDBKeyRange.bound([ n ], [ at(n) ], 
        /*lowerOpen=*/ !1, 
        /*upperOpen=*/ !0), i = 0;
        return pu(t).X({
            index: "documentTargetsIndex",
            Y: !0,
            range: r
        }, (function(t, e, n) {
            var r = t[0];
            t[1], 
            // Having a sentinel row for a document does not count as containing that document;
            // For the target cache, containing the document means the document is part of some
            // target.
            0 !== r && (i++, n.done());
        })).next((function() {
            return i > 0;
        }));
    }, 
    /**
     * Looks up a TargetData entry by target ID.
     *
     * @param targetId - The target ID of the TargetData entry to look up.
     * @returns The cached TargetData entry, or null if the cache has no entry for
     * the target.
     */
    // PORTING NOTE: Multi-tab only.
    t.prototype.le = function(t, e) {
        return fu(t).get(e).next((function(t) {
            return t ? vo(t) : null;
        }));
    }, t;
}();

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
 * Helper to get a typed SimpleDbStore for the queries object store.
 */
function fu(t) {
    return we(t, "targets");
}

/**
 * Helper to get a typed SimpleDbStore for the target globals object store.
 */ function du(t) {
    return we(t, "targetGlobal");
}

/**
 * Helper to get a typed SimpleDbStore for the document target object store.
 */ function pu(t) {
    return we(t, "targetDocuments");
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
 */ function vu(t, e) {
    var n = t[0], r = t[1], i = e[0], o = e[1], u = ot(n, i);
    return 0 === u ? ot(r, o) : u;
}

/**
 * Used to calculate the nth sequence number. Keeps a rolling buffer of the
 * lowest n values passed to `addElement`, and finally reports the largest of
 * them in `maxValue`.
 */ var mu = /** @class */ function() {
    function t(t) {
        this.Ln = t, this.buffer = new De(vu), this.qn = 0;
    }
    return t.prototype.Un = function() {
        return ++this.qn;
    }, t.prototype.Kn = function(t) {
        var e = [ t, this.Un() ];
        if (this.buffer.size < this.Ln) this.buffer = this.buffer.add(e); else {
            var n = this.buffer.last();
            vu(e, n) < 0 && (this.buffer = this.buffer.delete(n).add(e));
        }
    }, Object.defineProperty(t.prototype, "maxValue", {
        get: function() {
            // Guaranteed to be non-empty. If we decide we are not collecting any
            // sequence numbers, nthSequenceNumber below short-circuits. If we have
            // decided that we are collecting n sequence numbers, it's because n is some
            // percentage of the existing sequence numbers. That means we should never
            // be in a situation where we are collecting sequence numbers but don't
            // actually have any.
            return this.buffer.last()[0];
        },
        enumerable: !1,
        configurable: !0
    }), t;
}(), yu = /** @class */ function() {
    function t(t, e, n) {
        this.garbageCollector = t, this.asyncQueue = e, this.localStore = n, this.Gn = null;
    }
    return t.prototype.start = function() {
        -1 !== this.garbageCollector.params.cacheSizeCollectionThreshold && this.Qn(6e4);
    }, t.prototype.stop = function() {
        this.Gn && (this.Gn.cancel(), this.Gn = null);
    }, Object.defineProperty(t.prototype, "started", {
        get: function() {
            return null !== this.Gn;
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.Qn = function(t) {
        var r = this;
        M("LruGarbageCollector", "Garbage collection scheduled in ".concat(t, "ms")), this.Gn = this.asyncQueue.enqueueAfterDelay("lru_garbage_collection" /* TimerId.LruGarbageCollection */ , t, (function() {
            return e(r, void 0, void 0, (function() {
                var t;
                return n(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        this.Gn = null, e.label = 1;

                      case 1:
                        return e.trys.push([ 1, 3, , 7 ]), [ 4 /*yield*/ , this.localStore.collectGarbage(this.garbageCollector) ];

                      case 2:
                        return e.sent(), [ 3 /*break*/ , 7 ];

                      case 3:
                        return Pt(t = e.sent()) ? (M("LruGarbageCollector", "Ignoring IndexedDB error during garbage collection: ", t), 
                        [ 3 /*break*/ , 6 ]) : [ 3 /*break*/ , 4 ];

                      case 4:
                        return [ 4 /*yield*/ , xt(t) ];

                      case 5:
                        e.sent(), e.label = 6;

                      case 6:
                        return [ 3 /*break*/ , 7 ];

                      case 7:
                        return [ 4 /*yield*/ , this.Qn(3e5) ];

                      case 8:
                        return e.sent(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }));
    }, t;
}(), gu = /** @class */ function() {
    function t(t, e) {
        this.jn = t, this.params = e;
    }
    return t.prototype.calculateTargetCount = function(t, e) {
        return this.jn.zn(t).next((function(t) {
            return Math.floor(e / 100 * t);
        }));
    }, t.prototype.nthSequenceNumber = function(t, e) {
        var n = this;
        if (0 === e) return Nt.resolve(Ut.ct);
        var r = new mu(e);
        return this.jn.forEachTarget(t, (function(t) {
            return r.Kn(t.sequenceNumber);
        })).next((function() {
            return n.jn.Wn(t, (function(t) {
                return r.Kn(t);
            }));
        })).next((function() {
            return r.maxValue;
        }));
    }, t.prototype.removeTargets = function(t, e, n) {
        return this.jn.removeTargets(t, e, n);
    }, t.prototype.removeOrphanedDocuments = function(t, e) {
        return this.jn.removeOrphanedDocuments(t, e);
    }, t.prototype.collect = function(t, e) {
        var n = this;
        return -1 === this.params.cacheSizeCollectionThreshold ? (M("LruGarbageCollector", "Garbage collection skipped; disabled"), 
        Nt.resolve(eu)) : this.getCacheSize(t).next((function(r) {
            return r < n.params.cacheSizeCollectionThreshold ? (M("LruGarbageCollector", "Garbage collection skipped; Cache size ".concat(r, " is lower than threshold ").concat(n.params.cacheSizeCollectionThreshold)), 
            eu) : n.Hn(t, e);
        }));
    }, t.prototype.getCacheSize = function(t) {
        return this.jn.getCacheSize(t);
    }, t.prototype.Hn = function(t, e) {
        var n, r, i, o, u, a, s, c = this, l = Date.now();
        return this.calculateTargetCount(t, this.params.percentileToCollect).next((function(e) {
            // Cap at the configured max
            return e > c.params.maximumSequenceNumbersToCollect ? (M("LruGarbageCollector", "Capping sequence numbers to collect down to the maximum of ".concat(c.params.maximumSequenceNumbersToCollect, " from ").concat(e)), 
            r = c.params.maximumSequenceNumbersToCollect) : r = e, o = Date.now(), c.nthSequenceNumber(t, r);
        })).next((function(r) {
            return n = r, u = Date.now(), c.removeTargets(t, n, e);
        })).next((function(e) {
            return i = e, a = Date.now(), c.removeOrphanedDocuments(t, n);
        })).next((function(t) {
            return s = Date.now(), R() <= h.DEBUG && M("LruGarbageCollector", "LRU Garbage Collection\n\tCounted targets in ".concat(o - l, "ms\n\tDetermined least recently used ").concat(r, " in ") + (u - o) + "ms\n" + "\tRemoved ".concat(i, " targets in ") + (a - u) + "ms\n" + "\tRemoved ".concat(t, " documents in ") + (s - a) + "ms\n" + "Total Duration: ".concat(s - l, "ms")), 
            Nt.resolve({
                didRun: !0,
                sequenceNumbersCollected: r,
                targetsRemoved: i,
                documentsRemoved: t
            });
        }));
    }, t;
}();

/**
 * This class is responsible for the scheduling of LRU garbage collection. It handles checking
 * whether or not GC is enabled, as well as which delay to use before the next run.
 */ function wu(t, e) {
    return new gu(t, e);
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
/** Provides LRU functionality for IndexedDB persistence. */ var bu = /** @class */ function() {
    function t(t, e) {
        this.db = t, this.garbageCollector = wu(this, e);
    }
    return t.prototype.zn = function(t) {
        var e = this.Jn(t);
        return this.db.getTargetCache().getTargetCount(t).next((function(t) {
            return e.next((function(e) {
                return t + e;
            }));
        }));
    }, t.prototype.Jn = function(t) {
        var e = 0;
        return this.Wn(t, (function(t) {
            e++;
        })).next((function() {
            return e;
        }));
    }, t.prototype.forEachTarget = function(t, e) {
        return this.db.getTargetCache().forEachTarget(t, e);
    }, t.prototype.Wn = function(t, e) {
        return this.Yn(t, (function(t, n) {
            return e(n);
        }));
    }, t.prototype.addReference = function(t, e, n) {
        return Iu(t, n);
    }, t.prototype.removeReference = function(t, e, n) {
        return Iu(t, n);
    }, t.prototype.removeTargets = function(t, e, n) {
        return this.db.getTargetCache().removeTargets(t, e, n);
    }, t.prototype.markPotentiallyOrphaned = function(t, e) {
        return Iu(t, e);
    }, 
    /**
     * Returns true if anything would prevent this document from being garbage
     * collected, given that the document in question is not present in any
     * targets and has a sequence number less than or equal to the upper bound for
     * the collection run.
     */
    t.prototype.Xn = function(t, e) {
        return function(t, e) {
            var n = !1;
            return cu(t).Z((function(r) {
                return uu(t, r, e).next((function(t) {
                    return t && (n = !0), Nt.resolve(!t);
                }));
            })).next((function() {
                return n;
            }));
        }(t, e);
    }, t.prototype.removeOrphanedDocuments = function(t, e) {
        var n = this, r = this.db.getRemoteDocumentCache().newChangeBuffer(), i = [], o = 0;
        return this.Yn(t, (function(u, a) {
            if (a <= e) {
                var s = n.Xn(t, u).next((function(e) {
                    if (!e) 
                    // Our size accounting requires us to read all documents before
                    // removing them.
                    return o++, r.getEntry(t, u).next((function() {
                        return r.removeEntry(u, ct.min()), pu(t).delete([ 0, Kt(u.path) ]);
                    }));
                }));
                i.push(s);
            }
        })).next((function() {
            return Nt.waitFor(i);
        })).next((function() {
            return r.apply(t);
        })).next((function() {
            return o;
        }));
    }, t.prototype.removeTarget = function(t, e) {
        var n = e.withSequenceNumber(t.currentSequenceNumber);
        return this.db.getTargetCache().updateTargetData(t, n);
    }, t.prototype.updateLimboDocument = function(t, e) {
        return Iu(t, e);
    }, 
    /**
     * Call provided function for each document in the cache that is 'orphaned'. Orphaned
     * means not a part of any target, so the only entry in the target-document index for
     * that document will be the sentinel row (targetId 0), which will also have the sequence
     * number for the last time the document was accessed.
     */
    t.prototype.Yn = function(t, e) {
        var n, r = pu(t), i = Ut.ct;
        return r.X({
            index: "documentTargetsIndex"
        }, (function(t, r) {
            var o = t[0];
            t[1];
            var u = r.path, a = r.sequenceNumber;
            0 === o ? (
            // if nextToReport is valid, report it, this is a new key so the
            // last one must not be a member of any targets.
            i !== Ut.ct && e(new pt(Ht(n)), i), 
            // set nextToReport to be this sequence number. It's the next one we
            // might report, if we don't find any targets for this document.
            // Note that the sequence number must be defined when the targetId
            // is 0.
            i = a, n = u) : 
            // set nextToReport to be invalid, we know we don't need to report
            // this one since we found a target for it.
            i = Ut.ct;
        })).next((function() {
            // Since we report sequence numbers after getting to the next key, we
            // need to check if the last key we iterated over was an orphaned
            // document and report it.
            i !== Ut.ct && e(new pt(Ht(n)), i);
        }));
    }, t.prototype.getCacheSize = function(t) {
        return this.db.getRemoteDocumentCache().getSize(t);
    }, t;
}();

function Iu(t, e) {
    return pu(t).put(
    /**
 * @returns A value suitable for writing a sentinel row in the target-document
 * store.
 */
    function(t, e) {
        return {
            targetId: 0,
            path: Kt(t.path),
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
 */ var Eu = /** @class */ function() {
    function t() {
        // A mapping of document key to the new cache entry that should be written.
        this.changes = new lr((function(t) {
            return t.toString();
        }), (function(t, e) {
            return t.isEqual(e);
        })), this.changesApplied = !1
        /**
     * Buffers a `RemoteDocumentCache.addEntry()` call.
     *
     * You can only modify documents that have already been retrieved via
     * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
     */;
    }
    return t.prototype.addEntry = function(t) {
        this.assertNotApplied(), this.changes.set(t.key, t);
    }, 
    /**
     * Buffers a `RemoteDocumentCache.removeEntry()` call.
     *
     * You can only remove documents that have already been retrieved via
     * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
     */
    t.prototype.removeEntry = function(t, e) {
        this.assertNotApplied(), this.changes.set(t, dn.newInvalidDocument(t).setReadTime(e));
    }, 
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
     */
    t.prototype.getEntry = function(t, e) {
        this.assertNotApplied();
        var n = this.changes.get(e);
        return void 0 !== n ? Nt.resolve(n) : this.getFromCache(t, e);
    }, 
    /**
     * Looks up several entries in the cache, forwarding to
     * `RemoteDocumentCache.getEntry()`.
     *
     * @param transaction - The transaction in which to perform any persistence
     *     operations.
     * @param documentKeys - The keys of the entries to look up.
     * @returns A map of cached documents, indexed by key. If an entry cannot be
     *     found, the corresponding key will be mapped to an invalid document.
     */
    t.prototype.getEntries = function(t, e) {
        return this.getAllFromCache(t, e);
    }, 
    /**
     * Applies buffered changes to the underlying RemoteDocumentCache, using
     * the provided transaction.
     */
    t.prototype.apply = function(t) {
        return this.assertNotApplied(), this.changesApplied = !0, this.applyChanges(t);
    }, 
    /** Helper to assert this.changes is not null  */ t.prototype.assertNotApplied = function() {}, 
    t;
}(), Tu = /** @class */ function() {
    function t(t) {
        this.serializer = t;
    }
    return t.prototype.setIndexManager = function(t) {
        this.indexManager = t;
    }, 
    /**
     * Adds the supplied entries to the cache.
     *
     * All calls of `addEntry` are required to go through the RemoteDocumentChangeBuffer
     * returned by `newChangeBuffer()` to ensure proper accounting of metadata.
     */
    t.prototype.addEntry = function(t, e, n) {
        return Cu(t).put(n);
    }, 
    /**
     * Removes a document from the cache.
     *
     * All calls of `removeEntry`  are required to go through the RemoteDocumentChangeBuffer
     * returned by `newChangeBuffer()` to ensure proper accounting of metadata.
     */
    t.prototype.removeEntry = function(t, e, n) {
        return Cu(t).delete(
        /**
 * Returns a key that can be used for document lookups via the primary key of
 * the DbRemoteDocument object store.
 */
        function(t, e) {
            var n = t.path.toArray();
            return [ 
            /* prefix path */ n.slice(0, n.length - 2), 
            /* collection id */ n[n.length - 2], lo(e), 
            /* document id */ n[n.length - 1] ];
        }(e, n));
    }, 
    /**
     * Updates the current cache size.
     *
     * Callers to `addEntry()` and `removeEntry()` *must* call this afterwards to update the
     * cache's metadata.
     */
    t.prototype.updateMetadata = function(t, e) {
        var n = this;
        return this.getMetadata(t).next((function(r) {
            return r.byteSize += e, n.Zn(t, r);
        }));
    }, t.prototype.getEntry = function(t, e) {
        var n = this, r = dn.newInvalidDocument(e);
        return Cu(t).X({
            index: "documentKeyIndex",
            range: IDBKeyRange.only(xu(e))
        }, (function(t, i) {
            r = n.ts(e, i);
        })).next((function() {
            return r;
        }));
    }, 
    /**
     * Looks up an entry in the cache.
     *
     * @param documentKey - The key of the entry to look up.
     * @returns The cached document entry and its size.
     */
    t.prototype.es = function(t, e) {
        var n = this, r = {
            size: 0,
            document: dn.newInvalidDocument(e)
        };
        return Cu(t).X({
            index: "documentKeyIndex",
            range: IDBKeyRange.only(xu(e))
        }, (function(t, i) {
            r = {
                document: n.ts(e, i),
                size: iu(i)
            };
        })).next((function() {
            return r;
        }));
    }, t.prototype.getEntries = function(t, e) {
        var n = this, r = fr();
        return this.ns(t, e, (function(t, e) {
            var i = n.ts(t, e);
            r = r.insert(t, i);
        })).next((function() {
            return r;
        }));
    }, 
    /**
     * Looks up several entries in the cache.
     *
     * @param documentKeys - The set of keys entries to look up.
     * @returns A map of documents indexed by key and a map of sizes indexed by
     *     key (zero if the document does not exist).
     */
    t.prototype.ss = function(t, e) {
        var n = this, r = fr(), i = new Te(pt.comparator);
        return this.ns(t, e, (function(t, e) {
            var o = n.ts(t, e);
            r = r.insert(t, o), i = i.insert(t, iu(e));
        })).next((function() {
            return {
                documents: r,
                rs: i
            };
        }));
    }, t.prototype.ns = function(t, e, n) {
        if (e.isEmpty()) return Nt.resolve();
        var i = new De(Au);
        e.forEach((function(t) {
            return i = i.add(t);
        }));
        var o = IDBKeyRange.bound(xu(i.first()), xu(i.last())), u = i.getIterator(), a = u.getNext();
        return Cu(t).X({
            index: "documentKeyIndex",
            range: o
        }, (function(t, e, i) {
            // Go through keys not found in cache.
            for (var o = pt.fromSegments(r(r([], e.prefixPath, !0), [ e.collectionGroup, e.documentId ], !1)); a && Au(a, o) < 0; ) n(a, null), 
            a = u.getNext();
            a && a.isEqual(o) && (
            // Key found in cache.
            n(a, e), a = u.hasNext() ? u.getNext() : null), 
            // Skip to the next key (if there is one).
            a ? i.G(xu(a)) : i.done();
        })).next((function() {
            // The rest of the keys are not in the cache. One case where `iterate`
            // above won't go through them is when the cache is empty.
            for (;a; ) n(a, null), a = u.hasNext() ? u.getNext() : null;
        }));
    }, t.prototype.getDocumentsMatchingQuery = function(t, e, n, r) {
        var i = this, o = e.path, u = [ o.popLast().toArray(), o.lastSegment(), lo(n.readTime), n.documentKey.path.isEmpty() ? "" : n.documentKey.path.lastSegment() ], a = [ o.popLast().toArray(), o.lastSegment(), [ Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER ], "" ];
        return Cu(t).j(IDBKeyRange.bound(u, a, !0)).next((function(t) {
            for (var n = fr(), o = 0, u = t; o < u.length; o++) {
                var a = u[o], s = i.ts(pt.fromSegments(a.prefixPath.concat(a.collectionGroup, a.documentId)), a);
                s.isFoundDocument() && (ur(e, s) || r.has(s.key)) && (
                // Either the document matches the given query, or it is mutated.
                n = n.insert(s.key, s));
            }
            return n;
        }));
    }, t.prototype.getAllFromCollectionGroup = function(t, e, n, r) {
        var i = this, o = fr(), u = Nu(e, n), a = Nu(e, St.max());
        return Cu(t).X({
            index: "collectionGroupIndex",
            range: IDBKeyRange.bound(u, a, !0)
        }, (function(t, e, n) {
            var u = i.ts(pt.fromSegments(e.prefixPath.concat(e.collectionGroup, e.documentId)), e);
            (o = o.insert(u.key, u)).size === r && n.done();
        })).next((function() {
            return o;
        }));
    }, t.prototype.newChangeBuffer = function(t) {
        return new _u(this, !!t && t.trackRemovals);
    }, t.prototype.getSize = function(t) {
        return this.getMetadata(t).next((function(t) {
            return t.byteSize;
        }));
    }, t.prototype.getMetadata = function(t) {
        return Du(t).get("remoteDocumentGlobalKey").next((function(t) {
            return z(!!t), t;
        }));
    }, t.prototype.Zn = function(t, e) {
        return Du(t).put("remoteDocumentGlobalKey", e);
    }, 
    /**
     * Decodes `dbRemoteDoc` and returns the document (or an invalid document if
     * the document corresponds to the format used for sentinel deletes).
     */
    t.prototype.ts = function(t, e) {
        if (e) {
            var n = 
            /** Decodes a remote document from storage locally to a Document. */ function(t, e) {
                var n;
                if (e.document) n = Qi(t.fe, e.document, !!e.hasCommittedMutations); else if (e.noDocument) {
                    var r = pt.fromSegments(e.noDocument.path), i = fo(e.noDocument.readTime);
                    n = dn.newNoDocument(r, i), e.hasCommittedMutations && n.setHasCommittedMutations();
                } else {
                    if (!e.unknownDocument) return U();
                    var o = pt.fromSegments(e.unknownDocument.path), u = fo(e.unknownDocument.version);
                    n = dn.newUnknownDocument(o, u);
                }
                return e.readTime && n.setReadTime(function(t) {
                    var e = new st(t[0], t[1]);
                    return ct.fromTimestamp(e);
                }(e.readTime)), n;
            }(this.serializer, e);
            // Whether the document is a sentinel removal and should only be used in the
            // `getNewDocumentChanges()`
                        if (!n.isNoDocument() || !n.version.isEqual(ct.min())) return n;
        }
        return dn.newInvalidDocument(t);
    }, t;
}();

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
 */
/** Creates a new IndexedDbRemoteDocumentCache. */ function Su(t) {
    return new Tu(t);
}

/**
 * Handles the details of adding and updating documents in the IndexedDbRemoteDocumentCache.
 *
 * Unlike the MemoryRemoteDocumentChangeBuffer, the IndexedDb implementation computes the size
 * delta for all submitted changes. This avoids having to re-read all documents from IndexedDb
 * when we apply the changes.
 */ var _u = /** @class */ function(e) {
    /**
     * @param documentCache - The IndexedDbRemoteDocumentCache to apply the changes to.
     * @param trackRemovals - Whether to create sentinel deletes that can be tracked by
     * `getNewDocumentChanges()`.
     */
    function n(t, n) {
        var r = this;
        return (r = e.call(this) || this).os = t, r.trackRemovals = n, 
        // A map of document sizes and read times prior to applying the changes in
        // this buffer.
        r.us = new lr((function(t) {
            return t.toString();
        }), (function(t, e) {
            return t.isEqual(e);
        })), r;
    }
    return t(n, e), n.prototype.applyChanges = function(t) {
        var e = this, n = [], r = 0, i = new De((function(t, e) {
            return ot(t.canonicalString(), e.canonicalString());
        }));
        return this.changes.forEach((function(o, u) {
            var a = e.us.get(o);
            if (n.push(e.os.removeEntry(t, o, a.readTime)), u.isValidDocument()) {
                var s = co(e.os.serializer, u);
                i = i.add(o.path.popLast());
                var c = iu(s);
                r += c - a.size, n.push(e.os.addEntry(t, o, s));
            } else if (r -= a.size, e.trackRemovals) {
                // In order to track removals, we store a "sentinel delete" in the
                // RemoteDocumentCache. This entry is represented by a NoDocument
                // with a version of 0 and ignored by `maybeDecodeDocument()` but
                // preserved in `getNewDocumentChanges()`.
                var l = co(e.os.serializer, u.convertToNoDocument(ct.min()));
                n.push(e.os.addEntry(t, o, l));
            }
        })), i.forEach((function(r) {
            n.push(e.os.indexManager.addToCollectionParentIndex(t, r));
        })), n.push(this.os.updateMetadata(t, r)), Nt.waitFor(n);
    }, n.prototype.getFromCache = function(t, e) {
        var n = this;
        // Record the size of everything we load from the cache so we can compute a delta later.
                return this.os.es(t, e).next((function(t) {
            return n.us.set(e, {
                size: t.size,
                readTime: t.document.readTime
            }), t.document;
        }));
    }, n.prototype.getAllFromCache = function(t, e) {
        var n = this;
        // Record the size of everything we load from the cache so we can compute
        // a delta later.
                return this.os.ss(t, e).next((function(t) {
            var e = t.documents;
            // Note: `getAllFromCache` returns two maps instead of a single map from
            // keys to `DocumentSizeEntry`s. This is to allow returning the
            // `MutableDocumentMap` directly, without a conversion.
            return t.rs.forEach((function(t, r) {
                n.us.set(t, {
                    size: r,
                    readTime: e.get(t).readTime
                });
            })), e;
        }));
    }, n;
}(Eu);

function Du(t) {
    return we(t, "remoteDocumentGlobal");
}

/**
 * Helper to get a typed SimpleDbStore for the remoteDocuments object store.
 */ function Cu(t) {
    return we(t, "remoteDocumentsV14");
}

/**
 * Returns a key that can be used for document lookups on the
 * `DbRemoteDocumentDocumentKeyIndex` index.
 */ function xu(t) {
    var e = t.path.toArray();
    return [ 
    /* prefix path */ e.slice(0, e.length - 2), 
    /* collection id */ e[e.length - 2], 
    /* document id */ e[e.length - 1] ];
}

function Nu(t, e) {
    var n = e.documentKey.path.toArray();
    return [ 
    /* collection id */ t, lo(e.readTime), 
    /* prefix path */ n.slice(0, n.length - 2), 
    /* document id */ n.length > 0 ? n[n.length - 1] : "" ];
}

/**
 * Comparator that compares document keys according to the primary key sorting
 * used by the `DbRemoteDocumentDocument` store (by prefix path, collection id
 * and then document ID).
 *
 * Visible for testing.
 */ function Au(t, e) {
    for (var n = t.path.toArray(), r = e.path.toArray(), i = 0, o = 0
    // The ordering is based on https://chromium.googlesource.com/chromium/blink/+/fe5c21fef94dae71c1c3344775b8d8a7f7e6d9ec/Source/modules/indexeddb/IDBKey.cpp#74
    ; o < n.length - 2 && o < r.length - 2; ++o) if (i = ot(n[o], r[o])) return i;
    return (i = ot(n.length, r.length)) || ((i = ot(n[n.length - 2], r[r.length - 2])) || ot(n[n.length - 1], r[r.length - 1]));
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
 */ var ku = function(t, 
/**
     * The fields that are locally mutated by patch mutations.
     *
     * If the overlayed	document is from set or delete mutations, this is `null`.
     * If there is no overlay (mutation) for the document, this is an empty `FieldMask`.
     */
e) {
    this.overlayedDocument = t, this.mutatedFields = e;
}, Ou = /** @class */ function() {
    function t(t, e, n, r) {
        this.remoteDocumentCache = t, this.mutationQueue = e, this.documentOverlayCache = n, 
        this.indexManager = r
        /**
     * Get the local view of the document identified by `key`.
     *
     * @returns Local view of the document or null if we don't have any cached
     * state for it.
     */;
    }
    return t.prototype.getDocument = function(t, e) {
        var n = this, r = null;
        return this.documentOverlayCache.getOverlay(t, e).next((function(i) {
            return r = i, n.remoteDocumentCache.getEntry(t, e);
        })).next((function(t) {
            return null !== r && Qr(r.mutation, t, Ne.empty(), st.now()), t;
        }));
    }, 
    /**
     * Gets the local view of the documents identified by `keys`.
     *
     * If we don't have cached state for a document in `keys`, a NoDocument will
     * be stored for that key in the resulting set.
     */
    t.prototype.getDocuments = function(t, e) {
        var n = this;
        return this.remoteDocumentCache.getEntries(t, e).next((function(e) {
            return n.getLocalViewOfDocuments(t, e, Ir()).next((function() {
                return e;
            }));
        }));
    }, 
    /**
     * Similar to `getDocuments`, but creates the local view from the given
     * `baseDocs` without retrieving documents from the local store.
     *
     * @param transaction - The transaction this operation is scoped to.
     * @param docs - The documents to apply local mutations to get the local views.
     * @param existenceStateChanged - The set of document keys whose existence state
     *   is changed. This is useful to determine if some documents overlay needs
     *   to be recalculated.
     */
    t.prototype.getLocalViewOfDocuments = function(t, e, n) {
        var r = this;
        void 0 === n && (n = Ir());
        var i = mr();
        return this.populateOverlays(t, i, e).next((function() {
            return r.computeViews(t, e, i, n).next((function(t) {
                var e = pr();
                return t.forEach((function(t, n) {
                    e = e.insert(t, n.overlayedDocument);
                })), e;
            }));
        }));
    }, 
    /**
     * Gets the overlayed documents for the given document map, which will include
     * the local view of those documents and a `FieldMask` indicating which fields
     * are mutated locally, `null` if overlay is a Set or Delete mutation.
     */
    t.prototype.getOverlayedDocuments = function(t, e) {
        var n = this, r = mr();
        return this.populateOverlays(t, r, e).next((function() {
            return n.computeViews(t, e, r, Ir());
        }));
    }, 
    /**
     * Fetches the overlays for {@code docs} and adds them to provided overlay map
     * if the map does not already contain an entry for the given document key.
     */
    t.prototype.populateOverlays = function(t, e, n) {
        var r = [];
        return n.forEach((function(t) {
            e.has(t) || r.push(t);
        })), this.documentOverlayCache.getOverlays(t, r).next((function(t) {
            t.forEach((function(t, n) {
                e.set(t, n);
            }));
        }));
    }, 
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
     */
    t.prototype.computeViews = function(t, e, n, r) {
        var i = fr(), o = gr(), u = gr();
        return e.forEach((function(t, e) {
            var u = n.get(e.key);
            // Recalculate an overlay if the document's existence state changed due to
            // a remote event *and* the overlay is a PatchMutation. This is because
            // document existence state can change if some patch mutation's
            // preconditions are met.
            // NOTE: we recalculate when `overlay` is undefined as well, because there
            // might be a patch mutation whose precondition does not match before the
            // change (hence overlay is undefined), but would now match.
                        r.has(e.key) && (void 0 === u || u.mutation instanceof Xr) ? i = i.insert(e.key, e) : void 0 !== u ? (o.set(e.key, u.mutation.getFieldMask()), 
            Qr(u.mutation, e, u.mutation.getFieldMask(), st.now())) : 
            // no overlay exists
            // Using EMPTY to indicate there is no overlay for the document.
            o.set(e.key, Ne.empty());
        })), this.recalculateAndSaveOverlays(t, i).next((function(t) {
            return t.forEach((function(t, e) {
                return o.set(t, e);
            })), e.forEach((function(t, e) {
                var n;
                return u.set(t, new ku(e, null !== (n = o.get(t)) && void 0 !== n ? n : null));
            })), u;
        }));
    }, t.prototype.recalculateAndSaveOverlays = function(t, e) {
        var n = this, r = gr(), i = new Te((function(t, e) {
            return t - e;
        })), o = Ir();
        return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t, e).next((function(t) {
            for (var n = function(t) {
                t.keys().forEach((function(n) {
                    var o = e.get(n);
                    if (null !== o) {
                        var u = r.get(n) || Ne.empty();
                        u = t.applyToLocalView(o, u), r.set(n, u);
                        var a = (i.get(t.batchId) || Ir()).add(n);
                        i = i.insert(t.batchId, a);
                    }
                }));
            }, o = 0, u = t; o < u.length; o++) {
                n(u[o]);
            }
        })).next((function() {
            // Iterate in descending order of batch IDs, and skip documents that are
            // already saved.
            for (var u = [], a = i.getReverseIterator(), s = function() {
                var i = a.getNext(), s = i.key, c = i.value, l = yr();
                c.forEach((function(t) {
                    if (!o.has(t)) {
                        var n = jr(e.get(t), r.get(t));
                        null !== n && l.set(t, n), o = o.add(t);
                    }
                })), u.push(n.documentOverlayCache.saveOverlays(t, s, l));
            }; a.hasNext(); ) s();
            return Nt.waitFor(u);
        })).next((function() {
            return r;
        }));
    }, 
    /**
     * Recalculates overlays by reading the documents from remote document cache
     * first, and saves them after they are calculated.
     */
    t.prototype.recalculateAndSaveOverlaysForDocumentKeys = function(t, e) {
        var n = this;
        return this.remoteDocumentCache.getEntries(t, e).next((function(e) {
            return n.recalculateAndSaveOverlays(t, e);
        }));
    }, 
    /**
     * Performs a query against the local view of all documents.
     *
     * @param transaction - The persistence transaction.
     * @param query - The query to match documents against.
     * @param offset - Read time and key to start scanning by (exclusive).
     */
    t.prototype.getDocumentsMatchingQuery = function(t, e, n) {
        /**
 * Returns whether the query matches a single document by path (rather than a
 * collection).
 */
        return function(t) {
            return pt.isDocumentKey(t.path) && null === t.collectionGroup && 0 === t.filters.length;
        }(e) ? this.getDocumentsMatchingDocumentQuery(t, e.path) : Zn(e) ? this.getDocumentsMatchingCollectionGroupQuery(t, e, n) : this.getDocumentsMatchingCollectionQuery(t, e, n);
    }, 
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
     */
    t.prototype.getNextDocuments = function(t, e, n, r) {
        var i = this;
        return this.remoteDocumentCache.getAllFromCollectionGroup(t, e, n, r).next((function(o) {
            var u = r - o.size > 0 ? i.documentOverlayCache.getOverlaysForCollectionGroup(t, e, n.largestBatchId, r - o.size) : Nt.resolve(mr()), a = -1, s = o;
            // The callsite will use the largest batch ID together with the latest read time to create
            // a new index offset. Since we only process batch IDs if all remote documents have been read,
            // no overlay will increase the overall read time. This is why we only need to special case
            // the batch id.
                        return u.next((function(e) {
                return Nt.forEach(e, (function(e, n) {
                    return a < n.largestBatchId && (a = n.largestBatchId), o.get(e) ? Nt.resolve() : i.remoteDocumentCache.getEntry(t, e).next((function(t) {
                        s = s.insert(e, t);
                    }));
                })).next((function() {
                    return i.populateOverlays(t, e, o);
                })).next((function() {
                    return i.computeViews(t, s, e, Ir());
                })).next((function(t) {
                    return {
                        batchId: a,
                        changes: vr(t)
                    };
                }));
            }));
        }));
    }, t.prototype.getDocumentsMatchingDocumentQuery = function(t, e) {
        // Just do a simple document lookup.
        return this.getDocument(t, new pt(e)).next((function(t) {
            var e = pr();
            return t.isFoundDocument() && (e = e.insert(t.key, t)), e;
        }));
    }, t.prototype.getDocumentsMatchingCollectionGroupQuery = function(t, e, n) {
        var r = this, i = e.collectionGroup, o = pr();
        return this.indexManager.getCollectionParents(t, i).next((function(u) {
            return Nt.forEach(u, (function(u) {
                var a = function(t, e) {
                    return new Qn(e, 
                    /*collectionGroup=*/ null, t.explicitOrderBy.slice(), t.filters.slice(), t.limit, t.limitType, t.startAt, t.endAt);
                }(e, u.child(i));
                return r.getDocumentsMatchingCollectionQuery(t, a, n).next((function(t) {
                    t.forEach((function(t, e) {
                        o = o.insert(t, e);
                    }));
                }));
            })).next((function() {
                return o;
            }));
        }));
    }, t.prototype.getDocumentsMatchingCollectionQuery = function(t, e, n) {
        var r, i = this;
        // Query the remote documents and overlay mutations.
                return this.documentOverlayCache.getOverlaysForCollection(t, e.path, n.largestBatchId).next((function(o) {
            return r = o, i.remoteDocumentCache.getDocumentsMatchingQuery(t, e, n, r);
        })).next((function(t) {
            // As documents might match the query because of their overlay we need to
            // include documents for all overlays in the initial document set.
            r.forEach((function(e, n) {
                var r = n.getKey();
                null === t.get(r) && (t = t.insert(r, dn.newInvalidDocument(r)));
            }));
            // Apply the overlays and match against the query.
            var n = pr();
            return t.forEach((function(t, i) {
                var o = r.get(t);
                void 0 !== o && Qr(o.mutation, i, Ne.empty(), st.now()), 
                // Finally, insert the documents that still match the query
                ur(e, i) && (n = n.insert(t, i));
            })), n;
        }));
    }, t;
}(), Fu = /** @class */ function() {
    function t(t) {
        this.serializer = t, this.cs = new Map, this.hs = new Map;
    }
    return t.prototype.getBundleMetadata = function(t, e) {
        return Nt.resolve(this.cs.get(e));
    }, t.prototype.saveBundleMetadata = function(t, e) {
        /** Decodes a BundleMetadata proto into a BundleMetadata object. */
        var n;
        return this.cs.set(e.id, {
            id: (n = e).id,
            version: n.version,
            createTime: Vi(n.createTime)
        }), Nt.resolve();
    }, t.prototype.getNamedQuery = function(t, e) {
        return Nt.resolve(this.hs.get(e));
    }, t.prototype.saveNamedQuery = function(t, e) {
        return this.hs.set(e.name, function(t) {
            return {
                name: t.name,
                query: yo(t.bundledQuery),
                readTime: Vi(t.readTime)
            };
        }(e)), Nt.resolve();
    }, t;
}(), Pu = /** @class */ function() {
    function t() {
        // A map sorted by DocumentKey, whose value is a pair of the largest batch id
        // for the overlay and the overlay itself.
        this.overlays = new Te(pt.comparator), this.ls = new Map;
    }
    return t.prototype.getOverlay = function(t, e) {
        return Nt.resolve(this.overlays.get(e));
    }, t.prototype.getOverlays = function(t, e) {
        var n = this, r = mr();
        return Nt.forEach(e, (function(e) {
            return n.getOverlay(t, e).next((function(t) {
                null !== t && r.set(e, t);
            }));
        })).next((function() {
            return r;
        }));
    }, t.prototype.saveOverlays = function(t, e, n) {
        var r = this;
        return n.forEach((function(n, i) {
            r.we(t, e, i);
        })), Nt.resolve();
    }, t.prototype.removeOverlaysForBatchId = function(t, e, n) {
        var r = this, i = this.ls.get(n);
        return void 0 !== i && (i.forEach((function(t) {
            return r.overlays = r.overlays.remove(t);
        })), this.ls.delete(n)), Nt.resolve();
    }, t.prototype.getOverlaysForCollection = function(t, e, n) {
        for (var r = mr(), i = e.length + 1, o = new pt(e.child("")), u = this.overlays.getIteratorFrom(o); u.hasNext(); ) {
            var a = u.getNext().value, s = a.getKey();
            if (!e.isPrefixOf(s.path)) break;
            // Documents from sub-collections
                        s.path.length === i && a.largestBatchId > n && r.set(a.getKey(), a);
        }
        return Nt.resolve(r);
    }, t.prototype.getOverlaysForCollectionGroup = function(t, e, n, r) {
        for (var i = new Te((function(t, e) {
            return t - e;
        })), o = this.overlays.getIterator(); o.hasNext(); ) {
            var u = o.getNext().value;
            if (u.getKey().getCollectionGroup() === e && u.largestBatchId > n) {
                var a = i.get(u.largestBatchId);
                null === a && (a = mr(), i = i.insert(u.largestBatchId, a)), a.set(u.getKey(), u);
            }
        }
        for (var s = mr(), c = i.getIterator(); c.hasNext() && (c.getNext().value.forEach((function(t, e) {
            return s.set(t, e);
        })), !(s.size() >= r)); ) ;
        return Nt.resolve(s);
    }, t.prototype.we = function(t, e, n) {
        // Remove the association of the overlay to its batch id.
        var r = this.overlays.get(n.key);
        if (null !== r) {
            var i = this.ls.get(r.largestBatchId).delete(n.key);
            this.ls.set(r.largestBatchId, i);
        }
        this.overlays = this.overlays.insert(n.key, new ui(e, n));
        // Create the association of this overlay to the given largestBatchId.
        var o = this.ls.get(e);
        void 0 === o && (o = Ir(), this.ls.set(e, o)), this.ls.set(e, o.add(n.key));
    }, t;
}(), Ru = /** @class */ function() {
    function t() {
        // A set of outstanding references to a document sorted by key.
        this.fs = new De(Vu.ds), 
        // A set of outstanding references to a document sorted by target id.
        this.ws = new De(Vu._s)
        /** Returns true if the reference set contains no references. */;
    }
    return t.prototype.isEmpty = function() {
        return this.fs.isEmpty();
    }, 
    /** Adds a reference to the given document key for the given ID. */ t.prototype.addReference = function(t, e) {
        var n = new Vu(t, e);
        this.fs = this.fs.add(n), this.ws = this.ws.add(n);
    }, 
    /** Add references to the given document keys for the given ID. */ t.prototype.gs = function(t, e) {
        var n = this;
        t.forEach((function(t) {
            return n.addReference(t, e);
        }));
    }, 
    /**
     * Removes a reference to the given document key for the given
     * ID.
     */
    t.prototype.removeReference = function(t, e) {
        this.ys(new Vu(t, e));
    }, t.prototype.ps = function(t, e) {
        var n = this;
        t.forEach((function(t) {
            return n.removeReference(t, e);
        }));
    }, 
    /**
     * Clears all references with a given ID. Calls removeRef() for each key
     * removed.
     */
    t.prototype.Is = function(t) {
        var e = this, n = new pt(new ht([])), r = new Vu(n, t), i = new Vu(n, t + 1), o = [];
        return this.ws.forEachInRange([ r, i ], (function(t) {
            e.ys(t), o.push(t.key);
        })), o;
    }, t.prototype.Ts = function() {
        var t = this;
        this.fs.forEach((function(e) {
            return t.ys(e);
        }));
    }, t.prototype.ys = function(t) {
        this.fs = this.fs.delete(t), this.ws = this.ws.delete(t);
    }, t.prototype.Es = function(t) {
        var e = new pt(new ht([])), n = new Vu(e, t), r = new Vu(e, t + 1), i = Ir();
        return this.ws.forEachInRange([ n, r ], (function(t) {
            i = i.add(t.key);
        })), i;
    }, t.prototype.containsKey = function(t) {
        var e = new Vu(t, 0), n = this.fs.firstAfterOrEqual(e);
        return null !== n && t.isEqual(n.key);
    }, t;
}(), Vu = /** @class */ function() {
    function t(t, e) {
        this.key = t, this.As = e
        /** Compare by key then by ID */;
    }
    return t.ds = function(t, e) {
        return pt.comparator(t.key, e.key) || ot(t.As, e.As);
    }, 
    /** Compare by ID then by key */ t._s = function(t, e) {
        return ot(t.As, e.As) || pt.comparator(t.key, e.key);
    }, t;
}(), Mu = /** @class */ function() {
    function t(t, e) {
        this.indexManager = t, this.referenceDelegate = e, 
        /**
             * The set of all mutations that have been sent but not yet been applied to
             * the backend.
             */
        this.mutationQueue = [], 
        /** Next value to use when assigning sequential IDs to each mutation batch. */
        this.vs = 1, 
        /** An ordered mapping between documents and the mutations batch IDs. */
        this.Rs = new De(Vu.ds);
    }
    return t.prototype.checkEmpty = function(t) {
        return Nt.resolve(0 === this.mutationQueue.length);
    }, t.prototype.addMutationBatch = function(t, e, n, r) {
        var i = this.vs;
        this.vs++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1];
        var o = new ii(i, e, n, r);
        this.mutationQueue.push(o);
        // Track references by document key and index collection parents.
        for (var u = 0, a = r; u < a.length; u++) {
            var s = a[u];
            this.Rs = this.Rs.add(new Vu(s.key, i)), this.indexManager.addToCollectionParentIndex(t, s.key.path.popLast());
        }
        return Nt.resolve(o);
    }, t.prototype.lookupMutationBatch = function(t, e) {
        return Nt.resolve(this.Ps(e));
    }, t.prototype.getNextMutationBatchAfterBatchId = function(t, e) {
        var n = e + 1, r = this.bs(n), i = r < 0 ? 0 : r;
        // The requested batchId may still be out of range so normalize it to the
        // start of the queue.
                return Nt.resolve(this.mutationQueue.length > i ? this.mutationQueue[i] : null);
    }, t.prototype.getHighestUnacknowledgedBatchId = function() {
        return Nt.resolve(0 === this.mutationQueue.length ? -1 : this.vs - 1);
    }, t.prototype.getAllMutationBatches = function(t) {
        return Nt.resolve(this.mutationQueue.slice());
    }, t.prototype.getAllMutationBatchesAffectingDocumentKey = function(t, e) {
        var n = this, r = new Vu(e, 0), i = new Vu(e, Number.POSITIVE_INFINITY), o = [];
        return this.Rs.forEachInRange([ r, i ], (function(t) {
            var e = n.Ps(t.As);
            o.push(e);
        })), Nt.resolve(o);
    }, t.prototype.getAllMutationBatchesAffectingDocumentKeys = function(t, e) {
        var n = this, r = new De(ot);
        return e.forEach((function(t) {
            var e = new Vu(t, 0), i = new Vu(t, Number.POSITIVE_INFINITY);
            n.Rs.forEachInRange([ e, i ], (function(t) {
                r = r.add(t.As);
            }));
        })), Nt.resolve(this.Vs(r));
    }, t.prototype.getAllMutationBatchesAffectingQuery = function(t, e) {
        // Use the query path as a prefix for testing if a document matches the
        // query.
        var n = e.path, r = n.length + 1, i = n;
        // Construct a document reference for actually scanning the index. Unlike
        // the prefix the document key in this reference must have an even number of
        // segments. The empty segment can be used a suffix of the query path
        // because it precedes all other segments in an ordered traversal.
                pt.isDocumentKey(i) || (i = i.child(""));
        var o = new Vu(new pt(i), 0), u = new De(ot);
        // Find unique batchIDs referenced by all documents potentially matching the
        // query.
                return this.Rs.forEachWhile((function(t) {
            var e = t.key.path;
            return !!n.isPrefixOf(e) && (
            // Rows with document keys more than one segment longer than the query
            // path can't be matches. For example, a query on 'rooms' can't match
            // the document /rooms/abc/messages/xyx.
            // TODO(mcg): we'll need a different scanner when we implement
            // ancestor queries.
            e.length === r && (u = u.add(t.As)), !0);
        }), o), Nt.resolve(this.Vs(u));
    }, t.prototype.Vs = function(t) {
        var e = this, n = [];
        // Construct an array of matching batches, sorted by batchID to ensure that
        // multiple mutations affecting the same document key are applied in order.
                return t.forEach((function(t) {
            var r = e.Ps(t);
            null !== r && n.push(r);
        })), n;
    }, t.prototype.removeMutationBatch = function(t, e) {
        var n = this;
        z(0 === this.Ss(e.batchId, "removed")), this.mutationQueue.shift();
        var r = this.Rs;
        return Nt.forEach(e.mutations, (function(i) {
            var o = new Vu(i.key, e.batchId);
            return r = r.delete(o), n.referenceDelegate.markPotentiallyOrphaned(t, i.key);
        })).next((function() {
            n.Rs = r;
        }));
    }, t.prototype.Cn = function(t) {
        // No-op since the memory mutation queue does not maintain a separate cache.
    }, t.prototype.containsKey = function(t, e) {
        var n = new Vu(e, 0), r = this.Rs.firstAfterOrEqual(n);
        return Nt.resolve(e.isEqual(r && r.key));
    }, t.prototype.performConsistencyCheck = function(t) {
        return this.mutationQueue.length, Nt.resolve();
    }, 
    /**
     * Finds the index of the given batchId in the mutation queue and asserts that
     * the resulting index is within the bounds of the queue.
     *
     * @param batchId - The batchId to search for
     * @param action - A description of what the caller is doing, phrased in passive
     * form (e.g. "acknowledged" in a routine that acknowledges batches).
     */
    t.prototype.Ss = function(t, e) {
        return this.bs(t);
    }, 
    /**
     * Finds the index of the given batchId in the mutation queue. This operation
     * is O(1).
     *
     * @returns The computed index of the batch with the given batchId, based on
     * the state of the queue. Note this index can be negative if the requested
     * batchId has already been remvoed from the queue or past the end of the
     * queue if the batchId is larger than the last added batch.
     */
    t.prototype.bs = function(t) {
        return 0 === this.mutationQueue.length ? 0 : t - this.mutationQueue[0].batchId;
        // Examine the front of the queue to figure out the difference between the
        // batchId and indexes in the array. Note that since the queue is ordered
        // by batchId, if the first batch has a larger batchId then the requested
        // batchId doesn't exist in the queue.
        }, 
    /**
     * A version of lookupMutationBatch that doesn't return a promise, this makes
     * other functions that uses this code easier to read and more efficent.
     */
    t.prototype.Ps = function(t) {
        var e = this.bs(t);
        return e < 0 || e >= this.mutationQueue.length ? null : this.mutationQueue[e];
    }, t;
}(), Lu = /** @class */ function() {
    /**
     * @param sizer - Used to assess the size of a document. For eager GC, this is
     * expected to just return 0 to avoid unnecessarily doing the work of
     * calculating the size.
     */
    function t(t) {
        this.Ds = t, 
        /** Underlying cache of documents and their read times. */
        this.docs = new Te(pt.comparator), 
        /** Size of all cached documents. */
        this.size = 0;
    }
    return t.prototype.setIndexManager = function(t) {
        this.indexManager = t;
    }, 
    /**
     * Adds the supplied entry to the cache and updates the cache size as appropriate.
     *
     * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
     * returned by `newChangeBuffer()`.
     */
    t.prototype.addEntry = function(t, e) {
        var n = e.key, r = this.docs.get(n), i = r ? r.size : 0, o = this.Ds(e);
        return this.docs = this.docs.insert(n, {
            document: e.mutableCopy(),
            size: o
        }), this.size += o - i, this.indexManager.addToCollectionParentIndex(t, n.path.popLast());
    }, 
    /**
     * Removes the specified entry from the cache and updates the cache size as appropriate.
     *
     * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
     * returned by `newChangeBuffer()`.
     */
    t.prototype.removeEntry = function(t) {
        var e = this.docs.get(t);
        e && (this.docs = this.docs.remove(t), this.size -= e.size);
    }, t.prototype.getEntry = function(t, e) {
        var n = this.docs.get(e);
        return Nt.resolve(n ? n.document.mutableCopy() : dn.newInvalidDocument(e));
    }, t.prototype.getEntries = function(t, e) {
        var n = this, r = fr();
        return e.forEach((function(t) {
            var e = n.docs.get(t);
            r = r.insert(t, e ? e.document.mutableCopy() : dn.newInvalidDocument(t));
        })), Nt.resolve(r);
    }, t.prototype.getDocumentsMatchingQuery = function(t, e, n, r) {
        for (var i = fr(), o = e.path, u = new pt(o.child("")), a = this.docs.getIteratorFrom(u)
        // Documents are ordered by key, so we can use a prefix scan to narrow down
        // the documents we need to match the query against.
        ; a.hasNext(); ) {
            var s = a.getNext(), c = s.key, l = s.value.document;
            if (!o.isPrefixOf(c.path)) break;
            c.path.length > o.length + 1 || _t(Tt(l), n) <= 0 || (r.has(l.key) || ur(e, l)) && (i = i.insert(l.key, l.mutableCopy()));
        }
        return Nt.resolve(i);
    }, t.prototype.getAllFromCollectionGroup = function(t, e, n, r) {
        // This method should only be called from the IndexBackfiller if persistence
        // is enabled.
        U();
    }, t.prototype.Cs = function(t, e) {
        return Nt.forEach(this.docs, (function(t) {
            return e(t);
        }));
    }, t.prototype.newChangeBuffer = function(t) {
        // `trackRemovals` is ignores since the MemoryRemoteDocumentCache keeps
        // a separate changelog and does not need special handling for removals.
        return new qu(this);
    }, t.prototype.getSize = function(t) {
        return Nt.resolve(this.size);
    }, t;
}(), qu = /** @class */ function(e) {
    function n(t) {
        var n = this;
        return (n = e.call(this) || this).os = t, n;
    }
    return t(n, e), n.prototype.applyChanges = function(t) {
        var e = this, n = [];
        return this.changes.forEach((function(r, i) {
            i.isValidDocument() ? n.push(e.os.addEntry(t, i)) : e.os.removeEntry(r);
        })), Nt.waitFor(n);
    }, n.prototype.getFromCache = function(t, e) {
        return this.os.getEntry(t, e);
    }, n.prototype.getAllFromCache = function(t, e) {
        return this.os.getEntries(t, e);
    }, n;
}(Eu), Bu = /** @class */ function() {
    function t(t) {
        this.persistence = t, 
        /**
             * Maps a target to the data about that target
             */
        this.xs = new lr((function(t) {
            return Bn(t);
        }), Un), 
        /** The last received snapshot version. */
        this.lastRemoteSnapshotVersion = ct.min(), 
        /** The highest numbered target ID encountered. */
        this.highestTargetId = 0, 
        /** The highest sequence number encountered. */
        this.Ns = 0, 
        /**
             * A ordered bidirectional mapping between documents and the remote target
             * IDs.
             */
        this.ks = new Ru, this.targetCount = 0, this.Ms = lu.kn();
    }
    return t.prototype.forEachTarget = function(t, e) {
        return this.xs.forEach((function(t, n) {
            return e(n);
        })), Nt.resolve();
    }, t.prototype.getLastRemoteSnapshotVersion = function(t) {
        return Nt.resolve(this.lastRemoteSnapshotVersion);
    }, t.prototype.getHighestSequenceNumber = function(t) {
        return Nt.resolve(this.Ns);
    }, t.prototype.allocateTargetId = function(t) {
        return this.highestTargetId = this.Ms.next(), Nt.resolve(this.highestTargetId);
    }, t.prototype.setTargetsMetadata = function(t, e, n) {
        return n && (this.lastRemoteSnapshotVersion = n), e > this.Ns && (this.Ns = e), 
        Nt.resolve();
    }, t.prototype.Fn = function(t) {
        this.xs.set(t.target, t);
        var e = t.targetId;
        e > this.highestTargetId && (this.Ms = new lu(e), this.highestTargetId = e), t.sequenceNumber > this.Ns && (this.Ns = t.sequenceNumber);
    }, t.prototype.addTargetData = function(t, e) {
        return this.Fn(e), this.targetCount += 1, Nt.resolve();
    }, t.prototype.updateTargetData = function(t, e) {
        return this.Fn(e), Nt.resolve();
    }, t.prototype.removeTargetData = function(t, e) {
        return this.xs.delete(e.target), this.ks.Is(e.targetId), this.targetCount -= 1, 
        Nt.resolve();
    }, t.prototype.removeTargets = function(t, e, n) {
        var r = this, i = 0, o = [];
        return this.xs.forEach((function(u, a) {
            a.sequenceNumber <= e && null === n.get(a.targetId) && (r.xs.delete(u), o.push(r.removeMatchingKeysForTargetId(t, a.targetId)), 
            i++);
        })), Nt.waitFor(o).next((function() {
            return i;
        }));
    }, t.prototype.getTargetCount = function(t) {
        return Nt.resolve(this.targetCount);
    }, t.prototype.getTargetData = function(t, e) {
        var n = this.xs.get(e) || null;
        return Nt.resolve(n);
    }, t.prototype.addMatchingKeys = function(t, e, n) {
        return this.ks.gs(e, n), Nt.resolve();
    }, t.prototype.removeMatchingKeys = function(t, e, n) {
        this.ks.ps(e, n);
        var r = this.persistence.referenceDelegate, i = [];
        return r && e.forEach((function(e) {
            i.push(r.markPotentiallyOrphaned(t, e));
        })), Nt.waitFor(i);
    }, t.prototype.removeMatchingKeysForTargetId = function(t, e) {
        return this.ks.Is(e), Nt.resolve();
    }, t.prototype.getMatchingKeysForTargetId = function(t, e) {
        var n = this.ks.Es(e);
        return Nt.resolve(n);
    }, t.prototype.containsKey = function(t, e) {
        return Nt.resolve(this.ks.containsKey(e));
    }, t;
}(), Uu = /** @class */ function() {
    /**
     * The constructor accepts a factory for creating a reference delegate. This
     * allows both the delegate and this instance to have strong references to
     * each other without having nullable fields that would then need to be
     * checked or asserted on every access.
     */
    function t(t, e) {
        var n = this;
        this.$s = {}, this.overlays = {}, this.Os = new Ut(0), this.Fs = !1, this.Fs = !0, 
        this.referenceDelegate = t(this), this.Bs = new Bu(this), this.indexManager = new Qo, 
        this.remoteDocumentCache = new Lu((function(t) {
            return n.referenceDelegate.Ls(t);
        })), this.serializer = new so(e), this.qs = new Fu(this.serializer);
    }
    return t.prototype.start = function() {
        return Promise.resolve();
    }, t.prototype.shutdown = function() {
        // No durable state to ensure is closed on shutdown.
        return this.Fs = !1, Promise.resolve();
    }, Object.defineProperty(t.prototype, "started", {
        get: function() {
            return this.Fs;
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.setDatabaseDeletedListener = function() {
        // No op.
    }, t.prototype.setNetworkEnabled = function() {
        // No op.
    }, t.prototype.getIndexManager = function(t) {
        // We do not currently support indices for memory persistence, so we can
        // return the same shared instance of the memory index manager.
        return this.indexManager;
    }, t.prototype.getDocumentOverlayCache = function(t) {
        var e = this.overlays[t.toKey()];
        return e || (e = new Pu, this.overlays[t.toKey()] = e), e;
    }, t.prototype.getMutationQueue = function(t, e) {
        var n = this.$s[t.toKey()];
        return n || (n = new Mu(e, this.referenceDelegate), this.$s[t.toKey()] = n), n;
    }, t.prototype.getTargetCache = function() {
        return this.Bs;
    }, t.prototype.getRemoteDocumentCache = function() {
        return this.remoteDocumentCache;
    }, t.prototype.getBundleCache = function() {
        return this.qs;
    }, t.prototype.runTransaction = function(t, e, n) {
        var r = this;
        M("MemoryPersistence", "Starting transaction:", t);
        var i = new zu(this.Os.next());
        return this.referenceDelegate.Us(), n(i).next((function(t) {
            return r.referenceDelegate.Ks(i).next((function() {
                return t;
            }));
        })).toPromise().then((function(t) {
            return i.raiseOnCommittedEvent(), t;
        }));
    }, t.prototype.Gs = function(t, e) {
        return Nt.or(Object.values(this.$s).map((function(n) {
            return function() {
                return n.containsKey(t, e);
            };
        })));
    }, t;
}(), zu = /** @class */ function(e) {
    function n(t) {
        var n = this;
        return (n = e.call(this) || this).currentSequenceNumber = t, n;
    }
    return t(n, e), n;
}(Ct), Gu = /** @class */ function() {
    function t(t) {
        this.persistence = t, 
        /** Tracks all documents that are active in Query views. */
        this.Qs = new Ru, 
        /** The list of documents that are potentially GCed after each transaction. */
        this.js = null;
    }
    return t.zs = function(e) {
        return new t(e);
    }, Object.defineProperty(t.prototype, "Ws", {
        get: function() {
            if (this.js) return this.js;
            throw U();
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.addReference = function(t, e, n) {
        return this.Qs.addReference(n, e), this.Ws.delete(n.toString()), Nt.resolve();
    }, t.prototype.removeReference = function(t, e, n) {
        return this.Qs.removeReference(n, e), this.Ws.add(n.toString()), Nt.resolve();
    }, t.prototype.markPotentiallyOrphaned = function(t, e) {
        return this.Ws.add(e.toString()), Nt.resolve();
    }, t.prototype.removeTarget = function(t, e) {
        var n = this;
        this.Qs.Is(e.targetId).forEach((function(t) {
            return n.Ws.add(t.toString());
        }));
        var r = this.persistence.getTargetCache();
        return r.getMatchingKeysForTargetId(t, e.targetId).next((function(t) {
            t.forEach((function(t) {
                return n.Ws.add(t.toString());
            }));
        })).next((function() {
            return r.removeTargetData(t, e);
        }));
    }, t.prototype.Us = function() {
        this.js = new Set;
    }, t.prototype.Ks = function(t) {
        var e = this, n = this.persistence.getRemoteDocumentCache().newChangeBuffer();
        // Remove newly orphaned documents.
                return Nt.forEach(this.Ws, (function(r) {
            var i = pt.fromPath(r);
            return e.Hs(t, i).next((function(t) {
                t || n.removeEntry(i, ct.min());
            }));
        })).next((function() {
            return e.js = null, n.apply(t);
        }));
    }, t.prototype.updateLimboDocument = function(t, e) {
        var n = this;
        return this.Hs(t, e).next((function(t) {
            t ? n.Ws.delete(e.toString()) : n.Ws.add(e.toString());
        }));
    }, t.prototype.Ls = function(t) {
        // For eager GC, we don't care about the document size, there are no size thresholds.
        return 0;
    }, t.prototype.Hs = function(t, e) {
        var n = this;
        return Nt.or([ function() {
            return Nt.resolve(n.Qs.containsKey(e));
        }, function() {
            return n.persistence.getTargetCache().containsKey(t, e);
        }, function() {
            return n.persistence.Gs(t, e);
        } ]);
    }, t;
}(), ju = /** @class */ function() {
    function t(t, e) {
        this.persistence = t, this.Js = new lr((function(t) {
            return Kt(t.path);
        }), (function(t, e) {
            return t.isEqual(e);
        })), this.garbageCollector = wu(this, e);
    }
    return t.zs = function(e, n) {
        return new t(e, n);
    }, 
    // No-ops, present so memory persistence doesn't have to care which delegate
    // it has.
    t.prototype.Us = function() {}, t.prototype.Ks = function(t) {
        return Nt.resolve();
    }, t.prototype.forEachTarget = function(t, e) {
        return this.persistence.getTargetCache().forEachTarget(t, e);
    }, t.prototype.zn = function(t) {
        var e = this.Jn(t);
        return this.persistence.getTargetCache().getTargetCount(t).next((function(t) {
            return e.next((function(e) {
                return t + e;
            }));
        }));
    }, t.prototype.Jn = function(t) {
        var e = 0;
        return this.Wn(t, (function(t) {
            e++;
        })).next((function() {
            return e;
        }));
    }, t.prototype.Wn = function(t, e) {
        var n = this;
        return Nt.forEach(this.Js, (function(r, i) {
            return n.Xn(t, r, i).next((function(t) {
                return t ? Nt.resolve() : e(i);
            }));
        }));
    }, t.prototype.removeTargets = function(t, e, n) {
        return this.persistence.getTargetCache().removeTargets(t, e, n);
    }, t.prototype.removeOrphanedDocuments = function(t, e) {
        var n = this, r = 0, i = this.persistence.getRemoteDocumentCache(), o = i.newChangeBuffer();
        return i.Cs(t, (function(i) {
            return n.Xn(t, i, e).next((function(t) {
                t || (r++, o.removeEntry(i, ct.min()));
            }));
        })).next((function() {
            return o.apply(t);
        })).next((function() {
            return r;
        }));
    }, t.prototype.markPotentiallyOrphaned = function(t, e) {
        return this.Js.set(e, t.currentSequenceNumber), Nt.resolve();
    }, t.prototype.removeTarget = function(t, e) {
        var n = e.withSequenceNumber(t.currentSequenceNumber);
        return this.persistence.getTargetCache().updateTargetData(t, n);
    }, t.prototype.addReference = function(t, e, n) {
        return this.Js.set(n, t.currentSequenceNumber), Nt.resolve();
    }, t.prototype.removeReference = function(t, e, n) {
        return this.Js.set(n, t.currentSequenceNumber), Nt.resolve();
    }, t.prototype.updateLimboDocument = function(t, e) {
        return this.Js.set(e, t.currentSequenceNumber), Nt.resolve();
    }, t.prototype.Ls = function(t) {
        var e = t.key.toString().length;
        return t.isFoundDocument() && (e += Je(t.data.value)), e;
    }, t.prototype.Xn = function(t, e, n) {
        var r = this;
        return Nt.or([ function() {
            return r.persistence.Gs(t, e);
        }, function() {
            return r.persistence.getTargetCache().containsKey(t, e);
        }, function() {
            var t = r.Js.get(e);
            return Nt.resolve(void 0 !== t && t > n);
        } ]);
    }, t.prototype.getCacheSize = function(t) {
        return this.persistence.getRemoteDocumentCache().getSize(t);
    }, t;
}(), Ku = /** @class */ function() {
    function t(t) {
        this.serializer = t;
    }
    /**
     * Performs database creation and schema upgrades.
     *
     * Note that in production, this method is only ever used to upgrade the schema
     * to SCHEMA_VERSION. Different values of toVersion are only used for testing
     * and local feature development.
     */    return t.prototype.O = function(t, e, n, r) {
        var i = this, o = new At("createOrUpgrade", e);
        n < 1 && r >= 1 && (function(t) {
            t.createObjectStore("owner");
        }(t), function(t) {
            t.createObjectStore("mutationQueues", {
                keyPath: "userId"
            }), t.createObjectStore("mutations", {
                keyPath: "batchId",
                autoIncrement: !0
            }).createIndex("userMutationsIndex", Yt, {
                unique: !0
            }), t.createObjectStore("documentMutations");
        }(t), Qu(t), function(t) {
            t.createObjectStore("remoteDocuments");
        }(t));
        // Migration 2 to populate the targetGlobal object no longer needed since
        // migration 3 unconditionally clears it.
        var u = Nt.resolve();
        return n < 3 && r >= 3 && (
        // Brand new clients don't need to drop and recreate--only clients that
        // potentially have corrupt data.
        0 !== n && (function(t) {
            t.deleteObjectStore("targetDocuments"), t.deleteObjectStore("targets"), t.deleteObjectStore("targetGlobal");
        }(t), Qu(t)), u = u.next((function() {
            /**
     * Creates the target global singleton row.
     *
     * @param txn - The version upgrade transaction for indexeddb
     */
            return function(t) {
                var e = t.store("targetGlobal"), n = {
                    highestTargetId: 0,
                    highestListenSequenceNumber: 0,
                    lastRemoteSnapshotVersion: ct.min().toTimestamp(),
                    targetCount: 0
                };
                return e.put("targetGlobalKey", n);
            }(o);
        }))), n < 4 && r >= 4 && (0 !== n && (
        // Schema version 3 uses auto-generated keys to generate globally unique
        // mutation batch IDs (this was previously ensured internally by the
        // client). To migrate to the new schema, we have to read all mutations
        // and write them back out. We preserve the existing batch IDs to guarantee
        // consistency with other object stores. Any further mutation batch IDs will
        // be auto-generated.
        u = u.next((function() {
            return function(t, e) {
                return e.store("mutations").j().next((function(n) {
                    t.deleteObjectStore("mutations"), t.createObjectStore("mutations", {
                        keyPath: "batchId",
                        autoIncrement: !0
                    }).createIndex("userMutationsIndex", Yt, {
                        unique: !0
                    });
                    var r = e.store("mutations"), i = n.map((function(t) {
                        return r.put(t);
                    }));
                    return Nt.waitFor(i);
                }));
            }(t, o);
        }))), u = u.next((function() {
            !function(t) {
                t.createObjectStore("clientMetadata", {
                    keyPath: "clientId"
                });
            }(t);
        }))), n < 5 && r >= 5 && (u = u.next((function() {
            return i.Ys(o);
        }))), n < 6 && r >= 6 && (u = u.next((function() {
            return function(t) {
                t.createObjectStore("remoteDocumentGlobal");
            }(t), i.Xs(o);
        }))), n < 7 && r >= 7 && (u = u.next((function() {
            return i.Zs(o);
        }))), n < 8 && r >= 8 && (u = u.next((function() {
            return i.ti(t, o);
        }))), n < 9 && r >= 9 && (u = u.next((function() {
            // Multi-Tab used to manage its own changelog, but this has been moved
            // to the DbRemoteDocument object store itself. Since the previous change
            // log only contained transient data, we can drop its object store.
            !function(t) {
                t.objectStoreNames.contains("remoteDocumentChanges") && t.deleteObjectStore("remoteDocumentChanges");
            }(t);
            // Note: Schema version 9 used to create a read time index for the
            // RemoteDocumentCache. This is now done with schema version 13.
                }))), n < 10 && r >= 10 && (u = u.next((function() {
            return i.ei(o);
        }))), n < 11 && r >= 11 && (u = u.next((function() {
            !function(t) {
                t.createObjectStore("bundles", {
                    keyPath: "bundleId"
                });
            }(t), function(t) {
                t.createObjectStore("namedQueries", {
                    keyPath: "name"
                });
            }(t);
        }))), n < 12 && r >= 12 && (u = u.next((function() {
            !function(t) {
                var e = t.createObjectStore("documentOverlays", {
                    keyPath: le
                });
                e.createIndex("collectionPathOverlayIndex", he, {
                    unique: !1
                }), e.createIndex("collectionGroupOverlayIndex", fe, {
                    unique: !1
                });
            }(t);
        }))), n < 13 && r >= 13 && (u = u.next((function() {
            return function(t) {
                var e = t.createObjectStore("remoteDocumentsV14", {
                    keyPath: $t
                });
                e.createIndex("documentKeyIndex", te), e.createIndex("collectionGroupIndex", ee);
            }(t);
        })).next((function() {
            return i.ni(t, o);
        })).next((function() {
            return t.deleteObjectStore("remoteDocuments");
        }))), n < 14 && r >= 14 && (u = u.next((function() {
            return i.si(t, o);
        }))), n < 15 && r >= 15 && (u = u.next((function() {
            return function(t) {
                t.createObjectStore("indexConfiguration", {
                    keyPath: "indexId",
                    autoIncrement: !0
                }).createIndex("collectionGroupIndex", "collectionGroup", {
                    unique: !1
                }), t.createObjectStore("indexState", {
                    keyPath: ue
                }).createIndex("sequenceNumberIndex", ae, {
                    unique: !1
                }), t.createObjectStore("indexEntries", {
                    keyPath: se
                }).createIndex("documentKeyIndex", ce, {
                    unique: !1
                });
            }(t);
        }))), u;
    }, t.prototype.Xs = function(t) {
        var e = 0;
        return t.store("remoteDocuments").X((function(t, n) {
            e += iu(n);
        })).next((function() {
            var n = {
                byteSize: e
            };
            return t.store("remoteDocumentGlobal").put("remoteDocumentGlobalKey", n);
        }));
    }, t.prototype.Ys = function(t) {
        var e = this, n = t.store("mutationQueues"), r = t.store("mutations");
        return n.j().next((function(n) {
            return Nt.forEach(n, (function(n) {
                var i = IDBKeyRange.bound([ n.userId, -1 ], [ n.userId, n.lastAcknowledgedBatchId ]);
                return r.j("userMutationsIndex", i).next((function(r) {
                    return Nt.forEach(r, (function(r) {
                        z(r.userId === n.userId);
                        var i = po(e.serializer, r);
                        return ru(t, n.userId, i).next((function() {}));
                    }));
                }));
            }));
        }));
    }, 
    /**
     * Ensures that every document in the remote document cache has a corresponding sentinel row
     * with a sequence number. Missing rows are given the most recently used sequence number.
     */
    t.prototype.Zs = function(t) {
        var e = t.store("targetDocuments"), n = t.store("remoteDocuments");
        return t.store("targetGlobal").get("targetGlobalKey").next((function(t) {
            var r = [];
            return n.X((function(n, i) {
                var o = new ht(n), u = function(t) {
                    return [ 0, Kt(t) ];
                }(o);
                r.push(e.get(u).next((function(n) {
                    return n ? Nt.resolve() : function(n) {
                        return e.put({
                            targetId: 0,
                            path: Kt(n),
                            sequenceNumber: t.highestListenSequenceNumber
                        });
                    }(o);
                })));
            })).next((function() {
                return Nt.waitFor(r);
            }));
        }));
    }, t.prototype.ti = function(t, e) {
        // Create the index.
        t.createObjectStore("collectionParents", {
            keyPath: oe
        });
        var n = e.store("collectionParents"), r = new Wo, i = function(t) {
            if (r.add(t)) {
                var e = t.lastSegment(), i = t.popLast();
                return n.put({
                    collectionId: e,
                    parent: Kt(i)
                });
            }
        };
        // Helper to add an index entry iff we haven't already written it.
        // Index existing remote documents.
                return e.store("remoteDocuments").X({
            Y: !0
        }, (function(t, e) {
            var n = new ht(t);
            return i(n.popLast());
        })).next((function() {
            return e.store("documentMutations").X({
                Y: !0
            }, (function(t, e) {
                t[0];
                var n = t[1];
                t[2];
                var r = Ht(n);
                return i(r.popLast());
            }));
        }));
    }, t.prototype.ei = function(t) {
        var e = this, n = t.store("targets");
        return n.X((function(t, r) {
            var i = vo(r), o = mo(e.serializer, i);
            return n.put(o);
        }));
    }, t.prototype.ni = function(t, e) {
        var n = e.store("remoteDocuments"), r = [];
        return n.X((function(t, n) {
            var i, o = e.store("remoteDocumentsV14"), u = (i = n, i.document ? new pt(ht.fromString(i.document.name).popFirst(5)) : i.noDocument ? pt.fromSegments(i.noDocument.path) : i.unknownDocument ? pt.fromSegments(i.unknownDocument.path) : U()).path.toArray(), a = {
                prefixPath: u.slice(0, u.length - 2),
                collectionGroup: u[u.length - 2],
                documentId: u[u.length - 1],
                readTime: n.readTime || [ 0, 0 ],
                unknownDocument: n.unknownDocument,
                noDocument: n.noDocument,
                document: n.document,
                hasCommittedMutations: !!n.hasCommittedMutations
            };
            r.push(o.put(a));
        })).next((function() {
            return Nt.waitFor(r);
        }));
    }, t.prototype.si = function(t, e) {
        var n = this, r = e.store("mutations"), i = Su(this.serializer), o = new Uu(Gu.zs, this.serializer.fe);
        return r.j().next((function(t) {
            var r = new Map;
            return t.forEach((function(t) {
                var e, i = null !== (e = r.get(t.userId)) && void 0 !== e ? e : Ir();
                po(n.serializer, t).keys().forEach((function(t) {
                    return i = i.add(t);
                })), r.set(t.userId, i);
            })), Nt.forEach(r, (function(t, r) {
                var u = new O(r), a = So.de(n.serializer, u), s = o.getIndexManager(u), c = ou.de(u, n.serializer, s, o.referenceDelegate);
                return new Ou(i, c, a, s).recalculateAndSaveOverlaysForDocumentKeys(new ge(e, Ut.ct), t).next();
            }));
        }));
    }, t;
}();

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
 */ function Qu(t) {
    t.createObjectStore("targetDocuments", {
        keyPath: re
    }).createIndex("documentTargetsIndex", ie, {
        unique: !0
    }), 
    // NOTE: This is unique only because the TargetId is the suffix.
    t.createObjectStore("targets", {
        keyPath: "targetId"
    }).createIndex("queryTargetsIndex", ne, {
        unique: !0
    }), t.createObjectStore("targetGlobal");
}

var Wu = "Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.", Hu = /** @class */ function() {
    function t(
    /**
     * Whether to synchronize the in-memory state of multiple tabs and share
     * access to local persistence.
     */
    e, n, r, i, o, u, a, s, c, 
    /**
     * If set to true, forcefully obtains database access. Existing tabs will
     * no longer be able to access IndexedDB.
     */
    l, h) {
        if (void 0 === h && (h = 15), this.allowTabSynchronization = e, this.persistenceKey = n, 
        this.clientId = r, this.ii = o, this.window = u, this.document = a, this.ri = c, 
        this.oi = l, this.ui = h, this.Os = null, this.Fs = !1, this.isPrimary = !1, this.networkEnabled = !0, 
        /** Our window.unload handler, if registered. */
        this.ci = null, this.inForeground = !1, 
        /** Our 'visibilitychange' listener if registered. */
        this.ai = null, 
        /** The client metadata refresh task. */
        this.hi = null, 
        /** The last time we garbage collected the client metadata object store. */
        this.li = Number.NEGATIVE_INFINITY, 
        /** A listener to notify on primary state changes. */
        this.fi = function(t) {
            return Promise.resolve();
        }, !t.D()) throw new Q(K.UNIMPLEMENTED, "This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");
        this.referenceDelegate = new bu(this, i), this.di = n + "main", this.serializer = new so(s), 
        this.wi = new kt(this.di, this.ui, new Ku(this.serializer)), this.Bs = new hu(this.referenceDelegate, this.serializer), 
        this.remoteDocumentCache = Su(this.serializer), this.qs = new Io, this.window && this.window.localStorage ? this._i = this.window.localStorage : (this._i = null, 
        !1 === l && L("IndexedDbPersistence", "LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."));
    }
    /**
     * Attempt to start IndexedDb persistence.
     *
     * @returns Whether persistence was enabled.
     */    return t.prototype.start = function() {
        var t = this;
        // NOTE: This is expected to fail sometimes (in the case of another tab
        // already having the persistence lock), so it's the first thing we should
        // do.
                return this.mi().then((function() {
            if (!t.isPrimary && !t.allowTabSynchronization) 
            // Fail `start()` if `synchronizeTabs` is disabled and we cannot
            // obtain the primary lease.
            throw new Q(K.FAILED_PRECONDITION, Wu);
            return t.gi(), t.yi(), t.pi(), t.runTransaction("getHighestListenSequenceNumber", "readonly", (function(e) {
                return t.Bs.getHighestSequenceNumber(e);
            }));
        })).then((function(e) {
            t.Os = new Ut(e, t.ri);
        })).then((function() {
            t.Fs = !0;
        })).catch((function(e) {
            return t.wi && t.wi.close(), Promise.reject(e);
        }));
    }, 
    /**
     * Registers a listener that gets called when the primary state of the
     * instance changes. Upon registering, this listener is invoked immediately
     * with the current primary state.
     *
     * PORTING NOTE: This is only used for Web multi-tab.
     */
    t.prototype.Ii = function(t) {
        var r = this;
        return this.fi = function(i) {
            return e(r, void 0, void 0, (function() {
                return n(this, (function(e) {
                    return this.started ? [ 2 /*return*/ , t(i) ] : [ 2 /*return*/ ];
                }));
            }));
        }, t(this.isPrimary);
    }, 
    /**
     * Registers a listener that gets called when the database receives a
     * version change event indicating that it has deleted.
     *
     * PORTING NOTE: This is only used for Web multi-tab.
     */
    t.prototype.setDatabaseDeletedListener = function(t) {
        var r = this;
        this.wi.B((function(i) {
            return e(r, void 0, void 0, (function() {
                return n(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return null === i.newVersion ? [ 4 /*yield*/ , t() ] : [ 3 /*break*/ , 2 ];

                      case 1:
                        e.sent(), e.label = 2;

                      case 2:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }));
    }, 
    /**
     * Adjusts the current network state in the client's metadata, potentially
     * affecting the primary lease.
     *
     * PORTING NOTE: This is only used for Web multi-tab.
     */
    t.prototype.setNetworkEnabled = function(t) {
        var r = this;
        this.networkEnabled !== t && (this.networkEnabled = t, 
        // Schedule a primary lease refresh for immediate execution. The eventual
        // lease update will be propagated via `primaryStateListener`.
        this.ii.enqueueAndForget((function() {
            return e(r, void 0, void 0, (function() {
                return n(this, (function(t) {
                    switch (t.label) {
                      case 0:
                        return this.started ? [ 4 /*yield*/ , this.mi() ] : [ 3 /*break*/ , 2 ];

                      case 1:
                        t.sent(), t.label = 2;

                      case 2:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        })));
    }, 
    /**
     * Updates the client metadata in IndexedDb and attempts to either obtain or
     * extend the primary lease for the local client. Asynchronously notifies the
     * primary state listener if the client either newly obtained or released its
     * primary lease.
     */
    t.prototype.mi = function() {
        var t = this;
        return this.runTransaction("updateClientMetadataAndTryBecomePrimary", "readwrite", (function(e) {
            return Xu(e).put({
                clientId: t.clientId,
                updateTimeMs: Date.now(),
                networkEnabled: t.networkEnabled,
                inForeground: t.inForeground
            }).next((function() {
                if (t.isPrimary) return t.Ti(e).next((function(e) {
                    e || (t.isPrimary = !1, t.ii.enqueueRetryable((function() {
                        return t.fi(!1);
                    })));
                }));
            })).next((function() {
                return t.Ei(e);
            })).next((function(n) {
                return t.isPrimary && !n ? t.Ai(e).next((function() {
                    return !1;
                })) : !!n && t.vi(e).next((function() {
                    return !0;
                }));
            }));
        })).catch((function(e) {
            if (Pt(e)) 
            // Proceed with the existing state. Any subsequent access to
            // IndexedDB will verify the lease.
            return M("IndexedDbPersistence", "Failed to extend owner lease: ", e), t.isPrimary;
            if (!t.allowTabSynchronization) throw e;
            return M("IndexedDbPersistence", "Releasing owner lease after error during lease refresh", e), 
            /* isPrimary= */ !1;
        })).then((function(e) {
            t.isPrimary !== e && t.ii.enqueueRetryable((function() {
                return t.fi(e);
            })), t.isPrimary = e;
        }));
    }, t.prototype.Ti = function(t) {
        var e = this;
        return Yu(t).get("owner").next((function(t) {
            return Nt.resolve(e.Ri(t));
        }));
    }, t.prototype.Pi = function(t) {
        return Xu(t).delete(this.clientId);
    }, 
    /**
     * If the garbage collection threshold has passed, prunes the
     * RemoteDocumentChanges and the ClientMetadata store based on the last update
     * time of all clients.
     */
    t.prototype.bi = function() {
        return e(this, void 0, void 0, (function() {
            var t, e, r, i, o = this;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return !this.isPrimary || this.Vi(this.li, 18e5) ? [ 3 /*break*/ , 2 ] : (this.li = Date.now(), 
                    [ 4 /*yield*/ , this.runTransaction("maybeGarbageCollectMultiClientState", "readwrite-primary", (function(t) {
                        var e = we(t, "clientMetadata");
                        return e.j().next((function(t) {
                            var n = o.Si(t, 18e5), r = t.filter((function(t) {
                                return -1 === n.indexOf(t);
                            }));
                            // Delete metadata for clients that are no longer considered active.
                                                        return Nt.forEach(r, (function(t) {
                                return e.delete(t.clientId);
                            })).next((function() {
                                return r;
                            }));
                        }));
                    })).catch((function() {
                        return [];
                    })) ]);

                  case 1:
                    // Delete potential leftover entries that may continue to mark the
                    // inactive clients as zombied in LocalStorage.
                    // Ideally we'd delete the IndexedDb and LocalStorage zombie entries for
                    // the client atomically, but we can't. So we opt to delete the IndexedDb
                    // entries first to avoid potentially reviving a zombied client.
                    if (t = n.sent(), this._i) for (e = 0, r = t; e < r.length; e++) i = r[e], this._i.removeItem(this.Di(i.clientId));
                    n.label = 2;

                  case 2:
                    return [ 2 /*return*/ ];
                }
            }));
        }));
    }, 
    /**
     * Schedules a recurring timer to update the client metadata and to either
     * extend or acquire the primary lease if the client is eligible.
     */
    t.prototype.pi = function() {
        var t = this;
        this.hi = this.ii.enqueueAfterDelay("client_metadata_refresh" /* TimerId.ClientMetadataRefresh */ , 4e3, (function() {
            return t.mi().then((function() {
                return t.bi();
            })).then((function() {
                return t.pi();
            }));
        }));
    }, 
    /** Checks whether `client` is the local client. */ t.prototype.Ri = function(t) {
        return !!t && t.ownerId === this.clientId;
    }, 
    /**
     * Evaluate the state of all active clients and determine whether the local
     * client is or can act as the holder of the primary lease. Returns whether
     * the client is eligible for the lease, but does not actually acquire it.
     * May return 'false' even if there is no active leaseholder and another
     * (foreground) client should become leaseholder instead.
     */
    t.prototype.Ei = function(t) {
        var e = this;
        return this.oi ? Nt.resolve(!0) : Yu(t).get("owner").next((function(n) {
            // A client is eligible for the primary lease if:
            // - its network is enabled and the client's tab is in the foreground.
            // - its network is enabled and no other client's tab is in the
            //   foreground.
            // - every clients network is disabled and the client's tab is in the
            //   foreground.
            // - every clients network is disabled and no other client's tab is in
            //   the foreground.
            // - the `forceOwningTab` setting was passed in.
            if (null !== n && e.Vi(n.leaseTimestampMs, 5e3) && !e.Ci(n.ownerId)) {
                if (e.Ri(n) && e.networkEnabled) return !0;
                if (!e.Ri(n)) {
                    if (!n.allowTabSynchronization) 
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
                    throw new Q(K.FAILED_PRECONDITION, Wu);
                    return !1;
                }
            }
            return !(!e.networkEnabled || !e.inForeground) || Xu(t).j().next((function(t) {
                return void 0 === e.Si(t, 5e3).find((function(t) {
                    if (e.clientId !== t.clientId) {
                        var n = !e.networkEnabled && t.networkEnabled, r = !e.inForeground && t.inForeground, i = e.networkEnabled === t.networkEnabled;
                        if (n || r && i) return !0;
                    }
                    return !1;
                }));
            }));
        })).next((function(t) {
            return e.isPrimary !== t && M("IndexedDbPersistence", "Client ".concat(t ? "is" : "is not", " eligible for a primary lease.")), 
            t;
        }));
    }, t.prototype.shutdown = function() {
        return e(this, void 0, void 0, (function() {
            var t = this;
            return n(this, (function(e) {
                switch (e.label) {
                  case 0:
                    // Use `SimpleDb.runTransaction` directly to avoid failing if another tab
                    // has obtained the primary lease.
                    // The shutdown() operations are idempotent and can be called even when
                    // start() aborted (e.g. because it couldn't acquire the persistence lease).
                    return this.Fs = !1, this.xi(), this.hi && (this.hi.cancel(), this.hi = null), this.Ni(), 
                    this.ki(), [ 4 /*yield*/ , this.wi.runTransaction("shutdown", "readwrite", [ "owner", "clientMetadata" ], (function(e) {
                        var n = new ge(e, Ut.ct);
                        return t.Ai(n).next((function() {
                            return t.Pi(n);
                        }));
                    })) ];

                  case 1:
                    // The shutdown() operations are idempotent and can be called even when
                    // start() aborted (e.g. because it couldn't acquire the persistence lease).
                    // Use `SimpleDb.runTransaction` directly to avoid failing if another tab
                    // has obtained the primary lease.
                    return e.sent(), this.wi.close(), 
                    // Remove the entry marking the client as zombied from LocalStorage since
                    // we successfully deleted its metadata from IndexedDb.
                    this.Mi(), [ 2 /*return*/ ];
                }
            }));
        }));
    }, 
    /**
     * Returns clients that are not zombied and have an updateTime within the
     * provided threshold.
     */
    t.prototype.Si = function(t, e) {
        var n = this;
        return t.filter((function(t) {
            return n.Vi(t.updateTimeMs, e) && !n.Ci(t.clientId);
        }));
    }, 
    /**
     * Returns the IDs of the clients that are currently active. If multi-tab
     * is not supported, returns an array that only contains the local client's
     * ID.
     *
     * PORTING NOTE: This is only used for Web multi-tab.
     */
    t.prototype.$i = function() {
        var t = this;
        return this.runTransaction("getActiveClients", "readonly", (function(e) {
            return Xu(e).j().next((function(e) {
                return t.Si(e, 18e5).map((function(t) {
                    return t.clientId;
                }));
            }));
        }));
    }, Object.defineProperty(t.prototype, "started", {
        get: function() {
            return this.Fs;
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.getMutationQueue = function(t, e) {
        return ou.de(t, this.serializer, e, this.referenceDelegate);
    }, t.prototype.getTargetCache = function() {
        return this.Bs;
    }, t.prototype.getRemoteDocumentCache = function() {
        return this.remoteDocumentCache;
    }, t.prototype.getIndexManager = function(t) {
        return new Yo(t, this.serializer.fe.databaseId);
    }, t.prototype.getDocumentOverlayCache = function(t) {
        return So.de(this.serializer, t);
    }, t.prototype.getBundleCache = function() {
        return this.qs;
    }, t.prototype.runTransaction = function(t, e, n) {
        var r = this;
        M("IndexedDbPersistence", "Starting transaction:", t);
        var i, o, u = "readonly" === e ? "readonly" : "readwrite", a = 15 === (i = this.ui) ? ye : 14 === i ? me : 13 === i ? ve : 12 === i ? pe : 11 === i ? de : void U();
        /** Returns the object stores for the provided schema. */        
        // Do all transactions as readwrite against all object stores, since we
        // are the only reader/writer.
        return this.wi.runTransaction(t, u, a, (function(i) {
            return o = new ge(i, r.Os ? r.Os.next() : Ut.ct), "readwrite-primary" === e ? r.Ti(o).next((function(t) {
                return !!t || r.Ei(o);
            })).next((function(e) {
                if (!e) throw L("Failed to obtain primary lease for action '".concat(t, "'.")), 
                r.isPrimary = !1, r.ii.enqueueRetryable((function() {
                    return r.fi(!1);
                })), new Q(K.FAILED_PRECONDITION, Dt);
                return n(o);
            })).next((function(t) {
                return r.vi(o).next((function() {
                    return t;
                }));
            })) : r.Oi(o).next((function() {
                return n(o);
            }));
        })).then((function(t) {
            return o.raiseOnCommittedEvent(), t;
        }));
    }, 
    /**
     * Verifies that the current tab is the primary leaseholder or alternatively
     * that the leaseholder has opted into multi-tab synchronization.
     */
    // TODO(b/114226234): Remove this check when `synchronizeTabs` can no longer
    // be turned off.
    t.prototype.Oi = function(t) {
        var e = this;
        return Yu(t).get("owner").next((function(t) {
            if (null !== t && e.Vi(t.leaseTimestampMs, 5e3) && !e.Ci(t.ownerId) && !e.Ri(t) && !(e.oi || e.allowTabSynchronization && t.allowTabSynchronization)) throw new Q(K.FAILED_PRECONDITION, Wu);
        }));
    }, 
    /**
     * Obtains or extends the new primary lease for the local client. This
     * method does not verify that the client is eligible for this lease.
     */
    t.prototype.vi = function(t) {
        var e = {
            ownerId: this.clientId,
            allowTabSynchronization: this.allowTabSynchronization,
            leaseTimestampMs: Date.now()
        };
        return Yu(t).put("owner", e);
    }, t.D = function() {
        return kt.D();
    }, 
    /** Checks the primary lease and removes it if we are the current primary. */ t.prototype.Ai = function(t) {
        var e = this, n = Yu(t);
        return n.get("owner").next((function(t) {
            return e.Ri(t) ? (M("IndexedDbPersistence", "Releasing primary lease."), n.delete("owner")) : Nt.resolve();
        }));
    }, 
    /** Verifies that `updateTimeMs` is within `maxAgeMs`. */ t.prototype.Vi = function(t, e) {
        var n = Date.now();
        return !(t < n - e || t > n && (L("Detected an update time that is in the future: ".concat(t, " > ").concat(n)), 
        1));
    }, t.prototype.gi = function() {
        var t = this;
        null !== this.document && "function" == typeof this.document.addEventListener && (this.ai = function() {
            t.ii.enqueueAndForget((function() {
                return t.inForeground = "visible" === t.document.visibilityState, t.mi();
            }));
        }, this.document.addEventListener("visibilitychange", this.ai), this.inForeground = "visible" === this.document.visibilityState);
    }, t.prototype.Ni = function() {
        this.ai && (this.document.removeEventListener("visibilitychange", this.ai), this.ai = null);
    }, 
    /**
     * Attaches a window.unload handler that will synchronously write our
     * clientId to a "zombie client id" location in LocalStorage. This can be used
     * by tabs trying to acquire the primary lease to determine that the lease
     * is no longer valid even if the timestamp is recent. This is particularly
     * important for the refresh case (so the tab correctly re-acquires the
     * primary lease). LocalStorage is used for this rather than IndexedDb because
     * it is a synchronous API and so can be used reliably from  an unload
     * handler.
     */
    t.prototype.yi = function() {
        var t, e = this;
        "function" == typeof (null === (t = this.window) || void 0 === t ? void 0 : t.addEventListener) && (this.ci = function() {
            // Note: In theory, this should be scheduled on the AsyncQueue since it
            // accesses internal state. We execute this code directly during shutdown
            // to make sure it gets a chance to run.
            e.xi();
            var t = /(?:Version|Mobile)\/1[456]/;
            p() && (navigator.appVersion.match(t) || navigator.userAgent.match(t)) && 
            // On Safari 14, 15, and 16, we do not run any cleanup actions as it might
            // trigger a bug that prevents Safari from re-opening IndexedDB during
            // the next page load.
            // See https://bugs.webkit.org/show_bug.cgi?id=226547
            e.ii.enterRestrictedMode(/* purgeExistingTasks= */ !0), e.ii.enqueueAndForget((function() {
                return e.shutdown();
            }));
        }, this.window.addEventListener("pagehide", this.ci));
    }, t.prototype.ki = function() {
        this.ci && (this.window.removeEventListener("pagehide", this.ci), this.ci = null);
    }, 
    /**
     * Returns whether a client is "zombied" based on its LocalStorage entry.
     * Clients become zombied when their tab closes without running all of the
     * cleanup logic in `shutdown()`.
     */
    t.prototype.Ci = function(t) {
        var e;
        try {
            var n = null !== (null === (e = this._i) || void 0 === e ? void 0 : e.getItem(this.Di(t)));
            return M("IndexedDbPersistence", "Client '".concat(t, "' ").concat(n ? "is" : "is not", " zombied in LocalStorage")), 
            n;
        } catch (t) {
            // Gracefully handle if LocalStorage isn't working.
            return L("IndexedDbPersistence", "Failed to get zombied client id.", t), !1;
        }
    }, 
    /**
     * Record client as zombied (a client that had its tab closed). Zombied
     * clients are ignored during primary tab selection.
     */
    t.prototype.xi = function() {
        if (this._i) try {
            this._i.setItem(this.Di(this.clientId), String(Date.now()));
        } catch (t) {
            // Gracefully handle if LocalStorage isn't available / working.
            L("Failed to set zombie client id.", t);
        }
    }, 
    /** Removes the zombied client entry if it exists. */ t.prototype.Mi = function() {
        if (this._i) try {
            this._i.removeItem(this.Di(this.clientId));
        } catch (t) {
            // Ignore
        }
    }, t.prototype.Di = function(t) {
        return "firestore_zombie_".concat(this.persistenceKey, "_").concat(t);
    }, t;
}();

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
/**
 * Helper to get a typed SimpleDbStore for the primary client object store.
 */
function Yu(t) {
    return we(t, "owner");
}

/**
 * Helper to get a typed SimpleDbStore for the client metadata object store.
 */ function Xu(t) {
    return we(t, "clientMetadata");
}

/**
 * Generates a string used as a prefix when storing data in IndexedDB and
 * LocalStorage.
 */ function Ju(t, e) {
    // Use two different prefix formats:
    //   * firestore / persistenceKey / projectID . databaseID / ...
    //   * firestore / persistenceKey / projectID / ...
    // projectIDs are DNS-compatible names and cannot contain dots
    // so there's no danger of collisions.
    var n = t.projectId;
    return t.isDefaultDatabase || (n += "." + t.database), "firestore/" + e + "/" + n + "/"
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
 */;
}

var Zu = /** @class */ function() {
    function t(t, e, n, r) {
        this.targetId = t, this.fromCache = e, this.Fi = n, this.Bi = r;
    }
    return t.Li = function(e, n) {
        for (var r = Ir(), i = Ir(), o = 0, u = n.docChanges; o < u.length; o++) {
            var a = u[o];
            switch (a.type) {
              case 0 /* ChangeType.Added */ :
                r = r.add(a.doc.key);
                break;

              case 1 /* ChangeType.Removed */ :
                i = i.add(a.doc.key);
                // do nothing
                        }
        }
        return new t(e, n.fromCache, r, i);
    }, t;
}(), $u = /** @class */ function() {
    function t() {
        this.qi = !1;
    }
    /** Sets the document view to query against. */    return t.prototype.initialize = function(t, e) {
        this.Ui = t, this.indexManager = e, this.qi = !0;
    }, 
    /** Returns all local documents matching the specified query. */ t.prototype.getDocumentsMatchingQuery = function(t, e, n, r) {
        var i = this;
        return this.Ki(t, e).next((function(o) {
            return o || i.Gi(t, e, r, n);
        })).next((function(n) {
            return n || i.Qi(t, e);
        }));
    }, 
    /**
     * Performs an indexed query that evaluates the query based on a collection's
     * persisted index values. Returns `null` if an index is not available.
     */
    t.prototype.Ki = function(t, e) {
        var n = this;
        if (Yn(e)) 
        // Queries that match all documents don't benefit from using
        // key-based lookups. It is more efficient to scan all documents in a
        // collection, rather than to perform individual lookups.
        return Nt.resolve(null);
        var r = tr(e);
        return this.indexManager.getIndexType(t, r).next((function(i) {
            return 0 /* IndexType.NONE */ === i ? null : (null !== e.limit && 1 /* IndexType.PARTIAL */ === i && (
            // We cannot apply a limit for targets that are served using a partial
            // index. If a partial index will be used to serve the target, the
            // query may return a superset of documents that match the target
            // (e.g. if the index doesn't include all the target's filters), or
            // may return the correct set of documents in the wrong order (e.g. if
            // the index doesn't include a segment for one of the orderBys).
            // Therefore, a limit should not be applied in such cases.
            e = nr(e, null, "F" /* LimitType.First */), r = tr(e)), n.indexManager.getDocumentsMatchingTarget(t, r).next((function(i) {
                var o = Ir.apply(void 0, i);
                return n.Ui.getDocuments(t, o).next((function(i) {
                    return n.indexManager.getMinOffset(t, r).next((function(r) {
                        var u = n.ji(e, i);
                        return n.zi(e, u, o, r.readTime) ? n.Ki(t, nr(e, null, "F" /* LimitType.First */)) : n.Wi(t, u, e, r);
                    }));
                }));
            })));
        }));
    }, 
    /**
     * Performs a query based on the target's persisted query mapping. Returns
     * `null` if the mapping is not available or cannot be used.
     */
    t.prototype.Gi = function(t, e, n, r) {
        var i = this;
        return Yn(e) || r.isEqual(ct.min()) ? this.Qi(t, e) : this.Ui.getDocuments(t, n).next((function(o) {
            var u = i.ji(e, o);
            return i.zi(e, u, n, r) ? i.Qi(t, e) : (R() <= h.DEBUG && M("QueryEngine", "Re-using previous result from %s to execute query: %s", r.toString(), or(e)), 
            i.Wi(t, u, e, Et(r, -1)));
        }));
        // Queries that have never seen a snapshot without limbo free documents
        // should also be run as a full collection scan.
        }, 
    /** Applies the query filter and sorting to the provided documents.  */ t.prototype.ji = function(t, e) {
        // Sort the documents and re-apply the query filter since previously
        // matching documents do not necessarily still match the query.
        var n = new De(sr(t));
        return e.forEach((function(e, r) {
            ur(t, r) && (n = n.add(r));
        })), n;
    }, 
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
     */
    t.prototype.zi = function(t, e, n, r) {
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
                var i = "F" /* LimitType.First */ === t.limitType ? e.last() : e.first();
        return !!i && (i.hasPendingWrites || i.version.compareTo(r) > 0);
    }, t.prototype.Qi = function(t, e) {
        return R() <= h.DEBUG && M("QueryEngine", "Using full collection scan to execute query:", or(e)), 
        this.Ui.getDocumentsMatchingQuery(t, e, St.min());
    }, 
    /**
     * Combines the results from an indexed execution with the remaining documents
     * that have not yet been indexed.
     */
    t.prototype.Wi = function(t, e, n, r) {
        // Retrieve all results for documents that were updated since the offset.
        return this.Ui.getDocumentsMatchingQuery(t, n, r).next((function(t) {
            // Merge with existing results
            return e.forEach((function(e) {
                t = t.insert(e.key, e);
            })), t;
        }));
    }, t;
}(), ta = /** @class */ function() {
    function t(
    /** Manages our in-memory or durable persistence. */
    t, e, n, r) {
        this.persistence = t, this.Hi = e, this.serializer = r, 
        /**
             * Maps a targetID to data about its target.
             *
             * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
             * of `applyRemoteEvent()` idempotent.
             */
        this.Ji = new Te(ot), 
        /** Maps a target to its targetID. */
        // TODO(wuandy): Evaluate if TargetId can be part of Target.
        this.Yi = new lr((function(t) {
            return Bn(t);
        }), Un), 
        /**
             * A per collection group index of the last read time processed by
             * `getNewDocumentChanges()`.
             *
             * PORTING NOTE: This is only used for multi-tab synchronization.
             */
        this.Xi = new Map, this.Zi = t.getRemoteDocumentCache(), this.Bs = t.getTargetCache(), 
        this.qs = t.getBundleCache(), this.tr(n);
    }
    return t.prototype.tr = function(t) {
        // TODO(indexing): Add spec tests that test these components change after a
        // user change
        this.documentOverlayCache = this.persistence.getDocumentOverlayCache(t), this.indexManager = this.persistence.getIndexManager(t), 
        this.mutationQueue = this.persistence.getMutationQueue(t, this.indexManager), this.localDocuments = new Ou(this.Zi, this.mutationQueue, this.documentOverlayCache, this.indexManager), 
        this.Zi.setIndexManager(this.indexManager), this.Hi.initialize(this.localDocuments, this.indexManager);
    }, t.prototype.collectGarbage = function(t) {
        var e = this;
        return this.persistence.runTransaction("Collect garbage", "readwrite-primary", (function(n) {
            return t.collect(n, e.Ji);
        }));
    }, t;
}();

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
 */ function ea(
/** Manages our in-memory or durable persistence. */
t, e, n, r) {
    return new ta(t, e, n, r);
}

/**
 * Tells the LocalStore that the currently authenticated user has changed.
 *
 * In response the local store switches the mutation queue to the new user and
 * returns any resulting document changes.
 */
// PORTING NOTE: Android and iOS only return the documents affected by the
// change.
function na(t, r) {
    return e(this, void 0, void 0, (function() {
        var e;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return [ 4 /*yield*/ , (e = j(t)).persistence.runTransaction("Handle user change", "readonly", (function(t) {
                    // Swap out the mutation queue, grabbing the pending mutation batches
                    // before and after.
                    var n;
                    return e.mutationQueue.getAllMutationBatches(t).next((function(i) {
                        return n = i, e.tr(r), e.mutationQueue.getAllMutationBatches(t);
                    })).next((function(r) {
                        for (var i = [], o = [], u = Ir(), a = 0, s = n
                        // Union the old/new changed keys.
                        ; a < s.length; a++) {
                            var c = s[a];
                            i.push(c.batchId);
                            for (var l = 0, h = c.mutations; l < h.length; l++) {
                                var f = h[l];
                                u = u.add(f.key);
                            }
                        }
                        for (var d = 0, p = r; d < p.length; d++) {
                            var v = p[d];
                            o.push(v.batchId);
                            for (var m = 0, y = v.mutations; m < y.length; m++) {
                                var g = y[m];
                                u = u.add(g.key);
                            }
                        }
                        // Return the set of all (potentially) changed documents and the list
                        // of mutation batch IDs that were affected by change.
                                                return e.localDocuments.getDocuments(t, u).next((function(t) {
                            return {
                                er: t,
                                removedBatchIds: i,
                                addedBatchIds: o
                            };
                        }));
                    }));
                })) ];

              case 1:
                return [ 2 /*return*/ , n.sent() ];
            }
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
 */ function ra(t, e) {
    var n = j(t);
    return n.persistence.runTransaction("Acknowledge batch", "readwrite-primary", (function(t) {
        var r = e.batch.keys(), i = n.Zi.newChangeBuffer({
            trackRemovals: !0
        });
        return function(t, e, n, r) {
            var i = n.batch, o = i.keys(), u = Nt.resolve();
            return o.forEach((function(t) {
                u = u.next((function() {
                    return r.getEntry(e, t);
                })).next((function(e) {
                    var o = n.docVersions.get(t);
                    z(null !== o), e.version.compareTo(o) < 0 && (i.applyToRemoteDocument(e, n), e.isValidDocument() && (
                    // We use the commitVersion as the readTime rather than the
                    // document's updateTime since the updateTime is not advanced
                    // for updates that do not modify the underlying document.
                    e.setReadTime(n.commitVersion), r.addEntry(e)));
                }));
            })), u.next((function() {
                return t.mutationQueue.removeMutationBatch(e, i);
            }));
        }(n, t, e, i).next((function() {
            return i.apply(t);
        })).next((function() {
            return n.mutationQueue.performConsistencyCheck(t);
        })).next((function() {
            return n.documentOverlayCache.removeOverlaysForBatchId(t, r, e.batch.batchId);
        })).next((function() {
            return n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(t, function(t) {
                for (var e = Ir(), n = 0; n < t.mutationResults.length; ++n) t.mutationResults[n].transformResults.length > 0 && (e = e.add(t.batch.mutations[n].key));
                return e;
            }(e));
        })).next((function() {
            return n.localDocuments.getDocuments(t, r);
        }));
    }));
}

/**
 * Returns the last consistent snapshot processed (used by the RemoteStore to
 * determine whether to buffer incoming snapshots from the backend).
 */ function ia(t) {
    var e = j(t);
    return e.persistence.runTransaction("Get last remote snapshot version", "readonly", (function(t) {
        return e.Bs.getLastRemoteSnapshotVersion(t);
    }));
}

/**
 * Updates the "ground-state" (remote) documents. We assume that the remote
 * event reflects any write batches that have been acknowledged or rejected
 * (i.e. we do not re-apply local mutations to updates from this event).
 *
 * LocalDocuments are re-calculated if there are remaining mutations in the
 * queue.
 */ function oa(t, e) {
    var n = j(t), r = e.snapshotVersion, i = n.Ji;
    return n.persistence.runTransaction("Apply remote event", "readwrite-primary", (function(t) {
        var o = n.Zi.newChangeBuffer({
            trackRemovals: !0
        });
        // Reset newTargetDataByTargetMap in case this transaction gets re-run.
                i = n.Ji;
        var u = [];
        e.targetChanges.forEach((function(o, a) {
            var s = i.get(a);
            if (s) {
                // Only update the remote keys if the target is still active. This
                // ensures that we can persist the updated target data along with
                // the updated assignment.
                u.push(n.Bs.removeMatchingKeys(t, o.removedDocuments, a).next((function() {
                    return n.Bs.addMatchingKeys(t, o.addedDocuments, a);
                })));
                var c = s.withSequenceNumber(t.currentSequenceNumber);
                null !== e.targetMismatches.get(a) ? c = c.withResumeToken(Oe.EMPTY_BYTE_STRING, ct.min()).withLastLimboFreeSnapshotVersion(ct.min()) : o.resumeToken.approximateByteSize() > 0 && (c = c.withResumeToken(o.resumeToken, r)), 
                i = i.insert(a, c), 
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
                    return 0 === t.resumeToken.approximateByteSize() || (
                    // Don't allow resume token changes to be buffered indefinitely. This
                    // allows us to be reasonably up-to-date after a crash and avoids needing
                    // to loop over all active queries on shutdown. Especially in the browser
                    // we may not get time to do anything interesting while the current tab is
                    // closing.
                    e.snapshotVersion.toMicroseconds() - t.snapshotVersion.toMicroseconds() >= 3e8 || n.addedDocuments.size + n.modifiedDocuments.size + n.removedDocuments.size > 0);
                }(s, c, o) && u.push(n.Bs.updateTargetData(t, c));
            }
        }));
        var a = fr(), s = Ir();
        // HACK: The only reason we allow a null snapshot version is so that we
        // can synthesize remote events when we get permission denied errors while
        // trying to resolve the state of a locally cached document that is in
        // limbo.
                if (e.documentUpdates.forEach((function(r) {
            e.resolvedLimboDocuments.has(r) && u.push(n.persistence.referenceDelegate.updateLimboDocument(t, r));
        })), 
        // Each loop iteration only affects its "own" doc, so it's safe to get all
        // the remote documents in advance in a single call.
        u.push(ua(t, o, e.documentUpdates).next((function(t) {
            a = t.nr, s = t.sr;
        }))), !r.isEqual(ct.min())) {
            var c = n.Bs.getLastRemoteSnapshotVersion(t).next((function(e) {
                return n.Bs.setTargetsMetadata(t, t.currentSequenceNumber, r);
            }));
            u.push(c);
        }
        return Nt.waitFor(u).next((function() {
            return o.apply(t);
        })).next((function() {
            return n.localDocuments.getLocalViewOfDocuments(t, a, s);
        })).next((function() {
            return a;
        }));
    })).then((function(t) {
        return n.Ji = i, t;
    }));
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
 */ function ua(t, e, n) {
    var r = Ir(), i = Ir();
    return n.forEach((function(t) {
        return r = r.add(t);
    })), e.getEntries(t, r).next((function(t) {
        var r = fr();
        return n.forEach((function(n, o) {
            var u = t.get(n);
            // Check if see if there is a existence state change for this document.
                        o.isFoundDocument() !== u.isFoundDocument() && (i = i.add(n)), 
            // Note: The order of the steps below is important, since we want
            // to ensure that rejected limbo resolutions (which fabricate
            // NoDocuments with SnapshotVersion.min()) never add documents to
            // cache.
            o.isNoDocument() && o.version.isEqual(ct.min()) ? (
            // NoDocuments with SnapshotVersion.min() are used in manufactured
            // events. We remove these documents from cache since we lost
            // access.
            e.removeEntry(n, o.readTime), r = r.insert(n, o)) : !u.isValidDocument() || o.version.compareTo(u.version) > 0 || 0 === o.version.compareTo(u.version) && u.hasPendingWrites ? (e.addEntry(o), 
            r = r.insert(n, o)) : M("LocalStore", "Ignoring outdated watch update for ", n, ". Current version:", u.version, " Watch version:", o.version);
        })), {
            nr: r,
            sr: i
        };
    }))
    /**
 * Gets the mutation batch after the passed in batchId in the mutation queue
 * or null if empty.
 * @param afterBatchId - If provided, the batch to search after.
 * @returns The next mutation or null if there wasn't one.
 */;
}

function aa(t, e) {
    var n = j(t);
    return n.persistence.runTransaction("Get next mutation batch", "readonly", (function(t) {
        return void 0 === e && (e = -1), n.mutationQueue.getNextMutationBatchAfterBatchId(t, e);
    }));
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
 */ function sa(t, e) {
    var n = j(t);
    return n.persistence.runTransaction("Allocate target", "readwrite", (function(t) {
        var r;
        return n.Bs.getTargetData(t, e).next((function(i) {
            return i ? (
            // This target has been listened to previously, so reuse the
            // previous targetID.
            // TODO(mcg): freshen last accessed date?
            r = i, Nt.resolve(r)) : n.Bs.allocateTargetId(t).next((function(i) {
                return r = new ao(e, i, "TargetPurposeListen" /* TargetPurpose.Listen */ , t.currentSequenceNumber), 
                n.Bs.addTargetData(t, r).next((function() {
                    return r;
                }));
            }));
        }));
    })).then((function(t) {
        // If Multi-Tab is enabled, the existing target data may be newer than
        // the in-memory data
        var r = n.Ji.get(t.targetId);
        return (null === r || t.snapshotVersion.compareTo(r.snapshotVersion) > 0) && (n.Ji = n.Ji.insert(t.targetId, t), 
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
function ca(t, r, i) {
    return e(this, void 0, void 0, (function() {
        var e, o, u, a;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                e = j(t), o = e.Ji.get(r), u = i ? "readwrite" : "readwrite-primary", n.label = 1;

              case 1:
                return n.trys.push([ 1, 4, , 5 ]), i ? [ 3 /*break*/ , 3 ] : [ 4 /*yield*/ , e.persistence.runTransaction("Release target", u, (function(t) {
                    return e.persistence.referenceDelegate.removeTarget(t, o);
                })) ];

              case 2:
                n.sent(), n.label = 3;

              case 3:
                return [ 3 /*break*/ , 5 ];

              case 4:
                if (!Pt(a = n.sent())) throw a;
                // All `releaseTarget` does is record the final metadata state for the
                // target, but we've been recording this periodically during target
                // activity. If we lose this write this could cause a very slight
                // difference in the order of target deletion during GC, but we
                // don't define exact LRU semantics so this is acceptable.
                                return M("LocalStore", "Failed to update sequence numbers for target ".concat(r, ": ").concat(a)), 
                [ 3 /*break*/ , 5 ];

              case 5:
                return e.Ji = e.Ji.remove(r), e.Yi.delete(o.target), [ 2 /*return*/ ];
            }
        }));
    }));
}

/**
 * Runs the specified query against the local store and returns the results,
 * potentially taking advantage of query data from previous executions (such
 * as the set of remote keys).
 *
 * @param usePreviousResults - Whether results from previous executions can
 * be used to optimize this query execution.
 */ function la(t, e, n) {
    var r = j(t), i = ct.min(), o = Ir();
    return r.persistence.runTransaction("Execute query", "readonly", (function(t) {
        return function(t, e, n) {
            var r = j(t), i = r.Yi.get(n);
            return void 0 !== i ? Nt.resolve(r.Ji.get(i)) : r.Bs.getTargetData(e, n);
        }(r, t, tr(e)).next((function(e) {
            if (e) return i = e.lastLimboFreeSnapshotVersion, r.Bs.getMatchingKeysForTargetId(t, e.targetId).next((function(t) {
                o = t;
            }));
        })).next((function() {
            return r.Hi.getDocumentsMatchingQuery(t, e, n ? i : ct.min(), n ? o : Ir());
        })).next((function(t) {
            return da(r, ar(e), t), {
                documents: t,
                ir: o
            };
        }));
    }));
}

// PORTING NOTE: Multi-Tab only.
function ha(t, e) {
    var n = j(t), r = j(n.Bs), i = n.Ji.get(e);
    return i ? Promise.resolve(i.target) : n.persistence.runTransaction("Get target data", "readonly", (function(t) {
        return r.le(t, e).next((function(t) {
            return t ? t.target : null;
        }));
    }));
}

/**
 * Returns the set of documents that have been updated since the last call.
 * If this is the first call, returns the set of changes since client
 * initialization. Further invocations will return document that have changed
 * since the prior call.
 */
// PORTING NOTE: Multi-Tab only.
function fa(t, e) {
    var n = j(t), r = n.Xi.get(e) || ct.min();
    // Get the current maximum read time for the collection. This should always
    // exist, but to reduce the chance for regressions we default to
    // SnapshotVersion.Min()
    // TODO(indexing): Consider removing the default value.
        return n.persistence.runTransaction("Get new document changes", "readonly", (function(t) {
        return n.Zi.getAllFromCollectionGroup(t, e, Et(r, -1), 
        /* limit= */ Number.MAX_SAFE_INTEGER);
    })).then((function(t) {
        return da(n, e, t), t;
    }));
}

/** Sets the collection group's maximum read time from the given documents. */
// PORTING NOTE: Multi-Tab only.
function da(t, e, n) {
    var r = t.Xi.get(e) || ct.min();
    n.forEach((function(t, e) {
        e.readTime.compareTo(r) > 0 && (r = e.readTime);
    })), t.Xi.set(e, r);
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
 */ function pa(t, r, i, o) {
    return e(this, void 0, void 0, (function() {
        var e, u, a, s, c, l, h, f, d, p;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                for (e = j(t), u = Ir(), a = fr(), s = 0, c = i; s < c.length; s++) l = c[s], h = r.rr(l.metadata.name), 
                l.document && (u = u.add(h)), (f = r.ur(l)).setReadTime(r.cr(l.metadata.readTime)), 
                a = a.insert(h, f);
                return d = e.Zi.newChangeBuffer({
                    trackRemovals: !0
                }), [ 4 /*yield*/ , sa(e, function(t) {
                    // It is OK that the path used for the query is not valid, because this will
                    // not be read and queried.
                    return tr(Hn(ht.fromString("__bundle__/docs/".concat(t))));
                }(o)) ];

              case 1:
                // Allocates a target to hold all document keys from the bundle, such that
                // they will not get garbage collected right away.
                return p = n.sent(), [ 2 /*return*/ , e.persistence.runTransaction("Apply bundle documents", "readwrite", (function(t) {
                    return ua(t, d, a).next((function(e) {
                        return d.apply(t), e;
                    })).next((function(n) {
                        return e.Bs.removeMatchingKeysForTargetId(t, p.targetId).next((function() {
                            return e.Bs.addMatchingKeys(t, u, p.targetId);
                        })).next((function() {
                            return e.localDocuments.getLocalViewOfDocuments(t, n.nr, n.sr);
                        })).next((function() {
                            return n.nr;
                        }));
                    }));
                })) ];
            }
        }));
    }));
}

/**
 * Returns a promise of a boolean to indicate if the given bundle has already
 * been loaded and the create time is newer than the current loading bundle.
 */
/**
 * Saves the given `NamedQuery` to local persistence.
 */ function va(t, r, i) {
    return void 0 === i && (i = Ir()), e(this, void 0, void 0, (function() {
        var e, o;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return [ 4 /*yield*/ , sa(t, tr(yo(r.bundledQuery))) ];

              case 1:
                return e = n.sent(), [ 2 /*return*/ , (o = j(t)).persistence.runTransaction("Save named query", "readwrite", (function(t) {
                    var n = Vi(r.readTime);
                    // Simply save the query itself if it is older than what the SDK already
                    // has.
                                        if (e.snapshotVersion.compareTo(n) >= 0) return o.qs.saveNamedQuery(t, r);
                    // Update existing target data because the query from the bundle is newer.
                                        var u = e.withResumeToken(Oe.EMPTY_BYTE_STRING, n);
                    return o.Ji = o.Ji.insert(u.targetId, u), o.Bs.updateTargetData(t, u).next((function() {
                        return o.Bs.removeMatchingKeysForTargetId(t, e.targetId);
                    })).next((function() {
                        return o.Bs.addMatchingKeys(t, i, e.targetId);
                    })).next((function() {
                        return o.qs.saveNamedQuery(t, r);
                    }));
                })) ];
            }
        }));
    }));
}

/** Assembles the key for a client state in WebStorage */ function ma(t, e) {
    return "firestore_clients_".concat(t, "_").concat(e);
}

// The format of the WebStorage key that stores the mutation state is:
//     firestore_mutations_<persistence_prefix>_<batch_id>
//     (for unauthenticated users)
// or: firestore_mutations_<persistence_prefix>_<batch_id>_<user_uid>
// 'user_uid' is last to avoid needing to escape '_' characters that it might
// contain.
/** Assembles the key for a mutation batch in WebStorage */ function ya(t, e, n) {
    var r = "firestore_mutations_".concat(t, "_").concat(n);
    return e.isAuthenticated() && (r += "_".concat(e.uid)), r;
}

// The format of the WebStorage key that stores a query target's metadata is:
//     firestore_targets_<persistence_prefix>_<target_id>
/** Assembles the key for a query state in WebStorage */ function ga(t, e) {
    return "firestore_targets_".concat(t, "_").concat(e);
}

// The WebStorage prefix that stores the primary tab's online state. The
// format of the key is:
//     firestore_online_state_<persistence_prefix>
/**
 * Holds the state of a mutation batch, including its user ID, batch ID and
 * whether the batch is 'pending', 'acknowledged' or 'rejected'.
 */
// Visible for testing
var wa = /** @class */ function() {
    function t(t, e, n, r) {
        this.user = t, this.batchId = e, this.state = n, this.error = r
        /**
     * Parses a MutationMetadata from its JSON representation in WebStorage.
     * Logs a warning and returns null if the format of the data is not valid.
     */;
    }
    return t.ar = function(e, n, r) {
        var i, o = JSON.parse(r), u = "object" == typeof o && -1 !== [ "pending", "acknowledged", "rejected" ].indexOf(o.state) && (void 0 === o.error || "object" == typeof o.error);
        return u && o.error && ((u = "string" == typeof o.error.message && "string" == typeof o.error.code) && (i = new Q(o.error.code, o.error.message))), 
        u ? new t(e, n, o.state, i) : (L("SharedClientState", "Failed to parse mutation state for ID '".concat(n, "': ").concat(r)), 
        null);
    }, t.prototype.hr = function() {
        var t = {
            state: this.state,
            updateTimeMs: Date.now()
        };
        return this.error && (t.error = {
            code: this.error.code,
            message: this.error.message
        }), JSON.stringify(t);
    }, t;
}(), ba = /** @class */ function() {
    function t(t, e, n) {
        this.targetId = t, this.state = e, this.error = n
        /**
     * Parses a QueryTargetMetadata from its JSON representation in WebStorage.
     * Logs a warning and returns null if the format of the data is not valid.
     */;
    }
    return t.ar = function(e, n) {
        var r, i = JSON.parse(n), o = "object" == typeof i && -1 !== [ "not-current", "current", "rejected" ].indexOf(i.state) && (void 0 === i.error || "object" == typeof i.error);
        return o && i.error && ((o = "string" == typeof i.error.message && "string" == typeof i.error.code) && (r = new Q(i.error.code, i.error.message))), 
        o ? new t(e, i.state, r) : (L("SharedClientState", "Failed to parse target state for ID '".concat(e, "': ").concat(n)), 
        null);
    }, t.prototype.hr = function() {
        var t = {
            state: this.state,
            updateTimeMs: Date.now()
        };
        return this.error && (t.error = {
            code: this.error.code,
            message: this.error.message
        }), JSON.stringify(t);
    }, t;
}(), Ia = /** @class */ function() {
    function t(t, e) {
        this.clientId = t, this.activeTargetIds = e
        /**
     * Parses a RemoteClientState from the JSON representation in WebStorage.
     * Logs a warning and returns null if the format of the data is not valid.
     */;
    }
    return t.ar = function(e, n) {
        for (var r = JSON.parse(n), i = "object" == typeof r && r.activeTargetIds instanceof Array, o = Tr(), u = 0; i && u < r.activeTargetIds.length; ++u) i = jt(r.activeTargetIds[u]), 
        o = o.add(r.activeTargetIds[u]);
        return i ? new t(e, o) : (L("SharedClientState", "Failed to parse client data for instance '".concat(e, "': ").concat(n)), 
        null);
    }, t;
}(), Ea = /** @class */ function() {
    function t(t, e) {
        this.clientId = t, this.onlineState = e
        /**
     * Parses a SharedOnlineState from its JSON representation in WebStorage.
     * Logs a warning and returns null if the format of the data is not valid.
     */;
    }
    return t.ar = function(e) {
        var n = JSON.parse(e);
        return "object" == typeof n && -1 !== [ "Unknown", "Online", "Offline" ].indexOf(n.onlineState) && "string" == typeof n.clientId ? new t(n.clientId, n.onlineState) : (L("SharedClientState", "Failed to parse online state: ".concat(e)), 
        null);
    }, t;
}(), Ta = /** @class */ function() {
    function t() {
        this.activeTargetIds = Tr();
    }
    return t.prototype.lr = function(t) {
        this.activeTargetIds = this.activeTargetIds.add(t);
    }, t.prototype.dr = function(t) {
        this.activeTargetIds = this.activeTargetIds.delete(t);
    }, 
    /**
     * Converts this entry into a JSON-encoded format we can use for WebStorage.
     * Does not encode `clientId` as it is part of the key in WebStorage.
     */
    t.prototype.hr = function() {
        var t = {
            activeTargetIds: this.activeTargetIds.toArray(),
            updateTimeMs: Date.now()
        };
        return JSON.stringify(t);
    }, t;
}(), Sa = /** @class */ function() {
    function t(t, e, n, r, i) {
        this.window = t, this.ii = e, this.persistenceKey = n, this.wr = r, this.syncEngine = null, 
        this.onlineStateHandler = null, this.sequenceNumberHandler = null, this._r = this.mr.bind(this), 
        this.gr = new Te(ot), this.started = !1, 
        /**
             * Captures WebStorage events that occur before `start()` is called. These
             * events are replayed once `WebStorageSharedClientState` is started.
             */
        this.yr = [];
        // Escape the special characters mentioned here:
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
        var o = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        this.storage = this.window.localStorage, this.currentUser = i, this.pr = ma(this.persistenceKey, this.wr), 
        this.Ir = 
        /** Assembles the key for the current sequence number. */
        function(t) {
            return "firestore_sequence_number_".concat(t);
        }(this.persistenceKey), this.gr = this.gr.insert(this.wr, new Ta), this.Tr = new RegExp("^firestore_clients_".concat(o, "_([^_]*)$")), 
        this.Er = new RegExp("^firestore_mutations_".concat(o, "_(\\d+)(?:_(.*))?$")), this.Ar = new RegExp("^firestore_targets_".concat(o, "_(\\d+)$")), 
        this.vr = 
        /** Assembles the key for the online state of the primary tab. */
        function(t) {
            return "firestore_online_state_".concat(t);
        }(this.persistenceKey), this.Rr = function(t) {
            return "firestore_bundle_loaded_v2_".concat(t);
        }(this.persistenceKey), 
        // Rather than adding the storage observer during start(), we add the
        // storage observer during initialization. This ensures that we collect
        // events before other components populate their initial state (during their
        // respective start() calls). Otherwise, we might for example miss a
        // mutation that is added after LocalStore's start() processed the existing
        // mutations but before we observe WebStorage events.
        this.window.addEventListener("storage", this._r);
    }
    /** Returns 'true' if WebStorage is available in the current environment. */    return t.D = function(t) {
        return !(!t || !t.localStorage);
    }, t.prototype.start = function() {
        return e(this, void 0, void 0, (function() {
            var t, e, r, i, o, u, a, s, c, l, h, f = this;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return [ 4 /*yield*/ , this.syncEngine.$i() ];

                  case 1:
                    for (t = n.sent(), e = 0, r = t; e < r.length; e++) (i = r[e]) !== this.wr && (o = this.getItem(ma(this.persistenceKey, i))) && (u = Ia.ar(i, o)) && (this.gr = this.gr.insert(u.clientId, u));
                    for (this.Pr(), (a = this.storage.getItem(this.vr)) && (s = this.br(a)) && this.Vr(s), 
                    c = 0, l = this.yr; c < l.length; c++) h = l[c], this.mr(h);
                    return this.yr = [], 
                    // Register a window unload hook to remove the client metadata entry from
                    // WebStorage even if `shutdown()` was not called.
                    this.window.addEventListener("pagehide", (function() {
                        return f.shutdown();
                    })), this.started = !0, [ 2 /*return*/ ];
                }
            }));
        }));
    }, t.prototype.writeSequenceNumber = function(t) {
        this.setItem(this.Ir, JSON.stringify(t));
    }, t.prototype.getAllActiveQueryTargets = function() {
        return this.Sr(this.gr);
    }, t.prototype.isActiveQueryTarget = function(t) {
        var e = !1;
        return this.gr.forEach((function(n, r) {
            r.activeTargetIds.has(t) && (e = !0);
        })), e;
    }, t.prototype.addPendingMutation = function(t) {
        this.Dr(t, "pending");
    }, t.prototype.updateMutationState = function(t, e, n) {
        this.Dr(t, e, n), 
        // Once a final mutation result is observed by other clients, they no longer
        // access the mutation's metadata entry. Since WebStorage replays events
        // in order, it is safe to delete the entry right after updating it.
        this.Cr(t);
    }, t.prototype.addLocalQueryTarget = function(t) {
        var e = "not-current";
        // Lookup an existing query state if the target ID was already registered
        // by another tab
                if (this.isActiveQueryTarget(t)) {
            var n = this.storage.getItem(ga(this.persistenceKey, t));
            if (n) {
                var r = ba.ar(t, n);
                r && (e = r.state);
            }
        }
        return this.Nr.lr(t), this.Pr(), e;
    }, t.prototype.removeLocalQueryTarget = function(t) {
        this.Nr.dr(t), this.Pr();
    }, t.prototype.isLocalQueryTarget = function(t) {
        return this.Nr.activeTargetIds.has(t);
    }, t.prototype.clearQueryState = function(t) {
        this.removeItem(ga(this.persistenceKey, t));
    }, t.prototype.updateQueryState = function(t, e, n) {
        this.kr(t, e, n);
    }, t.prototype.handleUserChange = function(t, e, n) {
        var r = this;
        e.forEach((function(t) {
            r.Cr(t);
        })), this.currentUser = t, n.forEach((function(t) {
            r.addPendingMutation(t);
        }));
    }, t.prototype.setOnlineState = function(t) {
        this.Mr(t);
    }, t.prototype.notifyBundleLoaded = function(t) {
        this.$r(t);
    }, t.prototype.shutdown = function() {
        this.started && (this.window.removeEventListener("storage", this._r), this.removeItem(this.pr), 
        this.started = !1);
    }, t.prototype.getItem = function(t) {
        var e = this.storage.getItem(t);
        return M("SharedClientState", "READ", t, e), e;
    }, t.prototype.setItem = function(t, e) {
        M("SharedClientState", "SET", t, e), this.storage.setItem(t, e);
    }, t.prototype.removeItem = function(t) {
        M("SharedClientState", "REMOVE", t), this.storage.removeItem(t);
    }, t.prototype.mr = function(t) {
        var r = this, i = t;
        // Note: The function is typed to take Event to be interface-compatible with
        // `Window.addEventListener`.
                if (i.storageArea === this.storage) {
            if (M("SharedClientState", "EVENT", i.key, i.newValue), i.key === this.pr) return void L("Received WebStorage notification for local change. Another client might have garbage-collected our state");
            this.ii.enqueueRetryable((function() {
                return e(r, void 0, void 0, (function() {
                    var t, e, r, o, u, a, s, c = this;
                    return n(this, (function(n) {
                        switch (n.label) {
                          case 0:
                            return this.started ? null === i.key ? [ 3 /*break*/ , 7 ] : this.Tr.test(i.key) ? null == i.newValue ? (t = this.Or(i.key), 
                            [ 2 /*return*/ , this.Fr(t, null) ]) : (e = this.Br(i.key, i.newValue)) ? [ 2 /*return*/ , this.Fr(e.clientId, e) ] : [ 3 /*break*/ , 7 ] : [ 3 /*break*/ , 1 ] : [ 3 /*break*/ , 8 ];

                          case 1:
                            return this.Er.test(i.key) ? null !== i.newValue && (r = this.Lr(i.key, i.newValue)) ? [ 2 /*return*/ , this.qr(r) ] : [ 3 /*break*/ , 7 ] : [ 3 /*break*/ , 2 ];

                          case 2:
                            return this.Ar.test(i.key) ? null !== i.newValue && (o = this.Ur(i.key, i.newValue)) ? [ 2 /*return*/ , this.Kr(o) ] : [ 3 /*break*/ , 7 ] : [ 3 /*break*/ , 3 ];

                          case 3:
                            return i.key !== this.vr ? [ 3 /*break*/ , 4 ] : null !== i.newValue && (u = this.br(i.newValue)) ? [ 2 /*return*/ , this.Vr(u) ] : [ 3 /*break*/ , 7 ];

                          case 4:
                            return i.key !== this.Ir ? [ 3 /*break*/ , 5 ] : (a = function(t) {
                                var e = Ut.ct;
                                if (null != t) try {
                                    var n = JSON.parse(t);
                                    z("number" == typeof n), e = n;
                                } catch (t) {
                                    L("SharedClientState", "Failed to read sequence number from WebStorage", t);
                                }
                                return e;
                            }(i.newValue), a !== Ut.ct && this.sequenceNumberHandler(a), [ 3 /*break*/ , 7 ]);

                          case 5:
                            return i.key !== this.Rr ? [ 3 /*break*/ , 7 ] : (s = this.Gr(i.newValue), [ 4 /*yield*/ , Promise.all(s.map((function(t) {
                                return c.syncEngine.Qr(t);
                            }))) ]);

                          case 6:
                            n.sent(), n.label = 7;

                          case 7:
                            return [ 3 /*break*/ , 9 ];

                          case 8:
                            this.yr.push(i), n.label = 9;

                          case 9:
                            return [ 2 /*return*/ ];
                        }
                    }));
                }));
            }));
        }
    }, Object.defineProperty(t.prototype, "Nr", {
        get: function() {
            return this.gr.get(this.wr);
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.Pr = function() {
        this.setItem(this.pr, this.Nr.hr());
    }, t.prototype.Dr = function(t, e, n) {
        var r = new wa(this.currentUser, t, e, n), i = ya(this.persistenceKey, this.currentUser, t);
        this.setItem(i, r.hr());
    }, t.prototype.Cr = function(t) {
        var e = ya(this.persistenceKey, this.currentUser, t);
        this.removeItem(e);
    }, t.prototype.Mr = function(t) {
        var e = {
            clientId: this.wr,
            onlineState: t
        };
        this.storage.setItem(this.vr, JSON.stringify(e));
    }, t.prototype.kr = function(t, e, n) {
        var r = ga(this.persistenceKey, t), i = new ba(t, e, n);
        this.setItem(r, i.hr());
    }, t.prototype.$r = function(t) {
        var e = JSON.stringify(Array.from(t));
        this.setItem(this.Rr, e);
    }, 
    /**
     * Parses a client state key in WebStorage. Returns null if the key does not
     * match the expected key format.
     */
    t.prototype.Or = function(t) {
        var e = this.Tr.exec(t);
        return e ? e[1] : null;
    }, 
    /**
     * Parses a client state in WebStorage. Returns 'null' if the value could not
     * be parsed.
     */
    t.prototype.Br = function(t, e) {
        var n = this.Or(t);
        return Ia.ar(n, e);
    }, 
    /**
     * Parses a mutation batch state in WebStorage. Returns 'null' if the value
     * could not be parsed.
     */
    t.prototype.Lr = function(t, e) {
        var n = this.Er.exec(t), r = Number(n[1]), i = void 0 !== n[2] ? n[2] : null;
        return wa.ar(new O(i), r, e);
    }, 
    /**
     * Parses a query target state from WebStorage. Returns 'null' if the value
     * could not be parsed.
     */
    t.prototype.Ur = function(t, e) {
        var n = this.Ar.exec(t), r = Number(n[1]);
        return ba.ar(r, e);
    }, 
    /**
     * Parses an online state from WebStorage. Returns 'null' if the value
     * could not be parsed.
     */
    t.prototype.br = function(t) {
        return Ea.ar(t);
    }, t.prototype.Gr = function(t) {
        return JSON.parse(t);
    }, t.prototype.qr = function(t) {
        return e(this, void 0, void 0, (function() {
            return n(this, (function(e) {
                return t.user.uid === this.currentUser.uid ? [ 2 /*return*/ , this.syncEngine.jr(t.batchId, t.state, t.error) ] : (M("SharedClientState", "Ignoring mutation for non-active user ".concat(t.user.uid)), 
                [ 2 /*return*/ ]);
            }));
        }));
    }, t.prototype.Kr = function(t) {
        return this.syncEngine.zr(t.targetId, t.state, t.error);
    }, t.prototype.Fr = function(t, e) {
        var n = this, r = e ? this.gr.insert(t, e) : this.gr.remove(t), i = this.Sr(this.gr), o = this.Sr(r), u = [], a = [];
        return o.forEach((function(t) {
            i.has(t) || u.push(t);
        })), i.forEach((function(t) {
            o.has(t) || a.push(t);
        })), this.syncEngine.Wr(u, a).then((function() {
            n.gr = r;
        }));
    }, t.prototype.Vr = function(t) {
        // We check whether the client that wrote this online state is still active
        // by comparing its client ID to the list of clients kept active in
        // IndexedDb. If a client does not update their IndexedDb client state
        // within 5 seconds, it is considered inactive and we don't emit an online
        // state event.
        this.gr.get(t.clientId) && this.onlineStateHandler(t.onlineState);
    }, t.prototype.Sr = function(t) {
        var e = Tr();
        return t.forEach((function(t, n) {
            e = e.unionWith(n.activeTargetIds);
        })), e;
    }, t;
}(), _a = /** @class */ function() {
    function t() {
        this.Hr = new Ta, this.Jr = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
    }
    return t.prototype.addPendingMutation = function(t) {
        // No op.
    }, t.prototype.updateMutationState = function(t, e, n) {
        // No op.
    }, t.prototype.addLocalQueryTarget = function(t) {
        return this.Hr.lr(t), this.Jr[t] || "not-current";
    }, t.prototype.updateQueryState = function(t, e, n) {
        this.Jr[t] = e;
    }, t.prototype.removeLocalQueryTarget = function(t) {
        this.Hr.dr(t);
    }, t.prototype.isLocalQueryTarget = function(t) {
        return this.Hr.activeTargetIds.has(t);
    }, t.prototype.clearQueryState = function(t) {
        delete this.Jr[t];
    }, t.prototype.getAllActiveQueryTargets = function() {
        return this.Hr.activeTargetIds;
    }, t.prototype.isActiveQueryTarget = function(t) {
        return this.Hr.activeTargetIds.has(t);
    }, t.prototype.start = function() {
        return this.Hr = new Ta, Promise.resolve();
    }, t.prototype.handleUserChange = function(t, e, n) {
        // No op.
    }, t.prototype.setOnlineState = function(t) {
        // No op.
    }, t.prototype.shutdown = function() {}, t.prototype.writeSequenceNumber = function(t) {}, 
    t.prototype.notifyBundleLoaded = function(t) {
        // No op.
    }, t;
}(), Da = /** @class */ function() {
    function t() {}
    return t.prototype.Yr = function(t) {
        // No-op.
    }, t.prototype.shutdown = function() {
        // No-op.
    }, t;
}(), Ca = /** @class */ function() {
    function t() {
        var t = this;
        this.Xr = function() {
            return t.Zr();
        }, this.eo = function() {
            return t.no();
        }, this.so = [], this.io();
    }
    return t.prototype.Yr = function(t) {
        this.so.push(t);
    }, t.prototype.shutdown = function() {
        window.removeEventListener("online", this.Xr), window.removeEventListener("offline", this.eo);
    }, t.prototype.io = function() {
        window.addEventListener("online", this.Xr), window.addEventListener("offline", this.eo);
    }, t.prototype.Zr = function() {
        M("ConnectivityMonitor", "Network connectivity changed: AVAILABLE");
        for (var t = 0, e = this.so; t < e.length; t++) {
            (0, e[t])(0 /* NetworkStatus.AVAILABLE */);
        }
    }, t.prototype.no = function() {
        M("ConnectivityMonitor", "Network connectivity changed: UNAVAILABLE");
        for (var t = 0, e = this.so; t < e.length; t++) {
            (0, e[t])(1 /* NetworkStatus.UNAVAILABLE */);
        }
    }, 
    // TODO(chenbrian): Consider passing in window either into this component or
    // here for testing via FakeWindow.
    /** Checks that all used attributes of window are available. */
    t.D = function() {
        return "undefined" != typeof window && void 0 !== window.addEventListener && void 0 !== window.removeEventListener;
    }, t;
}(), xa = null;

/**
 * Holds the state of a query target, including its target ID and whether the
 * target is 'not-current', 'current' or 'rejected'.
 */
// Visible for testing
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
function Na() {
    return null === xa ? xa = 268435456 + Math.round(2147483648 * Math.random()) : xa++, 
    "0x" + xa.toString(16)
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
 */;
}

var Aa = {
    BatchGetDocuments: "batchGet",
    Commit: "commit",
    RunQuery: "runQuery",
    RunAggregationQuery: "runAggregationQuery"
}, ka = /** @class */ function() {
    function t(t) {
        this.ro = t.ro, this.oo = t.oo;
    }
    return t.prototype.uo = function(t) {
        this.co = t;
    }, t.prototype.ao = function(t) {
        this.ho = t;
    }, t.prototype.onMessage = function(t) {
        this.lo = t;
    }, t.prototype.close = function() {
        this.oo();
    }, t.prototype.send = function(t) {
        this.ro(t);
    }, t.prototype.fo = function() {
        this.co();
    }, t.prototype.wo = function(t) {
        this.ho(t);
    }, t.prototype._o = function(t) {
        this.lo(t);
    }, t;
}(), Oa = "WebChannelConnection", Fa = /** @class */ function(e) {
    function n(t) {
        var n = this;
        return (n = e.call(this, t) || this).forceLongPolling = t.forceLongPolling, n.autoDetectLongPolling = t.autoDetectLongPolling, 
        n.useFetchStreams = t.useFetchStreams, n.longPollingOptions = t.longPollingOptions, 
        n;
    }
    /**
     * Base class for all Rest-based connections to the backend (WebChannel and
     * HTTP).
     */
    return t(n, e), n.prototype.Ao = function(t, e, n, r) {
        var i = Na();
        return new Promise((function(o, u) {
            var a = new I;
            a.setWithCredentials(!0), a.listenOnce(E.COMPLETE, (function() {
                try {
                    switch (a.getLastErrorCode()) {
                      case T.NO_ERROR:
                        var e = a.getResponseJson();
                        M(Oa, "XHR for RPC '".concat(t, "' ").concat(i, " received:"), JSON.stringify(e)), 
                        o(e);
                        break;

                      case T.TIMEOUT:
                        M(Oa, "RPC '".concat(t, "' ").concat(i, " timed out")), u(new Q(K.DEADLINE_EXCEEDED, "Request time out"));
                        break;

                      case T.HTTP_ERROR:
                        var n = a.getStatus();
                        if (M(Oa, "RPC '".concat(t, "' ").concat(i, " failed with status:"), n, "response text:", a.getResponseText()), 
                        n > 0) {
                            var r = a.getResponseJson();
                            Array.isArray(r) && (r = r[0]);
                            var s = null == r ? void 0 : r.error;
                            if (s && s.status && s.message) {
                                var c = function(t) {
                                    var e = t.toLowerCase().replace(/_/g, "-");
                                    return Object.values(K).indexOf(e) >= 0 ? e : K.UNKNOWN;
                                }(s.status);
                                u(new Q(c, s.message));
                            } else u(new Q(K.UNKNOWN, "Server responded with status " + a.getStatus()));
                        } else 
                        // If we received an HTTP_ERROR but there's no status code,
                        // it's most probably a connection issue
                        u(new Q(K.UNAVAILABLE, "Connection failed."));
                        break;

                      default:
                        U();
                    }
                } finally {
                    M(Oa, "RPC '".concat(t, "' ").concat(i, " completed."));
                }
            }));
            var s = JSON.stringify(r);
            M(Oa, "RPC '".concat(t, "' ").concat(i, " sending request:"), r), a.send(e, "POST", s, n, 15);
        }));
    }, n.prototype.Ro = function(t, e, n) {
        var r = Na(), i = [ this.mo, "/", "google.firestore.v1.Firestore", "/", t, "/channel" ], o = S(), u = _(), a = {
            // Required for backend stickiness, routing behavior is based on this
            // parameter.
            httpSessionIdParam: "gsessionid",
            initMessageHeaders: {},
            messageUrlParams: {
                // This param is used to improve routing and project isolation by the
                // backend and must be included in every request.
                database: "projects/".concat(this.databaseId.projectId, "/databases/").concat(this.databaseId.database)
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
        }, s = this.longPollingOptions.timeoutSeconds;
        void 0 !== s && (a.longPollingTimeout = Math.round(1e3 * s)), this.useFetchStreams && (a.xmlHttpFactory = new D({})), 
        this.Eo(a.initMessageHeaders, e, n), 
        // Sending the custom headers we just added to request.initMessageHeaders
        // (Authorization, etc.) will trigger the browser to make a CORS preflight
        // request because the XHR will no longer meet the criteria for a "simple"
        // CORS request:
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
        // Therefore to avoid the CORS preflight request (an extra network
        // roundtrip), we use the encodeInitMessageHeaders option to specify that
        // the headers should instead be encoded in the request's POST payload,
        // which is recognized by the webchannel backend.
        a.encodeInitMessageHeaders = !0;
        var c = i.join("");
        M(Oa, "Creating RPC '".concat(t, "' stream ").concat(r, ": ").concat(c), a);
        var l = o.createWebChannel(c, a), h = !1, f = !1, d = new ka({
            ro: function(e) {
                f ? M(Oa, "Not sending because RPC '".concat(t, "' stream ").concat(r, " is closed:"), e) : (h || (M(Oa, "Opening RPC '".concat(t, "' stream ").concat(r, " transport.")), 
                l.open(), h = !0), M(Oa, "RPC '".concat(t, "' stream ").concat(r, " sending:"), e), 
                l.send(e));
            },
            oo: function() {
                return l.close();
            }
        }), p = function(t, e, n) {
            // TODO(dimond): closure typing seems broken because WebChannel does
            // not implement goog.events.Listenable
            t.listen(e, (function(t) {
                try {
                    n(t);
                } catch (t) {
                    setTimeout((function() {
                        throw t;
                    }), 0);
                }
            }));
        };
        // WebChannel supports sending the first message with the handshake - saving
        // a network round trip. However, it will have to call send in the same
        // JS event loop as open. In order to enforce this, we delay actually
        // opening the WebChannel until send is called. Whether we have called
        // open is tracked with this variable.
                // Closure events are guarded and exceptions are swallowed, so catch any
        // exception and rethrow using a setTimeout so they become visible again.
        // Note that eventually this function could go away if we are confident
        // enough the code is exception free.
        return p(l, C.EventType.OPEN, (function() {
            f || M(Oa, "RPC '".concat(t, "' stream ").concat(r, " transport opened."));
        })), p(l, C.EventType.CLOSE, (function() {
            f || (f = !0, M(Oa, "RPC '".concat(t, "' stream ").concat(r, " transport closed")), 
            d.wo());
        })), p(l, C.EventType.ERROR, (function(e) {
            f || (f = !0, q(Oa, "RPC '".concat(t, "' stream ").concat(r, " transport errored:"), e), 
            d.wo(new Q(K.UNAVAILABLE, "The operation could not be completed")));
        })), p(l, C.EventType.MESSAGE, (function(e) {
            var n;
            if (!f) {
                var i = e.data[0];
                z(!!i);
                // TODO(b/35143891): There is a bug in One Platform that caused errors
                // (and only errors) to be wrapped in an extra array. To be forward
                // compatible with the bug we need to check either condition. The latter
                // can be removed once the fix has been rolled out.
                // Use any because msgData.error is not typed.
                var o = i, u = o.error || (null === (n = o[0]) || void 0 === n ? void 0 : n.error);
                if (u) {
                    M(Oa, "RPC '".concat(t, "' stream ").concat(r, " received error:"), u);
                    // error.status will be a string like 'OK' or 'NOT_FOUND'.
                    var a = u.status, s = 
                    /**
 * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
 *
 * @returns The Code equivalent to the given status string or undefined if
 *     there is no match.
 */
                    function(t) {
                        // lookup by string
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        var e = ti[t];
                        if (void 0 !== e) return li(e);
                    }(a), c = u.message;
                    void 0 === s && (s = K.INTERNAL, c = "Unknown error status: " + a + " with message " + u.message), 
                    // Mark closed so no further events are propagated
                    f = !0, d.wo(new Q(s, c)), l.close();
                } else M(Oa, "RPC '".concat(t, "' stream ").concat(r, " received:"), i), d._o(i);
            }
        })), p(u, x.STAT_EVENT, (function(e) {
            e.stat === N.PROXY ? M(Oa, "RPC '".concat(t, "' stream ").concat(r, " detected buffering proxy")) : e.stat === N.NOPROXY && M(Oa, "RPC '".concat(t, "' stream ").concat(r, " detected no buffering proxy"));
        })), setTimeout((function() {
            // Technically we could/should wait for the WebChannel opened event,
            // but because we want to send the first message with the WebChannel
            // handshake we pretend the channel opened here (asynchronously), and
            // then delay the actual open until the first message is sent.
            d.fo();
        }), 0), d;
    }, n;
}(/** @class */ function() {
    function t(t) {
        this.databaseInfo = t, this.databaseId = t.databaseId;
        var e = t.ssl ? "https" : "http";
        this.mo = e + "://" + t.host, this.yo = "projects/" + this.databaseId.projectId + "/databases/" + this.databaseId.database + "/documents";
    }
    return Object.defineProperty(t.prototype, "po", {
        get: function() {
            // Both `invokeRPC()` and `invokeStreamingRPC()` use their `path` arguments to determine
            // where to run the query, and expect the `request` to NOT specify the "path".
            return !1;
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.Io = function(t, e, n, r, i) {
        var o = Na(), u = this.To(t, e);
        M("RestConnection", "Sending RPC '".concat(t, "' ").concat(o, ":"), u, n);
        var a = {};
        return this.Eo(a, r, i), this.Ao(t, u, a, n).then((function(e) {
            return M("RestConnection", "Received RPC '".concat(t, "' ").concat(o, ": "), e), 
            e;
        }), (function(e) {
            throw q("RestConnection", "RPC '".concat(t, "' ").concat(o, " failed with error: "), e, "url: ", u, "request:", n), 
            e;
        }));
    }, t.prototype.vo = function(t, e, n, r, i, o) {
        // The REST API automatically aggregates all of the streamed results, so we
        // can just use the normal invoke() method.
        return this.Io(t, e, n, r, i);
    }, 
    /**
     * Modifies the headers for a request, adding any authorization token if
     * present and any additional headers for the request.
     */
    t.prototype.Eo = function(t, e, n) {
        t["X-Goog-Api-Client"] = "gl-js/ fire/" + F, 
        // Content-Type: text/plain will avoid preflight requests which might
        // mess with CORS and redirects by proxies. If we add custom headers
        // we will need to change this code to potentially use the $httpOverwrite
        // parameter supported by ESF to avoid triggering preflight requests.
        t["Content-Type"] = "text/plain", this.databaseInfo.appId && (t["X-Firebase-GMPID"] = this.databaseInfo.appId), 
        e && e.headers.forEach((function(e, n) {
            return t[n] = e;
        })), n && n.headers.forEach((function(e, n) {
            return t[n] = e;
        }));
    }, t.prototype.To = function(t, e) {
        var n = Aa[t];
        return "".concat(this.mo, "/v1/").concat(e, ":").concat(n);
    }, t;
}());

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
function Pa() {
    // `window` is not always available, e.g. in ReactNative and WebWorkers.
    // eslint-disable-next-line no-restricted-globals
    return "undefined" != typeof window ? window : null;
}

/** The Platform's 'document' implementation or null if not available. */ function Ra() {
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
 */ function Va(t) {
    return new ki(t, /* useProto3Json= */ !0);
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
 */ var Ma = /** @class */ function() {
    function t(
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
    n
    /**
     * The multiplier to use to determine the extended base delay after each
     * attempt.
     */ , r
    /**
     * The maximum base delay after which no further backoff is performed.
     * Note that jitter will still be applied, so the actual delay could be as
     * much as 1.5*maxDelayMs.
     */ , i) {
        void 0 === n && (n = 1e3), void 0 === r && (r = 1.5), void 0 === i && (i = 6e4), 
        this.ii = t, this.timerId = e, this.Po = n, this.bo = r, this.Vo = i, this.So = 0, 
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
     */    return t.prototype.reset = function() {
        this.So = 0;
    }, 
    /**
     * Resets the backoff delay to the maximum delay (e.g. for use after a
     * RESOURCE_EXHAUSTED error).
     */
    t.prototype.xo = function() {
        this.So = this.Vo;
    }, 
    /**
     * Returns a promise that resolves after currentDelayMs, and increases the
     * delay for any subsequent attempts. If there was a pending backoff operation
     * already, it will be canceled.
     */
    t.prototype.No = function(t) {
        var e = this;
        // Cancel any pending backoff operation.
                this.cancel();
        // First schedule using the current base (which may be 0 and should be
        // honored as such).
        var n = Math.floor(this.So + this.ko()), r = Math.max(0, Date.now() - this.Co), i = Math.max(0, n - r);
        // Guard against lastAttemptTime being in the future due to a clock change.
                i > 0 && M("ExponentialBackoff", "Backing off for ".concat(i, " ms (base delay: ").concat(this.So, " ms, delay with jitter: ").concat(n, " ms, last attempt: ").concat(r, " ms ago)")), 
        this.Do = this.ii.enqueueAfterDelay(this.timerId, i, (function() {
            return e.Co = Date.now(), t();
        })), 
        // Apply backoff factor to determine next delay and ensure it is within
        // bounds.
        this.So *= this.bo, this.So < this.Po && (this.So = this.Po), this.So > this.Vo && (this.So = this.Vo);
    }, t.prototype.Mo = function() {
        null !== this.Do && (this.Do.skipDelay(), this.Do = null);
    }, t.prototype.cancel = function() {
        null !== this.Do && (this.Do.cancel(), this.Do = null);
    }, 
    /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */ t.prototype.ko = function() {
        return (Math.random() - .5) * this.So;
    }, t;
}(), La = /** @class */ function() {
    function t(t, e, n, r, i, o, u, a) {
        this.ii = t, this.$o = n, this.Oo = r, this.connection = i, this.authCredentialsProvider = o, 
        this.appCheckCredentialsProvider = u, this.listener = a, this.state = 0 /* PersistentStreamState.Initial */ , 
        /**
             * A close count that's incremented every time the stream is closed; used by
             * getCloseGuardedDispatcher() to invalidate callbacks that happen after
             * close.
             */
        this.Fo = 0, this.Bo = null, this.Lo = null, this.stream = null, this.qo = new Ma(t, e)
        /**
     * Returns true if start() has been called and no error has occurred. True
     * indicates the stream is open or in the process of opening (which
     * encompasses respecting backoff, getting auth tokens, and starting the
     * actual RPC). Use isOpen() to determine if the stream is open and ready for
     * outbound requests.
     */;
    }
    return t.prototype.Uo = function() {
        return 1 /* PersistentStreamState.Starting */ === this.state || 5 /* PersistentStreamState.Backoff */ === this.state || this.Ko();
    }, 
    /**
     * Returns true if the underlying RPC is open (the onOpen() listener has been
     * called) and the stream is ready for outbound requests.
     */
    t.prototype.Ko = function() {
        return 2 /* PersistentStreamState.Open */ === this.state || 3 /* PersistentStreamState.Healthy */ === this.state;
    }, 
    /**
     * Starts the RPC. Only allowed if isStarted() returns false. The stream is
     * not immediately ready for use: onOpen() will be invoked when the RPC is
     * ready for outbound requests, at which point isOpen() will return true.
     *
     * When start returns, isStarted() will return true.
     */
    t.prototype.start = function() {
        4 /* PersistentStreamState.Error */ !== this.state ? this.auth() : this.Go();
    }, 
    /**
     * Stops the RPC. This call is idempotent and allowed regardless of the
     * current isStarted() state.
     *
     * When stop returns, isStarted() and isOpen() will both return false.
     */
    t.prototype.stop = function() {
        return e(this, void 0, void 0, (function() {
            return n(this, (function(t) {
                switch (t.label) {
                  case 0:
                    return this.Uo() ? [ 4 /*yield*/ , this.close(0 /* PersistentStreamState.Initial */) ] : [ 3 /*break*/ , 2 ];

                  case 1:
                    t.sent(), t.label = 2;

                  case 2:
                    return [ 2 /*return*/ ];
                }
            }));
        }));
    }, 
    /**
     * After an error the stream will usually back off on the next attempt to
     * start it. If the error warrants an immediate restart of the stream, the
     * sender can use this to indicate that the receiver should not back off.
     *
     * Each error will call the onClose() listener. That function can decide to
     * inhibit backoff if required.
     */
    t.prototype.Qo = function() {
        this.state = 0 /* PersistentStreamState.Initial */ , this.qo.reset();
    }, 
    /**
     * Marks this stream as idle. If no further actions are performed on the
     * stream for one minute, the stream will automatically close itself and
     * notify the stream's onClose() handler with Status.OK. The stream will then
     * be in a !isStarted() state, requiring the caller to start the stream again
     * before further use.
     *
     * Only streams that are in state 'Open' can be marked idle, as all other
     * states imply pending network operations.
     */
    t.prototype.jo = function() {
        var t = this;
        // Starts the idle time if we are in state 'Open' and are not yet already
        // running a timer (in which case the previous idle timeout still applies).
                this.Ko() && null === this.Bo && (this.Bo = this.ii.enqueueAfterDelay(this.$o, 6e4, (function() {
            return t.zo();
        })));
    }, 
    /** Sends a message to the underlying stream. */ t.prototype.Wo = function(t) {
        this.Ho(), this.stream.send(t);
    }, 
    /** Called by the idle timer when the stream should close due to inactivity. */ t.prototype.zo = function() {
        return e(this, void 0, void 0, (function() {
            return n(this, (function(t) {
                return this.Ko() ? [ 2 /*return*/ , this.close(0 /* PersistentStreamState.Initial */) ] : [ 2 /*return*/ ];
            }));
        }));
    }, 
    /** Marks the stream as active again. */ t.prototype.Ho = function() {
        this.Bo && (this.Bo.cancel(), this.Bo = null);
    }, 
    /** Cancels the health check delayed operation. */ t.prototype.Jo = function() {
        this.Lo && (this.Lo.cancel(), this.Lo = null);
    }, 
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
     */
    t.prototype.close = function(t, r) {
        return e(this, void 0, void 0, (function() {
            return n(this, (function(e) {
                switch (e.label) {
                  case 0:
                    // Notify the listener that the stream closed.
                    // Cancel any outstanding timers (they're guaranteed not to execute).
                    return this.Ho(), this.Jo(), this.qo.cancel(), 
                    // Invalidates any stream-related callbacks (e.g. from auth or the
                    // underlying stream), guaranteeing they won't execute.
                    this.Fo++, 4 /* PersistentStreamState.Error */ !== t ? 
                    // If this is an intentional close ensure we don't delay our next connection attempt.
                    this.qo.reset() : r && r.code === K.RESOURCE_EXHAUSTED ? (
                    // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
                    L(r.toString()), L("Using maximum backoff delay to prevent overloading the backend."), 
                    this.qo.xo()) : r && r.code === K.UNAUTHENTICATED && 3 /* PersistentStreamState.Healthy */ !== this.state && (
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
                    this.state = t, [ 4 /*yield*/ , this.listener.ao(r) ];

                  case 1:
                    // Cancel any outstanding timers (they're guaranteed not to execute).
                    // Notify the listener that the stream closed.
                    return e.sent(), [ 2 /*return*/ ];
                }
            }));
        }));
    }, 
    /**
     * Can be overridden to perform additional cleanup before the stream is closed.
     * Calling super.tearDown() is not required.
     */
    t.prototype.Yo = function() {}, t.prototype.auth = function() {
        var t = this;
        this.state = 1 /* PersistentStreamState.Starting */;
        var e = this.Xo(this.Fo), n = this.Fo;
        // TODO(mikelehen): Just use dispatchIfNotClosed, but see TODO below.
                Promise.all([ this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken() ]).then((function(e) {
            var r = e[0], i = e[1];
            // Stream can be stopped while waiting for authentication.
            // TODO(mikelehen): We really should just use dispatchIfNotClosed
            // and let this dispatch onto the queue, but that opened a spec test can
            // of worms that I don't want to deal with in this PR.
                        t.Fo === n && 
            // Normally we'd have to schedule the callback on the AsyncQueue.
            // However, the following calls are safe to be called outside the
            // AsyncQueue since they don't chain asynchronous calls
            t.Zo(r, i);
        }), (function(n) {
            e((function() {
                var e = new Q(K.UNKNOWN, "Fetching auth token failed: " + n.message);
                return t.tu(e);
            }));
        }));
    }, t.prototype.Zo = function(t, e) {
        var n = this, r = this.Xo(this.Fo);
        this.stream = this.eu(t, e), this.stream.uo((function() {
            r((function() {
                return n.state = 2 /* PersistentStreamState.Open */ , n.Lo = n.ii.enqueueAfterDelay(n.Oo, 1e4, (function() {
                    return n.Ko() && (n.state = 3 /* PersistentStreamState.Healthy */), Promise.resolve();
                })), n.listener.uo();
            }));
        })), this.stream.ao((function(t) {
            r((function() {
                return n.tu(t);
            }));
        })), this.stream.onMessage((function(t) {
            r((function() {
                return n.onMessage(t);
            }));
        }));
    }, t.prototype.Go = function() {
        var t = this;
        this.state = 5 /* PersistentStreamState.Backoff */ , this.qo.No((function() {
            return e(t, void 0, void 0, (function() {
                return n(this, (function(t) {
                    return this.state = 0 /* PersistentStreamState.Initial */ , this.start(), [ 2 /*return*/ ];
                }));
            }));
        }));
    }, 
    // Visible for tests
    t.prototype.tu = function(t) {
        // In theory the stream could close cleanly, however, in our current model
        // we never expect this to happen because if we stop a stream ourselves,
        // this callback will never be called. To prevent cases where we retry
        // without a backoff accidentally, we set the stream to error in all cases.
        return M("PersistentStream", "close with error: ".concat(t)), this.stream = null, 
        this.close(4 /* PersistentStreamState.Error */ , t);
    }, 
    /**
     * Returns a "dispatcher" function that dispatches operations onto the
     * AsyncQueue but only runs them if closeCount remains unchanged. This allows
     * us to turn auth / stream callbacks into no-ops if the stream is closed /
     * re-opened, etc.
     */
    t.prototype.Xo = function(t) {
        var e = this;
        return function(n) {
            e.ii.enqueueAndForget((function() {
                return e.Fo === t ? n() : (M("PersistentStream", "stream callback skipped by getCloseGuardedDispatcher."), 
                Promise.resolve());
            }));
        };
    }, t;
}(), qa = /** @class */ function(e) {
    function n(t, n, r, i, o, u) {
        var a = this;
        return (a = e.call(this, t, "listen_stream_connection_backoff" /* TimerId.ListenStreamConnectionBackoff */ , "listen_stream_idle" /* TimerId.ListenStreamIdle */ , "health_check_timeout" /* TimerId.HealthCheckTimeout */ , n, r, i, u) || this).serializer = o, 
        a;
    }
    return t(n, e), n.prototype.eu = function(t, e) {
        return this.connection.Ro("Listen", t, e);
    }, n.prototype.onMessage = function(t) {
        // A successful response means the stream is healthy
        this.qo.reset();
        var e = function(t, e) {
            var n;
            if ("targetChange" in e) {
                e.targetChange;
                // proto3 default value is unset in JSON (undefined), so use 'NO_CHANGE'
                // if unset
                var r = function(t) {
                    return "NO_CHANGE" === t ? 0 /* WatchTargetChangeState.NoChange */ : "ADD" === t ? 1 /* WatchTargetChangeState.Added */ : "REMOVE" === t ? 2 /* WatchTargetChangeState.Removed */ : "CURRENT" === t ? 3 /* WatchTargetChangeState.Current */ : "RESET" === t ? 4 /* WatchTargetChangeState.Reset */ : U();
                }(e.targetChange.targetChangeType || "NO_CHANGE"), i = e.targetChange.targetIds || [], o = function(t, e) {
                    return t.useProto3Json ? (z(void 0 === e || "string" == typeof e), Oe.fromBase64String(e || "")) : (z(void 0 === e || e instanceof Uint8Array), 
                    Oe.fromUint8Array(e || new Uint8Array));
                }(t, e.targetChange.resumeToken), u = e.targetChange.cause, a = u && function(t) {
                    var e = void 0 === t.code ? K.UNKNOWN : li(t.code);
                    return new Q(e, t.message || "");
                }(u);
                n = new Ti(r, i, o, a || null);
            } else if ("documentChange" in e) {
                e.documentChange;
                var s = e.documentChange;
                s.document, s.document.name, s.document.updateTime;
                var c = Bi(t, s.document.name), l = Vi(s.document.updateTime), h = s.document.createTime ? Vi(s.document.createTime) : ct.min(), f = new hn({
                    mapValue: {
                        fields: s.document.fields
                    }
                }), d = dn.newFoundDocument(c, l, h, f), p = s.targetIds || [], v = s.removedTargetIds || [];
                n = new Ii(p, v, d.key, d);
            } else if ("documentDelete" in e) {
                e.documentDelete;
                var m = e.documentDelete;
                m.document;
                var y = Bi(t, m.document), g = m.readTime ? Vi(m.readTime) : ct.min(), w = dn.newNoDocument(y, g), b = m.removedTargetIds || [];
                n = new Ii([], b, w.key, w);
            } else if ("documentRemove" in e) {
                e.documentRemove;
                var I = e.documentRemove;
                I.document;
                var E = Bi(t, I.document), T = I.removedTargetIds || [];
                n = new Ii([], T, E, null);
            } else {
                if (!("filter" in e)) return U();
                e.filter;
                var S = e.filter;
                S.targetId;
                var _ = S.count, D = void 0 === _ ? 0 : _, C = S.unchangedNames, x = new si(D, C), N = S.targetId;
                n = new Ei(N, x);
            }
            return n;
        }(this.serializer, t), n = function(t) {
            // We have only reached a consistent snapshot for the entire stream if there
            // is a read_time set and it applies to all targets (i.e. the list of
            // targets is empty). The backend is guaranteed to send such responses.
            if (!("targetChange" in t)) return ct.min();
            var e = t.targetChange;
            return e.targetIds && e.targetIds.length ? ct.min() : e.readTime ? Vi(e.readTime) : ct.min();
        }(t);
        return this.listener.nu(e, n);
    }, 
    /**
     * Registers interest in the results of the given target. If the target
     * includes a resumeToken it will be included in the request. Results that
     * affect the target will be streamed back as WatchChange messages that
     * reference the targetId.
     */
    n.prototype.su = function(t) {
        var e = {};
        e.database = Gi(this.serializer), e.addTarget = function(t, e) {
            var n, r = e.target;
            if ((n = zn(r) ? {
                documents: Yi(t, r)
            } : {
                query: Xi(t, r)
            }).targetId = e.targetId, e.resumeToken.approximateByteSize() > 0) {
                n.resumeToken = Pi(t, e.resumeToken);
                var i = Oi(t, e.expectedCount);
                null !== i && (n.expectedCount = i);
            } else if (e.snapshotVersion.compareTo(ct.min()) > 0) {
                // TODO(wuandy): Consider removing above check because it is most likely true.
                // Right now, many tests depend on this behaviour though (leaving min() out
                // of serialization).
                n.readTime = Fi(t, e.snapshotVersion.toTimestamp());
                var o = Oi(t, e.expectedCount);
                null !== o && (n.expectedCount = o);
            }
            return n;
        }(this.serializer, t);
        var n = function(t, e) {
            var n = function(t) {
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
                    return U();
                }
            }(e.purpose);
            return null == n ? null : {
                "goog-listen-tags": n
            };
        }(this.serializer, t);
        n && (e.labels = n), this.Wo(e);
    }, 
    /**
     * Unregisters interest in the results of the target associated with the
     * given targetId.
     */
    n.prototype.iu = function(t) {
        var e = {};
        e.database = Gi(this.serializer), e.removeTarget = t, this.Wo(e);
    }, n;
}(La), Ba = /** @class */ function(e) {
    function n(t, n, r, i, o, u) {
        var a = this;
        return (a = e.call(this, t, "write_stream_connection_backoff" /* TimerId.WriteStreamConnectionBackoff */ , "write_stream_idle" /* TimerId.WriteStreamIdle */ , "health_check_timeout" /* TimerId.HealthCheckTimeout */ , n, r, i, u) || this).serializer = o, 
        a.ru = !1, a;
    }
    return t(n, e), Object.defineProperty(n.prototype, "ou", {
        /**
         * Tracks whether or not a handshake has been successfully exchanged and
         * the stream is ready to accept mutations.
         */
        get: function() {
            return this.ru;
        },
        enumerable: !1,
        configurable: !0
    }), 
    // Override of PersistentStream.start
    n.prototype.start = function() {
        this.ru = !1, this.lastStreamToken = void 0, e.prototype.start.call(this);
    }, n.prototype.Yo = function() {
        this.ru && this.uu([]);
    }, n.prototype.eu = function(t, e) {
        return this.connection.Ro("Write", t, e);
    }, n.prototype.onMessage = function(t) {
        if (
        // Always capture the last stream token.
        z(!!t.streamToken), this.lastStreamToken = t.streamToken, this.ru) {
            // A successful first write response means the stream is healthy,
            // Note, that we could consider a successful handshake healthy, however,
            // the write itself might be causing an error we want to back off from.
            this.qo.reset();
            var e = function(t, e) {
                return t && t.length > 0 ? (z(void 0 !== e), t.map((function(t) {
                    return function(t, e) {
                        // NOTE: Deletes don't have an updateTime.
                        var n = t.updateTime ? Vi(t.updateTime) : Vi(e);
                        return n.isEqual(ct.min()) && (
                        // The Firestore Emulator currently returns an update time of 0 for
                        // deletes of non-existing documents (rather than null). This breaks the
                        // test "get deleted doc while offline with source=cache" as NoDocuments
                        // with version 0 are filtered by IndexedDb's RemoteDocumentCache.
                        // TODO(#2149): Remove this when Emulator is fixed
                        n = Vi(e)), new Br(n, t.transformResults || []);
                    }(t, e);
                }))) : [];
            }(t.writeResults, t.commitTime), n = Vi(t.commitTime);
            return this.listener.cu(n, e);
        }
        // The first response is always the handshake response
                return z(!t.writeResults || 0 === t.writeResults.length), this.ru = !0, 
        this.listener.au();
    }, 
    /**
     * Sends an initial streamToken to the server, performing the handshake
     * required to make the StreamingWrite RPC work. Subsequent
     * calls should wait until onHandshakeComplete was called.
     */
    n.prototype.hu = function() {
        // TODO(dimond): Support stream resumption. We intentionally do not set the
        // stream token on the handshake, ignoring any stream token we might have.
        var t = {};
        t.database = Gi(this.serializer), this.Wo(t);
    }, 
    /** Sends a group of mutations to the Firestore backend to apply. */ n.prototype.uu = function(t) {
        var e = this, n = {
            streamToken: this.lastStreamToken,
            writes: t.map((function(t) {
                return Wi(e.serializer, t);
            }))
        };
        this.Wo(n);
    }, n;
}(La), Ua = /** @class */ function(e) {
    function n(t, n, r, i) {
        var o = this;
        return (o = e.call(this) || this).authCredentials = t, o.appCheckCredentials = n, 
        o.connection = r, o.serializer = i, o.lu = !1, o;
    }
    return t(n, e), n.prototype.fu = function() {
        if (this.lu) throw new Q(K.FAILED_PRECONDITION, "The client has already been terminated.");
    }, 
    /** Invokes the provided RPC with auth and AppCheck tokens. */ n.prototype.Io = function(t, e, n) {
        var r = this;
        return this.fu(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((function(i) {
            var o = i[0], u = i[1];
            return r.connection.Io(t, e, n, o, u);
        })).catch((function(t) {
            throw "FirebaseError" === t.name ? (t.code === K.UNAUTHENTICATED && (r.authCredentials.invalidateToken(), 
            r.appCheckCredentials.invalidateToken()), t) : new Q(K.UNKNOWN, t.toString());
        }));
    }, 
    /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */ n.prototype.vo = function(t, e, n, r) {
        var i = this;
        return this.fu(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((function(o) {
            var u = o[0], a = o[1];
            return i.connection.vo(t, e, n, u, a, r);
        })).catch((function(t) {
            throw "FirebaseError" === t.name ? (t.code === K.UNAUTHENTICATED && (i.authCredentials.invalidateToken(), 
            i.appCheckCredentials.invalidateToken()), t) : new Q(K.UNKNOWN, t.toString());
        }));
    }, n.prototype.terminate = function() {
        this.lu = !0;
    }, n;
}((function() {}));

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
var za = /** @class */ function() {
    function t(t, e) {
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
        this.mu = !0
        /**
     * Called by RemoteStore when a watch stream is started (including on each
     * backoff attempt).
     *
     * If this is the first attempt, it sets the OnlineState to Unknown and starts
     * the onlineStateTimer.
     */;
    }
    return t.prototype.gu = function() {
        var t = this;
        0 === this.wu && (this.yu("Unknown" /* OnlineState.Unknown */), this._u = this.asyncQueue.enqueueAfterDelay("online_state_timeout" /* TimerId.OnlineStateTimeout */ , 1e4, (function() {
            return t._u = null, t.pu("Backend didn't respond within 10 seconds."), t.yu("Offline" /* OnlineState.Offline */), 
            Promise.resolve();
        })));
    }, 
    /**
     * Updates our OnlineState as appropriate after the watch stream reports a
     * failure. The first failure moves us to the 'Unknown' state. We then may
     * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
     * actually transition to the 'Offline' state.
     */
    t.prototype.Iu = function(t) {
        "Online" /* OnlineState.Online */ === this.state ? this.yu("Unknown" /* OnlineState.Unknown */) : (this.wu++, 
        this.wu >= 1 && (this.Tu(), this.pu("Connection failed 1 times. Most recent error: ".concat(t.toString())), 
        this.yu("Offline" /* OnlineState.Offline */)));
    }, 
    /**
     * Explicitly sets the OnlineState to the specified state.
     *
     * Note that this resets our timers / failure counters, etc. used by our
     * Offline heuristics, so must not be used in place of
     * handleWatchStreamStart() and handleWatchStreamFailure().
     */
    t.prototype.set = function(t) {
        this.Tu(), this.wu = 0, "Online" /* OnlineState.Online */ === t && (
        // We've connected to watch at least once. Don't warn the developer
        // about being offline going forward.
        this.mu = !1), this.yu(t);
    }, t.prototype.yu = function(t) {
        t !== this.state && (this.state = t, this.onlineStateHandler(t));
    }, t.prototype.pu = function(t) {
        var e = "Could not reach Cloud Firestore backend. ".concat(t, "\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.");
        this.mu ? (L(e), this.mu = !1) : M("OnlineStateTracker", e);
    }, t.prototype.Tu = function() {
        null !== this._u && (this._u.cancel(), this._u = null);
    }, t;
}(), Ga = function(
/**
     * The local store, used to fill the write pipeline with outbound mutations.
     */
t, 
/** The client-side proxy for interacting with the backend. */
r, i, o, u) {
    var a = this;
    this.localStore = t, this.datastore = r, this.asyncQueue = i, this.remoteSyncer = {}, 
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
    this.Ru = [], this.Pu = u, this.Pu.Yr((function(t) {
        i.enqueueAndForget((function() {
            return e(a, void 0, void 0, (function() {
                return n(this, (function(t) {
                    switch (t.label) {
                      case 0:
                        return Za(this) ? (M("RemoteStore", "Restarting streams for network reachability change."), 
                        [ 4 /*yield*/ , function(t) {
                            return e(this, void 0, void 0, (function() {
                                var e;
                                return n(this, (function(n) {
                                    switch (n.label) {
                                      case 0:
                                        return (e = j(t)).vu.add(4 /* OfflineCause.ConnectivityChange */), [ 4 /*yield*/ , Ka(e) ];

                                      case 1:
                                        return n.sent(), e.bu.set("Unknown" /* OnlineState.Unknown */), e.vu.delete(4 /* OfflineCause.ConnectivityChange */), 
                                        [ 4 /*yield*/ , ja(e) ];

                                      case 2:
                                        return n.sent(), [ 2 /*return*/ ];
                                    }
                                }));
                            }));
                        }(this) ]) : [ 3 /*break*/ , 2 ];

                      case 1:
                        t.sent(), t.label = 2;

                      case 2:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }));
    })), this.bu = new za(i, o);
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
 */ function ja(t) {
    return e(this, void 0, void 0, (function() {
        var e, r;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                if (!Za(t)) return [ 3 /*break*/ , 4 ];
                e = 0, r = t.Ru, n.label = 1;

              case 1:
                return e < r.length ? [ 4 /*yield*/ , (0, r[e])(/* enabled= */ !0) ] : [ 3 /*break*/ , 4 ];

              case 2:
                n.sent(), n.label = 3;

              case 3:
                return e++, [ 3 /*break*/ , 1 ];

              case 4:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

/**
 * Temporarily disables the network. The network can be re-enabled using
 * enableNetwork().
 */ function Ka(t) {
    return e(this, void 0, void 0, (function() {
        var e, r;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                e = 0, r = t.Ru, n.label = 1;

              case 1:
                return e < r.length ? [ 4 /*yield*/ , (0, r[e])(/* enabled= */ !1) ] : [ 3 /*break*/ , 4 ];

              case 2:
                n.sent(), n.label = 3;

              case 3:
                return e++, [ 3 /*break*/ , 1 ];

              case 4:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

/**
 * Starts new listen for the given target. Uses resume token if provided. It
 * is a no-op if the target of given `TargetData` is already being listened to.
 */ function Qa(t, e) {
    var n = j(t);
    n.Au.has(e.targetId) || (
    // Mark this as something the client is currently listening for.
    n.Au.set(e.targetId, e), Ja(n) ? 
    // The listen will be sent in onWatchStreamOpen
    Xa(n) : ps(n).Ko() && Ha(n, e));
}

/**
 * Removes the listen from server. It is a no-op if the given target id is
 * not being listened to.
 */ function Wa(t, e) {
    var n = j(t), r = ps(n);
    n.Au.delete(e), r.Ko() && Ya(n, e), 0 === n.Au.size && (r.Ko() ? r.jo() : Za(n) && 
    // Revert to OnlineState.Unknown if the watch stream is not open and we
    // have no listeners, since without any listens to send we cannot
    // confirm if the stream is healthy and upgrade to OnlineState.Online.
    n.bu.set("Unknown" /* OnlineState.Unknown */));
}

/**
 * We need to increment the the expected number of pending responses we're due
 * from watch so we wait for the ack to process any messages from this target.
 */ function Ha(t, e) {
    if (t.Vu.qt(e.targetId), e.resumeToken.approximateByteSize() > 0 || e.snapshotVersion.compareTo(ct.min()) > 0) {
        var n = t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;
        e = e.withExpectedCount(n);
    }
    ps(t).su(e);
}

/**
 * We need to increment the expected number of pending responses we're due
 * from watch so we wait for the removal on the server before we process any
 * messages from this target.
 */ function Ya(t, e) {
    t.Vu.qt(e), ps(t).iu(e);
}

function Xa(t) {
    t.Vu = new _i({
        getRemoteKeysForTarget: function(e) {
            return t.remoteSyncer.getRemoteKeysForTarget(e);
        },
        le: function(e) {
            return t.Au.get(e) || null;
        },
        ue: function() {
            return t.datastore.serializer.databaseId;
        }
    }), ps(t).start(), t.bu.gu()
    /**
 * Returns whether the watch stream should be started because it's necessary
 * and has not yet been started.
 */;
}

function Ja(t) {
    return Za(t) && !ps(t).Uo() && t.Au.size > 0;
}

function Za(t) {
    return 0 === j(t).vu.size;
}

function $a(t) {
    t.Vu = void 0;
}

function ts(t) {
    return e(this, void 0, void 0, (function() {
        return n(this, (function(e) {
            return t.Au.forEach((function(e, n) {
                Ha(t, e);
            })), [ 2 /*return*/ ];
        }));
    }));
}

function es(t, r) {
    return e(this, void 0, void 0, (function() {
        return n(this, (function(e) {
            return $a(t), 
            // If we still need the watch stream, retry the connection.
            Ja(t) ? (t.bu.Iu(r), Xa(t)) : 
            // No need to restart watch stream because there are no active targets.
            // The online state is set to unknown because there is no active attempt
            // at establishing a connection
            t.bu.set("Unknown" /* OnlineState.Unknown */), [ 2 /*return*/ ];
        }));
    }));
}

function ns(t, r, i) {
    return e(this, void 0, void 0, (function() {
        var o, u, a;
        return n(this, (function(s) {
            switch (s.label) {
              case 0:
                if (t.bu.set("Online" /* OnlineState.Online */), !(r instanceof Ti && 2 /* WatchTargetChangeState.Removed */ === r.state && r.cause)) 
                // Mark the client as online since we got a message from the server
                return [ 3 /*break*/ , 6 ];
                s.label = 1;

              case 1:
                return s.trys.push([ 1, 3, , 5 ]), [ 4 /*yield*/ , 
                /** Handles an error on a target */
                function(t, r) {
                    return e(this, void 0, void 0, (function() {
                        var e, i, o, u;
                        return n(this, (function(n) {
                            switch (n.label) {
                              case 0:
                                e = r.cause, i = 0, o = r.targetIds, n.label = 1;

                              case 1:
                                return i < o.length ? (u = o[i], t.Au.has(u) ? [ 4 /*yield*/ , t.remoteSyncer.rejectListen(u, e) ] : [ 3 /*break*/ , 3 ]) : [ 3 /*break*/ , 5 ];

                              case 2:
                                n.sent(), t.Au.delete(u), t.Vu.removeTarget(u), n.label = 3;

                              case 3:
                                n.label = 4;

                              case 4:
                                return i++, [ 3 /*break*/ , 1 ];

                              case 5:
                                return [ 2 /*return*/ ];
                            }
                        }));
                    }));
                }(t, r) ];

              case 2:
                return s.sent(), [ 3 /*break*/ , 5 ];

              case 3:
                return o = s.sent(), M("RemoteStore", "Failed to remove targets %s: %s ", r.targetIds.join(","), o), 
                [ 4 /*yield*/ , rs(t, o) ];

              case 4:
                return s.sent(), [ 3 /*break*/ , 5 ];

              case 5:
                return [ 3 /*break*/ , 13 ];

              case 6:
                if (r instanceof Ii ? t.Vu.Ht(r) : r instanceof Ei ? t.Vu.ne(r) : t.Vu.Xt(r), i.isEqual(ct.min())) return [ 3 /*break*/ , 13 ];
                s.label = 7;

              case 7:
                return s.trys.push([ 7, 11, , 13 ]), [ 4 /*yield*/ , ia(t.localStore) ];

              case 8:
                return u = s.sent(), i.compareTo(u) >= 0 ? [ 4 /*yield*/ , 
                /**
                 * Takes a batch of changes from the Datastore, repackages them as a
                 * RemoteEvent, and passes that on to the listener, which is typically the
                 * SyncEngine.
                 */
                function(t, e) {
                    var n = t.Vu.ce(e);
                    // Update in-memory resume tokens. LocalStore will update the
                    // persistent view of these when applying the completed RemoteEvent.
                                        return n.targetChanges.forEach((function(n, r) {
                        if (n.resumeToken.approximateByteSize() > 0) {
                            var i = t.Au.get(r);
                            // A watched target might have been removed already.
                                                        i && t.Au.set(r, i.withResumeToken(n.resumeToken, e));
                        }
                    })), 
                    // Re-establish listens for the targets that have been invalidated by
                    // existence filter mismatches.
                    n.targetMismatches.forEach((function(e, n) {
                        var r = t.Au.get(e);
                        if (r) {
                            // Clear the resume token for the target, since we're in a known mismatch
                            // state.
                            t.Au.set(e, r.withResumeToken(Oe.EMPTY_BYTE_STRING, r.snapshotVersion)), 
                            // Cause a hard reset by unwatching and rewatching immediately, but
                            // deliberately don't send a resume token so that we get a full update.
                            Ya(t, e);
                            // Mark the target we send as being on behalf of an existence filter
                            // mismatch, but don't actually retain that in listenTargets. This ensures
                            // that we flag the first re-listen this way without impacting future
                            // listens of this target (that might happen e.g. on reconnect).
                            var i = new ao(r.target, e, n, r.sequenceNumber);
                            Ha(t, i);
                        }
                    })), t.remoteSyncer.applyRemoteEvent(n);
                }(t, i) ] : [ 3 /*break*/ , 10 ];

                // We have received a target change with a global snapshot if the snapshot
                // version is not equal to SnapshotVersion.min().
                              case 9:
                // We have received a target change with a global snapshot if the snapshot
                // version is not equal to SnapshotVersion.min().
                s.sent(), s.label = 10;

              case 10:
                return [ 3 /*break*/ , 13 ];

              case 11:
                return M("RemoteStore", "Failed to raise snapshot:", a = s.sent()), [ 4 /*yield*/ , rs(t, a) ];

              case 12:
                return s.sent(), [ 3 /*break*/ , 13 ];

              case 13:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

/**
 * Recovery logic for IndexedDB errors that takes the network offline until
 * `op` succeeds. Retries are scheduled with backoff using
 * `enqueueRetryable()`. If `op()` is not provided, IndexedDB access is
 * validated via a generic operation.
 *
 * The returned Promise is resolved once the network is disabled and before
 * any retry attempt.
 */ function rs(t, r, i) {
    return e(this, void 0, void 0, (function() {
        var o = this;
        return n(this, (function(u) {
            switch (u.label) {
              case 0:
                if (!Pt(r)) throw r;
                // Disable network and raise offline snapshots
                return t.vu.add(1 /* OfflineCause.IndexedDbFailed */), [ 4 /*yield*/ , Ka(t) ];

              case 1:
                // Disable network and raise offline snapshots
                return u.sent(), t.bu.set("Offline" /* OnlineState.Offline */), i || (
                // Use a simple read operation to determine if IndexedDB recovered.
                // Ideally, we would expose a health check directly on SimpleDb, but
                // RemoteStore only has access to persistence through LocalStore.
                i = function() {
                    return ia(t.localStore);
                }), 
                // Probe IndexedDB periodically and re-enable network
                t.asyncQueue.enqueueRetryable((function() {
                    return e(o, void 0, void 0, (function() {
                        return n(this, (function(e) {
                            switch (e.label) {
                              case 0:
                                return M("RemoteStore", "Retrying IndexedDB access"), [ 4 /*yield*/ , i() ];

                              case 1:
                                return e.sent(), t.vu.delete(1 /* OfflineCause.IndexedDbFailed */), [ 4 /*yield*/ , ja(t) ];

                              case 2:
                                return e.sent(), [ 2 /*return*/ ];
                            }
                        }));
                    }));
                })), [ 2 /*return*/ ];
            }
        }));
    }));
}

/**
 * Executes `op`. If `op` fails, takes the network offline until `op`
 * succeeds. Returns after the first attempt.
 */ function is(t, e) {
    return e().catch((function(n) {
        return rs(t, n, e);
    }));
}

function os(t) {
    return e(this, void 0, void 0, (function() {
        var e, r, i, o, u;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                e = j(t), r = vs(e), i = e.Eu.length > 0 ? e.Eu[e.Eu.length - 1].batchId : -1, n.label = 1;

              case 1:
                if (!
                /**
 * Returns true if we can add to the write pipeline (i.e. the network is
 * enabled and the write pipeline is not full).
 */
                function(t) {
                    return Za(t) && t.Eu.length < 10;
                }
                /**
 * Queues additional writes to be sent to the write stream, sending them
 * immediately if the write stream is established.
 */ (e)) return [ 3 /*break*/ , 7 ];
                n.label = 2;

              case 2:
                return n.trys.push([ 2, 4, , 6 ]), [ 4 /*yield*/ , aa(e.localStore, i) ];

              case 3:
                return null === (o = n.sent()) ? (0 === e.Eu.length && r.jo(), [ 3 /*break*/ , 7 ]) : (i = o.batchId, 
                function(t, e) {
                    t.Eu.push(e);
                    var n = vs(t);
                    n.Ko() && n.ou && n.uu(e.mutations);
                }(e, o), [ 3 /*break*/ , 6 ]);

              case 4:
                return u = n.sent(), [ 4 /*yield*/ , rs(e, u) ];

              case 5:
                return n.sent(), [ 3 /*break*/ , 6 ];

              case 6:
                return [ 3 /*break*/ , 1 ];

              case 7:
                return us(e) && as(e), [ 2 /*return*/ ];
            }
        }));
    }));
}

function us(t) {
    return Za(t) && !vs(t).Uo() && t.Eu.length > 0;
}

function as(t) {
    vs(t).start();
}

function ss(t) {
    return e(this, void 0, void 0, (function() {
        return n(this, (function(e) {
            return vs(t).hu(), [ 2 /*return*/ ];
        }));
    }));
}

function cs(t) {
    return e(this, void 0, void 0, (function() {
        var e, r, i, o;
        return n(this, (function(n) {
            // Send the write pipeline now that the stream is established.
            for (e = vs(t), r = 0, i = t.Eu; r < i.length; r++) o = i[r], e.uu(o.mutations);
            return [ 2 /*return*/ ];
        }));
    }));
}

function ls(t, r, i) {
    return e(this, void 0, void 0, (function() {
        var e, o;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return e = t.Eu.shift(), o = oi.from(e, r, i), [ 4 /*yield*/ , is(t, (function() {
                    return t.remoteSyncer.applySuccessfulWrite(o);
                })) ];

              case 1:
                // It's possible that with the completion of this mutation another
                // slot has freed up.
                return n.sent(), [ 4 /*yield*/ , os(t) ];

              case 2:
                // It's possible that with the completion of this mutation another
                // slot has freed up.
                return n.sent(), [ 2 /*return*/ ];
            }
        }));
    }));
}

function hs(t, r) {
    return e(this, void 0, void 0, (function() {
        return n(this, (function(i) {
            switch (i.label) {
              case 0:
                return r && vs(t).ou ? [ 4 /*yield*/ , function(t, r) {
                    return e(this, void 0, void 0, (function() {
                        var e, i;
                        return n(this, (function(n) {
                            switch (n.label) {
                              case 0:
                                return ci(i = r.code) && i !== K.ABORTED ? (e = t.Eu.shift(), 
                                // In this case it's also unlikely that the server itself is melting
                                // down -- this was just a bad request so inhibit backoff on the next
                                // restart.
                                vs(t).Qo(), [ 4 /*yield*/ , is(t, (function() {
                                    return t.remoteSyncer.rejectFailedWrite(e.batchId, r);
                                })) ]) : [ 3 /*break*/ , 3 ];

                              case 1:
                                // It's possible that with the completion of this mutation
                                // another slot has freed up.
                                return n.sent(), [ 4 /*yield*/ , os(t) ];

                              case 2:
                                // In this case it's also unlikely that the server itself is melting
                                // down -- this was just a bad request so inhibit backoff on the next
                                // restart.
                                // It's possible that with the completion of this mutation
                                // another slot has freed up.
                                n.sent(), n.label = 3;

                              case 3:
                                return [ 2 /*return*/ ];
                            }
                        }));
                    }));
                }(t, r) ] : [ 3 /*break*/ , 2 ];

                // This error affects the actual write.
                              case 1:
                // This error affects the actual write.
                i.sent(), i.label = 2;

              case 2:
                // If the write stream closed after the write handshake completes, a write
                // operation failed and we fail the pending operation.
                // The write stream might have been started by refilling the write
                // pipeline for failed writes
                return us(t) && as(t), [ 2 /*return*/ ];
            }
        }));
    }));
}

function fs(t, r) {
    return e(this, void 0, void 0, (function() {
        var e, i;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return (e = j(t)).asyncQueue.verifyOperationInProgress(), M("RemoteStore", "RemoteStore received new credentials"), 
                i = Za(e), 
                // Tear down and re-create our network streams. This will ensure we get a
                // fresh auth token for the new user and re-fill the write pipeline with
                // new mutations from the LocalStore (since mutations are per-user).
                e.vu.add(3 /* OfflineCause.CredentialChange */), [ 4 /*yield*/ , Ka(e) ];

              case 1:
                return n.sent(), i && 
                // Don't set the network status to Unknown if we are offline.
                e.bu.set("Unknown" /* OnlineState.Unknown */), [ 4 /*yield*/ , e.remoteSyncer.handleCredentialChange(r) ];

              case 2:
                return n.sent(), e.vu.delete(3 /* OfflineCause.CredentialChange */), [ 4 /*yield*/ , ja(e) ];

              case 3:
                // Tear down and re-create our network streams. This will ensure we get a
                // fresh auth token for the new user and re-fill the write pipeline with
                // new mutations from the LocalStore (since mutations are per-user).
                return n.sent(), [ 2 /*return*/ ];
            }
        }));
    }));
}

/**
 * Toggles the network state when the client gains or loses its primary lease.
 */ function ds(t, r) {
    return e(this, void 0, void 0, (function() {
        var e;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return e = j(t), r ? (e.vu.delete(2 /* OfflineCause.IsSecondary */), [ 4 /*yield*/ , ja(e) ]) : [ 3 /*break*/ , 2 ];

              case 1:
                return n.sent(), [ 3 /*break*/ , 5 ];

              case 2:
                return r ? [ 3 /*break*/ , 4 ] : (e.vu.add(2 /* OfflineCause.IsSecondary */), [ 4 /*yield*/ , Ka(e) ]);

              case 3:
                n.sent(), e.bu.set("Unknown" /* OnlineState.Unknown */), n.label = 4;

              case 4:
                n.label = 5;

              case 5:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

/**
 * If not yet initialized, registers the WatchStream and its network state
 * callback with `remoteStoreImpl`. Returns the existing stream if one is
 * already available.
 *
 * PORTING NOTE: On iOS and Android, the WatchStream gets registered on startup.
 * This is not done on Web to allow it to be tree-shaken.
 */ function ps(t) {
    var r = this;
    return t.Su || (
    // Create stream (but note that it is not started yet).
    t.Su = function(t, e, n) {
        var r = j(t);
        return r.fu(), new qa(e, r.connection, r.authCredentials, r.appCheckCredentials, r.serializer, n);
    }(t.datastore, t.asyncQueue, {
        uo: ts.bind(null, t),
        ao: es.bind(null, t),
        nu: ns.bind(null, t)
    }), t.Ru.push((function(i) {
        return e(r, void 0, void 0, (function() {
            return n(this, (function(e) {
                switch (e.label) {
                  case 0:
                    return i ? (t.Su.Qo(), Ja(t) ? Xa(t) : t.bu.set("Unknown" /* OnlineState.Unknown */), 
                    [ 3 /*break*/ , 3 ]) : [ 3 /*break*/ , 1 ];

                  case 1:
                    return [ 4 /*yield*/ , t.Su.stop() ];

                  case 2:
                    e.sent(), $a(t), e.label = 3;

                  case 3:
                    return [ 2 /*return*/ ];
                }
            }));
        }));
    }))), t.Su
    /**
 * If not yet initialized, registers the WriteStream and its network state
 * callback with `remoteStoreImpl`. Returns the existing stream if one is
 * already available.
 *
 * PORTING NOTE: On iOS and Android, the WriteStream gets registered on startup.
 * This is not done on Web to allow it to be tree-shaken.
 */;
}

function vs(t) {
    var r = this;
    return t.Du || (
    // Create stream (but note that it is not started yet).
    t.Du = function(t, e, n) {
        var r = j(t);
        return r.fu(), new Ba(e, r.connection, r.authCredentials, r.appCheckCredentials, r.serializer, n);
    }(t.datastore, t.asyncQueue, {
        uo: ss.bind(null, t),
        ao: hs.bind(null, t),
        au: cs.bind(null, t),
        cu: ls.bind(null, t)
    }), t.Ru.push((function(i) {
        return e(r, void 0, void 0, (function() {
            return n(this, (function(e) {
                switch (e.label) {
                  case 0:
                    return i ? (t.Du.Qo(), [ 4 /*yield*/ , os(t) ]) : [ 3 /*break*/ , 2 ];

                  case 1:
                    // This will start the write stream if necessary.
                    return e.sent(), [ 3 /*break*/ , 4 ];

                  case 2:
                    return [ 4 /*yield*/ , t.Du.stop() ];

                  case 3:
                    e.sent(), t.Eu.length > 0 && (M("RemoteStore", "Stopping write stream with ".concat(t.Eu.length, " pending writes")), 
                    t.Eu = []), e.label = 4;

                  case 4:
                    return [ 2 /*return*/ ];
                }
            }));
        }));
    }))), t.Du
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
 */;
}

var ms = /** @class */ function() {
    function t(t, e, n, r, i) {
        this.asyncQueue = t, this.timerId = e, this.targetTimeMs = n, this.op = r, this.removalCallback = i, 
        this.deferred = new W, this.then = this.deferred.promise.then.bind(this.deferred.promise), 
        // It's normal for the deferred promise to be canceled (due to cancellation)
        // and so we attach a dummy catch callback to avoid
        // 'UnhandledPromiseRejectionWarning' log spam.
        this.deferred.promise.catch((function(t) {}))
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
     */;
    }
    return t.createAndSchedule = function(e, n, r, i, o) {
        var u = new t(e, n, Date.now() + r, i, o);
        return u.start(r), u;
    }, 
    /**
     * Starts the timer. This is called immediately after construction by
     * createAndSchedule().
     */
    t.prototype.start = function(t) {
        var e = this;
        this.timerHandle = setTimeout((function() {
            return e.handleDelayElapsed();
        }), t);
    }, 
    /**
     * Queues the operation to run immediately (if it hasn't already been run or
     * canceled).
     */
    t.prototype.skipDelay = function() {
        return this.handleDelayElapsed();
    }, 
    /**
     * Cancels the operation if it hasn't already been executed or canceled. The
     * promise will be rejected.
     *
     * As long as the operation has not yet been run, calling cancel() provides a
     * guarantee that the operation will not be run.
     */
    t.prototype.cancel = function(t) {
        null !== this.timerHandle && (this.clearTimeout(), this.deferred.reject(new Q(K.CANCELLED, "Operation cancelled" + (t ? ": " + t : ""))));
    }, t.prototype.handleDelayElapsed = function() {
        var t = this;
        this.asyncQueue.enqueueAndForget((function() {
            return null !== t.timerHandle ? (t.clearTimeout(), t.op().then((function(e) {
                return t.deferred.resolve(e);
            }))) : Promise.resolve();
        }));
    }, t.prototype.clearTimeout = function() {
        null !== this.timerHandle && (this.removalCallback(this), clearTimeout(this.timerHandle), 
        this.timerHandle = null);
    }, t;
}();

/**
 * Returns a FirestoreError that can be surfaced to the user if the provided
 * error is an IndexedDbTransactionError. Re-throws the error otherwise.
 */ function ys(t, e) {
    if (L("AsyncQueue", "".concat(e, ": ").concat(t)), Pt(t)) return new Q(K.UNAVAILABLE, "".concat(e, ": ").concat(t));
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
 */ var gs = /** @class */ function() {
    /** The default ordering is by key if the comparator is omitted */
    function t(t) {
        // We are adding document key comparator to the end as it's the only
        // guaranteed unique property of a document.
        this.comparator = t ? function(e, n) {
            return t(e, n) || pt.comparator(e.key, n.key);
        } : function(t, e) {
            return pt.comparator(t.key, e.key);
        }, this.keyedMap = pr(), this.sortedSet = new Te(this.comparator)
        /**
     * Returns an empty copy of the existing DocumentSet, using the same
     * comparator.
     */;
    }
    return t.emptySet = function(e) {
        return new t(e.comparator);
    }, t.prototype.has = function(t) {
        return null != this.keyedMap.get(t);
    }, t.prototype.get = function(t) {
        return this.keyedMap.get(t);
    }, t.prototype.first = function() {
        return this.sortedSet.minKey();
    }, t.prototype.last = function() {
        return this.sortedSet.maxKey();
    }, t.prototype.isEmpty = function() {
        return this.sortedSet.isEmpty();
    }, 
    /**
     * Returns the index of the provided key in the document set, or -1 if the
     * document key is not present in the set;
     */
    t.prototype.indexOf = function(t) {
        var e = this.keyedMap.get(t);
        return e ? this.sortedSet.indexOf(e) : -1;
    }, Object.defineProperty(t.prototype, "size", {
        get: function() {
            return this.sortedSet.size;
        },
        enumerable: !1,
        configurable: !0
    }), 
    /** Iterates documents in order defined by "comparator" */ t.prototype.forEach = function(t) {
        this.sortedSet.inorderTraversal((function(e, n) {
            return t(e), !1;
        }));
    }, 
    /** Inserts or updates a document with the same key */ t.prototype.add = function(t) {
        // First remove the element if we have it.
        var e = this.delete(t.key);
        return e.copy(e.keyedMap.insert(t.key, t), e.sortedSet.insert(t, null));
    }, 
    /** Deletes a document with a given key */ t.prototype.delete = function(t) {
        var e = this.get(t);
        return e ? this.copy(this.keyedMap.remove(t), this.sortedSet.remove(e)) : this;
    }, t.prototype.isEqual = function(e) {
        if (!(e instanceof t)) return !1;
        if (this.size !== e.size) return !1;
        for (var n = this.sortedSet.getIterator(), r = e.sortedSet.getIterator(); n.hasNext(); ) {
            var i = n.getNext().key, o = r.getNext().key;
            if (!i.isEqual(o)) return !1;
        }
        return !0;
    }, t.prototype.toString = function() {
        var t = [];
        return this.forEach((function(e) {
            t.push(e.toString());
        })), 0 === t.length ? "DocumentSet ()" : "DocumentSet (\n  " + t.join("  \n") + "\n)";
    }, t.prototype.copy = function(e, n) {
        var r = new t;
        return r.comparator = this.comparator, r.keyedMap = e, r.sortedSet = n, r;
    }, t;
}(), ws = /** @class */ function() {
    function t() {
        this.Cu = new Te(pt.comparator);
    }
    return t.prototype.track = function(t) {
        var e = t.doc.key, n = this.Cu.get(e);
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
        U() : this.Cu = this.Cu.insert(e, t);
    }, t.prototype.xu = function() {
        var t = [];
        return this.Cu.inorderTraversal((function(e, n) {
            t.push(n);
        })), t;
    }, t;
}(), bs = /** @class */ function() {
    function t(t, e, n, r, i, o, u, a, s) {
        this.query = t, this.docs = e, this.oldDocs = n, this.docChanges = r, this.mutatedKeys = i, 
        this.fromCache = o, this.syncStateChanged = u, this.excludesMetadataChanges = a, 
        this.hasCachedResults = s
        /** Returns a view snapshot as if all documents in the snapshot were added. */;
    }
    return t.fromInitialDocuments = function(e, n, r, i, o) {
        var u = [];
        return n.forEach((function(t) {
            u.push({
                type: 0 /* ChangeType.Added */ ,
                doc: t
            });
        })), new t(e, n, gs.emptySet(n), u, r, i, 
        /* syncStateChanged= */ !0, 
        /* excludesMetadataChanges= */ !1, o);
    }, Object.defineProperty(t.prototype, "hasPendingWrites", {
        get: function() {
            return !this.mutatedKeys.isEmpty();
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.isEqual = function(t) {
        if (!(this.fromCache === t.fromCache && this.hasCachedResults === t.hasCachedResults && this.syncStateChanged === t.syncStateChanged && this.mutatedKeys.isEqual(t.mutatedKeys) && rr(this.query, t.query) && this.docs.isEqual(t.docs) && this.oldDocs.isEqual(t.oldDocs))) return !1;
        var e = this.docChanges, n = t.docChanges;
        if (e.length !== n.length) return !1;
        for (var r = 0; r < e.length; r++) if (e[r].type !== n[r].type || !e[r].doc.isEqual(n[r].doc)) return !1;
        return !0;
    }, t;
}(), Is = function() {
    this.Nu = void 0, this.listeners = [];
}, Es = function() {
    this.queries = new lr((function(t) {
        return ir(t);
    }), rr), this.onlineState = "Unknown" /* OnlineState.Unknown */ , this.ku = new Set;
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
 * DocumentChangeSet keeps track of a set of changes to docs in a query, merging
 * duplicate events for the same doc.
 */ function Ts(t, r) {
    return e(this, void 0, void 0, (function() {
        var e, i, o, u, a, s, c;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                if (e = j(t), i = r.query, o = !1, (u = e.queries.get(i)) || (o = !0, u = new Is), 
                !o) return [ 3 /*break*/ , 4 ];
                n.label = 1;

              case 1:
                return n.trys.push([ 1, 3, , 4 ]), a = u, [ 4 /*yield*/ , e.onListen(i) ];

              case 2:
                return a.Nu = n.sent(), [ 3 /*break*/ , 4 ];

              case 3:
                return s = n.sent(), c = ys(s, "Initialization of query '".concat(or(r.query), "' failed")), 
                [ 2 /*return*/ , void r.onError(c) ];

              case 4:
                return e.queries.set(i, u), u.listeners.push(r), 
                // Run global snapshot listeners if a consistent snapshot has been emitted.
                r.Mu(e.onlineState), u.Nu && r.$u(u.Nu) && Cs(e), [ 2 /*return*/ ];
            }
        }));
    }));
}

function Ss(t, r) {
    return e(this, void 0, void 0, (function() {
        var e, i, o, u, a;
        return n(this, (function(n) {
            return e = j(t), i = r.query, o = !1, (u = e.queries.get(i)) && (a = u.listeners.indexOf(r)) >= 0 && (u.listeners.splice(a, 1), 
            o = 0 === u.listeners.length), o ? [ 2 /*return*/ , (e.queries.delete(i), e.onUnlisten(i)) ] : [ 2 /*return*/ ];
        }));
    }));
}

function _s(t, e) {
    for (var n = j(t), r = !1, i = 0, o = e; i < o.length; i++) {
        var u = o[i], a = u.query, s = n.queries.get(a);
        if (s) {
            for (var c = 0, l = s.listeners; c < l.length; c++) {
                l[c].$u(u) && (r = !0);
            }
            s.Nu = u;
        }
    }
    r && Cs(n);
}

function Ds(t, e, n) {
    var r = j(t), i = r.queries.get(e);
    if (i) for (var o = 0, u = i.listeners; o < u.length; o++) {
        u[o].onError(n);
    }
    // Remove all listeners. NOTE: We don't need to call syncEngine.unlisten()
    // after an error.
        r.queries.delete(e);
}

// Call all global snapshot listeners that have been set.
function Cs(t) {
    t.ku.forEach((function(t) {
        t.next();
    }));
}

/**
 * QueryListener takes a series of internal view snapshots and determines
 * when to raise the event.
 *
 * It uses an Observer to dispatch events.
 */ var xs = /** @class */ function() {
    function t(t, e, n) {
        this.query = t, this.Ou = e, 
        /**
             * Initial snapshots (e.g. from cache) may not be propagated to the wrapped
             * observer. This flag is set to true once we've actually raised an event.
             */
        this.Fu = !1, this.Bu = null, this.onlineState = "Unknown" /* OnlineState.Unknown */ , 
        this.options = n || {}
        /**
     * Applies the new ViewSnapshot to this listener, raising a user-facing event
     * if applicable (depending on what changed, whether the user has opted into
     * metadata-only changes, etc.). Returns true if a user-facing event was
     * indeed raised.
     */;
    }
    return t.prototype.$u = function(t) {
        if (!this.options.includeMetadataChanges) {
            for (
            // Remove the metadata only changes.
            var e = [], n = 0, r = t.docChanges; n < r.length; n++) {
                var i = r[n];
                3 /* ChangeType.Metadata */ !== i.type && e.push(i);
            }
            t = new bs(t.query, t.docs, t.oldDocs, e, t.mutatedKeys, t.fromCache, t.syncStateChanged, 
            /* excludesMetadataChanges= */ !0, t.hasCachedResults);
        }
        var o = !1;
        return this.Fu ? this.Lu(t) && (this.Ou.next(t), o = !0) : this.qu(t, this.onlineState) && (this.Uu(t), 
        o = !0), this.Bu = t, o;
    }, t.prototype.onError = function(t) {
        this.Ou.error(t);
    }, 
    /** Returns whether a snapshot was raised. */ t.prototype.Mu = function(t) {
        this.onlineState = t;
        var e = !1;
        return this.Bu && !this.Fu && this.qu(this.Bu, t) && (this.Uu(this.Bu), e = !0), 
        e;
    }, t.prototype.qu = function(t, e) {
        // Always raise the first event when we're synced
        if (!t.fromCache) return !0;
        // NOTE: We consider OnlineState.Unknown as online (it should become Offline
        // or Online if we wait long enough).
                var n = "Offline" /* OnlineState.Offline */ !== e;
        // Don't raise the event if we're online, aren't synced yet (checked
        // above) and are waiting for a sync.
                return (!this.options.Ku || !n) && (!t.docs.isEmpty() || t.hasCachedResults || "Offline" /* OnlineState.Offline */ === e);
        // Raise data from cache if we have any documents, have cached results before,
        // or we are offline.
        }, t.prototype.Lu = function(t) {
        // We don't need to handle includeDocumentMetadataChanges here because
        // the Metadata only changes have already been stripped out if needed.
        // At this point the only changes we will see are the ones we should
        // propagate.
        if (t.docChanges.length > 0) return !0;
        var e = this.Bu && this.Bu.hasPendingWrites !== t.hasPendingWrites;
        return !(!t.syncStateChanged && !e) && !0 === this.options.includeMetadataChanges;
        // Generally we should have hit one of the cases above, but it's possible
        // to get here if there were only metadata docChanges and they got
        // stripped out.
        }, t.prototype.Uu = function(t) {
        t = bs.fromInitialDocuments(t.query, t.docs, t.mutatedKeys, t.fromCache, t.hasCachedResults), 
        this.Fu = !0, this.Ou.next(t);
    }, t;
}(), Ns = /** @class */ function() {
    function t(t, 
    // How many bytes this element takes to store in the bundle.
    e) {
        this.Gu = t, this.byteLength = e;
    }
    return t.prototype.Qu = function() {
        return "metadata" in this.Gu;
    }, t;
}(), As = /** @class */ function() {
    function t(t) {
        this.serializer = t;
    }
    return t.prototype.rr = function(t) {
        return Bi(this.serializer, t);
    }, 
    /**
     * Converts a BundleDocument to a MutableDocument.
     */
    t.prototype.ur = function(t) {
        return t.metadata.exists ? Qi(this.serializer, t.document, !1) : dn.newNoDocument(this.rr(t.metadata.name), this.cr(t.metadata.readTime));
    }, t.prototype.cr = function(t) {
        return Vi(t);
    }, t;
}(), ks = /** @class */ function() {
    function t(t, e, n) {
        this.ju = t, this.localStore = e, this.serializer = n, 
        /** Batched queries to be saved into storage */
        this.queries = [], 
        /** Batched documents to be saved into storage */
        this.documents = [], 
        /** The collection groups affected by this bundle. */
        this.collectionGroups = new Set, this.progress = Os(t)
        /**
     * Adds an element from the bundle to the loader.
     *
     * Returns a new progress if adding the element leads to a new progress,
     * otherwise returns null.
     */;
    }
    return t.prototype.zu = function(t) {
        this.progress.bytesLoaded += t.byteLength;
        var e = this.progress.documentsLoaded;
        if (t.Gu.namedQuery) this.queries.push(t.Gu.namedQuery); else if (t.Gu.documentMetadata) {
            this.documents.push({
                metadata: t.Gu.documentMetadata
            }), t.Gu.documentMetadata.exists || ++e;
            var n = ht.fromString(t.Gu.documentMetadata.name);
            this.collectionGroups.add(n.get(n.length - 2));
        } else t.Gu.document && (this.documents[this.documents.length - 1].document = t.Gu.document, 
        ++e);
        return e !== this.progress.documentsLoaded ? (this.progress.documentsLoaded = e, 
        Object.assign({}, this.progress)) : null;
    }, t.prototype.Wu = function(t) {
        for (var e = new Map, n = new As(this.serializer), r = 0, i = t; r < i.length; r++) {
            var o = i[r];
            if (o.metadata.queries) for (var u = n.rr(o.metadata.name), a = 0, s = o.metadata.queries; a < s.length; a++) {
                var c = s[a], l = (e.get(c) || Ir()).add(u);
                e.set(c, l);
            }
        }
        return e;
    }, 
    /**
     * Update the progress to 'Success' and return the updated progress.
     */
    t.prototype.complete = function() {
        return e(this, void 0, void 0, (function() {
            var t, e, r, i, o;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return [ 4 /*yield*/ , pa(this.localStore, new As(this.serializer), this.documents, this.ju.id) ];

                  case 1:
                    t = n.sent(), e = this.Wu(this.documents), r = 0, i = this.queries, n.label = 2;

                  case 2:
                    return r < i.length ? (o = i[r], [ 4 /*yield*/ , va(this.localStore, o, e.get(o.name)) ]) : [ 3 /*break*/ , 5 ];

                  case 3:
                    n.sent(), n.label = 4;

                  case 4:
                    return r++, [ 3 /*break*/ , 2 ];

                  case 5:
                    return [ 2 /*return*/ , (this.progress.taskState = "Success", {
                        progress: this.progress,
                        Hu: this.collectionGroups,
                        Ju: t
                    }) ];
                }
            }));
        }));
    }, t;
}();

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
 */
/**
 * Returns a `LoadBundleTaskProgress` representing the initial progress of
 * loading a bundle.
 */
function Os(t) {
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
 */ var Fs = function(t) {
    this.key = t;
}, Ps = function(t) {
    this.key = t;
}, Rs = /** @class */ function() {
    function t(t, 
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
        this.Zu = Ir(), 
        /** Document Keys that have local changes */
        this.mutatedKeys = Ir(), this.tc = sr(t), this.ec = new gs(this.tc);
    }
    return Object.defineProperty(t.prototype, "nc", {
        /**
         * The set of remote documents that the server has told us belongs to the target associated with
         * this view.
         */
        get: function() {
            return this.Yu;
        },
        enumerable: !1,
        configurable: !0
    }), 
    /**
     * Iterates over a set of doc changes, applies the query limit, and computes
     * what the new results should be, what the changes were, and whether we may
     * need to go back to the local cache for more results. Does not make any
     * changes to the view.
     * @param docChanges - The doc changes to apply to this view.
     * @param previousChanges - If this is being called with a refill, then start
     *        with this set of docs and changes instead of the current view.
     * @returns a new set of docs, changes, and refill flag.
     */
    t.prototype.sc = function(t, e) {
        var n = this, r = e ? e.ic : new ws, i = e ? e.ec : this.ec, o = e ? e.mutatedKeys : this.mutatedKeys, u = i, a = !1, s = "F" /* LimitType.First */ === this.query.limitType && i.size === this.query.limit ? i.last() : null, c = "L" /* LimitType.Last */ === this.query.limitType && i.size === this.query.limit ? i.first() : null;
        // Drop documents out to meet limit/limitToLast requirement.
        if (t.inorderTraversal((function(t, e) {
            var l = i.get(t), h = ur(n.query, e) ? e : null, f = !!l && n.mutatedKeys.has(l.key), d = !!h && (h.hasLocalMutations || 
            // We only consider committed mutations for documents that were
            // mutated during the lifetime of the view.
            n.mutatedKeys.has(h.key) && h.hasCommittedMutations), p = !1;
            // Calculate change
            l && h ? l.data.isEqual(h.data) ? f !== d && (r.track({
                type: 3 /* ChangeType.Metadata */ ,
                doc: h
            }), p = !0) : n.rc(l, h) || (r.track({
                type: 2 /* ChangeType.Modified */ ,
                doc: h
            }), p = !0, (s && n.tc(h, s) > 0 || c && n.tc(h, c) < 0) && (
            // This doc moved from inside the limit to outside the limit.
            // That means there may be some other doc in the local cache
            // that should be included instead.
            a = !0)) : !l && h ? (r.track({
                type: 0 /* ChangeType.Added */ ,
                doc: h
            }), p = !0) : l && !h && (r.track({
                type: 1 /* ChangeType.Removed */ ,
                doc: l
            }), p = !0, (s || c) && (
            // A doc was removed from a full limit query. We'll need to
            // requery from the local cache to see if we know about some other
            // doc that should be in the results.
            a = !0)), p && (h ? (u = u.add(h), o = d ? o.add(t) : o.delete(t)) : (u = u.delete(t), 
            o = o.delete(t)));
        })), null !== this.query.limit) for (;u.size > this.query.limit; ) {
            var l = "F" /* LimitType.First */ === this.query.limitType ? u.last() : u.first();
            u = u.delete(l.key), o = o.delete(l.key), r.track({
                type: 1 /* ChangeType.Removed */ ,
                doc: l
            });
        }
        return {
            ec: u,
            ic: r,
            zi: a,
            mutatedKeys: o
        };
    }, t.prototype.rc = function(t, e) {
        // We suppress the initial change event for documents that were modified as
        // part of a write acknowledgment (e.g. when the value of a server transform
        // is applied) as Watch will send us the same document again.
        // By suppressing the event, we only raise two user visible events (one with
        // `hasPendingWrites` and the final state of the document) instead of three
        // (one with `hasPendingWrites`, the modified document with
        // `hasPendingWrites` and the final state of the document).
        return t.hasLocalMutations && e.hasCommittedMutations && !e.hasLocalMutations;
    }, 
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
    t.prototype.applyChanges = function(t, e, n) {
        var r = this, i = this.ec;
        this.ec = t.ec, this.mutatedKeys = t.mutatedKeys;
        // Sort changes based on type and query comparator
        var o = t.ic.xu();
        o.sort((function(t, e) {
            return function(t, e) {
                var n = function(t) {
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
                        return U();
                    }
                };
                return n(t) - n(e);
            }(t.type, e.type) || r.tc(t.doc, e.doc);
        })), this.oc(n);
        var u = e ? this.uc() : [], a = 0 === this.Zu.size && this.current ? 1 /* SyncState.Synced */ : 0 /* SyncState.Local */ , s = a !== this.Xu;
        return this.Xu = a, 0 !== o.length || s ? {
            snapshot: new bs(this.query, t.ec, i, o, t.mutatedKeys, 0 /* SyncState.Local */ === a, s, 
            /* excludesMetadataChanges= */ !1, !!n && n.resumeToken.approximateByteSize() > 0),
            cc: u
        } : {
            cc: u
        };
        // no changes
        }, 
    /**
     * Applies an OnlineState change to the view, potentially generating a
     * ViewChange if the view's syncState changes as a result.
     */
    t.prototype.Mu = function(t) {
        return this.current && "Offline" /* OnlineState.Offline */ === t ? (
        // If we're offline, set `current` to false and then call applyChanges()
        // to refresh our syncState and generate a ViewChange as appropriate. We
        // are guaranteed to get a new TargetChange that sets `current` back to
        // true once the client is back online.
        this.current = !1, this.applyChanges({
            ec: this.ec,
            ic: new ws,
            mutatedKeys: this.mutatedKeys,
            zi: !1
        }, 
        /* updateLimboDocuments= */ !1)) : {
            cc: []
        };
    }, 
    /**
     * Returns whether the doc for the given key should be in limbo.
     */
    t.prototype.ac = function(t) {
        // If the remote end says it's part of this query, it's not in limbo.
        return !this.Yu.has(t) && 
        // The local store doesn't think it's a result, so it shouldn't be in limbo.
        !!this.ec.has(t) && !this.ec.get(t).hasLocalMutations;
    }, 
    /**
     * Updates syncedDocuments, current, and limbo docs based on the given change.
     * Returns the list of changes to which docs are in limbo.
     */
    t.prototype.oc = function(t) {
        var e = this;
        t && (t.addedDocuments.forEach((function(t) {
            return e.Yu = e.Yu.add(t);
        })), t.modifiedDocuments.forEach((function(t) {})), t.removedDocuments.forEach((function(t) {
            return e.Yu = e.Yu.delete(t);
        })), this.current = t.current);
    }, t.prototype.uc = function() {
        var t = this;
        // We can only determine limbo documents when we're in-sync with the server.
                if (!this.current) return [];
        // TODO(klimt): Do this incrementally so that it's not quadratic when
        // updating many documents.
                var e = this.Zu;
        this.Zu = Ir(), this.ec.forEach((function(e) {
            t.ac(e.key) && (t.Zu = t.Zu.add(e.key));
        }));
        // Diff the new limbo docs with the old limbo docs.
        var n = [];
        return e.forEach((function(e) {
            t.Zu.has(e) || n.push(new Ps(e));
        })), this.Zu.forEach((function(t) {
            e.has(t) || n.push(new Fs(t));
        })), n;
    }, 
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
    t.prototype.hc = function(t) {
        this.Yu = t.ir, this.Zu = Ir();
        var e = this.sc(t.documents);
        return this.applyChanges(e, /*updateLimboDocuments=*/ !0);
    }, 
    /**
     * Returns a view snapshot as if this query was just listened to. Contains
     * a document add for every existing document and the `fromCache` and
     * `hasPendingWrites` status of the already established view.
     */
    // PORTING NOTE: Multi-tab only.
    t.prototype.lc = function() {
        return bs.fromInitialDocuments(this.query, this.ec, this.mutatedKeys, 0 /* SyncState.Local */ === this.Xu, this.hasCachedResults);
    }, t;
}(), Vs = function(
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
}, Ms = function(t) {
    this.key = t, 
    /**
             * Set to true once we've received a document. This is used in
             * getRemoteKeysForTarget() and ultimately used by WatchChangeAggregator to
             * decide whether it needs to manufacture a delete event for the target once
             * the target is CURRENT.
             */
    this.fc = !1;
}, Ls = /** @class */ function() {
    function t(t, e, n, 
    // PORTING NOTE: Manages state synchronization in multi-tab environments.
    r, i, o) {
        this.localStore = t, this.remoteStore = e, this.eventManager = n, this.sharedClientState = r, 
        this.currentUser = i, this.maxConcurrentLimboResolutions = o, this.dc = {}, this.wc = new lr((function(t) {
            return ir(t);
        }), rr), this._c = new Map, 
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
        this.gc = new Te(pt.comparator), 
        /**
             * Keeps track of the information about an active limbo resolution for each
             * active target ID that was started for the purpose of limbo resolution.
             */
        this.yc = new Map, this.Ic = new Ru, 
        /** Stores user completion handlers, indexed by User and BatchId. */
        this.Tc = {}, 
        /** Stores user callbacks waiting for all pending writes to be acknowledged. */
        this.Ec = new Map, this.Ac = lu.Mn(), this.onlineState = "Unknown" /* OnlineState.Unknown */ , 
        // The primary state is set to `true` or `false` immediately after Firestore
        // startup. In the interim, a client should only be considered primary if
        // `isPrimary` is true.
        this.vc = void 0;
    }
    return Object.defineProperty(t.prototype, "isPrimaryClient", {
        get: function() {
            return !0 === this.vc;
        },
        enumerable: !1,
        configurable: !0
    }), t;
}();

/**
 * Initiates the new listen, resolves promise when listen enqueued to the
 * server. All the subsequent view snapshots or errors are sent to the
 * subscribed handlers. Returns the initial snapshot.
 */
function qs(t, r) {
    return e(this, void 0, void 0, (function() {
        var e, i, o, u, a, s;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return e = pc(t), (u = e.wc.get(r)) ? (
                // PORTING NOTE: With Multi-Tab Web, it is possible that a query view
                // already exists when EventManager calls us for the first time. This
                // happens when the primary tab is already listening to this query on
                // behalf of another tab and the user of the primary also starts listening
                // to the query. EventManager will not have an assigned target ID in this
                // case and calls `listen` to obtain this ID.
                i = u.targetId, e.sharedClientState.addLocalQueryTarget(i), o = u.view.lc(), [ 3 /*break*/ , 4 ]) : [ 3 /*break*/ , 1 ];

              case 1:
                return [ 4 /*yield*/ , sa(e.localStore, tr(r)) ];

              case 2:
                return a = n.sent(), s = e.sharedClientState.addLocalQueryTarget(a.targetId), i = a.targetId, 
                [ 4 /*yield*/ , Bs(e, r, i, "current" === s, a.resumeToken) ];

              case 3:
                o = n.sent(), e.isPrimaryClient && Qa(e.remoteStore, a), n.label = 4;

              case 4:
                return [ 2 /*return*/ , o ];
            }
        }));
    }));
}

/**
 * Registers a view for a previously unknown query and computes its initial
 * snapshot.
 */ function Bs(t, r, i, o, u) {
    return e(this, void 0, void 0, (function() {
        var a, s, c, l, h, f;
        return n(this, (function(d) {
            switch (d.label) {
              case 0:
                // PORTING NOTE: On Web only, we inject the code that registers new Limbo
                // targets based on view changes. This allows us to only depend on Limbo
                // changes when user code includes queries.
                return t.Rc = function(r, i, o) {
                    return function(t, r, i, o) {
                        return e(this, void 0, void 0, (function() {
                            var e, u, a;
                            return n(this, (function(n) {
                                switch (n.label) {
                                  case 0:
                                    return e = r.view.sc(i), e.zi ? [ 4 /*yield*/ , la(t.localStore, r.query, 
                                    /* usePreviousResults= */ !1).then((function(t) {
                                        var n = t.documents;
                                        return r.view.sc(n, e);
                                    })) ] : [ 3 /*break*/ , 2 ];

                                  case 1:
                                    // The query has a limit and some docs were removed, so we need
                                    // to re-run the query against the local store to make sure we
                                    // didn't lose any good docs that had been past the limit.
                                    e = n.sent(), n.label = 2;

                                  case 2:
                                    return u = o && o.targetChanges.get(r.targetId), a = r.view.applyChanges(e, 
                                    /* updateLimboDocuments= */ t.isPrimaryClient, u), [ 2 /*return*/ , ($s(t, r.targetId, a.cc), 
                                    a.snapshot) ];
                                }
                            }));
                        }));
                    }(t, r, i, o);
                }, [ 4 /*yield*/ , la(t.localStore, r, 
                /* usePreviousResults= */ !0) ];

              case 1:
                return a = d.sent(), s = new Rs(r, a.ir), c = s.sc(a.documents), l = bi.createSynthesizedTargetChangeForCurrentChange(i, o && "Offline" /* OnlineState.Offline */ !== t.onlineState, u), 
                h = s.applyChanges(c, 
                /* updateLimboDocuments= */ t.isPrimaryClient, l), $s(t, i, h.cc), f = new Vs(r, i, s), 
                [ 2 /*return*/ , (t.wc.set(r, f), t._c.has(i) ? t._c.get(i).push(r) : t._c.set(i, [ r ]), 
                h.snapshot) ];
            }
        }));
    }));
}

/** Stops listening to the query. */ function Us(t, r) {
    return e(this, void 0, void 0, (function() {
        var e, i, o;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return e = j(t), i = e.wc.get(r), (o = e._c.get(i.targetId)).length > 1 ? [ 2 /*return*/ , (e._c.set(i.targetId, o.filter((function(t) {
                    return !rr(t, r);
                }))), void e.wc.delete(r)) ] : e.isPrimaryClient ? (
                // We need to remove the local query target first to allow us to verify
                // whether any other client is still interested in this target.
                e.sharedClientState.removeLocalQueryTarget(i.targetId), e.sharedClientState.isActiveQueryTarget(i.targetId) ? [ 3 /*break*/ , 2 ] : [ 4 /*yield*/ , ca(e.localStore, i.targetId, 
                /*keepPersistedTargetData=*/ !1).then((function() {
                    e.sharedClientState.clearQueryState(i.targetId), Wa(e.remoteStore, i.targetId), 
                    Js(e, i.targetId);
                })).catch(xt) ]) : [ 3 /*break*/ , 3 ];

              case 1:
                n.sent(), n.label = 2;

              case 2:
                return [ 3 /*break*/ , 5 ];

              case 3:
                return Js(e, i.targetId), [ 4 /*yield*/ , ca(e.localStore, i.targetId, 
                /*keepPersistedTargetData=*/ !0) ];

              case 4:
                n.sent(), n.label = 5;

              case 5:
                return [ 2 /*return*/ ];
            }
        }));
    }));
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
 */ function zs(t, r, i) {
    return e(this, void 0, void 0, (function() {
        var e, o, u, a;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                e = vc(t), n.label = 1;

              case 1:
                return n.trys.push([ 1, 5, , 6 ]), [ 4 /*yield*/ , function(t, e) {
                    var n, r, i = j(t), o = st.now(), u = e.reduce((function(t, e) {
                        return t.add(e.key);
                    }), Ir());
                    return i.persistence.runTransaction("Locally write mutations", "readwrite", (function(t) {
                        // Figure out which keys do not have a remote version in the cache, this
                        // is needed to create the right overlay mutation: if no remote version
                        // presents, we do not need to create overlays as patch mutations.
                        // TODO(Overlay): Is there a better way to determine this? Using the
                        //  document version does not work because local mutations set them back
                        //  to 0.
                        var a = fr(), s = Ir();
                        return i.Zi.getEntries(t, u).next((function(t) {
                            (a = t).forEach((function(t, e) {
                                e.isValidDocument() || (s = s.add(t));
                            }));
                        })).next((function() {
                            return i.localDocuments.getOverlayedDocuments(t, a);
                        })).next((function(r) {
                            n = r;
                            for (
                            // For non-idempotent mutations (such as `FieldValue.increment()`),
                            // we record the base state in a separate patch mutation. This is
                            // later used to guarantee consistent values and prevents flicker
                            // even if the backend sends us an update that already includes our
                            // transform.
                            var u = [], a = 0, s = e; a < s.length; a++) {
                                var c = s[a], l = Wr(c, n.get(c.key).overlayedDocument);
                                null != l && 
                                // NOTE: The base state should only be applied if there's some
                                // existing document to override, so use a Precondition of
                                // exists=true
                                u.push(new Xr(c.key, l, fn(l.value.mapValue), Ur.exists(!0)));
                            }
                            return i.mutationQueue.addMutationBatch(t, o, u, e);
                        })).next((function(e) {
                            r = e;
                            var o = e.applyToLocalDocumentSet(n, s);
                            return i.documentOverlayCache.saveOverlays(t, e.batchId, o);
                        }));
                    })).then((function() {
                        return {
                            batchId: r.batchId,
                            changes: vr(n)
                        };
                    }));
                }(e.localStore, r) ];

              case 2:
                return o = n.sent(), e.sharedClientState.addPendingMutation(o.batchId), function(t, e, n) {
                    var r = t.Tc[t.currentUser.toKey()];
                    r || (r = new Te(ot)), r = r.insert(e, n), t.Tc[t.currentUser.toKey()] = r;
                }(e, o.batchId, i), [ 4 /*yield*/ , nc(e, o.changes) ];

              case 3:
                return n.sent(), [ 4 /*yield*/ , os(e.remoteStore) ];

              case 4:
                return n.sent(), [ 3 /*break*/ , 6 ];

              case 5:
                return u = n.sent(), a = ys(u, "Failed to persist write"), i.reject(a), [ 3 /*break*/ , 6 ];

              case 6:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

/**
 * Applies one remote event to the sync engine, notifying any views of the
 * changes, and releasing any pending mutation batches that would become
 * visible because of the snapshot version the remote event contains.
 */ function Gs(t, r) {
    return e(this, void 0, void 0, (function() {
        var e, i;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                e = j(t), n.label = 1;

              case 1:
                return n.trys.push([ 1, 4, , 6 ]), [ 4 /*yield*/ , oa(e.localStore, r) ];

              case 2:
                return i = n.sent(), 
                // Update `receivedDocument` as appropriate for any limbo targets.
                r.targetChanges.forEach((function(t, n) {
                    var r = e.yc.get(n);
                    r && (
                    // Since this is a limbo resolution lookup, it's for a single document
                    // and it could be added, modified, or removed, but not a combination.
                    z(t.addedDocuments.size + t.modifiedDocuments.size + t.removedDocuments.size <= 1), 
                    t.addedDocuments.size > 0 ? r.fc = !0 : t.modifiedDocuments.size > 0 ? z(r.fc) : t.removedDocuments.size > 0 && (z(r.fc), 
                    r.fc = !1));
                })), [ 4 /*yield*/ , nc(e, i, r) ];

              case 3:
                // Update `receivedDocument` as appropriate for any limbo targets.
                return n.sent(), [ 3 /*break*/ , 6 ];

              case 4:
                return [ 4 /*yield*/ , xt(n.sent()) ];

              case 5:
                return n.sent(), [ 3 /*break*/ , 6 ];

              case 6:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

/**
 * Applies an OnlineState change to the sync engine and notifies any views of
 * the change.
 */ function js(t, e, n) {
    var r = j(t);
    // If we are the secondary client, we explicitly ignore the remote store's
    // online state (the local client may go offline, even though the primary
    // tab remains online) and only apply the primary tab's online state from
    // SharedClientState.
        if (r.isPrimaryClient && 0 /* OnlineStateSource.RemoteStore */ === n || !r.isPrimaryClient && 1 /* OnlineStateSource.SharedClientState */ === n) {
        var i = [];
        r.wc.forEach((function(t, n) {
            var r = n.view.Mu(e);
            r.snapshot && i.push(r.snapshot);
        })), function(t, e) {
            var n = j(t);
            n.onlineState = e;
            var r = !1;
            n.queries.forEach((function(t, n) {
                for (var i = 0, o = n.listeners; i < o.length; i++) {
                    // Run global snapshot listeners if a consistent snapshot has been emitted.
                    o[i].Mu(e) && (r = !0);
                }
            })), r && Cs(n);
        }(r.eventManager, e), i.length && r.dc.nu(i), r.onlineState = e, r.isPrimaryClient && r.sharedClientState.setOnlineState(e);
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
 */ function Ks(t, r, i) {
    return e(this, void 0, void 0, (function() {
        var e, o, u, a, s, c;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                // PORTING NOTE: Multi-tab only.
                return (e = j(t)).sharedClientState.updateQueryState(r, "rejected", i), o = e.yc.get(r), 
                (u = o && o.key) ? (
                // TODO(b/217189216): This limbo document should ideally have a read time,
                // so that it is picked up by any read-time based scans. The backend,
                // however, does not send a read time for target removals.
                a = (a = new Te(pt.comparator)).insert(u, dn.newNoDocument(u, ct.min())), s = Ir().add(u), 
                c = new wi(ct.min(), 
                /* targetChanges= */ new Map, 
                /* targetMismatches= */ new Te(ot), a, s), [ 4 /*yield*/ , Gs(e, c) ]) : [ 3 /*break*/ , 2 ];

              case 1:
                return n.sent(), 
                // Since this query failed, we won't want to manually unlisten to it.
                // We only remove it from bookkeeping after we successfully applied the
                // RemoteEvent. If `applyRemoteEvent()` throws, we want to re-listen to
                // this query when the RemoteStore restarts the Watch stream, which should
                // re-trigger the target failure.
                e.gc = e.gc.remove(u), e.yc.delete(r), ec(e), [ 3 /*break*/ , 4 ];

              case 2:
                return [ 4 /*yield*/ , ca(e.localStore, r, 
                /* keepPersistedTargetData */ !1).then((function() {
                    return Js(e, r, i);
                })).catch(xt) ];

              case 3:
                n.sent(), n.label = 4;

              case 4:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

function Qs(t, r) {
    return e(this, void 0, void 0, (function() {
        var e, i, o;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                e = j(t), i = r.batch.batchId, n.label = 1;

              case 1:
                return n.trys.push([ 1, 4, , 6 ]), [ 4 /*yield*/ , ra(e.localStore, r) ];

              case 2:
                return o = n.sent(), 
                // The local store may or may not be able to apply the write result and
                // raise events immediately (depending on whether the watcher is caught
                // up), so we raise user callbacks first so that they consistently happen
                // before listen events.
                Xs(e, i, /*error=*/ null), Ys(e, i), e.sharedClientState.updateMutationState(i, "acknowledged"), 
                [ 4 /*yield*/ , nc(e, o) ];

              case 3:
                // The local store may or may not be able to apply the write result and
                // raise events immediately (depending on whether the watcher is caught
                // up), so we raise user callbacks first so that they consistently happen
                // before listen events.
                return n.sent(), [ 3 /*break*/ , 6 ];

              case 4:
                return [ 4 /*yield*/ , xt(n.sent()) ];

              case 5:
                return n.sent(), [ 3 /*break*/ , 6 ];

              case 6:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

function Ws(t, r, i) {
    return e(this, void 0, void 0, (function() {
        var e, o;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                e = j(t), n.label = 1;

              case 1:
                return n.trys.push([ 1, 4, , 6 ]), [ 4 /*yield*/ , function(t, e) {
                    var n = j(t);
                    return n.persistence.runTransaction("Reject batch", "readwrite-primary", (function(t) {
                        var r;
                        return n.mutationQueue.lookupMutationBatch(t, e).next((function(e) {
                            return z(null !== e), r = e.keys(), n.mutationQueue.removeMutationBatch(t, e);
                        })).next((function() {
                            return n.mutationQueue.performConsistencyCheck(t);
                        })).next((function() {
                            return n.documentOverlayCache.removeOverlaysForBatchId(t, r, e);
                        })).next((function() {
                            return n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(t, r);
                        })).next((function() {
                            return n.localDocuments.getDocuments(t, r);
                        }));
                    }));
                }(e.localStore, r) ];

              case 2:
                return o = n.sent(), 
                // The local store may or may not be able to apply the write result and
                // raise events immediately (depending on whether the watcher is caught up),
                // so we raise user callbacks first so that they consistently happen before
                // listen events.
                Xs(e, r, i), Ys(e, r), e.sharedClientState.updateMutationState(r, "rejected", i), 
                [ 4 /*yield*/ , nc(e, o) ];

              case 3:
                // The local store may or may not be able to apply the write result and
                // raise events immediately (depending on whether the watcher is caught up),
                // so we raise user callbacks first so that they consistently happen before
                // listen events.
                return n.sent(), [ 3 /*break*/ , 6 ];

              case 4:
                return [ 4 /*yield*/ , xt(n.sent()) ];

              case 5:
                return n.sent(), [ 3 /*break*/ , 6 ];

              case 6:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

/**
 * Registers a user callback that resolves when all pending mutations at the moment of calling
 * are acknowledged .
 */ function Hs(t, r) {
    return e(this, void 0, void 0, (function() {
        var e, i, o, u, a;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                Za((e = j(t)).remoteStore) || M("SyncEngine", "The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled."), 
                n.label = 1;

              case 1:
                return n.trys.push([ 1, 3, , 4 ]), [ 4 /*yield*/ , function(t) {
                    var e = j(t);
                    return e.persistence.runTransaction("Get highest unacknowledged batch id", "readonly", (function(t) {
                        return e.mutationQueue.getHighestUnacknowledgedBatchId(t);
                    }));
                }(e.localStore) ];

              case 2:
                return -1 === (i = n.sent()) ? [ 2 /*return*/ , void r.resolve() ] : ((o = e.Ec.get(i) || []).push(r), 
                e.Ec.set(i, o), [ 3 /*break*/ , 4 ]);

              case 3:
                return u = n.sent(), a = ys(u, "Initialization of waitForPendingWrites() operation failed"), 
                r.reject(a), [ 3 /*break*/ , 4 ];

              case 4:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

/**
 * Triggers the callbacks that are waiting for this batch id to get acknowledged by server,
 * if there are any.
 */ function Ys(t, e) {
    (t.Ec.get(e) || []).forEach((function(t) {
        t.resolve();
    })), t.Ec.delete(e)
    /** Reject all outstanding callbacks waiting for pending writes to complete. */;
}

function Xs(t, e, n) {
    var r = j(t), i = r.Tc[r.currentUser.toKey()];
    // NOTE: Mutations restored from persistence won't have callbacks, so it's
    // okay for there to be no callback for this ID.
    if (i) {
        var o = i.get(e);
        o && (n ? o.reject(n) : o.resolve(), i = i.remove(e)), r.Tc[r.currentUser.toKey()] = i;
    }
}

function Js(t, e, n) {
    void 0 === n && (n = null), t.sharedClientState.removeLocalQueryTarget(e);
    for (var r = 0, i = t._c.get(e); r < i.length; r++) {
        var o = i[r];
        t.wc.delete(o), n && t.dc.Pc(o, n);
    }
    t._c.delete(e), t.isPrimaryClient && t.Ic.Is(e).forEach((function(e) {
        t.Ic.containsKey(e) || 
        // We removed the last reference for this key
        Zs(t, e);
    }));
}

function Zs(t, e) {
    t.mc.delete(e.path.canonicalString());
    // It's possible that the target already got removed because the query failed. In that case,
    // the key won't exist in `limboTargetsByKey`. Only do the cleanup if we still have the target.
    var n = t.gc.get(e);
    null !== n && (Wa(t.remoteStore, n), t.gc = t.gc.remove(e), t.yc.delete(n), ec(t));
}

function $s(t, e, n) {
    for (var r = 0, i = n; r < i.length; r++) {
        var o = i[r];
        o instanceof Fs ? (t.Ic.addReference(o.key, e), tc(t, o)) : o instanceof Ps ? (M("SyncEngine", "Document no longer in limbo: " + o.key), 
        t.Ic.removeReference(o.key, e), t.Ic.containsKey(o.key) || 
        // We removed the last reference for this key
        Zs(t, o.key)) : U();
    }
}

function tc(t, e) {
    var n = e.key, r = n.path.canonicalString();
    t.gc.get(n) || t.mc.has(r) || (M("SyncEngine", "New document in limbo: " + n), t.mc.add(r), 
    ec(t));
}

/**
 * Starts listens for documents in limbo that are enqueued for resolution,
 * subject to a maximum number of concurrent resolutions.
 *
 * Without bounding the number of concurrent resolutions, the server can fail
 * with "resource exhausted" errors which can lead to pathological client
 * behavior as seen in https://github.com/firebase/firebase-js-sdk/issues/2683.
 */ function ec(t) {
    for (;t.mc.size > 0 && t.gc.size < t.maxConcurrentLimboResolutions; ) {
        var e = t.mc.values().next().value;
        t.mc.delete(e);
        var n = new pt(ht.fromString(e)), r = t.Ac.next();
        t.yc.set(r, new Ms(n)), t.gc = t.gc.insert(n, r), Qa(t.remoteStore, new ao(tr(Hn(n.path)), r, "TargetPurposeLimboResolution" /* TargetPurpose.LimboResolution */ , Ut.ct));
    }
}

function nc(t, r, i) {
    return e(this, void 0, void 0, (function() {
        var o, u, a, s;
        return n(this, (function(c) {
            switch (c.label) {
              case 0:
                return o = j(t), u = [], a = [], s = [], o.wc.isEmpty() ? [ 3 /*break*/ , 3 ] : (o.wc.forEach((function(t, e) {
                    s.push(o.Rc(e, r, i).then((function(t) {
                        // Update views if there are actual changes.
                        if (
                        // If there are changes, or we are handling a global snapshot, notify
                        // secondary clients to update query state.
                        (t || i) && o.isPrimaryClient && o.sharedClientState.updateQueryState(e.targetId, (null == t ? void 0 : t.fromCache) ? "not-current" : "current"), 
                        t) {
                            u.push(t);
                            var n = Zu.Li(e.targetId, t);
                            a.push(n);
                        }
                    })));
                })), [ 4 /*yield*/ , Promise.all(s) ]);

              case 1:
                return c.sent(), o.dc.nu(u), [ 4 /*yield*/ , function(t, r) {
                    return e(this, void 0, void 0, (function() {
                        var e, i, o, u, a, s, c, l, h;
                        return n(this, (function(n) {
                            switch (n.label) {
                              case 0:
                                e = j(t), n.label = 1;

                              case 1:
                                return n.trys.push([ 1, 3, , 4 ]), [ 4 /*yield*/ , e.persistence.runTransaction("notifyLocalViewChanges", "readwrite", (function(t) {
                                    return Nt.forEach(r, (function(n) {
                                        return Nt.forEach(n.Fi, (function(r) {
                                            return e.persistence.referenceDelegate.addReference(t, n.targetId, r);
                                        })).next((function() {
                                            return Nt.forEach(n.Bi, (function(r) {
                                                return e.persistence.referenceDelegate.removeReference(t, n.targetId, r);
                                            }));
                                        }));
                                    }));
                                })) ];

                              case 2:
                                return n.sent(), [ 3 /*break*/ , 4 ];

                              case 3:
                                if (!Pt(i = n.sent())) throw i;
                                // If `notifyLocalViewChanges` fails, we did not advance the sequence
                                // number for the documents that were included in this transaction.
                                // This might trigger them to be deleted earlier than they otherwise
                                // would have, but it should not invalidate the integrity of the data.
                                                                return M("LocalStore", "Failed to update sequence numbers: " + i), 
                                [ 3 /*break*/ , 4 ];

                              case 4:
                                for (o = 0, u = r; o < u.length; o++) a = u[o], s = a.targetId, a.fromCache || (c = e.Ji.get(s), 
                                l = c.snapshotVersion, h = c.withLastLimboFreeSnapshotVersion(l), 
                                // Advance the last limbo free snapshot version
                                e.Ji = e.Ji.insert(s, h));
                                return [ 2 /*return*/ ];
                            }
                        }));
                    }));
                }(o.localStore, a) ];

              case 2:
                c.sent(), c.label = 3;

              case 3:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

function rc(t, r) {
    return e(this, void 0, void 0, (function() {
        var e, i;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return (e = j(t)).currentUser.isEqual(r) ? [ 3 /*break*/ , 3 ] : (M("SyncEngine", "User change. New user:", r.toKey()), 
                [ 4 /*yield*/ , na(e.localStore, r) ]);

              case 1:
                return i = n.sent(), e.currentUser = r, 
                // Fails tasks waiting for pending writes requested by previous user.
                function(t, e) {
                    t.Ec.forEach((function(t) {
                        t.forEach((function(t) {
                            t.reject(new Q(K.CANCELLED, "'waitForPendingWrites' promise is rejected due to a user change."));
                        }));
                    })), t.Ec.clear();
                }(e), 
                // TODO(b/114226417): Consider calling this only in the primary tab.
                e.sharedClientState.handleUserChange(r, i.removedBatchIds, i.addedBatchIds), [ 4 /*yield*/ , nc(e, i.er) ];

              case 2:
                n.sent(), n.label = 3;

              case 3:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

function ic(t, e) {
    var n = j(t), r = n.yc.get(e);
    if (r && r.fc) return Ir().add(r.key);
    var i = Ir(), o = n._c.get(e);
    if (!o) return i;
    for (var u = 0, a = o; u < a.length; u++) {
        var s = a[u], c = n.wc.get(s);
        i = i.unionWith(c.view.nc);
    }
    return i;
}

/**
 * Reconcile the list of synced documents in an existing view with those
 * from persistence.
 */ function oc(t, r) {
    return e(this, void 0, void 0, (function() {
        var e, i, o;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return [ 4 /*yield*/ , la((e = j(t)).localStore, r.query, 
                /* usePreviousResults= */ !0) ];

              case 1:
                return i = n.sent(), o = r.view.hc(i), [ 2 /*return*/ , (e.isPrimaryClient && $s(e, r.targetId, o.cc), 
                o) ];
            }
        }));
    }));
}

/**
 * Retrieves newly changed documents from remote document cache and raises
 * snapshots if needed.
 */
// PORTING NOTE: Multi-Tab only.
function uc(t, r) {
    return e(this, void 0, void 0, (function() {
        var e;
        return n(this, (function(n) {
            return [ 2 /*return*/ , fa((e = j(t)).localStore, r).then((function(t) {
                return nc(e, t);
            })) ];
        }));
    }));
}

/** Applies a mutation state to an existing batch.  */
// PORTING NOTE: Multi-Tab only.
function ac(t, r, i, o) {
    return e(this, void 0, void 0, (function() {
        var e, u;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return [ 4 /*yield*/ , function(t, e) {
                    var n = j(t), r = j(n.mutationQueue);
                    return n.persistence.runTransaction("Lookup mutation documents", "readonly", (function(t) {
                        return r.Sn(t, e).next((function(e) {
                            return e ? n.localDocuments.getDocuments(t, e) : Nt.resolve(null);
                        }));
                    }));
                }((e = j(t)).localStore, r) ];

              case 1:
                return null === (u = n.sent()) ? [ 3 /*break*/ , 6 ] : "pending" !== i ? [ 3 /*break*/ , 3 ] : [ 4 /*yield*/ , os(e.remoteStore) ];

              case 2:
                // If we are the primary client, we need to send this write to the
                // backend. Secondary clients will ignore these writes since their remote
                // connection is disabled.
                return n.sent(), [ 3 /*break*/ , 4 ];

              case 3:
                "acknowledged" === i || "rejected" === i ? (
                // NOTE: Both these methods are no-ops for batches that originated from
                // other clients.
                Xs(e, r, o || null), Ys(e, r), function(t, e) {
                    j(j(t).mutationQueue).Cn(e);
                }(e.localStore, r)) : U(), n.label = 4;

              case 4:
                return [ 4 /*yield*/ , nc(e, u) ];

              case 5:
                return n.sent(), [ 3 /*break*/ , 7 ];

              case 6:
                // A throttled tab may not have seen the mutation before it was completed
                // and removed from the mutation queue, in which case we won't have cached
                // the affected documents. In this case we can safely ignore the update
                // since that means we didn't apply the mutation locally at all (if we
                // had, we would have cached the affected documents), and so we will just
                // see any resulting document changes via normal remote document updates
                // as applicable.
                M("SyncEngine", "Cannot apply mutation batch with id: " + r), n.label = 7;

              case 7:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

/** Applies a query target change from a different tab. */
// PORTING NOTE: Multi-Tab only.
function sc(t, r) {
    return e(this, void 0, void 0, (function() {
        var e, i, o, u, a, s, c, l;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return pc(e = j(t)), vc(e), !0 !== r || !0 === e.vc ? [ 3 /*break*/ , 3 ] : (i = e.sharedClientState.getAllActiveQueryTargets(), 
                [ 4 /*yield*/ , cc(e, i.toArray()) ]);

              case 1:
                return o = n.sent(), e.vc = !0, [ 4 /*yield*/ , ds(e.remoteStore, !0) ];

              case 2:
                for (n.sent(), u = 0, a = o; u < a.length; u++) s = a[u], Qa(e.remoteStore, s);
                return [ 3 /*break*/ , 7 ];

              case 3:
                return !1 !== r || !1 === e.vc ? [ 3 /*break*/ , 7 ] : (c = [], l = Promise.resolve(), 
                e._c.forEach((function(t, n) {
                    e.sharedClientState.isLocalQueryTarget(n) ? c.push(n) : l = l.then((function() {
                        return Js(e, n), ca(e.localStore, n, 
                        /*keepPersistedTargetData=*/ !0);
                    })), Wa(e.remoteStore, n);
                })), [ 4 /*yield*/ , l ]);

              case 4:
                return n.sent(), [ 4 /*yield*/ , cc(e, c) ];

              case 5:
                return n.sent(), 
                // PORTING NOTE: Multi-Tab only.
                function(t) {
                    var e = j(t);
                    e.yc.forEach((function(t, n) {
                        Wa(e.remoteStore, n);
                    })), e.Ic.Ts(), e.yc = new Map, e.gc = new Te(pt.comparator);
                }(e), e.vc = !1, [ 4 /*yield*/ , ds(e.remoteStore, !1) ];

              case 6:
                n.sent(), n.label = 7;

              case 7:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

function cc(t, r, i) {
    return e(this, void 0, void 0, (function() {
        var e, i, o, u, a, s, c, l, h, f, d, p, v, m;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                e = j(t), i = [], o = [], u = 0, a = r, n.label = 1;

              case 1:
                return u < a.length ? (s = a[u], c = void 0, (l = e._c.get(s)) && 0 !== l.length ? [ 4 /*yield*/ , sa(e.localStore, tr(l[0])) ] : [ 3 /*break*/ , 7 ]) : [ 3 /*break*/ , 13 ];

              case 2:
                // For queries that have a local View, we fetch their current state
                // from LocalStore (as the resume token and the snapshot version
                // might have changed) and reconcile their views with the persisted
                // state (the list of syncedDocuments may have gotten out of sync).
                c = n.sent(), h = 0, f = l, n.label = 3;

              case 3:
                return h < f.length ? (d = f[h], p = e.wc.get(d), [ 4 /*yield*/ , oc(e, p) ]) : [ 3 /*break*/ , 6 ];

              case 4:
                (v = n.sent()).snapshot && o.push(v.snapshot), n.label = 5;

              case 5:
                return h++, [ 3 /*break*/ , 3 ];

              case 6:
                return [ 3 /*break*/ , 11 ];

              case 7:
                return [ 4 /*yield*/ , ha(e.localStore, s) ];

              case 8:
                return m = n.sent(), [ 4 /*yield*/ , sa(e.localStore, m) ];

              case 9:
                return c = n.sent(), [ 4 /*yield*/ , Bs(e, lc(m), s, 
                /*current=*/ !1, c.resumeToken) ];

              case 10:
                n.sent(), n.label = 11;

              case 11:
                i.push(c), n.label = 12;

              case 12:
                return u++, [ 3 /*break*/ , 1 ];

              case 13:
                return [ 2 /*return*/ , (e.dc.nu(o), i) ];
            }
        }));
    }));
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
function lc(t) {
    return Wn(t.path, t.collectionGroup, t.orderBy, t.filters, t.limit, "F" /* LimitType.First */ , t.startAt, t.endAt);
}

/** Returns the IDs of the clients that are currently active. */
// PORTING NOTE: Multi-Tab only.
function hc(t) {
    var e = j(t);
    return j(j(e.localStore).persistence).$i();
}

/** Applies a query target change from a different tab. */
// PORTING NOTE: Multi-Tab only.
function fc(t, r, i, o) {
    return e(this, void 0, void 0, (function() {
        var e, u, a, s;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                if ((e = j(t)).vc) 
                // If we receive a target state notification via WebStorage, we are
                // either already secondary or another tab has taken the primary lease.
                return [ 2 /*return*/ , void M("SyncEngine", "Ignoring unexpected query state notification.") ];
                if (!((u = e._c.get(r)) && u.length > 0)) return [ 3 /*break*/ , 7 ];
                switch (i) {
                  case "current":
                  case "not-current":
                    return [ 3 /*break*/ , 1 ];

                  case "rejected":
                    return [ 3 /*break*/ , 4 ];
                }
                return [ 3 /*break*/ , 6 ];

              case 1:
                return [ 4 /*yield*/ , fa(e.localStore, ar(u[0])) ];

              case 2:
                return a = n.sent(), s = wi.createSynthesizedRemoteEventForCurrentChange(r, "current" === i, Oe.EMPTY_BYTE_STRING), 
                [ 4 /*yield*/ , nc(e, a, s) ];

              case 3:
                return n.sent(), [ 3 /*break*/ , 7 ];

              case 4:
                return [ 4 /*yield*/ , ca(e.localStore, r, 
                /* keepPersistedTargetData */ !0) ];

              case 5:
                return n.sent(), Js(e, r, o), [ 3 /*break*/ , 7 ];

              case 6:
                U(), n.label = 7;

              case 7:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

/** Adds or removes Watch targets for queries from different tabs. */ function dc(t, r, i) {
    return e(this, void 0, void 0, (function() {
        var e, o, u, a, s, c, l, h, f, d;
        return n(this, (function(p) {
            switch (p.label) {
              case 0:
                if (!(e = pc(t)).vc) return [ 3 /*break*/ , 10 ];
                o = 0, u = r, p.label = 1;

              case 1:
                return o < u.length ? (a = u[o], e._c.has(a) ? (
                // A target might have been added in a previous attempt
                M("SyncEngine", "Adding an already active target " + a), [ 3 /*break*/ , 5 ]) : [ 4 /*yield*/ , ha(e.localStore, a) ]) : [ 3 /*break*/ , 6 ];

              case 2:
                return s = p.sent(), [ 4 /*yield*/ , sa(e.localStore, s) ];

              case 3:
                return c = p.sent(), [ 4 /*yield*/ , Bs(e, lc(s), c.targetId, 
                /*current=*/ !1, c.resumeToken) ];

              case 4:
                p.sent(), Qa(e.remoteStore, c), p.label = 5;

              case 5:
                return o++, [ 3 /*break*/ , 1 ];

              case 6:
                l = function(t) {
                    return n(this, (function(n) {
                        switch (n.label) {
                          case 0:
                            return e._c.has(t) ? [ 4 /*yield*/ , ca(e.localStore, t, 
                            /* keepPersistedTargetData */ !1).then((function() {
                                Wa(e.remoteStore, t), Js(e, t);
                            })).catch(xt) ] : [ 3 /*break*/ , 2 ];

                            // Release queries that are still active.
                                                      case 1:
                            // Release queries that are still active.
                            n.sent(), n.label = 2;

                          case 2:
                            return [ 2 /*return*/ ];
                        }
                    }));
                }, h = 0, f = i, p.label = 7;

              case 7:
                return h < f.length ? (d = f[h], [ 5 /*yield**/ , l(d) ]) : [ 3 /*break*/ , 10 ];

              case 8:
                p.sent(), p.label = 9;

              case 9:
                return h++, [ 3 /*break*/ , 7 ];

              case 10:
                return [ 2 /*return*/ ];
            }
        }));
    }));
}

function pc(t) {
    var e = j(t);
    return e.remoteStore.remoteSyncer.applyRemoteEvent = Gs.bind(null, e), e.remoteStore.remoteSyncer.getRemoteKeysForTarget = ic.bind(null, e), 
    e.remoteStore.remoteSyncer.rejectListen = Ks.bind(null, e), e.dc.nu = _s.bind(null, e.eventManager), 
    e.dc.Pc = Ds.bind(null, e.eventManager), e;
}

function vc(t) {
    var e = j(t);
    return e.remoteStore.remoteSyncer.applySuccessfulWrite = Qs.bind(null, e), e.remoteStore.remoteSyncer.rejectFailedWrite = Ws.bind(null, e), 
    e
    /**
 * Loads a Firestore bundle into the SDK. The returned promise resolves when
 * the bundle finished loading.
 *
 * @param syncEngine - SyncEngine to use.
 * @param bundleReader - Bundle to load into the SDK.
 * @param task - LoadBundleTask used to update the loading progress to public API.
 */;
}

function mc(t, r, i) {
    var o = j(t);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
        /** Loads a bundle and returns the list of affected collection groups. */
    (function(t, r, i) {
        return e(this, void 0, void 0, (function() {
            var e, o, u, a, s, c;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return n.trys.push([ 0, 14, , 15 ]), [ 4 /*yield*/ , r.getMetadata() ];

                  case 1:
                    return e = n.sent(), [ 4 /*yield*/ , function(t, e) {
                        var n = j(t), r = Vi(e.createTime);
                        return n.persistence.runTransaction("hasNewerBundle", "readonly", (function(t) {
                            return n.qs.getBundleMetadata(t, e.id);
                        })).then((function(t) {
                            return !!t && t.createTime.compareTo(r) >= 0;
                        }));
                    }(t.localStore, e) ];

                  case 2:
                    return n.sent() ? [ 4 /*yield*/ , r.close() ] : [ 3 /*break*/ , 4 ];

                  case 3:
                    return [ 2 /*return*/ , (n.sent(), i._completeWith(function(t) {
                        return {
                            taskState: "Success",
                            documentsLoaded: t.totalDocuments,
                            bytesLoaded: t.totalBytes,
                            totalDocuments: t.totalDocuments,
                            totalBytes: t.totalBytes
                        };
                    }(e)), Promise.resolve(new Set)) ];

                  case 4:
                    return i._updateProgress(Os(e)), o = new ks(e, t.localStore, r.serializer), [ 4 /*yield*/ , r.bc() ];

                  case 5:
                    u = n.sent(), n.label = 6;

                  case 6:
                    return u ? [ 4 /*yield*/ , o.zu(u) ] : [ 3 /*break*/ , 10 ];

                  case 7:
                    return (a = n.sent()) && i._updateProgress(a), [ 4 /*yield*/ , r.bc() ];

                  case 8:
                    u = n.sent(), n.label = 9;

                  case 9:
                    return [ 3 /*break*/ , 6 ];

                  case 10:
                    return [ 4 /*yield*/ , o.complete() ];

                  case 11:
                    return s = n.sent(), [ 4 /*yield*/ , nc(t, s.Ju, 
                    /* remoteEvent */ void 0) ];

                  case 12:
                    // Save metadata, so loading the same bundle will skip.
                    return n.sent(), [ 4 /*yield*/ , function(t, e) {
                        var n = j(t);
                        return n.persistence.runTransaction("Save bundle", "readwrite", (function(t) {
                            return n.qs.saveBundleMetadata(t, e);
                        }));
                    }(t.localStore, e) ];

                  case 13:
                    return [ 2 /*return*/ , (
                    // Save metadata, so loading the same bundle will skip.
                    n.sent(), i._completeWith(s.progress), Promise.resolve(s.Hu)) ];

                  case 14:
                    return c = n.sent(), [ 2 /*return*/ , (q("SyncEngine", "Loading bundle failed with ".concat(c)), 
                    i._failWith(c), Promise.resolve(new Set)) ];

                  case 15:
                    return [ 2 /*return*/ ];
                }
            }));
        }));
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
 */)(o, r, i).then((function(t) {
        o.sharedClientState.notifyBundleLoaded(t);
    }));
}

var yc = /** @class */ function() {
    function t() {
        this.synchronizeTabs = !1;
    }
    return t.prototype.initialize = function(t) {
        return e(this, void 0, void 0, (function() {
            return n(this, (function(e) {
                switch (e.label) {
                  case 0:
                    return this.serializer = Va(t.databaseInfo.databaseId), this.sharedClientState = this.createSharedClientState(t), 
                    this.persistence = this.createPersistence(t), [ 4 /*yield*/ , this.persistence.start() ];

                  case 1:
                    return e.sent(), this.localStore = this.createLocalStore(t), this.gcScheduler = this.createGarbageCollectionScheduler(t, this.localStore), 
                    this.indexBackfillerScheduler = this.createIndexBackfillerScheduler(t, this.localStore), 
                    [ 2 /*return*/ ];
                }
            }));
        }));
    }, t.prototype.createGarbageCollectionScheduler = function(t, e) {
        return null;
    }, t.prototype.createIndexBackfillerScheduler = function(t, e) {
        return null;
    }, t.prototype.createLocalStore = function(t) {
        return ea(this.persistence, new $u, t.initialUser, this.serializer);
    }, t.prototype.createPersistence = function(t) {
        return new Uu(Gu.zs, this.serializer);
    }, t.prototype.createSharedClientState = function(t) {
        return new _a;
    }, t.prototype.terminate = function() {
        return e(this, void 0, void 0, (function() {
            return n(this, (function(t) {
                switch (t.label) {
                  case 0:
                    return this.gcScheduler && this.gcScheduler.stop(), [ 4 /*yield*/ , this.sharedClientState.shutdown() ];

                  case 1:
                    return t.sent(), [ 4 /*yield*/ , this.persistence.shutdown() ];

                  case 2:
                    return t.sent(), [ 2 /*return*/ ];
                }
            }));
        }));
    }, t;
}(), gc = /** @class */ function(e) {
    function n(t) {
        var n = this;
        return (n = e.call(this) || this).cacheSizeBytes = t, n;
    }
    return t(n, e), n.prototype.createGarbageCollectionScheduler = function(t, e) {
        z(this.persistence.referenceDelegate instanceof ju);
        var n = this.persistence.referenceDelegate.garbageCollector;
        return new yu(n, t.asyncQueue, e);
    }, n.prototype.createPersistence = function(t) {
        var e = void 0 !== this.cacheSizeBytes ? nu.withCacheSize(this.cacheSizeBytes) : nu.DEFAULT;
        return new Uu((function(t) {
            return ju.zs(t, e);
        }), this.serializer);
    }, n;
}(yc), wc = /** @class */ function(r) {
    function i(t, e, n) {
        var i = this;
        return (i = r.call(this) || this).Vc = t, i.cacheSizeBytes = e, i.forceOwnership = n, 
        i.synchronizeTabs = !1, i;
    }
    return t(i, r), i.prototype.initialize = function(t) {
        return e(this, void 0, void 0, (function() {
            var e = this;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return [ 4 /*yield*/ , r.prototype.initialize.call(this, t) ];

                  case 1:
                    return n.sent(), [ 4 /*yield*/ , this.Vc.initialize(this, t) ];

                  case 2:
                    // Enqueue writes from a previous session
                    return n.sent(), [ 4 /*yield*/ , vc(this.Vc.syncEngine) ];

                  case 3:
                    // Enqueue writes from a previous session
                    return n.sent(), [ 4 /*yield*/ , os(this.Vc.remoteStore) ];

                  case 4:
                    // NOTE: This will immediately call the listener, so we make sure to
                    // set it after localStore / remoteStore are started.
                    return n.sent(), [ 4 /*yield*/ , this.persistence.Ii((function() {
                        return e.gcScheduler && !e.gcScheduler.started && e.gcScheduler.start(), e.indexBackfillerScheduler && !e.indexBackfillerScheduler.started && e.indexBackfillerScheduler.start(), 
                        Promise.resolve();
                    })) ];

                  case 5:
                    // NOTE: This will immediately call the listener, so we make sure to
                    // set it after localStore / remoteStore are started.
                    return n.sent(), [ 2 /*return*/ ];
                }
            }));
        }));
    }, i.prototype.createLocalStore = function(t) {
        return ea(this.persistence, new $u, t.initialUser, this.serializer);
    }, i.prototype.createGarbageCollectionScheduler = function(t, e) {
        var n = this.persistence.referenceDelegate.garbageCollector;
        return new yu(n, t.asyncQueue, e);
    }, i.prototype.createIndexBackfillerScheduler = function(t, e) {
        var n = new Bt(e, this.persistence);
        return new qt(t.asyncQueue, n);
    }, i.prototype.createPersistence = function(t) {
        var e = Ju(t.databaseInfo.databaseId, t.databaseInfo.persistenceKey), n = void 0 !== this.cacheSizeBytes ? nu.withCacheSize(this.cacheSizeBytes) : nu.DEFAULT;
        return new Hu(this.synchronizeTabs, e, t.clientId, n, t.asyncQueue, Pa(), Ra(), this.serializer, this.sharedClientState, !!this.forceOwnership);
    }, i.prototype.createSharedClientState = function(t) {
        return new _a;
    }, i;
}(yc), bc = /** @class */ function(r) {
    function i(t, e) {
        var n = this;
        return (n = r.call(this, t, e, /* forceOwnership= */ !1) || this).Vc = t, n.cacheSizeBytes = e, 
        n.synchronizeTabs = !0, n;
    }
    return t(i, r), i.prototype.initialize = function(t) {
        return e(this, void 0, void 0, (function() {
            var i, o = this;
            return n(this, (function(u) {
                switch (u.label) {
                  case 0:
                    return [ 4 /*yield*/ , r.prototype.initialize.call(this, t) ];

                  case 1:
                    return u.sent(), i = this.Vc.syncEngine, this.sharedClientState instanceof Sa ? (this.sharedClientState.syncEngine = {
                        jr: ac.bind(null, i),
                        zr: fc.bind(null, i),
                        Wr: dc.bind(null, i),
                        $i: hc.bind(null, i),
                        Qr: uc.bind(null, i)
                    }, [ 4 /*yield*/ , this.sharedClientState.start() ]) : [ 3 /*break*/ , 3 ];

                  case 2:
                    u.sent(), u.label = 3;

                  case 3:
                    // NOTE: This will immediately call the listener, so we make sure to
                    // set it after localStore / remoteStore are started.
                    return [ 4 /*yield*/ , this.persistence.Ii((function(t) {
                        return e(o, void 0, void 0, (function() {
                            return n(this, (function(e) {
                                switch (e.label) {
                                  case 0:
                                    return [ 4 /*yield*/ , sc(this.Vc.syncEngine, t) ];

                                  case 1:
                                    return e.sent(), this.gcScheduler && (t && !this.gcScheduler.started ? this.gcScheduler.start() : t || this.gcScheduler.stop()), 
                                    this.indexBackfillerScheduler && (t && !this.indexBackfillerScheduler.started ? this.indexBackfillerScheduler.start() : t || this.indexBackfillerScheduler.stop()), 
                                    [ 2 /*return*/ ];
                                }
                            }));
                        }));
                    })) ];

                  case 4:
                    // NOTE: This will immediately call the listener, so we make sure to
                    // set it after localStore / remoteStore are started.
                    return u.sent(), [ 2 /*return*/ ];
                }
            }));
        }));
    }, i.prototype.createSharedClientState = function(t) {
        var e = Pa();
        if (!Sa.D(e)) throw new Q(K.UNIMPLEMENTED, "IndexedDB persistence is only available on platforms that support LocalStorage.");
        var n = Ju(t.databaseInfo.databaseId, t.databaseInfo.persistenceKey);
        return new Sa(e, t.asyncQueue, n, t.clientId, t.initialUser);
    }, i;
}(wc), Ic = /** @class */ function() {
    function t() {}
    return t.prototype.initialize = function(t, r) {
        return e(this, void 0, void 0, (function() {
            var e = this;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return this.localStore ? [ 3 /*break*/ , 2 ] : (this.localStore = t.localStore, 
                    this.sharedClientState = t.sharedClientState, this.datastore = this.createDatastore(r), 
                    this.remoteStore = this.createRemoteStore(r), this.eventManager = this.createEventManager(r), 
                    this.syncEngine = this.createSyncEngine(r, 
                    /* startAsPrimary=*/ !t.synchronizeTabs), this.sharedClientState.onlineStateHandler = function(t) {
                        return js(e.syncEngine, t, 1 /* OnlineStateSource.SharedClientState */);
                    }, this.remoteStore.remoteSyncer.handleCredentialChange = rc.bind(null, this.syncEngine), 
                    [ 4 /*yield*/ , ds(this.remoteStore, this.syncEngine.isPrimaryClient) ]);

                  case 1:
                    n.sent(), n.label = 2;

                  case 2:
                    return [ 2 /*return*/ ];
                }
            }));
        }));
    }, t.prototype.createEventManager = function(t) {
        return new Es;
    }, t.prototype.createDatastore = function(t) {
        var e, n = Va(t.databaseInfo.databaseId), r = (e = t.databaseInfo, new Fa(e));
        /** Return the Platform-specific connectivity monitor. */ return function(t, e, n, r) {
            return new Ua(t, e, n, r);
        }(t.authCredentials, t.appCheckCredentials, r, n);
    }, t.prototype.createRemoteStore = function(t) {
        var e, n, r, i, o, u = this;
        return e = this.localStore, n = this.datastore, r = t.asyncQueue, i = function(t) {
            return js(u.syncEngine, t, 0 /* OnlineStateSource.RemoteStore */);
        }, o = Ca.D() ? new Ca : new Da, new Ga(e, n, r, i, o);
    }, t.prototype.createSyncEngine = function(t, e) {
        return function(t, e, n, 
        // PORTING NOTE: Manages state synchronization in multi-tab environments.
        r, i, o, u) {
            var a = new Ls(t, e, n, r, i, o);
            return u && (a.vc = !0), a;
        }(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, t.initialUser, t.maxConcurrentLimboResolutions, e);
    }, t.prototype.terminate = function() {
        return function(t) {
            return e(this, void 0, void 0, (function() {
                var e;
                return n(this, (function(n) {
                    switch (n.label) {
                      case 0:
                        return e = j(t), M("RemoteStore", "RemoteStore shutting down."), e.vu.add(5 /* OfflineCause.Shutdown */), 
                        [ 4 /*yield*/ , Ka(e) ];

                      case 1:
                        return n.sent(), e.Pu.shutdown(), 
                        // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
                        // triggering spurious listener events with cached data, etc.
                        e.bu.set("Unknown" /* OnlineState.Unknown */), [ 2 /*return*/ ];
                    }
                }));
            }));
        }(this.remoteStore);
    }, t;
}();

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
function Ec(t, r) {
    void 0 === r && (r = 10240);
    var i = 0;
    // The TypeScript definition for ReadableStreamReader changed. We use
    // `any` here to allow this code to compile with different versions.
    // See https://github.com/microsoft/TypeScript/issues/42970
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        read: function() {
            return e(this, void 0, void 0, (function() {
                var e;
                return n(this, (function(n) {
                    return i < t.byteLength ? (e = {
                        value: t.slice(i, i + r),
                        done: !1
                    }, [ 2 /*return*/ , (i += r, e) ]) : [ 2 /*return*/ , {
                        done: !0
                    } ];
                }));
            }));
        },
        cancel: function() {
            return e(this, void 0, void 0, (function() {
                return n(this, (function(t) {
                    return [ 2 /*return*/ ];
                }));
            }));
        },
        releaseLock: function() {},
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
 */ var Tc = /** @class */ function() {
    function t(t) {
        this.observer = t, 
        /**
             * When set to true, will not raise future events. Necessary to deal with
             * async detachment of listener.
             */
        this.muted = !1;
    }
    return t.prototype.next = function(t) {
        this.observer.next && this.Sc(this.observer.next, t);
    }, t.prototype.error = function(t) {
        this.observer.error ? this.Sc(this.observer.error, t) : L("Uncaught Error in snapshot listener:", t.toString());
    }, t.prototype.Dc = function() {
        this.muted = !0;
    }, t.prototype.Sc = function(t, e) {
        var n = this;
        this.muted || setTimeout((function() {
            n.muted || t(e);
        }), 0);
    }, t;
}(), Sc = /** @class */ function() {
    function t(
    /** The reader to read from underlying binary bundle data source. */
    t, e) {
        var n = this;
        this.Cc = t, this.serializer = e, 
        /** Cached bundle metadata. */
        this.metadata = new W, 
        /**
             * Internal buffer to hold bundle content, accumulating incomplete element
             * content.
             */
        this.buffer = new Uint8Array, this.xc = new TextDecoder("utf-8"), 
        // Read the metadata (which is the first element).
        this.Nc().then((function(t) {
            t && t.Qu() ? n.metadata.resolve(t.Gu.metadata) : n.metadata.reject(new Error("The first element of the bundle is not a metadata, it is\n             ".concat(JSON.stringify(null == t ? void 0 : t.Gu))));
        }), (function(t) {
            return n.metadata.reject(t);
        }));
    }
    return t.prototype.close = function() {
        return this.Cc.cancel();
    }, t.prototype.getMetadata = function() {
        return e(this, void 0, void 0, (function() {
            return n(this, (function(t) {
                return [ 2 /*return*/ , this.metadata.promise ];
            }));
        }));
    }, t.prototype.bc = function() {
        return e(this, void 0, void 0, (function() {
            return n(this, (function(t) {
                switch (t.label) {
                  case 0:
                    return [ 4 /*yield*/ , this.getMetadata() ];

                  case 1:
                    // Makes sure metadata is read before proceeding.
                    return [ 2 /*return*/ , (t.sent(), this.Nc()) ];
                }
            }));
        }));
    }, 
    /**
     * Reads from the head of internal buffer, and pulling more data from
     * underlying stream if a complete element cannot be found, until an
     * element(including the prefixed length and the JSON string) is found.
     *
     * Once a complete element is read, it is dropped from internal buffer.
     *
     * Returns either the bundled element, or null if we have reached the end of
     * the stream.
     */
    t.prototype.Nc = function() {
        return e(this, void 0, void 0, (function() {
            var t, e, r, i;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return [ 4 /*yield*/ , this.kc() ];

                  case 1:
                    return null === (t = n.sent()) ? [ 2 /*return*/ , null ] : (e = this.xc.decode(t), 
                    r = Number(e), isNaN(r) && this.Mc("length string (".concat(e, ") is not valid number")), 
                    [ 4 /*yield*/ , this.$c(r) ]);

                  case 2:
                    return i = n.sent(), [ 2 /*return*/ , new Ns(JSON.parse(i), t.length + r) ];
                }
            }));
        }));
    }, 
    /** First index of '{' from the underlying buffer. */ t.prototype.Oc = function() {
        return this.buffer.findIndex((function(t) {
            return t === "{".charCodeAt(0);
        }));
    }, 
    /**
     * Reads from the beginning of the internal buffer, until the first '{', and
     * return the content.
     *
     * If reached end of the stream, returns a null.
     */
    t.prototype.kc = function() {
        return e(this, void 0, void 0, (function() {
            var t, e;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return this.Oc() < 0 ? [ 4 /*yield*/ , this.Fc() ] : [ 3 /*break*/ , 3 ];

                  case 1:
                    if (n.sent()) return [ 3 /*break*/ , 3 ];
                    n.label = 2;

                  case 2:
                    return [ 3 /*break*/ , 0 ];

                  case 3:
                    // Broke out of the loop because underlying stream is closed, and there
                    // happens to be no more data to process.
                    return 0 === this.buffer.length ? [ 2 /*return*/ , null ] : (
                    // Broke out of the loop because underlying stream is closed, but still
                    // cannot find an open bracket.
                    (t = this.Oc()) < 0 && this.Mc("Reached the end of bundle when a length string is expected."), 
                    e = this.buffer.slice(0, t), [ 2 /*return*/ , (this.buffer = this.buffer.slice(t), 
                    e) ]);
                }
            }));
        }));
    }, 
    /**
     * Reads from a specified position from the internal buffer, for a specified
     * number of bytes, pulling more data from the underlying stream if needed.
     *
     * Returns a string decoded from the read bytes.
     */
    t.prototype.$c = function(t) {
        return e(this, void 0, void 0, (function() {
            var e;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return this.buffer.length < t ? [ 4 /*yield*/ , this.Fc() ] : [ 3 /*break*/ , 3 ];

                  case 1:
                    n.sent() && this.Mc("Reached the end of bundle when more is expected."), n.label = 2;

                  case 2:
                    return [ 3 /*break*/ , 0 ];

                  case 3:
                    // Update the internal buffer to drop the read json string.
                    return e = this.xc.decode(this.buffer.slice(0, t)), [ 2 /*return*/ , (this.buffer = this.buffer.slice(t), 
                    e) ];
                }
            }));
        }));
    }, t.prototype.Mc = function(t) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        throw this.Cc.cancel(), new Error("Invalid bundle format: ".concat(t));
    }, 
    /**
     * Pulls more data from underlying stream to internal buffer.
     * Returns a boolean indicating whether the stream is finished.
     */
    t.prototype.Fc = function() {
        return e(this, void 0, void 0, (function() {
            var t, e;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return [ 4 /*yield*/ , this.Cc.read() ];

                  case 1:
                    return (t = n.sent()).done || ((e = new Uint8Array(this.buffer.length + t.value.length)).set(this.buffer), 
                    e.set(t.value, this.buffer.length), this.buffer = e), [ 2 /*return*/ , t.done ];
                }
            }));
        }));
    }, t;
}(), _c = /** @class */ function() {
    function t(t) {
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
    return t.prototype.lookup = function(t) {
        return e(this, void 0, void 0, (function() {
            var r, i = this;
            return n(this, (function(o) {
                switch (o.label) {
                  case 0:
                    if (this.ensureCommitNotCalled(), this.mutations.length > 0) throw new Q(K.INVALID_ARGUMENT, "Firestore transactions require all reads to be executed before all writes.");
                    return [ 4 /*yield*/ , function(t, r) {
                        return e(this, void 0, void 0, (function() {
                            var e, i, o, u, a, s;
                            return n(this, (function(n) {
                                switch (n.label) {
                                  case 0:
                                    return e = j(t), i = Gi(e.serializer) + "/documents", o = {
                                        documents: r.map((function(t) {
                                            return qi(e.serializer, t);
                                        }))
                                    }, [ 4 /*yield*/ , e.vo("BatchGetDocuments", i, o, r.length) ];

                                  case 1:
                                    return u = n.sent(), a = new Map, u.forEach((function(t) {
                                        var n = function(t, e) {
                                            return "found" in e ? function(t, e) {
                                                z(!!e.found), e.found.name, e.found.updateTime;
                                                var n = Bi(t, e.found.name), r = Vi(e.found.updateTime), i = e.found.createTime ? Vi(e.found.createTime) : ct.min(), o = new hn({
                                                    mapValue: {
                                                        fields: e.found.fields
                                                    }
                                                });
                                                return dn.newFoundDocument(n, r, i, o);
                                            }(t, e) : "missing" in e ? function(t, e) {
                                                z(!!e.missing), z(!!e.readTime);
                                                var n = Bi(t, e.missing), r = Vi(e.readTime);
                                                return dn.newNoDocument(n, r);
                                            }(t, e) : U();
                                        }(e.serializer, t);
                                        a.set(n.key.toString(), n);
                                    })), s = [], [ 2 /*return*/ , (r.forEach((function(t) {
                                        var e = a.get(t.toString());
                                        z(!!e), s.push(e);
                                    })), s) ];
                                }
                            }));
                        }));
                    }(this.datastore, t) ];

                  case 1:
                    return [ 2 /*return*/ , ((r = o.sent()).forEach((function(t) {
                        return i.recordVersion(t);
                    })), r) ];
                }
            }));
        }));
    }, t.prototype.set = function(t, e) {
        this.write(e.toMutation(t, this.precondition(t))), this.writtenDocs.add(t.toString());
    }, t.prototype.update = function(t, e) {
        try {
            this.write(e.toMutation(t, this.preconditionForUpdate(t)));
        } catch (t) {
            this.lastWriteError = t;
        }
        this.writtenDocs.add(t.toString());
    }, t.prototype.delete = function(t) {
        this.write(new ni(t, this.precondition(t))), this.writtenDocs.add(t.toString());
    }, t.prototype.commit = function() {
        return e(this, void 0, void 0, (function() {
            var t, r = this;
            return n(this, (function(i) {
                switch (i.label) {
                  case 0:
                    if (this.ensureCommitNotCalled(), this.lastWriteError) throw this.lastWriteError;
                    return t = this.readVersions, 
                    // For each mutation, note that the doc was written.
                    this.mutations.forEach((function(e) {
                        t.delete(e.key.toString());
                    })), 
                    // For each document that was read but not written to, we want to perform
                    // a `verify` operation.
                    t.forEach((function(t, e) {
                        var n = pt.fromPath(e);
                        r.mutations.push(new ri(n, r.precondition(n)));
                    })), [ 4 /*yield*/ , function(t, r) {
                        return e(this, void 0, void 0, (function() {
                            var e, i, o;
                            return n(this, (function(n) {
                                switch (n.label) {
                                  case 0:
                                    return e = j(t), i = Gi(e.serializer) + "/documents", o = {
                                        writes: r.map((function(t) {
                                            return Wi(e.serializer, t);
                                        }))
                                    }, [ 4 /*yield*/ , e.Io("Commit", i, o) ];

                                  case 1:
                                    return n.sent(), [ 2 /*return*/ ];
                                }
                            }));
                        }));
                    }(this.datastore, this.mutations) ];

                  case 1:
                    // For each mutation, note that the doc was written.
                    return i.sent(), this.committed = !0, [ 2 /*return*/ ];
                }
            }));
        }));
    }, t.prototype.recordVersion = function(t) {
        var e;
        if (t.isFoundDocument()) e = t.version; else {
            if (!t.isNoDocument()) throw U();
            // Represent a deleted doc using SnapshotVersion.min().
                        e = ct.min();
        }
        var n = this.readVersions.get(t.key.toString());
        if (n) {
            if (!e.isEqual(n)) 
            // This transaction will fail no matter what.
            throw new Q(K.ABORTED, "Document version changed between two reads.");
        } else this.readVersions.set(t.key.toString(), e);
    }, 
    /**
     * Returns the version of this document when it was read in this transaction,
     * as a precondition, or no precondition if it was not read.
     */
    t.prototype.precondition = function(t) {
        var e = this.readVersions.get(t.toString());
        return !this.writtenDocs.has(t.toString()) && e ? e.isEqual(ct.min()) ? Ur.exists(!1) : Ur.updateTime(e) : Ur.none();
    }, 
    /**
     * Returns the precondition for a document if the operation is an update.
     */
    t.prototype.preconditionForUpdate = function(t) {
        var e = this.readVersions.get(t.toString());
        // The first time a document is written, we want to take into account the
        // read time and existence
                if (!this.writtenDocs.has(t.toString()) && e) {
            if (e.isEqual(ct.min())) 
            // The document doesn't exist, so fail the transaction.
            // This has to be validated locally because you can't send a
            // precondition that a document does not exist without changing the
            // semantics of the backend write to be an insert. This is the reverse
            // of what we want, since we want to assert that the document doesn't
            // exist but then send the update and have it fail. Since we can't
            // express that to the backend, we have to validate locally.
            // Note: this can change once we can send separate verify writes in the
            // transaction.
            throw new Q(K.INVALID_ARGUMENT, "Can't update a document that doesn't exist.");
            // Document exists, base precondition on document update time.
                        return Ur.updateTime(e);
        }
        // Document was not read, so we just use the preconditions for a blind
        // update.
                return Ur.exists(!0);
    }, t.prototype.write = function(t) {
        this.ensureCommitNotCalled(), this.mutations.push(t);
    }, t.prototype.ensureCommitNotCalled = function() {}, t;
}(), Dc = /** @class */ function() {
    function t(t, e, n, r, i) {
        this.asyncQueue = t, this.datastore = e, this.options = n, this.updateFunction = r, 
        this.deferred = i, this.Bc = n.maxAttempts, this.qo = new Ma(this.asyncQueue, "transaction_retry" /* TimerId.TransactionRetry */)
        /** Runs the transaction and sets the result on deferred. */;
    }
    return t.prototype.run = function() {
        this.Bc -= 1, this.Lc();
    }, t.prototype.Lc = function() {
        var t = this;
        this.qo.No((function() {
            return e(t, void 0, void 0, (function() {
                var t, e, r = this;
                return n(this, (function(n) {
                    return t = new _c(this.datastore), (e = this.qc(t)) && e.then((function(e) {
                        r.asyncQueue.enqueueAndForget((function() {
                            return t.commit().then((function() {
                                r.deferred.resolve(e);
                            })).catch((function(t) {
                                r.Uc(t);
                            }));
                        }));
                    })).catch((function(t) {
                        r.Uc(t);
                    })), [ 2 /*return*/ ];
                }));
            }));
        }));
    }, t.prototype.qc = function(t) {
        try {
            var e = this.updateFunction(t);
            return !zt(e) && e.catch && e.then ? e : (this.deferred.reject(Error("Transaction callback must return a Promise")), 
            null);
        } catch (t) {
            // Do not retry errors thrown by user provided updateFunction.
            return this.deferred.reject(t), null;
        }
    }, t.prototype.Uc = function(t) {
        var e = this;
        this.Bc > 0 && this.Kc(t) ? (this.Bc -= 1, this.asyncQueue.enqueueAndForget((function() {
            return e.Lc(), Promise.resolve();
        }))) : this.deferred.reject(t);
    }, t.prototype.Kc = function(t) {
        if ("FirebaseError" === t.name) {
            // In transactions, the backend will fail outdated reads with FAILED_PRECONDITION and
            // non-matching document versions with ABORTED. These errors should be retried.
            var e = t.code;
            return "aborted" === e || "failed-precondition" === e || "already-exists" === e || !ci(e);
        }
        return !1;
    }, t;
}(), Cc = /** @class */ function() {
    function t(t, r, 
    /**
     * Asynchronous queue responsible for all of our internal processing. When
     * we get incoming work from the user (via public API) or the network
     * (incoming GRPC messages), we should always schedule onto this queue.
     * This ensures all of our work is properly serialized (e.g. we don't
     * start processing a new operation while the previous one is waiting for
     * an async I/O to complete).
     */
    i, o) {
        var u = this;
        this.authCredentials = t, this.appCheckCredentials = r, this.asyncQueue = i, this.databaseInfo = o, 
        this.user = O.UNAUTHENTICATED, this.clientId = it.A(), this.authCredentialListener = function() {
            return Promise.resolve();
        }, this.appCheckCredentialListener = function() {
            return Promise.resolve();
        }, this.authCredentials.start(i, (function(t) {
            return e(u, void 0, void 0, (function() {
                return n(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return M("FirestoreClient", "Received user=", t.uid), [ 4 /*yield*/ , this.authCredentialListener(t) ];

                      case 1:
                        return e.sent(), this.user = t, [ 2 /*return*/ ];
                    }
                }));
            }));
        })), this.appCheckCredentials.start(i, (function(t) {
            return M("FirestoreClient", "Received new app check token=", t), u.appCheckCredentialListener(t, u.user);
        }));
    }
    return t.prototype.getConfiguration = function() {
        return e(this, void 0, void 0, (function() {
            return n(this, (function(t) {
                return [ 2 /*return*/ , {
                    asyncQueue: this.asyncQueue,
                    databaseInfo: this.databaseInfo,
                    clientId: this.clientId,
                    authCredentials: this.authCredentials,
                    appCheckCredentials: this.appCheckCredentials,
                    initialUser: this.user,
                    maxConcurrentLimboResolutions: 100
                } ];
            }));
        }));
    }, t.prototype.setCredentialChangeListener = function(t) {
        this.authCredentialListener = t;
    }, t.prototype.setAppCheckTokenChangeListener = function(t) {
        this.appCheckCredentialListener = t;
    }, 
    /**
     * Checks that the client has not been terminated. Ensures that other methods on //
     * this class cannot be called after the client is terminated. //
     */
    t.prototype.verifyNotTerminated = function() {
        if (this.asyncQueue.isShuttingDown) throw new Q(K.FAILED_PRECONDITION, "The client has already been terminated.");
    }, t.prototype.terminate = function() {
        var t = this;
        this.asyncQueue.enterRestrictedMode();
        var r = new W;
        return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((function() {
            return e(t, void 0, void 0, (function() {
                var t, e;
                return n(this, (function(n) {
                    switch (n.label) {
                      case 0:
                        return n.trys.push([ 0, 5, , 6 ]), this._onlineComponents ? [ 4 /*yield*/ , this._onlineComponents.terminate() ] : [ 3 /*break*/ , 2 ];

                      case 1:
                        n.sent(), n.label = 2;

                      case 2:
                        return this._offlineComponents ? [ 4 /*yield*/ , this._offlineComponents.terminate() ] : [ 3 /*break*/ , 4 ];

                      case 3:
                        n.sent(), n.label = 4;

                      case 4:
                        // The credentials provider must be terminated after shutting down the
                        // RemoteStore as it will prevent the RemoteStore from retrieving auth
                        // tokens.
                        return this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), r.resolve(), 
                        [ 3 /*break*/ , 6 ];

                      case 5:
                        return t = n.sent(), e = ys(t, "Failed to shutdown persistence"), r.reject(e), [ 3 /*break*/ , 6 ];

                      case 6:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        })), r.promise;
    }, t;
}();

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
 */ function xc(t, r) {
    return e(this, void 0, void 0, (function() {
        var i, o, u = this;
        return n(this, (function(a) {
            switch (a.label) {
              case 0:
                return t.asyncQueue.verifyOperationInProgress(), M("FirestoreClient", "Initializing OfflineComponentProvider"), 
                [ 4 /*yield*/ , t.getConfiguration() ];

              case 1:
                return i = a.sent(), [ 4 /*yield*/ , r.initialize(i) ];

              case 2:
                return a.sent(), o = i.initialUser, t.setCredentialChangeListener((function(t) {
                    return e(u, void 0, void 0, (function() {
                        return n(this, (function(e) {
                            switch (e.label) {
                              case 0:
                                return o.isEqual(t) ? [ 3 /*break*/ , 2 ] : [ 4 /*yield*/ , na(r.localStore, t) ];

                              case 1:
                                e.sent(), o = t, e.label = 2;

                              case 2:
                                return [ 2 /*return*/ ];
                            }
                        }));
                    }));
                })), 
                // When a user calls clearPersistence() in one client, all other clients
                // need to be terminated to allow the delete to succeed.
                r.persistence.setDatabaseDeletedListener((function() {
                    return t.terminate();
                })), t._offlineComponents = r, [ 2 /*return*/ ];
            }
        }));
    }));
}

function Nc(t, r) {
    return e(this, void 0, void 0, (function() {
        var e, i;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return t.asyncQueue.verifyOperationInProgress(), [ 4 /*yield*/ , kc(t) ];

              case 1:
                return e = n.sent(), M("FirestoreClient", "Initializing OnlineComponentProvider"), 
                [ 4 /*yield*/ , t.getConfiguration() ];

              case 2:
                return i = n.sent(), [ 4 /*yield*/ , r.initialize(e, i) ];

              case 3:
                return n.sent(), 
                // The CredentialChangeListener of the online component provider takes
                // precedence over the offline component provider.
                t.setCredentialChangeListener((function(t) {
                    return fs(r.remoteStore, t);
                })), t.setAppCheckTokenChangeListener((function(t, e) {
                    return fs(r.remoteStore, e);
                })), t._onlineComponents = r, [ 2 /*return*/ ];
            }
        }));
    }));
}

/**
 * Decides whether the provided error allows us to gracefully disable
 * persistence (as opposed to crashing the client).
 */ function Ac(t) {
    return "FirebaseError" === t.name ? t.code === K.FAILED_PRECONDITION || t.code === K.UNIMPLEMENTED : !("undefined" != typeof DOMException && t instanceof DOMException) || 
    // When the browser is out of quota we could get either quota exceeded
    // or an aborted error depending on whether the error happened during
    // schema migration.
    22 === t.code || 20 === t.code || 
    // Firefox Private Browsing mode disables IndexedDb and returns
    // INVALID_STATE for any usage.
    11 === t.code;
}

function kc(t) {
    return e(this, void 0, void 0, (function() {
        var e, r;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                if (t._offlineComponents) return [ 3 /*break*/ , 8 ];
                if (!t._uninitializedComponentsProvider) return [ 3 /*break*/ , 6 ];
                M("FirestoreClient", "Using user provided OfflineComponentProvider"), n.label = 1;

              case 1:
                return n.trys.push([ 1, 3, , 5 ]), [ 4 /*yield*/ , xc(t, t._uninitializedComponentsProvider._offline) ];

              case 2:
                return n.sent(), [ 3 /*break*/ , 5 ];

              case 3:
                if (e = n.sent(), !Ac(r = e)) throw r;
                return q("Error using user provided cache. Falling back to memory cache: " + r), 
                [ 4 /*yield*/ , xc(t, new yc) ];

              case 4:
                return n.sent(), [ 3 /*break*/ , 5 ];

              case 5:
                return [ 3 /*break*/ , 8 ];

              case 6:
                return M("FirestoreClient", "Using default OfflineComponentProvider"), [ 4 /*yield*/ , xc(t, new yc) ];

              case 7:
                n.sent(), n.label = 8;

              case 8:
                return [ 2 /*return*/ , t._offlineComponents ];
            }
        }));
    }));
}

function Oc(t) {
    return e(this, void 0, void 0, (function() {
        var e;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return t._onlineComponents ? [ 3 /*break*/ , 5 ] : t._uninitializedComponentsProvider ? (M("FirestoreClient", "Using user provided OnlineComponentProvider"), 
                [ 4 /*yield*/ , Nc(t, t._uninitializedComponentsProvider._online) ]) : [ 3 /*break*/ , 2 ];

              case 1:
                return e = n.sent(), [ 3 /*break*/ , 4 ];

              case 2:
                return M("FirestoreClient", "Using default OnlineComponentProvider"), [ 4 /*yield*/ , Nc(t, new Ic) ];

              case 3:
                e = n.sent(), n.label = 4;

              case 4:
                e, n.label = 5;

              case 5:
                return [ 2 /*return*/ , t._onlineComponents ];
            }
        }));
    }));
}

function Fc(t) {
    return kc(t).then((function(t) {
        return t.persistence;
    }));
}

function Pc(t) {
    return kc(t).then((function(t) {
        return t.localStore;
    }));
}

function Rc(t) {
    return Oc(t).then((function(t) {
        return t.remoteStore;
    }));
}

function Vc(t) {
    return Oc(t).then((function(t) {
        return t.syncEngine;
    }));
}

function Mc(t) {
    return Oc(t).then((function(t) {
        return t.datastore;
    }));
}

function Lc(t) {
    return e(this, void 0, void 0, (function() {
        var e, r;
        return n(this, (function(n) {
            switch (n.label) {
              case 0:
                return [ 4 /*yield*/ , Oc(t) ];

              case 1:
                return e = n.sent(), [ 2 /*return*/ , ((r = e.eventManager).onListen = qs.bind(null, e.syncEngine), 
                r.onUnlisten = Us.bind(null, e.syncEngine), r) ];
            }
        }));
    }));
}

/** Enables the network connection and re-enqueues all pending operations. */ function qc(t, r, i) {
    var o = this;
    void 0 === i && (i = {});
    var u = new W;
    return t.asyncQueue.enqueueAndForget((function() {
        return e(o, void 0, void 0, (function() {
            var e;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return e = function(t, e, n, r, i) {
                        var o = new Tc({
                            next: function(o) {
                                // Remove query first before passing event to user to avoid
                                // user actions affecting the now stale query.
                                e.enqueueAndForget((function() {
                                    return Ss(t, u);
                                }));
                                var a = o.docs.has(n);
                                !a && o.fromCache ? 
                                // TODO(dimond): If we're online and the document doesn't
                                // exist then we resolve with a doc.exists set to false. If
                                // we're offline however, we reject the Promise in this
                                // case. Two options: 1) Cache the negative response from
                                // the server so we can deliver that even when you're
                                // offline 2) Actually reject the Promise in the online case
                                // if the document doesn't exist.
                                i.reject(new Q(K.UNAVAILABLE, "Failed to get document because the client is offline.")) : a && o.fromCache && r && "server" === r.source ? i.reject(new Q(K.UNAVAILABLE, 'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')) : i.resolve(o);
                            },
                            error: function(t) {
                                return i.reject(t);
                            }
                        }), u = new xs(Hn(n.path), o, {
                            includeMetadataChanges: !0,
                            Ku: !0
                        });
                        return Ts(t, u);
                    }, [ 4 /*yield*/ , Lc(t) ];

                  case 1:
                    return [ 2 /*return*/ , e.apply(void 0, [ n.sent(), t.asyncQueue, r, i, u ]) ];
                }
            }));
        }));
    })), u.promise;
}

function Bc(t, r, i) {
    var o = this;
    void 0 === i && (i = {});
    var u = new W;
    return t.asyncQueue.enqueueAndForget((function() {
        return e(o, void 0, void 0, (function() {
            var e;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return e = function(t, e, n, r, i) {
                        var o = new Tc({
                            next: function(n) {
                                // Remove query first before passing event to user to avoid
                                // user actions affecting the now stale query.
                                e.enqueueAndForget((function() {
                                    return Ss(t, u);
                                })), n.fromCache && "server" === r.source ? i.reject(new Q(K.UNAVAILABLE, 'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')) : i.resolve(n);
                            },
                            error: function(t) {
                                return i.reject(t);
                            }
                        }), u = new xs(n, o, {
                            includeMetadataChanges: !0,
                            Ku: !0
                        });
                        return Ts(t, u);
                    }, [ 4 /*yield*/ , Lc(t) ];

                  case 1:
                    return [ 2 /*return*/ , e.apply(void 0, [ n.sent(), t.asyncQueue, r, i, u ]) ];
                }
            }));
        }));
    })), u.promise;
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
function Uc(t) {
    var e = {};
    return void 0 !== t.timeoutSeconds && (e.timeoutSeconds = t.timeoutSeconds), e
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
 */;
}

var zc = new Map;

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
 */ function Gc(t, e, n) {
    if (!n) throw new Q(K.INVALID_ARGUMENT, "Function ".concat(t, "() cannot be called with an empty ").concat(e, "."));
}

/**
 * Validates that two boolean options are not set at the same time.
 * @internal
 */ function jc(t, e, n, r) {
    if (!0 === e && !0 === r) throw new Q(K.INVALID_ARGUMENT, "".concat(t, " and ").concat(n, " cannot be used together."));
}

/**
 * Validates that `path` refers to a document (indicated by the fact it contains
 * an even numbers of segments).
 */ function Kc(t) {
    if (!pt.isDocumentKey(t)) throw new Q(K.INVALID_ARGUMENT, "Invalid document reference. Document references must have an even number of segments, but ".concat(t, " has ").concat(t.length, "."));
}

/**
 * Validates that `path` refers to a collection (indicated by the fact it
 * contains an odd numbers of segments).
 */ function Qc(t) {
    if (pt.isDocumentKey(t)) throw new Q(K.INVALID_ARGUMENT, "Invalid collection reference. Collection references must have an odd number of segments, but ".concat(t, " has ").concat(t.length, "."));
}

/**
 * Returns true if it's a non-null object without a custom prototype
 * (i.e. excludes Array, Date, etc.).
 */
/** Returns a string describing the type / value of the provided input. */ function Wc(t) {
    if (void 0 === t) return "undefined";
    if (null === t) return "null";
    if ("string" == typeof t) return t.length > 20 && (t = "".concat(t.substring(0, 20), "...")), 
    JSON.stringify(t);
    if ("number" == typeof t || "boolean" == typeof t) return "" + t;
    if ("object" == typeof t) {
        if (t instanceof Array) return "an array";
        var e = 
        /** try to get the constructor name for an object. */
        function(t) {
            return t.constructor ? t.constructor.name : null;
        }(t);
        return e ? "a custom ".concat(e, " object") : "an object";
    }
    return "function" == typeof t ? "a function" : U();
}

function Hc(t, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
e) {
    if ("_delegate" in t && (
    // Unwrap Compat types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t = t._delegate), !(t instanceof e)) {
        if (e.name === t.constructor.name) throw new Q(K.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
        var n = Wc(t);
        throw new Q(K.INVALID_ARGUMENT, "Expected type '".concat(e.name, "', but it was: ").concat(n));
    }
    return t;
}

function Yc(t, e) {
    if (e <= 0) throw new Q(K.INVALID_ARGUMENT, "Function ".concat(t, "() requires a positive number, but it was: ").concat(e, "."));
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
 */ var Xc = /** @class */ function() {
    function t(t) {
        var e, n;
        if (void 0 === t.host) {
            if (void 0 !== t.ssl) throw new Q(K.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
            this.host = "firestore.googleapis.com", this.ssl = !0;
        } else this.host = t.host, this.ssl = null === (e = t.ssl) || void 0 === e || e;
        if (this.credentials = t.credentials, this.ignoreUndefinedProperties = !!t.ignoreUndefinedProperties, 
        this.cache = t.localCache, void 0 === t.cacheSizeBytes) this.cacheSizeBytes = 41943040; else {
            if (-1 !== t.cacheSizeBytes && t.cacheSizeBytes < 1048576) throw new Q(K.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
            this.cacheSizeBytes = t.cacheSizeBytes;
        }
        jc("experimentalForceLongPolling", t.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", t.experimentalAutoDetectLongPolling), 
        this.experimentalForceLongPolling = !!t.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = !1 : void 0 === t.experimentalAutoDetectLongPolling ? this.experimentalAutoDetectLongPolling = !0 : 
        // For backwards compatibility, coerce the value to boolean even though
        // the TypeScript compiler has narrowed the type to boolean already.
        // noinspection PointlessBooleanExpressionJS
        this.experimentalAutoDetectLongPolling = !!t.experimentalAutoDetectLongPolling, 
        this.experimentalLongPollingOptions = Uc(null !== (n = t.experimentalLongPollingOptions) && void 0 !== n ? n : {}), 
        function(t) {
            if (void 0 !== t.timeoutSeconds) {
                if (isNaN(t.timeoutSeconds)) throw new Q(K.INVALID_ARGUMENT, "invalid long polling timeout: ".concat(t.timeoutSeconds, " (must not be NaN)"));
                if (t.timeoutSeconds < 5) throw new Q(K.INVALID_ARGUMENT, "invalid long polling timeout: ".concat(t.timeoutSeconds, " (minimum allowed value is 5)"));
                if (t.timeoutSeconds > 30) throw new Q(K.INVALID_ARGUMENT, "invalid long polling timeout: ".concat(t.timeoutSeconds, " (maximum allowed value is 30)"));
            }
        }(this.experimentalLongPollingOptions), this.useFetchStreams = !!t.useFetchStreams;
    }
    return t.prototype.isEqual = function(t) {
        return this.host === t.host && this.ssl === t.ssl && this.credentials === t.credentials && this.cacheSizeBytes === t.cacheSizeBytes && this.experimentalForceLongPolling === t.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === t.experimentalAutoDetectLongPolling && (e = this.experimentalLongPollingOptions, 
        n = t.experimentalLongPollingOptions, e.timeoutSeconds === n.timeoutSeconds) && this.ignoreUndefinedProperties === t.ignoreUndefinedProperties && this.useFetchStreams === t.useFetchStreams;
        var e, n;
    }, t;
}(), Jc = /** @class */ function() {
    /** @hideconstructor */
    function t(t, e, n, r) {
        this._authCredentials = t, this._appCheckCredentials = e, this._databaseId = n, 
        this._app = r, 
        /**
             * Whether it's a Firestore or Firestore Lite instance.
             */
        this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new Xc({}), 
        this._settingsFrozen = !1;
    }
    return Object.defineProperty(t.prototype, "app", {
        /**
         * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
         * instance.
         */
        get: function() {
            if (!this._app) throw new Q(K.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
            return this._app;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "_initialized", {
        get: function() {
            return this._settingsFrozen;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "_terminated", {
        get: function() {
            return void 0 !== this._terminateTask;
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype._setSettings = function(t) {
        if (this._settingsFrozen) throw new Q(K.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
        this._settings = new Xc(t), void 0 !== t.credentials && (this._authCredentials = function(t) {
            if (!t) return new Y;
            switch (t.type) {
              case "firstParty":
                return new $(t.sessionIndex || "0", t.iamToken || null, t.authTokenFactory || null);

              case "provider":
                return t.client;

              default:
                throw new Q(K.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
            }
        }(t.credentials));
    }, t.prototype._getSettings = function() {
        return this._settings;
    }, t.prototype._freezeSettings = function() {
        return this._settingsFrozen = !0, this._settings;
    }, t.prototype._delete = function() {
        return this._terminateTask || (this._terminateTask = this._terminate()), this._terminateTask;
    }, 
    /** Returns a JSON-serializable representation of this `Firestore` instance. */ t.prototype.toJSON = function() {
        return {
            app: this._app,
            databaseId: this._databaseId,
            settings: this._settings
        };
    }, 
    /**
     * Terminates all components used by this client. Subclasses can override
     * this method to clean up their own dependencies, but must also call this
     * method.
     *
     * Only ever called once.
     */
    t.prototype._terminate = function() {
        /**
 * Removes all components associated with the provided instance. Must be called
 * when the `Firestore` instance is terminated.
 */
        return t = this, (e = zc.get(t)) && (M("ComponentProvider", "Removing Datastore"), 
        zc.delete(t), e.terminate()), Promise.resolve();
        var t, e;
    }, t;
}();

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
 */
function Zc(t, e, n, r) {
    var i;
    void 0 === r && (r = {});
    var o = (t = Hc(t, Jc))._getSettings(), u = "".concat(e, ":").concat(n);
    if ("firestore.googleapis.com" !== o.host && o.host !== u && q("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."), 
    t._setSettings(Object.assign(Object.assign({}, o), {
        host: u,
        ssl: !1
    })), r.mockUserToken) {
        var a, s;
        if ("string" == typeof r.mockUserToken) a = r.mockUserToken, s = O.MOCK_USER; else {
            // Let createMockUserToken validate first (catches common mistakes like
            // invalid field "uid" and missing field "sub" / "user_id".)
            a = y(r.mockUserToken, null === (i = t._app) || void 0 === i ? void 0 : i.options.projectId);
            var c = r.mockUserToken.sub || r.mockUserToken.user_id;
            if (!c) throw new Q(K.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
            s = new O(c);
        }
        t._authCredentials = new X(new H(a, s));
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
 */ var $c = /** @class */ function() {
    /** @hideconstructor */
    function t(t, 
    /**
     * If provided, the `FirestoreDataConverter` associated with this instance.
     */
    e, n) {
        this.converter = e, this._key = n, 
        /** The type of this Firestore reference. */
        this.type = "document", this.firestore = t;
    }
    return Object.defineProperty(t.prototype, "_path", {
        get: function() {
            return this._key.path;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "id", {
        /**
         * The document's identifier within its collection.
         */
        get: function() {
            return this._key.path.lastSegment();
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "path", {
        /**
         * A string representing the path of the referenced document (relative
         * to the root of the database).
         */
        get: function() {
            return this._key.path.canonicalString();
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "parent", {
        /**
         * The collection this `DocumentReference` belongs to.
         */
        get: function() {
            return new el(this.firestore, this.converter, this._key.path.popLast());
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.withConverter = function(e) {
        return new t(this.firestore, e, this._key);
    }, t;
}(), tl = /** @class */ function() {
    // This is the lite version of the Query class in the main SDK.
    /** @hideconstructor protected */
    function t(t, 
    /**
     * If provided, the `FirestoreDataConverter` associated with this instance.
     */
    e, n) {
        this.converter = e, this._query = n, 
        /** The type of this Firestore reference. */
        this.type = "query", this.firestore = t;
    }
    return t.prototype.withConverter = function(e) {
        return new t(this.firestore, e, this._query);
    }, t;
}(), el = /** @class */ function(e) {
    /** @hideconstructor */
    function n(t, n, r) {
        var i = this;
        return (i = e.call(this, t, n, Hn(r)) || this)._path = r, 
        /** The type of this Firestore reference. */
        i.type = "collection", i;
    }
    return t(n, e), Object.defineProperty(n.prototype, "id", {
        /** The collection's identifier. */ get: function() {
            return this._query.path.lastSegment();
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(n.prototype, "path", {
        /**
         * A string representing the path of the referenced collection (relative
         * to the root of the database).
         */
        get: function() {
            return this._query.path.canonicalString();
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(n.prototype, "parent", {
        /**
         * A reference to the containing `DocumentReference` if this is a
         * subcollection. If this isn't a subcollection, the reference is null.
         */
        get: function() {
            var t = this._path.popLast();
            return t.isEmpty() ? null : new $c(this.firestore, 
            /* converter= */ null, new pt(t));
        },
        enumerable: !1,
        configurable: !0
    }), n.prototype.withConverter = function(t) {
        return new n(this.firestore, t, this._path);
    }, n;
}(tl);

/**
 * A `Query` refers to a query which you can read or listen to. You can also
 * construct refined `Query` objects by adding filters and ordering.
 */ function nl(t, e) {
    for (var n = [], i = 2; i < arguments.length; i++) n[i - 2] = arguments[i];
    if (t = v(t), Gc("collection", "path", e), t instanceof Jc) {
        var o = ht.fromString.apply(ht, r([ e ], n, !1));
        return Qc(o), new el(t, /* converter= */ null, o);
    }
    if (!(t instanceof $c || t instanceof el)) throw new Q(K.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    var u = t._path.child(ht.fromString.apply(ht, r([ e ], n, !1)));
    return Qc(u), new el(t.firestore, 
    /* converter= */ null, u);
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
 */ function rl(t, e) {
    if (t = Hc(t, Jc), Gc("collectionGroup", "collection id", e), e.indexOf("/") >= 0) throw new Q(K.INVALID_ARGUMENT, "Invalid collection ID '".concat(e, "' passed to function collectionGroup(). Collection IDs must not contain '/'."));
    return new tl(t, 
    /* converter= */ null, function(t) {
        return new Qn(ht.emptyPath(), t);
    }(e));
}

function il(t, e) {
    for (var n = [], i = 2; i < arguments.length; i++) n[i - 2] = arguments[i];
    if (t = v(t), 
    // We allow omission of 'pathString' but explicitly prohibit passing in both
    // 'undefined' and 'null'.
    1 === arguments.length && (e = it.A()), Gc("doc", "path", e), t instanceof Jc) {
        var o = ht.fromString.apply(ht, r([ e ], n, !1));
        return Kc(o), new $c(t, 
        /* converter= */ null, new pt(o));
    }
    if (!(t instanceof $c || t instanceof el)) throw new Q(K.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    var u = t._path.child(ht.fromString.apply(ht, r([ e ], n, !1)));
    return Kc(u), new $c(t.firestore, t instanceof el ? t.converter : null, new pt(u));
}

/**
 * Returns true if the provided references are equal.
 *
 * @param left - A reference to compare.
 * @param right - A reference to compare.
 * @returns true if the references point to the same location in the same
 * Firestore database.
 */ function ol(t, e) {
    return t = v(t), e = v(e), (t instanceof $c || t instanceof el) && (e instanceof $c || e instanceof el) && t.firestore === e.firestore && t.path === e.path && t.converter === e.converter
    /**
 * Returns true if the provided queries point to the same collection and apply
 * the same constraints.
 *
 * @param left - A `Query` to compare.
 * @param right - A `Query` to compare.
 * @returns true if the references point to the same location in the same
 * Firestore database.
 */;
}

function ul(t, e) {
    return t = v(t), e = v(e), t instanceof tl && e instanceof tl && t.firestore === e.firestore && rr(t._query, e._query) && t.converter === e.converter
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
 */;
}

var al = /** @class */ function() {
    function t() {
        var t = this;
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
        this.qo = new Ma(this, "async_queue_retry" /* TimerId.AsyncQueueRetry */), 
        // Visibility handler that triggers an immediate retry of all retryable
        // operations. Meant to speed up recovery when we regain file system access
        // after page comes into foreground.
        this.Xc = function() {
            var e = Ra();
            e && M("AsyncQueue", "Visibility state changed to " + e.visibilityState), t.qo.Mo();
        };
        var e = Ra();
        e && "function" == typeof e.addEventListener && e.addEventListener("visibilitychange", this.Xc);
    }
    return Object.defineProperty(t.prototype, "isShuttingDown", {
        get: function() {
            return this.jc;
        },
        enumerable: !1,
        configurable: !0
    }), 
    /**
     * Adds a new operation to the queue without waiting for it to complete (i.e.
     * we ignore the Promise result).
     */
    t.prototype.enqueueAndForget = function(t) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.enqueue(t);
    }, t.prototype.enqueueAndForgetEvenWhileRestricted = function(t) {
        this.Zc(), 
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.ta(t);
    }, t.prototype.enterRestrictedMode = function(t) {
        if (!this.jc) {
            this.jc = !0, this.Jc = t || !1;
            var e = Ra();
            e && "function" == typeof e.removeEventListener && e.removeEventListener("visibilitychange", this.Xc);
        }
    }, t.prototype.enqueue = function(t) {
        var e = this;
        if (this.Zc(), this.jc) 
        // Return a Promise which never resolves.
        return new Promise((function() {}));
        // Create a deferred Promise that we can return to the callee. This
        // allows us to return a "hanging Promise" only to the callee and still
        // advance the queue even when the operation is not run.
                var n = new W;
        return this.ta((function() {
            return e.jc && e.Jc ? Promise.resolve() : (t().then(n.resolve, n.reject), n.promise);
        })).then((function() {
            return n.promise;
        }));
    }, t.prototype.enqueueRetryable = function(t) {
        var e = this;
        this.enqueueAndForget((function() {
            return e.Qc.push(t), e.ea();
        }));
    }, 
    /**
     * Runs the next operation from the retryable queue. If the operation fails,
     * reschedules with backoff.
     */
    t.prototype.ea = function() {
        return e(this, void 0, void 0, (function() {
            var t, e = this;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    if (0 === this.Qc.length) return [ 3 /*break*/ , 5 ];
                    n.label = 1;

                  case 1:
                    return n.trys.push([ 1, 3, , 4 ]), [ 4 /*yield*/ , this.Qc[0]() ];

                  case 2:
                    return n.sent(), this.Qc.shift(), this.qo.reset(), [ 3 /*break*/ , 4 ];

                  case 3:
                    if (!Pt(t = n.sent())) throw t;
                    // Failure will be handled by AsyncQueue
                                        return M("AsyncQueue", "Operation failed with retryable error: " + t), 
                    [ 3 /*break*/ , 4 ];

                  case 4:
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
                    this.qo.No((function() {
                        return e.ea();
                    })), n.label = 5;

                  case 5:
                    return [ 2 /*return*/ ];
                }
            }));
        }));
    }, t.prototype.ta = function(t) {
        var e = this, n = this.Gc.then((function() {
            return e.Hc = !0, t().catch((function(t) {
                e.Wc = t, e.Hc = !1;
                var n = 
                /**
 * Chrome includes Error.message in Error.stack. Other browsers do not.
 * This returns expected output of message + stack when available.
 * @param error - Error or FirestoreError
 */
                function(t) {
                    var e = t.message || "";
                    return t.stack && (e = t.stack.includes(t.message) ? t.stack : t.message + "\n" + t.stack), 
                    e;
                }(t);
                // Re-throw the error so that this.tail becomes a rejected Promise and
                // all further attempts to chain (via .then) will just short-circuit
                // and return the rejected Promise.
                                throw L("INTERNAL UNHANDLED ERROR: ", n), t;
            })).then((function(t) {
                return e.Hc = !1, t;
            }));
        }));
        return this.Gc = n, n;
    }, t.prototype.enqueueAfterDelay = function(t, e, n) {
        var r = this;
        this.Zc(), 
        // Fast-forward delays for timerIds that have been overriden.
        this.Yc.indexOf(t) > -1 && (e = 0);
        var i = ms.createAndSchedule(this, t, e, n, (function(t) {
            return r.na(t);
        }));
        return this.zc.push(i), i;
    }, t.prototype.Zc = function() {
        this.Wc && U();
    }, t.prototype.verifyOperationInProgress = function() {}, 
    /**
     * Waits until all currently queued tasks are finished executing. Delayed
     * operations are not run.
     */
    t.prototype.sa = function() {
        return e(this, void 0, void 0, (function() {
            var t;
            return n(this, (function(e) {
                switch (e.label) {
                  case 0:
                    return [ 4 /*yield*/ , t = this.Gc ];

                  case 1:
                    e.sent(), e.label = 2;

                  case 2:
                    if (t !== this.Gc) return [ 3 /*break*/ , 0 ];
                    e.label = 3;

                  case 3:
                    return [ 2 /*return*/ ];
                }
            }));
        }));
    }, 
    /**
     * For Tests: Determine if a delayed operation with a particular TimerId
     * exists.
     */
    t.prototype.ia = function(t) {
        for (var e = 0, n = this.zc; e < n.length; e++) {
            if (n[e].timerId === t) return !0;
        }
        return !1;
    }, 
    /**
     * For Tests: Runs some or all delayed operations early.
     *
     * @param lastTimerId - Delayed operations up to and including this TimerId
     * will be drained. Pass TimerId.All to run all delayed operations.
     * @returns a Promise that resolves once all operations have been run.
     */
    t.prototype.ra = function(t) {
        var e = this;
        // Note that draining may generate more delayed ops, so we do that first.
                return this.sa().then((function() {
            // Run ops in the same order they'd run if they ran naturally.
            e.zc.sort((function(t, e) {
                return t.targetTimeMs - e.targetTimeMs;
            }));
            for (var n = 0, r = e.zc; n < r.length; n++) {
                var i = r[n];
                if (i.skipDelay(), "all" /* TimerId.All */ !== t && i.timerId === t) break;
            }
            return e.sa();
        }));
    }, 
    /**
     * For Tests: Skip all subsequent delays for a timer id.
     */
    t.prototype.oa = function(t) {
        this.Yc.push(t);
    }, 
    /** Called once a DelayedOperation is run or canceled. */ t.prototype.na = function(t) {
        // NOTE: indexOf / slice are O(n), but delayedOperations is expected to be small.
        var e = this.zc.indexOf(t);
        this.zc.splice(e, 1);
    }, t;
}();

function sl(t) {
    /**
 * Returns true if obj is an object and contains at least one of the specified
 * methods.
 */
    return function(t, e) {
        if ("object" != typeof t || null === t) return !1;
        for (var n = t, r = 0, i = [ "next", "error", "complete" ]; r < i.length; r++) {
            var o = i[r];
            if (o in n && "function" == typeof n[o]) return !0;
        }
        return !1;
    }(t);
}

var cl = /** @class */ function() {
    function t() {
        this._progressObserver = {}, this._taskCompletionResolver = new W, this._lastProgress = {
            taskState: "Running",
            totalBytes: 0,
            totalDocuments: 0,
            bytesLoaded: 0,
            documentsLoaded: 0
        }
        /**
     * Registers functions to listen to bundle loading progress events.
     * @param next - Called when there is a progress update from bundle loading. Typically `next` calls occur
     *   each time a Firestore document is loaded from the bundle.
     * @param error - Called when an error occurs during bundle loading. The task aborts after reporting the
     *   error, and there should be no more updates after this.
     * @param complete - Called when the loading task is complete.
     */;
    }
    return t.prototype.onProgress = function(t, e, n) {
        this._progressObserver = {
            next: t,
            error: e,
            complete: n
        };
    }, 
    /**
     * Implements the `Promise<LoadBundleTaskProgress>.catch` interface.
     *
     * @param onRejected - Called when an error occurs during bundle loading.
     */
    t.prototype.catch = function(t) {
        return this._taskCompletionResolver.promise.catch(t);
    }, 
    /**
     * Implements the `Promise<LoadBundleTaskProgress>.then` interface.
     *
     * @param onFulfilled - Called on the completion of the loading task with a final `LoadBundleTaskProgress` update.
     *   The update will always have its `taskState` set to `"Success"`.
     * @param onRejected - Called when an error occurs during bundle loading.
     */
    t.prototype.then = function(t, e) {
        return this._taskCompletionResolver.promise.then(t, e);
    }, 
    /**
     * Notifies all observers that bundle loading has completed, with a provided
     * `LoadBundleTaskProgress` object.
     *
     * @private
     */
    t.prototype._completeWith = function(t) {
        this._updateProgress(t), this._progressObserver.complete && this._progressObserver.complete(), 
        this._taskCompletionResolver.resolve(t);
    }, 
    /**
     * Notifies all observers that bundle loading has failed, with a provided
     * `Error` as the reason.
     *
     * @private
     */
    t.prototype._failWith = function(t) {
        this._lastProgress.taskState = "Error", this._progressObserver.next && this._progressObserver.next(this._lastProgress), 
        this._progressObserver.error && this._progressObserver.error(t), this._taskCompletionResolver.reject(t);
    }, 
    /**
     * Notifies a progress update of loading a bundle.
     * @param progress - The new progress.
     *
     * @private
     */
    t.prototype._updateProgress = function(t) {
        this._lastProgress = t, this._progressObserver.next && this._progressObserver.next(t);
    }, t;
}(), ll = -1, hl = /** @class */ function(e) {
    /** @hideconstructor */
    function n(t, n, r, i) {
        var o = this;
        /**
             * Whether it's a {@link Firestore} or Firestore Lite instance.
             */
        return (o = e.call(this, t, n, r, i) || this).type = "firestore", o._queue = new al, 
        o._persistenceKey = (null == i ? void 0 : i.name) || "[DEFAULT]", o;
    }
    return t(n, e), n.prototype._terminate = function() {
        return this._firestoreClient || 
        // The client must be initialized to ensure that all subsequent API
        // usage throws an exception.
        vl(this), this._firestoreClient.terminate();
    }, n;
}(Jc);

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
 */
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
 */
function fl(t, e, n) {
    n || (n = "(default)");
    var r = _getProvider(t, "firestore");
    if (r.isInitialized(n)) {
        var i = r.getImmediate({
            identifier: n
        }), o = r.getOptions(n);
        if (g(o, e)) return i;
        throw new Q(K.FAILED_PRECONDITION, "initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.");
    }
    if (void 0 !== e.cacheSizeBytes && void 0 !== e.localCache) throw new Q(K.INVALID_ARGUMENT, "cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");
    if (void 0 !== e.cacheSizeBytes && -1 !== e.cacheSizeBytes && e.cacheSizeBytes < 1048576) throw new Q(K.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
    return r.initialize({
        options: e,
        instanceIdentifier: n
    });
}

function dl(t, e) {
    var n = "object" == typeof t ? t : a(), i = "string" == typeof t ? t : e || "(default)", o = _getProvider(n, "firestore").getImmediate({
        identifier: i
    });
    if (!o._initialized) {
        var u = w("firestore");
        u && Zc.apply(void 0, r([ o ], u, !1));
    }
    return o;
}

/**
 * @internal
 */ function pl(t) {
    return t._firestoreClient || vl(t), t._firestoreClient.verifyNotTerminated(), t._firestoreClient;
}

function vl(t) {
    var e, n, r, i = t._freezeSettings(), o = function(t, e, n, r) {
        return new Be(t, e, n, r.host, r.ssl, r.experimentalForceLongPolling, r.experimentalAutoDetectLongPolling, Uc(r.experimentalLongPollingOptions), r.useFetchStreams);
    }(t._databaseId, (null === (e = t._app) || void 0 === e ? void 0 : e.options.appId) || "", t._persistenceKey, i);
    t._firestoreClient = new Cc(t._authCredentials, t._appCheckCredentials, t._queue, o), 
    (null === (n = i.cache) || void 0 === n ? void 0 : n._offlineComponentProvider) && (null === (r = i.cache) || void 0 === r ? void 0 : r._onlineComponentProvider) && (t._firestoreClient._uninitializedComponentsProvider = {
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
 */ function ml(t, e) {
    Dl(t = Hc(t, hl));
    var n = pl(t);
    if (n._uninitializedComponentsProvider) throw new Q(K.FAILED_PRECONDITION, "SDK cache is already specified.");
    q("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");
    var r = t._freezeSettings(), i = new Ic;
    return gl(n, i, new wc(i, r.cacheSizeBytes, null == e ? void 0 : e.forceOwnership));
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
 */ function yl(t) {
    Dl(t = Hc(t, hl));
    var e = pl(t);
    if (e._uninitializedComponentsProvider) throw new Q(K.FAILED_PRECONDITION, "SDK cache is already specified.");
    q("enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");
    var n = t._freezeSettings(), r = new Ic;
    return gl(e, r, new bc(r, n.cacheSizeBytes));
}

/**
 * Registers both the `OfflineComponentProvider` and `OnlineComponentProvider`.
 * If the operation fails with a recoverable error (see
 * `canRecoverFromIndexedDbError()` below), the returned Promise is rejected
 * but the client remains usable.
 */ function gl(t, r, i) {
    var o = this, u = new W;
    return t.asyncQueue.enqueue((function() {
        return e(o, void 0, void 0, (function() {
            var e, o;
            return n(this, (function(n) {
                switch (n.label) {
                  case 0:
                    return n.trys.push([ 0, 3, , 4 ]), [ 4 /*yield*/ , xc(t, i) ];

                  case 1:
                    return n.sent(), [ 4 /*yield*/ , Nc(t, r) ];

                  case 2:
                    return n.sent(), u.resolve(), [ 3 /*break*/ , 4 ];

                  case 3:
                    if (e = n.sent(), !Ac(o = e)) throw o;
                    return q("Error enabling indexeddb cache. Falling back to memory cache: " + o), 
                    u.reject(o), [ 3 /*break*/ , 4 ];

                  case 4:
                    return [ 2 /*return*/ ];
                }
            }));
        }));
    })).then((function() {
        return u.promise;
    }));
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
 */ function wl(t) {
    var r = this;
    if (t._initialized && !t._terminated) throw new Q(K.FAILED_PRECONDITION, "Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");
    var i = new W;
    return t._queue.enqueueAndForgetEvenWhileRestricted((function() {
        return e(r, void 0, void 0, (function() {
            var r;
            return n(this, (function(o) {
                switch (o.label) {
                  case 0:
                    return o.trys.push([ 0, 2, , 3 ]), [ 4 /*yield*/ , function(t) {
                        return e(this, void 0, void 0, (function() {
                            var e;
                            return n(this, (function(n) {
                                switch (n.label) {
                                  case 0:
                                    return kt.D() ? (e = t + "main", [ 4 /*yield*/ , kt.delete(e) ]) : [ 2 /*return*/ , Promise.resolve() ];

                                  case 1:
                                    return n.sent(), [ 2 /*return*/ ];
                                }
                            }));
                        }));
                    }(Ju(t._databaseId, t._persistenceKey)) ];

                  case 1:
                    return o.sent(), i.resolve(), [ 3 /*break*/ , 3 ];

                  case 2:
                    return r = o.sent(), i.reject(r), [ 3 /*break*/ , 3 ];

                  case 3:
                    return [ 2 /*return*/ ];
                }
            }));
        }));
    })), i.promise
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
 */;
}

function bl(t) {
    return function(t) {
        var r = this, i = new W;
        return t.asyncQueue.enqueueAndForget((function() {
            return e(r, void 0, void 0, (function() {
                var e;
                return n(this, (function(n) {
                    switch (n.label) {
                      case 0:
                        return e = Hs, [ 4 /*yield*/ , Vc(t) ];

                      case 1:
                        return [ 2 /*return*/ , e.apply(void 0, [ n.sent(), i ]) ];
                    }
                }));
            }));
        })), i.promise;
    }(pl(t = Hc(t, hl)));
}

/**
 * Re-enables use of the network for this {@link Firestore} instance after a prior
 * call to {@link disableNetwork}.
 *
 * @returns A `Promise` that is resolved once the network has been enabled.
 */ function Il(t) {
    return function(t) {
        var r = this;
        return t.asyncQueue.enqueue((function() {
            return e(r, void 0, void 0, (function() {
                var e, r;
                return n(this, (function(n) {
                    switch (n.label) {
                      case 0:
                        return [ 4 /*yield*/ , Fc(t) ];

                      case 1:
                        return e = n.sent(), [ 4 /*yield*/ , Rc(t) ];

                      case 2:
                        return r = n.sent(), [ 2 /*return*/ , (e.setNetworkEnabled(!0), function(t) {
                            var e = j(t);
                            return e.vu.delete(0 /* OfflineCause.UserDisabled */), ja(e);
                        }(r)) ];
                    }
                }));
            }));
        }));
    }
    /** Disables the network connection. Pending operations will not complete. */ (pl(t = Hc(t, hl)));
}

/**
 * Disables network usage for this instance. It can be re-enabled via {@link
 * enableNetwork}. While the network is disabled, any snapshot listeners,
 * `getDoc()` or `getDocs()` calls will return results from cache, and any write
 * operations will be queued until the network is restored.
 *
 * @returns A `Promise` that is resolved once the network has been disabled.
 */ function El(t) {
    return function(t) {
        var r = this;
        return t.asyncQueue.enqueue((function() {
            return e(r, void 0, void 0, (function() {
                var r, i;
                return n(this, (function(o) {
                    switch (o.label) {
                      case 0:
                        return [ 4 /*yield*/ , Fc(t) ];

                      case 1:
                        return r = o.sent(), [ 4 /*yield*/ , Rc(t) ];

                      case 2:
                        return i = o.sent(), [ 2 /*return*/ , (r.setNetworkEnabled(!1), function(t) {
                            return e(this, void 0, void 0, (function() {
                                var e;
                                return n(this, (function(n) {
                                    switch (n.label) {
                                      case 0:
                                        return (e = j(t)).vu.add(0 /* OfflineCause.UserDisabled */), [ 4 /*yield*/ , Ka(e) ];

                                      case 1:
                                        return n.sent(), 
                                        // Set the OnlineState to Offline so get()s return from cache, etc.
                                        e.bu.set("Offline" /* OnlineState.Offline */), [ 2 /*return*/ ];
                                    }
                                }));
                            }));
                        }(i)) ];
                    }
                }));
            }));
        }));
    }
    /**
 * Returns a Promise that resolves when all writes that were pending at the time
 * this method was called received server acknowledgement. An acknowledgement
 * can be either acceptance or rejection.
 */ (pl(t = Hc(t, hl)));
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
 */ function Tl(t) {
    return s(t.app, "firestore", t._databaseId.database), t._delete()
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
 */;
}

function Sl(t, r) {
    var i = pl(t = Hc(t, hl)), o = new cl;
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
 */
    return function(t, r, i, o) {
        var u = this, a = function(t, e) {
            return function(t, e) {
                return new Sc(t, e);
            }(function(t, e) {
                if (t instanceof Uint8Array) return Ec(t, e);
                if (t instanceof ArrayBuffer) return Ec(new Uint8Array(t), e);
                if (t instanceof ReadableStream) return t.getReader();
                throw new Error("Source of `toByteStreamReader` has to be a ArrayBuffer or ReadableStream");
            }("string" == typeof t ? di().encode(t) : t), e);
        }(i, Va(r));
        t.asyncQueue.enqueueAndForget((function() {
            return e(u, void 0, void 0, (function() {
                var e;
                return n(this, (function(n) {
                    switch (n.label) {
                      case 0:
                        return e = mc, [ 4 /*yield*/ , Vc(t) ];

                      case 1:
                        return e.apply(void 0, [ n.sent(), a, o ]), [ 2 /*return*/ ];
                    }
                }));
            }));
        }));
    }(i, t._databaseId, r, o), o
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
 */;
}

function _l(t, r) {
    return function(t, r) {
        var i = this;
        return t.asyncQueue.enqueue((function() {
            return e(i, void 0, void 0, (function() {
                var e;
                return n(this, (function(n) {
                    switch (n.label) {
                      case 0:
                        return e = function(t, e) {
                            var n = j(t);
                            return n.persistence.runTransaction("Get named query", "readonly", (function(t) {
                                return n.qs.getNamedQuery(t, e);
                            }));
                        }, [ 4 /*yield*/ , Pc(t) ];

                      case 1:
                        return [ 2 /*return*/ , e.apply(void 0, [ n.sent(), r ]) ];
                    }
                }));
            }));
        }));
    }(pl(t = Hc(t, hl)), r).then((function(e) {
        return e ? new tl(t, null, e.query) : null;
    }));
}

function Dl(t) {
    if (t._initialized || t._terminated) throw new Q(K.FAILED_PRECONDITION, "Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");
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
var Cl = 
/**
     * Create a new AggregateField<T>
     * @param _aggregateType Specifies the type of aggregation operation to perform.
     * @param _internalFieldPath Optionally specifies the field that is aggregated.
     * @internal
     */
function(
// TODO (sum/avg) make aggregateType public when the feature is supported
t, e) {
    void 0 === t && (t = "count"), this._aggregateType = t, this._internalFieldPath = e, 
    /** A type string to uniquely identify instances of this class. */
    this.type = "AggregateField";
}, xl = /** @class */ function() {
    /** @hideconstructor */
    function t(t, e, n) {
        this._userDataWriter = e, this._data = n, 
        /** A type string to uniquely identify instances of this class. */
        this.type = "AggregateQuerySnapshot", this.query = t
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
     */;
    }
    return t.prototype.data = function() {
        return this._userDataWriter.convertObjectMap(this._data);
    }, t;
}(), Nl = /** @class */ function() {
    /** @hideconstructor */
    function t(t) {
        this._byteString = t;
    }
    /**
     * Creates a new `Bytes` object from the given Base64 string, converting it to
     * bytes.
     *
     * @param base64 - The Base64 string used to create the `Bytes` object.
     */    return t.fromBase64String = function(e) {
        try {
            return new t(Oe.fromBase64String(e));
        } catch (e) {
            throw new Q(K.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + e);
        }
    }, 
    /**
     * Creates a new `Bytes` object from the given Uint8Array.
     *
     * @param array - The Uint8Array used to create the `Bytes` object.
     */
    t.fromUint8Array = function(e) {
        return new t(Oe.fromUint8Array(e));
    }, 
    /**
     * Returns the underlying bytes as a Base64-encoded string.
     *
     * @returns The Base64-encoded string created from the `Bytes` object.
     */
    t.prototype.toBase64 = function() {
        return this._byteString.toBase64();
    }, 
    /**
     * Returns the underlying bytes in a new `Uint8Array`.
     *
     * @returns The Uint8Array created from the `Bytes` object.
     */
    t.prototype.toUint8Array = function() {
        return this._byteString.toUint8Array();
    }, 
    /**
     * Returns a string representation of the `Bytes` object.
     *
     * @returns A string representation of the `Bytes` object.
     */
    t.prototype.toString = function() {
        return "Bytes(base64: " + this.toBase64() + ")";
    }, 
    /**
     * Returns true if this `Bytes` object is equal to the provided one.
     *
     * @param other - The `Bytes` object to compare against.
     * @returns true if this `Bytes` object is equal to the provided one.
     */
    t.prototype.isEqual = function(t) {
        return this._byteString.isEqual(t._byteString);
    }, t;
}(), Al = /** @class */ function() {
    /**
     * Creates a `FieldPath` from the provided field names. If more than one field
     * name is provided, the path will point to a nested field in a document.
     *
     * @param fieldNames - A list of field names.
     */
    function t() {
        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
        for (var n = 0; n < t.length; ++n) if (0 === t[n].length) throw new Q(K.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
        this._internalPath = new dt(t);
    }
    /**
     * Returns true if this `FieldPath` is equal to the provided one.
     *
     * @param other - The `FieldPath` to compare against.
     * @returns true if this `FieldPath` is equal to the provided one.
     */    return t.prototype.isEqual = function(t) {
        return this._internalPath.isEqual(t._internalPath);
    }, t;
}();

/**
 * The results of executing an aggregation query.
 */
/**
 * Returns a special sentinel `FieldPath` to refer to the ID of a document.
 * It can be used in queries to sort or filter by the document ID.
 */
function kl() {
    return new Al("__name__");
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
 */ var Ol = 
/**
     * @param _methodName - The public API endpoint that returns this class.
     * @hideconstructor
     */
function(t) {
    this._methodName = t;
}, Fl = /** @class */ function() {
    /**
     * Creates a new immutable `GeoPoint` object with the provided latitude and
     * longitude values.
     * @param latitude - The latitude as number between -90 and 90.
     * @param longitude - The longitude as number between -180 and 180.
     */
    function t(t, e) {
        if (!isFinite(t) || t < -90 || t > 90) throw new Q(K.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + t);
        if (!isFinite(e) || e < -180 || e > 180) throw new Q(K.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + e);
        this._lat = t, this._long = e;
    }
    return Object.defineProperty(t.prototype, "latitude", {
        /**
         * The latitude of this `GeoPoint` instance.
         */
        get: function() {
            return this._lat;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "longitude", {
        /**
         * The longitude of this `GeoPoint` instance.
         */
        get: function() {
            return this._long;
        },
        enumerable: !1,
        configurable: !0
    }), 
    /**
     * Returns true if this `GeoPoint` is equal to the provided one.
     *
     * @param other - The `GeoPoint` to compare against.
     * @returns true if this `GeoPoint` is equal to the provided one.
     */
    t.prototype.isEqual = function(t) {
        return this._lat === t._lat && this._long === t._long;
    }, 
    /** Returns a JSON-serializable representation of this GeoPoint. */ t.prototype.toJSON = function() {
        return {
            latitude: this._lat,
            longitude: this._long
        };
    }, 
    /**
     * Actually private to JS consumers of our API, so this function is prefixed
     * with an underscore.
     */
    t.prototype._compareTo = function(t) {
        return ot(this._lat, t._lat) || ot(this._long, t._long);
    }, t;
}(), Pl = /^__.*__$/, Rl = /** @class */ function() {
    function t(t, e, n) {
        this.data = t, this.fieldMask = e, this.fieldTransforms = n;
    }
    return t.prototype.toMutation = function(t, e) {
        return null !== this.fieldMask ? new Xr(t, this.data, this.fieldMask, e, this.fieldTransforms) : new Yr(t, this.data, e, this.fieldTransforms);
    }, t;
}(), Vl = /** @class */ function() {
    function t(t, 
    // The fieldMask does not include document transforms.
    e, n) {
        this.data = t, this.fieldMask = e, this.fieldTransforms = n;
    }
    return t.prototype.toMutation = function(t, e) {
        return new Xr(t, this.data, this.fieldMask, e, this.fieldTransforms);
    }, t;
}();

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
 */ function Ml(t) {
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
        throw U();
    }
}

/** A "context" object passed around while parsing user data. */ var Ll = /** @class */ function() {
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
    function t(t, e, n, r, i, o) {
        this.settings = t, this.databaseId = e, this.serializer = n, this.ignoreUndefinedProperties = r, 
        // Minor hack: If fieldTransforms is undefined, we assume this is an
        // external call and we need to validate the entire path.
        void 0 === i && this.ua(), this.fieldTransforms = i || [], this.fieldMask = o || [];
    }
    return Object.defineProperty(t.prototype, "path", {
        get: function() {
            return this.settings.path;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "ca", {
        get: function() {
            return this.settings.ca;
        },
        enumerable: !1,
        configurable: !0
    }), 
    /** Returns a new context with the specified settings overwritten. */ t.prototype.aa = function(e) {
        return new t(Object.assign(Object.assign({}, this.settings), e), this.databaseId, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
    }, t.prototype.ha = function(t) {
        var e, n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), r = this.aa({
            path: n,
            la: !1
        });
        return r.fa(t), r;
    }, t.prototype.da = function(t) {
        var e, n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), r = this.aa({
            path: n,
            la: !1
        });
        return r.ua(), r;
    }, t.prototype.wa = function(t) {
        // TODO(b/34871131): We don't support array paths right now; so make path
        // undefined.
        return this.aa({
            path: void 0,
            la: !0
        });
    }, t.prototype._a = function(t) {
        return ih(t, this.settings.methodName, this.settings.ma || !1, this.path, this.settings.ga);
    }, 
    /** Returns 'true' if 'fieldPath' was traversed when creating this context. */ t.prototype.contains = function(t) {
        return void 0 !== this.fieldMask.find((function(e) {
            return t.isPrefixOf(e);
        })) || void 0 !== this.fieldTransforms.find((function(e) {
            return t.isPrefixOf(e.field);
        }));
    }, t.prototype.ua = function() {
        // TODO(b/34871131): Remove null check once we have proper paths for fields
        // within arrays.
        if (this.path) for (var t = 0; t < this.path.length; t++) this.fa(this.path.get(t));
    }, t.prototype.fa = function(t) {
        if (0 === t.length) throw this._a("Document fields must not be empty");
        if (Ml(this.ca) && Pl.test(t)) throw this._a('Document fields cannot begin and end with "__"');
    }, t;
}(), ql = /** @class */ function() {
    function t(t, e, n) {
        this.databaseId = t, this.ignoreUndefinedProperties = e, this.serializer = n || Va(t)
        /** Creates a new top-level parse context. */;
    }
    return t.prototype.ya = function(t, e, n, r) {
        return void 0 === r && (r = !1), new Ll({
            ca: t,
            methodName: e,
            ga: n,
            path: dt.emptyPath(),
            la: !1,
            ma: r
        }, this.databaseId, this.serializer, this.ignoreUndefinedProperties);
    }, t;
}();

/**
 * Helper for parsing raw user input (provided via the API) into internal model
 * classes.
 */ function Bl(t) {
    var e = t._freezeSettings(), n = Va(t._databaseId);
    return new ql(t._databaseId, !!e.ignoreUndefinedProperties, n);
}

/** Parse document data from a set() call. */ function Ul(t, e, n, r, i, o) {
    void 0 === o && (o = {});
    var u = t.ya(o.merge || o.mergeFields ? 2 /* UserDataSource.MergeSet */ : 0 /* UserDataSource.Set */ , e, n, i);
    th("Data must be an object, but it was:", u, r);
    var a, s, c = Zl(r, u);
    if (o.merge) a = new Ne(u.fieldMask), s = u.fieldTransforms; else if (o.mergeFields) {
        for (var l = [], h = 0, f = o.mergeFields; h < f.length; h++) {
            var d = eh(e, f[h], n);
            if (!u.contains(d)) throw new Q(K.INVALID_ARGUMENT, "Field '".concat(d, "' is specified in your field mask but missing from your input data."));
            oh(l, d) || l.push(d);
        }
        a = new Ne(l), s = u.fieldTransforms.filter((function(t) {
            return a.covers(t.field);
        }));
    } else a = null, s = u.fieldTransforms;
    return new Rl(new hn(c), a, s);
}

var zl = /** @class */ function(e) {
    function n() {
        return null !== e && e.apply(this, arguments) || this;
    }
    return t(n, e), n.prototype._toFieldTransform = function(t) {
        if (2 /* UserDataSource.MergeSet */ !== t.ca) throw 1 /* UserDataSource.Update */ === t.ca ? t._a("".concat(this._methodName, "() can only appear at the top level of your update data")) : t._a("".concat(this._methodName, "() cannot be used with set() unless you pass {merge:true}"));
        // No transform to add for a delete, but we need to add it to our
        // fieldMask so it gets deleted.
                return t.fieldMask.push(t.path), null;
    }, n.prototype.isEqual = function(t) {
        return t instanceof n;
    }, n;
}(Ol);

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
 */ function Gl(t, e, n) {
    return new Ll({
        ca: 3 /* UserDataSource.Argument */ ,
        ga: e.settings.ga,
        methodName: t._methodName,
        la: n
    }, e.databaseId, e.serializer, e.ignoreUndefinedProperties);
}

var jl = /** @class */ function(e) {
    function n() {
        return null !== e && e.apply(this, arguments) || this;
    }
    return t(n, e), n.prototype._toFieldTransform = function(t) {
        return new qr(t.path, new kr);
    }, n.prototype.isEqual = function(t) {
        return t instanceof n;
    }, n;
}(Ol), Kl = /** @class */ function(e) {
    function n(t, n) {
        var r = this;
        return (r = e.call(this, t) || this).pa = n, r;
    }
    return t(n, e), n.prototype._toFieldTransform = function(t) {
        var e = Gl(this, t, 
        /*array=*/ !0), n = this.pa.map((function(t) {
            return Jl(t, e);
        })), r = new Or(n);
        return new qr(t.path, r);
    }, n.prototype.isEqual = function(t) {
        // TODO(mrschmidt): Implement isEquals
        return this === t;
    }, n;
}(Ol), Ql = /** @class */ function(e) {
    function n(t, n) {
        var r = this;
        return (r = e.call(this, t) || this).pa = n, r;
    }
    return t(n, e), n.prototype._toFieldTransform = function(t) {
        var e = Gl(this, t, 
        /*array=*/ !0), n = this.pa.map((function(t) {
            return Jl(t, e);
        })), r = new Pr(n);
        return new qr(t.path, r);
    }, n.prototype.isEqual = function(t) {
        // TODO(mrschmidt): Implement isEquals
        return this === t;
    }, n;
}(Ol), Wl = /** @class */ function(e) {
    function n(t, n) {
        var r = this;
        return (r = e.call(this, t) || this).Ia = n, r;
    }
    return t(n, e), n.prototype._toFieldTransform = function(t) {
        var e = new Vr(t.serializer, Dr(t.serializer, this.Ia));
        return new qr(t.path, e);
    }, n.prototype.isEqual = function(t) {
        // TODO(mrschmidt): Implement isEquals
        return this === t;
    }, n;
}(Ol);

/** Parse update data from an update() call. */ function Hl(t, e, n, r) {
    var i = t.ya(1 /* UserDataSource.Update */ , e, n);
    th("Data must be an object, but it was:", i, r);
    var o = [], u = hn.empty();
    Ie(r, (function(t, r) {
        var a = rh(e, t, n);
        // For Compat types, we have to "extract" the underlying types before
        // performing validation.
                r = v(r);
        var s = i.da(a);
        if (r instanceof zl) 
        // Add it to the field mask, but don't add anything to updateData.
        o.push(a); else {
            var c = Jl(r, s);
            null != c && (o.push(a), u.set(a, c));
        }
    }));
    var a = new Ne(o);
    return new Vl(u, a, i.fieldTransforms);
}

/** Parse update data from a list of field/value arguments. */ function Yl(t, e, n, r, i, o) {
    var u = t.ya(1 /* UserDataSource.Update */ , e, n), a = [ eh(e, r, n) ], s = [ i ];
    if (o.length % 2 != 0) throw new Q(K.INVALID_ARGUMENT, "Function ".concat(e, "() needs to be called with an even number of arguments that alternate between field names and values."));
    for (var c = 0; c < o.length; c += 2) a.push(eh(e, o[c])), s.push(o[c + 1]);
    // We iterate in reverse order to pick the last value for a field if the
    // user specified the field multiple times.
    for (var l = [], h = hn.empty(), f = a.length - 1; f >= 0; --f) if (!oh(l, a[f])) {
        var d = a[f], p = s[f];
        // For Compat types, we have to "extract" the underlying types before
        // performing validation.
        p = v(p);
        var m = u.da(d);
        if (p instanceof zl) 
        // Add it to the field mask, but don't add anything to updateData.
        l.push(d); else {
            var y = Jl(p, m);
            null != y && (l.push(d), h.set(d, y));
        }
    }
    var g = new Ne(l);
    return new Vl(h, g, u.fieldTransforms);
}

/**
 * Parse a "query value" (e.g. value in a where filter or a value in a cursor
 * bound).
 *
 * @param allowArrays - Whether the query value is an array that may directly
 * contain additional arrays (e.g. the operand of an `in` query).
 */ function Xl(t, e, n, r) {
    return void 0 === r && (r = !1), Jl(n, t.ya(r ? 4 /* UserDataSource.ArrayArgument */ : 3 /* UserDataSource.Argument */ , e));
}

/**
 * Parses user data to Protobuf Values.
 *
 * @param input - Data to be parsed.
 * @param context - A context object representing the current path being parsed,
 * the source of the data being parsed, etc.
 * @returns The parsed value, or null if the value was a FieldValue sentinel
 * that should not be included in the resulting parsed data.
 */ function Jl(t, e) {
    if ($l(
    // Unwrap the API type from the Compat SDK. This will return the API type
    // from firestore-exp.
    t = v(t))) return th("Unsupported field value:", e, t), Zl(t, e);
    if (t instanceof Ol) 
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
        if (!Ml(e.ca)) throw e._a("".concat(t._methodName, "() can only be used with update() and set()"));
        if (!e.path) throw e._a("".concat(t._methodName, "() is not currently supported inside arrays"));
        var n = t._toFieldTransform(e);
        n && e.fieldTransforms.push(n);
    }(t, e), null;
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
            for (var n = [], r = 0, i = 0, o = t; i < o.length; i++) {
                var u = Jl(o[i], e.wa(r));
                null == u && (
                // Just include nulls in the array for fields being replaced with a
                // sentinel.
                u = {
                    nullValue: "NULL_VALUE"
                }), n.push(u), r++;
            }
            return {
                arrayValue: {
                    values: n
                }
            };
        }(t, e);
    }
    return function(t, e) {
        if (null === (t = v(t))) return {
            nullValue: "NULL_VALUE"
        };
        if ("number" == typeof t) return Dr(e.serializer, t);
        if ("boolean" == typeof t) return {
            booleanValue: t
        };
        if ("string" == typeof t) return {
            stringValue: t
        };
        if (t instanceof Date) {
            var n = st.fromDate(t);
            return {
                timestampValue: Fi(e.serializer, n)
            };
        }
        if (t instanceof st) {
            // Firestore backend truncates precision down to microseconds. To ensure
            // offline mode works the same with regards to truncation, perform the
            // truncation immediately without waiting for the backend to do that.
            var r = new st(t.seconds, 1e3 * Math.floor(t.nanoseconds / 1e3));
            return {
                timestampValue: Fi(e.serializer, r)
            };
        }
        if (t instanceof Fl) return {
            geoPointValue: {
                latitude: t.latitude,
                longitude: t.longitude
            }
        };
        if (t instanceof Nl) return {
            bytesValue: Pi(e.serializer, t._byteString)
        };
        if (t instanceof $c) {
            var i = e.databaseId, o = t.firestore._databaseId;
            if (!o.isEqual(i)) throw e._a("Document reference is for database ".concat(o.projectId, "/").concat(o.database, " but should be for database ").concat(i.projectId, "/").concat(i.database));
            return {
                referenceValue: Mi(t.firestore._databaseId || e.databaseId, t._key.path)
            };
        }
        throw e._a("Unsupported field value: ".concat(Wc(t)));
    }(t, e);
}

function Zl(t, e) {
    var n = {};
    return Ee(t) ? 
    // If we encounter an empty object, we explicitly add it to the update
    // mask to ensure that the server creates a map entry.
    e.path && e.path.length > 0 && e.fieldMask.push(e.path) : Ie(t, (function(t, r) {
        var i = Jl(r, e.ha(t));
        null != i && (n[t] = i);
    })), {
        mapValue: {
            fields: n
        }
    };
}

function $l(t) {
    return !("object" != typeof t || null === t || t instanceof Array || t instanceof Date || t instanceof st || t instanceof Fl || t instanceof Nl || t instanceof $c || t instanceof Ol);
}

function th(t, e, n) {
    if (!$l(n) || !function(t) {
        return "object" == typeof t && null !== t && (Object.getPrototypeOf(t) === Object.prototype || null === Object.getPrototypeOf(t));
    }(n)) {
        var r = Wc(n);
        throw "an object" === r ? e._a(t + " a custom object") : e._a(t + " " + r);
    }
}

/**
 * Helper that calls fromDotSeparatedString() but wraps any error thrown.
 */ function eh(t, e, n) {
    if (
    // If required, replace the FieldPath Compat class with with the firestore-exp
    // FieldPath.
    (e = v(e)) instanceof Al) return e._internalPath;
    if ("string" == typeof e) return rh(t, e);
    throw ih("Field path arguments must be of type string or ", t, 
    /* hasConverter= */ !1, 
    /* path= */ void 0, n);
}

/**
 * Matches any characters in a field path string that are reserved.
 */ var nh = new RegExp("[~\\*/\\[\\]]");

/**
 * Wraps fromDotSeparatedString with an error message about the method that
 * was thrown.
 * @param methodName - The publicly visible method name
 * @param path - The dot-separated string form of a field path which will be
 * split on dots.
 * @param targetDoc - The document against which the field path will be
 * evaluated.
 */ function rh(t, e, n) {
    if (e.search(nh) >= 0) throw ih("Invalid field path (".concat(e, "). Paths must not contain '~', '*', '/', '[', or ']'"), t, 
    /* hasConverter= */ !1, 
    /* path= */ void 0, n);
    try {
        return (new (Al.bind.apply(Al, r([ void 0 ], e.split("."), !1))))._internalPath;
    } catch (r) {
        throw ih("Invalid field path (".concat(e, "). Paths must not be empty, begin with '.', end with '.', or contain '..'"), t, 
        /* hasConverter= */ !1, 
        /* path= */ void 0, n);
    }
}

function ih(t, e, n, r, i) {
    var o = r && !r.isEmpty(), u = void 0 !== i, a = "Function ".concat(e, "() called with invalid data");
    n && (a += " (via `toFirestore()`)"), a += ". ";
    var s = "";
    return (o || u) && (s += " (found", o && (s += " in field ".concat(r)), u && (s += " in document ".concat(i)), 
    s += ")"), new Q(K.INVALID_ARGUMENT, a + t + s)
    /** Checks `haystack` if FieldPath `needle` is present. Runs in O(n). */;
}

function oh(t, e) {
    return t.some((function(t) {
        return t.isEqual(e);
    }));
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
 */ var uh = /** @class */ function() {
    // Note: This class is stripped down version of the DocumentSnapshot in
    // the legacy SDK. The changes are:
    // - No support for SnapshotMetadata.
    // - No support for SnapshotOptions.
    /** @hideconstructor protected */
    function t(t, e, n, r, i) {
        this._firestore = t, this._userDataWriter = e, this._key = n, this._document = r, 
        this._converter = i;
    }
    return Object.defineProperty(t.prototype, "id", {
        /** Property of the `DocumentSnapshot` that provides the document's ID. */ get: function() {
            return this._key.path.lastSegment();
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "ref", {
        /**
         * The `DocumentReference` for the document included in the `DocumentSnapshot`.
         */
        get: function() {
            return new $c(this._firestore, this._converter, this._key);
        },
        enumerable: !1,
        configurable: !0
    }), 
    /**
     * Signals whether or not the document at the snapshot's location exists.
     *
     * @returns true if the document exists.
     */
    t.prototype.exists = function() {
        return null !== this._document;
    }, 
    /**
     * Retrieves all fields in the document as an `Object`. Returns `undefined` if
     * the document doesn't exist.
     *
     * @returns An `Object` containing all fields in the document or `undefined`
     * if the document doesn't exist.
     */
    t.prototype.data = function() {
        if (this._document) {
            if (this._converter) {
                // We only want to use the converter and create a new DocumentSnapshot
                // if a converter has been provided.
                var t = new ah(this._firestore, this._userDataWriter, this._key, this._document, 
                /* converter= */ null);
                return this._converter.fromFirestore(t);
            }
            return this._userDataWriter.convertValue(this._document.data.value);
        }
    }, 
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
    t.prototype.get = function(t) {
        if (this._document) {
            var e = this._document.data.field(sh("DocumentSnapshot.get", t));
            if (null !== e) return this._userDataWriter.convertValue(e);
        }
    }, t;
}(), ah = /** @class */ function(e) {
    function n() {
        return null !== e && e.apply(this, arguments) || this;
    }
    /**
     * Retrieves all fields in the document as an `Object`.
     *
     * @override
     * @returns An `Object` containing all fields in the document.
     */    return t(n, e), n.prototype.data = function() {
        return e.prototype.data.call(this);
    }, n;
}(uh);

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
 */
/**
 * Helper that calls `fromDotSeparatedString()` but wraps any error thrown.
 */
function sh(t, e) {
    return "string" == typeof e ? rh(t, e) : e instanceof Al ? e._internalPath : e._delegate._internalPath;
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
 */ function ch(t) {
    if ("L" /* LimitType.Last */ === t.limitType && 0 === t.explicitOrderBy.length) throw new Q(K.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
}

/**
 * An `AppliableConstraint` is an abstraction of a constraint that can be applied
 * to a Firestore query.
 */ var lh = function() {}, hh = /** @class */ function(e) {
    function n() {
        return null !== e && e.apply(this, arguments) || this;
    }
    return t(n, e), n;
}(lh);

/**
 * A `QueryConstraint` is used to narrow the set of documents returned by a
 * Firestore query. `QueryConstraint`s are created by invoking {@link where},
 * {@link orderBy}, {@link (startAt:1)}, {@link (startAfter:1)}, {@link
 * (endBefore:1)}, {@link (endAt:1)}, {@link limit}, {@link limitToLast} and
 * can then be passed to {@link (query:1)} to create a new query instance that
 * also contains this `QueryConstraint`.
 */ function fh(t, e) {
    for (var n = [], r = 2; r < arguments.length; r++) n[r - 2] = arguments[r];
    var i = [];
    e instanceof lh && i.push(e), function(t) {
        var e = t.filter((function(t) {
            return t instanceof vh;
        })).length, n = t.filter((function(t) {
            return t instanceof dh;
        })).length;
        if (e > 1 || e > 0 && n > 0) throw new Q(K.INVALID_ARGUMENT, "InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.");
    }(i = i.concat(n));
    for (var o = 0, u = i; o < u.length; o++) {
        var a = u[o];
        t = a._apply(t);
    }
    return t;
}

/**
 * A `QueryFieldFilterConstraint` is used to narrow the set of documents returned by
 * a Firestore query by filtering on one or more document fields.
 * `QueryFieldFilterConstraint`s are created by invoking {@link where} and can then
 * be passed to {@link (query:1)} to create a new query instance that also contains
 * this `QueryFieldFilterConstraint`.
 */ var dh = /** @class */ function(e) {
    /**
     * @internal
     */
    function n(t, n, r) {
        var i = this;
        return (i = e.call(this) || this)._field = t, i._op = n, i._value = r, 
        /** The type of this query constraint */
        i.type = "where", i;
    }
    return t(n, e), n._create = function(t, e, r) {
        return new n(t, e, r);
    }, n.prototype._apply = function(t) {
        var e = this._parse(t);
        return Oh(t._query, e), new tl(t.firestore, t.converter, er(t._query, e));
    }, n.prototype._parse = function(t) {
        var e = Bl(t.firestore), n = function(t, e, n, r, i, o, u) {
            var a;
            if (i.isKeyField()) {
                if ("array-contains" /* Operator.ARRAY_CONTAINS */ === o || "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ === o) throw new Q(K.INVALID_ARGUMENT, "Invalid Query. You can't perform '".concat(o, "' queries on documentId()."));
                if ("in" /* Operator.IN */ === o || "not-in" /* Operator.NOT_IN */ === o) {
                    kh(u, o);
                    for (var s = [], c = 0, l = u; c < l.length; c++) {
                        var h = l[c];
                        s.push(Ah(r, t, h));
                    }
                    a = {
                        arrayValue: {
                            values: s
                        }
                    };
                } else a = Ah(r, t, u);
            } else "in" /* Operator.IN */ !== o && "not-in" /* Operator.NOT_IN */ !== o && "array-contains-any" /* Operator.ARRAY_CONTAINS_ANY */ !== o || kh(u, o), 
            a = Xl(n, "where", u, 
            /* allowArrays= */ "in" /* Operator.IN */ === o || "not-in" /* Operator.NOT_IN */ === o);
            return bn.create(i, o, a);
        }(t._query, 0, e, t.firestore._databaseId, this._field, this._op, this._value);
        return n;
    }, n;
}(hh);

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
 */ function ph(t, e, n) {
    var r = e, i = sh("where", t);
    return dh._create(i, r, n);
}

/**
 * A `QueryCompositeFilterConstraint` is used to narrow the set of documents
 * returned by a Firestore query by performing the logical OR or AND of multiple
 * {@link QueryFieldFilterConstraint}s or {@link QueryCompositeFilterConstraint}s.
 * `QueryCompositeFilterConstraint`s are created by invoking {@link or} or
 * {@link and} and can then be passed to {@link (query:1)} to create a new query
 * instance that also contains the `QueryCompositeFilterConstraint`.
 */ var vh = /** @class */ function(e) {
    /**
     * @internal
     */
    function n(
    /** The type of this query constraint */
    t, n) {
        var r = this;
        return (r = e.call(this) || this).type = t, r._queryConstraints = n, r;
    }
    return t(n, e), n._create = function(t, e) {
        return new n(t, e);
    }, n.prototype._parse = function(t) {
        var e = this._queryConstraints.map((function(e) {
            return e._parse(t);
        })).filter((function(t) {
            return t.getFilters().length > 0;
        }));
        return 1 === e.length ? e[0] : In.create(e, this._getOperator());
    }, n.prototype._apply = function(t) {
        var e = this._parse(t);
        return 0 === e.getFilters().length ? t : (function(t, e) {
            for (var n = t, r = 0, i = e.getFlattenedFilters(); r < i.length; r++) {
                var o = i[r];
                Oh(n, o), n = er(n, o);
            }
        }(t._query, e), new tl(t.firestore, t.converter, er(t._query, e)));
    }, n.prototype._getQueryConstraints = function() {
        return this._queryConstraints;
    }, n.prototype._getOperator = function() {
        return "and" === this.type ? "and" /* CompositeOperator.AND */ : "or" /* CompositeOperator.OR */;
    }, n;
}(lh);

/**
 * Creates a new {@link QueryCompositeFilterConstraint} that is a disjunction of
 * the given filter constraints. A disjunction filter includes a document if it
 * satisfies any of the given filters.
 *
 * @param queryConstraints - Optional. The list of
 * {@link QueryFilterConstraint}s to perform a disjunction for. These must be
 * created with calls to {@link where}, {@link or}, or {@link and}.
 * @returns The newly created {@link QueryCompositeFilterConstraint}.
 */ function mh() {
    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
    // Only support QueryFilterConstraints
        return t.forEach((function(t) {
        return Ph("or", t);
    })), vh._create("or" /* CompositeOperator.OR */ , t)
    /**
 * Creates a new {@link QueryCompositeFilterConstraint} that is a conjunction of
 * the given filter constraints. A conjunction filter includes a document if it
 * satisfies all of the given filters.
 *
 * @param queryConstraints - Optional. The list of
 * {@link QueryFilterConstraint}s to perform a conjunction for. These must be
 * created with calls to {@link where}, {@link or}, or {@link and}.
 * @returns The newly created {@link QueryCompositeFilterConstraint}.
 */;
}

function yh() {
    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
    // Only support QueryFilterConstraints
        return t.forEach((function(t) {
        return Ph("and", t);
    })), vh._create("and" /* CompositeOperator.AND */ , t)
    /**
 * A `QueryOrderByConstraint` is used to sort the set of documents returned by a
 * Firestore query. `QueryOrderByConstraint`s are created by invoking
 * {@link orderBy} and can then be passed to {@link (query:1)} to create a new query
 * instance that also contains this `QueryOrderByConstraint`.
 *
 * Note: Documents that do not contain the orderBy field will not be present in
 * the query result.
 */;
}

var gh = /** @class */ function(e) {
    /**
     * @internal
     */
    function n(t, n) {
        var r = this;
        return (r = e.call(this) || this)._field = t, r._direction = n, 
        /** The type of this query constraint */
        r.type = "orderBy", r;
    }
    return t(n, e), n._create = function(t, e) {
        return new n(t, e);
    }, n.prototype._apply = function(t) {
        var e = function(t, e, n) {
            if (null !== t.startAt) throw new Q(K.INVALID_ARGUMENT, "Invalid query. You must not call startAt() or startAfter() before calling orderBy().");
            if (null !== t.endAt) throw new Q(K.INVALID_ARGUMENT, "Invalid query. You must not call endAt() or endBefore() before calling orderBy().");
            var r = new yn(e, n);
            return function(t, e) {
                if (null === Xn(t)) {
                    // This is the first order by. It must match any inequality.
                    var n = Jn(t);
                    null !== n && Fh(t, n, e.field);
                }
            }(t, r), r;
        }(t._query, this._field, this._direction);
        return new tl(t.firestore, t.converter, function(t, e) {
            // TODO(dimond): validate that orderBy does not list the same key twice.
            var n = t.explicitOrderBy.concat([ e ]);
            return new Qn(t.path, t.collectionGroup, n, t.filters.slice(), t.limit, t.limitType, t.startAt, t.endAt);
        }(t._query, e));
    }, n;
}(hh);

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
 */ function wh(t, e) {
    void 0 === e && (e = "asc");
    var n = e, r = sh("orderBy", t);
    return gh._create(r, n);
}

/**
 * A `QueryLimitConstraint` is used to limit the number of documents returned by
 * a Firestore query.
 * `QueryLimitConstraint`s are created by invoking {@link limit} or
 * {@link limitToLast} and can then be passed to {@link (query:1)} to create a new
 * query instance that also contains this `QueryLimitConstraint`.
 */ var bh = /** @class */ function(e) {
    /**
     * @internal
     */
    function n(
    /** The type of this query constraint */
    t, n, r) {
        var i = this;
        return (i = e.call(this) || this).type = t, i._limit = n, i._limitType = r, i;
    }
    return t(n, e), n._create = function(t, e, r) {
        return new n(t, e, r);
    }, n.prototype._apply = function(t) {
        return new tl(t.firestore, t.converter, nr(t._query, this._limit, this._limitType));
    }, n;
}(hh);

/**
 * Creates a {@link QueryLimitConstraint} that only returns the first matching
 * documents.
 *
 * @param limit - The maximum number of items to return.
 * @returns The created {@link QueryLimitConstraint}.
 */ function Ih(t) {
    return Yc("limit", t), bh._create("limit", t, "F" /* LimitType.First */)
    /**
 * Creates a {@link QueryLimitConstraint} that only returns the last matching
 * documents.
 *
 * You must specify at least one `orderBy` clause for `limitToLast` queries,
 * otherwise an exception will be thrown during execution.
 *
 * @param limit - The maximum number of items to return.
 * @returns The created {@link QueryLimitConstraint}.
 */;
}

function Eh(t) {
    return Yc("limitToLast", t), bh._create("limitToLast", t, "L" /* LimitType.Last */)
    /**
 * A `QueryStartAtConstraint` is used to exclude documents from the start of a
 * result set returned by a Firestore query.
 * `QueryStartAtConstraint`s are created by invoking {@link (startAt:1)} or
 * {@link (startAfter:1)} and can then be passed to {@link (query:1)} to create a
 * new query instance that also contains this `QueryStartAtConstraint`.
 */;
}

var Th = /** @class */ function(e) {
    /**
     * @internal
     */
    function n(
    /** The type of this query constraint */
    t, n, r) {
        var i = this;
        return (i = e.call(this) || this).type = t, i._docOrFields = n, i._inclusive = r, 
        i;
    }
    return t(n, e), n._create = function(t, e, r) {
        return new n(t, e, r);
    }, n.prototype._apply = function(t) {
        var e = Nh(t, this.type, this._docOrFields, this._inclusive);
        return new tl(t.firestore, t.converter, function(t, e) {
            return new Qn(t.path, t.collectionGroup, t.explicitOrderBy.slice(), t.filters.slice(), t.limit, t.limitType, e, t.endAt);
        }(t._query, e));
    }, n;
}(hh);

function Sh() {
    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
    return Th._create("startAt", t, 
    /*inclusive=*/ !0);
}

function _h() {
    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
    return Th._create("startAfter", t, 
    /*inclusive=*/ !1);
}

/**
 * A `QueryEndAtConstraint` is used to exclude documents from the end of a
 * result set returned by a Firestore query.
 * `QueryEndAtConstraint`s are created by invoking {@link (endAt:1)} or
 * {@link (endBefore:1)} and can then be passed to {@link (query:1)} to create a new
 * query instance that also contains this `QueryEndAtConstraint`.
 */ var Dh = /** @class */ function(e) {
    /**
     * @internal
     */
    function n(
    /** The type of this query constraint */
    t, n, r) {
        var i = this;
        return (i = e.call(this) || this).type = t, i._docOrFields = n, i._inclusive = r, 
        i;
    }
    return t(n, e), n._create = function(t, e, r) {
        return new n(t, e, r);
    }, n.prototype._apply = function(t) {
        var e = Nh(t, this.type, this._docOrFields, this._inclusive);
        return new tl(t.firestore, t.converter, function(t, e) {
            return new Qn(t.path, t.collectionGroup, t.explicitOrderBy.slice(), t.filters.slice(), t.limit, t.limitType, t.startAt, e);
        }(t._query, e));
    }, n;
}(hh);

function Ch() {
    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
    return Dh._create("endBefore", t, 
    /*inclusive=*/ !1);
}

function xh() {
    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
    return Dh._create("endAt", t, 
    /*inclusive=*/ !0);
}

/** Helper function to create a bound from a document or fields */ function Nh(t, e, n, r) {
    if (n[0] = v(n[0]), n[0] instanceof uh) return function(t, e, n, r, i) {
        if (!r) throw new Q(K.NOT_FOUND, "Can't use a DocumentSnapshot that doesn't exist for ".concat(n, "()."));
        // Because people expect to continue/end a query at the exact document
        // provided, we need to use the implicit sort order rather than the explicit
        // sort order, because it's guaranteed to contain the document key. That way
        // the position becomes unambiguous and the query continues/ends exactly at
        // the provided document. Without the key (by using the explicit sort
        // orders), multiple documents could match the position, yielding duplicate
        // results.
        for (var o = [], u = 0, a = $n(t); u < a.length; u++) {
            var s = a[u];
            if (s.field.isKeyField()) o.push(Ze(e, r.key)); else {
                var c = r.data.field(s.field);
                if (Me(c)) throw new Q(K.INVALID_ARGUMENT, 'Invalid query. You are trying to start or end a query using a document for which the field "' + s.field + '" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');
                if (null === c) {
                    var l = s.field.canonicalString();
                    throw new Q(K.INVALID_ARGUMENT, "Invalid query. You are trying to start or end a query using a document for which the field '".concat(l, "' (used as the orderBy) does not exist."));
                }
                o.push(c);
            }
        }
        return new pn(o, i);
    }(t._query, t.firestore._databaseId, e, n[0]._document, r);
    var i = Bl(t.firestore);
    return function(t, e, n, r, i, o) {
        // Use explicit order by's because it has to match the query the user made
        var u = t.explicitOrderBy;
        if (i.length > u.length) throw new Q(K.INVALID_ARGUMENT, "Too many arguments provided to ".concat(r, "(). The number of arguments must be less than or equal to the number of orderBy() clauses"));
        for (var a = [], s = 0; s < i.length; s++) {
            var c = i[s];
            if (u[s].field.isKeyField()) {
                if ("string" != typeof c) throw new Q(K.INVALID_ARGUMENT, "Invalid query. Expected a string for document ID in ".concat(r, "(), but got a ").concat(typeof c));
                if (!Zn(t) && -1 !== c.indexOf("/")) throw new Q(K.INVALID_ARGUMENT, "Invalid query. When querying a collection and ordering by documentId(), the value passed to ".concat(r, "() must be a plain document ID, but '").concat(c, "' contains a slash."));
                var l = t.path.child(ht.fromString(c));
                if (!pt.isDocumentKey(l)) throw new Q(K.INVALID_ARGUMENT, "Invalid query. When querying a collection group and ordering by documentId(), the value passed to ".concat(r, "() must result in a valid document path, but '").concat(l, "' is not because it contains an odd number of segments."));
                var h = new pt(l);
                a.push(Ze(e, h));
            } else {
                var f = Xl(n, r, c);
                a.push(f);
            }
        }
        return new pn(a, o);
    }(t._query, t.firestore._databaseId, i, e, n, r);
}

function Ah(t, e, n) {
    if ("string" == typeof (n = v(n))) {
        if ("" === n) throw new Q(K.INVALID_ARGUMENT, "Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");
        if (!Zn(e) && -1 !== n.indexOf("/")) throw new Q(K.INVALID_ARGUMENT, "Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '".concat(n, "' contains a '/' character."));
        var r = e.path.child(ht.fromString(n));
        if (!pt.isDocumentKey(r)) throw new Q(K.INVALID_ARGUMENT, "Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '".concat(r, "' is not because it has an odd number of segments (").concat(r.length, ")."));
        return Ze(t, new pt(r));
    }
    if (n instanceof $c) return Ze(t, n._key);
    throw new Q(K.INVALID_ARGUMENT, "Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ".concat(Wc(n), "."));
}

/**
 * Validates that the value passed into a disjunctive filter satisfies all
 * array requirements.
 */ function kh(t, e) {
    if (!Array.isArray(t) || 0 === t.length) throw new Q(K.INVALID_ARGUMENT, "Invalid Query. A non-empty array is required for '".concat(e.toString(), "' filters."));
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
 */ function Oh(t, e) {
    if (e.isInequality()) {
        var n = Jn(t), r = e.field;
        if (null !== n && !n.isEqual(r)) throw new Q(K.INVALID_ARGUMENT, "Invalid query. All where filters with an inequality (<, <=, !=, not-in, >, or >=) must be on the same field. But you have inequality filters on '".concat(n.toString(), "' and '").concat(r.toString(), "'"));
        var i = Xn(t);
        null !== i && Fh(t, r, i);
    }
    var o = function(t, e) {
        for (var n = 0, r = t; n < r.length; n++) for (var i = 0, o = r[n].getFlattenedFilters(); i < o.length; i++) {
            var u = o[i];
            if (e.indexOf(u.op) >= 0) return u.op;
        }
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
    if (null !== o) 
    // Special case when it's a duplicate op to give a slightly clearer error message.
    throw o === e.op ? new Q(K.INVALID_ARGUMENT, "Invalid query. You cannot use more than one '".concat(e.op.toString(), "' filter.")) : new Q(K.INVALID_ARGUMENT, "Invalid query. You cannot use '".concat(e.op.toString(), "' filters with '").concat(o.toString(), "' filters."));
}

function Fh(t, e, n) {
    if (!n.isEqual(e)) throw new Q(K.INVALID_ARGUMENT, "Invalid query. You have a where filter with an inequality (<, <=, !=, not-in, >, or >=) on field '".concat(e.toString(), "' and so you must also use '").concat(e.toString(), "' as your first argument to orderBy(), but your first orderBy() is on field '").concat(n.toString(), "' instead."));
}

function Ph(t, e) {
    if (!(e instanceof dh || e instanceof vh)) throw new Q(K.INVALID_ARGUMENT, "Function ".concat(t, "() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'."));
}

var Rh = /** @class */ function() {
    function t() {}
    return t.prototype.convertValue = function(t, e) {
        switch (void 0 === e && (e = "none"), je(t)) {
          case 0 /* TypeOrder.NullValue */ :
            return null;

          case 1 /* TypeOrder.BooleanValue */ :
            return t.booleanValue;

          case 2 /* TypeOrder.NumberValue */ :
            return Re(t.integerValue || t.doubleValue);

          case 3 /* TypeOrder.TimestampValue */ :
            return this.convertTimestamp(t.timestampValue);

          case 4 /* TypeOrder.ServerTimestampValue */ :
            return this.convertServerTimestamp(t, e);

          case 5 /* TypeOrder.StringValue */ :
            return t.stringValue;

          case 6 /* TypeOrder.BlobValue */ :
            return this.convertBytes(Ve(t.bytesValue));

          case 7 /* TypeOrder.RefValue */ :
            return this.convertReference(t.referenceValue);

          case 8 /* TypeOrder.GeoPointValue */ :
            return this.convertGeoPoint(t.geoPointValue);

          case 9 /* TypeOrder.ArrayValue */ :
            return this.convertArray(t.arrayValue, e);

          case 10 /* TypeOrder.ObjectValue */ :
            return this.convertObject(t.mapValue, e);

          default:
            throw U();
        }
    }, t.prototype.convertObject = function(t, e) {
        return this.convertObjectMap(t.fields, e);
    }, 
    /**
     * @internal
     */
    t.prototype.convertObjectMap = function(t, e) {
        var n = this;
        void 0 === e && (e = "none");
        var r = {};
        return Ie(t, (function(t, i) {
            r[t] = n.convertValue(i, e);
        })), r;
    }, t.prototype.convertGeoPoint = function(t) {
        return new Fl(Re(t.latitude), Re(t.longitude));
    }, t.prototype.convertArray = function(t, e) {
        var n = this;
        return (t.values || []).map((function(t) {
            return n.convertValue(t, e);
        }));
    }, t.prototype.convertServerTimestamp = function(t, e) {
        switch (e) {
          case "previous":
            var n = Le(t);
            return null == n ? null : this.convertValue(n, e);

          case "estimate":
            return this.convertTimestamp(qe(t));

          default:
            return null;
        }
    }, t.prototype.convertTimestamp = function(t) {
        var e = Pe(t);
        return new st(e.seconds, e.nanos);
    }, t.prototype.convertDocumentKey = function(t, e) {
        var n = ht.fromString(t);
        z(uo(n));
        var r = new Ue(n.get(1), n.get(3)), i = new pt(n.popFirst(5));
        return r.isEqual(e) || 
        // TODO(b/64130202): Somehow support foreign references.
        L("Document ".concat(i, " contains a document reference within a different database (").concat(r.projectId, "/").concat(r.database, ") which is not supported. It will be treated as a reference in the current database (").concat(e.projectId, "/").concat(e.database, ") instead.")), 
        i;
    }, t;
}();

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
 */ function Vh(t, e, n) {
    // Cast to `any` in order to satisfy the union type constraint on
    // toFirestore().
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return t ? n && (n.merge || n.mergeFields) ? t.toFirestore(e, n) : t.toFirestore(e) : e;
}

var Mh = /** @class */ function(e) {
    function n(t) {
        var n = this;
        return (n = e.call(this) || this).firestore = t, n;
    }
    return t(n, e), n.prototype.convertBytes = function(t) {
        return new Nl(t);
    }, n.prototype.convertReference = function(t) {
        var e = this.convertDocumentKey(t, this.firestore._databaseId);
        return new $c(this.firestore, /* converter= */ null, e);
    }, n;
}(Rh);

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
 */ function Lh(t) {
    return new Cl("sum", eh("sum", t));
}

/**
 * Create an AggregateField object that can be used to compute the average of
 * a specified field over a range of documents in the result set of a query.
 * @param field Specifies the field to average across the result set.
 * @internal TODO (sum/avg) remove when public
 */ function qh(t) {
    return new Cl("avg", eh("average", t));
}

/**
 * Create an AggregateField object that can be used to compute the count of
 * documents in the result set of a query.
 * @internal TODO (sum/avg) remove when public
 */ function Bh() {
    return new Cl("count");
}

/**
 * Compares two 'AggregateField` instances for equality.
 *
 * @param left Compare this AggregateField to the `right`.
 * @param right Compare this AggregateField to the `left`.
 * @internal TODO (sum/avg) remove when public
 */ function Uh(t, e) {
    var n, r;
    return t instanceof Cl && e instanceof Cl && t._aggregateType === e._aggregateType && (null === (n = t._internalFieldPath) || void 0 === n ? void 0 : n.canonicalString()) === (null === (r = e._internalFieldPath) || void 0 === r ? void 0 : r.canonicalString());
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
 */ function zh(t, e) {
    return ul(t.query, e.query) && g(t.data(), e.data());
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
 */ var Gh = /** @class */ function() {
    /** @hideconstructor */
    function t(t, e) {
        this.hasPendingWrites = t, this.fromCache = e
        /**
     * Returns true if this `SnapshotMetadata` is equal to the provided one.
     *
     * @param other - The `SnapshotMetadata` to compare against.
     * @returns true if this `SnapshotMetadata` is equal to the provided one.
     */;
    }
    return t.prototype.isEqual = function(t) {
        return this.hasPendingWrites === t.hasPendingWrites && this.fromCache === t.fromCache;
    }, t;
}(), jh = /** @class */ function(e) {
    /** @hideconstructor protected */
    function n(t, n, r, i, o, u) {
        var a = this;
        return (a = e.call(this, t, n, r, i, u) || this)._firestore = t, a._firestoreImpl = t, 
        a.metadata = o, a;
    }
    /**
     * Returns whether or not the data exists. True if the document exists.
     */    return t(n, e), n.prototype.exists = function() {
        return e.prototype.exists.call(this);
    }, 
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
     */
    n.prototype.data = function(t) {
        if (void 0 === t && (t = {}), this._document) {
            if (this._converter) {
                // We only want to use the converter and create a new DocumentSnapshot
                // if a converter has been provided.
                var e = new Kh(this._firestore, this._userDataWriter, this._key, this._document, this.metadata, 
                /* converter= */ null);
                return this._converter.fromFirestore(e, t);
            }
            return this._userDataWriter.convertValue(this._document.data.value, t.serverTimestamps);
        }
    }, 
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
    n.prototype.get = function(t, e) {
        if (void 0 === e && (e = {}), this._document) {
            var n = this._document.data.field(sh("DocumentSnapshot.get", t));
            if (null !== n) return this._userDataWriter.convertValue(n, e.serverTimestamps);
        }
    }, n;
}(uh), Kh = /** @class */ function(e) {
    function n() {
        return null !== e && e.apply(this, arguments) || this;
    }
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
     */    return t(n, e), n.prototype.data = function(t) {
        return void 0 === t && (t = {}), e.prototype.data.call(this, t);
    }, n;
}(jh), Qh = /** @class */ function() {
    /** @hideconstructor */
    function t(t, e, n, r) {
        this._firestore = t, this._userDataWriter = e, this._snapshot = r, this.metadata = new Gh(r.hasPendingWrites, r.fromCache), 
        this.query = n;
    }
    return Object.defineProperty(t.prototype, "docs", {
        /** An array of all the documents in the `QuerySnapshot`. */ get: function() {
            var t = [];
            return this.forEach((function(e) {
                return t.push(e);
            })), t;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "size", {
        /** The number of documents in the `QuerySnapshot`. */ get: function() {
            return this._snapshot.docs.size;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(t.prototype, "empty", {
        /** True if there are no documents in the `QuerySnapshot`. */ get: function() {
            return 0 === this.size;
        },
        enumerable: !1,
        configurable: !0
    }), 
    /**
     * Enumerates all of the documents in the `QuerySnapshot`.
     *
     * @param callback - A callback to be called with a `QueryDocumentSnapshot` for
     * each document in the snapshot.
     * @param thisArg - The `this` binding for the callback.
     */
    t.prototype.forEach = function(t, e) {
        var n = this;
        this._snapshot.docs.forEach((function(r) {
            t.call(e, new Kh(n._firestore, n._userDataWriter, r.key, r, new Gh(n._snapshot.mutatedKeys.has(r.key), n._snapshot.fromCache), n.query.converter));
        }));
    }, 
    /**
     * Returns an array of the documents changes since the last snapshot. If this
     * is the first snapshot, all documents will be in the list as 'added'
     * changes.
     *
     * @param options - `SnapshotListenOptions` that control whether metadata-only
     * changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger
     * snapshot events.
     */
    t.prototype.docChanges = function(t) {
        void 0 === t && (t = {});
        var e = !!t.includeMetadataChanges;
        if (e && this._snapshot.excludesMetadataChanges) throw new Q(K.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
        return this._cachedChanges && this._cachedChangesIncludeMetadataChanges === e || (this._cachedChanges = 
        /** Calculates the array of `DocumentChange`s for a given `ViewSnapshot`. */
        function(t, e) {
            if (t._snapshot.oldDocs.isEmpty()) {
                var n = 0;
                return t._snapshot.docChanges.map((function(e) {
                    var r = new Kh(t._firestore, t._userDataWriter, e.doc.key, e.doc, new Gh(t._snapshot.mutatedKeys.has(e.doc.key), t._snapshot.fromCache), t.query.converter);
                    return e.doc, {
                        type: "added",
                        doc: r,
                        oldIndex: -1,
                        newIndex: n++
                    };
                }));
            }
            // A `DocumentSet` that is updated incrementally as changes are applied to use
            // to lookup the index of a document.
            var r = t._snapshot.oldDocs;
            return t._snapshot.docChanges.filter((function(t) {
                return e || 3 /* ChangeType.Metadata */ !== t.type;
            })).map((function(e) {
                var n = new Kh(t._firestore, t._userDataWriter, e.doc.key, e.doc, new Gh(t._snapshot.mutatedKeys.has(e.doc.key), t._snapshot.fromCache), t.query.converter), i = -1, o = -1;
                return 0 /* ChangeType.Added */ !== e.type && (i = r.indexOf(e.doc.key), r = r.delete(e.doc.key)), 
                1 /* ChangeType.Removed */ !== e.type && (o = (r = r.add(e.doc)).indexOf(e.doc.key)), 
                {
                    type: Wh(e.type),
                    doc: n,
                    oldIndex: i,
                    newIndex: o
                };
            }));
        }(this, e), this._cachedChangesIncludeMetadataChanges = e), this._cachedChanges;
    }, t;
}();

/**
 * A `DocumentSnapshot` contains data read from a document in your Firestore
 * database. The data can be extracted with `.data()` or `.get(<field>)` to
 * get a specific field.
 *
 * For a `DocumentSnapshot` that points to a non-existing document, any data
 * access will return 'undefined'. You can use the `exists()` method to
 * explicitly verify a document's existence.
 */ function Wh(t) {
    switch (t) {
      case 0 /* ChangeType.Added */ :
        return "added";

      case 2 /* ChangeType.Modified */ :
      case 3 /* ChangeType.Metadata */ :
        return "modified";

      case 1 /* ChangeType.Removed */ :
        return "removed";

      default:
        return U();
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
 */ function Hh(t, e) {
    return t instanceof jh && e instanceof jh ? t._firestore === e._firestore && t._key.isEqual(e._key) && (null === t._document ? null === e._document : t._document.isEqual(e._document)) && t._converter === e._converter : t instanceof Qh && e instanceof Qh && t._firestore === e._firestore && ul(t.query, e.query) && t.metadata.isEqual(e.metadata) && t._snapshot.isEqual(e._snapshot);
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
 */ function Yh(t) {
    t = Hc(t, $c);
    var e = Hc(t.firestore, hl);
    return qc(pl(e), t._key).then((function(n) {
        return lf(e, t, n);
    }));
}

var Xh = /** @class */ function(e) {
    function n(t) {
        var n = this;
        return (n = e.call(this) || this).firestore = t, n;
    }
    return t(n, e), n.prototype.convertBytes = function(t) {
        return new Nl(t);
    }, n.prototype.convertReference = function(t) {
        var e = this.convertDocumentKey(t, this.firestore._databaseId);
        return new $c(this.firestore, /* converter= */ null, e);
    }, n;
}(Rh);

/**
 * Reads the document referred to by this `DocumentReference` from cache.
 * Returns an error if the document is not currently cached.
 *
 * @returns A `Promise` resolved with a `DocumentSnapshot` containing the
 * current document contents.
 */ function Jh(t) {
    t = Hc(t, $c);
    var r = Hc(t.firestore, hl), i = pl(r), o = new Xh(r);
    return function(t, r) {
        var i = this, o = new W;
        return t.asyncQueue.enqueueAndForget((function() {
            return e(i, void 0, void 0, (function() {
                var i;
                return n(this, (function(u) {
                    switch (u.label) {
                      case 0:
                        return i = function(t, r, i) {
                            return e(this, void 0, void 0, (function() {
                                var e, o, u;
                                return n(this, (function(n) {
                                    switch (n.label) {
                                      case 0:
                                        return n.trys.push([ 0, 2, , 3 ]), [ 4 /*yield*/ , function(t, e) {
                                            var n = j(t);
                                            return n.persistence.runTransaction("read document", "readonly", (function(t) {
                                                return n.localDocuments.getDocument(t, e);
                                            }));
                                        }(t, r) ];

                                      case 1:
                                        return (e = n.sent()).isFoundDocument() ? i.resolve(e) : e.isNoDocument() ? i.resolve(null) : i.reject(new Q(K.UNAVAILABLE, "Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)")), 
                                        [ 3 /*break*/ , 3 ];

                                      case 2:
                                        return o = n.sent(), u = ys(o, "Failed to get document '".concat(r, " from cache")), 
                                        i.reject(u), [ 3 /*break*/ , 3 ];

                                      case 3:
                                        return [ 2 /*return*/ ];
                                    }
                                }));
                            }));
                        }, [ 4 /*yield*/ , Pc(t) ];

                      case 1:
                        return [ 2 /*return*/ , i.apply(void 0, [ u.sent(), r, o ]) ];
                    }
                }));
            }));
        })), o.promise;
    }(i, t._key).then((function(e) {
        return new jh(r, o, t._key, e, new Gh(null !== e && e.hasLocalMutations, 
        /* fromCache= */ !0), t.converter);
    }));
}

/**
 * Reads the document referred to by this `DocumentReference` from the server.
 * Returns an error if the network is not available.
 *
 * @returns A `Promise` resolved with a `DocumentSnapshot` containing the
 * current document contents.
 */ function Zh(t) {
    t = Hc(t, $c);
    var e = Hc(t.firestore, hl);
    return qc(pl(e), t._key, {
        source: "server"
    }).then((function(n) {
        return lf(e, t, n);
    }));
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
 */ function $h(t) {
    t = Hc(t, tl);
    var e = Hc(t.firestore, hl), n = pl(e), r = new Xh(e);
    return ch(t._query), Bc(n, t._query).then((function(n) {
        return new Qh(e, r, t, n);
    }))
    /**
 * Executes the query and returns the results as a `QuerySnapshot` from cache.
 * Returns an empty result set if no documents matching the query are currently
 * cached.
 *
 * @returns A `Promise` that will be resolved with the results of the query.
 */;
}

function tf(t) {
    t = Hc(t, tl);
    var r = Hc(t.firestore, hl), i = pl(r), o = new Xh(r);
    return function(t, r) {
        var i = this, o = new W;
        return t.asyncQueue.enqueueAndForget((function() {
            return e(i, void 0, void 0, (function() {
                var i;
                return n(this, (function(u) {
                    switch (u.label) {
                      case 0:
                        return i = function(t, r, i) {
                            return e(this, void 0, void 0, (function() {
                                var e, o, u, a, s, c;
                                return n(this, (function(n) {
                                    switch (n.label) {
                                      case 0:
                                        return n.trys.push([ 0, 2, , 3 ]), [ 4 /*yield*/ , la(t, r, 
                                        /* usePreviousResults= */ !0) ];

                                      case 1:
                                        return e = n.sent(), o = new Rs(r, e.ir), u = o.sc(e.documents), a = o.applyChanges(u, 
                                        /* updateLimboDocuments= */ !1), i.resolve(a.snapshot), [ 3 /*break*/ , 3 ];

                                      case 2:
                                        return s = n.sent(), c = ys(s, "Failed to execute query '".concat(r, " against cache")), 
                                        i.reject(c), [ 3 /*break*/ , 3 ];

                                      case 3:
                                        return [ 2 /*return*/ ];
                                    }
                                }));
                            }));
                        }, [ 4 /*yield*/ , Pc(t) ];

                      case 1:
                        return [ 2 /*return*/ , i.apply(void 0, [ u.sent(), r, o ]) ];
                    }
                }));
            }));
        })), o.promise;
    }(i, t._query).then((function(e) {
        return new Qh(r, o, t, e);
    }));
}

/**
 * Executes the query and returns the results as a `QuerySnapshot` from the
 * server. Returns an error if the network is not available.
 *
 * @returns A `Promise` that will be resolved with the results of the query.
 */ function ef(t) {
    t = Hc(t, tl);
    var e = Hc(t.firestore, hl), n = pl(e), r = new Xh(e);
    return Bc(n, t._query, {
        source: "server"
    }).then((function(n) {
        return new Qh(e, r, t, n);
    }));
}

function nf(t, e, n) {
    t = Hc(t, $c);
    var r = Hc(t.firestore, hl), i = Vh(t.converter, e, n);
    return cf(r, [ Ul(Bl(r), "setDoc", t._key, i, null !== t.converter, n).toMutation(t._key, Ur.none()) ]);
}

function rf(t, e, n) {
    for (var r = [], i = 3; i < arguments.length; i++) r[i - 3] = arguments[i];
    t = Hc(t, $c);
    var o = Hc(t.firestore, hl), u = Bl(o);
    return cf(o, [ ("string" == typeof (
    // For Compat types, we have to "extract" the underlying types before
    // performing validation.
    e = v(e)) || e instanceof Al ? Yl(u, "updateDoc", t._key, e, n, r) : Hl(u, "updateDoc", t._key, e)).toMutation(t._key, Ur.exists(!0)) ]);
}

/**
 * Deletes the document referred to by the specified `DocumentReference`.
 *
 * @param reference - A reference to the document to delete.
 * @returns A Promise resolved once the document has been successfully
 * deleted from the backend (note that it won't resolve while you're offline).
 */ function of(t) {
    return cf(Hc(t.firestore, hl), [ new ni(t._key, Ur.none()) ]);
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
 */ function uf(t, e) {
    var n = Hc(t.firestore, hl), r = il(t), i = Vh(t.converter, e);
    return cf(n, [ Ul(Bl(t.firestore), "addDoc", r._key, i, null !== t.converter, {}).toMutation(r._key, Ur.exists(!1)) ]).then((function() {
        return r;
    }));
}

function af(t) {
    for (var r, i, o, u = [], a = 1; a < arguments.length; a++) u[a - 1] = arguments[a];
    t = v(t);
    var s = {
        includeMetadataChanges: !1
    }, c = 0;
    "object" != typeof u[c] || sl(u[c]) || (s = u[c], c++);
    var l, h, f, d = {
        includeMetadataChanges: s.includeMetadataChanges
    };
    if (sl(u[c])) {
        var p = u[c];
        u[c] = null === (r = p.next) || void 0 === r ? void 0 : r.bind(p), u[c + 1] = null === (i = p.error) || void 0 === i ? void 0 : i.bind(p), 
        u[c + 2] = null === (o = p.complete) || void 0 === o ? void 0 : o.bind(p);
    }
    if (t instanceof $c) h = Hc(t.firestore, hl), f = Hn(t._key.path), l = {
        next: function(e) {
            u[c] && u[c](lf(h, t, e));
        },
        error: u[c + 1],
        complete: u[c + 2]
    }; else {
        var m = Hc(t, tl);
        h = Hc(m.firestore, hl), f = m._query;
        var y = new Xh(h);
        l = {
            next: function(t) {
                u[c] && u[c](new Qh(h, y, m, t));
            },
            error: u[c + 1],
            complete: u[c + 2]
        }, ch(t._query);
    }
    return function(t, r, i, o) {
        var u = this, a = new Tc(o), s = new xs(r, a, i);
        return t.asyncQueue.enqueueAndForget((function() {
            return e(u, void 0, void 0, (function() {
                var e;
                return n(this, (function(n) {
                    switch (n.label) {
                      case 0:
                        return e = Ts, [ 4 /*yield*/ , Lc(t) ];

                      case 1:
                        return [ 2 /*return*/ , e.apply(void 0, [ n.sent(), s ]) ];
                    }
                }));
            }));
        })), function() {
            a.Dc(), t.asyncQueue.enqueueAndForget((function() {
                return e(u, void 0, void 0, (function() {
                    var e;
                    return n(this, (function(n) {
                        switch (n.label) {
                          case 0:
                            return e = Ss, [ 4 /*yield*/ , Lc(t) ];

                          case 1:
                            return [ 2 /*return*/ , e.apply(void 0, [ n.sent(), s ]) ];
                        }
                    }));
                }));
            }));
        };
    }(pl(h), f, d, l);
}

function sf(t, r) {
    return function(t, r) {
        var i = this, o = new Tc(r);
        return t.asyncQueue.enqueueAndForget((function() {
            return e(i, void 0, void 0, (function() {
                var e;
                return n(this, (function(n) {
                    switch (n.label) {
                      case 0:
                        return e = function(t, e) {
                            j(t).ku.add(e), 
                            // Immediately fire an initial event, indicating all existing listeners
                            // are in-sync.
                            e.next();
                        }, [ 4 /*yield*/ , Lc(t) ];

                      case 1:
                        return [ 2 /*return*/ , e.apply(void 0, [ n.sent(), o ]) ];
                    }
                }));
            }));
        })), function() {
            o.Dc(), t.asyncQueue.enqueueAndForget((function() {
                return e(i, void 0, void 0, (function() {
                    var e;
                    return n(this, (function(n) {
                        switch (n.label) {
                          case 0:
                            return e = function(t, e) {
                                j(t).ku.delete(e);
                            }, [ 4 /*yield*/ , Lc(t) ];

                          case 1:
                            return [ 2 /*return*/ , e.apply(void 0, [ n.sent(), o ]) ];
                        }
                    }));
                }));
            }));
        };
    }(pl(t = Hc(t, hl)), sl(r) ? r : {
        next: r
    });
}

/**
 * Locally writes `mutations` on the async queue.
 * @internal
 */ function cf(t, r) {
    return function(t, r) {
        var i = this, o = new W;
        return t.asyncQueue.enqueueAndForget((function() {
            return e(i, void 0, void 0, (function() {
                var e;
                return n(this, (function(n) {
                    switch (n.label) {
                      case 0:
                        return e = zs, [ 4 /*yield*/ , Vc(t) ];

                      case 1:
                        return [ 2 /*return*/ , e.apply(void 0, [ n.sent(), r, o ]) ];
                    }
                }));
            }));
        })), o.promise;
    }(pl(t), r);
}

/**
 * Converts a {@link ViewSnapshot} that contains the single document specified by `ref`
 * to a {@link DocumentSnapshot}.
 */ function lf(t, e, n) {
    var r = n.docs.get(e._key), i = new Xh(t);
    return new jh(t, i, e._key, r, new Gh(n.hasPendingWrites, n.fromCache), e.converter);
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
 */ function hf(t) {
    return ff(t, {
        count: Bh()
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
 */ function ff(t, r) {
    var i = Hc(t.firestore, hl), o = pl(i), u = function(t, e) {
        var n = [];
        for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && n.push(e(t[r], r));
        return n;
    }(r, (function(t, e) {
        return new ai(e, t._aggregateType, t._internalFieldPath);
    }));
    // Run the aggregation and convert the results
        return function(t, r, i) {
        var o = this, u = new W;
        return t.asyncQueue.enqueueAndForget((function() {
            return e(o, void 0, void 0, (function() {
                var o, a;
                return n(this, (function(s) {
                    switch (s.label) {
                      case 0:
                        return s.trys.push([ 0, 2, , 3 ]), [ 4 /*yield*/ , Mc(t) ];

                      case 1:
                        return o = s.sent(), u.resolve(
                        // TODO(firestorexp): Make sure there is only one Datastore instance per
                        // firestore-exp client.
                        function(t, r, i) {
                            return e(this, void 0, void 0, (function() {
                                var e, o, u, a, s, c, l, h;
                                return n(this, (function(n) {
                                    switch (n.label) {
                                      case 0:
                                        return o = j(t), u = function(t, e, n) {
                                            var r = Xi(t, e), i = {}, o = [], u = 0;
                                            return n.forEach((function(t) {
                                                // Map all client-side aliases to a unique short-form
                                                // alias. This avoids issues with client-side aliases that
                                                // exceed the 1500-byte string size limit.
                                                var e = "aggregate_" + u++;
                                                i[e] = t.alias, "count" === t.yt ? o.push({
                                                    alias: e,
                                                    count: {}
                                                }) : "avg" === t.yt ? o.push({
                                                    alias: e,
                                                    avg: {
                                                        field: no(t.fieldPath)
                                                    }
                                                }) : "sum" === t.yt && o.push({
                                                    alias: e,
                                                    sum: {
                                                        field: no(t.fieldPath)
                                                    }
                                                });
                                            })), {
                                                request: {
                                                    structuredAggregationQuery: {
                                                        aggregations: o,
                                                        structuredQuery: r.structuredQuery
                                                    },
                                                    parent: r.parent
                                                },
                                                du: i
                                            };
                                        }(o.serializer, tr(r), i), a = u.request, s = u.du, c = a.parent, o.connection.po || delete a.parent, 
                                        [ 4 /*yield*/ , o.vo("RunAggregationQuery", c, a, /*expectedResponseCount=*/ 1) ];

                                      case 1:
                                        return l = n.sent().filter((function(t) {
                                            return !!t.result;
                                        })), 
                                        // Omit RunAggregationQueryResponse that only contain readTimes.
                                        z(1 === l.length), h = null === (e = l[0].result) || void 0 === e ? void 0 : e.aggregateFields, 
                                        [ 2 /*return*/ , Object.keys(h).reduce((function(t, e) {
                                            return t[s[e]] = h[e], t;
                                        }), {}) ];
                                    }
                                }));
                            }));
                        }(o, r, i)), [ 3 /*break*/ , 3 ];

                      case 2:
                        return a = s.sent(), u.reject(a), [ 3 /*break*/ , 3 ];

                      case 3:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        })), u.promise;
    }(o, t._query, u).then((function(e) {
        /**
     * Converts the core aggregration result to an `AggregateQuerySnapshot`
     * that can be returned to the consumer.
     * @param query
     * @param aggregateResult Core aggregation result
     * @internal
     */
        return function(t, e, n) {
            var r = new Xh(t);
            return new xl(e, r, n);
        }(i, t, e);
    }));
}

var df = /** @class */ function() {
    function t(t) {
        this.kind = "memory", this._onlineComponentProvider = new Ic, (null == t ? void 0 : t.garbageCollector) ? this._offlineComponentProvider = t.garbageCollector._offlineComponentProvider : this._offlineComponentProvider = new yc;
    }
    return t.prototype.toJSON = function() {
        return {
            kind: this.kind
        };
    }, t;
}(), pf = /** @class */ function() {
    function t(t) {
        var e;
        this.kind = "persistent", (null == t ? void 0 : t.tabManager) ? (t.tabManager._initialize(t), 
        e = t.tabManager) : (e = Tf(void 0))._initialize(t), this._onlineComponentProvider = e._onlineComponentProvider, 
        this._offlineComponentProvider = e._offlineComponentProvider;
    }
    return t.prototype.toJSON = function() {
        return {
            kind: this.kind
        };
    }, t;
}(), vf = /** @class */ function() {
    function t() {
        this.kind = "memoryEager", this._offlineComponentProvider = new yc;
    }
    return t.prototype.toJSON = function() {
        return {
            kind: this.kind
        };
    }, t;
}(), mf = /** @class */ function() {
    function t(t) {
        this.kind = "memoryLru", this._offlineComponentProvider = new gc(t);
    }
    return t.prototype.toJSON = function() {
        return {
            kind: this.kind
        };
    }, t;
}();

/**
 * Creates an instance of `MemoryEagerGarbageCollector`. This is also the
 * default garbage collector unless it is explicitly specified otherwise.
 */
function yf() {
    return new vf;
}

/**
 * Creates an instance of `MemoryLruGarbageCollector`.
 *
 * A target size can be specified as part of the setting parameter. The
 * collector will start deleting documents once the cache size exceeds
 * the given size. The default cache size is 40MB (40 * 1024 * 1024 bytes).
 */ function gf(t) {
    return new mf(null == t ? void 0 : t.cacheSizeBytes);
}

/**
 * Creates an instance of `MemoryLocalCache`. The instance can be set to
 * `FirestoreSettings.cache` to tell the SDK which cache layer to use.
 */ function wf(t) {
    return new df(t);
}

/**
 * Creates an instance of `PersistentLocalCache`. The instance can be set to
 * `FirestoreSettings.cache` to tell the SDK which cache layer to use.
 *
 * Persistent cache cannot be used in a Node.js environment.
 */ function bf(t) {
    return new pf(t);
}

var If = /** @class */ function() {
    function t(t) {
        this.forceOwnership = t, this.kind = "persistentSingleTab";
    }
    return t.prototype.toJSON = function() {
        return {
            kind: this.kind
        };
    }, 
    /**
     * @internal
     */
    t.prototype._initialize = function(t) {
        this._onlineComponentProvider = new Ic, this._offlineComponentProvider = new wc(this._onlineComponentProvider, null == t ? void 0 : t.cacheSizeBytes, this.forceOwnership);
    }, t;
}(), Ef = /** @class */ function() {
    function t() {
        this.kind = "PersistentMultipleTab";
    }
    return t.prototype.toJSON = function() {
        return {
            kind: this.kind
        };
    }, 
    /**
     * @internal
     */
    t.prototype._initialize = function(t) {
        this._onlineComponentProvider = new Ic, this._offlineComponentProvider = new bc(this._onlineComponentProvider, null == t ? void 0 : t.cacheSizeBytes);
    }, t;
}();

/**
 * Creates an instance of `PersistentSingleTabManager`.
 *
 * @param settings Configures the created tab manager.
 */
function Tf(t) {
    return new If(null == t ? void 0 : t.forceOwnership);
}

/**
 * Creates an instance of `PersistentMultipleTabManager`.
 */ function Sf() {
    return new Ef;
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
 */ var _f = {
    maxAttempts: 5
}, Df = /** @class */ function() {
    /** @hideconstructor */
    function t(t, e) {
        this._firestore = t, this._commitHandler = e, this._mutations = [], this._committed = !1, 
        this._dataReader = Bl(t);
    }
    return t.prototype.set = function(t, e, n) {
        this._verifyNotCommitted();
        var r = Cf(t, this._firestore), i = Vh(r.converter, e, n), o = Ul(this._dataReader, "WriteBatch.set", r._key, i, null !== r.converter, n);
        return this._mutations.push(o.toMutation(r._key, Ur.none())), this;
    }, t.prototype.update = function(t, e, n) {
        for (var r = [], i = 3; i < arguments.length; i++) r[i - 3] = arguments[i];
        this._verifyNotCommitted();
        var o, u = Cf(t, this._firestore);
        // For Compat types, we have to "extract" the underlying types before
        // performing validation.
                return o = "string" == typeof (e = v(e)) || e instanceof Al ? Yl(this._dataReader, "WriteBatch.update", u._key, e, n, r) : Hl(this._dataReader, "WriteBatch.update", u._key, e), 
        this._mutations.push(o.toMutation(u._key, Ur.exists(!0))), this;
    }, 
    /**
     * Deletes the document referred to by the provided {@link DocumentReference}.
     *
     * @param documentRef - A reference to the document to be deleted.
     * @returns This `WriteBatch` instance. Used for chaining method calls.
     */
    t.prototype.delete = function(t) {
        this._verifyNotCommitted();
        var e = Cf(t, this._firestore);
        return this._mutations = this._mutations.concat(new ni(e._key, Ur.none())), this;
    }, 
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
     */
    t.prototype.commit = function() {
        return this._verifyNotCommitted(), this._committed = !0, this._mutations.length > 0 ? this._commitHandler(this._mutations) : Promise.resolve();
    }, t.prototype._verifyNotCommitted = function() {
        if (this._committed) throw new Q(K.FAILED_PRECONDITION, "A write batch can no longer be used after commit() has been called.");
    }, t;
}();

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
 */ function Cf(t, e) {
    if ((t = v(t)).firestore !== e) throw new Q(K.INVALID_ARGUMENT, "Provided document reference is from a different Firestore instance.");
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
 */ var xf, Nf = /** @class */ function(e) {
    // This class implements the same logic as the Transaction API in the Lite SDK
    // but is subclassed in order to return its own DocumentSnapshot types.
    /** @hideconstructor */
    function n(t, n) {
        var r = this;
        return (r = e.call(this, t, n) || this)._firestore = t, r;
    }
    /**
     * Reads the document referenced by the provided {@link DocumentReference}.
     *
     * @param documentRef - A reference to the document to be read.
     * @returns A `DocumentSnapshot` with the read data.
     */    return t(n, e), n.prototype.get = function(t) {
        var n = this, r = Cf(t, this._firestore), i = new Xh(this._firestore);
        return e.prototype.get.call(this, t).then((function(t) {
            return new jh(n._firestore, i, r._key, t._document, new Gh(
            /* hasPendingWrites= */ !1, 
            /* fromCache= */ !1), r.converter);
        }));
    }, n;
}(/** @class */ function() {
    /** @hideconstructor */
    function t(t, e) {
        this._firestore = t, this._transaction = e, this._dataReader = Bl(t)
        /**
     * Reads the document referenced by the provided {@link DocumentReference}.
     *
     * @param documentRef - A reference to the document to be read.
     * @returns A `DocumentSnapshot` with the read data.
     */;
    }
    return t.prototype.get = function(t) {
        var e = this, n = Cf(t, this._firestore), r = new Mh(this._firestore);
        return this._transaction.lookup([ n._key ]).then((function(t) {
            if (!t || 1 !== t.length) return U();
            var i = t[0];
            if (i.isFoundDocument()) return new uh(e._firestore, r, i.key, i, n.converter);
            if (i.isNoDocument()) return new uh(e._firestore, r, n._key, null, n.converter);
            throw U();
        }));
    }, t.prototype.set = function(t, e, n) {
        var r = Cf(t, this._firestore), i = Vh(r.converter, e, n), o = Ul(this._dataReader, "Transaction.set", r._key, i, null !== r.converter, n);
        return this._transaction.set(r._key, o), this;
    }, t.prototype.update = function(t, e, n) {
        for (var r = [], i = 3; i < arguments.length; i++) r[i - 3] = arguments[i];
        var o, u = Cf(t, this._firestore);
        // For Compat types, we have to "extract" the underlying types before
        // performing validation.
                return o = "string" == typeof (e = v(e)) || e instanceof Al ? Yl(this._dataReader, "Transaction.update", u._key, e, n, r) : Hl(this._dataReader, "Transaction.update", u._key, e), 
        this._transaction.update(u._key, o), this;
    }, 
    /**
     * Deletes the document referred to by the provided {@link DocumentReference}.
     *
     * @param documentRef - A reference to the document to be deleted.
     * @returns This `Transaction` instance. Used for chaining method calls.
     */
    t.prototype.delete = function(t) {
        var e = Cf(t, this._firestore);
        return this._transaction.delete(e._key), this;
    }, t;
}());

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
 */ function Af(t, r, i) {
    t = Hc(t, hl);
    var o = Object.assign(Object.assign({}, _f), i);
    return function(t) {
        if (t.maxAttempts < 1) throw new Q(K.INVALID_ARGUMENT, "Max attempts must be at least 1");
    }(o), function(t, r, i) {
        var o = this, u = new W;
        return t.asyncQueue.enqueueAndForget((function() {
            return e(o, void 0, void 0, (function() {
                var e;
                return n(this, (function(n) {
                    switch (n.label) {
                      case 0:
                        return [ 4 /*yield*/ , Mc(t) ];

                      case 1:
                        return e = n.sent(), new Dc(t.asyncQueue, e, i, r, u).run(), [ 2 /*return*/ ];
                    }
                }));
            }));
        })), u.promise;
    }(pl(t), (function(e) {
        return r(new Nf(t, e));
    }), o);
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
 */ function kf() {
    return new zl("deleteField");
}

/**
 * Returns a sentinel used with {@link @firebase/firestore/lite#(setDoc:1)} or {@link @firebase/firestore/lite#(updateDoc:1)} to
 * include a server-generated timestamp in the written data.
 */ function Of() {
    return new jl("serverTimestamp");
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
 */ function Ff() {
    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
    // NOTE: We don't actually parse the data until it's used in set() or
    // update() since we'd need the Firestore instance to do this.
        return new Kl("arrayUnion", t);
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
 */ function Pf() {
    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
    // NOTE: We don't actually parse the data until it's used in set() or
    // update() since we'd need the Firestore instance to do this.
        return new Ql("arrayRemove", t);
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
 */ function Rf(t) {
    return new Wl("increment", t);
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
 */ function Vf(t) {
    return pl(t = Hc(t, hl)), new Df(t, (function(e) {
        return cf(t, e);
    }))
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
 */;
}

function Mf(t, i) {
    var o, u = pl(t = Hc(t, hl));
    if (!u._uninitializedComponentsProvider || "memory" === (null === (o = u._uninitializedComponentsProvider) || void 0 === o ? void 0 : o._offlineKind)) 
    // PORTING NOTE: We don't return an error if the user has not enabled
    // persistence since `enableIndexeddbPersistence()` can fail on the Web.
    return q("Cannot enable indexes when persistence is disabled"), Promise.resolve();
    var a = function(t) {
        var e = "string" == typeof t ? function(t) {
            try {
                return JSON.parse(t);
            } catch (t) {
                throw new Q(K.INVALID_ARGUMENT, "Failed to parse JSON: " + (null == t ? void 0 : t.message));
            }
        }(t) : t, n = [];
        if (Array.isArray(e.indexes)) for (var r = 0, i = e.indexes; r < i.length; r++) {
            var o = i[r], u = Lf(o, "collectionGroup"), a = [];
            if (Array.isArray(o.fields)) for (var s = 0, c = o.fields; s < c.length; s++) {
                var l = c[s], h = rh("setIndexConfiguration", Lf(l, "fieldPath"));
                "CONTAINS" === l.arrayConfig ? a.push(new wt(h, 2 /* IndexKind.CONTAINS */)) : "ASCENDING" === l.order ? a.push(new wt(h, 0 /* IndexKind.ASCENDING */)) : "DESCENDING" === l.order && a.push(new wt(h, 1 /* IndexKind.DESCENDING */));
            }
            n.push(new vt(vt.UNKNOWN_ID, u, a, It.empty()));
        }
        return n;
    }(i);
    return function(t, i) {
        var o = this;
        return t.asyncQueue.enqueue((function() {
            return e(o, void 0, void 0, (function() {
                var o;
                return n(this, (function(u) {
                    switch (u.label) {
                      case 0:
                        return o = function(t, i) {
                            return e(this, void 0, void 0, (function() {
                                var e, o, u;
                                return n(this, (function(n) {
                                    return e = j(t), o = e.indexManager, u = [], [ 2 /*return*/ , e.persistence.runTransaction("Configure indexes", "readwrite", (function(t) {
                                        return o.getFieldIndexes(t).next((function(e) {
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
                                            return function(t, e, n, i, o) {
                                                t = r([], t, !0), e = r([], e, !0), t.sort(n), e.sort(n);
                                                for (var u = t.length, a = e.length, s = 0, c = 0; s < a && c < u; ) {
                                                    var l = n(t[c], e[s]);
                                                    l < 0 ? 
                                                    // The element was removed if the next element in our ordered
                                                    // walkthrough is only in `before`.
                                                    o(t[c++]) : l > 0 ? 
                                                    // The element was added if the next element in our ordered walkthrough
                                                    // is only in `after`.
                                                    i(e[s++]) : (s++, c++);
                                                }
                                                for (;s < a; ) i(e[s++]);
                                                for (;c < u; ) o(t[c++]);
                                            }(e, i, gt, (function(e) {
                                                u.push(o.addFieldIndex(t, e));
                                            }), (function(e) {
                                                u.push(o.deleteFieldIndex(t, e));
                                            }));
                                        })).next((function() {
                                            return Nt.waitFor(u);
                                        }));
                                    })) ];
                                }));
                            }));
                        }, [ 4 /*yield*/ , Pc(t) ];

                      case 1:
                        return [ 2 /*return*/ , o.apply(void 0, [ u.sent(), i ]) ];
                    }
                }));
            }));
        }));
    }(u, a);
}

function Lf(t, e) {
    if ("string" != typeof t[e]) throw new Q(K.INVALID_ARGUMENT, "Missing string value for: " + e);
    return t[e];
}

/**
 * Cloud Firestore
 *
 * @packageDocumentation
 */ void 0 === xf && (xf = !0), F = i, o(new c("firestore", (function(t, e) {
    var n = e.instanceIdentifier, r = e.options, i = t.getProvider("app").getImmediate(), o = new hl(new J(t.getProvider("auth-internal")), new et(t.getProvider("app-check-internal")), function(t, e) {
        if (!Object.prototype.hasOwnProperty.apply(t.options, [ "projectId" ])) throw new Q(K.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
        return new Ue(t.options.projectId, e);
    }(i, n), i);
    return r = Object.assign({
        useFetchStreams: xf
    }, r), o._setSettings(r), o;
}), "PUBLIC").setMultipleInstances(!0)), u(k, "3.13.0", void 0), 
// BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
u(k, "3.13.0", "esm5");

export { Rh as AbstractUserDataWriter, Cl as AggregateField, xl as AggregateQuerySnapshot, Nl as Bytes, ll as CACHE_SIZE_UNLIMITED, el as CollectionReference, $c as DocumentReference, jh as DocumentSnapshot, Al as FieldPath, Ol as FieldValue, hl as Firestore, Q as FirestoreError, Fl as GeoPoint, cl as LoadBundleTask, tl as Query, vh as QueryCompositeFilterConstraint, hh as QueryConstraint, Kh as QueryDocumentSnapshot, Dh as QueryEndAtConstraint, dh as QueryFieldFilterConstraint, bh as QueryLimitConstraint, gh as QueryOrderByConstraint, Qh as QuerySnapshot, Th as QueryStartAtConstraint, Gh as SnapshotMetadata, st as Timestamp, Nf as Transaction, Df as WriteBatch, Ue as _DatabaseId, pt as _DocumentKey, nt as _EmptyAppCheckTokenProvider, Y as _EmptyAuthCredentialsProvider, dt as _FieldPath, hi as _TestingHooks, Hc as _cast, G as _debugAssert, ke as _isBase64Available, q as _logWarn, jc as _validateIsNotUsedTogether, uf as addDoc, Uh as aggregateFieldEqual, zh as aggregateQuerySnapshotEqual, yh as and, Pf as arrayRemove, Ff as arrayUnion, qh as average, wl as clearIndexedDbPersistence, nl as collection, rl as collectionGroup, Zc as connectFirestoreEmulator, Bh as count, of as deleteDoc, kf as deleteField, El as disableNetwork, il as doc, kl as documentId, ml as enableIndexedDbPersistence, yl as enableMultiTabIndexedDbPersistence, Il as enableNetwork, xh as endAt, Ch as endBefore, pl as ensureFirestoreConfigured, cf as executeWrite, ff as getAggregateFromServer, hf as getCountFromServer, Yh as getDoc, Jh as getDocFromCache, Zh as getDocFromServer, $h as getDocs, tf as getDocsFromCache, ef as getDocsFromServer, dl as getFirestore, Rf as increment, fl as initializeFirestore, Ih as limit, Eh as limitToLast, Sl as loadBundle, yf as memoryEagerGarbageCollector, wf as memoryLocalCache, gf as memoryLruGarbageCollector, _l as namedQuery, af as onSnapshot, sf as onSnapshotsInSync, mh as or, wh as orderBy, bf as persistentLocalCache, Sf as persistentMultipleTabManager, Tf as persistentSingleTabManager, fh as query, ul as queryEqual, ol as refEqual, Af as runTransaction, Of as serverTimestamp, nf as setDoc, Mf as setIndexConfiguration, V as setLogLevel, Hh as snapshotEqual, _h as startAfter, Sh as startAt, Lh as sum, Tl as terminate, rf as updateDoc, bl as waitForPendingWrites, ph as where, Vf as writeBatch };
//# sourceMappingURL=index.esm5.js.map
