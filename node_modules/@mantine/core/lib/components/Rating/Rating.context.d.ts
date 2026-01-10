import { GetStylesApi } from '../../core';
import type { RatingFactory } from './Rating';
interface RatingContextValue {
    getStyles: GetStylesApi<RatingFactory>;
}
export declare const RatingProvider: ({ children, value }: {
    value: RatingContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useRatingContext: () => RatingContextValue;
export {};
