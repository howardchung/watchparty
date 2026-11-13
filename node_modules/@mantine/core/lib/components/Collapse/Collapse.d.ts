import { BoxProps, Factory } from '../../core';
export interface CollapseProps extends BoxProps, Omit<React.ComponentPropsWithoutRef<'div'>, keyof BoxProps> {
    /** Opened state */
    in: boolean;
    /** Called each time transition ends */
    onTransitionEnd?: () => void;
    /** Transition duration in ms @default `200` */
    transitionDuration?: number;
    /** Transition timing function @default `ease` */
    transitionTimingFunction?: string;
    /** Determines whether opacity should be animated @default `true` */
    animateOpacity?: boolean;
    /** Keep element in DOM when collapsed, useful for nested collapses */
    keepMounted?: boolean;
}
export type CollapseFactory = Factory<{
    props: CollapseProps;
    ref: HTMLDivElement;
}>;
export declare const Collapse: import("../..").MantineComponent<{
    props: CollapseProps;
    ref: HTMLDivElement;
}>;
