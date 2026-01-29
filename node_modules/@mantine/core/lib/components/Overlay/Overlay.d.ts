import { BoxProps, MantineRadius, PolymorphicFactory, StylesApiProps } from '../../core';
export type OverlayStylesNames = 'root';
export type OverlayCssVariables = {
    root: '--overlay-bg' | '--overlay-filter' | '--overlay-radius' | '--overlay-z-index';
};
export interface OverlayProps extends BoxProps, StylesApiProps<OverlayFactory> {
    /** Overlay `background-color` opacity 0–1, ignored when `gradient` prop is set @default `0.6` */
    backgroundOpacity?: number;
    /** Overlay `background-color` @default `#000` */
    color?: React.CSSProperties['backgroundColor'];
    /** Overlay background blur @default `0` */
    blur?: number | string;
    /** Changes overlay to gradient. If set, `color` prop is ignored. */
    gradient?: string;
    /** Overlay z-index @default `200` */
    zIndex?: string | number;
    /** Key of `theme.radius` or any valid CSS value to set border-radius @default `0` */
    radius?: MantineRadius;
    /** Content inside overlay */
    children?: React.ReactNode;
    /** Centers content inside the overlay @default `false` */
    center?: boolean;
    /** Changes position to `fixed` @default `false` */
    fixed?: boolean;
}
export type OverlayFactory = PolymorphicFactory<{
    props: OverlayProps;
    defaultRef: HTMLDivElement;
    defaultComponent: 'div';
    stylesNames: OverlayStylesNames;
    vars: OverlayCssVariables;
}>;
export declare const Overlay: (<C = "div">(props: import("../..").PolymorphicComponentProps<C, OverlayProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(OverlayProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof OverlayProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (OverlayProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: OverlayProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: OverlayStylesNames;
    vars: OverlayCssVariables;
}> & import("../../core/factory/factory").ComponentClasses<{
    props: OverlayProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: OverlayStylesNames;
    vars: OverlayCssVariables;
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: OverlayProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: OverlayStylesNames;
    vars: OverlayCssVariables;
}> & Record<string, never>;
