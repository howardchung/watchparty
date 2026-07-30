import type { InlineStylesMediaQuery } from '../../../InlineStyles';
import type { ParseStylePropsResult } from './parse-style-props';
export interface SortMediaQueriesResult extends Omit<ParseStylePropsResult, 'media'> {
    media: InlineStylesMediaQuery[];
}
export declare function sortMediaQueries({ media, ...props }: ParseStylePropsResult): SortMediaQueriesResult;
