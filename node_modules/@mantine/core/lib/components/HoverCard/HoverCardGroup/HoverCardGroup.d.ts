import { ExtendComponent, Factory, MantineThemeComponent } from '../../../core';
export interface HoverCardGroupProps {
    /** `HoverCard` components */
    children: React.ReactNode;
    /** Open delay in ms */
    openDelay?: number;
    /** Close delay in ms */
    closeDelay?: number;
}
export declare function HoverCardGroup(props: HoverCardGroupProps): import("react/jsx-runtime").JSX.Element;
export declare namespace HoverCardGroup {
    var displayName: string;
    var extend: (c: ExtendComponent<HoverCardGroupFactory>) => MantineThemeComponent;
}
export type HoverCardGroupFactory = Factory<{
    props: HoverCardGroupProps;
}>;
