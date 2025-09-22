import type { SfToken } from '../structuredfield/SfToken.js';
import type { CmObjectType } from './CmObjectType.js';
import type { CmStreamingFormat } from './CmStreamingFormat.js';
import type { CmStreamType } from './CmStreamType.js';
/**
 * A common media value.
 *
 * @internal
 */
export type CmValue = CmObjectType | CmStreamingFormat | CmStreamType | string | number | boolean | symbol | SfToken;
//# sourceMappingURL=CmValue.d.ts.map