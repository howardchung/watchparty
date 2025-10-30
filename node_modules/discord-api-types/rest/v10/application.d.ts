import type { APIApplication, APIApplicationRoleConnectionMetadata } from '../../payloads/v10/application';
import type { Nullable, StrictPartial } from '../../utils/internals';
/**
 * https://discord.com/developers/docs/resources/application-role-connection-metadata#get-application-role-connection-metadata-records
 */
export type RESTGetAPIApplicationRoleConnectionMetadataResult = APIApplicationRoleConnectionMetadata[];
/**
 * https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records
 */
export type RESTPutAPIApplicationRoleConnectionMetadataJSONBody = APIApplicationRoleConnectionMetadata[];
/**
 * https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records
 */
export type RESTPutAPIApplicationRoleConnectionMetadataResult = APIApplicationRoleConnectionMetadata[];
/**
 * https://discord.com/developers/docs/resources/application#get-current-application
 */
export type RESTGetCurrentApplicationResult = APIApplication;
/**
 * https://discord.com/developers/docs/resources/application#edit-current-application
 */
export type RESTPatchCurrentApplicationJSONBody = StrictPartial<Nullable<Pick<APIApplication, 'cover_image' | 'icon'>> & Pick<APIApplication, 'custom_install_url' | 'description' | 'flags' | 'install_params' | 'integration_types_config' | 'interactions_endpoint_url' | 'role_connections_verification_url' | 'tags'>>;
/**
 * https://discord.com/developers/docs/resources/application#edit-current-application
 */
export type RESTPatchCurrentApplicationResult = APIApplication;
//# sourceMappingURL=application.d.ts.map