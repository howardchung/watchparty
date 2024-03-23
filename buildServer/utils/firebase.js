"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUserEmail = exports.getUser = exports.getUserByEmail = exports.writeData = exports.validateUserToken = void 0;
const config_1 = __importDefault(require("../config"));
const admin = __importStar(require("firebase-admin"));
if (config_1.default.FIREBASE_ADMIN_SDK_CONFIG) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(config_1.default.FIREBASE_ADMIN_SDK_CONFIG)),
        databaseURL: config_1.default.FIREBASE_DATABASE_URL,
    });
}
async function validateUserToken(uid, token) {
    if (!config_1.default.FIREBASE_ADMIN_SDK_CONFIG) {
        return undefined;
    }
    if (!token) {
        return undefined;
    }
    const decoded = await admin.auth().verifyIdToken(token);
    if (uid !== decoded.uid) {
        return undefined;
    }
    return decoded;
}
exports.validateUserToken = validateUserToken;
async function writeData(key, value) {
    if (!config_1.default.FIREBASE_ADMIN_SDK_CONFIG) {
        return;
    }
    await admin.database().ref(key).set(value);
}
exports.writeData = writeData;
async function getUserByEmail(email) {
    if (!config_1.default.FIREBASE_ADMIN_SDK_CONFIG) {
        return null;
    }
    try {
        return await admin.auth().getUserByEmail(email);
    }
    catch (e) {
        console.log(email, e.message);
    }
    return null;
}
exports.getUserByEmail = getUserByEmail;
async function getUser(uid) {
    if (!config_1.default.FIREBASE_ADMIN_SDK_CONFIG) {
        return null;
    }
    return await admin.auth().getUser(uid);
}
exports.getUser = getUser;
async function getUserEmail(uid) {
    if (!config_1.default.FIREBASE_ADMIN_SDK_CONFIG) {
        return null;
    }
    const user = await admin.auth().getUser(uid);
    return user.email;
}
exports.getUserEmail = getUserEmail;
async function deleteUser(uid) {
    if (!config_1.default.FIREBASE_ADMIN_SDK_CONFIG) {
        return null;
    }
    return admin.auth().deleteUser(uid);
}
exports.deleteUser = deleteUser;
