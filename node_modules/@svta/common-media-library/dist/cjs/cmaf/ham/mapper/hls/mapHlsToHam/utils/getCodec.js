"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodec = getCodec;
/**
 * @internal
 *
 * Get the codec for a type of content.
 *
 * @param type - Type of the content to get the codecs from
 * @param codecs - String containing multiple codecs separated with commas
 * @returns string containing codec
 *
 * @group CMAF
 * @alpha
 */
function getCodec(type, codecs) {
    var _a;
    if (type === 'audio') {
        // Using codec mp4a.40.2 for now, we should retrieve it by finding
        // the video playlist that is related to this audio group.
        return 'mp4a.40.2';
    }
    else if (type === 'video') {
        // CODECS could be a comma separated value
        // where it has video and audio codec. Using
        // position zero for now.
        // TODO: Get the correct video codec.
        return (_a = codecs === null || codecs === void 0 ? void 0 : codecs.split(',').at(0)) !== null && _a !== void 0 ? _a : '';
    }
    else {
        // if (type === 'text')
        return '';
    }
}
//# sourceMappingURL=getCodec.js.map