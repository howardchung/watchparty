"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUint8 = toUint8;
function toUint8(data, offset = 0, length = Infinity) {
    return view(data, offset, length, Uint8Array);
}
function view(data, offset, length, Type) {
    const buffer = unsafeGetArrayBuffer(data);
    let bytesPerElement = 1;
    if ('BYTES_PER_ELEMENT' in Type) {
        bytesPerElement = Type.BYTES_PER_ELEMENT;
    }
    // Absolute end of the |data| view within |buffer|.
    const dataOffset = isArrayBufferView(data) ? data.byteOffset : 0;
    const dataEnd = ((dataOffset) + data.byteLength) / bytesPerElement;
    // Absolute start of the result within |buffer|.
    const rawStart = ((dataOffset) + offset) / bytesPerElement;
    const start = Math.floor(Math.max(0, Math.min(rawStart, dataEnd)));
    // Absolute end of the result within |buffer|.
    const end = Math.floor(Math.min(start + Math.max(length, 0), dataEnd));
    return new Type(buffer, start, end - start);
}
function unsafeGetArrayBuffer(view) {
    if (view instanceof ArrayBuffer) {
        return view;
    }
    else {
        return view.buffer;
    }
}
function isArrayBufferView(obj) {
    return obj && obj.buffer instanceof ArrayBuffer && obj.byteLength !== undefined && obj.byteOffset !== undefined;
}
//# sourceMappingURL=utf8.js.map