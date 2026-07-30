import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type TabsListStylesNames = 'list';
export interface TabsListProps extends BoxProps, CompoundStylesApiProps<TabsListFactory>, ElementProps<'div'> {
    /** `Tabs.Tab` components */
    children: React.ReactNode;
    /** Determines whether tabs should take all available space @default `false` */
    grow?: boolean;
    /** Tabs alignment @default `flex-start` */
    justify?: React.CSSProperties['justifyContent'];
}
export type TabsListFactory = Factory<{
    props: TabsListProps;
    ref: HTMLDivElement;
    stylesNames: TabsListStylesNames;
    compound: true;
}>;
export declare const TabsList: import("../../..").MantineComponent<{
    props: TabsListProps;
    ref: HTMLDivElement;
    stylesNames: TabsListStylesNames;
    compound: true;
}>;
