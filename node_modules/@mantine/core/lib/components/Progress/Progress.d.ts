import { Factory, MantineColor, StylesApiProps } from '../../core';
import { ProgressLabel } from './ProgressLabel/ProgressLabel';
import { __ProgressRootProps, ProgressRoot, ProgressRootCssVariables, ProgressRootStylesNames } from './ProgressRoot/ProgressRoot';
import { ProgressSection } from './ProgressSection/ProgressSection';
export type ProgressStylesNames = ProgressRootStylesNames;
export interface ProgressProps extends __ProgressRootProps, StylesApiProps<ProgressFactory> {
    /** Value of the progress */
    value: number;
    /** Key of `theme.colors` or any valid CSS value @default `theme.primaryColor` */
    color?: MantineColor;
    /** If set, the section has stripes @default `false` */
    striped?: boolean;
    /** If set, the sections stripes are animated, `striped` prop is ignored @default `false` */
    animated?: boolean;
}
export type ProgressFactory = Factory<{
    props: ProgressProps;
    ref: HTMLDivElement;
    stylesNames: ProgressStylesNames;
    vars: ProgressRootCssVariables;
    staticComponents: {
        Section: typeof ProgressSection;
        Root: typeof ProgressRoot;
        Label: typeof ProgressLabel;
    };
}>;
export declare const Progress: import("../..").MantineComponent<{
    props: ProgressProps;
    ref: HTMLDivElement;
    stylesNames: ProgressStylesNames;
    vars: ProgressRootCssVariables;
    staticComponents: {
        Section: typeof ProgressSection;
        Root: typeof ProgressRoot;
        Label: typeof ProgressLabel;
    };
}>;
