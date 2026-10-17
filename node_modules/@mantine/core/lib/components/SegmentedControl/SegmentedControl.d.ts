import { BoxProps, ElementProps, Factory, MantineColor, MantineRadius, MantineSize, StylesApiProps } from '../../core';
export type SegmentedControlStylesNames = 'root' | 'input' | 'label' | 'control' | 'indicator' | 'innerLabel';
export type SegmentedControlCssVariables = {
    root: '--sc-radius' | '--sc-color' | '--sc-font-size' | '--sc-padding' | '--sc-shadow' | '--sc-transition-duration' | '--sc-transition-timing-function';
};
export interface SegmentedControlItem {
    value: string;
    label: React.ReactNode;
    disabled?: boolean;
}
export interface SegmentedControlProps extends BoxProps, StylesApiProps<SegmentedControlFactory>, ElementProps<'div', 'onChange'> {
    /** Data based on which controls are rendered */
    data: (string | SegmentedControlItem)[];
    /** Controlled component value */
    value?: string;
    /** Uncontrolled component default value */
    defaultValue?: string;
    /** Called when value changes */
    onChange?: (value: string) => void;
    /** Determines whether the component is disabled */
    disabled?: boolean;
    /** Name of the radio group, by default random name is generated */
    name?: string;
    /** Determines whether the component should take 100% width of its parent @default `false` */
    fullWidth?: boolean;
    /** Key of `theme.colors` or any valid CSS color, changes color of indicator, by default color is based on current color scheme */
    color?: MantineColor;
    /** Controls `font-size`, `padding` and `height` properties @default `'sm'` */
    size?: MantineSize | (string & {});
    /** Key of `theme.radius` or any valid CSS value to set `border-radius`, numbers are converted to rem @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Indicator `transition-duration` in ms, set `0` to turn off transitions @default `200` */
    transitionDuration?: number;
    /** Indicator `transition-timing-function` property @default `ease` */
    transitionTimingFunction?: string;
    /** Component orientation @default `'horizontal'` */
    orientation?: 'vertical' | 'horizontal';
    /** If set to `false`, prevents changing the value */
    readOnly?: boolean;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
    /** Determines whether there should be borders between items @default `true` */
    withItemsBorders?: boolean;
}
export type SegmentedControlFactory = Factory<{
    props: SegmentedControlProps;
    ref: HTMLDivElement;
    stylesNames: SegmentedControlStylesNames;
    vars: SegmentedControlCssVariables;
}>;
export declare const SegmentedControl: import("../..").MantineComponent<{
    props: SegmentedControlProps;
    ref: HTMLDivElement;
    stylesNames: SegmentedControlStylesNames;
    vars: SegmentedControlCssVariables;
}>;
