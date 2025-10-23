import type { CmcdFormatter } from './CmcdFormatter.js';
import type { CmcdHeadersMap } from './CmcdHeadersMap.js';
import type { CmcdKey } from './CmcdKey.js';
/**
 * Options for encoding CMCD values.
 *
 * @group CMCD
 *
 * @beta
 */
export type CmcdEncodeOptions = {
    /**
     * A map of CMCD keys to custom formatters.
     */
    formatters?: Record<CmcdKey, CmcdFormatter>;
    /**
     * A map of CMCD header fields to custom CMCD keys.
     */
    customHeaderMap?: CmcdHeadersMap;
    /**
     * A filter function for CMCD keys.
     *
     * @param key - The CMCD key to filter.
     *
     * @returns `true` if the key should be included, `false` otherwise.
     */
    filter?: (key: CmcdKey) => boolean;
    /**
     * The base URL to use for relative URLs.
     */
    baseUrl?: string;
};
//# sourceMappingURL=CmcdEncodeOptions.d.ts.map