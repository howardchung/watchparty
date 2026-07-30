import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type TabsPanelStylesNames = 'panel';
export interface TabsPanelProps extends BoxProps, CompoundStylesApiProps<TabsPanelFactory>, ElementProps<'div'> {
    /** Panel content */
    children: React.ReactNode;
    /** If set, the content is kept mounted, even if `keepMounted` is set `false` in the parent `Tabs` component */
    keepMounted?: boolean;
    /** Value of associated control */
    value: string;
}
export type TabsPanelFactory = Factory<{
    props: TabsPanelProps;
    ref: HTMLDivElement;
    stylesNames: TabsPanelStylesNames;
    compound: true;
}>;
export declare const TabsPanel: import("../../..").MantineComponent<{
    props: TabsPanelProps;
    ref: HTMLDivElement;
    stylesNames: TabsPanelStylesNames;
    compound: true;
}>;
