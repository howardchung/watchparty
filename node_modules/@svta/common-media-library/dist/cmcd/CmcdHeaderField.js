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
export const CmcdHeaderField = {
    /**
     * keys whose values vary with the object being requested.
     */
    OBJECT: CMCD_OBJECT,
    /**
     * keys whose values vary with each request.
     */
    REQUEST: CMCD_REQUEST,
    /**
     * keys whose values are expected to be invariant over the life of the session.
     */
    SESSION: CMCD_SESSION,
    /**
     * keys whose values do not vary with every request or object.
     */
    STATUS: CMCD_STATUS,
};
//# sourceMappingURL=CmcdHeaderField.js.map