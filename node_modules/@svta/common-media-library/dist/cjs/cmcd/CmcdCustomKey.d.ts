/**
 * A custom key for CMCD. Custom keys MUST carry a hyphenated prefix
 * to ensure that there will not be a namespace collision with future
 * revisions to this specification. Clients SHOULD use a reverse-DNS
 * syntax when defining their own prefix.
 *
 * @group CMCD
 *
 * @beta
 */
export type CmcdCustomKey = `${string}-${string}`;
//# sourceMappingURL=CmcdCustomKey.d.ts.map