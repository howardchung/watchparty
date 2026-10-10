/// <reference types="node" />
/// <reference types="node" />
import { Transform } from 'stream';
import { CRC32CValidatorGenerator } from './crc32c';
interface HashStreamValidatorOptions {
    /** Enables CRC32C calculation. To validate a provided value use `crc32cExpected`. */
    crc32c: boolean;
    /** Enables MD5 calculation. To validate a provided value use `md5Expected`. */
    md5: boolean;
    /** Set a custom CRC32C generator */
    crc32cGenerator: CRC32CValidatorGenerator;
    /** Sets the expected CRC32C value to verify once all data has been consumed. Also sets the `crc32c` option to `true` */
    crc32cExpected?: string;
    /** Sets the expected MD5 value to verify once all data has been consumed. Also sets the `md5` option to `true` */
    md5Expected?: string;
    /** Indicates whether or not to run a validation check or only update the hash values */
    updateHashesOnly?: boolean;
}
declare class HashStreamValidator extends Transform {
    #private;
    readonly crc32cEnabled: boolean;
    readonly md5Enabled: boolean;
    readonly crc32cExpected: string | undefined;
    readonly md5Expected: string | undefined;
    readonly updateHashesOnly: boolean;
    constructor(options?: Partial<HashStreamValidatorOptions>);
    _flush(callback: (error?: Error | null | undefined) => void): void;
    _transform(chunk: Buffer, encoding: BufferEncoding, callback: (e?: Error) => void): void;
    test(hash: 'crc32c' | 'md5', sum: Buffer | string): boolean;
}
export { HashStreamValidator, HashStreamValidatorOptions };
