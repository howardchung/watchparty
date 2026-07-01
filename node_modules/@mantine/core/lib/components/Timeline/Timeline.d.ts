import { BoxProps, ElementProps, Factory, MantineColor, MantineRadius, StylesApiProps } from '../../core';
import { TimelineItem, TimelineItemStylesNames } from './TimelineItem/TimelineItem';
export type TimelineStylesNames = 'root' | TimelineItemStylesNames;
export type TimelineCssVariables = {
    root: '--tl-line-width' | '--tl-bullet-size' | '--tl-color' | '--tl-icon-color' | '--tl-radius';
};
export interface TimelineProps extends BoxProps, StylesApiProps<TimelineFactory>, ElementProps<'div'> {
    /** `Timeline.Item` components */
    children?: React.ReactNode;
    /** Index of the active element */
    active?: number;
    /** Key of `theme.colors` or any valid CSS color to control active item colors @default `theme.primaryColor` */
    color?: MantineColor;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius`, numbers are converted to rem @default `'xl'` */
    radius?: MantineRadius;
    /** Size of the bullet @default `20` */
    bulletSize?: number | string;
    /** Position of content relative to the bullet @default `'left'` */
    align?: 'right' | 'left';
    /** Control width of the line */
    lineWidth?: number | string;
    /** If set, the active items direction is reversed without reversing items order @default `false` */
    reverseActive?: boolean;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
}
export type TimelineFactory = Factory<{
    props: TimelineProps;
    ref: HTMLDivElement;
    stylesNames: TimelineStylesNames;
    vars: TimelineCssVariables;
    staticComponents: {
        Item: typeof TimelineItem;
    };
}>;
export declare const Timeline: import("../..").MantineComponent<{
    props: TimelineProps;
    ref: HTMLDivElement;
    stylesNames: TimelineStylesNames;
    vars: TimelineCssVariables;
    staticComponents: {
        Item: typeof TimelineItem;
    };
}>;
