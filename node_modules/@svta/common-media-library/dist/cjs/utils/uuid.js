"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuid = uuid;
/**
 * Generate a random v4 UUID
 *
 * @returns A random v4 UUID
 *
 * @group Utils
 *
 * @beta
 */
function uuid() {
    try {
        return crypto.randomUUID();
    }
    catch (error) {
        try {
            const url = URL.createObjectURL(new Blob());
            const uuid = url.toString();
            URL.revokeObjectURL(url);
            return uuid.slice(uuid.lastIndexOf('/') + 1);
        }
        catch (error) {
            let dt = new Date().getTime();
            const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = (dt + Math.random() * 16) % 16 | 0;
                dt = Math.floor(dt / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        }
    }
}
//# sourceMappingURL=uuid.js.map