import type { AdaptationSet } from '../../../types/mapper/dash/AdaptationSet.js';
import type { Representation } from '../../../types/mapper/dash/Representation.js';
import type { AudioTrack } from '../../../types/model/AudioTrack.js';
import type { Segment } from '../../../types/model/Segment.js';
import type { TextTrack } from '../../../types/model/TextTrack.js';
import type { VideoTrack } from '../../../types/model/VideoTrack.js';
/**
 * @internal
 *
 * Map dash components to ham tracks.
 *
 * @param adaptationSet - AdaptationSet of the dash manifest
 * @param representation - Representation of the dash manifest
 * @param segments - Segments from the representation of the dash manifest
 * @param initializationUrl - Initialization url from the track
 * @returns AudioTrack, VideoTrack or TextTrack depending on the type
 */
export declare function mapTracks(adaptationSet: AdaptationSet, representation: Representation, segments: Segment[], initializationUrl: string | undefined): AudioTrack | VideoTrack | TextTrack;
//# sourceMappingURL=mapTracks.d.ts.map