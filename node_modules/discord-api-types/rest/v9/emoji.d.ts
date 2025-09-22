import type { Snowflake } from '../../globals';
import type { APIEmoji } from '../../payloads/v9/index';
/**
 * https://discord.com/developers/docs/resources/emoji#list-guild-emojis
 */
export type RESTGetAPIGuildEmojisResult = APIEmoji[];
/**
 * https://discord.com/developers/docs/resources/emoji#get-guild-emoji
 */
export type RESTGetAPIGuildEmojiResult = APIEmoji;
/**
 * https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params
 */
export interface RESTPostAPIGuildEmojiJSONBody {
    /**
     * Name of the emoji
     */
    name: string;
    /**
     * The 128x128 emoji image
     *
     * https://discord.com/developers/docs/reference#image-data
     */
    image: string;
    /**
     * Roles for which this emoji will be whitelisted
     */
    roles?: Snowflake[] | undefined;
}
/**
 * https://discord.com/developers/docs/resources/emoji#create-guild-emoji
 */
export type RESTPostAPIGuildEmojiResult = APIEmoji;
/**
 * https://discord.com/developers/docs/resources/emoji#modify-guild-emoji
 */
export interface RESTPatchAPIGuildEmojiJSONBody {
    /**
     * Name of the emoji
     */
    name?: string | undefined;
    /**
     * Roles for which this emoji will be whitelisted
     */
    roles?: Snowflake[] | null | undefined;
}
/**
 * https://discord.com/developers/docs/resources/emoji#modify-guild-emoji
 */
export type RESTPatchAPIGuildEmojiResult = APIEmoji;
/**
 * https://discord.com/developers/docs/resources/emoji#delete-guild-emoji
 */
export type RESTDeleteAPIGuildEmojiResult = never;
/**
 * https://discord.com/developers/docs/resources/emoji#list-application-emojis
 */
export interface RESTGetAPIApplicationEmojisResult {
    items: APIEmoji[];
}
/**
 * https://discord.com/developers/docs/resources/emoji#get-application-emoji
 */
export type RESTGetAPIApplicationEmojiResult = APIEmoji;
/**
 * https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params
 */
export type RESTPostAPIApplicationEmojiJSONBody = Pick<RESTPostAPIGuildEmojiJSONBody, 'image' | 'name'>;
/**
 * https://discord.com/developers/docs/resources/emoji#create-application-emoji
 */
export type RESTPostAPIApplicationEmojiResult = APIEmoji;
/**
 * https://discord.com/developers/docs/resources/emoji#modify-application-emoji
 */
export type RESTPatchAPIApplicationEmojiJSONBody = Pick<RESTPatchAPIGuildEmojiJSONBody, 'name'>;
/**
 * https://discord.com/developers/docs/resources/emoji#modify-application-emoji
 */
export type RESTPatchAPIApplicationEmojiResult = APIEmoji;
/**
 * https://discord.com/developers/docs/resources/emoji#delete-application-emoji
 */
export type RESTDeleteAPIApplicationEmojiResult = never;
//# sourceMappingURL=emoji.d.ts.map