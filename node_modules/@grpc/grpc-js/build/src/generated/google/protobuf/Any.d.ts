/// <reference types="node" />
import type { AnyExtension } from '@grpc/proto-loader';
export declare type Any = AnyExtension | {
    type_url: string;
    value: Buffer | Uint8Array | string;
};
export interface Any__Output {
    'type_url': (string);
    'value': (Buffer);
}
