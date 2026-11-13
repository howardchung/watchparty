/* global chrome */

const { isIPv4, isIPv6 } = require('chrome-net')

/**
 * DNS
 * ======================
 *
 * DNS lookup is available through require('chrome-dns').
 *
 * The chrome.dns API for Chrome Apps is not documented, but it still available.
 * You need the "dns" permission in your manifest.
 * @param {string} hostname: the hostname to be resolved
 * @param {function} cb: a callback function for dns.lookup with error and ip arguments
 */

exports.lookup = lookup

/**
 * dns.lookup(hostname[, options], callback)
 *
 * hostname <string>
 * options <integer> | <Object>
 *   - Not supported by chrome-dns. All options are ignored.
 * callback <Function>
 *   - err <Error>
 *   - address <string> A string representation of an IPv4 or IPv6 address.
 *   - family <integer> 4 or 6, denoting the family of address, or 0 if the
 *                      address is not an IPv4 or IPv6 address. 0 is a likely
 *                      indicator of a bug in the name resolution service used
 *                      by the operating system.
 */
function lookup (hostname, opts, cb) {
  if (typeof opts === 'function') return lookup(hostname, null, opts)

  chrome.dns.resolve(hostname, resolveInfo => {
    if (resolveInfo.resultCode !== 0) {
      return cb(new Error('DNS lookup error: ' + chrome.runtime.lastError.message))
    }
    const address = resolveInfo.address
    const ipVersion = isIPv4(address)
      ? 4
      : isIPv6(address)
        ? 6
        : 0
    cb(null, address, ipVersion)
  })
}
