import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
import { LoaderProps } from '../Loader';
import { OverlayProps } from '../Overlay';
import { TransitionOverride } from '../Transition';
export type LoadingOverlayStylesNames = 'root' | 'loader' | 'overlay';
export type LoadingOverlayCssVariables = {
    root: '--lo-z-index';
};
export interface LoadingOverlayProps extends BoxProps, StylesApiProps<LoadingOverlayFactory>, ElementProps<'div'> {
    /** Props passed down to `Transition` component @default `{ transition: 'fade', duration: 0 }` */
    transitionProps?: TransitionOverride;
    /** Props passed down to `Loader` component */
    loaderProps?: LoaderProps;
    /** Props passed down to `Overlay` component */
    overlayProps?: OverlayProps;
    /** Determines whether the overlay should be visible @default `false` */
    visible?: boolean;
    /** Controls overlay `z-index` @default `400` */
    zIndex?: string | number;
}
export type LoadingOverlayFactory = Factory<{
    props: LoadingOverlayProps;
    ref: HTMLDivElement;
    stylesNames: LoadingOverlayStylesNames;
    vars: LoadingOverlayCssVariables;
}>;
export declare const LoadingOverlay: import("../..").MantineComponent<{
    props: LoadingOverlayProps;
    ref: HTMLDivElement;
    stylesNames: LoadingOverlayStylesNames;
    vars: LoadingOverlayCssVariables;
}>;
