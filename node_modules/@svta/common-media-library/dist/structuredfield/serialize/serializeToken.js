import { symbolToStr } from '../../cta/utils/symbolToStr.js';
import { TOKEN } from '../utils/TOKEN.js';
import { serializeError } from './serializeError.js';
export function serializeToken(token) {
    const value = symbolToStr(token);
    if (/^([a-zA-Z*])([!#$%&'*+\-.^_`|~\w:/]*)$/.test(value) === false) {
        throw serializeError(value, TOKEN);
    }
    return value;
}
//# sourceMappingURL=serializeToken.js.map