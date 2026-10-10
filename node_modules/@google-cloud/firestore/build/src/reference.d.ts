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
/// <reference types="node" />
/// <reference types="node" />
import * as firestore from '@google-cloud/firestore';
import { Readable } from 'stream';
import { GoogleError } from 'google-gax';
import * as protos from '../protos/firestore_v1_proto_api';
import { DocumentSnapshot, QueryDocumentSnapshot } from './document';
import { DocumentChange } from './document-change';
import { Firestore } from './index';
import { FieldPath, ResourcePath } from './path';
import { Serializable, Serializer } from './serializer';
import { Timestamp } from './timestamp';
import { WriteResult } from './write-batch';
import api = protos.google.firestore.v1;
import { CompositeFilter, Filter, UnaryFilter } from './filter';
/**
 * onSnapshot() callback that receives a QuerySnapshot.
 *
 * @callback querySnapshotCallback
 * @param {QuerySnapshot} snapshot A query snapshot.
 */
/**
 * onSnapshot() callback that receives a DocumentSnapshot.
 *
 * @callback documentSnapshotCallback
 * @param {DocumentSnapshot} snapshot A document snapshot.
 */
/**
 * onSnapshot() callback that receives an error.
 *
 * @callback errorCallback
 * @param {Error} err An error from a listen.
 */
/**
 * A DocumentReference refers to a document location in a Firestore database
 * and can be used to write, read, or listen to the location. The document at
 * the referenced location may or may not exist. A DocumentReference can
 * also be used to create a
 * [CollectionReference]{@link CollectionReference} to a
 * subcollection.
 *
 * @class DocumentReference
 */
export declare class DocumentReference<T = firestore.DocumentData> implements Serializable, firestore.DocumentReference<T> {
    private readonly _firestore;
    /** @private */
    readonly _path: ResourcePath;
    /** @private */
    readonly _converter: firestore.FirestoreDataConverter<T>;
    /**
     * @private
     *
     * @private
     * @param _firestore The Firestore Database client.
     * @param _path The Path of this reference.
     * @param _converter The converter to use when serializing data.
     */
    constructor(_firestore: Firestore, 
    /** @private */
    _path: ResourcePath, 
    /** @private */
    _converter?: firestore.FirestoreDataConverter<T>);
    /**
     * The string representation of the DocumentReference's location.
     * @private
     * @internal
     * @type {string}
     * @name DocumentReference#formattedName
     */
    get formattedName(): string;
    /**
     * The [Firestore]{@link Firestore} instance for the Firestore
     * database (useful for performing transactions, etc.).
     *
     * @type {Firestore}
     * @name DocumentReference#firestore
     * @readonly
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col');
     *
     * collectionRef.add({foo: 'bar'}).then(documentReference => {
     *   let firestore = documentReference.firestore;
     *   console.log(`Root location for document is ${firestore.formattedName}`);
     * });
     * ```
     */
    get firestore(): Firestore;
    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     *
     * @type {string}
     * @name DocumentReference#path
     * @readonly
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col');
     *
     * collectionRef.add({foo: 'bar'}).then(documentReference => {
     *   console.log(`Added document at '${documentReference.path}'`);
     * });
     * ```
     */
    get path(): string;
    /**
     * The last path element of the referenced document.
     *
     * @type {string}
     * @name DocumentReference#id
     * @readonly
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col');
     *
     * collectionRef.add({foo: 'bar'}).then(documentReference => {
     *   console.log(`Added document with name '${documentReference.id}'`);
     * });
     * ```
     */
    get id(): string;
    /**
     * Returns a resource path for this document.
     * @private
     * @internal
     */
    get _resourcePath(): ResourcePath;
    /**
     * A reference to the collection to which this DocumentReference belongs.
     *
     * @name DocumentReference#parent
     * @type {CollectionReference}
     * @readonly
     *
     * @example
     * ```
     * let documentRef = firestore.doc('col/doc');
     * let collectionRef = documentRef.parent;
     *
     * collectionRef.where('foo', '==', 'bar').get().then(results => {
     *   console.log(`Found ${results.size} matches in parent collection`);
     * }):
     * ```
     */
    get parent(): CollectionReference<T>;
    /**
     * Reads the document referred to by this DocumentReference.
     *
     * @returns {Promise.<DocumentSnapshot>} A Promise resolved with a
     * DocumentSnapshot for the retrieved document on success. For missing
     * documents, DocumentSnapshot.exists will be false. If the get() fails for
     * other reasons, the Promise will be rejected.
     *
     * @example
     * ```
     * let documentRef = firestore.doc('col/doc');
     *
     * documentRef.get().then(documentSnapshot => {
     *   if (documentSnapshot.exists) {
     *     console.log('Document retrieved successfully.');
     *   }
     * });
     * ```
     */
    get(): Promise<DocumentSnapshot<T>>;
    /**
     * Gets a [CollectionReference]{@link CollectionReference} instance
     * that refers to the collection at the specified path.
     *
     * @param {string} collectionPath A slash-separated path to a collection.
     * @returns {CollectionReference} A reference to the new
     * subcollection.
     *
     * @example
     * ```
     * let documentRef = firestore.doc('col/doc');
     * let subcollection = documentRef.collection('subcollection');
     * console.log(`Path to subcollection: ${subcollection.path}`);
     * ```
     */
    collection(collectionPath: string): CollectionReference;
    /**
     * Fetches the subcollections that are direct children of this document.
     *
     * @returns {Promise.<Array.<CollectionReference>>} A Promise that resolves
     * with an array of CollectionReferences.
     *
     * @example
     * ```
     * let documentRef = firestore.doc('col/doc');
     *
     * documentRef.listCollections().then(collections => {
     *   for (let collection of collections) {
     *     console.log(`Found subcollection with id: ${collection.id}`);
     *   }
     * });
     * ```
     */
    listCollections(): Promise<Array<CollectionReference<firestore.DocumentData>>>;
    /**
     * Create a document with the provided object values. This will fail the write
     * if a document exists at its location.
     *
     * @param {DocumentData} data An object that contains the fields and data to
     * serialize as the document.
     * @throws {Error} If the provided input is not a valid Firestore document.
     * @returns {Promise.<WriteResult>} A Promise that resolves with the
     * write time of this create.
     *
     * @example
     * ```
     * let documentRef = firestore.collection('col').doc();
     *
     * documentRef.create({foo: 'bar'}).then((res) => {
     *   console.log(`Document created at ${res.updateTime}`);
     * }).catch((err) => {
     *   console.log(`Failed to create document: ${err}`);
     * });
     * ```
     */
    create(data: firestore.WithFieldValue<T>): Promise<WriteResult>;
    /**
     * Deletes the document referred to by this `DocumentReference`.
     *
     * A delete for a non-existing document is treated as a success (unless
     * lastUptimeTime is provided).
     *
     * @param {Precondition=} precondition A precondition to enforce for this
     * delete.
     * @param {Timestamp=} precondition.lastUpdateTime If set, enforces that the
     * document was last updated at lastUpdateTime. Fails the delete if the
     * document was last updated at a different time.
     * @param {boolean=} precondition.exists If set, enforces that the target
     * document must or must not exist.
     * @returns {Promise.<WriteResult>} A Promise that resolves with the
     * delete time.
     *
     * @example
     * ```
     * let documentRef = firestore.doc('col/doc');
     *
     * documentRef.delete().then(() => {
     *   console.log('Document successfully deleted.');
     * });
     * ```
     */
    delete(precondition?: firestore.Precondition): Promise<WriteResult>;
    set(data: firestore.PartialWithFieldValue<T>, options: firestore.SetOptions): Promise<WriteResult>;
    set(data: firestore.WithFieldValue<T>): Promise<WriteResult>;
    /**
     * Updates fields in the document referred to by this DocumentReference.
     * If the document doesn't yet exist, the update fails and the returned
     * Promise will be rejected.
     *
     * The update() method accepts either an object with field paths encoded as
     * keys and field values encoded as values, or a variable number of arguments
     * that alternate between field paths and field values.
     *
     * A Precondition restricting this update can be specified as the last
     * argument.
     *
     * @param {UpdateData|string|FieldPath} dataOrField An object containing the
     * fields and values with which to update the document or the path of the
     * first field to update.
     * @param {
     * ...(*|string|FieldPath|Precondition)} preconditionOrValues An alternating
     * list of field paths and values to update or a Precondition to restrict
     * this update.
     * @throws {Error} If the provided input is not valid Firestore data.
     * @returns {Promise.<WriteResult>} A Promise that resolves once the
     * data has been successfully written to the backend.
     *
     * @example
     * ```
     * let documentRef = firestore.doc('col/doc');
     *
     * documentRef.update({foo: 'bar'}).then(res => {
     *   console.log(`Document updated at ${res.updateTime}`);
     * });
     * ```
     */
    update(dataOrField: firestore.UpdateData<T> | string | firestore.FieldPath, ...preconditionOrValues: Array<unknown | string | firestore.FieldPath | firestore.Precondition>): Promise<WriteResult>;
    /**
     * Attaches a listener for DocumentSnapshot events.
     *
     * @param {documentSnapshotCallback} onNext A callback to be called every
     * time a new `DocumentSnapshot` is available.
     * @param {errorCallback=} onError A callback to be called if the listen fails
     * or is cancelled. No further callbacks will occur. If unset, errors will be
     * logged to the console.
     *
     * @returns {function()} An unsubscribe function that can be called to cancel
     * the snapshot listener.
     *
     * @example
     * ```
     * let documentRef = firestore.doc('col/doc');
     *
     * let unsubscribe = documentRef.onSnapshot(documentSnapshot => {
     *   if (documentSnapshot.exists) {
     *     console.log(documentSnapshot.data());
     *   }
     * }, err => {
     *   console.log(`Encountered error: ${err}`);
     * });
     *
     * // Remove this listener.
     * unsubscribe();
     * ```
     */
    onSnapshot(onNext: (snapshot: firestore.DocumentSnapshot<T>) => void, onError?: (error: Error) => void): () => void;
    /**
     * Returns true if this `DocumentReference` is equal to the provided value.
     *
     * @param {*} other The value to compare against.
     * @return {boolean} true if this `DocumentReference` is equal to the provided
     * value.
     */
    isEqual(other: firestore.DocumentReference<T>): boolean;
    /**
     * Converts this DocumentReference to the Firestore Proto representation.
     *
     * @private
     * @internal
     */
    toProto(): api.IValue;
    withConverter(converter: null): DocumentReference<firestore.DocumentData>;
    withConverter<U>(converter: firestore.FirestoreDataConverter<U>): DocumentReference<U>;
}
/**
 * A Query order-by field.
 *
 * @private
 * @internal
 * @class
 */
export declare class FieldOrder {
    readonly field: FieldPath;
    readonly direction: api.StructuredQuery.Direction;
    /**
     * @param field The name of a document field (member) on which to order query
     * results.
     * @param direction One of 'ASCENDING' (default) or 'DESCENDING' to
     * set the ordering direction to ascending or descending, respectively.
     */
    constructor(field: FieldPath, direction?: api.StructuredQuery.Direction);
    /**
     * Generates the proto representation for this field order.
     * @private
     * @internal
     */
    toProto(): api.StructuredQuery.IOrder;
}
declare abstract class FilterInternal {
    /** Returns a list of all field filters that are contained within this filter */
    abstract getFlattenedFilters(): FieldFilterInternal[];
    /** Returns a list of all filters that are contained within this filter */
    abstract getFilters(): FilterInternal[];
    /** Returns the proto representation of this filter */
    abstract toProto(): Filter;
    abstract isEqual(other: FilterInternal): boolean;
}
/**
 * A field constraint for a Query where clause.
 *
 * @private
 * @internal
 * @class
 */
declare class FieldFilterInternal extends FilterInternal {
    private readonly serializer;
    readonly field: FieldPath;
    private readonly op;
    private readonly value;
    getFlattenedFilters(): FieldFilterInternal[];
    getFilters(): FilterInternal[];
    /**
     * @param serializer The Firestore serializer
     * @param field The path of the property value to compare.
     * @param op A comparison operation.
     * @param value The value to which to compare the field for inclusion in a
     * query.
     */
    constructor(serializer: Serializer, field: FieldPath, op: api.StructuredQuery.FieldFilter.Operator, value: unknown);
    /**
     * Returns whether this FieldFilter uses an equals comparison.
     *
     * @private
     * @internal
     */
    isInequalityFilter(): boolean;
    /**
     * Generates the proto representation for this field filter.
     *
     * @private
     * @internal
     */
    toProto(): api.StructuredQuery.IFilter;
    isEqual(other: FilterInternal): boolean;
}
/**
 * A QuerySnapshot contains zero or more
 * [QueryDocumentSnapshot]{@link QueryDocumentSnapshot} objects
 * representing the results of a query. The documents can be accessed as an
 * array via the [documents]{@link QuerySnapshot#documents} property
 * or enumerated using the [forEach]{@link QuerySnapshot#forEach}
 * method. The number of documents can be determined via the
 * [empty]{@link QuerySnapshot#empty} and
 * [size]{@link QuerySnapshot#size} properties.
 *
 * @class QuerySnapshot
 */
export declare class QuerySnapshot<T = firestore.DocumentData> implements firestore.QuerySnapshot<T> {
    private readonly _query;
    private readonly _readTime;
    private readonly _size;
    private _materializedDocs;
    private _materializedChanges;
    private _docs;
    private _changes;
    /**
     * @private
     *
     * @param _query The originating query.
     * @param _readTime The time when this query snapshot was obtained.
     * @param _size The number of documents in the result set.
     * @param docs A callback returning a sorted array of documents matching
     * this query
     * @param changes A callback returning a sorted array of document change
     * events for this snapshot.
     */
    constructor(_query: Query<T>, _readTime: Timestamp, _size: number, docs: () => Array<QueryDocumentSnapshot<T>>, changes: () => Array<DocumentChange<T>>);
    /**
     * The query on which you called get() or onSnapshot() in order to get this
     * QuerySnapshot.
     *
     * @type {Query}
     * @name QuerySnapshot#query
     * @readonly
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.limit(10).get().then(querySnapshot => {
     *   console.log(`Returned first batch of results`);
     *   let query = querySnapshot.query;
     *   return query.offset(10).get();
     * }).then(() => {
     *   console.log(`Returned second batch of results`);
     * });
     * ```
     */
    get query(): Query<T>;
    /**
     * An array of all the documents in this QuerySnapshot.
     *
     * @type {Array.<QueryDocumentSnapshot>}
     * @name QuerySnapshot#docs
     * @readonly
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.get().then(querySnapshot => {
     *   let docs = querySnapshot.docs;
     *   for (let doc of docs) {
     *     console.log(`Document found at path: ${doc.ref.path}`);
     *   }
     * });
     * ```
     */
    get docs(): Array<QueryDocumentSnapshot<T>>;
    /**
     * True if there are no documents in the QuerySnapshot.
     *
     * @type {boolean}
     * @name QuerySnapshot#empty
     * @readonly
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.get().then(querySnapshot => {
     *   if (querySnapshot.empty) {
     *     console.log('No documents found.');
     *   }
     * });
     * ```
     */
    get empty(): boolean;
    /**
     * The number of documents in the QuerySnapshot.
     *
     * @type {number}
     * @name QuerySnapshot#size
     * @readonly
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.get().then(querySnapshot => {
     *   console.log(`Found ${querySnapshot.size} documents.`);
     * });
     * ```
     */
    get size(): number;
    /**
     * The time this query snapshot was obtained.
     *
     * @type {Timestamp}
     * @name QuerySnapshot#readTime
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.get().then((querySnapshot) => {
     *   let readTime = querySnapshot.readTime;
     *   console.log(`Query results returned at '${readTime.toDate()}'`);
     * });
     * ```
     */
    get readTime(): Timestamp;
    /**
     * Returns an array of the documents changes since the last snapshot. If
     * this is the first snapshot, all documents will be in the list as added
     * changes.
     *
     * @return {Array.<DocumentChange>}
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.onSnapshot(querySnapshot => {
     *   let changes = querySnapshot.docChanges();
     *   for (let change of changes) {
     *     console.log(`A document was ${change.type}.`);
     *   }
     * });
     * ```
     */
    docChanges(): Array<DocumentChange<T>>;
    /**
     * Enumerates all of the documents in the QuerySnapshot. This is a convenience
     * method for running the same callback on each {@link QueryDocumentSnapshot}
     * that is returned.
     *
     * @param {function} callback A callback to be called with a
     * [QueryDocumentSnapshot]{@link QueryDocumentSnapshot} for each document in
     * the snapshot.
     * @param {*=} thisArg The `this` binding for the callback..
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Document found at path: ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    forEach(callback: (result: firestore.QueryDocumentSnapshot<T>) => void, thisArg?: unknown): void;
    /**
     * Returns true if the document data in this `QuerySnapshot` is equal to the
     * provided value.
     *
     * @param {*} other The value to compare against.
     * @return {boolean} true if this `QuerySnapshot` is equal to the provided
     * value.
     */
    isEqual(other: firestore.QuerySnapshot<T>): boolean;
}
/** Internal representation of a query cursor before serialization. */
interface QueryCursor {
    before: boolean;
    values: api.IValue[];
}
/*!
 * Denotes whether a provided limit is applied to the beginning or the end of
 * the result set.
 */
declare enum LimitType {
    First = 0,
    Last = 1
}
/**
 * Internal class representing custom Query options.
 *
 * These options are immutable. Modified options can be created using `with()`.
 * @private
 * @internal
 */
export declare class QueryOptions<T> {
    readonly parentPath: ResourcePath;
    readonly collectionId: string;
    readonly converter: firestore.FirestoreDataConverter<T>;
    readonly allDescendants: boolean;
    readonly filters: FilterInternal[];
    readonly fieldOrders: FieldOrder[];
    readonly startAt?: QueryCursor | undefined;
    readonly endAt?: QueryCursor | undefined;
    readonly limit?: number | undefined;
    readonly limitType?: LimitType | undefined;
    readonly offset?: number | undefined;
    readonly projection?: api.StructuredQuery.IProjection | undefined;
    readonly kindless: boolean;
    readonly requireConsistency: boolean;
    constructor(parentPath: ResourcePath, collectionId: string, converter: firestore.FirestoreDataConverter<T>, allDescendants: boolean, filters: FilterInternal[], fieldOrders: FieldOrder[], startAt?: QueryCursor | undefined, endAt?: QueryCursor | undefined, limit?: number | undefined, limitType?: LimitType | undefined, offset?: number | undefined, projection?: api.StructuredQuery.IProjection | undefined, kindless?: boolean, requireConsistency?: boolean);
    /**
     * Returns query options for a collection group query.
     * @private
     * @internal
     */
    static forCollectionGroupQuery<T = firestore.DocumentData>(collectionId: string, converter?: firestore.FirestoreDataConverter<T>): QueryOptions<T>;
    /**
     * Returns query options for a single-collection query.
     * @private
     * @internal
     */
    static forCollectionQuery<T = firestore.DocumentData>(collectionRef: ResourcePath, converter?: firestore.FirestoreDataConverter<T>): QueryOptions<T>;
    /**
     * Returns query options for a query that fetches all descendants under the
     * specified reference.
     *
     * @private
     * @internal
     */
    static forKindlessAllDescendants<T = firestore.DocumentData>(parent: ResourcePath, id: string, requireConsistency?: boolean): QueryOptions<T>;
    /**
     * Returns the union of the current and the provided options.
     * @private
     * @internal
     */
    with(settings: Partial<Omit<QueryOptions<T>, 'converter'>>): QueryOptions<T>;
    withConverter<U>(converter: firestore.FirestoreDataConverter<U>): QueryOptions<U>;
    hasFieldOrders(): boolean;
    isEqual(other: QueryOptions<T>): boolean;
    private filtersEqual;
}
/**
 * A Query refers to a query which you can read or stream from. You can also
 * construct refined Query objects by adding filters and ordering.
 *
 * @class Query
 */
export declare class Query<T = firestore.DocumentData> implements firestore.Query<T> {
    /** @private */
    readonly _firestore: Firestore;
    /** @private */
    protected readonly _queryOptions: QueryOptions<T>;
    private readonly _serializer;
    /** @private */
    protected readonly _allowUndefined: boolean;
    /**
     * @private
     *
     * @param _firestore The Firestore Database client.
     * @param _queryOptions Options that define the query.
     */
    constructor(
    /** @private */
    _firestore: Firestore, 
    /** @private */
    _queryOptions: QueryOptions<T>);
    /**
     * Extracts field values from the DocumentSnapshot based on the provided
     * field order.
     *
     * @private
     * @internal
     * @param documentSnapshot The document to extract the fields from.
     * @param fieldOrders The field order that defines what fields we should
     * extract.
     * @return {Array.<*>} The field values to use.
     * @private
     * @internal
     */
    static _extractFieldValues(documentSnapshot: DocumentSnapshot, fieldOrders: FieldOrder[]): unknown[];
    /**
     * The [Firestore]{@link Firestore} instance for the Firestore
     * database (useful for performing transactions, etc.).
     *
     * @type {Firestore}
     * @name Query#firestore
     * @readonly
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col');
     *
     * collectionRef.add({foo: 'bar'}).then(documentReference => {
     *   let firestore = documentReference.firestore;
     *   console.log(`Root location for document is ${firestore.formattedName}`);
     * });
     * ```
     */
    get firestore(): Firestore;
    /**
     * Creates and returns a new [Query]{@link Query} with the additional filter
     * that documents must contain the specified field and that its value should
     * satisfy the relation constraint provided.
     *
     * This function returns a new (immutable) instance of the Query (rather than
     * modify the existing instance) to impose the filter.
     *
     * @param {string|FieldPath} fieldPath The name of a property value to compare.
     * @param {string} opStr A comparison operation in the form of a string.
     * Acceptable operator strings are "<", "<=", "==", "!=", ">=", ">", "array-contains",
     * "in", "not-in", and "array-contains-any".
     * @param {*} value The value to which to compare the field for inclusion in
     * a query.
     * @returns {Query} The created Query.
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col');
     *
     * collectionRef.where('foo', '==', 'bar').get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    where(fieldPath: string | firestore.FieldPath, opStr: firestore.WhereFilterOp, value: unknown): Query<T>;
    /**
     * Creates and returns a new [Query]{@link Query} with the additional filter
     * that documents should satisfy the relation constraint(s) provided.
     *
     * This function returns a new (immutable) instance of the Query (rather than
     * modify the existing instance) to impose the filter.
     *
     * @param {Filter} filter A unary or composite filter to apply to the Query.
     * @returns {Query} The created Query.
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col');
     *
     * collectionRef.where(Filter.and(Filter.where('foo', '==', 'bar'), Filter.where('foo', '!=', 'baz'))).get()
     *   .then(querySnapshot => {
     *     querySnapshot.forEach(documentSnapshot => {
     *       console.log(`Found document at ${documentSnapshot.ref.path}`);
     *     });
     * });
     * ```
     */
    where(filter: Filter): Query<T>;
    _parseFilter(filter: Filter): FilterInternal;
    _parseFieldFilter(fieldFilterData: UnaryFilter): FieldFilterInternal;
    _parseCompositeFilter(compositeFilterData: CompositeFilter): FilterInternal;
    /**
     * Creates and returns a new [Query]{@link Query} instance that applies a
     * field mask to the result and returns only the specified subset of fields.
     * You can specify a list of field paths to return, or use an empty list to
     * only return the references of matching documents.
     *
     * Queries that contain field masks cannot be listened to via `onSnapshot()`
     * listeners.
     *
     * This function returns a new (immutable) instance of the Query (rather than
     * modify the existing instance) to impose the field mask.
     *
     * @param {...(string|FieldPath)} fieldPaths The field paths to return.
     * @returns {Query} The created Query.
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col');
     * let documentRef = collectionRef.doc('doc');
     *
     * return documentRef.set({x:10, y:5}).then(() => {
     *   return collectionRef.where('x', '>', 5).select('y').get();
     * }).then((res) => {
     *   console.log(`y is ${res.docs[0].get('y')}.`);
     * });
     * ```
     */
    select(...fieldPaths: Array<string | FieldPath>): Query<firestore.DocumentData>;
    /**
     * Creates and returns a new [Query]{@link Query} that's additionally sorted
     * by the specified field, optionally in descending order instead of
     * ascending.
     *
     * This function returns a new (immutable) instance of the Query (rather than
     * modify the existing instance) to impose the field mask.
     *
     * @param {string|FieldPath} fieldPath The field to sort by.
     * @param {string=} directionStr Optional direction to sort by ('asc' or
     * 'desc'). If not specified, order will be ascending.
     * @returns {Query} The created Query.
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '>', 42);
     *
     * query.orderBy('foo', 'desc').get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    orderBy(fieldPath: string | firestore.FieldPath, directionStr?: firestore.OrderByDirection): Query<T>;
    /**
     * Creates and returns a new [Query]{@link Query} that only returns the
     * first matching documents.
     *
     * This function returns a new (immutable) instance of the Query (rather than
     * modify the existing instance) to impose the limit.
     *
     * @param {number} limit The maximum number of items to return.
     * @returns {Query} The created Query.
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '>', 42);
     *
     * query.limit(1).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    limit(limit: number): Query<T>;
    /**
     * Creates and returns a new [Query]{@link Query} that only returns the
     * last matching documents.
     *
     * You must specify at least one orderBy clause for limitToLast queries,
     * otherwise an exception will be thrown during execution.
     *
     * Results for limitToLast queries cannot be streamed via the `stream()` API.
     *
     * @param limit The maximum number of items to return.
     * @return The created Query.
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '>', 42);
     *
     * query.limitToLast(1).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Last matching document is ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    limitToLast(limit: number): Query<T>;
    /**
     * Specifies the offset of the returned results.
     *
     * This function returns a new (immutable) instance of the
     * [Query]{@link Query} (rather than modify the existing instance)
     * to impose the offset.
     *
     * @param {number} offset The offset to apply to the Query results
     * @returns {Query} The created Query.
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '>', 42);
     *
     * query.limit(10).offset(20).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    offset(offset: number): Query<T>;
    /**
     * Returns a query that counts the documents in the result set of this
     * query.
     *
     * The returned query, when executed, counts the documents in the result set
     * of this query without actually downloading the documents.
     *
     * Using the returned query to count the documents is efficient because only
     * the final count, not the documents' data, is downloaded. The returned
     * query can even count the documents if the result set would be
     * prohibitively large to download entirely (e.g. thousands of documents).
     *
     * @return a query that counts the documents in the result set of this
     * query. The count can be retrieved from `snapshot.data().count`, where
     * `snapshot` is the `AggregateQuerySnapshot` resulting from running the
     * returned query.
     */
    count(): AggregateQuery<{
        count: firestore.AggregateField<number>;
    }>;
    /**
     * Returns true if this `Query` is equal to the provided value.
     *
     * @param {*} other The value to compare against.
     * @return {boolean} true if this `Query` is equal to the provided value.
     */
    isEqual(other: firestore.Query<T>): boolean;
    /**
     * Returns the sorted array of inequality filter fields used in this query.
     *
     * @return An array of inequality filter fields sorted lexicographically by FieldPath.
     */
    private getInequalityFilterFields;
    /**
     * Computes the backend ordering semantics for DocumentSnapshot cursors.
     *
     * @private
     * @internal
     * @param cursorValuesOrDocumentSnapshot The snapshot of the document or the
     * set of field values to use as the boundary.
     * @returns The implicit ordering semantics.
     */
    private createImplicitOrderBy;
    /**
     * Builds a Firestore 'Position' proto message.
     *
     * @private
     * @internal
     * @param {Array.<FieldOrder>} fieldOrders The field orders to use for this
     * cursor.
     * @param {Array.<DocumentSnapshot|*>} cursorValuesOrDocumentSnapshot The
     * snapshot of the document or the set of field values to use as the boundary.
     * @param before Whether the query boundary lies just before or after the
     * provided data.
     * @returns {Object} The proto message.
     */
    private createCursor;
    /**
     * Validates that a value used with FieldValue.documentId() is either a
     * string or a DocumentReference that is part of the query`s result set.
     * Throws a validation error or returns a DocumentReference that can
     * directly be used in the Query.
     *
     * @param val The value to validate.
     * @throws If the value cannot be used for this query.
     * @return If valid, returns a DocumentReference that can be used with the
     * query.
     * @private
     * @internal
     */
    private validateReference;
    /**
     * Creates and returns a new [Query]{@link Query} that starts at the provided
     * set of field values relative to the order of the query. The order of the
     * provided values must match the order of the order by clauses of the query.
     *
     * @param {...*|DocumentSnapshot} fieldValuesOrDocumentSnapshot The snapshot
     * of the document the query results should start at or the field values to
     * start this query at, in order of the query's order by.
     * @returns {Query} A query with the new starting point.
     *
     * @example
     * ```
     * let query = firestore.collection('col');
     *
     * query.orderBy('foo').startAt(42).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    startAt(...fieldValuesOrDocumentSnapshot: Array<firestore.DocumentSnapshot<unknown> | unknown>): Query<T>;
    /**
     * Creates and returns a new [Query]{@link Query} that starts after the
     * provided set of field values relative to the order of the query. The order
     * of the provided values must match the order of the order by clauses of the
     * query.
     *
     * @param {...*|DocumentSnapshot} fieldValuesOrDocumentSnapshot The snapshot
     * of the document the query results should start after or the field values to
     * start this query after, in order of the query's order by.
     * @returns {Query} A query with the new starting point.
     *
     * @example
     * ```
     * let query = firestore.collection('col');
     *
     * query.orderBy('foo').startAfter(42).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    startAfter(...fieldValuesOrDocumentSnapshot: Array<firestore.DocumentSnapshot<unknown> | unknown>): Query<T>;
    /**
     * Creates and returns a new [Query]{@link Query} that ends before the set of
     * field values relative to the order of the query. The order of the provided
     * values must match the order of the order by clauses of the query.
     *
     * @param {...*|DocumentSnapshot} fieldValuesOrDocumentSnapshot The snapshot
     * of the document the query results should end before or the field values to
     * end this query before, in order of the query's order by.
     * @returns {Query} A query with the new ending point.
     *
     * @example
     * ```
     * let query = firestore.collection('col');
     *
     * query.orderBy('foo').endBefore(42).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    endBefore(...fieldValuesOrDocumentSnapshot: Array<firestore.DocumentSnapshot<unknown> | unknown>): Query<T>;
    /**
     * Creates and returns a new [Query]{@link Query} that ends at the provided
     * set of field values relative to the order of the query. The order of the
     * provided values must match the order of the order by clauses of the query.
     *
     * @param {...*|DocumentSnapshot} fieldValuesOrDocumentSnapshot The snapshot
     * of the document the query results should end at or the field values to end
     * this query at, in order of the query's order by.
     * @returns {Query} A query with the new ending point.
     *
     * @example
     * ```
     * let query = firestore.collection('col');
     *
     * query.orderBy('foo').endAt(42).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    endAt(...fieldValuesOrDocumentSnapshot: Array<firestore.DocumentSnapshot<unknown> | unknown>): Query<T>;
    /**
     * Executes the query and returns the results as a
     * [QuerySnapshot]{@link QuerySnapshot}.
     *
     * @returns {Promise.<QuerySnapshot>} A Promise that resolves with the results
     * of the Query.
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * query.get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    get(): Promise<QuerySnapshot<T>>;
    /**
     * Internal get() method that accepts an optional transaction id.
     *
     * @private
     * @internal
     * @param {bytes=} transactionId A transaction ID.
     */
    _get(transactionId?: Uint8Array): Promise<QuerySnapshot<T>>;
    /**
     * Executes the query and streams the results as
     * [QueryDocumentSnapshots]{@link QueryDocumentSnapshot}.
     *
     * @returns {Stream.<QueryDocumentSnapshot>} A stream of
     * QueryDocumentSnapshots.
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * let count = 0;
     *
     * query.stream().on('data', (documentSnapshot) => {
     *   console.log(`Found document with name '${documentSnapshot.id}'`);
     *   ++count;
     * }).on('end', () => {
     *   console.log(`Total count is ${count}`);
     * });
     * ```
     */
    stream(): NodeJS.ReadableStream;
    /**
     * Converts a QueryCursor to its proto representation.
     *
     * @param cursor The original cursor value
     * @private
     * @internal
     */
    private toCursor;
    /**
     * Internal method for serializing a query to its RunQuery proto
     * representation with an optional transaction id or read time.
     *
     * @param transactionIdOrReadTime A transaction ID or the read time at which
     * to execute the query.
     * @private
     * @internal
     * @returns Serialized JSON for the query.
     */
    toProto(transactionIdOrReadTime?: Uint8Array | Timestamp): api.IRunQueryRequest;
    /**
     * Converts current Query to an IBundledQuery.
     *
     * @private
     * @internal
     */
    _toBundledQuery(): protos.firestore.IBundledQuery;
    private toStructuredQuery;
    _isPermanentRpcError(err: GoogleError, methodName: string): boolean;
    /**
     * Internal streaming method that accepts an optional transaction ID.
     *
     * @param transactionId A transaction ID.
     * @private
     * @internal
     * @returns A stream of document results.
     */
    _stream(transactionId?: Uint8Array): NodeJS.ReadableStream;
    /**
     * Attaches a listener for QuerySnapshot events.
     *
     * @param {querySnapshotCallback} onNext A callback to be called every time
     * a new [QuerySnapshot]{@link QuerySnapshot} is available.
     * @param {errorCallback=} onError A callback to be called if the listen
     * fails or is cancelled. No further callbacks will occur.
     *
     * @returns {function()} An unsubscribe function that can be called to cancel
     * the snapshot listener.
     *
     * @example
     * ```
     * let query = firestore.collection('col').where('foo', '==', 'bar');
     *
     * let unsubscribe = query.onSnapshot(querySnapshot => {
     *   console.log(`Received query snapshot of size ${querySnapshot.size}`);
     * }, err => {
     *   console.log(`Encountered error: ${err}`);
     * });
     *
     * // Remove this listener.
     * unsubscribe();
     * ```
     */
    onSnapshot(onNext: (snapshot: firestore.QuerySnapshot<T>) => void, onError?: (error: Error) => void): () => void;
    /**
     * Returns a function that can be used to sort QueryDocumentSnapshots
     * according to the sort criteria of this query.
     *
     * @private
     * @internal
     */
    comparator(): (s1: QueryDocumentSnapshot<T>, s2: QueryDocumentSnapshot<T>) => number;
    withConverter(converter: null): Query<firestore.DocumentData>;
    withConverter<U>(converter: firestore.FirestoreDataConverter<U>): Query<U>;
}
/**
 * A CollectionReference object can be used for adding documents, getting
 * document references, and querying for documents (using the methods
 * inherited from [Query]{@link Query}).
 *
 * @class CollectionReference
 * @extends Query
 */
export declare class CollectionReference<T = firestore.DocumentData> extends Query<T> implements firestore.CollectionReference<T> {
    /**
     * @private
     *
     * @param firestore The Firestore Database client.
     * @param path The Path of this collection.
     */
    constructor(firestore: Firestore, path: ResourcePath, converter?: firestore.FirestoreDataConverter<T>);
    /**
     * Returns a resource path for this collection.
     * @private
     * @internal
     */
    get _resourcePath(): ResourcePath;
    /**
     * The last path element of the referenced collection.
     *
     * @type {string}
     * @name CollectionReference#id
     * @readonly
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col/doc/subcollection');
     * console.log(`ID of the subcollection: ${collectionRef.id}`);
     * ```
     */
    get id(): string;
    /**
     * A reference to the containing Document if this is a subcollection, else
     * null.
     *
     * @type {DocumentReference|null}
     * @name CollectionReference#parent
     * @readonly
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col/doc/subcollection');
     * let documentRef = collectionRef.parent;
     * console.log(`Parent name: ${documentRef.path}`);
     * ```
     */
    get parent(): DocumentReference<firestore.DocumentData> | null;
    /**
     * A string representing the path of the referenced collection (relative
     * to the root of the database).
     *
     * @type {string}
     * @name CollectionReference#path
     * @readonly
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col/doc/subcollection');
     * console.log(`Path of the subcollection: ${collectionRef.path}`);
     * ```
     */
    get path(): string;
    /**
     * Retrieves the list of documents in this collection.
     *
     * The document references returned may include references to "missing
     * documents", i.e. document locations that have no document present but
     * which contain subcollections with documents. Attempting to read such a
     * document reference (e.g. via `.get()` or `.onSnapshot()`) will return a
     * `DocumentSnapshot` whose `.exists` property is false.
     *
     * @return {Promise<DocumentReference[]>} The list of documents in this
     * collection.
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col');
     *
     * return collectionRef.listDocuments().then(documentRefs => {
     *    return firestore.getAll(...documentRefs);
     * }).then(documentSnapshots => {
     *    for (let documentSnapshot of documentSnapshots) {
     *       if (documentSnapshot.exists) {
     *         console.log(`Found document with data: ${documentSnapshot.id}`);
     *       } else {
     *         console.log(`Found missing document: ${documentSnapshot.id}`);
     *       }
     *    }
     * });
     * ```
     */
    listDocuments(): Promise<Array<DocumentReference<T>>>;
    doc(): DocumentReference<T>;
    doc(documentPath: string): DocumentReference<T>;
    /**
     * Add a new document to this collection with the specified data, assigning
     * it a document ID automatically.
     *
     * @param {DocumentData} data An Object containing the data for the new
     * document.
     * @throws {Error} If the provided input is not a valid Firestore document.
     * @returns {Promise.<DocumentReference>} A Promise resolved with a
     * [DocumentReference]{@link DocumentReference} pointing to the
     * newly created document.
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col');
     * collectionRef.add({foo: 'bar'}).then(documentReference => {
     *   console.log(`Added document with name: ${documentReference.id}`);
     * });
     * ```
     */
    add(data: firestore.WithFieldValue<T>): Promise<DocumentReference<T>>;
    /**
     * Returns true if this `CollectionReference` is equal to the provided value.
     *
     * @param {*} other The value to compare against.
     * @return {boolean} true if this `CollectionReference` is equal to the
     * provided value.
     */
    isEqual(other: firestore.CollectionReference<T>): boolean;
    withConverter(converter: null): CollectionReference<firestore.DocumentData>;
    withConverter<U>(converter: firestore.FirestoreDataConverter<U>): CollectionReference<U>;
}
/**
 * A query that calculates aggregations over an underlying query.
 */
export declare class AggregateQuery<T extends firestore.AggregateSpec> implements firestore.AggregateQuery<T> {
    private readonly _query;
    private readonly _aggregates;
    /**
     * @private
     * @internal
     *
     * @param _query The query whose aggregations will be calculated by this
     * object.
     * @param _aggregates The aggregations that will be performed by this query.
     */
    constructor(_query: Query<any>, _aggregates: T);
    /** The query whose aggregations will be calculated by this object. */
    get query(): firestore.Query<unknown>;
    /**
     * Executes this query.
     *
     * @return A promise that will be resolved with the results of the query.
     */
    get(): Promise<AggregateQuerySnapshot<T>>;
    /**
     * Internal get() method that accepts an optional transaction id.
     *
     * @private
     * @internal
     * @param {bytes=} transactionId A transaction ID.
     */
    _get(transactionId?: Uint8Array): Promise<AggregateQuerySnapshot<T>>;
    /**
     * Internal streaming method that accepts an optional transaction ID.
     *
     * @private
     * @internal
     * @param transactionId A transaction ID.
     * @returns A stream of document results.
     */
    _stream(transactionId?: Uint8Array): Readable;
    /**
     * Internal method to decode values within result.
     * @private
     */
    private decodeResult;
    /**
     * Internal method for serializing a query to its RunAggregationQuery proto
     * representation with an optional transaction id.
     *
     * @private
     * @internal
     * @returns Serialized JSON for the query.
     */
    toProto(transactionId?: Uint8Array): api.IRunAggregationQueryRequest;
    /**
     * Compares this object with the given object for equality.
     *
     * This object is considered "equal" to the other object if and only if
     * `other` performs the same aggregations as this `AggregateQuery` and
     * the underlying Query of `other` compares equal to that of this object
     * using `Query.isEqual()`.
     *
     * @param other The object to compare to this object for equality.
     * @return `true` if this object is "equal" to the given object, as
     * defined above, or `false` otherwise.
     */
    isEqual(other: firestore.AggregateQuery<T>): boolean;
}
/**
 * The results of executing an aggregation query.
 */
export declare class AggregateQuerySnapshot<T extends firestore.AggregateSpec> implements firestore.AggregateQuerySnapshot<T> {
    private readonly _query;
    private readonly _readTime;
    private readonly _data;
    /**
     * @private
     * @internal
     *
     * @param _query The query that was executed to produce this result.
     * @param _readTime The time this snapshot was read.
     * @param _data The results of the aggregations performed over the underlying
     * query.
     */
    constructor(_query: AggregateQuery<T>, _readTime: Timestamp, _data: firestore.AggregateSpecData<T>);
    /** The query that was executed to produce this result. */
    get query(): firestore.AggregateQuery<T>;
    /** The time this snapshot was read. */
    get readTime(): firestore.Timestamp;
    /**
     * Returns the results of the aggregations performed over the underlying
     * query.
     *
     * The keys of the returned object will be the same as those of the
     * `AggregateSpec` object specified to the aggregation method, and the
     * values will be the corresponding aggregation result.
     *
     * @returns The results of the aggregations performed over the underlying
     * query.
     */
    data(): firestore.AggregateSpecData<T>;
    /**
     * Compares this object with the given object for equality.
     *
     * Two `AggregateQuerySnapshot` instances are considered "equal" if they
     * have the same data and their underlying queries compare "equal" using
     * `AggregateQuery.isEqual()`.
     *
     * @param other The object to compare to this object for equality.
     * @return `true` if this object is "equal" to the given object, as
     * defined above, or `false` otherwise.
     */
    isEqual(other: firestore.AggregateQuerySnapshot<T>): boolean;
}
/**
 * Validates the input string as a field order direction.
 *
 * @private
 * @internal
 * @param arg The argument name or argument index (for varargs methods).
 * @param op Order direction to validate.
 * @throws when the direction is invalid
 * @return a validated input value, which may be different from the provided
 * value.
 */
export declare function validateQueryOrder(arg: string, op: unknown): firestore.OrderByDirection | undefined;
/**
 * Validates the input string as a field comparison operator.
 *
 * @private
 * @internal
 * @param arg The argument name or argument index (for varargs methods).
 * @param op Field comparison operator to validate.
 * @param fieldValue Value that is used in the filter.
 * @throws when the comparison operation is invalid
 * @return a validated input value, which may be different from the provided
 * value.
 */
export declare function validateQueryOperator(arg: string | number, op: unknown, fieldValue: unknown): firestore.WhereFilterOp;
/**
 * Validates that 'value' is a DocumentReference.
 *
 * @private
 * @internal
 * @param arg The argument name or argument index (for varargs methods).
 * @param value The argument to validate.
 * @return the DocumentReference if valid
 */
export declare function validateDocumentReference(arg: string | number, value: unknown): DocumentReference;
export {};
