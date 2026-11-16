import { Info, Tree } from "./tree";
declare type TypeName = string;
declare type Signature = string[];
export declare const add: (typename: TypeName, signature: Signature, additionalInfo?: Info | undefined, offset?: number | undefined) => void;
export declare const createTree: () => Tree;
declare const _default: () => Tree;
export default _default;
//# sourceMappingURL=pattern-tree.d.ts.map