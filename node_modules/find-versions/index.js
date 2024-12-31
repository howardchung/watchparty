'use strict';
const semverRegex = require('semver-regex');

module.exports = (stringWithVersions, {loose = false} = {}) => {
	if (typeof stringWithVersions !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof stringWithVersions}`);
	}

	const regex = loose ? new RegExp(`(?:${semverRegex().source})|(?:v?(?:\\d+\\.\\d+)(?:\\.\\d+)?)`, 'g') : semverRegex();
	const matches = stringWithVersions.match(regex) || [];

	return [...new Set(matches.map(match => match.trim().replace(/^v/, '').replace(/^\d+\.\d+$/, '$&.0')))];
};
