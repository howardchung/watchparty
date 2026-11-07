import type { Permissions, Snowflake } from '../../globals';
import type { APIBan, APIChannel, APIExtendedInvite, APIGuild, APIGuildIntegration, APIGuildMember, APIGuildMembershipScreening, APIGuildOnboarding, APIGuildPreview, APIGuildWelcomeScreen, APIGuildWidget, APIGuildWidgetSettings, APIRole, APIThreadList, APIVoiceRegion, GuildDefaultMessageNotifications, GuildExplicitContentFilter, GuildFeature, GuildMemberFlags, GuildMFALevel, GuildSystemChannelFlags, GuildVerificationLevel, GuildWidgetStyle, APIDMChannel, APIGroupDMChannel, APIGuildOnboardingPrompt, APIGuildOnboardingPromptOption, APIRoleColors, APIIncidentsData, APIGuildChannel, APIMessageSearchIndexNotReadyResponse, APIMessageSearchResult, MessageSearchAuthorType, MessageSearchEmbedType, MessageSearchHasType, MessageSearchSortMode } from '../../payloads/v9/index';
import type { _AddUndefinedToPossiblyUndefinedPropertiesOfInterface, _DistributiveOmit, _DistributivePick, _Nullable, _StrictPartial, _StrictRequired } from '../../utils/internals';
import type { Locale } from '../common';
import type { RESTPostAPIGuildChannelForumTagJSONBody, RESTPutAPIChannelPermissionJSONBody } from './channel';
export interface RESTAPIGuildCreateOverwrite extends RESTPutAPIChannelPermissionJSONBody {
    id: number | string;
}
/**
 * @deprecated Use {@link RESTAPIGuildCreateOverwrite} instead
 */
export type APIGuildCreateOverwrite = RESTAPIGuildCreateOverwrite;
export type RESTAPIGuildChannelResolvable = Exclude<APIChannel, APIDMChannel | APIGroupDMChannel>;
/**
 * @deprecated Use {@link RESTAPIGuildChannelResolvable} instead
 */
export type APIGuildChannelResolvable = RESTAPIGuildChannelResolvable;
export type RESTAPIGuildCreatePartialChannel = _StrictPartial<_DistributivePick<RESTAPIGuildChannelResolvable, 'bitrate' | 'default_auto_archive_duration' | 'default_forum_layout' | 'default_reaction_emoji' | 'default_sort_order' | 'default_thread_rate_limit_per_user' | 'flags' | 'nsfw' | 'position' | 'rate_limit_per_user' | 'rtc_region' | 'topic' | 'type' | 'user_limit' | 'video_quality_mode'>> & {
    name: string;
    /**
     * The set of tags that can be used in a thread-only channel; limited to 20
     */
    available_tags?: RESTPostAPIGuildChannelForumTagJSONBody[] | null | undefined;
    id?: number | string | undefined;
    parent_id?: number | string | null | undefined;
    permission_overwrites?: RESTAPIGuildCreateOverwrite[] | undefined;
};
/**
 * @deprecated Use {@link RESTAPIGuildCreatePartialChannel} instead
 */
export type APIGuildCreatePartialChannel = RESTAPIGuildCreatePartialChannel;
export interface RESTAPIGuildCreateRole extends RESTPostAPIGuildRoleJSONBody {
    id: number | string;
}
/**
 * @deprecated Use {@link RESTAPIGuildCreateRole} instead
 */
export type APIGuildCreateRole = RESTAPIGuildCreateRole;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild}
 * @deprecated {@link https://discord.com/developers/docs/change-log#guild-create-deprecation}
 */
export interface RESTPostAPIGuildsJSONBody {
    /**
     * Name of the guild (2-100 characters)
     */
    name: string;
    /**
     * Voice region id
     *
     * @see {@link https://discord.com/developers/docs/resources/voice#voice-region-object}
     */
    region?: string | undefined;
    /**
     * base64 1024x1024 png/jpeg image for the guild icon
     *
     * @see {@link https://discord.com/developers/docs/reference#image-data}
     */
    icon?: string | undefined;
    /**
     * Verification level
     *
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-verification-level}
     */
    verification_level?: GuildVerificationLevel | undefined;
    /**
     * Default message notification level
     *
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level}
     */
    default_message_notifications?: GuildDefaultMessageNotifications | undefined;
    /**
     * Explicit content filter level
     *
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level}
     */
    explicit_content_filter?: GuildExplicitContentFilter | undefined;
    /**
     * New guild roles
     *
     * @remarks
     * When using this parameter, the first member of the array is used to change properties of the guild's `@everyone` role.
     * If you are trying to bootstrap a guild with additional roles, keep this in mind.
     *
     * Also, the required `id` field within each role object is an integer placeholder,
     * and will be replaced by the API upon consumption. Its purpose is to allow you to overwrite a role's permissions
     * in a channel when also passing in channels with the channels array.
     * @see {@link https://discord.com/developers/docs/topics/permissions#role-object}
     */
    roles?: RESTAPIGuildCreateRole[] | undefined;
    /**
     * New guild's channels
     *
     * @remarks
     * When using the channels parameter, the `position` field is ignored, and none of the default channels are created.
     *
     * Also, the `id` field within each channel object may be set to an integer placeholder,
     * and will be replaced by the API upon consumption. Its purpose is to allow you to create `GUILD_CATEGORY` channels
     * by setting the `parent_id` field on any children to the category's id field.
     * Category channels must be listed before any children.*
     * @see {@link https://discord.com/developers/docs/resources/channel#channel-object}
     */
    channels?: RESTAPIGuildCreatePartialChannel[] | undefined;
    /**
     * ID for afk channel
     */
    afk_channel_id?: Snowflake | number | null | undefined;
    /**
     * afk timeout in seconds, can be set to: `60`, `300`, `900`, `1800`, `3600`
     */
    afk_timeout?: 1800 | 3600 | 60 | 300 | 900 | undefined;
    /**
     * The id of the channel where guild notices such as welcome messages and boost events are posted
     */
    system_channel_id?: Snowflake | number | null | undefined;
    /**
     * System channel flags
     *
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags}
     */
    system_channel_flags?: GuildSystemChannelFlags | undefined;
    /**
     * Whether the boosts progress bar should be enabled.
     */
    premium_progress_bar_enabled?: boolean | undefined;
}
/**
 * @see {@link https://discord.com/developers/docs/change-log#guild-create-deprecation}
 * @deprecated
 */
export type RESTPostAPIGuildsResult = APIGuild;
/**
 * @see {@link https://discord.com/developers/docs/change-log#guild-create-deprecation}
 * @deprecated
 */
export interface RESTPostAPIGuildsMFAJSONBody {
    /**
     * MFA level
     *
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-mfa-level}
     */
    level: GuildMFALevel;
}
/**
 * @see {@link https://discord.com/developers/docs/change-log#guild-create-deprecation}
 * @deprecated
 */
export type RESTPostAPIGuildsMFAResult = RESTPostAPIGuildsMFAJSONBody;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild}
 */
export interface RESTGetAPIGuildQuery {
    /**
     * When `true`, will return approximate member and presence counts for the guild
     *
     * @defaultValue `false`
     */
    with_counts?: boolean;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild}
 */
export type RESTGetAPIGuildResult = APIGuild;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-preview}
 */
export type RESTGetAPIGuildPreviewResult = APIGuildPreview;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild}
 */
export interface RESTPatchAPIGuildJSONBody {
    /**
     * New name for the guild (2-100 characters)
     */
    name?: string | undefined;
    /**
     * Voice region id
     *
     * @see {@link https://discord.com/developers/docs/resources/voice#voice-region-object}
     */
    region?: string | null | undefined;
    /**
     * Verification level
     *
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-verification-level}
     */
    verification_level?: GuildVerificationLevel | null | undefined;
    /**
     * Default message notification level
     *
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level}
     */
    default_message_notifications?: GuildDefaultMessageNotifications | null | undefined;
    /**
     * Explicit content filter level
     *
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level}
     */
    explicit_content_filter?: GuildExplicitContentFilter | null | undefined;
    /**
     * ID for afk channel
     */
    afk_channel_id?: Snowflake | null | undefined;
    /**
     * afk timeout in seconds, can be set to: `60`, `300`, `900`, `1800`, `3600`
     */
    afk_timeout?: 1800 | 3600 | 60 | 300 | 900 | undefined;
    /**
     * base64 1024x1024 png/jpeg/gif image for the guild icon (can be animated gif when the guild has `ANIMATED_ICON` feature)
     *
     * @see {@link https://discord.com/developers/docs/reference#image-data}
     */
    icon?: string | null | undefined;
    /**
     * User id to transfer guild ownership to (must be owner)
     *
     * @deprecated
     */
    owner_id?: Snowflake | undefined;
    /**
     * base64 16:9 png/jpeg image for the guild splash (when the guild has `INVITE_SPLASH` feature)
     *
     * @see {@link https://discord.com/developers/docs/reference#image-data}
     */
    splash?: string | null | undefined;
    /**
     * base64 png/jpeg image for the guild discovery splash (when the guild has `DISCOVERABLE` feature)
     */
    discovery_splash?: string | null | undefined;
    /**
     * base64 16:9 png/jpeg image for the guild banner (when the server has the `BANNER` feature; can be animated gif when the server has the `ANIMATED_BANNER` feature)
     */
    banner?: string | null | undefined;
    /**
     * The id of the channel where guild notices such as welcome messages and boost events are posted
     */
    system_channel_id?: Snowflake | null | undefined;
    /**
     * System channel flags
     *
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags}
     */
    system_channel_flags?: GuildSystemChannelFlags | undefined;
    /**
     * The id of the channel where Community guilds display rules and/or guidelines
     */
    rules_channel_id?: Snowflake | null | undefined;
    /**
     * The id of the channel where admins and moderators of Community guilds receive notices from Discord
     */
    public_updates_channel_id?: Snowflake | null | undefined;
    /**
     * The preferred locale of a Community guild used in server discovery and notices from Discord
     *
     * @defaultValue `"en-US"` (if the value is set to `null`)
     */
    preferred_locale?: Locale | null | undefined;
    /**
     * Enabled guild features
     *
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-features}
     */
    features?: GuildFeature[] | undefined;
    /**
     * The description for the guild
     */
    description?: string | null | undefined;
    /**
     * Whether the boosts progress bar should be enabled.
     */
    premium_progress_bar_enabled?: boolean | undefined;
    /**
     * The id of the channel where admins and moderators of Community guilds receive safety alerts from Discord
     */
    safety_alerts_channel_id?: Snowflake | null | undefined;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild}
 */
export type RESTPatchAPIGuildResult = APIGuild;
/**
 * @see {@link https://discord.com/developers/docs/change-log#guild-create-deprecation}
 * @deprecated
 */
export type RESTDeleteAPIGuildResult = undefined;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-channels}
 */
export type RESTGetAPIGuildChannelsResult = APIGuildChannel[];
/**
 * @see {@link https://docs.discord.com/developers/resources/guild#create-guild-channel}
 */
export type RESTPostAPIGuildChannelJSONBody = _DistributiveOmit<RESTAPIGuildCreatePartialChannel, 'id'>;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel}
 */
export type RESTPostAPIGuildChannelResult = APIChannel;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
 */
export type RESTPatchAPIGuildChannelPositionsJSONBody = {
    /**
     * Channel id
     */
    id: Snowflake;
    /**
     * Sorting position of the channel
     */
    position?: number | null | undefined;
    /**
     * Sync channel overwrites with the new parent, when moving to a new `parent_id`
     */
    lock_permissions?: boolean | null | undefined;
    /**
     * The new parent id of this channel
     */
    parent_id?: Snowflake | null | undefined;
}[];
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
 */
export type RESTPatchAPIGuildChannelPositionsResult = undefined;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads}
 */
export type RESTGetAPIGuildThreadsResult = Omit<APIThreadList, 'has_more'>;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-member}
 */
export type RESTGetAPIGuildMemberResult = APIGuildMember;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members}
 */
export interface RESTGetAPIGuildMembersQuery {
    /**
     * Max number of members to return (1-1000)
     *
     * @defaultValue `1`
     */
    limit?: number;
    /**
     * The highest user id in the previous page
     *
     * @defaultValue `0`
     */
    after?: Snowflake;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members}
 */
export type RESTGetAPIGuildMembersResult = APIGuildMember[];
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members}
 */
export interface RESTGetAPIGuildMembersSearchQuery {
    /**
     * Query string to match username(s) and nickname(s) against
     */
    query: string;
    /**
     * Max number of members to return (1-1000)
     *
     * @defaultValue `1`
     */
    limit?: number;
}
export type RESTGetAPIGuildMembersSearchResult = APIGuildMember[];
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member}
 */
export interface RESTPutAPIGuildMemberJSONBody {
    /**
     * An oauth2 access token granted with the `guilds.join` to the bot's application for the user you want to add to the guild
     */
    access_token: string;
    /**
     * Value to set users nickname to
     *
     * Requires `MANAGE_NICKNAMES` permission
     */
    nick?: string | undefined;
    /**
     * Array of role ids the member is assigned
     *
     * Requires `MANAGE_ROLES` permission
     */
    roles?: Snowflake[] | undefined;
    /**
     * Whether the user is muted in voice channels
     *
     * Requires `MUTE_MEMBERS` permission
     */
    mute?: boolean | undefined;
    /**
     * Whether the user is deafened in voice channels
     *
     * Requires `DEAFEN_MEMBERS` permission
     */
    deaf?: boolean | undefined;
}
export type RESTPutAPIGuildMemberResult = APIGuildMember | undefined;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member}
 */
export interface RESTPatchAPIGuildMemberJSONBody {
    /**
     * Value to set users nickname to
     *
     * Requires `MANAGE_NICKNAMES` permission
     */
    nick?: string | null | undefined;
    /**
     * Array of role ids the member is assigned
     *
     * Requires `MANAGE_ROLES` permission
     */
    roles?: Snowflake[] | null | undefined;
    /**
     * Whether the user is muted in voice channels. Will throw a 400 if the user is not in a voice channel
     *
     * Requires `MUTE_MEMBERS` permission
     */
    mute?: boolean | null | undefined;
    /**
     * Whether the user is deafened in voice channels. Will throw a 400 if the user is not in a voice channel
     *
     * Requires `DEAFEN_MEMBERS` permission
     */
    deaf?: boolean | null | undefined;
    /**
     * ID of channel to move user to (if they are connected to voice)
     *
     * Requires `MOVE_MEMBERS` permission
     */
    channel_id?: Snowflake | null | undefined;
    /**
     * Timestamp of when the time out will be removed; until then, they cannot interact with the guild
     */
    communication_disabled_until?: string | null | undefined;
    /**
     * Guild member flags (only {@link GuildMemberFlags.BypassesVerification} can be set)
     *
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags}
     */
    flags?: GuildMemberFlags | undefined;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member}
 */
export type RESTPatchAPIGuildMemberResult = APIGuildMember;
/**
 * Returns a list of messages without the `reactions` key that match a search query in the guild. Requires the `READ_MESSAGE_HISTORY` permission.
 *
 * @remarks The Search Guild Messages endpoint is restricted according to whether the `MESSAGE_CONTENT` Privileged Intent is enabled for your application.
 *
 * If the entity you are searching is not yet indexed, the endpoint will return a 202 accepted response. The response body will not contain any search results, and will look similar to an error response:
 * ```json
 * {
 *   "message": "Index not yet available. Try again later",
 *   "code": 110000,
 *   "documents_indexed": 0,
 *   "retry_after": 2
 * }
 * ```
 *
 * Due to speed optimizations, search may return slightly fewer results than the limit specified when messages have not been accessed for a long time.
 * Clients should not rely on the length of the `messages` array to paginate results.
 *
 * Additionally, when messages are actively being created or deleted, the `total_results` field may not be accurate.
 * @see {@link https://docs.discord.com/developers/resources/message#search-guild-messages}
 */
export interface RESTGetAPIGuildMessagesSearchQuery {
    /**
     * Max number of messages to return (1-25)
     *
     * @defaultValue `25`
     */
    limit?: number;
    /**
     * Number to offset the returned messages by (max 9975)
     */
    offset?: number;
    /**
     * Get messages before this message ID
     */
    max_id?: Snowflake;
    /**
     * Get messages after this message ID
     */
    min_id?: Snowflake;
    /**
     * Max number of words to skip between matching tokens in the search `content` (max 100)
     *
     * @defaultValue `2`
     */
    slop?: number;
    /**
     * Filter messages by content (max 1024 characters)
     */
    content?: string;
    /**
     * Filter messages by these channels (max 500)
     */
    channel_id?: Snowflake[];
    /**
     * Filter messages by author type
     *
     * @remarks All types can be negated by prefixing them with `-`, which means results will not include messages that match the type.
     * @see {@link https://docs.discord.com/developers/resources/message#search-guild-messages-author-types}
     */
    author_type?: MessageSearchAuthorType[];
    /**
     * Filter messages by these authors (max 100)
     */
    author_id?: Snowflake[];
    /**
     * Filter messages that mention these users (max 100)
     */
    mentions?: Snowflake[];
    /**
     * Filter messages that mention these roles (max 100)
     */
    mentions_role_id?: Snowflake[];
    /**
     * Filter messages that do or do not mention `@everyone`
     */
    mention_everyone?: boolean;
    /**
     * Filter messages that reply to these users (max 100)
     */
    replied_to_user_id?: Snowflake[];
    /**
     * Filter messages that reply to these messages (max 100)
     */
    replied_to_message_id?: Snowflake[];
    /**
     * Filter messages by whether they are or are not pinned
     */
    pinned?: boolean;
    /**
     * Filter messages by whether or not they have specific things
     *
     * @remarks All types can be negated by prefixing them with `-`, which means results will not include messages that match the type.
     * @see {@link https://docs.discord.com/developers/resources/message#search-guild-messages-search-has-types}
     */
    has?: MessageSearchHasType[];
    /**
     * Filter messages by embed type
     *
     * @see {@link https://docs.discord.com/developers/resources/message#search-guild-messages-search-embed-types}
     */
    embed_type?: MessageSearchEmbedType[];
    /**
     * Filter messages by embed provider (case-sensitive, e.g. `Tenor`) (max 256 characters, max 100)
     */
    embed_provider?: string[];
    /**
     * Filter messages by link hostname (e.g. `discordapp.com`) (max 256 characters, max 100)
     */
    link_hostname?: string[];
    /**
     * Filter messages by attachment filename (max 1024 characters, max 100)
     */
    attachment_filename?: string[];
    /**
     * Filter messages by attachment extension (e.g. `txt`) (max 256 characters, max 100)
     */
    attachment_extension?: string[];
    /**
     * The sorting algorithm to use
     *
     * @remarks Sort order is not respected when sorting by relevance.
     * @see {@link https://docs.discord.com/developers/resources/message#search-guild-messages-search-sort-modes}
     */
    sort_by?: MessageSearchSortMode;
    /**
     * The direction to sort (`asc` or `desc`)
     *
     * @defaultValue `'desc'`
     * @remarks Sort order is not respected when sorting by relevance.
     */
    sort_order?: 'asc' | 'desc';
    /**
     * Whether to include results from age-restricted channels
     *
     * @defaultValue `false`
     */
    include_nsfw?: boolean;
}
/**
 * @see {@link https://docs.discord.com/developers/resources/message#search-guild-messages-response-body}
 */
export type RESTGetAPIGuildMessagesSearchResult = APIMessageSearchIndexNotReadyResponse | APIMessageSearchResult;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-user-nick}
 * @deprecated Use {@link https://discord.com/developers/docs/resources/guild#modify-current-member | Modify Current Member} instead.
 */
export interface RESTPatchAPICurrentGuildMemberNicknameJSONBody {
    /**
     * Value to set users nickname to
     *
     * Requires `CHANGE_NICKNAME` permission
     */
    nick?: string | null | undefined;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-user-nick}
 * @deprecated Use {@link https://discord.com/developers/docs/resources/guild#modify-current-member | Modify Current Member} instead.
 */
export type RESTPatchAPICurrentGuildMemberNicknameResult = _StrictRequired<RESTPatchAPICurrentGuildMemberNicknameJSONBody>;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-member}
 */
export interface RESTPatchAPICurrentGuildMemberJSONBody {
    /**
     * Value to set users nickname to
     *
     * Requires `CHANGE_NICKNAME` permission
     */
    nick?: string | null | undefined;
    /**
     * Data URI base64 encoded banner image
     */
    banner?: string | null | undefined;
    /**
     * Data URI base64 encoded avatar image
     */
    avatar?: string | null | undefined;
    /**
     * Guild member bio
     */
    bio?: string | null | undefined;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-member}
 */
export type RESTPatchAPICurrentGuildMemberResult = APIGuildMember;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-role}
 */
export type RESTPutAPIGuildMemberRoleResult = undefined;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-member-role}
 */
export type RESTDeleteAPIGuildMemberRoleResult = undefined;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-member}
 */
export type RESTDeleteAPIGuildMemberResult = undefined;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans}
 */
export type RESTGetAPIGuildBansResult = APIBan[];
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans}
 */
export interface RESTGetAPIGuildBansQuery {
    /**
     * Consider only users before given user id
     */
    before?: Snowflake;
    /**
     * Consider only users after given user id
     */
    after?: Snowflake;
    /**
     * Number of users to return (1-1000)
     *
     * @defaultValue `1000`
     */
    limit?: number;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-ban}
 */
export type RESTGetAPIGuildBanResult = APIBan;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban}
 */
export interface RESTPutAPIGuildBanJSONBody {
    /**
     * Number of days to delete messages for (0-7)
     *
     * @deprecated Use {@link RESTPutAPIGuildBanJSONBody.delete_message_seconds} instead
     */
    delete_message_days?: number | undefined;
    /**
     * Number of seconds to delete messages for, between 0 and 604800 (7 days)
     */
    delete_message_seconds?: number | undefined;
    /**
     * Reason for the ban
     *
     * @deprecated Removed in API v10, use the `X-Audit-Log-Reason` header instead.
     */
    reason?: string | undefined;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban}
 */
export type RESTPutAPIGuildBanResult = undefined;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-ban}
 */
export type RESTDeleteAPIGuildBanResult = undefined;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban}
 */
export interface RESTPostAPIGuildBulkBanJSONBody {
    /**
     * List of user ids to ban (max 200)
     */
    user_ids: Snowflake[];
    /**
     * Number of seconds to delete messages for, between 0 and 604800 (7 days)
     */
    delete_message_seconds?: number | undefined;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban}
 */
export interface RESTPostAPIGuildBulkBanResult {
    /**
     * List of user ids, that were successfully banned
     */
    banned_users: Snowflake[];
    /**
     * List of user ids, that were not banned
     */
    failed_users: Snowflake[];
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-roles}
 */
export type RESTGetAPIGuildRolesResult = APIRole[];
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role}
 */
export interface RESTPostAPIGuildRoleJSONBody {
    /**
     * Name of the role
     *
     * @defaultValue `"new role"`
     */
    name?: string | null | undefined;
    /**
     * Bitwise value of the enabled/disabled permissions
     *
     * @defaultValue
     * Default role permissions in guild
     */
    permissions?: Permissions | null | undefined;
    /**
     * RGB color value
     *
     * @defaultValue `0`
     * @remarks `color` will still be returned by the API, but using the `colors` field is recommended when doing requests.
     */
    color?: number | null | undefined;
    /**
     * The role's colors
     *
     * @defaultValue `{ "primary_color": 0, "secondary_color": null, "tertiary_color": null }`
     */
    colors?: APIRoleColors | undefined;
    /**
     * Whether the role should be displayed separately in the sidebar
     *
     * @defaultValue `false`
     */
    hoist?: boolean | null | undefined;
    /**
     * The role's icon image (if the guild has the `ROLE_ICONS` feature)
     */
    icon?: string | null | undefined;
    /**
     * The role's unicode emoji as a standard emoji (if the guild has the `ROLE_ICONS` feature)
     */
    unicode_emoji?: string | null | undefined;
    /**
     * Whether the role should be mentionable
     *
     * @defaultValue `false`
     */
    mentionable?: boolean | null | undefined;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role}
 */
export type RESTPostAPIGuildRoleResult = APIRole;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions}
 */
export type RESTPatchAPIGuildRolePositionsJSONBody = {
    /**
     * Role id
     */
    id: Snowflake;
    /**
     * Sorting position of the role
     */
    position?: number | undefined;
}[];
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions}
 */
export type RESTPatchAPIGuildRolePositionsResult = APIRole[];
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role}
 */
export interface RESTPatchAPIGuildRoleJSONBody {
    /**
     * Name of the role
     */
    name?: string | null | undefined;
    /**
     * Bitwise value of the enabled/disabled permissions
     */
    permissions?: Permissions | null | undefined;
    /**
     * RGB color value
     *
     * @remarks `color` will still be returned by the API, but using the `colors` field is recommended when doing requests.
     */
    color?: number | null | undefined;
    /**
     * The role's colors
     */
    colors?: APIRoleColors | undefined;
    /**
     * Whether the role should be displayed separately in the sidebar
     */
    hoist?: boolean | null | undefined;
    /**
     * The role's icon image (if the guild has the `ROLE_ICONS` feature)
     */
    icon?: string | null | undefined;
    /**
     * The role's unicode emoji as a standard emoji (if the guild has the `ROLE_ICONS` feature)
     */
    unicode_emoji?: string | null | undefined;
    /**
     * Whether the role should be mentionable
     */
    mentionable?: boolean | null | undefined;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-role}
 */
export type RESTGetAPIGuildRoleResult = APIRole;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role}
 */
export type RESTPatchAPIGuildRoleResult = APIRole;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-role}
 */
export type RESTDeleteAPIGuildRoleResult = undefined;
/**
 * A record mapping role IDs to the number of members that have that role.
 *
 * @remarks This does not include the `@everyone` role.
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-role-member-counts}
 */
export type RESTGetAPIGuildRoleMemberCountsResult = Record<Snowflake, number>;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count}
 */
export interface RESTGetAPIGuildPruneCountQuery {
    /**
     * Number of days to count prune for (1 or more)
     *
     * @defaultValue `7`
     */
    days?: number;
    /**
     * Role(s) to include
     *
     * While this is typed as a string, it represents an array of
     * role IDs delimited by commas
     *
     * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params}
     */
    include_roles?: string;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count}
 */
export interface RESTGetAPIGuildPruneCountResult {
    pruned: number;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune}
 */
export interface RESTPostAPIGuildPruneJSONBody {
    /**
     * Number of days to count prune for (1 or more)
     *
     * @defaultValue `7`
     */
    days?: number | undefined;
    /**
     * Whether `pruned` is returned, discouraged for large guilds
     *
     * @defaultValue `true`
     */
    compute_prune_count?: boolean | undefined;
    /**
     * Role(s) to include
     */
    include_roles?: Snowflake[] | undefined;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune}
 */
export interface RESTPostAPIGuildPruneResult {
    pruned: number | null;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-voice-regions}
 */
export type RESTGetAPIGuildVoiceRegionsResult = APIVoiceRegion[];
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-invites}
 */
export type RESTGetAPIGuildInvitesResult = APIExtendedInvite[];
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-integrations}
 */
export type RESTGetAPIGuildIntegrationsResult = APIGuildIntegration[];
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-integration}
 */
export type RESTDeleteAPIGuildIntegrationResult = undefined;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-settings}
 */
export type RESTGetAPIGuildWidgetSettingsResult = APIGuildWidgetSettings;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget}
 */
export type RESTPatchAPIGuildWidgetSettingsJSONBody = _StrictPartial<APIGuildWidgetSettings>;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget}
 */
export type RESTPatchAPIGuildWidgetSettingsResult = APIGuildWidgetSettings;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget}
 */
export type RESTGetAPIGuildWidgetJSONResult = APIGuildWidget;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-vanity-url}
 */
export interface RESTGetAPIGuildVanityUrlResult {
    code: string | null;
    uses: number;
}
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image}
 */
export interface RESTGetAPIGuildWidgetImageQuery {
    /**
     * Style of the widget image returned
     *
     * @defaultValue `"shield"`
     */
    style?: GuildWidgetStyle;
}
/**
 * Note: while the return type is `ArrayBuffer`, the expected result is
 * a buffer of sorts (depends if in browser or on node.js/deno).
 */
export type RESTGetAPIGuildWidgetImageResult = ArrayBuffer;
export type RESTGetAPIGuildMemberVerificationResult = APIGuildMembershipScreening;
/**
 * @unstable https://github.com/discord/discord-api-docs/pull/2547
 */
export interface RESTPatchAPIGuildMemberVerificationJSONBody {
    /**
     * Whether Membership Screening is enabled
     */
    enabled?: boolean | undefined;
    /**
     * Array of field objects serialized in a string
     */
    form_fields?: string | undefined;
    /**
     * The server description to show in the screening form
     */
    description?: string | null | undefined;
}
/**
 * @unstable https://github.com/discord/discord-api-docs/pull/2547
 */
export type RESTPatchAPIGuildMemberVerificationResult = APIGuildMembershipScreening;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen}
 */
export type RESTGetAPIGuildWelcomeScreenResult = APIGuildWelcomeScreen;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen}
 */
export type RESTPatchAPIGuildWelcomeScreenJSONBody = _Nullable<_StrictPartial<APIGuildWelcomeScreen>> & {
    /**
     * Whether the welcome screen is enabled
     */
    enabled?: boolean | null | undefined;
};
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen}
 */
export type RESTPatchAPIGuildWelcomeScreenResult = APIGuildWelcomeScreen;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-onboarding}
 */
export type RESTGetAPIGuildOnboardingResult = APIGuildOnboarding;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
 */
export type RESTPutAPIGuildOnboardingJSONBody = _AddUndefinedToPossiblyUndefinedPropertiesOfInterface<Partial<Pick<APIGuildOnboarding, 'default_channel_ids' | 'enabled' | 'mode'>>> & {
    /**
     * Prompts shown during onboarding and in customize community
     */
    prompts?: RESTAPIGuildOnboardingPrompt[] | undefined;
};
export interface RESTAPIGuildOnboardingPrompt extends _AddUndefinedToPossiblyUndefinedPropertiesOfInterface<Partial<Omit<APIGuildOnboardingPrompt, 'guild_id' | 'id' | 'options' | 'title'>>>, Pick<APIGuildOnboardingPrompt, 'id' | 'title'> {
    /**
     * Options available within the prompt
     */
    options: RESTAPIGuildOnboardingPromptOption[];
}
/**
 * @deprecated Use {@link RESTAPIGuildOnboardingPrompt} instead.
 */
export type RESTAPIModifyGuildOnboardingPromptData = RESTAPIGuildOnboardingPrompt;
export interface RESTAPIGuildOnboardingPromptOption extends _AddUndefinedToPossiblyUndefinedPropertiesOfInterface<Partial<Omit<APIGuildOnboardingPromptOption, 'emoji' | 'guild_id' | 'title'>>>, Pick<APIGuildOnboardingPromptOption, 'title'> {
    /**
     * Emoji id
     */
    emoji_id?: Snowflake | null | undefined;
    /**
     * Emoji name
     */
    emoji_name?: string | null | undefined;
    /**
     * Whether this emoji is animated
     */
    emoji_animated?: boolean | null | undefined;
}
/**
 * @deprecated Use {@link RESTAPIGuildOnboardingPromptOption} instead.
 */
export type RESTAPIModifyGuildOnboardingPromptOptionData = RESTAPIGuildOnboardingPromptOption;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
 */
export type RESTPutAPIGuildOnboardingResult = APIGuildOnboarding;
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-incidents-actions}
 */
export interface RESTPutAPIGuildIncidentActionsJSONBody {
    /**
     * When invites will be enabled again
     */
    invites_disabled_until?: string | null | undefined;
    /**
     * When direct messages will be enabled again
     */
    dms_disabled_until?: string | null | undefined;
}
export type RESTPutAPIGuildIncidentActionsResult = APIIncidentsData;
//# sourceMappingURL=guild.d.ts.map