import type { Snowflake } from '../../globals';
import type { APIInvite } from '../../payloads/v9/index';
/**
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
 */
export interface RESTGetAPIInviteQuery {
    /**
     * Whether the invite should contain approximate member counts
     */
    with_counts?: boolean;
    /**
     * Whether the invite should contain the expiration date
     *
     * @deprecated The expiration date is always returned, regardless of this query parameter.
     * @see {@link https://github.com/discord/discord-api-docs/pull/7424}
     */
    with_expiration?: boolean;
    /**
     * The guild scheduled event to include with the invite
     */
    guild_scheduled_event_id?: Snowflake;
}
export type RESTGetAPIInviteResult = APIInvite;
/**
 * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
 */
export type RESTDeleteAPIInviteResult = APIInvite;
/**
 * @see {@link https://docs.discord.com/developers/resources/invite#get-target-users}
 */
export type RESTGetAPIInviteTargetUsersResult = ArrayBuffer;
/**
 * @see {@link https://docs.discord.com/developers/resources/invite#update-target-users}
 */
export interface RESTPutAPIInviteTargetUsersFormDataBody {
    /**
     * A csv file with a single column of user IDs for all the users able to accept this invite
     */
    target_users_file: unknown;
}
/**
 * @see {@link https://docs.discord.com/developers/resources/invite#update-target-users}
 */
export type RESTPutAPIInviteTargetUsersResult = undefined;
/**
 * @see {@link https://docs.discord.com/developers/resources/invite#get-target-users-job-status}
 */
export interface RESTGetAPIInviteTargetUsersJobStatusResult {
    /**
     * The status of the job processing the target users.
     */
    status: InviteTargetUsersJobStatus;
    /**
     * The total number of users in the provided list.
     */
    total_users: number;
    /**
     * The number of users processed so far.
     */
    processed_users: number;
    /**
     * The timestamp when the job was created.
     */
    created_at: string | null;
    /**
     * The timestamp when the job was successfully completed.
     */
    completed_at: string | null;
    /**
     * The error message if the job failed.
     */
    error_message: string | null;
}
/**
 * @see {@link https://docs.discord.com/developers/resources/invite#get-target-users-job-status}
 */
export declare enum InviteTargetUsersJobStatus {
    /**
     * The default value.
     */
    Unspecified = 0,
    /**
     * The job is still being processed.
     */
    Processing = 1,
    /**
     * The job has been completed successfully.
     */
    Completed = 2,
    /**
     * The job has failed; see `error_message` field for more details.
     */
    Failed = 3
}
//# sourceMappingURL=invite.d.ts.map