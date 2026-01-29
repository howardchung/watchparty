export function getMetadata(manifest) {
    const metadata = manifest === null || manifest === void 0 ? void 0 : manifest.metadata;
    return JSON.parse(JSON.stringify(metadata));
}
//# sourceMappingURL=getMetadata.js.map