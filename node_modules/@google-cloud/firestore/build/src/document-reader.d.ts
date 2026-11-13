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
import { DocumentSnapshot } from './document';
import { DocumentReference } from './reference';
import { FieldPath } from './path';
import { Firestore } from './index';
/**
 * A wrapper around BatchGetDocumentsRequest that retries request upon stream
 * failure and returns ordered results.
 *
 * @private
 * @internal
 */
export declare class DocumentReader<T> {
    private firestore;
    private allDocuments;
    /** An optional field mask to apply to this read. */
    fieldMask?: FieldPath[];
    /** An optional transaction ID to use for this read. */
    transactionId?: Uint8Array;
    private outstandingDocuments;
    private retrievedDocuments;
    /**
     * Creates a new DocumentReader that fetches the provided documents (via
     * `get()`).
     *
     * @param firestore The Firestore instance to use.
     * @param allDocuments The documents to get.
     */
    constructor(firestore: Firestore, allDocuments: Array<DocumentReference<T>>);
    /**
     * Invokes the BatchGetDocuments RPC and returns the results.
     *
     * @param requestTag A unique client-assigned identifier for this request.
     */
    get(requestTag: string): Promise<Array<DocumentSnapshot<T>>>;
    private fetchDocuments;
}
