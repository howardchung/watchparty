import type { DashManifest } from '../../types/mapper/dash/DashManifest.js';
export type DashParser = (raw: string) => DashManifest;
/**
 * @internal
 */
export declare function setDashParser(parser: DashParser): void;
/**
 * @internal
 */
export declare function getDashParser(): DashParser;
/**
 * @internal
 * Parse XML to Json
 *
 * @param raw - Raw string containing the xml from the Dash Manifest
 * @returns json with the Dash Manifest structure
 */
export declare function parseDashManifest(raw: string): DashManifest;
//# sourceMappingURL=parseDashManifest.d.ts.map