/**
 * A custom key for CMSD. Custom keys MUST carry a hyphenated prefix
 * to ensure that there will not be a namespace collision with future
 * revisions to this specification. Clients SHOULD use a reverse-DNS
 * syntax when defining their own prefix.
 *
 * @group CMSD
 *
 * @beta
 */
export type CmsdCustomKey = `${string}-${string}`;
//# sourceMappingURL=CmsdCustomKey.d.ts.map