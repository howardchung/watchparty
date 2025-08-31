import type { Snowflake } from '../../globals';
import type { APIMessage, APIPoll, APIPollAnswer, APIUser } from '../../v9';
/**
 * https://discord.com/developers/docs/resources/poll#get-answer-voters
 */
export interface RESTGetAPIPollAnswerVotersQuery {
    /**
     * Get users after this user ID
     */
    after?: Snowflake;
    /**
     * Max number of users to return (1-100)
     *
     * @default 25
     */
    limit?: number;
}
/**
 * https://discord.com/developers/docs/resources/poll#poll-create-request-object-poll-create-request-object-structure
 */
export interface RESTAPIPoll extends Omit<APIPoll, 'allow_multiselect' | 'answers' | 'expiry' | 'layout_type' | 'results'>, Partial<Pick<APIPoll, 'allow_multiselect' | 'layout_type'>> {
    /**
     * Each of the answers available in the poll, up to 10
     */
    answers: Omit<APIPollAnswer, 'answer_id'>[];
    /**
     * Number of hours the poll should be open for, up to 32 days
     *
     * @default 24
     */
    duration?: number;
}
/**
 * @deprecated Use {@link RESTAPIPoll} instead
 */
export type RESTAPIPollCreate = RESTAPIPoll;
/**
 * https://discord.com/developers/docs/resources/poll#get-answer-voters
 */
export interface RESTGetAPIPollAnswerVotersResult {
    /**
     * Users who voted for this answer
     */
    users: APIUser[];
}
/**
 * https://discord.com/developers/docs/resources/poll#expire-poll
 */
export type RESTPostAPIPollExpireResult = APIMessage;
//# sourceMappingURL=poll.d.ts.map