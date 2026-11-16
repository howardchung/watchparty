import type { CommonMediaResponse } from './CommonMediaResponse.js';
/**
 * Response interceptor API.
 * @param response - The received response.
 * @returns A promise with updated response that is resolved when the interceptor has completed the process of the response.
 *
 * @group Request
 *
 * @beta
 */
export type ResponseInterceptor = (response: CommonMediaResponse) => Promise<CommonMediaResponse>;
//# sourceMappingURL=ResponseInterceptor.d.ts.map