import type { CommonMediaRequest } from './CommonMediaRequest.js';
/**
 * Request interceptor API.
 * @param request - The request to be executed.
 * @returns A promise with updated request that is resolved when the interceptor has completed the process of the request.
 *
 * @group Request
 *
 * @beta
 */
export type RequestInterceptor = (request: CommonMediaRequest) => Promise<CommonMediaRequest>;
//# sourceMappingURL=RequestInterceptor.d.ts.map