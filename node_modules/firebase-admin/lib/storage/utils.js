/*! firebase-admin v11.11.1 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseMetadata = void 0;
function getFirebaseMetadata(endpoint, file) {
    const uri = `${endpoint}/b/${file.bucket.name}/o/${encodeURIComponent(file.name)}`;
    return new Promise((resolve, reject) => {
        file.storage.makeAuthenticatedRequest({
            method: 'GET',
            uri,
        }, (err, body) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(body);
            }
        });
    });
}
exports.getFirebaseMetadata = getFirebaseMetadata;
