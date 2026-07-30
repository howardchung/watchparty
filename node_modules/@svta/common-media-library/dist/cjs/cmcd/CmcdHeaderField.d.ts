import type { ValueOf } from '../utils/ValueOf.js';
import { CMCD_OBJECT } from './CMCD_OBJECT.js';
import { CMCD_REQUEST } from './CMCD_REQUEST.js';
import { CMCD_SESSION } from './CMCD_SESSION.js';
import { CMCD_STATUS } from './CMCD_STATUS.js';
/**
 * CMCD header fields.
 *
 * @group CMCD
 *
 * @enum
 *
 * @beta
 */
export declare const CmcdHeaderField: {
    /**
     * keys whose values vary with the object being requested.
     */
    readonly OBJECT: typeof CMCD_OBJECT;
    /**
     * keys whose values vary with each request.
     */
    readonly REQUEST: typeof CMCD_REQUEST;
    /**
     * keys whose values are expected to be invariant over the life of the session.
     */
    readonly SESSION: typeof CMCD_SESSION;
    /**
     * keys whose values do not vary with every request or object.
     */
    readonly STATUS: typeof CMCD_STATUS;
};
/**
 * @beta
 */
export type CmcdHeaderField = ValueOf<typeof CmcdHeaderField>;
//# sourceMappingURL=CmcdHeaderField.d.ts.map