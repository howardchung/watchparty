"use strict";
/*!
 * Copyright 2017 Google Inc. All Rights Reserved.
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
exports.parseGetAllArguments = exports.Transaction = void 0;
const backoff_1 = require("./backoff");
const logger_1 = require("./logger");
const path_1 = require("./path");
const reference_1 = require("./reference");
const util_1 = require("./util");
const validate_1 = require("./validate");
const document_reader_1 = require("./document-reader");
/*!
 * Error message for transactional reads that were executed after performing
 * writes.
 */
const READ_AFTER_WRITE_ERROR_MSG = 'Firestore transactions require all reads to be executed before all writes.';
/**
 * A reference to a transaction.
 *
 * The Transaction object passed to a transaction's updateFunction provides
 * the methods to read and write data within the transaction context. See
 * [runTransaction()]{@link Firestore#runTransaction}.
 *
 * @class Transaction
 */
class Transaction {
    /**
     * @private
     *
     * @param firestore The Firestore Database client.
     * @param requestTag A unique client-assigned identifier for the scope of
     * this transaction.
     */
    constructor(firestore, requestTag) {
        this._firestore = firestore;
        this._writeBatch = firestore.batch();
        this._requestTag = requestTag;
        this._backoff = new backoff_1.ExponentialBackoff();
    }
    /**
     * Retrieve a document or a query result from the database. Holds a
     * pessimistic lock on all returned documents.
     *
     * @param {DocumentReference|Query} refOrQuery The document or query to
     * return.
     * @returns {Promise} A Promise that resolves with a DocumentSnapshot or
     * QuerySnapshot for the returned documents.
     *
     * @example
     * ```
     * firestore.runTransaction(transaction => {
     *   let documentRef = firestore.doc('col/doc');
     *   return transaction.get(documentRef).then(doc => {
     *     if (doc.exists) {
     *       transaction.update(documentRef, { count: doc.get('count') + 1 });
     *     } else {
     *       transaction.create(documentRef, { count: 1 });
     *     }
     *   });
     * });
     * ```
     */
    get(refOrQuery) {
        if (!this._writeBatch.isEmpty) {
            throw new Error(READ_AFTER_WRITE_ERROR_MSG);
        }
        if (refOrQuery instanceof reference_1.DocumentReference) {
            const documentReader = new document_reader_1.DocumentReader(this._firestore, [refOrQuery]);
            documentReader.transactionId = this._transactionId;
            return documentReader.get(this._requestTag).then(([res]) => res);
        }
        if (refOrQuery instanceof reference_1.Query) {
            return refOrQuery._get(this._transactionId);
        }
        if (refOrQuery instanceof (reference_1.AggregateQuery)) {
            return refOrQuery._get(this._transactionId);
        }
        throw new Error('Value for argument "refOrQuery" must be a DocumentReference, Query, or AggregateQuery.');
    }
    /**
     * Retrieves multiple documents from Firestore. Holds a pessimistic lock on
     * all returned documents.
     *
     * The first argument is required and must be of type `DocumentReference`
     * followed by any additional `DocumentReference` documents. If used, the
     * optional `ReadOptions` must be the last argument.
     *
     * @param {...DocumentReference|ReadOptions} documentRefsOrReadOptions The
     * `DocumentReferences` to receive, followed by an optional field mask.
     * @returns {Promise<Array.<DocumentSnapshot>>} A Promise that
     * contains an array with the resulting document snapshots.
     *
     * @example
     * ```
     * let firstDoc = firestore.doc('col/doc1');
     * let secondDoc = firestore.doc('col/doc2');
     * let resultDoc = firestore.doc('col/doc3');
     *
     * firestore.runTransaction(transaction => {
     *   return transaction.getAll(firstDoc, secondDoc).then(docs => {
     *     transaction.set(resultDoc, {
     *       sum: docs[0].get('count') + docs[1].get('count')
     *     });
     *   });
     * });
     * ```
     */
    getAll(...documentRefsOrReadOptions) {
        if (!this._writeBatch.isEmpty) {
            throw new Error(READ_AFTER_WRITE_ERROR_MSG);
        }
        (0, validate_1.validateMinNumberOfArguments)('Transaction.getAll', documentRefsOrReadOptions, 1);
        const { documents, fieldMask } = parseGetAllArguments(documentRefsOrReadOptions);
        const documentReader = new document_reader_1.DocumentReader(this._firestore, documents);
        documentReader.fieldMask = fieldMask || undefined;
        documentReader.transactionId = this._transactionId;
        return documentReader.get(this._requestTag);
    }
    /**
     * Create the document referred to by the provided
     * [DocumentReference]{@link DocumentReference}. The operation will
     * fail the transaction if a document exists at the specified location.
     *
     * @param {DocumentReference} documentRef A reference to the document to be
     * created.
     * @param {DocumentData} data The object data to serialize as the document.
     * @returns {Transaction} This Transaction instance. Used for
     * chaining method calls.
     *
     * @example
     * ```
     * firestore.runTransaction(transaction => {
     *   let documentRef = firestore.doc('col/doc');
     *   return transaction.get(documentRef).then(doc => {
     *     if (!doc.exists) {
     *       transaction.create(documentRef, { foo: 'bar' });
     *     }
     *   });
     * });
     * ```
     */
    create(documentRef, data) {
        this._writeBatch.create(documentRef, data);
        return this;
    }
    /**
     * Writes to the document referred to by the provided
     * [DocumentReference]{@link DocumentReference}. If the document
     * does not exist yet, it will be created. If you pass
     * [SetOptions]{@link SetOptions}, the provided data can be merged into the
     * existing document.
     *
     * @param {DocumentReference} documentRef A reference to the document to be
     * set.
     * @param {T|Partial<T>} data The object to serialize as the document.
     * @param {SetOptions=} options An object to configure the set behavior.
     * @param {boolean=} options.merge - If true, set() merges the values
     * specified in its data argument. Fields omitted from this set() call remain
     * untouched. If your input sets any field to an empty map, all nested fields
     * are overwritten.
     * @param {Array.<string|FieldPath>=} options.mergeFields - If provided,
     * set() only replaces the specified field paths. Any field path that is not
     * specified is ignored and remains untouched. If your input sets any field to
     * an empty map, all nested fields are overwritten.
     * @throws {Error} If the provided input is not a valid Firestore document.
     * @returns {Transaction} This Transaction instance. Used for
     * chaining method calls.
     *
     * @example
     * ```
     * firestore.runTransaction(transaction => {
     *   let documentRef = firestore.doc('col/doc');
     *   transaction.set(documentRef, { foo: 'bar' });
     *   return Promise.resolve();
     * });
     * ```
     */
    set(documentRef, data, options) {
        if (options) {
            this._writeBatch.set(documentRef, data, options);
        }
        else {
            this._writeBatch.set(documentRef, data);
        }
        return this;
    }
    /**
     * Updates fields in the document referred to by the provided
     * [DocumentReference]{@link DocumentReference}. The update will
     * fail if applied to a document that does not exist.
     *
     * The update() method accepts either an object with field paths encoded as
     * keys and field values encoded as values, or a variable number of arguments
     * that alternate between field paths and field values. Nested fields can be
     * updated by providing dot-separated field path strings or by providing
     * FieldPath objects.
     *
     * A Precondition restricting this update can be specified as the last
     * argument.
     *
     * @param {DocumentReference} documentRef A reference to the document to be
     * updated.
     * @param {UpdateData|string|FieldPath} dataOrField An object
     * containing the fields and values with which to update the document
     * or the path of the first field to update.
     * @param {
     * ...(Precondition|*|string|FieldPath)} preconditionOrValues -
     * An alternating list of field paths and values to update or a Precondition
     * to to enforce on this update.
     * @throws {Error} If the provided input is not valid Firestore data.
     * @returns {Transaction} This Transaction instance. Used for
     * chaining method calls.
     *
     * @example
     * ```
     * firestore.runTransaction(transaction => {
     *   let documentRef = firestore.doc('col/doc');
     *   return transaction.get(documentRef).then(doc => {
     *     if (doc.exists) {
     *       transaction.update(documentRef, { count: doc.get('count') + 1 });
     *     } else {
     *       transaction.create(documentRef, { count: 1 });
     *     }
     *   });
     * });
     * ```
     */
    update(documentRef, dataOrField, ...preconditionOrValues) {
        // eslint-disable-next-line prefer-rest-params
        (0, validate_1.validateMinNumberOfArguments)('Transaction.update', arguments, 2);
        this._writeBatch.update(documentRef, dataOrField, ...preconditionOrValues);
        return this;
    }
    /**
     * Deletes the document referred to by the provided [DocumentReference]
     * {@link DocumentReference}.
     *
     * @param {DocumentReference} documentRef A reference to the document to be
     * deleted.
     * @param {Precondition=} precondition A precondition to enforce for this
     * delete.
     * @param {Timestamp=} precondition.lastUpdateTime If set, enforces that the
     * document was last updated at lastUpdateTime. Fails the transaction if the
     * document doesn't exist or was last updated at a different time.
     * @param {boolean=} precondition.exists If set, enforces that the target
     * document must or must not exist.
     * @returns {Transaction} This Transaction instance. Used for
     * chaining method calls.
     *
     * @example
     * ```
     * firestore.runTransaction(transaction => {
     *   let documentRef = firestore.doc('col/doc');
     *   transaction.delete(documentRef);
     *   return Promise.resolve();
     * });
     * ```
     */
    delete(documentRef, precondition) {
        this._writeBatch.delete(documentRef, precondition);
        return this;
    }
    /**
     * Starts a transaction and obtains the transaction id from the server.
     *
     * @private
     * @internal
     */
    begin(readOnly, readTime) {
        var _a;
        const request = {
            database: this._firestore.formattedName,
        };
        if (readOnly) {
            request.options = {
                readOnly: {
                    readTime: (_a = readTime === null || readTime === void 0 ? void 0 : readTime.toProto()) === null || _a === void 0 ? void 0 : _a.timestampValue,
                },
            };
        }
        else if (this._transactionId) {
            request.options = {
                readWrite: {
                    retryTransaction: this._transactionId,
                },
            };
        }
        return this._firestore
            .request('beginTransaction', request, this._requestTag)
            .then(resp => {
            this._transactionId = resp.transaction;
        });
    }
    /**
     * Commits all queued-up changes in this transaction and releases all locks.
     *
     * @private
     * @internal
     */
    commit() {
        return this._writeBatch
            ._commit({
            transactionId: this._transactionId,
            requestTag: this._requestTag,
        })
            .then(() => { });
    }
    /**
     * Releases all locks and rolls back this transaction.
     *
     * @private
     * @internal
     */
    rollback() {
        const request = {
            database: this._firestore.formattedName,
            transaction: this._transactionId,
        };
        return this._firestore.request('rollback', request, this._requestTag);
    }
    /**
     * Executes `updateFunction()` and commits the transaction with retry.
     *
     * @private
     * @internal
     * @param updateFunction The user function to execute within the transaction
     * context.
     * @param requestTag A unique client-assigned identifier for the scope of
     * this transaction.
     * @param options The user-defined options for this transaction.
     */
    async runTransaction(updateFunction, options) {
        let result;
        let lastError = undefined;
        for (let attempt = 0; attempt < options.maxAttempts; ++attempt) {
            try {
                if (lastError) {
                    (0, logger_1.logger)('Firestore.runTransaction', this._requestTag, 'Retrying transaction after error:', lastError);
                    await this.rollback();
                }
                this._writeBatch._reset();
                await this.maybeBackoff(lastError);
                await this.begin(options.readOnly, options.readTime);
                const promise = updateFunction(this);
                if (!(promise instanceof Promise)) {
                    throw new Error('You must return a Promise in your transaction()-callback.');
                }
                result = await promise;
                await this.commit();
                return result;
            }
            catch (err) {
                (0, logger_1.logger)('Firestore.runTransaction', this._requestTag, 'Rolling back transaction after callback error:', err);
                lastError = err;
                if (!this._transactionId || !isRetryableTransactionError(err)) {
                    break;
                }
            }
        }
        (0, logger_1.logger)('Firestore.runTransaction', this._requestTag, 'Transaction not eligible for retry, returning error: %s', lastError);
        await this.rollback();
        return Promise.reject(lastError);
    }
    /**
     * Delays further operations based on the provided error.
     *
     * @private
     * @internal
     * @return A Promise that resolves after the delay expired.
     */
    async maybeBackoff(error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === 8 /* StatusCode.RESOURCE_EXHAUSTED */) {
            this._backoff.resetToMax();
        }
        await this._backoff.backoffAndWait();
    }
}
exports.Transaction = Transaction;
/**
 * Parses the arguments for the `getAll()` call supported by both the Firestore
 * and Transaction class.
 *
 * @private
 * @internal
 * @param documentRefsOrReadOptions An array of document references followed by
 * an optional ReadOptions object.
 */
function parseGetAllArguments(documentRefsOrReadOptions) {
    let documents;
    let readOptions = undefined;
    if (Array.isArray(documentRefsOrReadOptions[0])) {
        throw new Error('getAll() no longer accepts an array as its first argument. ' +
            'Please unpack your array and call getAll() with individual arguments.');
    }
    if (documentRefsOrReadOptions.length > 0 &&
        (0, util_1.isPlainObject)(documentRefsOrReadOptions[documentRefsOrReadOptions.length - 1])) {
        readOptions = documentRefsOrReadOptions.pop();
        documents = documentRefsOrReadOptions;
    }
    else {
        documents = documentRefsOrReadOptions;
    }
    for (let i = 0; i < documents.length; ++i) {
        (0, reference_1.validateDocumentReference)(i, documents[i]);
    }
    validateReadOptions('options', readOptions, { optional: true });
    const fieldMask = readOptions && readOptions.fieldMask
        ? readOptions.fieldMask.map(fieldPath => path_1.FieldPath.fromArgument(fieldPath))
        : null;
    return { fieldMask, documents };
}
exports.parseGetAllArguments = parseGetAllArguments;
/**
 * Validates the use of 'options' as ReadOptions and enforces that 'fieldMask'
 * is an array of strings or field paths.
 *
 * @private
 * @internal
 * @param arg The argument name or argument index (for varargs methods).
 * @param value The input to validate.
 * @param options Options that specify whether the ReadOptions can be omitted.
 */
function validateReadOptions(arg, value, options) {
    if (!(0, validate_1.validateOptional)(value, options)) {
        if (!(0, util_1.isObject)(value)) {
            throw new Error(`${(0, validate_1.invalidArgumentMessage)(arg, 'read option')} Input is not an object.'`);
        }
        const options = value;
        if (options.fieldMask !== undefined) {
            if (!Array.isArray(options.fieldMask)) {
                throw new Error(`${(0, validate_1.invalidArgumentMessage)(arg, 'read option')} "fieldMask" is not an array.`);
            }
            for (let i = 0; i < options.fieldMask.length; ++i) {
                try {
                    (0, path_1.validateFieldPath)(i, options.fieldMask[i]);
                }
                catch (err) {
                    throw new Error(`${(0, validate_1.invalidArgumentMessage)(arg, 'read option')} "fieldMask" is not valid: ${err.message}`);
                }
            }
        }
    }
}
function isRetryableTransactionError(error) {
    if (error.code !== undefined) {
        // This list is based on https://github.com/firebase/firebase-js-sdk/blob/master/packages/firestore/src/core/transaction_runner.ts#L112
        switch (error.code) {
            case 10 /* StatusCode.ABORTED */:
            case 1 /* StatusCode.CANCELLED */:
            case 2 /* StatusCode.UNKNOWN */:
            case 4 /* StatusCode.DEADLINE_EXCEEDED */:
            case 13 /* StatusCode.INTERNAL */:
            case 14 /* StatusCode.UNAVAILABLE */:
            case 16 /* StatusCode.UNAUTHENTICATED */:
            case 8 /* StatusCode.RESOURCE_EXHAUSTED */:
                return true;
            case 3 /* StatusCode.INVALID_ARGUMENT */:
                // The Firestore backend uses "INVALID_ARGUMENT" for transactions
                // IDs that have expired. While INVALID_ARGUMENT is generally not
                // retryable, we retry this specific case.
                return !!error.message.match(/transaction has expired/);
            default:
                return false;
        }
    }
    return false;
}
//# sourceMappingURL=transaction.js.map