import { Factory } from '../../core';
import { PortalProps } from './Portal';
export interface OptionalPortalProps extends PortalProps {
    /** Determines whether children should be rendered inside `<Portal />` */
    withinPortal?: boolean;
}
export type OptionalPortalFactory = Factory<{
    props: OptionalPortalProps;
    ref: HTMLDivElement;
}>;
export declare const OptionalPortal: import("../..").MantineComponent<{
    props: OptionalPortalProps;
    ref: HTMLDivElement;
}>;
