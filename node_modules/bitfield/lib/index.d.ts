interface BitFieldOptions {
    /**
     * If you `set` an index that is out-of-bounds, the bitfield
     * will automatically grow so that the bitfield is big enough
     * to contain the given index, up to the given size (in bit).
     *
     * If you want the Bitfield to grow indefinitely, pass `Infinity`.
     *
     * @default 0.
     */
    grow?: number;
}
export default class BitField {
    /**
     * Grow the bitfield up to this number of entries.
     * @default 0.
     */
    private readonly grow;
    /** The internal storage of the bitfield. */
    buffer: Uint8Array;
    /**
     *
     *
     * @param data Either a number representing the maximum number of supported bytes, or a Uint8Array.
     * @param opts Options for the bitfield.
     */
    constructor(data?: number | Uint8Array, opts?: BitFieldOptions);
    /**
     * Get a particular bit.
     *
     * @param i Bit index to retrieve.
     * @returns A boolean indicating whether the `i`th bit is set.
     */
    get(i: number): boolean;
    /**
     * Set a particular bit.
     *
     * Will grow the underlying array if the bit is out of bounds and the `grow` option is set.
     *
     * @param i Bit index to set.
     * @param value Value to set the bit to. Defaults to `true`.
     */
    set(i: number, value?: boolean): void;
    /**
     * Loop through the bits in the bitfield.
     *
     * @param fn Function to be called with the bit value and index.
     * @param start Index of the first bit to look at.
     * @param end Index of the first bit that should no longer be considered.
     */
    forEach(fn: (bit: boolean, index: number) => void, start?: number, end?: number): void;
}
export {};
//# sourceMappingURL=index.d.ts.map