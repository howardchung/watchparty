"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toArrayBuffer = toArrayBuffer;
function toArrayBuffer(view) {
    if (view instanceof ArrayBuffer) {
        return view;
    }
    else {
        if (view.byteOffset == 0 && view.byteLength == view.buffer.byteLength) {
            // This is a TypedArray over the whole buffer.
            return view.buffer;
        }
        // This is a 'view' on the buffer.  Create a new buffer that only contains
        // the data.  Note that since this isn't an ArrayBuffer, the 'new' call
        // will allocate a new buffer to hold the copy.
        return new Uint8Array(view).buffer;
    }
}
//# sourceMappingURL=toArrayBuffer.js.map