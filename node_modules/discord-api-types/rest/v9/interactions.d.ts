import type { Snowflake } from '../../globals';
import type { APIApplicationCommand, APIApplicationCommandPermission, APIGuildApplicationCommandPermissions, APIInteractionResponse, APIInteractionResponseCallbackData, ApplicationCommandType, InteractionResponseType, APIMessage, InteractionType } from '../../payloads/v9/index';
import type { AddUndefinedToPossiblyUndefinedPropertiesOfInterface, NonNullableFields, StrictPartial } from '../../utils/internals';
import type { RESTDeleteAPIWebhookWithTokenMessageResult, RESTGetAPIWebhookWithTokenMessageResult, RESTPatchAPIWebhookWithTokenMessageFormDataBody, RESTPatchAPIWebhookWithTokenMessageJSONBody, RESTPatchAPIWebhookWithTokenMessageResult, RESTPostAPIWebhookWithTokenWaitResult } from './webhook';
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands
 */
export interface RESTGetAPIApplicationCommandsQuery {
    /**
     * Whether to include full localization dictionaries (name_localizations and description_localizations)
     * in the returned objects, instead of the name_localized and description_localized fields.
     *
     * @default false
     */
    with_localizations?: boolean;
}
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands
 */
export type RESTGetAPIApplicationCommandsResult = APIApplicationCommand[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-global-application-command
 */
export type RESTGetAPIApplicationCommandResult = APIApplicationCommand;
type RESTPostAPIBaseApplicationCommandsJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<Omit<APIApplicationCommand, 'application_id' | 'contexts' | 'default_member_permissions' | 'description_localized' | 'description' | 'guild_id' | 'id' | 'integration_types' | 'name_localized' | 'type' | 'version'> & Partial<NonNullableFields<Pick<APIApplicationCommand, 'contexts'>> & Pick<APIApplicationCommand, 'default_member_permissions' | 'integration_types'>>>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 */
export interface RESTPostAPIChatInputApplicationCommandsJSONBody extends RESTPostAPIBaseApplicationCommandsJSONBody {
    type?: ApplicationCommandType.ChatInput | undefined;
    description: string;
}
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 */
export interface RESTPostAPIContextMenuApplicationCommandsJSONBody extends RESTPostAPIBaseApplicationCommandsJSONBody {
    type: ApplicationCommandType.Message | ApplicationCommandType.User;
}
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 */
export interface RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody extends RESTPostAPIBaseApplicationCommandsJSONBody {
    type: ApplicationCommandType.PrimaryEntryPoint;
}
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 */
export type RESTPostAPIApplicationCommandsJSONBody = RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody | RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 */
export type RESTPostAPIApplicationCommandsResult = APIApplicationCommand;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command
 */
export type RESTPatchAPIApplicationCommandJSONBody = StrictPartial<RESTPostAPIApplicationCommandsJSONBody>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command
 */
export type RESTPatchAPIApplicationCommandResult = APIApplicationCommand;
/**
 * https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
 */
export type RESTPutAPIApplicationCommandsJSONBody = RESTPostAPIApplicationCommandsJSONBody[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
 */
export type RESTPutAPIApplicationCommandsResult = APIApplicationCommand[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands
 */
export type RESTGetAPIApplicationGuildCommandsQuery = RESTGetAPIApplicationCommandsQuery;
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands
 */
export type RESTGetAPIApplicationGuildCommandsResult = Omit<APIApplicationCommand, 'dm_permission'>[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands
 */
export type RESTGetAPIApplicationGuildCommandResult = Omit<APIApplicationCommand, 'dm_permission'>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command
 */
export type RESTPostAPIApplicationGuildCommandsJSONBody = Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'dm_permission'> | Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, 'dm_permission'>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command
 */
export type RESTPostAPIApplicationGuildCommandsResult = Omit<APIApplicationCommand, 'dm_permission'>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command
 */
export type RESTPatchAPIApplicationGuildCommandJSONBody = StrictPartial<Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'dm_permission'> | Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, 'dm_permission'>>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command
 */
export type RESTPatchAPIApplicationGuildCommandResult = Omit<APIApplicationCommand, 'dm_permission'>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands
 */
export type RESTPutAPIApplicationGuildCommandsJSONBody = ((Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'dm_permission'> & Pick<Partial<APIApplicationCommand>, 'id'>) | (Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, 'dm_permission'> & Pick<Partial<APIApplicationCommand>, 'id'>))[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands
 */
export type RESTPutAPIApplicationGuildCommandsResult = Omit<APIApplicationCommand, 'dm_permission'>[];
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response
 */
export type RESTPostAPIInteractionCallbackJSONBody = APIInteractionResponse;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response
 */
export interface RESTPostAPIInteractionCallbackQuery {
    /**
     * Whether to include a interaction callback response as the response instead of a 204
     */
    with_response?: boolean;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response
 */
export type RESTPostAPIInteractionCallbackFormDataBody = (Record<`files[${bigint}]`, unknown> & {
    /**
     * JSON stringified message body
     */
    payload_json?: string | undefined;
}) | (Record<`files[${bigint}]`, unknown> & RESTPostAPIInteractionCallbackJSONBody);
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response
 */
export type RESTPostAPIInteractionCallbackResult = never;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-response-object
 */
export interface RESTPostAPIInteractionCallbackWithResponseResult {
    /**
     * The interaction object associated with the interaction
     */
    interaction: RESTAPIInteractionCallbackObject;
    /**
     * The resource that was created by the interaction response
     */
    resource?: RESTAPIInteractionCallbackResourceObject;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-object
 */
export interface RESTAPIInteractionCallbackObject {
    /**
     * ID of the interaction
     */
    id: Snowflake;
    /**
     * Interaction type
     */
    type: InteractionType;
    /**
     * Instance ID of the Activity if one was launched or joined
     */
    activity_instance_id?: string;
    /**
     * ID of the message that was created by the interaction
     */
    response_message_id?: Snowflake;
    /**
     * Whether or not the message is in a loading state
     */
    response_message_loading?: boolean;
    /**
     * Whether or not the response message was ephemeral
     */
    response_message_ephemeral?: boolean;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-resource-object
 */
export interface RESTAPIInteractionCallbackResourceObject {
    /**
     * Interaction callback type
     */
    type: InteractionResponseType;
    /**
     * Represents the Activity launched by this interaction
     *
     * @remarks
     * Only present if `type` is {@link InteractionResponseType.LaunchActivity}
     */
    activity_instance?: RESTAPIInteractionCallbackActivityInstanceResource;
    /**
     * Message created by the interaction
     *
     * @remarks
     * Only present if `type` is {@link InteractionResponseType.ChannelMessageWithSource}
     * or {@link InteractionResponseType.UpdateMessage}
     */
    message?: APIMessage;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-activity-instance-resource
 */
export interface RESTAPIInteractionCallbackActivityInstanceResource {
    /**
     * Instance ID of the Activity if one was launched or joined.
     */
    id: string;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#get-original-interaction-response
 */
export type RESTGetAPIInteractionOriginalResponseResult = RESTGetAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response
 */
export type RESTPatchAPIInteractionOriginalResponseJSONBody = RESTPatchAPIWebhookWithTokenMessageJSONBody;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response
 */
export type RESTPatchAPIInteractionOriginalResponseFormDataBody = RESTPatchAPIWebhookWithTokenMessageFormDataBody;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response
 */
export type RESTPatchAPIInteractionOriginalResponseResult = RESTPatchAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#delete-original-interaction-response
 */
export type RESTDeleteAPIInteractionOriginalResponseResult = RESTDeleteAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message
 */
export type RESTPostAPIInteractionFollowupJSONBody = APIInteractionResponseCallbackData;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message
 */
export type RESTPostAPIInteractionFollowupFormDataBody = (Record<`files[${bigint}]`, unknown> & {
    /**
     * JSON stringified message body
     */
    payload_json?: string | undefined;
}) | (Record<`files[${bigint}]`, unknown> & RESTPostAPIInteractionFollowupJSONBody);
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message
 */
export type RESTPostAPIInteractionFollowupResult = RESTPostAPIWebhookWithTokenWaitResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#get-followup-message
 */
export type RESTGetAPIInteractionFollowupResult = RESTGetAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message
 */
export type RESTPatchAPIInteractionFollowupJSONBody = RESTPatchAPIWebhookWithTokenMessageJSONBody;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message
 */
export type RESTPatchAPIInteractionFollowupFormDataBody = RESTPatchAPIWebhookWithTokenMessageFormDataBody;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message
 */
export type RESTPatchAPIInteractionFollowupResult = RESTPatchAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message
 */
export type RESTDeleteAPIInteractionFollowupResult = RESTDeleteAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command-permissions
 */
export type RESTGetAPIGuildApplicationCommandsPermissionsResult = APIGuildApplicationCommandPermissions[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-application-command-permissions
 */
export type RESTGetAPIApplicationCommandPermissionsResult = APIGuildApplicationCommandPermissions;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions
 */
export interface RESTPutAPIApplicationCommandPermissionsJSONBody {
    permissions: APIApplicationCommandPermission[];
}
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions
 */
export type RESTPutAPIApplicationCommandPermissionsResult = APIGuildApplicationCommandPermissions;
/**
 * https://discord.com/developers/docs/interactions/application-commands#batch-edit-application-command-permissions
 */
export type RESTPutAPIGuildApplicationCommandsPermissionsJSONBody = Pick<APIGuildApplicationCommandPermissions, 'id' | 'permissions'>[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#batch-edit-application-command-permissions
 */
export type RESTPutAPIGuildApplicationCommandsPermissionsResult = APIGuildApplicationCommandPermissions[];
export {};
//# sourceMappingURL=interactions.d.ts.map