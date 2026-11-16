/**
 * @internal
 *
 * Calculate the duration of a track.
 *
 * `target duration * number of segments`
 *
 * @param manifest - Manifest of the track
 * @param segments - Array of segments in a track
 * @returns duration of a track
 *
 * @group CMAF
 * @alpha
 */
export function getDuration(manifest, segments) {
    if (!(manifest === null || manifest === void 0 ? void 0 : manifest.targetDuration)) {
        console.error('Could not calculate duration, manifest is undefined.');
        return null;
    }
    return (manifest === null || manifest === void 0 ? void 0 : manifest.targetDuration) * segments.length;
}
//# sourceMappingURL=getDuration.js.map