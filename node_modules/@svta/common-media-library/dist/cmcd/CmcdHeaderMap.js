import { CmcdHeaderField } from './CmcdHeaderField.js';
/**
 * The map of CMCD header fields to official CMCD keys.
 *
 * @internal
 *
 * @group CMCD
 */
export const CmcdHeaderMap = {
    [CmcdHeaderField.OBJECT]: ['br', 'd', 'ot', 'tb'],
    [CmcdHeaderField.REQUEST]: ['bl', 'dl', 'mtp', 'nor', 'nrr', 'su'],
    [CmcdHeaderField.SESSION]: ['cid', 'pr', 'sf', 'sid', 'st', 'v'],
    [CmcdHeaderField.STATUS]: ['bs', 'rtp'],
};
//# sourceMappingURL=CmcdHeaderMap.js.map