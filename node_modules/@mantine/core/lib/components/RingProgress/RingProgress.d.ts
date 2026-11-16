import { BoxProps, ElementProps, Factory, MantineColor, StylesApiProps } from '../../core';
interface RingProgressSection extends React.ComponentPropsWithRef<'circle'> {
    value: number;
    color: MantineColor;
    tooltip?: React.ReactNode;
}
export type RingProgressStylesNames = 'root' | 'svg' | 'label' | 'curve';
export type RingProgressCssVariables = {
    root: '--rp-size' | '--rp-label-offset' | '--rp-transition-duration';
};
export interface RingProgressProps extends BoxProps, StylesApiProps<RingProgressFactory>, ElementProps<'div'> {
    /** Label displayed in the center of the ring */
    label?: React.ReactNode;
    /** Ring thickness @default 12 */
    thickness?: number;
    /** Width and height of the progress ring @default 120 */
    size?: number;
    /** Sets whether the edges of the progress circle are rounded */
    roundCaps?: boolean;
    /** Ring sections */
    sections: RingProgressSection[];
    /** Color of the root section, key of theme.colors or CSS color value */
    rootColor?: MantineColor;
    /** Transition duration of filled section styles changes in ms @default `0` */
    transitionDuration?: number;
}
export type RingProgressFactory = Factory<{
    props: RingProgressProps;
    ref: HTMLDivElement;
    stylesNames: RingProgressStylesNames;
    vars: RingProgressCssVariables;
}>;
export declare const RingProgress: import("../..").MantineComponent<{
    props: RingProgressProps;
    ref: HTMLDivElement;
    stylesNames: RingProgressStylesNames;
    vars: RingProgressCssVariables;
}>;
export {};
