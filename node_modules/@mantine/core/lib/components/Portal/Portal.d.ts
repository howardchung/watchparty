import { Factory } from '../../core';
export interface BasePortalProps extends React.ComponentPropsWithoutRef<'div'> {
    /** Element inside which portal should be created, by default a new div element is created and appended to the `document.body` */
    target?: HTMLElement | string;
    /** If set, all portals are rendered in the same DOM node @default `true` */
    reuseTargetNode?: boolean;
}
export interface PortalProps extends BasePortalProps {
    /** Portal children, for example, custom modal or popover */
    children: React.ReactNode;
}
export type PortalFactory = Factory<{
    props: PortalProps;
    ref: HTMLDivElement;
}>;
export declare const Portal: import("../..").MantineComponent<{
    props: PortalProps;
    ref: HTMLDivElement;
}>;
