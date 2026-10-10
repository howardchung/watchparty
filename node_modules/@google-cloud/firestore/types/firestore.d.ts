/*!
 * Copyright 2020 Google LLC
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

// We deliberately use `any` in the external API to not impose type-checking
// on end users.
/* eslint-disable @typescript-eslint/no-explicit-any */

// Declare a global (ambient) namespace
// (used when not using import statement, but just script include).
declare namespace FirebaseFirestore {
  /** Alias for `any` but used where a Firestore field value would be provided. */
  export type DocumentFieldValue = any;

  /**
   * Document data (for use with `DocumentReference.set()`) consists of fields
   * mapped to values.
   */
  export type DocumentData = {[field: string]: DocumentFieldValue};

  /**
   * Similar to Typescript's `Partial<T>`, but allows nested fields to be
   * omitted and FieldValues to be passed in as property values.
   */
  export type PartialWithFieldValue<T> =
    | Partial<T>
    | (T extends Primitive
        ? T
        : T extends {}
        ? {[K in keyof T]?: PartialWithFieldValue<T[K]> | FieldValue}
        : never);

  /**
   * Allows FieldValues to be passed in as a property value while maintaining
   * type safety.
   */
  export type WithFieldValue<T> =
    | T
    | (T extends Primitive
        ? T
        : T extends {}
        ? {[K in keyof T]: WithFieldValue<T[K]> | FieldValue}
        : never);

  /**
   * Update data (for use with [update]{@link DocumentReference#update})
   * that contains paths mapped to values. Fields that contain dots reference
   * nested fields within the document. FieldValues can be passed in
   * as property values.
   *
   * You can update a top-level field in your document by using the field name
   * as a key (e.g. `foo`). The provided value completely replaces the contents
   * for this field.
   *
   * You can also update a nested field directly by using its field path as a
   * key (e.g. `foo.bar`). This nested field update replaces the contents at
   * `bar` but does not modify other data under `foo`.
   */
  export type UpdateData<T> = T extends Primitive
    ? T
    : T extends {}
    ? {[K in keyof T]?: UpdateData<T[K]> | FieldValue} & NestedUpdateFields<T>
    : Partial<T>;

  /** Primitive types. */
  export type Primitive = string | number | boolean | undefined | null;

  /**
   * For each field (e.g. 'bar'), find all nested keys (e.g. {'bar.baz': T1,
   * 'bar.qux': T2}). Intersect them together to make a single map containing
   * all possible keys that are all marked as optional
   */
  export type NestedUpdateFields<T extends Record<string, unknown>> =
    UnionToIntersection<
      {
        [K in keyof T & string]: ChildUpdateFields<K, T[K]>;
      }[keyof T & string] // Also include the generated prefix-string keys.
    >;

  /**
   * Helper for calculating the nested fields for a given type T1. This is needed
   * to distribute union types such as `undefined | {...}` (happens for optional
   * props) or `{a: A} | {b: B}`.
   *
   * In this use case, `V` is used to distribute the union types of `T[K]` on
   * `Record`, since `T[K]` is evaluated as an expression and not distributed.
   *
   * See https://www.typescriptlang.org/docs/handbook/advanced-types.html#distributive-conditional-types
   */
  export type ChildUpdateFields<K extends string, V> =
    // Only allow nesting for map values
    V extends Record<string, unknown>
      ? // Recurse into the map and add the prefix in front of each key
        // (e.g. Prefix 'bar.' to create: 'bar.baz' and 'bar.qux'.
        AddPrefixToKeys<K, UpdateData<V>>
      : // UpdateData is always a map of values.
        never;

  /**
   * Returns a new map where every key is prefixed with the outer key appended
   * to a dot.
   */
  export type AddPrefixToKeys<
    Prefix extends string,
    T extends Record<string, unknown>
  > =
    // Remap K => Prefix.K. See https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as
    {[K in keyof T & string as `${Prefix}.${K}`]+?: T[K]};

  /**
   * Given a union type `U = T1 | T2 | ...`, returns an intersected type
   * `(T1 & T2 & ...)`.
   *
   * Uses distributive conditional types and inference from conditional types.
   * This works because multiple candidates for the same type variable in
   * contra-variant positions causes an intersection type to be inferred.
   * https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-inference-in-conditional-types
   * https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
   */
  export type UnionToIntersection<U> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  /**
   * Sets or disables the log function for all active Firestore instances.
   *
   * @param logger A log function that takes a message (such as `console.log`) or
   * `null` to turn off logging.
   */
  function setLogFunction(logger: ((msg: string) => void) | null): void;

  /**
   * Converter used by `withConverter()` to transform user objects of type T
   * into Firestore data.
   *
   * Using the converter allows you to specify generic type arguments when
   * storing and retrieving objects from Firestore.
   *
   * @example
   * class Post {
   *   constructor(readonly title: string, readonly author: string) {}
   *
   *   toString(): string {
   *     return this.title + ', by ' + this.author;
   *   }
   * }
   *
   * const postConverter = {
   *   toFirestore(post: Post): FirebaseFirestore.DocumentData {
   *     return {title: post.title, author: post.author};
   *   },
   *   fromFirestore(
   *     snapshot: FirebaseFirestore.QueryDocumentSnapshot
   *   ): Post {
   *     const data = snapshot.data();
   *     return new Post(data.title, data.author);
   *   }
   * };
   *
   * const postSnap = await Firestore()
   *   .collection('posts')
   *   .withConverter(postConverter)
   *   .doc().get();
   * const post = postSnap.data();
   * if (post !== undefined) {
   *   post.title; // string
   *   post.toString(); // Should be defined
   *   post.someNonExistentProperty; // TS error
   * }
   */
  export interface FirestoreDataConverter<T> {
    /**
     * Called by the Firestore SDK to convert a custom model object of type T
     * into a plain Javascript object (suitable for writing directly to the
     * Firestore database). To use set() with `merge` and `mergeFields`,
     * toFirestore() must be defined with `Partial<T>`.
     *
     * The `WithFieldValue<T>` type extends `T` to also allow FieldValues such
     * as `FieldValue.delete()` to be used as property values.
     */
    toFirestore(modelObject: WithFieldValue<T>): DocumentData;

    /**
     * Called by the Firestore SDK to convert a custom model object of type T
     * into a plain Javascript object (suitable for writing directly to the
     * Firestore database). To use set() with `merge` and `mergeFields`,
     * toFirestore() must be defined with `Partial<T>`.
     *
     * The `PartialWithFieldValue<T>` type extends `Partial<T>` to allow
     * FieldValues such as `FieldValue.delete()` to be used as property values.
     * It also supports nested `Partial` by allowing nested fields to be
     * omitted.
     */
    toFirestore(
      modelObject: PartialWithFieldValue<T>,
      options: SetOptions
    ): DocumentData;

    /**
     * Called by the Firestore SDK to convert Firestore data into an object of
     * type T.
     */
    fromFirestore(snapshot: QueryDocumentSnapshot): T;
  }

  /**
   * Settings used to directly configure a `Firestore` instance.
   */
  export interface Settings {
    /**
     * The project ID from the Google Developer's Console, e.g.
     * 'grape-spaceship-123'. We will also check the environment variable
     * GCLOUD_PROJECT for your project ID.  Can be omitted in environments that
     * support {@link https://cloud.google.com/docs/authentication Application
     * Default Credentials}
     */
    projectId?: string;

    /**
     * The database name. If omitted, the default database will be used.
     */
    databaseId?: string;

    /** The hostname to connect to. */
    host?: string;

    /** The port to connect to. */
    port?: number;

    /**
     * Local file containing the Service Account credentials as downloaded from
     * the Google Developers Console. Can  be omitted in environments that
     * support {@link https://cloud.google.com/docs/authentication Application
     * Default Credentials}. To configure Firestore with custom credentials, use
     * the `credentials` property to provide the `client_email` and
     * `private_key` of your service account.
     */
    keyFilename?: string;

    /**
     * The 'client_email' and 'private_key' properties of the service account
     * to use with your Firestore project. Can be omitted in environments that
     * support {@link https://cloud.google.com/docs/authentication Application
     * Default Credentials}. If your credentials are stored in a JSON file, you
     * can specify a `keyFilename` instead.
     */
    credentials?: {client_email?: string; private_key?: string};

    /** Whether to use SSL when connecting. */
    ssl?: boolean;

    /**
     * The maximum number of idle GRPC channels to keep. A smaller number of idle
     * channels reduces memory usage but increases request latency for clients
     * with fluctuating request rates. If set to 0, shuts down all GRPC channels
     * when the client becomes idle. Defaults to 1.
     */
    maxIdleChannels?: number;

    /**
     * Whether to use `BigInt` for integer types when deserializing Firestore
     * Documents. Regardless of magnitude, all integer values are returned as
     * `BigInt` to match the precision of the Firestore backend. Floating point
     * numbers continue to use JavaScript's `number` type.
     */
    useBigInt?: boolean;

    /**
     * Whether to skip nested properties that are set to `undefined` during
     * object serialization. If set to `true`, these properties are skipped
     * and not written to Firestore. If set `false` or omitted, the SDK throws
     * an exception when it encounters properties of type `undefined`.
     */
    ignoreUndefinedProperties?: boolean;

    /**
     * Whether to force the use of HTTP/1.1 REST transport until a method that requires gRPC
     * is called. When a method requires gRPC, this Firestore client will load dependent gRPC
     * libraries and then use gRPC transport for communication from that point forward.
     * Currently the only operation that requires gRPC is creating a snapshot listener with
     * the method `DocumentReference<T>.onSnapshot()`, `CollectionReference<T>.onSnapshot()`,
     * or `Query<T>.onSnapshot()`.
     */
    preferRest?: boolean;

    [key: string]: any; // Accept other properties, such as GRPC settings.
  }

  /** Options to configure a read-only transaction. */
  export interface ReadOnlyTransactionOptions {
    /** Set to true to indicate a read-only transaction. */
    readOnly: true;
    /**
     * If specified, documents are read at the given time. This may not be more
     * than 60 seconds in the past from when the request is processed by the
     * server.
     */
    readTime?: Timestamp;
  }

  /** Options to configure a read-write transaction. */
  export interface ReadWriteTransactionOptions {
    /** Set to false or omit to indicate a read-write transaction. */
    readOnly?: false;
    /**
     * The maximum number of attempts for this transaction. Defaults to 5.
     */
    maxAttempts?: number;
  }

  /**
   * `Firestore` represents a Firestore Database and is the entry point for all
   * Firestore operations.
   */
  export class Firestore {
    /**
     * @param settings Configuration object. See [Firestore Documentation]
     * {@link https://firebase.google.com/docs/firestore/}
     */
    public constructor(settings?: Settings);

    /**
     * Specifies custom settings to be used to configure the `Firestore`
     * instance. Can only be invoked once and before any other Firestore
     * method.
     *
     * If settings are provided via both `settings()` and the `Firestore`
     * constructor, both settings objects are merged and any settings provided
     * via `settings()` take precedence.
     *
     * @param {object} settings The settings to use for all Firestore
     * operations.
     */
    settings(settings: Settings): void;

    /**
     * Gets a `CollectionReference` instance that refers to the collection at
     * the specified path.
     *
     * @param collectionPath A slash-separated path to a collection.
     * @return The `CollectionReference` instance.
     */
    collection(collectionPath: string): CollectionReference<DocumentData>;

    /**
     * Gets a `DocumentReference` instance that refers to the document at the
     * specified path.
     *
     * @param documentPath A slash-separated path to a document.
     * @return The `DocumentReference` instance.
     */
    doc(documentPath: string): DocumentReference<DocumentData>;

    /**
     * Creates and returns a new Query that includes all documents in the
     * database that are contained in a collection or subcollection with the
     * given collectionId.
     *
     * @param collectionId Identifies the collections to query over. Every
     * collection or subcollection with this ID as the last segment of its path
     * will be included. Cannot contain a slash.
     * @return The created `CollectionGroup`.
     */
    collectionGroup(collectionId: string): CollectionGroup<DocumentData>;

    /**
     * Retrieves multiple documents from Firestore.
     *
     * The first argument is required and must be of type `DocumentReference`
     * followed by any additional `DocumentReference` documents. If used, the
     * optional `ReadOptions` must be the last argument.
     *
     * @param {Array.<DocumentReference|ReadOptions>} documentRefsOrReadOptions
     * The `DocumentReferences` to receive, followed by an optional field
     * mask.
     * @return A Promise that resolves with an array of resulting document
     * snapshots.
     */
    getAll(
      ...documentRefsOrReadOptions: Array<
        DocumentReference<DocumentData> | ReadOptions
      >
    ): Promise<Array<DocumentSnapshot<DocumentData>>>;

    /**
     * Recursively deletes all documents and subcollections at and under the
     * specified level.
     *
     * If any delete fails, the promise is rejected with an error message
     * containing the number of failed deletes and the stack trace of the last
     * failed delete. The provided reference is deleted regardless of whether
     * all deletes succeeded.
     *
     * `recursiveDelete()` uses a BulkWriter instance with default settings to
     * perform the deletes. To customize throttling rates or add success/error
     * callbacks, pass in a custom BulkWriter instance.
     *
     * @param ref The reference of a document or collection to delete.
     * @param bulkWriter A custom BulkWriter instance used to perform the
     * deletes.
     * @return A promise that resolves when all deletes have been performed.
     * The promise is rejected if any of the deletes fail.
     *
     * @example
     * // Recursively delete a reference and log the references of failures.
     * const bulkWriter = firestore.bulkWriter();
     * bulkWriter
     *   .onWriteError((error) => {
     *     if (
     *       error.failedAttempts < MAX_RETRY_ATTEMPTS
     *     ) {
     *       return true;
     *     } else {
     *       console.log('Failed write at document: ', error.documentRef.path);
     *       return false;
     *     }
     *   });
     * await firestore.recursiveDelete(docRef, bulkWriter);
     */
    recursiveDelete(
      ref: CollectionReference<unknown> | DocumentReference<unknown>,
      bulkWriter?: BulkWriter
    ): Promise<void>;

    /**
     * Terminates the Firestore client and closes all open streams.
     *
     * @return A Promise that resolves when the client is terminated.
     */
    terminate(): Promise<void>;

    /**
     * Fetches the root collections that are associated with this Firestore
     * database.
     *
     * @returns A Promise that resolves with an array of CollectionReferences.
     */
    listCollections(): Promise<Array<CollectionReference<DocumentData>>>;

    /**
     * Executes the given updateFunction and commits the changes applied within
     * the transaction.
     *
     * You can use the transaction object passed to 'updateFunction' to read and
     * modify Firestore documents under lock. You have to perform all reads
     * before you perform any write.
     *
     * Transactions can be performed as read-only or read-write transactions. By
     * default, transactions are executed in read-write mode.
     *
     * A read-write transaction obtains a pessimistic lock on all documents that
     * are read during the transaction. These locks block other transactions,
     * batched writes, and other non-transactional writes from changing that
     * document. Any writes in a read-write transactions are committed once
     * 'updateFunction' resolves, which also releases all locks.
     *
     * If a read-write transaction fails with contention, the transaction is
     * retried up to five times. The `updateFunction` is invoked once for each
     * attempt.
     *
     * Read-only transactions do not lock documents. They can be used to read
     * documents at a consistent snapshot in time, which may be up to 60 seconds
     * in the past. Read-only transactions are not retried.
     *
     * Transactions time out after 60 seconds if no documents are read.
     * Transactions that are not committed within than 270 seconds are also
     * aborted. Any remaining locks are released when a transaction times out.
     *
     * @param updateFunction The function to execute within the transaction
     * context.
     * @param transactionOptions Transaction options.
     * @return If the transaction completed successfully or was explicitly
     * aborted (by the updateFunction returning a failed Promise), the Promise
     * returned by the updateFunction will be returned here. Else if the
     * transaction failed, a rejected Promise with the corresponding failure
     * error will be returned.
     */
    runTransaction<T>(
      updateFunction: (transaction: Transaction) => Promise<T>,
      transactionOptions?:
        | ReadWriteTransactionOptions
        | ReadOnlyTransactionOptions
    ): Promise<T>;

    /**
     * Creates a write batch, used for performing multiple writes as a single
     * atomic operation.
     */
    batch(): WriteBatch;

    /**
     * Creates a [BulkWriter]{@link BulkWriter}, used for performing
     * multiple writes in parallel. Gradually ramps up writes as specified
     * by the 500/50/5 rule.
     *
     * @see https://firebase.google.com/docs/firestore/best-practices#ramping_up_traffic
     *
     * @param options An options object used to configure the throttling
     * behavior for the underlying BulkWriter.
     */
    bulkWriter(options?: BulkWriterOptions): BulkWriter;

    /**
     * Creates a new `BundleBuilder` instance to package selected Firestore data into
     * a bundle.
     *
     * @param bundleId The ID of the bundle. When loaded on clients, client SDKs use this ID
     * and the timestamp associated with the bundle to tell if it has been loaded already.
     * If not specified, a random identifier will be used.
     *
     *
     * @example
     * const bundle = firestore.bundle('data-bundle');
     * const docSnapshot = await firestore.doc('abc/123').get();
     * const querySnapshot = await firestore.collection('coll').get();
     *
     * const bundleBuffer = bundle.add(docSnapshot); // Add a document
     *                            .add('coll-query', querySnapshot) // Add a named query.
     *                            .build()
     * // Save `bundleBuffer` to CDN or stream it to clients.
     */
    bundle(bundleId?: string): BundleBuilder;
  }

  /**
   * An immutable object representing a geo point in Firestore. The geo point
   * is represented as latitude/longitude pair.
   *
   * Latitude values are in the range of [-90, 90].
   * Longitude values are in the range of [-180, 180].
   */
  export class GeoPoint {
    /**
     * Creates a new immutable GeoPoint object with the provided latitude and
     * longitude values.
     * @param latitude The latitude as number between -90 and 90.
     * @param longitude The longitude as number between -180 and 180.
     */
    constructor(latitude: number, longitude: number);

    readonly latitude: number;
    readonly longitude: number;

    /**
     * Returns true if this `GeoPoint` is equal to the provided one.
     *
     * @param other The `GeoPoint` to compare against.
     * @return true if this `GeoPoint` is equal to the provided one.
     */
    isEqual(other: GeoPoint): boolean;
  }

  /**
   * A reference to a transaction.
   * The `Transaction` object passed to a transaction's updateFunction provides
   * the methods to read and write data within the transaction context. See
   * `Firestore.runTransaction()`.
   */
  export class Transaction {
    private constructor();

    /**
     * Retrieves a query result. Holds a pessimistic lock on all returned
     * documents.
     *
     * @param query A query to execute.
     * @return A QuerySnapshot for the retrieved data.
     */
    get<T>(query: Query<T>): Promise<QuerySnapshot<T>>;

    /**
     * Reads the document referenced by the provided `DocumentReference.`
     * Holds a pessimistic lock on the returned document.
     *
     * @param documentRef A reference to the document to be read.
     * @return A DocumentSnapshot for the read data.
     */
    get<T>(documentRef: DocumentReference<T>): Promise<DocumentSnapshot<T>>;

    /**
     * Retrieves an aggregate query result. Holds a pessimistic lock on all
     * documents that were matched by the underlying query.
     *
     * @param aggregateQuery An aggregate query to execute.
     * @return An AggregateQuerySnapshot for the retrieved data.
     */
    get<T extends AggregateSpec>(
      aggregateQuery: AggregateQuery<T>
    ): Promise<AggregateQuerySnapshot<T>>;

    /**
     * Retrieves multiple documents from Firestore. Holds a pessimistic lock on
     * all returned documents.
     *
     * The first argument is required and must be of type `DocumentReference`
     * followed by any additional `DocumentReference` documents. If used, the
     * optional `ReadOptions` must be the last argument.
     *
     * @param {Array.<DocumentReference|ReadOptions>} documentRefsOrReadOptions
     * The `DocumentReferences` to receive, followed by an optional field
     * mask.
     * @return A Promise that resolves with an array of resulting document
     * snapshots.
     */
    getAll<T>(
      ...documentRefsOrReadOptions: Array<DocumentReference<T> | ReadOptions>
    ): Promise<Array<DocumentSnapshot<T>>>;

    /**
     * Create the document referred to by the provided `DocumentReference`.
     * The operation will fail the transaction if a document exists at the
     * specified location.
     *
     * @param documentRef A reference to the document to be create.
     * @param data The object data to serialize as the document.
     * @throws Error If the provided input is not a valid Firestore document.
     * @return This `Transaction` instance. Used for chaining method calls.
     */
    create<T>(
      documentRef: DocumentReference<T>,
      data: WithFieldValue<T>
    ): Transaction;

    /**
     * Writes to the document referred to by the provided `DocumentReference`.
     * If the document does not exist yet, it will be created. If you pass
     * `SetOptions`, the provided data can be merged into the existing document.
     *
     * @param documentRef A reference to the document to be set.
     * @param data An object of the fields and values for the document.
     * @param options An object to configure the set behavior.
     * @param  options.merge - If true, set() merges the values specified in its
     * data argument. Fields omitted from this set() call remain untouched. If
     * your input sets any field to an empty map, all nested fields are
     * overwritten.
     * @param options.mergeFields - If provided, set() only replaces the
     * specified field paths. Any field path that is not specified is ignored
     * and remains untouched. If your input sets any field to an empty map, all
     * nested fields are overwritten.
     * @throws Error If the provided input is not a valid Firestore document.
     * @return This `Transaction` instance. Used for chaining method calls.
     */
    set<T>(
      documentRef: DocumentReference<T>,
      data: PartialWithFieldValue<T>,
      options: SetOptions
    ): Transaction;
    set<T>(
      documentRef: DocumentReference<T>,
      data: WithFieldValue<T>
    ): Transaction;

    /**
     * Updates fields in the document referred to by the provided
     * `DocumentReference`. The update will fail if applied to a document that
     * does not exist.
     *
     * Nested fields can be updated by providing dot-separated field path
     * strings.
     *
     * @param documentRef A reference to the document to be updated.
     * @param data An object containing the fields and values with which to
     * update the document.
     * @param precondition A Precondition to enforce on this update.
     * @throws Error If the provided input is not valid Firestore data.
     * @return This `Transaction` instance. Used for chaining method calls.
     */
    update<T>(
      documentRef: DocumentReference<T>,
      data: UpdateData<T>,
      precondition?: Precondition
    ): Transaction;

    /**
     * Updates fields in the document referred to by the provided
     * `DocumentReference`. The update will fail if applied to a document that
     * does not exist.
     *
     * Nested fields can be updated by providing dot-separated field path
     * strings or by providing FieldPath objects.
     *
     * A `Precondition` restricting this update can be specified as the last
     * argument.
     *
     * @param documentRef A reference to the document to be updated.
     * @param field The first field to update.
     * @param value The first value
     * @param fieldsOrPrecondition An alternating list of field paths and values
     * to update, optionally followed by a `Precondition` to enforce on this
     * update.
     * @throws Error If the provided input is not valid Firestore data.
     * @return This `Transaction` instance. Used for chaining method calls.
     */
    update(
      documentRef: DocumentReference<any>,
      field: string | FieldPath,
      value: any,
      ...fieldsOrPrecondition: any[]
    ): Transaction;

    /**
     * Deletes the document referred to by the provided `DocumentReference`.
     *
     * @param documentRef A reference to the document to be deleted.
     * @param precondition A Precondition to enforce for this delete.
     * @return This `Transaction` instance. Used for chaining method calls.
     */
    delete(
      documentRef: DocumentReference<any>,
      precondition?: Precondition
    ): Transaction;
  }

  /**
   * A Firestore BulkWriter than can be used to perform a large number of writes
   * in parallel. Writes to the same document will be executed sequentially.
   *
   * @class
   */
  export class BulkWriter {
    private constructor();

    /**
     * Create a document with the provided data. This single operation will fail
     * if a document exists at its location.
     *
     * @param documentRef A reference to the document to be
     * created.
     * @param data The object to serialize as the document.
     * @throws Error If the provided input is not a valid Firestore document.
     * @returns A promise that resolves with the result of the write. If the
     * write fails, the promise is rejected with a
     * [BulkWriterError]{@link BulkWriterError}.
     */
    create<T>(
      documentRef: DocumentReference<T>,
      data: WithFieldValue<T>
    ): Promise<WriteResult>;

    /**
     * Delete a document from the database.
     *
     * @param documentRef A reference to the document to be
     * deleted.
     * @param precondition A precondition to enforce for this
     * delete.
     * @param precondition.lastUpdateTime If set, enforces that the
     * document was last updated at lastUpdateTime. Fails the batch if the
     * document doesn't exist or was last updated at a different time.
     * @param precondition.exists If set, enforces that the target document
     * must or must not exist.
     * @returns A promise that resolves with the result of the delete. If the
     * delete fails, the promise is rejected with a
     * [BulkWriterError]{@link BulkWriterError}.
     */
    delete(
      documentRef: DocumentReference<any>,
      precondition?: Precondition
    ): Promise<WriteResult>;

    /**
     * Write to the document referred to by the provided
     * [DocumentReference]{@link DocumentReference}. If the document does not
     * exist yet, it will be created. If you pass
     * [SetOptions]{@link SetOptions}., the provided data can be merged into the
     * existing document.
     *
     * @param  documentRef A reference to the document to be
     * set.
     * @param data The object to serialize as the document.
     * @param options An object to configure the set behavior.
     * @param  options.merge - If true, set() merges the values specified in its
     * data argument. Fields omitted from this set() call remain untouched. If
     * your input sets any field to an empty map, all nested fields are
     * overwritten.
     * @param options.mergeFields - If provided, set() only replaces the
     * specified field paths. Any field path that is not specified is ignored
     * and remains untouched. If your input sets any field to an empty map, all
     * nested fields are overwritten.
     * @throws Error If the provided input is not a valid Firestore document.
     * @returns A promise that resolves with the result of the write. If the
     * write fails, the promise is rejected with a
     * [BulkWriterError]{@link BulkWriterError}.
     */
    set<T>(
      documentRef: DocumentReference<T>,
      data: PartialWithFieldValue<T>,
      options: SetOptions
    ): Promise<WriteResult>;
    set<T>(
      documentRef: DocumentReference<T>,
      data: WithFieldValue<T>
    ): Promise<WriteResult>;

    /**
     * Update fields of the document referred to by the provided
     * [DocumentReference]{@link DocumentReference}. If the document doesn't yet
     * exist, the update fails and the entire batch will be rejected.
     *
     * The update() method accepts either an object with field paths encoded as
     * keys and field values encoded as values, or a variable number of
     * arguments that alternate between field paths and field values. Nested
     * fields can be updated by providing dot-separated field path strings or by
     * providing FieldPath objects.
     *
     *
     * A Precondition restricting this update can be specified as the last
     * argument.
     *
     * @param documentRef A reference to the document to be updated.
     * @param data An object containing the fields and values with which to
     * update the document.
     * @param precondition A Precondition to enforce on this update.
     * @throws Error If the provided input is not valid Firestore data.
     * @returns A promise that resolves with the result of the write. If the
     * write fails, the promise is rejected with a
     * [BulkWriterError]{@link BulkWriterError}.
     */
    update<T>(
      documentRef: DocumentReference<T>,
      data: UpdateData<T>,
      precondition?: Precondition
    ): Promise<WriteResult>;

    /**
     * Update fields of the document referred to by the provided
     * [DocumentReference]{@link DocumentReference}. If the document doesn't yet
     * exist, the update fails and the entire batch will be rejected.
     *
     * The update() method accepts either an object with field paths encoded as
     * keys and field values encoded as values, or a variable number of
     * arguments that alternate between field paths and field values. Nested
     * fields can be updated by providing dot-separated field path strings or by
     * providing FieldPath objects.
     *
     *
     * A Precondition restricting this update can be specified as the last
     * argument.
     *
     * @param documentRef A reference to the document to be updated.
     * @param field The first field to update.
     * @param value The first value
     * @param fieldsOrPrecondition An alternating list of field paths and values
     * to update, optionally followed a `Precondition` to enforce on this
     * update.
     * @throws Error If the provided input is not valid Firestore data;
     * @returns A promise that resolves with the result of the write. If the
     * write fails, the promise is rejected with a
     * [BulkWriterError]{@link BulkWriterError}.
     */
    update(
      documentRef: DocumentReference<any>,
      field: string | FieldPath,
      value: any,
      ...fieldsOrPrecondition: any[]
    ): Promise<WriteResult>;

    /**
     * Attaches a listener that is run every time a BulkWriter operation
     * successfully completes.
     *
     * @param callback A callback to be called every time a BulkWriter operation
     * successfully completes.
     */
    onWriteResult(
      callback: (
        documentRef: DocumentReference<any>,
        result: WriteResult
      ) => void
    ): void;

    /**
     * Attaches an error handler listener that is run every time a BulkWriter
     * operation fails.
     *
     * BulkWriter has a default error handler that retries UNAVAILABLE and
     * ABORTED errors up to a maximum of 10 failed attempts. When an error
     * handler is specified, the default error handler will be overwritten.
     *
     * @param shouldRetryCallback A callback to be called every time a BulkWriter
     * operation fails. Returning `true` will retry the operation. Returning
     * `false` will stop the retry loop.
     */
    onWriteError(
      shouldRetryCallback: (error: BulkWriterError) => boolean
    ): void;

    /**
     * Commits all writes that have been enqueued up to this point in parallel.
     *
     * Returns a Promise that resolves when all currently queued operations have
     * been committed. The Promise will never be rejected since the results for
     * each individual operation are conveyed via their individual Promises.
     *
     * The Promise resolves immediately if there are no pending writes.
     * Otherwise, the Promise waits for all previously issued writes, but it
     * does not wait for writes that were added after the method is called. If
     * you want to wait for additional writes, call `flush()` again.
     *
     * @return A promise that resolves when all enqueued writes
     * up to this point have been committed.
     */
    flush(): Promise<void>;

    /**
     * Commits all enqueued writes and marks the BulkWriter instance as closed.
     *
     * After calling `close()`, calling any method will throw an error. Any
     * retries scheduled as part of an `onWriteError()` handler will be run
     * before the `close()` promise resolves.
     *
     * Returns a Promise that resolves when all writes have been committed. The
     * Promise will never be rejected. Calling this method will send all
     * requests. The promise resolves immediately if there are no pending
     * writes.
     *
     * @return A promise that resolves when all enqueued writes
     * up to this point have been committed.
     */
    close(): Promise<void>;
  }

  /**
   * An options object to configure throttling on BulkWriter.
   */
  export interface BulkWriterOptions {
    /**
     * Whether to disable or configure throttling. By default, throttling is
     * enabled. This field can be set to either a boolean or a config
     * object. Setting it to `true` will use default values. You can override
     * the defaults by setting it to `false` to disable throttling, or by
     * setting the config values to enable throttling with the provided values.
     *
     * @see https://firebase.google.com/docs/firestore/best-practices#ramping_up_traffic
     *
     * @param initialOpsPerSecond The initial maximum number of operations per
     * second allowed by the throttler. If this field is not set, the default
     * is 500 operations per second.
     * @param maxOpsPerSecond The maximum number of operations per second
     * allowed by the throttler. If this field is set, the throttler's allowed
     * operations per second does not ramp up past the specified operations per
     * second.
     */
    readonly throttling?:
      | boolean
      | {initialOpsPerSecond?: number; maxOpsPerSecond?: number};
  }

  /**
   * The error thrown when a BulkWriter operation fails.
   */
  export class BulkWriterError extends Error {
    /** The status code of the error. */
    readonly code: GrpcStatus;

    /** The error message of the error. */
    readonly message: string;

    /** The document reference the operation was performed on. */
    readonly documentRef: DocumentReference<any>;

    /** The type of operation performed. */
    readonly operationType: 'create' | 'set' | 'update' | 'delete';

    /** How many times this operation has been attempted unsuccessfully. */
    readonly failedAttempts: number;
  }

  /**
   * A write batch, used to perform multiple writes as a single atomic unit.
   *
   * A `WriteBatch` object can be acquired by calling `Firestore.batch()`. It
   * provides methods for adding writes to the write batch. None of the
   * writes will be committed (or visible locally) until `WriteBatch.commit()`
   * is called.
   *
   * Unlike transactions, write batches are persisted offline and therefore are
   * preferable when you don't need to condition your writes on read data.
   */
  export class WriteBatch {
    private constructor();

    /**
     * Create the document referred to by the provided `DocumentReference`. The
     * operation will fail the batch if a document exists at the specified
     * location.
     *
     * @param documentRef A reference to the document to be created.
     * @param data The object data to serialize as the document.
     * @throws Error If the provided input is not a valid Firestore document.
     * @return This `WriteBatch` instance. Used for chaining method calls.
     */
    create<T>(
      documentRef: DocumentReference<T>,
      data: WithFieldValue<T>
    ): WriteBatch;

    /**
     * Write to the document referred to by the provided `DocumentReference`.
     * If the document does not exist yet, it will be created. If you pass
     * `SetOptions`, the provided data can be merged into the existing document.
     *
     * @param documentRef A reference to the document to be set.
     * @param data An object of the fields and values for the document.
     * @param options An object to configure the set behavior.
     * @param  options.merge - If true, set() merges the values specified in its
     * data argument. Fields omitted from this set() call remain untouched. If
     * your input sets any field to an empty map, all nested fields are
     * overwritten.
     * @param options.mergeFields - If provided, set() only replaces the
     * specified field paths. Any field path that is not specified is ignored
     * and remains untouched. If your input sets any field to an empty map, all
     * nested fields are overwritten.
     * @throws Error If the provided input is not a valid Firestore document.
     * @return This `WriteBatch` instance. Used for chaining method calls.
     */
    set<T>(
      documentRef: DocumentReference<T>,
      data: PartialWithFieldValue<T>,
      options: SetOptions
    ): WriteBatch;
    set<T>(
      documentRef: DocumentReference<T>,
      data: WithFieldValue<T>
    ): WriteBatch;

    /**
     * Update fields of the document referred to by the provided
     * `DocumentReference`. If the document doesn't yet exist, the update fails
     * and the entire batch will be rejected.
     *
     * Nested fields can be updated by providing dot-separated field path
     * strings.
     *
     * @param documentRef A reference to the document to be updated.
     * @param data An object containing the fields and values with which to
     * update the document.
     * @param precondition A Precondition to enforce on this update.
     * @throws Error If the provided input is not valid Firestore data.
     * @return This `WriteBatch` instance. Used for chaining method calls.
     */
    update<T>(
      documentRef: DocumentReference<T>,
      data: UpdateData<T>,
      precondition?: Precondition
    ): WriteBatch;

    /**
     * Updates fields in the document referred to by the provided
     * `DocumentReference`. The update will fail if applied to a document that
     * does not exist.
     *
     * Nested fields can be updated by providing dot-separated field path
     * strings or by providing FieldPath objects.
     *
     * A `Precondition` restricting this update can be specified as the last
     * argument.
     *
     * @param documentRef A reference to the document to be updated.
     * @param field The first field to update.
     * @param value The first value
     * @param fieldsOrPrecondition An alternating list of field paths and values
     * to update, optionally followed a `Precondition` to enforce on this
     * update.
     * @throws Error If the provided input is not valid Firestore data.
     * @return This `WriteBatch` instance. Used for chaining method calls.
     */
    update(
      documentRef: DocumentReference<any>,
      field: string | FieldPath,
      value: any,
      ...fieldsOrPrecondition: any[]
    ): WriteBatch;

    /**
     * Deletes the document referred to by the provided `DocumentReference`.
     *
     * @param documentRef A reference to the document to be deleted.
     * @param precondition A Precondition to enforce for this delete.
     * @return This `WriteBatch` instance. Used for chaining method calls.
     */
    delete(
      documentRef: DocumentReference<any>,
      precondition?: Precondition
    ): WriteBatch;

    /**
     * Commits all of the writes in this write batch as a single atomic unit.
     *
     * @return A Promise resolved once all of the writes in the batch have been
     * successfully written to the backend as an atomic unit.
     */
    commit(): Promise<WriteResult[]>;
  }

  /**
   * An options object that configures conditional behavior of `update()` and
   * `delete()` calls in `DocumentReference`, `WriteBatch`, and `Transaction`.
   * Using Preconditions, these calls can be restricted to only apply to
   * documents that match the specified restrictions.
   */
  export interface Precondition {
    /**
     * If set, the last update time to enforce.
     */
    readonly lastUpdateTime?: Timestamp;

    /**
     * If set, enforces that the target document must or must not exist.
     */
    readonly exists?: boolean;
  }

  /**
   * An options object that configures the behavior of `set()` calls in
   * `DocumentReference`, `WriteBatch` and `Transaction`. These calls can be
   * configured to perform granular merges instead of overwriting the target
   * documents in their entirety.
   *
   * @param merge Changes the behavior of a set() call to only replace the
   * values specified in its data argument. Fields omitted from the set() call
   * remain untouched. If your input sets any field to an empty map, all nested
   * fields are overwritten.
   *
   * @param mergeFields Changes the behavior of set() calls to only replace
   * the specified field paths. Any field path that is not specified is ignored
   * and remains untouched. If your input sets any field to an empty map, all
   * nested fields are overwritten.
   */
  export type SetOptions =
    | {
        readonly merge?: boolean;
      }
    | {
        readonly mergeFields?: Array<string | FieldPath>;
      };

  /**
   * An options object that can be used to configure the behavior of `getAll()`
   * calls. By providing a `fieldMask`, these calls can be configured to only
   * return a subset of fields.
   */
  export interface ReadOptions {
    /**
     * Specifies the set of fields to return and reduces the amount of data
     * transmitted by the backend.
     *
     * Adding a field mask does not filter results. Documents do not need to
     * contain values for all the fields in the mask to be part of the result
     * set.
     */
    readonly fieldMask?: (string | FieldPath)[];
  }

  /**
   * A WriteResult wraps the write time set by the Firestore servers on `sets()`,
   * `updates()`, and `creates()`.
   */
  export class WriteResult {
    private constructor();

    /**
     * The write time as set by the Firestore servers.
     */
    readonly writeTime: Timestamp;

    /**
     * Returns true if this `WriteResult` is equal to the provided one.
     *
     * @param other The `WriteResult` to compare against.
     * @return true if this `WriteResult` is equal to the provided one.
     */
    isEqual(other: WriteResult): boolean;
  }

  /**
   * A `DocumentReference` refers to a document location in a Firestore database
   * and can be used to write, read, or listen to the location. The document at
   * the referenced location may or may not exist. A `DocumentReference` can
   * also be used to create a `CollectionReference` to a subcollection.
   */
  export class DocumentReference<T = DocumentData> {
    private constructor();

    /** The identifier of the document within its collection. */
    readonly id: string;

    /**
     * The `Firestore` for the Firestore database (useful for performing
     * transactions, etc.).
     */
    readonly firestore: Firestore;

    /**
     * A reference to the Collection to which this DocumentReference belongs.
     */
    readonly parent: CollectionReference<T>;

    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     */
    readonly path: string;

    /**
     * Gets a `CollectionReference` instance that refers to the collection at
     * the specified path.
     *
     * @param collectionPath A slash-separated path to a collection.
     * @return The `CollectionReference` instance.
     */
    collection(collectionPath: string): CollectionReference<DocumentData>;

    /**
     * Fetches the subcollections that are direct children of this document.
     *
     * @returns A Promise that resolves with an array of CollectionReferences.
     */
    listCollections(): Promise<Array<CollectionReference<DocumentData>>>;

    /**
     * Creates a document referred to by this `DocumentReference` with the
     * provided object values. The write fails if the document already exists
     *
     * @param data The object data to serialize as the document.
     * @throws Error If the provided input is not a valid Firestore document.
     * @return A Promise resolved with the write time of this create.
     */
    create(data: WithFieldValue<T>): Promise<WriteResult>;

    /**
     * Writes to the document referred to by this `DocumentReference`. If the
     * document does not yet exist, it will be created. If you pass
     * `SetOptions`, the provided data can be merged into an existing document.
     *
     * @param data A map of the fields and values for the document.
     * @param options An object to configure the set behavior.
     * @param  options.merge - If true, set() merges the values specified in its
     * data argument. Fields omitted from this set() call remain untouched. If
     * your input sets any field to an empty map, all nested fields are
     * overwritten.
     * @param options.mergeFields - If provided, set() only replaces the
     * specified field paths. Any field path that is not specified is ignored
     * and remains untouched. If your input sets any field to an empty map, all
     * nested fields are overwritten.
     * @throws Error If the provided input is not a valid Firestore document.
     * @return A Promise resolved with the write time of this set.
     */
    set(
      data: PartialWithFieldValue<T>,
      options: SetOptions
    ): Promise<WriteResult>;
    set(data: WithFieldValue<T>): Promise<WriteResult>;

    /**
     * Updates fields in the document referred to by this `DocumentReference`.
     * The update will fail if applied to a document that does not exist.
     *
     * Nested fields can be updated by providing dot-separated field path
     * strings.
     *
     * @param data An object containing the fields and values with which to
     * update the document.
     * @param precondition A Precondition to enforce on this update.
     * @throws Error If the provided input is not valid Firestore data.
     * @return A Promise resolved with the write time of this update.
     */
    update(
      data: UpdateData<T>,
      precondition?: Precondition
    ): Promise<WriteResult>;

    /**
     * Updates fields in the document referred to by this `DocumentReference`.
     * The update will fail if applied to a document that does not exist.
     *
     * Nested fields can be updated by providing dot-separated field path
     * strings or by providing FieldPath objects.
     *
     * A `Precondition` restricting this update can be specified as the last
     * argument.
     *
     * @param field The first field to update.
     * @param value The first value.
     * @param moreFieldsOrPrecondition An alternating list of field paths and
     * values to update, optionally followed by a `Precondition` to enforce on
     * this update.
     * @throws Error If the provided input is not valid Firestore data.
     * @return A Promise resolved with the write time of this update.
     */
    update(
      field: string | FieldPath,
      value: any,
      ...moreFieldsOrPrecondition: any[]
    ): Promise<WriteResult>;

    /**
     * Deletes the document referred to by this `DocumentReference`.
     *
     * @param precondition A Precondition to enforce for this delete.
     * @return A Promise resolved with the write time of this delete.
     */
    delete(precondition?: Precondition): Promise<WriteResult>;

    /**
     * Reads the document referred to by this `DocumentReference`.
     *
     * @return A Promise resolved with a DocumentSnapshot containing the
     * current document contents.
     */
    get(): Promise<DocumentSnapshot<T>>;

    /**
     * Attaches a listener for DocumentSnapshot events.
     *
     * @param onNext A callback to be called every time a new `DocumentSnapshot`
     * is available.
     * @param onError A callback to be called if the listen fails or is
     * cancelled. No further callbacks will occur.
     * @return An unsubscribe function that can be called to cancel
     * the snapshot listener.
     */
    onSnapshot(
      onNext: (snapshot: DocumentSnapshot<T>) => void,
      onError?: (error: Error) => void
    ): () => void;

    /**
     * Returns true if this `DocumentReference` is equal to the provided one.
     *
     * @param other The `DocumentReference` to compare against.
     * @return true if this `DocumentReference` is equal to the provided one.
     */
    isEqual(other: DocumentReference<T>): boolean;

    /**
     * Applies a custom data converter to this DocumentReference, allowing you
     * to use your own custom model objects with Firestore. When you call
     * set(), get(), etc. on the returned DocumentReference instance, the
     * provided converter will convert between Firestore data and your custom
     * type U.
     *
     * @param converter Converts objects to and from Firestore. Passing in
     * `null` removes the current converter.
     * @return A DocumentReference<U> that uses the provided converter.
     */
    withConverter<U>(
      converter: FirestoreDataConverter<U>
    ): DocumentReference<U>;
    withConverter(converter: null): DocumentReference<DocumentData>;
  }

  /**
   * A `DocumentSnapshot` contains data read from a document in your Firestore
   * database. The data can be extracted with `.data()` or `.get(<field>)` to
   * get a specific field.
   *
   * For a `DocumentSnapshot` that points to a non-existing document, any data
   * access will return 'undefined'. You can use the `exists` property to
   * explicitly verify a document's existence.
   */
  export class DocumentSnapshot<T = DocumentData> {
    protected constructor();

    /** True if the document exists. */
    readonly exists: boolean;

    /** A `DocumentReference` to the document location. */
    readonly ref: DocumentReference<T>;

    /**
     * The ID of the document for which this `DocumentSnapshot` contains data.
     */
    readonly id: string;

    /**
     * The time the document was created. Not set for documents that don't
     * exist.
     */
    readonly createTime?: Timestamp;

    /**
     * The time the document was last updated (at the time the snapshot was
     * generated). Not set for documents that don't exist.
     */
    readonly updateTime?: Timestamp;

    /**
     * The time this snapshot was read.
     */
    readonly readTime: Timestamp;

    /**
     * Retrieves all fields in the document as an Object. Returns 'undefined' if
     * the document doesn't exist.
     *
     * @return An Object containing all fields in the document.
     */
    data(): T | undefined;

    /**
     * Retrieves the field specified by `fieldPath`.
     *
     * @param fieldPath The path (e.g. 'foo' or 'foo.bar') to a specific field.
     * @return The data at the specified field location or undefined if no such
     * field exists in the document.
     */
    get(fieldPath: string | FieldPath): any;

    /**
     * Returns true if the document's data and path in this `DocumentSnapshot`
     * is equal to the provided one.
     *
     * @param other The `DocumentSnapshot` to compare against.
     * @return true if this `DocumentSnapshot` is equal to the provided one.
     */
    isEqual(other: DocumentSnapshot<T>): boolean;
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
   */
  export class QueryDocumentSnapshot<
    T = DocumentData
  > extends DocumentSnapshot<T> {
    private constructor();

    /**
     * The time the document was created.
     */
    readonly createTime: Timestamp;

    /**
     * The time the document was last updated (at the time the snapshot was
     * generated).
     */
    readonly updateTime: Timestamp;

    /**
     * Retrieves all fields in the document as an Object.
     *
     * @override
     * @return An Object containing all fields in the document.
     */
    data(): T;
  }

  /**
   * The direction of a `Query.orderBy()` clause is specified as 'desc' or 'asc'
   * (descending or ascending).
   */
  export type OrderByDirection = 'desc' | 'asc';

  /**
   * Filter conditions in a `Query.where()` clause are specified using the
   * strings '<', '<=', '==', '!=', '>=', '>', 'array-contains', 'in', 'not-in',
   * and 'array-contains-any'.
   */
  export type WhereFilterOp =
    | '<'
    | '<='
    | '=='
    | '!='
    | '>='
    | '>'
    | 'array-contains'
    | 'in'
    | 'not-in'
    | 'array-contains-any';

  /**
   * A `Query` refers to a Query which you can read or listen to. You can also
   * construct refined `Query` objects by adding filters and ordering.
   */
  export class Query<T = DocumentData> {
    protected constructor();

    /**
     * The `Firestore` for the Firestore database (useful for performing
     * transactions, etc.).
     */
    readonly firestore: Firestore;

    /**
     * Creates and returns a new Query with the additional filter that documents
     * must contain the specified field and that its value should satisfy the
     * relation constraint provided.
     *
     * This function returns a new (immutable) instance of the Query (rather
     * than modify the existing instance) to impose the filter.
     *
     * @param fieldPath The path to compare
     * @param opStr The operation string (e.g "<", "<=", "==", ">", ">=").
     * @param value The value for comparison
     * @return The created Query.
     */
    where(
      fieldPath: string | FieldPath,
      opStr: WhereFilterOp,
      value: any
    ): Query<T>;

    /**
     * Creates and returns a new [Query]{@link Query} with the additional filter
     * that documents should satisfy the relation constraint provided. Documents
     * must contain the field specified in the filter.
     *
     * This function returns a new (immutable) instance of the Query (rather than
     * modify the existing instance) to impose the filter.
     *
     * @param {Filter} filter A filter to apply to the Query.
     * @returns {Query} The created Query.
     */
    where(filter: Filter): Query<T>;

    /**
     * Creates and returns a new Query that's additionally sorted by the
     * specified field, optionally in descending order instead of ascending.
     *
     * This function returns a new (immutable) instance of the Query (rather
     * than modify the existing instance) to impose the order.
     *
     * @param fieldPath The field to sort by.
     * @param directionStr Optional direction to sort by ('asc' or 'desc'). If
     * not specified, order will be ascending.
     * @return The created Query.
     */
    orderBy(
      fieldPath: string | FieldPath,
      directionStr?: OrderByDirection
    ): Query<T>;

    /**
     * Creates and returns a new Query that only returns the first matching
     * documents.
     *
     * This function returns a new (immutable) instance of the Query (rather
     * than modify the existing instance) to impose the limit.
     *
     * @param limit The maximum number of items to return.
     * @return The created Query.
     */
    limit(limit: number): Query<T>;

    /**
     * Creates and returns a new Query that only returns the last matching
     * documents.
     *
     * You must specify at least one orderBy clause for limitToLast queries,
     * otherwise an exception will be thrown during execution.
     *
     * Results for limitToLast queries cannot be streamed via the `stream()`
     * API.
     *
     * @param limit The maximum number of items to return.
     * @return The created Query.
     */
    limitToLast(limit: number): Query<T>;

    /**
     * Specifies the offset of the returned results.
     *
     * This function returns a new (immutable) instance of the Query (rather
     * than modify the existing instance) to impose the offset.
     *
     * @param offset The offset to apply to the Query results.
     * @return The created Query.
     */
    offset(offset: number): Query<T>;

    /**
     * Creates and returns a new Query instance that applies a field mask to
     * the result and returns only the specified subset of fields. You can
     * specify a list of field paths to return, or use an empty list to only
     * return the references of matching documents.
     *
     * Queries that contain field masks cannot be listened to via `onSnapshot()`
     * listeners.
     *
     * This function returns a new (immutable) instance of the Query (rather
     * than modify the existing instance) to impose the field mask.
     *
     * @param field The field paths to return.
     * @return The created Query.
     */
    select(...field: (string | FieldPath)[]): Query<DocumentData>;

    /**
     * Creates and returns a new Query that starts at the provided document
     * (inclusive). The starting position is relative to the order of the query.
     * The document must contain all of the fields provided in the orderBy of
     * this query.
     *
     * @param snapshot The snapshot of the document to start after.
     * @return The created Query.
     */
    startAt(snapshot: DocumentSnapshot<any>): Query<T>;

    /**
     * Creates and returns a new Query that starts at the provided fields
     * relative to the order of the query. The order of the field values
     * must match the order of the order by clauses of the query.
     *
     * @param fieldValues The field values to start this query at, in order
     * of the query's order by.
     * @return The created Query.
     */
    startAt(...fieldValues: any[]): Query<T>;

    /**
     * Creates and returns a new Query that starts after the provided document
     * (exclusive). The starting position is relative to the order of the query.
     * The document must contain all of the fields provided in the orderBy of
     * this query.
     *
     * @param snapshot The snapshot of the document to start after.
     * @return The created Query.
     */
    startAfter(snapshot: DocumentSnapshot<any>): Query<T>;

    /**
     * Creates and returns a new Query that starts after the provided fields
     * relative to the order of the query. The order of the field values
     * must match the order of the order by clauses of the query.
     *
     * @param fieldValues The field values to start this query after, in order
     * of the query's order by.
     * @return The created Query.
     */
    startAfter(...fieldValues: any[]): Query<T>;

    /**
     * Creates and returns a new Query that ends before the provided document
     * (exclusive). The end position is relative to the order of the query. The
     * document must contain all of the fields provided in the orderBy of this
     * query.
     *
     * @param snapshot The snapshot of the document to end before.
     * @return The created Query.
     */
    endBefore(snapshot: DocumentSnapshot<any>): Query<T>;

    /**
     * Creates and returns a new Query that ends before the provided fields
     * relative to the order of the query. The order of the field values
     * must match the order of the order by clauses of the query.
     *
     * @param fieldValues The field values to end this query before, in order
     * of the query's order by.
     * @return The created Query.
     */
    endBefore(...fieldValues: any[]): Query<T>;

    /**
     * Creates and returns a new Query that ends at the provided document
     * (inclusive). The end position is relative to the order of the query. The
     * document must contain all of the fields provided in the orderBy of this
     * query.
     *
     * @param snapshot The snapshot of the document to end at.
     * @return The created Query.
     */
    endAt(snapshot: DocumentSnapshot<any>): Query<T>;

    /**
     * Creates and returns a new Query that ends at the provided fields
     * relative to the order of the query. The order of the field values
     * must match the order of the order by clauses of the query.
     *
     * @param fieldValues The field values to end this query at, in order
     * of the query's order by.
     * @return The created Query.
     */
    endAt(...fieldValues: any[]): Query<T>;

    /**
     * Executes the query and returns the results as a `QuerySnapshot`.
     *
     * @return A Promise that will be resolved with the results of the Query.
     */
    get(): Promise<QuerySnapshot<T>>;

    /*
     * Executes the query and returns the results as Node Stream.
     *
     * @return A stream of QueryDocumentSnapshot.
     */
    stream(): NodeJS.ReadableStream;

    /**
     * Attaches a listener for `QuerySnapshot `events.
     *
     * @param onNext A callback to be called every time a new `QuerySnapshot`
     * is available.
     * @param onError A callback to be called if the listen fails or is
     * cancelled. No further callbacks will occur.
     * @return An unsubscribe function that can be called to cancel
     * the snapshot listener.
     */
    onSnapshot(
      onNext: (snapshot: QuerySnapshot<T>) => void,
      onError?: (error: Error) => void
    ): () => void;

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
    count(): AggregateQuery<{count: AggregateField<number>}>;

    /**
     * Returns true if this `Query` is equal to the provided one.
     *
     * @param other The `Query` to compare against.
     * @return true if this `Query` is equal to the provided one.
     */
    isEqual(other: Query<T>): boolean;

    /**
     * Applies a custom data converter to this Query, allowing you to use your
     * own custom model objects with Firestore. When you call get() on the
     * returned Query, the provided converter will convert between Firestore
     * data and your custom type U.
     *
     * @param converter Converts objects to and from Firestore. Passing in
     * `null` removes the current converter.
     * @return A Query<U> that uses the provided converter.
     */
    withConverter<U>(converter: FirestoreDataConverter<U>): Query<U>;
    withConverter(converter: null): Query<DocumentData>;
  }

  /**
   * A `QuerySnapshot` contains zero or more `QueryDocumentSnapshot` objects
   * representing the results of a query. The documents can be accessed as an
   * array via the `docs` property or enumerated using the `forEach` method. The
   * number of documents can be determined via the `empty` and `size`
   * properties.
   */
  export class QuerySnapshot<T = DocumentData> {
    private constructor();

    /**
     * The query on which you called `get` or `onSnapshot` in order to get this
     * `QuerySnapshot`.
     */
    readonly query: Query<T>;

    /** An array of all the documents in the QuerySnapshot. */
    readonly docs: Array<QueryDocumentSnapshot<T>>;

    /** The number of documents in the QuerySnapshot. */
    readonly size: number;

    /** True if there are no documents in the QuerySnapshot. */
    readonly empty: boolean;

    /** The time this query snapshot was obtained. */
    readonly readTime: Timestamp;

    /**
     * Returns an array of the documents changes since the last snapshot. If
     * this is the first snapshot, all documents will be in the list as added
     * changes.
     */
    docChanges(): DocumentChange<T>[];

    /**
     * Enumerates all of the documents in the QuerySnapshot.
     *
     * @param callback A callback to be called with a `DocumentSnapshot` for
     * each document in the snapshot.
     * @param thisArg The `this` binding for the callback.
     */
    forEach(
      callback: (result: QueryDocumentSnapshot<T>) => void,
      thisArg?: any
    ): void;

    /**
     * Returns true if the document data in this `QuerySnapshot` is equal to the
     * provided one.
     *
     * @param other The `QuerySnapshot` to compare against.
     * @return true if this `QuerySnapshot` is equal to the provided one.
     */
    isEqual(other: QuerySnapshot<T>): boolean;
  }

  /**
   * The type of of a `DocumentChange` may be 'added', 'removed', or 'modified'.
   */
  export type DocumentChangeType = 'added' | 'removed' | 'modified';

  /**
   * A `DocumentChange` represents a change to the documents matching a query.
   * It contains the document affected and the type of change that occurred.
   */
  export interface DocumentChange<T = DocumentData> {
    /** The type of change ('added', 'modified', or 'removed'). */
    readonly type: DocumentChangeType;

    /** The document affected by this change. */
    readonly doc: QueryDocumentSnapshot<T>;

    /**
     * The index of the changed document in the result set immediately prior to
     * this DocumentChange (i.e. supposing that all prior DocumentChange objects
     * have been applied). Is -1 for 'added' events.
     */
    readonly oldIndex: number;

    /**
     * The index of the changed document in the result set immediately after
     * this DocumentChange (i.e. supposing that all prior DocumentChange
     * objects and the current DocumentChange object have been applied).
     * Is -1 for 'removed' events.
     */
    readonly newIndex: number;

    /**
     * Returns true if the data in this `DocumentChange` is equal to the
     * provided one.
     *
     * @param other The `DocumentChange` to compare against.
     * @return true if this `DocumentChange` is equal to the provided one.
     */
    isEqual(other: DocumentChange<T>): boolean;
  }

  /**
   * A `CollectionReference` object can be used for adding documents, getting
   * document references, and querying for documents (using the methods
   * inherited from `Query`).
   */
  export class CollectionReference<T = DocumentData> extends Query<T> {
    private constructor();

    /** The identifier of the collection. */
    readonly id: string;

    /**
     * A reference to the containing Document if this is a subcollection, else
     * null.
     */
    readonly parent: DocumentReference<DocumentData> | null;

    /**
     * A string representing the path of the referenced collection (relative
     * to the root of the database).
     */
    readonly path: string;

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
     */
    listDocuments(): Promise<Array<DocumentReference<T>>>;

    /**
     * Get a `DocumentReference` for a randomly-named document within this
     * collection. An automatically-generated unique ID will be used as the
     * document ID.
     *
     * @return The `DocumentReference` instance.
     */
    doc(): DocumentReference<T>;

    /**
     * Get a `DocumentReference` for the document within the collection at the
     * specified path.
     *
     * @param documentPath A slash-separated path to a document.
     * @return The `DocumentReference` instance.
     */
    doc(documentPath: string): DocumentReference<T>;

    /**
     * Add a new document to this collection with the specified data, assigning
     * it a document ID automatically.
     *
     * @param data An Object containing the data for the new document.
     * @throws Error If the provided input is not a valid Firestore document.
     * @return A Promise resolved with a `DocumentReference` pointing to the
     * newly created document after it has been written to the backend.
     */
    add(data: WithFieldValue<T>): Promise<DocumentReference<T>>;

    /**
     * Returns true if this `CollectionReference` is equal to the provided one.
     *
     * @param other The `CollectionReference` to compare against.
     * @return true if this `CollectionReference` is equal to the provided one.
     */
    isEqual(other: CollectionReference<T>): boolean;

    /**
     * Applies a custom data converter to this CollectionReference, allowing you
     * to use your own custom model objects with Firestore. When you call add()
     * on the returned CollectionReference instance, the provided converter will
     * convert between Firestore data and your custom type U.
     *
     * @param converter Converts objects to and from Firestore. Passing in
     * `null` removes the current converter.
     * @return A CollectionReference<U> that uses the provided converter.
     */
    withConverter<U>(
      converter: FirestoreDataConverter<U>
    ): CollectionReference<U>;
    withConverter(converter: null): CollectionReference<DocumentData>;
  }

  /**
   * A `CollectionGroup` refers to all documents that are contained in a
   * collection or subcollection with a specific collection ID.
   */
  export class CollectionGroup<T = DocumentData> extends Query<T> {
    private constructor();

    /**
     * Partitions a query by returning partition cursors that can be used to run
     * the query in parallel. The returned cursors are split points that can be
     * used as starting and end points for individual query invocations.
     *
     * @param desiredPartitionCount The desired maximum number of partition
     * points. The number must be strictly positive. The actual number of
     * partitions returned may be fewer.
     * @return An AsyncIterable of `QueryPartition`s.
     */
    getPartitions(
      desiredPartitionCount: number
    ): AsyncIterable<QueryPartition<T>>;

    /**
     * Applies a custom data converter to this `CollectionGroup`, allowing you
     * to use your own custom model objects with Firestore. When you call get()
     * on the returned `CollectionGroup`, the provided converter will convert
     * between Firestore data and your custom type U.
     *
     * Using the converter allows you to specify generic type arguments when
     * storing and retrieving objects from Firestore.
     *
     * @example
     * class Post {
     *   constructor(readonly title: string, readonly author: string) {}
     *
     *   toString(): string {
     *     return this.title + ', by ' + this.author;
     *   }
     * }
     *
     * const postConverter = {
     *   toFirestore(post: Post): FirebaseFirestore.DocumentData {
     *     return {title: post.title, author: post.author};
     *   },
     *   fromFirestore(
     *     snapshot: FirebaseFirestore.QueryDocumentSnapshot
     *   ): Post {
     *     const data = snapshot.data();
     *     return new Post(data.title, data.author);
     *   }
     * };
     *
     * const querySnapshot = await Firestore()
     *   .collectionGroup('posts')
     *   .withConverter(postConverter)
     *   .get();
     * for (const doc of querySnapshot.docs) {
     *   const post = doc.data();
     *   post.title; // string
     *   post.toString(); // Should be defined
     *   post.someNonExistentProperty; // TS error
     * }
     *
     * @param converter Converts objects to and from Firestore. Passing in
     * `null` removes the current converter.
     * @return A `CollectionGroup<U>` that uses the provided converter.
     */
    withConverter<U>(converter: FirestoreDataConverter<U>): CollectionGroup<U>;
    withConverter(converter: null): CollectionGroup<DocumentData>;
  }

  /**
   * A split point that can be used in a query as a starting and/or end point for
   * the query results. The cursors returned by {@link #startAt} and {@link
   * #endBefore} can only be used in a query that matches the constraint of query
   * that produced this partition.
   */
  export class QueryPartition<T = DocumentData> {
    private constructor();

    /**
     * The cursor that defines the first result for this partition or
     * `undefined` if this is the first partition.  The cursor value must be
     * destructured when passed to `startAt()` (for example with
     * `query.startAt(...queryPartition.startAt)`).
     *
     * @return Cursor values that can be used with {@link Query#startAt} or
     * `undefined` if this is the first partition.
     */
    get startAt(): unknown[] | undefined;

    /**
     * The cursor that defines the first result after this partition or
     * `undefined` if this is the last partition.  The cursor value must be
     * destructured when passed to `endBefore()` (for example with
     * `query.endBefore(...queryPartition.endBefore)`).
     *
     * @return Cursor values that can be used with {@link Query#endBefore} or
     * `undefined` if this is the last partition.
     */
    get endBefore(): unknown[] | undefined;

    /**
     * Returns a query that only returns the documents for this partition.
     *
     * @return A query partitioned by a {@link Query#startAt} and {@link
     * Query#endBefore} cursor.
     */
    toQuery(): Query<T>;
  }

  /**
   * Represents an aggregation that can be performed by Firestore.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export class AggregateField<T> {
    private constructor();
  }

  /**
   * The union of all `AggregateField` types that are supported by Firestore.
   */
  export type AggregateFieldType = AggregateField<number>;

  /**
   * A type whose property values are all `AggregateField` objects.
   */
  export interface AggregateSpec {
    [field: string]: AggregateFieldType;
  }

  /**
   * A type whose keys are taken from an `AggregateSpec`, and whose values are
   * the result of the aggregation performed by the corresponding
   * `AggregateField` from the input `AggregateSpec`.
   */
  export type AggregateSpecData<T extends AggregateSpec> = {
    [P in keyof T]: T[P] extends AggregateField<infer U> ? U : never;
  };

  /**
   * A query that calculates aggregations over an underlying query.
   */
  export class AggregateQuery<T extends AggregateSpec> {
    private constructor();

    /** The query whose aggregations will be calculated by this object. */
    readonly query: Query<unknown>;

    /**
     * Executes this query.
     *
     * @return A promise that will be resolved with the results of the query.
     */
    get(): Promise<AggregateQuerySnapshot<T>>;

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
    isEqual(other: AggregateQuery<T>): boolean;
  }

  /**
   * The results of executing an aggregation query.
   */
  export class AggregateQuerySnapshot<T extends AggregateSpec> {
    private constructor();

    /** The query that was executed to produce this result. */
    readonly query: AggregateQuery<T>;

    /** The time this snapshot was read. */
    readonly readTime: Timestamp;

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
    data(): AggregateSpecData<T>;

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
    isEqual(other: AggregateQuerySnapshot<T>): boolean;
  }

  /**
   * Sentinel values that can be used when writing document fields with set(),
   * create() or update().
   */
  export class FieldValue {
    private constructor();

    /**
     * Returns a sentinel used with set(), create() or update() to include a
     * server-generated timestamp in the written data.
     *
     * @return The FieldValue sentinel for use in a call to set(), create() or
     * update().
     */
    static serverTimestamp(): FieldValue;

    /**
     * Returns a sentinel for use with update() or set() with {merge:true} to
     * mark a field for deletion.
     *
     * @return The FieldValue sentinel for use in a call to set() or update().
     */
    static delete(): FieldValue;

    /**
     * Returns a special value that can be used with set(), create() or update()
     * that tells the server to increment the field's current value by the given
     * value.
     *
     * If either current field value or the operand uses floating point
     * precision, both values will be interpreted as floating point numbers and
     * all arithmetic will follow IEEE 754 semantics. Otherwise, integer
     * precision is kept and the result is capped between -2^63 and 2^63-1.
     *
     * If the current field value is not of type 'number', or if the field does
     * not yet exist, the transformation will set the field to the given value.
     *
     * @param n The value to increment by.
     * @return The FieldValue sentinel for use in a call to set(), create() or
     * update().
     */
    static increment(n: number): FieldValue;

    /**
     * Returns a special value that can be used with set(), create() or update()
     * that tells the server to union the given elements with any array value
     * that already exists on the server. Each specified element that doesn't
     * already exist in the array will be added to the end. If the field being
     * modified is not already an array it will be overwritten with an array
     * containing exactly the specified elements.
     *
     * @param elements The elements to union into the array.
     * @return The FieldValue sentinel for use in a call to set(), create() or
     * update().
     */
    static arrayUnion(...elements: any[]): FieldValue;

    /**
     * Returns a special value that can be used with set(), create() or update()
     * that tells the server to remove the given elements from any array value
     * that already exists on the server. All instances of each element
     * specified will be removed from the array. If the field being modified is
     * not already an array it will be overwritten with an empty array.
     *
     * @param elements The elements to remove from the array.
     * @return The FieldValue sentinel for use in a call to set(), create() or
     * update().
     */
    static arrayRemove(...elements: any[]): FieldValue;

    /**
     * Returns true if this `FieldValue` is equal to the provided one.
     *
     * @param other The `FieldValue` to compare against.
     * @return true if this `FieldValue` is equal to the provided one.
     */
    isEqual(other: FieldValue): boolean;
  }

  /**
   * A FieldPath refers to a field in a document. The path may consist of a
   * single field name (referring to a top-level field in the document), or a
   * list of field names (referring to a nested field in the document).
   */
  export class FieldPath {
    /**
     * Creates a FieldPath from the provided field names. If more than one field
     * name is provided, the path will point to a nested field in a document.
     *
     * @param fieldNames A list of field names.
     */
    constructor(...fieldNames: string[]);

    /**
     * Returns a special sentinel FieldPath to refer to the ID of a document.
     * It can be used in queries to sort or filter by the document ID.
     */
    static documentId(): FieldPath;

    /**
     * Returns true if this `FieldPath` is equal to the provided one.
     *
     * @param other The `FieldPath` to compare against.
     * @return true if this `FieldPath` is equal to the provided one.
     */
    isEqual(other: FieldPath): boolean;
  }

  /**
   * A Timestamp represents a point in time independent of any time zone or
   * calendar, represented as seconds and fractions of seconds at nanosecond
   * resolution in UTC Epoch time. It is encoded using the Proleptic Gregorian
   * Calendar which extends the Gregorian calendar backwards to year one. It is
   * encoded assuming all minutes are 60 seconds long, i.e. leap seconds are
   * "smeared" so that no leap second table is needed for interpretation. Range
   * is from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59.999999999Z.
   *
   * @see https://github.com/google/protobuf/blob/master/src/google/protobuf/timestamp.proto
   */
  export class Timestamp {
    /**
     * Creates a new timestamp with the current date, with millisecond precision.
     *
     * @return A new `Timestamp` representing the current date.
     */
    static now(): Timestamp;

    /**
     * Creates a new timestamp from the given date.
     *
     * @param date The date to initialize the `Timestamp` from.
     * @return A new `Timestamp` representing the same point in time as the
     * given date.
     */
    static fromDate(date: Date): Timestamp;

    /**
     * Creates a new timestamp from the given number of milliseconds.
     *
     * @param milliseconds Number of milliseconds since Unix epoch
     * 1970-01-01T00:00:00Z.
     * @return A new `Timestamp` representing the same point in time as the
     * given number of milliseconds.
     */
    static fromMillis(milliseconds: number): Timestamp;

    /**
     * Creates a new timestamp.
     *
     * @param seconds The number of seconds of UTC time since Unix epoch
     * 1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
     * 9999-12-31T23:59:59Z inclusive.
     * @param nanoseconds The non-negative fractions of a second at nanosecond
     * resolution. Negative second values with fractions must still have
     * non-negative nanoseconds values that count forward in time. Must be from
     * 0 to 999,999,999 inclusive.
     */
    constructor(seconds: number, nanoseconds: number);

    /**
     * The number of seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z.
     */
    readonly seconds: number;

    /** The non-negative fractions of a second at nanosecond resolution. */
    readonly nanoseconds: number;

    /**
     * Returns a new `Date` corresponding to this timestamp. This may lose
     * precision.
     *
     * @return JavaScript `Date` object representing the same point in time as
     * this `Timestamp`, with millisecond precision.
     */
    toDate(): Date;

    /**
     * Returns the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
     *
     * @return The point in time corresponding to this timestamp, represented as
     * the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
     */
    toMillis(): number;

    /**
     * Returns true if this `Timestamp` is equal to the provided one.
     *
     * @param other The `Timestamp` to compare against.
     * @return 'true' if this `Timestamp` is equal to the provided one.
     */
    isEqual(other: Timestamp): boolean;

    /**
     * Converts this object to a primitive `string`, which allows `Timestamp` objects to be compared
     * using the `>`, `<=`, `>=` and `>` operators.
     *
     * @return a string encoding of this object.
     */
    valueOf(): string;
  }

  /**
   * Builds a Firestore data bundle with results from the given document and query snapshots.
   */
  export class BundleBuilder {
    /** The ID of this bundle. */
    readonly bundleId: string;

    /**
     * Adds a Firestore `DocumentSnapshot` to the bundle. Both the documents data and the document
     * read time will be included in the bundle.
     *
     * @param documentSnapshot A `DocumentSnapshot` to add.
     * @returns This instance.
     */
    add<T>(documentSnapshot: DocumentSnapshot<T>): BundleBuilder;

    /**
     * Adds a Firestore `QuerySnapshot` to the bundle. Both the documents in the query results and
     * the query read time will be included in the bundle.
     *
     * @param queryName The name of the query to add.
     * @param querySnapshot A `QuerySnapshot` to add to the bundle.
     * @returns This instance.
     */
    add<T>(queryName: string, querySnapshot: QuerySnapshot<T>): BundleBuilder;

    /**
     * Builds the bundle and returns the result as a `Buffer` instance.
     */
    build(): Buffer;
  }

  /**
   * The v1beta1 Veneer client. This client provides access to to the underlying
   * Firestore v1beta1 RPCs.
   * @deprecated Use v1 instead.
   */
  export const v1beta1: {
    FirestoreClient: typeof import('./v1beta1/firestore_client').FirestoreClient;
  };

  /**
   * The v1 Veneer clients. These clients provide access to the Firestore Admin
   * API and the underlying Firestore v1 RPCs.
   */
  export const v1: {
    FirestoreClient: typeof import('./v1/firestore_client').FirestoreClient;
    FirestoreAdminClient: typeof import('./v1/firestore_admin_client').FirestoreAdminClient;
  };

  /**
   * Status codes returned by Firestore's gRPC calls.
   */
  export enum GrpcStatus {
    OK = 0,
    CANCELLED = 1,
    UNKNOWN = 2,
    INVALID_ARGUMENT = 3,
    DEADLINE_EXCEEDED = 4,
    NOT_FOUND = 5,
    ALREADY_EXISTS = 6,
    PERMISSION_DENIED = 7,
    RESOURCE_EXHAUSTED = 8,
    FAILED_PRECONDITION = 9,
    ABORTED = 10,
    OUT_OF_RANGE = 11,
    UNIMPLEMENTED = 12,
    INTERNAL = 13,
    UNAVAILABLE = 14,
    DATA_LOSS = 15,
    UNAUTHENTICATED = 16,
  }

  /**
   * A `Filter` represents a restriction on one or more field values and can
   * be used to refine the results of a {@link Query}.
   * `Filters`s are created by invoking {@link Filter#where}, {@link Filter#or},
   * or {@link Filter#and} and can then be passed to {@link Query#where}
   * to create a new {@link Query} instance that also contains this `Filter`.
   */
  export abstract class Filter {
    /**
     * Creates and returns a new [Filter]{@link Filter}, which can be
     * applied to [Query.where()]{@link Query#where}, [Filter.or()]{@link Filter#or},
     * or [Filter.and()]{@link Filter#and}. When applied to a [Query]{@link Query}
     * it requires that documents must contain the specified field and that its value should
     * satisfy the relation constraint provided.
     *
     * Returns a new Filter that can be used to constrain the value of a Document property.
     *
     * @param {string|FieldPath} fieldPath The name of a property value to compare.
     * @param {string} opStr A comparison operation in the form of a string
     * (e.g., "<").
     * @param {*} value The value to which to compare the field for inclusion in
     * a query.
     * @returns {Filter} The created Filter.
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col');
     *
     * collectionRef.where(Filter.where('foo', '==', 'bar')).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    static where(
      fieldPath: string | FieldPath,
      opStr: WhereFilterOp,
      value: unknown
    ): Filter;

    /**
     * Creates and returns a new [Filter]{@link Filter} that is a
     * disjunction of the given {@link Filter}s. A disjunction filter includes
     * a document if it satisfies any of the given {@link Filter}s.
     *
     * The returned Filter can be applied to [Query.where()]{@link Query#where},
     * [Filter.or()]{@link Filter#or}, or [Filter.and()]{@link Filter#and}. When
     * applied to a [Query]{@link Query} it requires that documents must satisfy
     * one of the provided {@link Filter}s.
     *
     * @param {...Filter} filters  Optional. The {@link Filter}s
     * for OR operation. These must be created with calls to {@link Filter#where},
     * {@link Filter#or}, or {@link Filter#and}.
     * @returns {Filter} The created {@link Filter}.
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col');
     *
     * // doc.foo == 'bar' || doc.baz > 0
     * let orFilter = Filter.or(Filter.where('foo', '==', 'bar'), Filter.where('baz', '>', 0));
     *
     * collectionRef.where(orFilter).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    static or(...filters: Filter[]): Filter;

    /**
     * Creates and returns a new [Filter]{@link Filter} that is a
     * conjunction of the given {@link Filter}s. A conjunction filter includes
     * a document if it satisfies all of the given {@link Filter}s.
     *
     * The returned Filter can be applied to [Query.where()]{@link Query#where},
     * [Filter.or()]{@link Filter#or}, or [Filter.and()]{@link Filter#and}. When
     * applied to a [Query]{@link Query} it requires that documents must satisfy
     * one of the provided {@link Filter}s.
     *
     * @param {...Filter} filters  Optional. The {@link Filter}s
     * for OR operation. These must be created with calls to {@link Filter#where},
     * {@link Filter#or}, or {@link Filter#and}.
     * @returns {Filter} The created {@link Filter}.
     *
     * @example
     * ```
     * let collectionRef = firestore.collection('col');
     *
     * // doc.foo == 'bar' && doc.baz > 0
     * let orFilter = Filter.and(Filter.where('foo', '==', 'bar'), Filter.where('baz', '>', 0));
     *
     * collectionRef.where(orFilter).get().then(querySnapshot => {
     *   querySnapshot.forEach(documentSnapshot => {
     *     console.log(`Found document at ${documentSnapshot.ref.path}`);
     *   });
     * });
     * ```
     */
    static and(...filters: Filter[]): Filter;
  }
}

declare module '@google-cloud/firestore' {
  export = FirebaseFirestore;
}
