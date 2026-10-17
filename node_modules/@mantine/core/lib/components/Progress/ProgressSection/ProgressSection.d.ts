import { BoxProps, CompoundStylesApiProps, ElementProps, Factory, MantineColor } from '../../../core';
export type ProgressSectionStylesNames = 'section';
export interface ProgressSectionProps extends BoxProps, CompoundStylesApiProps<ProgressSectionFactory>, ElementProps<'div'> {
    /** Value of the section in 0–100 range */
    value: number;
    /** Determines whether `aria-*` props should be added to the root element @default `true` */
    withAria?: boolean;
    /** Key of `theme.colors` or any valid CSS value @default `theme.primaryColor` */
    color?: MantineColor;
    /** If set, the section has stripes @default `false` */
    striped?: boolean;
    /** If set, the sections stripes are animated, `striped` prop is ignored @default `false` */
    animated?: boolean;
}
export type ProgressSectionFactory = Factory<{
    props: ProgressSectionProps;
    ref: HTMLDivElement;
    stylesNames: ProgressSectionStylesNames;
    compound: true;
}>;
export declare const ProgressSection: import("../../..").MantineComponent<{
    props: ProgressSectionProps;
    ref: HTMLDivElement;
    stylesNames: ProgressSectionStylesNames;
    compound: true;
}>;
