import type { ValueOf } from '../utils/ValueOf.js';
import { CMSD_DYNAMIC } from './CMSD_DYNAMIC.js';
import { CMSD_STATIC } from './CMSD_STATIC.js';
/**
 * CMSD header fields.
 *
 * @group CMSD
 *
 * @enum
 *
 * @beta
 */
export declare const CmsdHeaderField: {
    /**
     * Keys whose values persist over multiple requests for the object.
     */
    readonly STATIC: typeof CMSD_STATIC;
    /**
     * Keys whose values apply only to the next transmission hop. Typically a
     * new CMSD-Dynamic header instance will be added by each intermediary
     * participating in the delivery.
     */
    readonly DYNAMIC: typeof CMSD_DYNAMIC;
};
/**
 * @beta
 */
export type CmsdHeaderField = ValueOf<typeof CmsdHeaderField>;
//# sourceMappingURL=CmsdHeaderField.d.ts.map