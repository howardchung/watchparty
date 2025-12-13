import type { HlsManifest } from '../../types/mapper/hls/HlsManifest.js';
export type HlsParser = (text: string) => HlsManifest;
/**
 * @internal
 */
export declare function setHlsParser(parser: HlsParser): void;
/**
 * @internal
 */
export declare function getHlsParser(): HlsParser;
export declare function parseHlsManifest(text?: string): HlsManifest;
//# sourceMappingURL=parseHlsManifest.d.ts.map