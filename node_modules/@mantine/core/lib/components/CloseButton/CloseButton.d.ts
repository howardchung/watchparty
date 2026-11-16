import { BoxProps, MantineRadius, MantineSize, PolymorphicFactory, StylesApiProps } from '../../core';
export type CloseButtonVariant = 'subtle' | 'transparent';
export type CloseButtonStylesNames = 'root';
export type CloseButtonCssVariables = {
    root: '--cb-icon-size' | '--cb-size' | '--cb-radius';
};
export interface __CloseButtonProps {
    'data-disabled'?: boolean;
    /** Controls width and height of the button. Numbers are converted to rem. @default `'md'` */
    size?: MantineSize | (string & {}) | number;
    /** Key of `theme.radius` or any valid CSS value to set border-radius. Numbers are converted to rem. @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Sets `disabled` attribute, assigns disabled styles */
    disabled?: boolean;
    /** `X` icon `width` and `height` @default `80%` */
    iconSize?: number | string;
    /** Content rendered inside the button. For example `VisuallyHidden` with label for screen readers. */
    children?: React.ReactNode;
    /** React node to replace the default close icon. If set, `iconSize` prop is ignored. */
    icon?: React.ReactNode;
}
export interface CloseButtonProps extends __CloseButtonProps, BoxProps, StylesApiProps<CloseButtonFactory> {
    __staticSelector?: string;
}
export type CloseButtonFactory = PolymorphicFactory<{
    props: CloseButtonProps;
    defaultComponent: 'button';
    defaultRef: HTMLButtonElement;
    stylesNames: CloseButtonStylesNames;
    variant: CloseButtonVariant;
    vars: CloseButtonCssVariables;
}>;
export declare const CloseButton: (<C = "button">(props: import("../..").PolymorphicComponentProps<C, CloseButtonProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(CloseButtonProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof CloseButtonProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (CloseButtonProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: CloseButtonProps;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
    stylesNames: CloseButtonStylesNames;
    variant: CloseButtonVariant;
    vars: CloseButtonCssVariables;
}> & import("../../core/factory/factory").ComponentClasses<{
    props: CloseButtonProps;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
    stylesNames: CloseButtonStylesNames;
    variant: CloseButtonVariant;
    vars: CloseButtonCssVariables;
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: CloseButtonProps;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
    stylesNames: CloseButtonStylesNames;
    variant: CloseButtonVariant;
    vars: CloseButtonCssVariables;
}> & Record<string, never>;
