"use strict";
/*!
 * Copyright 2021 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentReader = void 0;
const document_1 = require("./document");
const util_1 = require("./util");
const logger_1 = require("./logger");
/**
 * A wrapper around BatchGetDocumentsRequest that retries request upon stream
 * failure and returns ordered results.
 *
 * @private
 * @internal
 */
class DocumentReader {
    /**
     * Creates a new DocumentReader that fetches the provided documents (via
     * `get()`).
     *
     * @param firestore The Firestore instance to use.
     * @param allDocuments The documents to get.
     */
    constructor(firestore, allDocuments) {
        this.firestore = firestore;
        this.allDocuments = allDocuments;
        this.outstandingDocuments = new Set();
        this.retrievedDocuments = new Map();
        for (const docRef of this.allDocuments) {
            this.outstandingDocuments.add(docRef.formattedName);
        }
    }
    /**
     * Invokes the BatchGetDocuments RPC and returns the results.
     *
     * @param requestTag A unique client-assigned identifier for this request.
     */
    async get(requestTag) {
        await this.fetchDocuments(requestTag);
        // BatchGetDocuments doesn't preserve document order. We use the request
        // order to sort the resulting documents.
        const orderedDocuments = [];
        for (const docRef of this.allDocuments) {
            const document = this.retrievedDocuments.get(docRef.formattedName);
            if (document !== undefined) {
                // Recreate the DocumentSnapshot with the DocumentReference
                // containing the original converter.
                const finalDoc = new document_1.DocumentSnapshotBuilder(docRef);
                finalDoc.fieldsProto = document._fieldsProto;
                finalDoc.readTime = document.readTime;
                finalDoc.createTime = document.createTime;
                finalDoc.updateTime = document.updateTime;
                orderedDocuments.push(finalDoc.build());
            }
            else {
                throw new Error(`Did not receive document for "${docRef.path}".`);
            }
        }
        return orderedDocuments;
    }
    async fetchDocuments(requestTag) {
        if (!this.outstandingDocuments.size) {
            return;
        }
        const request = {
            database: this.firestore.formattedName,
            transaction: this.transactionId,
            documents: Array.from(this.outstandingDocuments),
        };
        if (this.fieldMask) {
            const fieldPaths = this.fieldMask.map(fieldPath => fieldPath.formattedName);
            request.mask = { fieldPaths };
        }
        let resultCount = 0;
        try {
            const stream = await this.firestore.requestStream('batchGetDocuments', 
            /* bidirectional= */ false, request, requestTag);
            stream.resume();
            for await (const response of stream) {
                let snapshot;
                if (response.found) {
                    (0, logger_1.logger)('DocumentReader.fetchDocuments', requestTag, 'Received document: %s', response.found.name);
                    snapshot = this.firestore.snapshot_(response.found, response.readTime);
                }
                else {
                    (0, logger_1.logger)('DocumentReader.fetchDocuments', requestTag, 'Document missing: %s', response.missing);
                    snapshot = this.firestore.snapshot_(response.missing, response.readTime);
                }
                const path = snapshot.ref.formattedName;
                this.outstandingDocuments.delete(path);
                this.retrievedDocuments.set(path, snapshot);
                ++resultCount;
            }
        }
        catch (error) {
            const shouldRetry = 
            // Transactional reads are retried via the transaction runner.
            !this.transactionId &&
                // Only retry if we made progress.
                resultCount > 0 &&
                // Don't retry permanent errors.
                error.code !== undefined &&
                !(0, util_1.isPermanentRpcError)(error, 'batchGetDocuments');
            (0, logger_1.logger)('DocumentReader.fetchDocuments', requestTag, 'BatchGetDocuments failed with error: %s. Retrying: %s', error, shouldRetry);
            if (shouldRetry) {
                return this.fetchDocuments(requestTag);
            }
            else {
                throw error;
            }
        }
        finally {
            (0, logger_1.logger)('DocumentReader.fetchDocuments', requestTag, 'Received %d results', resultCount);
        }
    }
}
exports.DocumentReader = DocumentReader;
//# sourceMappingURL=document-reader.js.map