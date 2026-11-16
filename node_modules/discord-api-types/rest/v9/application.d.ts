import type { APIActivityInstance, APIApplication, APIApplicationRoleConnectionMetadata } from '../../payloads/v9/application';
import type { _StrictPartial, _Nullable } from '../../utils/internals';
/**
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#get-application-role-connection-metadata-records}
 */
export type RESTGetAPIApplicationRoleConnectionMetadataResult = APIApplicationRoleConnectionMetadata[];
/**
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records}
 */
export type RESTPutAPIApplicationRoleConnectionMetadataJSONBody = APIApplicationRoleConnectionMetadata[];
/**
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records}
 */
export type RESTPutAPIApplicationRoleConnectionMetadataResult = APIApplicationRoleConnectionMetadata[];
/**
 * @see {@link https://discord.com/developers/docs/resources/application#get-current-application}
 */
export type RESTGetCurrentApplicationResult = APIApplication;
/**
 * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
 */
export type RESTPatchCurrentApplicationJSONBody = _StrictPartial<_Nullable<Pick<APIApplication, 'cover_image' | 'event_webhooks_url' | 'icon'>> & Pick<APIApplication, 'custom_install_url' | 'description' | 'event_webhooks_status' | 'event_webhooks_types' | 'flags' | 'install_params' | 'integration_types_config' | 'interactions_endpoint_url' | 'role_connections_verification_url' | 'tags'>>;
/**
 * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
 */
export type RESTPatchCurrentApplicationResult = APIApplication;
/**
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance}
 */
export type RESTGetAPIApplicationActivityInstanceResult = APIActivityInstance;
//# sourceMappingURL=application.d.ts.map