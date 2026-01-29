import { BoxProps, CompoundStylesApiProps, ElementProps, Factory, MantineColor, MantineRadius } from '../../../core';
export type TimelineItemStylesNames = 'itemBody' | 'itemContent' | 'itemBullet' | 'item' | 'itemTitle';
export interface TimelineItemProps extends BoxProps, CompoundStylesApiProps<TimelineItemFactory>, ElementProps<'div', 'title'> {
    __active?: boolean;
    __lineActive?: boolean;
    __align?: 'right' | 'left';
    /** Item title, displayed next to the bullet */
    title?: React.ReactNode;
    /** Content displayed below the title */
    children?: React.ReactNode;
    /** React node that should be rendered inside the bullet – icon, image, avatar, etc. By default, large white dot is displayed. */
    bullet?: React.ReactNode;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius`, numbers are converted to rem @default `'xl'` */
    radius?: MantineRadius;
    /** Key of `theme.colors` or any valid CSS color to control active item colors @default `theme.primaryColor` */
    color?: MantineColor;
    /** Controls line border style @default `'solid'` */
    lineVariant?: 'solid' | 'dashed' | 'dotted';
}
export type TimelineItemFactory = Factory<{
    props: TimelineItemProps;
    ref: HTMLDivElement;
    stylesNames: TimelineItemStylesNames;
    compound: true;
}>;
export declare const TimelineItem: import("../../..").MantineComponent<{
    props: TimelineItemProps;
    ref: HTMLDivElement;
    stylesNames: TimelineItemStylesNames;
    compound: true;
}>;
