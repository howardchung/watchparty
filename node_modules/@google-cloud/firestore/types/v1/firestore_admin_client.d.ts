/*!
 * Copyright 2022 Google LLC
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
import * as gax from 'google-gax';
import {
  Callback,
  CallOptions,
  Descriptors,
  ClientOptions,
  LROperation,
  PaginationCallback,
} from 'google-gax';
import {Transform} from 'stream';
import * as protos from '../protos/firestore_admin_v1_proto_api';
/**
 *  The Cloud Firestore Admin API.
 *
 *  This API provides several administrative services for Cloud Firestore.
 *
 *  Project, Database, Namespace, Collection, Collection Group, and Document are
 *  used as defined in the Google Cloud Firestore API.
 *
 *  Operation: An Operation represents work being performed in the background.
 *
 *  The index service manages Cloud Firestore indexes.
 *
 *  Index creation is performed asynchronously.
 *  An Operation resource is created for each such asynchronous operation.
 *  The state of the operation (including any errors encountered)
 *  may be queried via the Operation resource.
 *
 *  The Operations collection provides a record of actions performed for the
 *  specified Project (including any Operations in progress). Operations are not
 *  created directly but through calls on other collections or resources.
 *
 *  An Operation that is done may be deleted so that it is no longer listed as
 *  part of the Operation collection. Operations are garbage collected after
 *  30 days. By default, ListOperations will only return in progress and failed
 *  operations. To list completed operation, issue a ListOperations request with
 *  the filter `done: true`.
 *
 *  Operations are created by service `FirestoreAdmin`, but are accessed via
 *  service `google.longrunning.Operations`.
 * @class
 * @memberof v1
 */
export declare class FirestoreAdminClient {
  private _terminated;
  private _opts;
  private _providedCustomServicePath;
  private _gaxModule;
  private _gaxGrpc;
  private _protos;
  private _defaults;
  auth: gax.GoogleAuth;
  descriptors: Descriptors;
  warn: (code: string, message: string, warnType?: string) => void;
  innerApiCalls: {
    [name: string]: Function;
  };
  pathTemplates: {
    [name: string]: gax.PathTemplate;
  };
  operationsClient: gax.OperationsClient;
  firestoreAdminStub?: Promise<{
    [name: string]: Function;
  }>;
  /**
   * Construct an instance of FirestoreAdminClient.
   *
   * @param {object} [options] - The configuration object.
   * The options accepted by the constructor are described in detail
   * in [this document](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#creating-the-client-instance).
   * The common options are:
   * @param {object} [options.credentials] - Credentials object.
   * @param {string} [options.credentials.client_email]
   * @param {string} [options.credentials.private_key]
   * @param {string} [options.email] - Account email address. Required when
   *     using a .pem or .p12 keyFilename.
   * @param {string} [options.keyFilename] - Full path to the a .json, .pem, or
   *     .p12 key downloaded from the Google Developers Console. If you provide
   *     a path to a JSON file, the projectId option below is not necessary.
   *     NOTE: .pem and .p12 require you to specify options.email as well.
   * @param {number} [options.port] - The port on which to connect to
   *     the remote host.
   * @param {string} [options.projectId] - The project ID from the Google
   *     Developer's Console, e.g. 'grape-spaceship-123'. We will also check
   *     the environment variable GCLOUD_PROJECT for your project ID. If your
   *     app is running in an environment which supports
   *     {@link https://developers.google.com/identity/protocols/application-default-credentials Application Default Credentials},
   *     your project ID will be detected automatically.
   * @param {string} [options.apiEndpoint] - The domain name of the
   *     API remote host.
   * @param {gax.ClientConfig} [options.clientConfig] - Client configuration override.
   *     Follows the structure of {@link gapicConfig}.
   * @param {boolean} [options.fallback] - Use HTTP fallback mode.
   *     In fallback mode, a special browser-compatible transport implementation is used
   *     instead of gRPC transport. In browser context (if the `window` object is defined)
   *     the fallback mode is enabled automatically; set `options.fallback` to `false`
   *     if you need to override this behavior.
   */
  constructor(opts?: ClientOptions);
  /**
   * Initialize the client.
   * Performs asynchronous operations (such as authentication) and prepares the client.
   * This function will be called automatically when any class method is called for the
   * first time, but if you need to initialize it before calling an actual method,
   * feel free to call initialize() directly.
   *
   * You can await on this method if you want to make sure the client is initialized.
   *
   * @returns {Promise} A promise that resolves to an authenticated service stub.
   */
  initialize(): Promise<{
    [name: string]: Function;
  }>;
  /**
   * The DNS address for this API service.
   * @returns {string} The DNS address for this service.
   */
  static get servicePath(): string;
  /**
   * The DNS address for this API service - same as servicePath(),
   * exists for compatibility reasons.
   * @returns {string} The DNS address for this service.
   */
  static get apiEndpoint(): string;
  /**
   * The port for this API service.
   * @returns {number} The default port for this service.
   */
  static get port(): number;
  /**
   * The scopes needed to make gRPC calls for every method defined
   * in this service.
   * @returns {string[]} List of default scopes.
   */
  static get scopes(): string[];
  getProjectId(): Promise<string>;
  getProjectId(callback: Callback<string, undefined, undefined>): void;
  /**
   * Gets a composite index.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. A name of the form
   *   `projects/{project_id}/databases/{database_id}/collectionGroups/{collection_id}/indexes/{index_id}`
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [Index]{@link google.firestore.admin.v1.Index}.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.get_index.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_GetIndex_async
   */
  getIndex(
    request?: protos.google.firestore.admin.v1.IGetIndexRequest,
    options?: CallOptions
  ): Promise<
    [
      protos.google.firestore.admin.v1.IIndex,
      protos.google.firestore.admin.v1.IGetIndexRequest | undefined,
      {} | undefined
    ]
  >;
  getIndex(
    request: protos.google.firestore.admin.v1.IGetIndexRequest,
    options: CallOptions,
    callback: Callback<
      protos.google.firestore.admin.v1.IIndex,
      protos.google.firestore.admin.v1.IGetIndexRequest | null | undefined,
      {} | null | undefined
    >
  ): void;
  getIndex(
    request: protos.google.firestore.admin.v1.IGetIndexRequest,
    callback: Callback<
      protos.google.firestore.admin.v1.IIndex,
      protos.google.firestore.admin.v1.IGetIndexRequest | null | undefined,
      {} | null | undefined
    >
  ): void;
  /**
   * Deletes a composite index.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. A name of the form
   *   `projects/{project_id}/databases/{database_id}/collectionGroups/{collection_id}/indexes/{index_id}`
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [Empty]{@link google.protobuf.Empty}.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.delete_index.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_DeleteIndex_async
   */
  deleteIndex(
    request?: protos.google.firestore.admin.v1.IDeleteIndexRequest,
    options?: CallOptions
  ): Promise<
    [
      protos.google.protobuf.IEmpty,
      protos.google.firestore.admin.v1.IDeleteIndexRequest | undefined,
      {} | undefined
    ]
  >;
  deleteIndex(
    request: protos.google.firestore.admin.v1.IDeleteIndexRequest,
    options: CallOptions,
    callback: Callback<
      protos.google.protobuf.IEmpty,
      protos.google.firestore.admin.v1.IDeleteIndexRequest | null | undefined,
      {} | null | undefined
    >
  ): void;
  deleteIndex(
    request: protos.google.firestore.admin.v1.IDeleteIndexRequest,
    callback: Callback<
      protos.google.protobuf.IEmpty,
      protos.google.firestore.admin.v1.IDeleteIndexRequest | null | undefined,
      {} | null | undefined
    >
  ): void;
  /**
   * Gets the metadata and configuration for a Field.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. A name of the form
   *   `projects/{project_id}/databases/{database_id}/collectionGroups/{collection_id}/fields/{field_id}`
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [Field]{@link google.firestore.admin.v1.Field}.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.get_field.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_GetField_async
   */
  getField(
    request?: protos.google.firestore.admin.v1.IGetFieldRequest,
    options?: CallOptions
  ): Promise<
    [
      protos.google.firestore.admin.v1.IField,
      protos.google.firestore.admin.v1.IGetFieldRequest | undefined,
      {} | undefined
    ]
  >;
  getField(
    request: protos.google.firestore.admin.v1.IGetFieldRequest,
    options: CallOptions,
    callback: Callback<
      protos.google.firestore.admin.v1.IField,
      protos.google.firestore.admin.v1.IGetFieldRequest | null | undefined,
      {} | null | undefined
    >
  ): void;
  getField(
    request: protos.google.firestore.admin.v1.IGetFieldRequest,
    callback: Callback<
      protos.google.firestore.admin.v1.IField,
      protos.google.firestore.admin.v1.IGetFieldRequest | null | undefined,
      {} | null | undefined
    >
  ): void;
  /**
   * Gets information about a database.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. A name of the form
   *   `projects/{project_id}/databases/{database_id}`
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [Database]{@link google.firestore.admin.v1.Database}.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.get_database.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_GetDatabase_async
   */
  getDatabase(
    request?: protos.google.firestore.admin.v1.IGetDatabaseRequest,
    options?: CallOptions
  ): Promise<
    [
      protos.google.firestore.admin.v1.IDatabase,
      protos.google.firestore.admin.v1.IGetDatabaseRequest | undefined,
      {} | undefined
    ]
  >;
  getDatabase(
    request: protos.google.firestore.admin.v1.IGetDatabaseRequest,
    options: CallOptions,
    callback: Callback<
      protos.google.firestore.admin.v1.IDatabase,
      protos.google.firestore.admin.v1.IGetDatabaseRequest | null | undefined,
      {} | null | undefined
    >
  ): void;
  getDatabase(
    request: protos.google.firestore.admin.v1.IGetDatabaseRequest,
    callback: Callback<
      protos.google.firestore.admin.v1.IDatabase,
      protos.google.firestore.admin.v1.IGetDatabaseRequest | null | undefined,
      {} | null | undefined
    >
  ): void;
  /**
   * List all the databases in the project.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. A parent name of the form
   *   `projects/{project_id}`
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [ListDatabasesResponse]{@link google.firestore.admin.v1.ListDatabasesResponse}.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.list_databases.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_ListDatabases_async
   */
  listDatabases(
    request?: protos.google.firestore.admin.v1.IListDatabasesRequest,
    options?: CallOptions
  ): Promise<
    [
      protos.google.firestore.admin.v1.IListDatabasesResponse,
      protos.google.firestore.admin.v1.IListDatabasesRequest | undefined,
      {} | undefined
    ]
  >;
  listDatabases(
    request: protos.google.firestore.admin.v1.IListDatabasesRequest,
    options: CallOptions,
    callback: Callback<
      protos.google.firestore.admin.v1.IListDatabasesResponse,
      protos.google.firestore.admin.v1.IListDatabasesRequest | null | undefined,
      {} | null | undefined
    >
  ): void;
  listDatabases(
    request: protos.google.firestore.admin.v1.IListDatabasesRequest,
    callback: Callback<
      protos.google.firestore.admin.v1.IListDatabasesResponse,
      protos.google.firestore.admin.v1.IListDatabasesRequest | null | undefined,
      {} | null | undefined
    >
  ): void;
  /**
   * Creates a composite index. This returns a {@link google.longrunning.Operation|google.longrunning.Operation}
   * which may be used to track the status of the creation. The metadata for
   * the operation will be the type {@link google.firestore.admin.v1.IndexOperationMetadata|IndexOperationMetadata}.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. A parent name of the form
   *   `projects/{project_id}/databases/{database_id}/collectionGroups/{collection_id}`
   * @param {google.firestore.admin.v1.Index} request.index
   *   Required. The composite index to create.
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing
   *   a long running operation. Its `promise()` method returns a promise
   *   you can `await` for.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.create_index.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_CreateIndex_async
   */
  createIndex(
    request?: protos.google.firestore.admin.v1.ICreateIndexRequest,
    options?: CallOptions
  ): Promise<
    [
      LROperation<
        protos.google.firestore.admin.v1.IIndex,
        protos.google.firestore.admin.v1.IIndexOperationMetadata
      >,
      protos.google.longrunning.IOperation | undefined,
      {} | undefined
    ]
  >;
  createIndex(
    request: protos.google.firestore.admin.v1.ICreateIndexRequest,
    options: CallOptions,
    callback: Callback<
      LROperation<
        protos.google.firestore.admin.v1.IIndex,
        protos.google.firestore.admin.v1.IIndexOperationMetadata
      >,
      protos.google.longrunning.IOperation | null | undefined,
      {} | null | undefined
    >
  ): void;
  createIndex(
    request: protos.google.firestore.admin.v1.ICreateIndexRequest,
    callback: Callback<
      LROperation<
        protos.google.firestore.admin.v1.IIndex,
        protos.google.firestore.admin.v1.IIndexOperationMetadata
      >,
      protos.google.longrunning.IOperation | null | undefined,
      {} | null | undefined
    >
  ): void;
  /**
   * Check the status of the long running operation returned by `createIndex()`.
   * @param {String} name
   *   The operation name that will be passed.
   * @returns {Promise} - The promise which resolves to an object.
   *   The decoded operation object has result and metadata field to get information from.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.create_index.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_CreateIndex_async
   */
  checkCreateIndexProgress(
    name: string
  ): Promise<
    LROperation<
      protos.google.firestore.admin.v1.Index,
      protos.google.firestore.admin.v1.IndexOperationMetadata
    >
  >;
  /**
   * Updates a field configuration. Currently, field updates apply only to
   * single field index configuration. However, calls to
   * {@link google.firestore.admin.v1.FirestoreAdmin.UpdateField|FirestoreAdmin.UpdateField} should provide a field mask to avoid
   * changing any configuration that the caller isn't aware of. The field mask
   * should be specified as: `{ paths: "index_config" }`.
   *
   * This call returns a {@link google.longrunning.Operation|google.longrunning.Operation} which may be used to
   * track the status of the field update. The metadata for
   * the operation will be the type {@link google.firestore.admin.v1.FieldOperationMetadata|FieldOperationMetadata}.
   *
   * To configure the default field settings for the database, use
   * the special `Field` with resource name:
   * `projects/{project_id}/databases/{database_id}/collectionGroups/__default__/fields/*`.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {google.firestore.admin.v1.Field} request.field
   *   Required. The field to be updated.
   * @param {google.protobuf.FieldMask} request.updateMask
   *   A mask, relative to the field. If specified, only configuration specified
   *   by this field_mask will be updated in the field.
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing
   *   a long running operation. Its `promise()` method returns a promise
   *   you can `await` for.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.update_field.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_UpdateField_async
   */
  updateField(
    request?: protos.google.firestore.admin.v1.IUpdateFieldRequest,
    options?: CallOptions
  ): Promise<
    [
      LROperation<
        protos.google.firestore.admin.v1.IField,
        protos.google.firestore.admin.v1.IFieldOperationMetadata
      >,
      protos.google.longrunning.IOperation | undefined,
      {} | undefined
    ]
  >;
  updateField(
    request: protos.google.firestore.admin.v1.IUpdateFieldRequest,
    options: CallOptions,
    callback: Callback<
      LROperation<
        protos.google.firestore.admin.v1.IField,
        protos.google.firestore.admin.v1.IFieldOperationMetadata
      >,
      protos.google.longrunning.IOperation | null | undefined,
      {} | null | undefined
    >
  ): void;
  updateField(
    request: protos.google.firestore.admin.v1.IUpdateFieldRequest,
    callback: Callback<
      LROperation<
        protos.google.firestore.admin.v1.IField,
        protos.google.firestore.admin.v1.IFieldOperationMetadata
      >,
      protos.google.longrunning.IOperation | null | undefined,
      {} | null | undefined
    >
  ): void;
  /**
   * Check the status of the long running operation returned by `updateField()`.
   * @param {String} name
   *   The operation name that will be passed.
   * @returns {Promise} - The promise which resolves to an object.
   *   The decoded operation object has result and metadata field to get information from.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.update_field.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_UpdateField_async
   */
  checkUpdateFieldProgress(
    name: string
  ): Promise<
    LROperation<
      protos.google.firestore.admin.v1.Field,
      protos.google.firestore.admin.v1.FieldOperationMetadata
    >
  >;
  /**
   * Exports a copy of all or a subset of documents from Google Cloud Firestore
   * to another storage system, such as Google Cloud Storage. Recent updates to
   * documents may not be reflected in the export. The export occurs in the
   * background and its progress can be monitored and managed via the
   * Operation resource that is created. The output of an export may only be
   * used once the associated operation is done. If an export operation is
   * cancelled before completion it may leave partial data behind in Google
   * Cloud Storage.
   *
   * For more details on export behavior and output format, refer to:
   * https://cloud.google.com/firestore/docs/manage-data/export-import
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. Database to export. Should be of the form:
   *   `projects/{project_id}/databases/{database_id}`.
   * @param {string[]} request.collectionIds
   *   Which collection ids to export. Unspecified means all collections.
   * @param {string} request.outputUriPrefix
   *   The output URI. Currently only supports Google Cloud Storage URIs of the
   *   form: `gs://BUCKET_NAME[/NAMESPACE_PATH]`, where `BUCKET_NAME` is the name
   *   of the Google Cloud Storage bucket and `NAMESPACE_PATH` is an optional
   *   Google Cloud Storage namespace path. When
   *   choosing a name, be sure to consider Google Cloud Storage naming
   *   guidelines: https://cloud.google.com/storage/docs/naming.
   *   If the URI is a bucket (without a namespace path), a prefix will be
   *   generated based on the start time.
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing
   *   a long running operation. Its `promise()` method returns a promise
   *   you can `await` for.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.export_documents.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_ExportDocuments_async
   */
  exportDocuments(
    request?: protos.google.firestore.admin.v1.IExportDocumentsRequest,
    options?: CallOptions
  ): Promise<
    [
      LROperation<
        protos.google.firestore.admin.v1.IExportDocumentsResponse,
        protos.google.firestore.admin.v1.IExportDocumentsMetadata
      >,
      protos.google.longrunning.IOperation | undefined,
      {} | undefined
    ]
  >;
  exportDocuments(
    request: protos.google.firestore.admin.v1.IExportDocumentsRequest,
    options: CallOptions,
    callback: Callback<
      LROperation<
        protos.google.firestore.admin.v1.IExportDocumentsResponse,
        protos.google.firestore.admin.v1.IExportDocumentsMetadata
      >,
      protos.google.longrunning.IOperation | null | undefined,
      {} | null | undefined
    >
  ): void;
  exportDocuments(
    request: protos.google.firestore.admin.v1.IExportDocumentsRequest,
    callback: Callback<
      LROperation<
        protos.google.firestore.admin.v1.IExportDocumentsResponse,
        protos.google.firestore.admin.v1.IExportDocumentsMetadata
      >,
      protos.google.longrunning.IOperation | null | undefined,
      {} | null | undefined
    >
  ): void;
  /**
   * Check the status of the long running operation returned by `exportDocuments()`.
   * @param {String} name
   *   The operation name that will be passed.
   * @returns {Promise} - The promise which resolves to an object.
   *   The decoded operation object has result and metadata field to get information from.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.export_documents.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_ExportDocuments_async
   */
  checkExportDocumentsProgress(
    name: string
  ): Promise<
    LROperation<
      protos.google.firestore.admin.v1.ExportDocumentsResponse,
      protos.google.firestore.admin.v1.ExportDocumentsMetadata
    >
  >;
  /**
   * Imports documents into Google Cloud Firestore. Existing documents with the
   * same name are overwritten. The import occurs in the background and its
   * progress can be monitored and managed via the Operation resource that is
   * created. If an ImportDocuments operation is cancelled, it is possible
   * that a subset of the data has already been imported to Cloud Firestore.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. Database to import into. Should be of the form:
   *   `projects/{project_id}/databases/{database_id}`.
   * @param {string[]} request.collectionIds
   *   Which collection ids to import. Unspecified means all collections included
   *   in the import.
   * @param {string} request.inputUriPrefix
   *   Location of the exported files.
   *   This must match the output_uri_prefix of an ExportDocumentsResponse from
   *   an export that has completed successfully.
   *   See:
   *   {@link google.firestore.admin.v1.ExportDocumentsResponse.output_uri_prefix|google.firestore.admin.v1.ExportDocumentsResponse.output_uri_prefix}.
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing
   *   a long running operation. Its `promise()` method returns a promise
   *   you can `await` for.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.import_documents.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_ImportDocuments_async
   */
  importDocuments(
    request?: protos.google.firestore.admin.v1.IImportDocumentsRequest,
    options?: CallOptions
  ): Promise<
    [
      LROperation<
        protos.google.protobuf.IEmpty,
        protos.google.firestore.admin.v1.IImportDocumentsMetadata
      >,
      protos.google.longrunning.IOperation | undefined,
      {} | undefined
    ]
  >;
  importDocuments(
    request: protos.google.firestore.admin.v1.IImportDocumentsRequest,
    options: CallOptions,
    callback: Callback<
      LROperation<
        protos.google.protobuf.IEmpty,
        protos.google.firestore.admin.v1.IImportDocumentsMetadata
      >,
      protos.google.longrunning.IOperation | null | undefined,
      {} | null | undefined
    >
  ): void;
  importDocuments(
    request: protos.google.firestore.admin.v1.IImportDocumentsRequest,
    callback: Callback<
      LROperation<
        protos.google.protobuf.IEmpty,
        protos.google.firestore.admin.v1.IImportDocumentsMetadata
      >,
      protos.google.longrunning.IOperation | null | undefined,
      {} | null | undefined
    >
  ): void;
  /**
   * Check the status of the long running operation returned by `importDocuments()`.
   * @param {String} name
   *   The operation name that will be passed.
   * @returns {Promise} - The promise which resolves to an object.
   *   The decoded operation object has result and metadata field to get information from.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.import_documents.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_ImportDocuments_async
   */
  checkImportDocumentsProgress(
    name: string
  ): Promise<
    LROperation<
      protos.google.protobuf.Empty,
      protos.google.firestore.admin.v1.ImportDocumentsMetadata
    >
  >;
  /**
   * Updates a database.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {google.firestore.admin.v1.Database} request.database
   *   Required. The database to update.
   * @param {google.protobuf.FieldMask} request.updateMask
   *   The list of fields to be updated.
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing
   *   a long running operation. Its `promise()` method returns a promise
   *   you can `await` for.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.update_database.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_UpdateDatabase_async
   */
  updateDatabase(
    request?: protos.google.firestore.admin.v1.IUpdateDatabaseRequest,
    options?: CallOptions
  ): Promise<
    [
      LROperation<
        protos.google.firestore.admin.v1.IDatabase,
        protos.google.firestore.admin.v1.IUpdateDatabaseMetadata
      >,
      protos.google.longrunning.IOperation | undefined,
      {} | undefined
    ]
  >;
  updateDatabase(
    request: protos.google.firestore.admin.v1.IUpdateDatabaseRequest,
    options: CallOptions,
    callback: Callback<
      LROperation<
        protos.google.firestore.admin.v1.IDatabase,
        protos.google.firestore.admin.v1.IUpdateDatabaseMetadata
      >,
      protos.google.longrunning.IOperation | null | undefined,
      {} | null | undefined
    >
  ): void;
  updateDatabase(
    request: protos.google.firestore.admin.v1.IUpdateDatabaseRequest,
    callback: Callback<
      LROperation<
        protos.google.firestore.admin.v1.IDatabase,
        protos.google.firestore.admin.v1.IUpdateDatabaseMetadata
      >,
      protos.google.longrunning.IOperation | null | undefined,
      {} | null | undefined
    >
  ): void;
  /**
   * Check the status of the long running operation returned by `updateDatabase()`.
   * @param {String} name
   *   The operation name that will be passed.
   * @returns {Promise} - The promise which resolves to an object.
   *   The decoded operation object has result and metadata field to get information from.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.update_database.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_UpdateDatabase_async
   */
  checkUpdateDatabaseProgress(
    name: string
  ): Promise<
    LROperation<
      protos.google.firestore.admin.v1.Database,
      protos.google.firestore.admin.v1.UpdateDatabaseMetadata
    >
  >;
  /**
   * Lists composite indexes.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. A parent name of the form
   *   `projects/{project_id}/databases/{database_id}/collectionGroups/{collection_id}`
   * @param {string} request.filter
   *   The filter to apply to list results.
   * @param {number} request.pageSize
   *   The number of results to return.
   * @param {string} request.pageToken
   *   A page token, returned from a previous call to
   *   {@link google.firestore.admin.v1.FirestoreAdmin.ListIndexes|FirestoreAdmin.ListIndexes}, that may be used to get the next
   *   page of results.
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is Array of [Index]{@link google.firestore.admin.v1.Index}.
   *   The client library will perform auto-pagination by default: it will call the API as many
   *   times as needed and will merge results from all the pages into this array.
   *   Note that it can affect your quota.
   *   We recommend using `listIndexesAsync()`
   *   method described below for async iteration which you can stop as needed.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
   *   for more details and examples.
   */
  listIndexes(
    request?: protos.google.firestore.admin.v1.IListIndexesRequest,
    options?: CallOptions
  ): Promise<
    [
      protos.google.firestore.admin.v1.IIndex[],
      protos.google.firestore.admin.v1.IListIndexesRequest | null,
      protos.google.firestore.admin.v1.IListIndexesResponse
    ]
  >;
  listIndexes(
    request: protos.google.firestore.admin.v1.IListIndexesRequest,
    options: CallOptions,
    callback: PaginationCallback<
      protos.google.firestore.admin.v1.IListIndexesRequest,
      protos.google.firestore.admin.v1.IListIndexesResponse | null | undefined,
      protos.google.firestore.admin.v1.IIndex
    >
  ): void;
  listIndexes(
    request: protos.google.firestore.admin.v1.IListIndexesRequest,
    callback: PaginationCallback<
      protos.google.firestore.admin.v1.IListIndexesRequest,
      protos.google.firestore.admin.v1.IListIndexesResponse | null | undefined,
      protos.google.firestore.admin.v1.IIndex
    >
  ): void;
  /**
   * Equivalent to `method.name.toCamelCase()`, but returns a NodeJS Stream object.
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. A parent name of the form
   *   `projects/{project_id}/databases/{database_id}/collectionGroups/{collection_id}`
   * @param {string} request.filter
   *   The filter to apply to list results.
   * @param {number} request.pageSize
   *   The number of results to return.
   * @param {string} request.pageToken
   *   A page token, returned from a previous call to
   *   {@link google.firestore.admin.v1.FirestoreAdmin.ListIndexes|FirestoreAdmin.ListIndexes}, that may be used to get the next
   *   page of results.
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Stream}
   *   An object stream which emits an object representing [Index]{@link google.firestore.admin.v1.Index} on 'data' event.
   *   The client library will perform auto-pagination by default: it will call the API as many
   *   times as needed. Note that it can affect your quota.
   *   We recommend using `listIndexesAsync()`
   *   method described below for async iteration which you can stop as needed.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
   *   for more details and examples.
   */
  listIndexesStream(
    request?: protos.google.firestore.admin.v1.IListIndexesRequest,
    options?: CallOptions
  ): Transform;
  /**
   * Equivalent to `listIndexes`, but returns an iterable object.
   *
   * `for`-`await`-`of` syntax is used with the iterable to get response elements on-demand.
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. A parent name of the form
   *   `projects/{project_id}/databases/{database_id}/collectionGroups/{collection_id}`
   * @param {string} request.filter
   *   The filter to apply to list results.
   * @param {number} request.pageSize
   *   The number of results to return.
   * @param {string} request.pageToken
   *   A page token, returned from a previous call to
   *   {@link google.firestore.admin.v1.FirestoreAdmin.ListIndexes|FirestoreAdmin.ListIndexes}, that may be used to get the next
   *   page of results.
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Object}
   *   An iterable Object that allows [async iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
   *   When you iterate the returned iterable, each element will be an object representing
   *   [Index]{@link google.firestore.admin.v1.Index}. The API will be called under the hood as needed, once per the page,
   *   so you can stop the iteration when you don't need more results.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.list_indexes.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_ListIndexes_async
   */
  listIndexesAsync(
    request?: protos.google.firestore.admin.v1.IListIndexesRequest,
    options?: CallOptions
  ): AsyncIterable<protos.google.firestore.admin.v1.IIndex>;
  /**
   * Lists the field configuration and metadata for this database.
   *
   * Currently, {@link google.firestore.admin.v1.FirestoreAdmin.ListFields|FirestoreAdmin.ListFields} only supports listing fields
   * that have been explicitly overridden. To issue this query, call
   * {@link google.firestore.admin.v1.FirestoreAdmin.ListFields|FirestoreAdmin.ListFields} with the filter set to
   * `indexConfig.usesAncestorConfig:false` .
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. A parent name of the form
   *   `projects/{project_id}/databases/{database_id}/collectionGroups/{collection_id}`
   * @param {string} request.filter
   *   The filter to apply to list results. Currently,
   *   {@link google.firestore.admin.v1.FirestoreAdmin.ListFields|FirestoreAdmin.ListFields} only supports listing fields
   *   that have been explicitly overridden. To issue this query, call
   *   {@link google.firestore.admin.v1.FirestoreAdmin.ListFields|FirestoreAdmin.ListFields} with a filter that includes
   *   `indexConfig.usesAncestorConfig:false` .
   * @param {number} request.pageSize
   *   The number of results to return.
   * @param {string} request.pageToken
   *   A page token, returned from a previous call to
   *   {@link google.firestore.admin.v1.FirestoreAdmin.ListFields|FirestoreAdmin.ListFields}, that may be used to get the next
   *   page of results.
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is Array of [Field]{@link google.firestore.admin.v1.Field}.
   *   The client library will perform auto-pagination by default: it will call the API as many
   *   times as needed and will merge results from all the pages into this array.
   *   Note that it can affect your quota.
   *   We recommend using `listFieldsAsync()`
   *   method described below for async iteration which you can stop as needed.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
   *   for more details and examples.
   */
  listFields(
    request?: protos.google.firestore.admin.v1.IListFieldsRequest,
    options?: CallOptions
  ): Promise<
    [
      protos.google.firestore.admin.v1.IField[],
      protos.google.firestore.admin.v1.IListFieldsRequest | null,
      protos.google.firestore.admin.v1.IListFieldsResponse
    ]
  >;
  listFields(
    request: protos.google.firestore.admin.v1.IListFieldsRequest,
    options: CallOptions,
    callback: PaginationCallback<
      protos.google.firestore.admin.v1.IListFieldsRequest,
      protos.google.firestore.admin.v1.IListFieldsResponse | null | undefined,
      protos.google.firestore.admin.v1.IField
    >
  ): void;
  listFields(
    request: protos.google.firestore.admin.v1.IListFieldsRequest,
    callback: PaginationCallback<
      protos.google.firestore.admin.v1.IListFieldsRequest,
      protos.google.firestore.admin.v1.IListFieldsResponse | null | undefined,
      protos.google.firestore.admin.v1.IField
    >
  ): void;
  /**
   * Equivalent to `method.name.toCamelCase()`, but returns a NodeJS Stream object.
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. A parent name of the form
   *   `projects/{project_id}/databases/{database_id}/collectionGroups/{collection_id}`
   * @param {string} request.filter
   *   The filter to apply to list results. Currently,
   *   {@link google.firestore.admin.v1.FirestoreAdmin.ListFields|FirestoreAdmin.ListFields} only supports listing fields
   *   that have been explicitly overridden. To issue this query, call
   *   {@link google.firestore.admin.v1.FirestoreAdmin.ListFields|FirestoreAdmin.ListFields} with a filter that includes
   *   `indexConfig.usesAncestorConfig:false` .
   * @param {number} request.pageSize
   *   The number of results to return.
   * @param {string} request.pageToken
   *   A page token, returned from a previous call to
   *   {@link google.firestore.admin.v1.FirestoreAdmin.ListFields|FirestoreAdmin.ListFields}, that may be used to get the next
   *   page of results.
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Stream}
   *   An object stream which emits an object representing [Field]{@link google.firestore.admin.v1.Field} on 'data' event.
   *   The client library will perform auto-pagination by default: it will call the API as many
   *   times as needed. Note that it can affect your quota.
   *   We recommend using `listFieldsAsync()`
   *   method described below for async iteration which you can stop as needed.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
   *   for more details and examples.
   */
  listFieldsStream(
    request?: protos.google.firestore.admin.v1.IListFieldsRequest,
    options?: CallOptions
  ): Transform;
  /**
   * Equivalent to `listFields`, but returns an iterable object.
   *
   * `for`-`await`-`of` syntax is used with the iterable to get response elements on-demand.
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. A parent name of the form
   *   `projects/{project_id}/databases/{database_id}/collectionGroups/{collection_id}`
   * @param {string} request.filter
   *   The filter to apply to list results. Currently,
   *   {@link google.firestore.admin.v1.FirestoreAdmin.ListFields|FirestoreAdmin.ListFields} only supports listing fields
   *   that have been explicitly overridden. To issue this query, call
   *   {@link google.firestore.admin.v1.FirestoreAdmin.ListFields|FirestoreAdmin.ListFields} with a filter that includes
   *   `indexConfig.usesAncestorConfig:false` .
   * @param {number} request.pageSize
   *   The number of results to return.
   * @param {string} request.pageToken
   *   A page token, returned from a previous call to
   *   {@link google.firestore.admin.v1.FirestoreAdmin.ListFields|FirestoreAdmin.ListFields}, that may be used to get the next
   *   page of results.
   * @param {object} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Object}
   *   An iterable Object that allows [async iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
   *   When you iterate the returned iterable, each element will be an object representing
   *   [Field]{@link google.firestore.admin.v1.Field}. The API will be called under the hood as needed, once per the page,
   *   so you can stop the iteration when you don't need more results.
   *   Please see the
   *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
   *   for more details and examples.
   * @example <caption>include:samples/generated/v1/firestore_admin.list_fields.js</caption>
   * region_tag:firestore_v1_generated_FirestoreAdmin_ListFields_async
   */
  listFieldsAsync(
    request?: protos.google.firestore.admin.v1.IListFieldsRequest,
    options?: CallOptions
  ): AsyncIterable<protos.google.firestore.admin.v1.IField>;
  /**
   * Return a fully-qualified collectionGroup resource name string.
   *
   * @param {string} project
   * @param {string} database
   * @param {string} collection
   * @returns {string} Resource name string.
   */
  collectionGroupPath(
    project: string,
    database: string,
    collection: string
  ): string;
  /**
   * Parse the project from CollectionGroup resource.
   *
   * @param {string} collectionGroupName
   *   A fully-qualified path representing CollectionGroup resource.
   * @returns {string} A string representing the project.
   */
  matchProjectFromCollectionGroupName(
    collectionGroupName: string
  ): string | number;
  /**
   * Parse the database from CollectionGroup resource.
   *
   * @param {string} collectionGroupName
   *   A fully-qualified path representing CollectionGroup resource.
   * @returns {string} A string representing the database.
   */
  matchDatabaseFromCollectionGroupName(
    collectionGroupName: string
  ): string | number;
  /**
   * Parse the collection from CollectionGroup resource.
   *
   * @param {string} collectionGroupName
   *   A fully-qualified path representing CollectionGroup resource.
   * @returns {string} A string representing the collection.
   */
  matchCollectionFromCollectionGroupName(
    collectionGroupName: string
  ): string | number;
  /**
   * Return a fully-qualified database resource name string.
   *
   * @param {string} project
   * @param {string} database
   * @returns {string} Resource name string.
   */
  databasePath(project: string, database: string): string;
  /**
   * Parse the project from Database resource.
   *
   * @param {string} databaseName
   *   A fully-qualified path representing Database resource.
   * @returns {string} A string representing the project.
   */
  matchProjectFromDatabaseName(databaseName: string): string | number;
  /**
   * Parse the database from Database resource.
   *
   * @param {string} databaseName
   *   A fully-qualified path representing Database resource.
   * @returns {string} A string representing the database.
   */
  matchDatabaseFromDatabaseName(databaseName: string): string | number;
  /**
   * Return a fully-qualified field resource name string.
   *
   * @param {string} project
   * @param {string} database
   * @param {string} collection
   * @param {string} field
   * @returns {string} Resource name string.
   */
  fieldPath(
    project: string,
    database: string,
    collection: string,
    field: string
  ): string;
  /**
   * Parse the project from Field resource.
   *
   * @param {string} fieldName
   *   A fully-qualified path representing Field resource.
   * @returns {string} A string representing the project.
   */
  matchProjectFromFieldName(fieldName: string): string | number;
  /**
   * Parse the database from Field resource.
   *
   * @param {string} fieldName
   *   A fully-qualified path representing Field resource.
   * @returns {string} A string representing the database.
   */
  matchDatabaseFromFieldName(fieldName: string): string | number;
  /**
   * Parse the collection from Field resource.
   *
   * @param {string} fieldName
   *   A fully-qualified path representing Field resource.
   * @returns {string} A string representing the collection.
   */
  matchCollectionFromFieldName(fieldName: string): string | number;
  /**
   * Parse the field from Field resource.
   *
   * @param {string} fieldName
   *   A fully-qualified path representing Field resource.
   * @returns {string} A string representing the field.
   */
  matchFieldFromFieldName(fieldName: string): string | number;
  /**
   * Return a fully-qualified index resource name string.
   *
   * @param {string} project
   * @param {string} database
   * @param {string} collection
   * @param {string} index
   * @returns {string} Resource name string.
   */
  indexPath(
    project: string,
    database: string,
    collection: string,
    index: string
  ): string;
  /**
   * Parse the project from Index resource.
   *
   * @param {string} indexName
   *   A fully-qualified path representing Index resource.
   * @returns {string} A string representing the project.
   */
  matchProjectFromIndexName(indexName: string): string | number;
  /**
   * Parse the database from Index resource.
   *
   * @param {string} indexName
   *   A fully-qualified path representing Index resource.
   * @returns {string} A string representing the database.
   */
  matchDatabaseFromIndexName(indexName: string): string | number;
  /**
   * Parse the collection from Index resource.
   *
   * @param {string} indexName
   *   A fully-qualified path representing Index resource.
   * @returns {string} A string representing the collection.
   */
  matchCollectionFromIndexName(indexName: string): string | number;
  /**
   * Parse the index from Index resource.
   *
   * @param {string} indexName
   *   A fully-qualified path representing Index resource.
   * @returns {string} A string representing the index.
   */
  matchIndexFromIndexName(indexName: string): string | number;
  /**
   * Return a fully-qualified project resource name string.
   *
   * @param {string} project
   * @returns {string} Resource name string.
   */
  projectPath(project: string): string;
  /**
   * Parse the project from Project resource.
   *
   * @param {string} projectName
   *   A fully-qualified path representing Project resource.
   * @returns {string} A string representing the project.
   */
  matchProjectFromProjectName(projectName: string): string | number;
  /**
   * Terminate the gRPC channel and close the client.
   *
   * The client will no longer be usable and all future behavior is undefined.
   * @returns {Promise} A promise that resolves when the client is closed.
   */
  close(): Promise<void>;
}
