import { Namespace as CLSNamespace } from 'continuation-local-storage';
export declare function createNamespace(): CLSNamespace;
export declare function destroyNamespace(): void;
export declare function getNamespace(): CLSNamespace;
export declare function reset(): void;
