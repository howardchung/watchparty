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
import * as firestore from '@google-cloud/firestore';
import { DocumentSnapshot } from './document';
import { Firestore } from './index';
import { Timestamp } from './timestamp';
import { FieldPath } from './path';
import { AggregateQuerySnapshot, DocumentReference, Query, QuerySnapshot } from './reference';
/**
 * A reference to a transaction.
 *
 * The Transaction object passed to a transaction's updateFunction provides
 * the methods to read and write data within the transaction context. See
 * [runTransaction()]{@link Firestore#runTransaction}.
 *
 * @class Transaction
 */
export declare class Transaction implements firestore.Transaction {
    private _firestore;
    private _writeBatch;
    private _backoff;
    private _requestTag;
    private _transactionId?;
    /**
     * @private
     *
     * @param firestore The Firestore Database client.
     * @param requestTag A unique client-assigned identifier for the scope of
     * this transaction.
     */
    constructor(firestore: Firestore, requestTag: string);
    /**
     * Retrieves a query result. Holds a pessimistic lock on all returned
     * documents.
     *
     * @param {Query} query A query to execute.
     * @return {Promise<QuerySnapshot>} A QuerySnapshot for the retrieved data.
     */
    get<T>(query: Query<T>): Promise<QuerySnapshot<T>>;
    /**
     * Reads the document referenced by the provided `DocumentReference.`
     * Holds a pessimistic lock on the returned document.
     *
     * @param {DocumentReference} documentRef A reference to the document to be read.
     * @return {Promise<DocumentSnapshot>}  A DocumentSnapshot for the read data.
     */
    get<T>(documentRef: DocumentReference<T>): Promise<DocumentSnapshot<T>>;
    /**
     * Retrieves an aggregate query result. Holds a pessimistic lock on all
     * documents that were matched by the underlying query.
     *
     * @param aggregateQuery An aggregate query to execute.
     * @return An AggregateQuerySnapshot for the retrieved data.
     */
    get<T extends firestore.AggregateSpec>(aggregateQuery: firestore.AggregateQuery<T>): Promise<AggregateQuerySnapshot<T>>;
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
    getAll<T>(...documentRefsOrReadOptions: Array<firestore.DocumentReference<T> | firestore.ReadOptions>): Promise<Array<DocumentSnapshot<T>>>;
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
    create<T>(documentRef: firestore.DocumentReference<T>, data: firestore.WithFieldValue<T>): Transaction;
    set<T>(documentRef: firestore.DocumentReference<T>, data: firestore.PartialWithFieldValue<T>, options: firestore.SetOptions): Transaction;
    set<T>(documentRef: firestore.DocumentReference<T>, data: firestore.WithFieldValue<T>): Transaction;
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
    update<T>(documentRef: firestore.DocumentReference<T>, dataOrField: firestore.UpdateData<T> | string | firestore.FieldPath, ...preconditionOrValues: Array<firestore.Precondition | unknown | string | firestore.FieldPath>): Transaction;
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
    delete<T>(documentRef: DocumentReference<T>, precondition?: firestore.Precondition): this;
    /**
     * Starts a transaction and obtains the transaction id from the server.
     *
     * @private
     * @internal
     */
    begin(readOnly: boolean, readTime: Timestamp | undefined): Promise<void>;
    /**
     * Commits all queued-up changes in this transaction and releases all locks.
     *
     * @private
     * @internal
     */
    commit(): Promise<void>;
    /**
     * Releases all locks and rolls back this transaction.
     *
     * @private
     * @internal
     */
    rollback(): Promise<void>;
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
    runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>, options: {
        maxAttempts: number;
        readOnly: boolean;
        readTime?: Timestamp;
    }): Promise<T>;
    /**
     * Delays further operations based on the provided error.
     *
     * @private
     * @internal
     * @return A Promise that resolves after the delay expired.
     */
    private maybeBackoff;
}
/**
 * Parses the arguments for the `getAll()` call supported by both the Firestore
 * and Transaction class.
 *
 * @private
 * @internal
 * @param documentRefsOrReadOptions An array of document references followed by
 * an optional ReadOptions object.
 */
export declare function parseGetAllArguments<T>(documentRefsOrReadOptions: Array<firestore.DocumentReference<T> | firestore.ReadOptions>): {
    documents: Array<DocumentReference<T>>;
    fieldMask: FieldPath[] | null;
};
