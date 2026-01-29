//Add metadata to manifest.
//In the future, if any other fields are wanted to be added, they can be added here.
export function addMetadataToDash(dashManifest, manifest) {
    if (!manifest.metadata) {
        manifest.metadata = new Map();
    }
    if (dashManifest.MPD.$ && dashManifest.MPD.$.profiles) {
        manifest.metadata.set('profiles', dashManifest.MPD.$.profiles);
    }
    if (dashManifest.MPD.$ && dashManifest.MPD.$.type) {
        manifest.metadata.set('type', dashManifest.MPD.$.type);
    }
    return manifest;
}
//# sourceMappingURL=addMetadataToDash.js.map