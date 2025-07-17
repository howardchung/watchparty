/**
 * Types extracted from https://discord.com/developers/docs/resources/poll
 */
import type { APIPartialEmoji } from './emoji';
/**
 * https://discord.com/developers/docs/resources/poll#poll-object-poll-object-structure
 */
export interface APIPoll {
    /**
     * The question of the poll
     */
    question: APIPollMedia;
    /**
     * Each of the answers available in the poll, up to 10
     */
    answers: APIPollAnswer[];
    /**
     * The time when the poll ends (IS08601 timestamp)
     */
    expiry: string;
    /**
     * Whether a user can select multiple answers
     *
     * @default false
     */
    allow_multiselect: boolean;
    /**
     * The layout type of the poll
     *
     * @default PollLayoutType.Default
     */
    layout_type: PollLayoutType;
    /**
     * The results of the poll
     */
    results?: APIPollResults;
}
/**
 * https://discord.com/developers/docs/resources/poll#layout-type
 */
export declare enum PollLayoutType {
    /**
     * The, uhm, default layout type
     */
    Default = 1
}
/**
 * https://discord.com/developers/docs/resources/poll#poll-media-object-poll-media-object-structure
 */
export interface APIPollMedia {
    /**
     * The text of the field
     *
     * The maximum length is `300` for the question, and `55` for any answer
     */
    text?: string;
    /**
     * The emoji of the field
     */
    emoji?: APIPartialEmoji;
}
/**
 * https://discord.com/developers/docs/resources/poll#poll-answer-object-poll-answer-object-structure
 */
export interface APIPollAnswer {
    /**
     * The ID of the answer. Starts at `1` for the first answer and goes up sequentially
     */
    answer_id: number;
    /**
     * The data of the answer
     */
    poll_media: APIPollMedia;
}
/**
 * https://discord.com/developers/docs/resources/poll#poll-results-object-poll-results-object-structure
 */
export interface APIPollResults {
    /**
     * Whether the votes have been precisely counted
     */
    is_finalized: boolean;
    /**
     * The counts for each answer
     */
    answer_counts: APIPollAnswerCount[];
}
/**
 * https://discord.com/developers/docs/resources/poll#poll-results-object-poll-answer-count-object-structure
 */
export interface APIPollAnswerCount {
    /**
     * The `answer_id`
     */
    id: number;
    /**
     * The number of votes for this answer
     */
    count: number;
    /**
     * Whether the current user voted for this answer
     */
    me_voted: boolean;
}
//# sourceMappingURL=poll.d.ts.map