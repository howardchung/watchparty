"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMetadataToHls = addMetadataToHls;
//Add metadata to manifest.
//In the future, if any other fields are wanted to be added, they can be added here.
function addMetadataToHls(manifest, manifestParsed) {
    if (!manifest.metadata) {
        manifest.metadata = new Map();
    }
    if (!manifestParsed.version) {
        manifest.metadata.set('version', manifestParsed.version);
    }
    if (!manifestParsed.mediaSequence) {
        manifest.metadata.set('mediaSequence', manifestParsed.mediaSequence);
    }
    return manifest;
}
//# sourceMappingURL=addMetadataToHls.js.map