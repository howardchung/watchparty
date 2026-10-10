import { GuessedFile, Info } from "./model/tree";
export declare const filetypeinfo: (bytes: number[] | Uint8Array | Uint8ClampedArray) => GuessedFile[];
export default filetypeinfo;
export declare const filetypename: (bytes: number[] | Uint8Array | Uint8ClampedArray) => string[];
export declare const filetypemime: (bytes: number[] | Uint8Array | Uint8ClampedArray) => string[];
export declare const filetypeextension: (bytes: number[] | Uint8Array | Uint8ClampedArray) => string[];
export declare const register: (typename: string, signature: string[], additionalInfo?: Info | undefined, offset?: number | undefined) => void;
//# sourceMappingURL=index.d.ts.map