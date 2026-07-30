/**
 * @internal
 *
 * Get the language from an adaptation set.
 *
 * @param adaptationSet - AdaptationSet to get the language from
 * @returns language of the content
 */
export function getLanguage(adaptationSet) {
    let language = adaptationSet.$.lang;
    if (!language) {
        console.info(`AdaptationSet ${adaptationSet.$.id} has no lang, using "und" as default`);
        language = 'und';
    }
    return language;
}
//# sourceMappingURL=getLanguage.js.map