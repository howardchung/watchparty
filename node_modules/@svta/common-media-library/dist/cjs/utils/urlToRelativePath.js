"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlToRelativePath = urlToRelativePath;
/**
 * Constructs a relative path from a URL.
 *
 * @param url - The destination URL
 * @param base - The base URL
 * @returns The relative path
 *
 * @group Utils
 *
 * @beta
 */
function urlToRelativePath(url, base) {
    const to = new URL(url);
    const from = new URL(base);
    if (to.origin !== from.origin) {
        return url;
    }
    const toPath = to.pathname.split('/').slice(1);
    const fromPath = from.pathname.split('/').slice(1, -1);
    // remove common parents
    while (toPath[0] === fromPath[0]) {
        toPath.shift();
        fromPath.shift();
    }
    // add back paths
    while (fromPath.length) {
        fromPath.shift();
        toPath.unshift('..');
    }
    return toPath.join('/');
}
//# sourceMappingURL=urlToRelativePath.js.map