import { BoxProps, ElementProps, Factory, MantineColor, MantineSize, StylesApiProps } from '../../core';
export type DividerStylesNames = 'root' | 'label';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerCssVariables = {
    root: '--divider-color' | '--divider-border-style' | '--divider-size';
};
export interface DividerProps extends BoxProps, StylesApiProps<DividerFactory>, ElementProps<'div'> {
    /** Key of `theme.colors` or any valid CSS color value, by default value depends on color scheme */
    color?: MantineColor;
    /** Controls width/height (depends on orientation) @default `'xs'` */
    size?: MantineSize | number | (string & {});
    /** Divider label, visible only when `orientation` is `horizontal` */
    label?: React.ReactNode;
    /** Controls label position @default `'center'` */
    labelPosition?: 'left' | 'center' | 'right';
    /** Controls orientation @default `'horizontal'` */
    orientation?: 'horizontal' | 'vertical';
}
export type DividerFactory = Factory<{
    props: DividerProps;
    ref: HTMLDivElement;
    stylesNames: DividerStylesNames;
    vars: DividerCssVariables;
    variant: DividerVariant;
}>;
export declare const Divider: import("../..").MantineComponent<{
    props: DividerProps;
    ref: HTMLDivElement;
    stylesNames: DividerStylesNames;
    vars: DividerCssVariables;
    variant: DividerVariant;
}>;
