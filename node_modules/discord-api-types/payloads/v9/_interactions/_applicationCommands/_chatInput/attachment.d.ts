import type { Snowflake } from '../../../../../globals';
import type { APIApplicationCommandOptionBase, APIInteractionDataOptionBase } from './base';
import type { ApplicationCommandOptionType } from './shared';
export type FileUploadType = 'audio' | 'image' | 'video' | `.${string}`;
export interface APIApplicationCommandAttachmentOption extends APIApplicationCommandOptionBase<ApplicationCommandOptionType.Attachment> {
    file_types?: FileUploadType[];
}
export type APIApplicationCommandInteractionDataAttachmentOption = APIInteractionDataOptionBase<ApplicationCommandOptionType.Attachment, Snowflake>;
//# sourceMappingURL=attachment.d.ts.map