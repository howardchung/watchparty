/**
 * Returns any adjacent ID3 tags found in data starting at offset, as one block of data
 *
 * @param data - The data to search in
 * @param offset - The offset at which to start searching
 *
 * @returns The block of data containing any ID3 tags found
 * or `undefined` if no header is found at the starting offset
 *
 * @internal
 *
 * @group ID3
 */
export declare function getId3Data(data: Uint8Array, offset: number): Uint8Array | undefined;
//# sourceMappingURL=getId3Data.d.ts.map