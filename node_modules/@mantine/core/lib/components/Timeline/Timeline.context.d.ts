import { GetStylesApi } from '../../core';
import type { TimelineFactory } from './Timeline';
interface TimelineContextValue {
    getStyles: GetStylesApi<TimelineFactory>;
}
export declare const TimelineProvider: ({ children, value }: {
    value: TimelineContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useTimelineContext: () => TimelineContextValue;
export {};
