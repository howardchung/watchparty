"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanguage = getLanguage;
/**
 * @internal
 *
 * Get the language from an adaptation set.
 *
 * @param adaptationSet - AdaptationSet to get the language from
 * @returns language of the content
 */
function getLanguage(adaptationSet) {
    let language = adaptationSet.$.lang;
    if (!language) {
        console.info(`AdaptationSet ${adaptationSet.$.id} has no lang, using "und" as default`);
        language = 'und';
    }
    return language;
}
//# sourceMappingURL=getLanguage.js.map